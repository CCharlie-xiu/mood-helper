/**
 * 数据导出导入器 — 大学生心情记录助手
 * 提供心情数据的JSON导出和导入功能
 */

class DataExporter {
  /**
   * @param {StorageAdapter} storageAdapter - 存储适配器
   */
  constructor(storageAdapter) {
    this._storageAdapter = storageAdapter;
    this._validator = new DataValidator();
  }

  /**
   * 导出所有数据
   * 包含所有心情记录和用户设置
   * @returns {{success: boolean, data?: Object, error?: string, recordCount: number}}
   */
  exportAllData() {
    try {
      const records = this._storageAdapter.getAllRecords();
      const settings = this._storageAdapter.getSettings();

      if (records.length === 0) {
        return {
          success: false,
          error: '暂无数据可导出',
          recordCount: 0,
        };
      }

      return {
        success: true,
        data: {
          version: AppConstants.DATA_VERSION,
          records,
          settings,
          exportDate: new Date().toISOString(),
        },
        recordCount: records.length,
      };
    } catch (e) {
      return { success: false, error: `导出失败: ${e.message}`, recordCount: 0 };
    }
  }

  /**
   * 按日期范围导出
   * @param {string} start - 起始日期 (YYYY-MM-DD)
   * @param {string} end - 结束日期 (YYYY-MM-DD)
   * @returns {{success: boolean, data?: Object, error?: string, recordCount: number}}
   */
  exportByDateRange(start, end) {
    try {
      const records = this._storageAdapter.getRecordsByDateRange(start, end);

      if (records.length === 0) {
        return {
          success: false,
          error: '该日期范围内暂无数据',
          recordCount: 0,
        };
      }

      return {
        success: true,
        data: {
          version: AppConstants.DATA_VERSION,
          records,
          exportDate: new Date().toISOString(),
          dateRange: { start, end },
        },
        recordCount: records.length,
      };
    } catch (e) {
      return { success: false, error: `导出失败: ${e.message}`, recordCount: 0 };
    }
  }

  /**
   * 触发浏览器下载JSON文件
   * 创建临时链接触发浏览器下载
   * @param {Object} data - 要导出的数据
   * @param {string} filename - 文件名（不含扩展名时自动添加.json）
   */
  downloadAsJson(data, filename) {
    try {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      // 确保文件名以.json结尾
      const finalFilename = filename.endsWith('.json') ? filename : `${filename}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = finalFilename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      // 清理临时元素和URL
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (e) {
      console.error('[DataExporter] 下载失败:', e);
    }
  }

  /**
   * 从JSON文件导入数据
   * 读取文件内容、校验格式、合并记录
   * @param {File} file - JSON文件
   * @returns {Promise<{success: boolean, importedCount: number, skippedCount: number, error?: string}>}
   */
  async importFromJson(file) {
    try {
      // 读取文件内容
      const text = await file.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        return {
          success: false,
          importedCount: 0,
          skippedCount: 0,
          error: '导入失败，文件格式不正确',
        };
      }

      // 校验导入数据格式
      const validation = this.validateImportData(data);
      if (!validation.valid) {
        return {
          success: false,
          importedCount: 0,
          skippedCount: 0,
          error: validation.error || '文件格式不正确',
        };
      }

      // 合并记录
      const localRecords = this._storageAdapter.getAllRecords();
      const importRecords = data.records || [];
      const result = this.mergeRecords(localRecords, importRecords);

      // 保存合并后的记录
      const saveSuccess = this._storageAdapter.set(StorageKeys.RECORDS, JSON.stringify(result.merged));
      if (!saveSuccess) {
        return {
          success: false,
          importedCount: 0,
          skippedCount: 0,
          error: '导入失败，存储空间不足',
        };
      }

      // 如果导入数据包含设置，也合并设置
      if (data.settings && typeof data.settings === 'object') {
        const currentSettings = this._storageAdapter.getSettings();
        // 仅合并不存在的设置字段，保留本地优先
        const mergedSettings = { ...data.settings, ...currentSettings };
        this._storageAdapter.saveSettings(mergedSettings);
      }

      const importedCount = importRecords.length - result.skipped.length;
      return {
        success: true,
        importedCount,
        skippedCount: result.skipped.length,
      };
    } catch (e) {
      return {
        success: false,
        importedCount: 0,
        skippedCount: 0,
        error: '导入失败，文件格式不正确',
      };
    }
  }

  /**
   * 校验导入数据格式
   * @param {Object} data - 导入的数据
   * @returns {{valid: boolean, error?: string}} ValidationResult
   */
  validateImportData(data) {
    return this._validator.validateImportFormat(data);
  }

  /**
   * 合并记录
   * 重复recordId的记录跳过，保留本地记录
   * @param {Array} localRecords - 本地记录
   * @param {Array} importRecords - 导入记录
   * @returns {{merged: Array, skipped: Array}}
   */
  mergeRecords(localRecords, importRecords) {
    const localIds = new Set(localRecords.map(r => r.recordId));
    const skipped = [];
    const toAdd = [];

    importRecords.forEach(record => {
      if (localIds.has(record.recordId)) {
        // 重复记录，跳过
        skipped.push(record);
      } else {
        // 新记录，添加到合并列表
        toAdd.push(record);
        localIds.add(record.recordId); // 防止导入数据内部重复
      }
    });

    return {
      merged: [...localRecords, ...toAdd],
      skipped,
    };
  }

  /**
   * 生成导出文件名
   * 格式: mood-data-YYYY-MM-DD.json
   * @returns {string}
   */
  generateExportFilename() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `mood-data-${year}-${month}-${day}.json`;
  }
}

/* 将 DataExporter 挂载到全局 */
window.DataExporter = DataExporter;

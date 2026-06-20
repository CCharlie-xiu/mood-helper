/**
 * localStorage存储适配器 — 大学生心情记录助手
 * 提供对localStorage的封装操作，包含数据校验和异常处理
 */

class StorageAdapter {
  /**
   * @param {EventBus} eventBus - 全局事件总线
   */
  constructor(eventBus) {
    /** @type {EventBus} 全局事件总线 */
    this._eventBus = eventBus;
  }

  /* ------------------------------------------
   * 通用操作
   * ------------------------------------------ */

  /**
   * 读取数据
   * @param {string} key - 键名
   * @returns {string|null}
   */
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error(`[StorageAdapter] 读取失败 (${key}):`, e);
      return null;
    }
  }

  /**
   * 写入数据
   * @param {string} key - 键名
   * @param {string} value - 值
   * @returns {boolean} 是否写入成功
   */
  set(key, value) {
    try {
      localStorage.setItem(key, value);
      // 写入后验证读取一致性
      const readBack = localStorage.getItem(key);
      if (readBack !== value) {
        console.warn(`[StorageAdapter] 写入验证失败 (${key})`);
        return false;
      }
      return true;
    } catch (e) {
      console.error(`[StorageAdapter] 写入失败 (${key}):`, e);
      // 捕获 QuotaExceededError，发射存储异常事件
      this._eventBus.emit(AppEvents.STORAGE_ERROR, { error: e, key });
      return false;
    }
  }

  /**
   * 删除数据
   * @param {string} key - 键名
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`[StorageAdapter] 删除失败 (${key}):`, e);
    }
  }

  /**
   * 清除所有数据
   */
  clear() {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('[StorageAdapter] 清除失败:', e);
    }
  }

  /* ------------------------------------------
   * 心情记录操作
   * ------------------------------------------ */

  /**
   * 获取所有心情记录
   * @returns {Array<MoodRecord>}
   */
  getAllRecords() {
    const data = this.get(StorageKeys.RECORDS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('[StorageAdapter] 解析记录数据失败:', e);
      return [];
    }
  }

  /**
   * 按日期范围获取记录
   * @param {string} startDate - 起始日期 (YYYY-MM-DD)
   * @param {string} endDate - 结束日期 (YYYY-MM-DD)
   * @returns {Array<MoodRecord>}
   */
  getRecordsByDateRange(startDate, endDate) {
    const allRecords = this.getAllRecords();
    return allRecords.filter(record => {
      const date = record.createdAt.substring(0, 10);
      return date >= startDate && date <= endDate;
    });
  }

  /**
   * 按日期获取记录
   * @param {string} date - 日期 (YYYY-MM-DD)
   * @returns {Array<MoodRecord>}
   */
  getRecordsByDate(date) {
    const allRecords = this.getAllRecords();
    return allRecords.filter(record => record.createdAt.startsWith(date));
  }

  /**
   * 按ID获取记录
   * @param {string} recordId - 记录ID
   * @returns {MoodRecord|null}
   */
  getRecordById(recordId) {
    const allRecords = this.getAllRecords();
    return allRecords.find(record => record.recordId === recordId) || null;
  }

  /**
   * 保存记录
   * @param {MoodRecord} record - 心情记录
   * @returns {boolean} 是否保存成功
   */
  saveRecord(record) {
    const allRecords = this.getAllRecords();
    allRecords.push(record);
    return this.set(StorageKeys.RECORDS, JSON.stringify(allRecords));
  }

  /**
   * 删除记录
   * @param {string} recordId - 记录ID
   * @returns {boolean} 是否删除成功
   */
  deleteRecord(recordId) {
    const allRecords = this.getAllRecords();
    const filteredRecords = allRecords.filter(record => record.recordId !== recordId);
    if (filteredRecords.length === allRecords.length) return false;
    return this.set(StorageKeys.RECORDS, JSON.stringify(filteredRecords));
  }

  /* ------------------------------------------
   * 用户设置操作
   * ------------------------------------------ */

  /**
   * 获取用户设置
   * @returns {UserSettings}
   */
  getSettings() {
    const data = this.get(StorageKeys.SETTINGS);
    if (!data) {
      return {
        nickname: '同学',
        avatar: 'default',
        dailyGoal: 1,
        theme: 'light',
        createdAt: new Date().toISOString(),
      };
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('[StorageAdapter] 解析设置数据失败:', e);
      return {
        nickname: '同学',
        avatar: 'default',
        dailyGoal: 1,
        theme: 'light',
        createdAt: new Date().toISOString(),
      };
    }
  }

  /**
   * 保存用户设置
   * @param {UserSettings} settings - 用户设置
   * @returns {boolean} 是否保存成功
   */
  saveSettings(settings) {
    return this.set(StorageKeys.SETTINGS, JSON.stringify(settings));
  }

  /* ------------------------------------------
   * 存储空间管理
   * ------------------------------------------ */

  /**
   * 获取存储使用量
   * @returns {{used: number, total: number}} 已用和总量（字节）
   */
  getStorageUsage() {
    let used = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        used += key.length + (value ? value.length : 0);
      }
      // 每个字符约2字节（UTF-16）
      used *= 2;
    } catch (e) {
      console.error('[StorageAdapter] 计算存储使用量失败:', e);
    }

    // localStorage 通常限制为5MB
    const total = 5 * 1024 * 1024;
    return { used, total };
  }

  /**
   * 检查存储是否可用
   * @returns {boolean}
   */
  isStorageAvailable() {
    try {
      const testKey = '_mh_storage_test';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }
}

/* 将 StorageAdapter 挂载到全局 */
window.StorageAdapter = StorageAdapter;
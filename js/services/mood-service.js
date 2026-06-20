/**
 * 心情记录服务 — 大学生心情记录助手
 * 提供心情记录的创建、查询、删除等业务逻辑
 */

class MoodService {
  /**
   * @param {StorageAdapter} storageAdapter - 存储适配器
   * @param {EventBus} eventBus - 事件总线
   */
  constructor(storageAdapter, eventBus) {
    this._storageAdapter = storageAdapter;
    this._eventBus = eventBus;
  }

  /**
   * 创建心情记录
   * @param {Object} data - 记录数据
   * @returns {Object|null} 创建的记录
   */
  createRecord(data) {
    const now = new Date().toISOString();
    const record = {
      recordId: `mr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      moodType: data.moodType,
      intensity: data.intensity || AppConstants.DEFAULT_INTENSITY,
      diaryText: data.diaryText || '',
      weatherTag: data.weatherTag || null,
      activityTags: data.activityTags || [],
      images: data.images || [],
      createdAt: now,
      updatedAt: now,
    };

    const success = this._storageAdapter.saveRecord(record);
    if (success) {
      this._eventBus.emit(AppEvents.MOOD_RECORDED, { record });
      return record;
    }
    return null;
  }

  /**
   * 按ID获取记录
   * @param {string} recordId
   * @returns {Object|null}
   */
  getRecordById(recordId) {
    return this._storageAdapter.getRecordById(recordId);
  }

  /**
   * 按日期获取记录
   * @param {string} date - YYYY-MM-DD
   * @returns {Array}
   */
  getRecordsByDate(date) {
    return this._storageAdapter.getRecordsByDate(date);
  }

  /**
   * 按日期范围获取记录
   * @param {string} start
   * @param {string} end
   * @returns {Array}
   */
  getRecordsByDateRange(start, end) {
    return this._storageAdapter.getRecordsByDateRange(start, end);
  }

  /**
   * 获取所有记录
   * @returns {Array}
   */
  getAllRecords() {
    return this._storageAdapter.getAllRecords();
  }

  /**
   * 删除记录
   * @param {string} recordId
   * @returns {boolean}
   */
  deleteRecord(recordId) {
    const success = this._storageAdapter.deleteRecord(recordId);
    if (success) {
      this._eventBus.emit(AppEvents.MOOD_DELETED, { recordId });
    }
    return success;
  }

  /**
   * 快捷记录
   * @param {string} moodType - 心情类型
   * @returns {Object|null}
   */
  quickRecord(moodType) {
    return this.createRecord({ moodType, intensity: AppConstants.DEFAULT_INTENSITY });
  }

  /**
   * 获取今日记录数
   * @returns {number}
   */
  getTodayRecordCount() {
    const today = new Date().toISOString().substring(0, 10);
    return this._storageAdapter.getRecordsByDate(today).length;
  }
}

/* 将 MoodService 挂载到全局 */
window.MoodService = MoodService;
/**
 * 打卡服务 — 大学生心情记录助手
 * 提供连续打卡天数计算和今日进度查询
 */

class CheckInService {
  /**
   * @param {StorageAdapter} storageAdapter - 存储适配器
   */
  constructor(storageAdapter) {
    this._storageAdapter = storageAdapter;
  }

  /**
   * 获取连续打卡天数
   * @returns {number}
   */
  getStreakDays() {
    const allRecords = this._storageAdapter.getAllRecords();
    if (allRecords.length === 0) return 0;

    // 按日期建立索引
    const dateIndex = new Set();
    allRecords.forEach(record => {
      const date = record.createdAt.substring(0, 10);
      dateIndex.add(date);
    });

    let streakDays = 0;
    const today = this._formatDate(new Date());
    let checkDate = today;

    // 从今天开始向前检查
    while (dateIndex.has(checkDate)) {
      streakDays++;
      checkDate = this._getPreviousDay(checkDate);
    }

    return streakDays;
  }

  /**
   * 今日是否已打卡
   * @returns {boolean}
   */
  isTodayCheckedIn() {
    const today = this._formatDate(new Date());
    const records = this._storageAdapter.getRecordsByDate(today);
    return records.length > 0;
  }

  /**
   * 获取今日目标进度
   * @returns {{current: number, goal: number, isCompleted: boolean}}
   */
  getTodayProgress() {
    const settings = this._storageAdapter.getSettings();
    const today = this._formatDate(new Date());
    const records = this._storageAdapter.getRecordsByDate(today);
    const current = records.length;
    const goal = settings.dailyGoal || 1;

    return {
      current,
      goal,
      isCompleted: current >= goal,
    };
  }

  /**
   * 格式化日期为 YYYY-MM-DD
   * @param {Date} date
   * @returns {string}
   * @private
   */
  _formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 获取前一天日期
   * @param {string} dateStr - YYYY-MM-DD
   * @returns {string}
   * @private
   */
  _getPreviousDay(dateStr) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() - 1);
    return this._formatDate(date);
  }
}

/* 将 CheckInService 挂载到全局 */
window.CheckInService = CheckInService;
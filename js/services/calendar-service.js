/**
 * 日历服务 — 大学生心情记录助手
 * 提供月历数据、日期详情、月份导航等功能
 */

class CalendarService {
  /**
   * @param {StorageAdapter} storageAdapter - 存储适配器
   */
  constructor(storageAdapter) {
    this._storageAdapter = storageAdapter;
  }

  /**
   * 获取月历数据
   * @param {number} year - 年份
   * @param {number} month - 月份 (1-12)
   * @returns {Object} CalendarMonthData — 包含 year, month, days, totalDays, startDayOfWeek, recordCount
   */
  getMonthData(year, month) {
    const allRecords = this._storageAdapter.getAllRecords();
    const today = new Date();
    const todayStr = this._formatDate(today);

    // 计算当月天数和起始星期
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const totalDays = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0=周日

    // 构建当月日期字符串前缀，用于快速过滤
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;

    // 按日期建立索引，提升查询性能
    const dateIndex = new Map();
    allRecords.forEach(record => {
      const dateStr = record.createdAt.substring(0, 10);
      if (dateStr.startsWith(monthPrefix)) {
        if (!dateIndex.has(dateStr)) {
          dateIndex.set(dateStr, []);
        }
        dateIndex.get(dateStr).push(record);
      }
    });

    // 构建日期列表
    const days = [];
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayRecords = dateIndex.get(dateStr) || [];

      // 获取最近一条记录的心情颜色（按时间降序排列取第一条）
      let moodColor = null;
      if (dayRecords.length > 0) {
        const sorted = [...dayRecords].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        const latest = sorted[0];
        moodColor = MOOD_COLOR_MAP[latest.moodType]?.primary || null;
      }

      // 判断是否为未来日期
      const dayDate = new Date(year, month - 1, d);
      const isFuture = dayDate > today &&
        !(dayDate.getFullYear() === today.getFullYear() &&
          dayDate.getMonth() === today.getMonth() &&
          dayDate.getDate() === today.getDate());

      days.push({
        date: dateStr,
        dayOfWeek: new Date(year, month - 1, d).getDay(),
        isToday: dateStr === todayStr,
        isFuture: isFuture,
        moodColor,
        recordCount: dayRecords.length,
      });
    }

    // 计算当月记录总数
    const recordCount = allRecords.filter(r => {
      const d = r.createdAt.substring(0, 7);
      return d === monthPrefix;
    }).length;

    return {
      year,
      month,
      days,
      totalDays,
      startDayOfWeek,
      recordCount,
    };
  }

  /**
   * 获取某日心情颜色
   * @param {string} date - YYYY-MM-DD
   * @returns {string|null}
   */
  getDateColor(date) {
    const records = this._storageAdapter.getRecordsByDate(date);
    if (records.length === 0) return null;
    // 按时间降序排列，取最近一条记录的心情颜色
    const sorted = [...records].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return MOOD_COLOR_MAP[sorted[0].moodType]?.primary || null;
  }

  /**
   * 获取日期详情
   * @param {string} date - YYYY-MM-DD
   * @returns {Object|null} DateDetail — 包含 date 和 records 数组
   */
  getDateDetail(date) {
    const records = this._storageAdapter.getRecordsByDate(date);
    if (records.length === 0) return null;
    // 按时间降序排列，最新的记录在最前面
    const sorted = [...records].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { date, records: sorted };
  }

  /**
   * 获取上一个月
   * @param {number} year
   * @param {number} month
   * @returns {{year: number, month: number}}
   */
  getPreviousMonth(year, month) {
    if (month === 1) return { year: year - 1, month: 12 };
    return { year, month: month - 1 };
  }

  /**
   * 获取下一个月
   * @param {number} year
   * @param {number} month
   * @returns {{year: number, month: number}}
   */
  getNextMonth(year, month) {
    if (month === 12) return { year: year + 1, month: 1 };
    return { year, month: month + 1 };
  }

  /**
   * 判断是否为未来月份
   * 如果年份大于当前年份，或者年份等于当前年份但月份大于当前月份，则为未来月份
   * @param {number} year
   * @param {number} month
   * @returns {boolean}
   */
  isFutureMonth(year, month) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    if (year > currentYear) return true;
    if (year === currentYear && month > currentMonth) return true;
    return false;
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
}

/* 将 CalendarService 挂载到全局 */
window.CalendarService = CalendarService;

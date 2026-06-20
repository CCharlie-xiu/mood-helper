/**
 * 统计服务 — 大学生心情记录助手
 * 提供心情趋势、分布、洞察分析及Chart.js配置
 */

class StatsService {
  /**
   * @param {StorageAdapter} storageAdapter - 存储适配器
   */
  constructor(storageAdapter) {
    this._storageAdapter = storageAdapter;
  }

  /**
   * 获取趋势数据
   * @param {string} period - 统计周期 (week/month/year)
   * @returns {Array}
   */
  getTrendData(period) {
    const { start, end } = this._getDateRange(period);
    const records = this._storageAdapter.getRecordsByDateRange(start, end);
    // 按日期分组
    const grouped = {};
    records.forEach(r => {
      const date = r.createdAt.substring(0, 10);
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(r);
    });

    return Object.entries(grouped).map(([date, recs]) => {
      const avgIntensity = recs.reduce((sum, r) => sum + r.intensity, 0) / recs.length;
      const moodCounts = {};
      recs.forEach(r => { moodCounts[r.moodType] = (moodCounts[r.moodType] || 0) + 1; });
      const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || MoodType.CALM;
      return { date, avgIntensity: Math.round(avgIntensity * 10) / 10, dominantMood };
    }).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * 获取分布数据
   * @param {string} period
   * @returns {Object}
   */
  getDistributionData(period) {
    const { start, end } = this._getDateRange(period);
    const records = this._storageAdapter.getRecordsByDateRange(start, end);
    const total = records.length;
    const counts = {};
    Object.values(MoodType).forEach(t => { counts[t] = 0; });
    records.forEach(r => { counts[r.moodType] = (counts[r.moodType] || 0) + 1; });

    const items = Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([moodType, count]) => ({
        moodType,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: MOOD_COLOR_MAP[moodType]?.primary || '#999',
      }));

    return { total, items };
  }

  /**
   * 获取洞察分析
   * @param {string} period
   * @returns {Object}
   */
  getInsight(period) {
    const { start, end } = this._getDateRange(period);
    const records = this._storageAdapter.getRecordsByDateRange(start, end);
    const total = records.length;

    if (total < 3) {
      return {
        summary: '记录更多天数后可获得洞察分析',
        dominantMood: null,
        suggestions: ['坚持每天记录心情，获取个性化洞察'],
        hasEnoughData: false,
      };
    }

    // 计算主导心情
    const counts = {};
    records.forEach(r => { counts[r.moodType] = (counts[r.moodType] || 0) + 1; });
    const dominantMood = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];

    // 生成洞察文字
    const periodLabel = { week: '本周', month: '本月', year: '今年' }[period] || '本期';
    const moodLabel = MOOD_COLOR_MAP[dominantMood]?.label || '';
    const percentage = Math.round((counts[dominantMood] / total) * 100);
    let summary = `${periodLabel}你的心情以${moodLabel}为主，占比${percentage}%`;

    // 生成建议
    const suggestions = [];
    const negativeRatio = ((counts[MoodType.ANXIOUS] || 0) + (counts[MoodType.SAD] || 0)) / total;
    const positiveRatio = ((counts[MoodType.HAPPY] || 0) + (counts[MoodType.CALM] || 0)) / total;

    if (negativeRatio > 0.4) {
      suggestions.push('建议适当放松，尝试深呼吸或户外散步');
    }
    if (positiveRatio > 0.7) {
      suggestions.push('继续保持好心情，多做让自己快乐的事');
    }
    if ((counts[MoodType.ANGRY] || 0) / total > 0.3) {
      suggestions.push('建议尝试冥想或放松练习来管理情绪');
    }
    if (suggestions.length === 0) {
      suggestions.push('保持记录习惯，关注自己的情绪变化');
    }

    return { summary, dominantMood, suggestions, hasEnoughData: true };
  }

  /**
   * 获取折线图Chart.js配置
   * @param {string} period
   * @returns {Object}
   */
  getLineChartConfig(period) {
    const trendData = this.getTrendData(period);
    return {
      type: 'line',
      data: {
        labels: trendData.map(d => d.date.substring(5)),
        datasets: [{
          label: '心情强度',
          data: trendData.map(d => d.avgIntensity),
          borderColor: 'var(--accent)',
          backgroundColor: 'rgba(74, 158, 222, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: trendData.map(d => MOOD_COLOR_MAP[d.dominantMood]?.primary || '#4A9EDE'),
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { min: 0, max: 5, ticks: { stepSize: 1 } },
          x: { grid: { display: false } },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => `强度: ${ctx.raw}`,
            },
          },
        },
      },
    };
  }

  /**
   * 获取饼图Chart.js配置
   * @param {string} period
   * @returns {Object}
   */
  getPieChartConfig(period) {
    const distData = this.getDistributionData(period);
    return {
      type: 'doughnut',
      data: {
        labels: distData.items.map(i => MOOD_COLOR_MAP[i.moodType]?.label || i.moodType),
        datasets: [{
          data: distData.items.map(i => i.count),
          backgroundColor: distData.items.map(i => i.color),
          borderWidth: 2,
          borderColor: 'var(--card-bg)',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '55%',
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    };
  }

  /**
   * 获取日期范围
   * @param {string} period
   * @returns {{start: string, end: string}}
   * @private
   */
  _getDateRange(period) {
    const now = new Date();
    const end = this._formatDate(now);
    let start;

    switch (period) {
      case StatsPeriod.WEEK: {
        const d = new Date(now);
        d.setDate(d.getDate() - 6);
        start = this._formatDate(d);
        break;
      }
      case StatsPeriod.MONTH: {
        const d = new Date(now);
        d.setDate(d.getDate() - 29);
        start = this._formatDate(d);
        break;
      }
      case StatsPeriod.YEAR: {
        start = `${now.getFullYear() - 1}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        break;
      }
      default: {
        const d = new Date(now);
        d.setDate(d.getDate() - 6);
        start = this._formatDate(d);
      }
    }

    return { start, end };
  }

  /**
   * 格式化日期
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

/* 将 StatsService 挂载到全局 */
window.StatsService = StatsService;
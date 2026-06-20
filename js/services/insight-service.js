/**
 * 洞察分析服务 — 大学生心情记录助手
 * 提供每日小贴士、每日语录、心情趋势分析
 */

class InsightService {
  /**
   * @param {StorageAdapter} storageAdapter - 存储适配器
   */
  constructor(storageAdapter) {
    this._storageAdapter = storageAdapter;

    /* 缓解压力类贴士 */
    this._stressTips = [
      '近期压力较大，建议适当放松，试试深呼吸或散步。',
      '感到焦虑时，试着做几次深呼吸，慢慢吸气、缓缓呼气。',
      '给自己安排一段休息时间，哪怕只有10分钟也好。',
      '试试冥想或正念练习，关注当下的感受。',
      '适当运动能有效缓解压力，哪怕只是散步15分钟。',
    ];

    /* 保持好心情类贴士 */
    this._positiveTips = [
      '近期心情不错，继续保持积极的生活节奏！',
      '好心情值得珍惜，今天也给自己一个小奖励吧。',
      '保持好心情的秘诀：规律作息、适量运动、多与朋友交流。',
      '积极的心态会带来更多好运，继续保持！',
      '记录下让你开心的事情，难过时翻看会很有帮助。',
    ];

    /* 情绪管理类贴士 */
    this._angerTips = [
      '近期情绪波动较大，建议尝试冥想或与朋友倾诉。',
      '愤怒时先暂停，数10个数再做出反应。',
      '试试写日记把不满写下来，有时候写出来就好了。',
      '运动是释放愤怒的好方式，去跑一圈吧。',
      '深呼吸可以帮助平复情绪，试试4-7-8呼吸法。',
    ];

    /* 通用心情关怀类贴士 */
    this._generalTips = [
      '每天记录心情，帮助自己更好地了解内心世界。',
      '关注自己的情绪变化，是关爱自己的第一步。',
      '无论今天心情如何，都值得被记录和理解。',
      '试着找出影响心情的因素，有助于更好地管理情绪。',
      '保持规律的记录习惯，你会发现更多关于自己的规律。',
    ];
  }

  /**
   * 获取今日小贴士
   * 根据近7天心情数据生成个性化小贴士
   * @returns {string}
   */
  getDailyTip() {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const startStr = this._formatDate(weekAgo);
    const endStr = this._formatDate(now);
    const records = this._storageAdapter.getRecordsByDateRange(startStr, endStr);

    if (records.length === 0) {
      return '开始记录你的心情吧，了解自己从关注内心开始。';
    }

    const total = records.length;
    const counts = {};
    records.forEach(r => { counts[r.moodType] = (counts[r.moodType] || 0) + 1; });

    const negativeRatio = ((counts[MoodType.ANXIOUS] || 0) + (counts[MoodType.SAD] || 0)) / total;
    const positiveRatio = ((counts[MoodType.HAPPY] || 0) + (counts[MoodType.CALM] || 0)) / total;
    const angryRatio = (counts[MoodType.ANGRY] || 0) / total;

    // 根据规则选择贴士类别
    if (negativeRatio > 0.4) {
      return this._getRandomTip(this._stressTips);
    }
    if (angryRatio > 0.3) {
      return this._getRandomTip(this._angerTips);
    }
    if (positiveRatio > 0.7) {
      return this._getRandomTip(this._positiveTips);
    }
    return this._getRandomTip(this._generalTips);
  }

  /**
   * 获取每日语录
   * 按日期索引返回语录，确保每月不重复
   * @returns {{quoteId: number, content: string, category: string}}
   */
  getQuote() {
    return getQuoteByDate();
  }

  /**
   * 分析心情趋势
   * @param {Array} records - 心情记录列表
   * @returns {{trend: string, dominantMood: string, suggestion: string}}
   */
  analyzeMoodTrend(records) {
    if (!records || records.length < 2) {
      return {
        trend: 'stable',
        dominantMood: MoodType.CALM,
        suggestion: '继续记录心情以获取趋势分析',
      };
    }

    // 按时间排序
    const sorted = [...records].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    // 计算前半段和后半段的平均强度
    const mid = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, mid);
    const secondHalf = sorted.slice(mid);

    const avgFirst = firstHalf.reduce((s, r) => s + r.intensity, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((s, r) => s + r.intensity, 0) / secondHalf.length;

    // 判断趋势
    let trend = 'stable';
    if (avgFirst > avgSecond + 0.5) {
      trend = 'declining';
    } else if (avgSecond > avgFirst + 0.5) {
      trend = 'improving';
    }

    // 统计各心情类型出现次数，找出主导心情
    const counts = {};
    sorted.forEach(r => { counts[r.moodType] = (counts[r.moodType] || 0) + 1; });
    const dominantMood = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || MoodType.CALM;

    // 根据主导心情和趋势生成建议
    const suggestion = this._generateSuggestion(dominantMood, trend);

    return { trend, dominantMood, suggestion };
  }

  /**
   * 根据主导心情和趋势生成建议
   * @param {string} dominantMood - 主导心情
   * @param {string} trend - 趋势
   * @returns {string}
   * @private
   */
  _generateSuggestion(dominantMood, trend) {
    // 洞察规则映射（参照设计文档6.2节）
    const suggestions = {
      [MoodType.HAPPY]: {
        improving: '心情趋势向好，继续保持！多做让自己快乐的事。',
        stable: '你的心情以开心为主，继续保持积极的生活节奏！',
        declining: '近期开心情绪有所减少，多做让自己快乐的事吧。',
      },
      [MoodType.CALM]: {
        improving: '心情越来越平静，保持良好的生活习惯。',
        stable: '你的心情比较平静稳定，适当增加一些新鲜体验也不错。',
        declining: '心情有些波动，适当增加一些新鲜体验来调节。',
      },
      [MoodType.ANXIOUS]: {
        improving: '焦虑情绪在减少，继续保持！',
        stable: '近期焦虑情绪较多，建议适当放松，尝试深呼吸。',
        declining: '焦虑情绪有加重趋势，建议与朋友倾诉或寻求帮助。',
      },
      [MoodType.SAD]: {
        improving: '低落情绪在减少，一切都在变好。',
        stable: '近期难过情绪较多，建议适当运动或与朋友交流。',
        declining: '低落情绪有加重趋势，建议关注心理健康，多与亲友交流。',
      },
      [MoodType.ANGRY]: {
        improving: '愤怒情绪在减少，情绪管理做得不错！',
        stable: '近期愤怒情绪较多，建议尝试冥想或放松练习。',
        declining: '愤怒情绪有加重趋势，建议尝试运动释放或找人倾诉。',
      },
    };

    return suggestions[dominantMood]?.[trend] || '每天记录心情，帮助自己更好地了解内心世界。';
  }

  /**
   * 从贴士数组中随机获取一条
   * @param {Array<string>} tips - 贴士数组
   * @returns {string}
   * @private
   */
  _getRandomTip(tips) {
    const index = Math.floor(Math.random() * tips.length);
    return tips[index];
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

/* 将 InsightService 挂载到全局 */
window.InsightService = InsightService;

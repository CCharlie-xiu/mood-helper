/**
 * 数据校验器 — 大学生心情记录助手
 * 提供心情记录和用户设置的数据校验功能
 * 所有校验方法返回 ValidationResult { valid: boolean, error?: string }
 */

class DataValidator {
  /**
   * 校验心情记录
   * @param {Object} record - 心情记录对象
   * @returns {{valid: boolean, error?: string}} ValidationResult
   */
  validateMoodRecord(record) {
    if (!record || typeof record !== 'object') {
      return { valid: false, error: '记录数据无效' };
    }

    // 心情类型必填校验
    if (!record.moodType) {
      return { valid: false, error: '心情类型不能为空' };
    }
    if (!this.validateMoodType(record.moodType)) {
      return { valid: false, error: '心情类型无效，应为 happy/calm/anxious/sad/angry 之一' };
    }

    // 心情强度必填校验
    if (record.intensity === undefined || record.intensity === null) {
      return { valid: false, error: '心情强度不能为空' };
    }
    if (!this.validateIntensity(record.intensity)) {
      return { valid: false, error: '心情强度无效，应为1-5的整数' };
    }

    // 日记文字校验（选填）
    if (record.diaryText !== undefined && record.diaryText !== null && !this.validateDiaryText(record.diaryText)) {
      return { valid: false, error: `日记文字超出限制，最大${AppConstants.MAX_DIARY_LENGTH}字` };
    }

    // 天气标签校验（选填）
    if (record.weatherTag !== undefined && record.weatherTag !== null && record.weatherTag !== '') {
      if (!this.validateWeatherTag(record.weatherTag)) {
        return { valid: false, error: '天气标签无效' };
      }
    }

    // 活动标签校验（选填）
    if (record.activityTags !== undefined && record.activityTags !== null) {
      if (!this.validateActivityTags(record.activityTags)) {
        return { valid: false, error: '活动标签无效' };
      }
    }

    // 图片校验（选填）
    if (record.images !== undefined && record.images !== null) {
      if (!this.validateImages(record.images)) {
        return { valid: false, error: '图片数据无效，最多3张' };
      }
    }

    // 创建时间校验
    if (!record.createdAt) {
      return { valid: false, error: '创建时间不能为空' };
    }

    return { valid: true };
  }

  /**
   * 校验心情类型
   * @param {string} type - 心情类型
   * @returns {boolean}
   */
  validateMoodType(type) {
    return Object.values(MoodType).includes(type);
  }

  /**
   * 校验心情强度
   * @param {number} value - 强度值
   * @returns {boolean}
   */
  validateIntensity(value) {
    return Number.isInteger(value) && value >= AppConstants.MIN_INTENSITY && value <= AppConstants.MAX_INTENSITY;
  }

  /**
   * 校验日记文字
   * @param {string} text - 日记文本
   * @returns {boolean}
   */
  validateDiaryText(text) {
    return typeof text === 'string' && text.length <= AppConstants.MAX_DIARY_LENGTH;
  }

  /**
   * 校验天气标签
   * @param {string} tag - 天气标签
   * @returns {boolean}
   */
  validateWeatherTag(tag) {
    return Object.values(WeatherTag).includes(tag);
  }

  /**
   * 校验活动标签
   * @param {Array<string>} tags - 活动标签列表
   * @returns {boolean}
   */
  validateActivityTags(tags) {
    if (!Array.isArray(tags)) return false;
    if (tags.length > AppConstants.MAX_ACTIVITY_TAGS) return false;
    return tags.every(tag => Object.values(ActivityTag).includes(tag));
  }

  /**
   * 校验图片数据
   * @param {Array<string>} images - 图片Base64列表
   * @returns {boolean}
   */
  validateImages(images) {
    if (!Array.isArray(images)) return false;
    if (images.length > AppConstants.MAX_IMAGES) return false;
    return images.every(img => typeof img === 'string' && img.length > 0);
  }

  /**
   * 校验用户设置
   * @param {Object} settings - 用户设置对象
   * @returns {{valid: boolean, error?: string}} ValidationResult
   */
  validateUserSettings(settings) {
    if (!settings || typeof settings !== 'object') {
      return { valid: false, error: '设置数据无效' };
    }

    // 昵称校验
    if (settings.nickname !== undefined && settings.nickname !== null) {
      if (!this.validateNickname(settings.nickname)) {
        return { valid: false, error: `昵称无效，应为1-${AppConstants.MAX_NICKNAME_LENGTH}个字符` };
      }
    }

    // 每日目标校验
    if (settings.dailyGoal !== undefined && settings.dailyGoal !== null) {
      if (!this.validateDailyGoal(settings.dailyGoal)) {
        return { valid: false, error: `每日目标无效，应为${AppConstants.MIN_DAILY_GOAL}-${AppConstants.MAX_DAILY_GOAL}的整数` };
      }
    }

    // 主题校验
    if (settings.theme !== undefined && settings.theme !== null) {
      if (settings.theme !== 'light' && settings.theme !== 'dark') {
        return { valid: false, error: '主题模式无效，应为 light 或 dark' };
      }
    }

    return { valid: true };
  }

  /**
   * 校验昵称
   * @param {string} name - 昵称
   * @returns {boolean}
   */
  validateNickname(name) {
    return typeof name === 'string' && name.length > 0 && name.length <= AppConstants.MAX_NICKNAME_LENGTH;
  }

  /**
   * 校验每日目标
   * @param {number} goal - 目标次数
   * @returns {boolean}
   */
  validateDailyGoal(goal) {
    return Number.isInteger(goal) && goal >= AppConstants.MIN_DAILY_GOAL && goal <= AppConstants.MAX_DAILY_GOAL;
  }

  /**
   * 校验导入数据格式
   * 检查导入的JSON数据是否符合预期结构
   * @param {Object} data - 导入的数据
   * @returns {{valid: boolean, error?: string}} ValidationResult
   */
  validateImportFormat(data) {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: '导入数据格式无效' };
    }

    // 必须包含 records 数组
    if (!data.records) {
      return { valid: false, error: '导入数据缺少 records 字段' };
    }
    if (!Array.isArray(data.records)) {
      return { valid: false, error: 'records 字段必须是数组' };
    }

    // 逐条校验记录格式（最多校验前10条，避免性能问题）
    const checkCount = Math.min(data.records.length, 10);
    for (let i = 0; i < checkCount; i++) {
      const record = data.records[i];
      if (!record || typeof record !== 'object') {
        return { valid: false, error: `第${i + 1}条记录格式无效` };
      }
      if (!record.recordId || typeof record.recordId !== 'string') {
        return { valid: false, error: `第${i + 1}条记录缺少有效的 recordId` };
      }
      if (!this.validateMoodType(record.moodType)) {
        return { valid: false, error: `第${i + 1}条记录的心情类型无效` };
      }
    }

    // settings 字段可选，如果存在则校验
    if (data.settings !== undefined && data.settings !== null) {
      if (typeof data.settings !== 'object' || Array.isArray(data.settings)) {
        return { valid: false, error: 'settings 字段格式无效' };
      }
    }

    return { valid: true };
  }
}

/* 将 DataValidator 挂载到全局 */
window.DataValidator = DataValidator;

/**
 * 用户设置服务 — 大学生心情记录助手
 * 提供用户设置的读写和更新功能
 */

class SettingsService {
  /**
   * @param {StorageAdapter} storageAdapter - 存储适配器
   * @param {EventBus} eventBus - 事件总线
   */
  constructor(storageAdapter, eventBus) {
    this._storageAdapter = storageAdapter;
    this._eventBus = eventBus;
  }

  /**
   * 获取用户设置
   * @returns {Object} UserSettings
   */
  getSettings() {
    return this._storageAdapter.getSettings();
  }

  /**
   * 更新昵称
   * @param {string} nickname - 新昵称
   * @returns {boolean} 是否更新成功
   */
  updateNickname(nickname) {
    // 校验昵称
    if (!nickname || typeof nickname !== 'string') return false;
    if (nickname.length === 0 || nickname.length > AppConstants.MAX_NICKNAME_LENGTH) return false;

    const settings = this.getSettings();
    settings.nickname = nickname;
    settings.updatedAt = new Date().toISOString();
    const success = this._storageAdapter.saveSettings(settings);
    if (success) {
      this._eventBus.emit(AppEvents.SETTINGS_UPDATED, { key: 'nickname', value: nickname });
    }
    return success;
  }

  /**
   * 更新头像
   * @param {string} avatarId - 头像标识
   * @returns {boolean} 是否更新成功
   */
  updateAvatar(avatarId) {
    if (!avatarId || typeof avatarId !== 'string') return false;

    const settings = this.getSettings();
    settings.avatar = avatarId;
    settings.updatedAt = new Date().toISOString();
    const success = this._storageAdapter.saveSettings(settings);
    if (success) {
      this._eventBus.emit(AppEvents.SETTINGS_UPDATED, { key: 'avatar', value: avatarId });
    }
    return success;
  }

  /**
   * 更新每日目标
   * @param {number} goal - 每日记录目标次数
   * @returns {boolean} 是否更新成功
   */
  updateDailyGoal(goal) {
    // 校验目标值
    if (!Number.isInteger(goal)) return false;
    if (goal < AppConstants.MIN_DAILY_GOAL || goal > AppConstants.MAX_DAILY_GOAL) return false;

    const settings = this.getSettings();
    settings.dailyGoal = goal;
    settings.updatedAt = new Date().toISOString();
    const success = this._storageAdapter.saveSettings(settings);
    if (success) {
      this._eventBus.emit(AppEvents.SETTINGS_UPDATED, { key: 'dailyGoal', value: goal });
    }
    return success;
  }

  /**
   * 更新主题
   * @param {'light'|'dark'} theme - 主题模式
   * @returns {boolean} 是否更新成功
   */
  updateTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') return false;

    const settings = this.getSettings();
    settings.theme = theme;
    settings.updatedAt = new Date().toISOString();
    const success = this._storageAdapter.saveSettings(settings);
    if (success) {
      this._eventBus.emit(AppEvents.SETTINGS_UPDATED, { key: 'theme', value: theme });
    }
    return success;
  }

  /**
   * 判断是否首次使用
   * @returns {boolean}
   */
  isFirstTime() {
    return !this._storageAdapter.get(StorageKeys.VERSION);
  }

  /**
   * 初始化默认设置
   * 首次使用时调用，创建默认的用户设置和空记录列表
   */
  initializeDefaultSettings() {
    const defaultSettings = {
      nickname: '同学',
      avatar: 'default',
      dailyGoal: 1,
      theme: 'light',
      createdAt: new Date().toISOString(),
    };
    this._storageAdapter.saveSettings(defaultSettings);
    this._storageAdapter.set(StorageKeys.VERSION, AppConstants.DATA_VERSION);
    this._storageAdapter.set(StorageKeys.RECORDS, JSON.stringify([]));
  }
}

/* 将 SettingsService 挂载到全局 */
window.SettingsService = SettingsService;

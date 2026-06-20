/**
 * 个人中心页视图 — 大学生心情记录助手
 * 个人信息、昵称修改、头像选择、目标设定、主题切换、数据导出导入
 * 增强：头像选择Modal、每日目标设定Modal、点击波纹效果、
 *       主题过渡动画、数据导入进度提示、stagger动画
 */

class ProfileView extends BaseView {
  mount() {
    super.mount();
    this._renderPage();
    this._loadSettings();
    this._playStaggerAnimation();
  }

  beforeUnmount() {
    super.beforeUnmount();
  }

  render() {
    return '';
  }

  _renderPage() {
    this._container.innerHTML = `
      <div class="page-content">
        <h2 class="mb-lg anim-card-stagger" style="animation-delay: 0ms; font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--text-primary)">个人中心</h2>

        <!-- 个人信息卡片 — 渐变背景 -->
        <div class="card profile-info-card mb-md anim-card-stagger" style="animation-delay: 50ms">
          <div class="profile-info">
            <div class="profile-info__avatar" id="profile-avatar">😊</div>
            <div class="profile-info__detail">
              <div class="profile-info__nickname" id="profile-nickname">同学</div>
              <div class="profile-info__goal" id="profile-goal">🎯 每日目标: 1次</div>
            </div>
          </div>
        </div>

        <!-- 设置项列表 -->
        <div class="card anim-card-stagger" style="animation-delay: 100ms">
          <div class="profile-settings">
            <div class="profile-setting-item" id="profile-edit-nickname">
              <div class="profile-setting-item__left">
                <span class="profile-setting-item__icon">✏️</span>
                <span class="profile-setting-item__label">修改昵称</span>
              </div>
              <div class="profile-setting-item__right">
                <span class="profile-setting-item__arrow">›</span>
              </div>
            </div>

            <div class="profile-setting-item" id="profile-edit-avatar">
              <div class="profile-setting-item__left">
                <span class="profile-setting-item__icon">🎨</span>
                <span class="profile-setting-item__label">选择头像</span>
              </div>
              <div class="profile-setting-item__right">
                <span class="profile-setting-item__arrow">›</span>
              </div>
            </div>

            <div class="profile-setting-item" id="profile-edit-goal">
              <div class="profile-setting-item__left">
                <span class="profile-setting-item__icon">🎯</span>
                <span class="profile-setting-item__label">每日目标</span>
              </div>
              <div class="profile-setting-item__right">
                <span id="profile-goal-value" style="color: var(--accent)">1次</span>
                <span class="profile-setting-item__arrow">›</span>
              </div>
            </div>

            <div class="profile-setting-item" id="profile-theme-toggle">
              <div class="profile-setting-item__left">
                <span class="profile-setting-item__icon">🌙</span>
                <span class="profile-setting-item__label">深色模式</span>
              </div>
              <div class="profile-switch" id="profile-theme-switch">
                <div class="profile-switch__thumb"></div>
              </div>
            </div>

            <div class="profile-setting-item" id="profile-export">
              <div class="profile-setting-item__left">
                <span class="profile-setting-item__icon">📤</span>
                <span class="profile-setting-item__label">导出数据</span>
              </div>
              <div class="profile-setting-item__right">
                <span class="profile-setting-item__arrow">›</span>
              </div>
            </div>

            <div class="profile-setting-item" id="profile-import">
              <div class="profile-setting-item__left">
                <span class="profile-setting-item__icon">📥</span>
                <span class="profile-setting-item__label">导入数据</span>
              </div>
              <div class="profile-setting-item__right">
                <span class="profile-setting-item__arrow">›</span>
              </div>
            </div>

            <div class="profile-setting-item" id="profile-about">
              <div class="profile-setting-item__left">
                <span class="profile-setting-item__icon">ℹ️</span>
                <span class="profile-setting-item__label">关于</span>
              </div>
              <div class="profile-setting-item__right">
                <span class="profile-setting-item__arrow">›</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this._bindSettingEvents();
    this._initRippleEffects();
  }

  /**
   * 播放页面元素的stagger渐入动画
   */
  _playStaggerAnimation() {
    const items = this._container.querySelectorAll('.anim-card-stagger');
    items.forEach(item => {
      item.addEventListener('animationend', () => {
        item.classList.remove('anim-card-stagger');
      }, { once: true });
    });
  }

  _loadSettings() {
    if (!window.appStorage) return;
    const settings = window.appStorage.getSettings();

    const nicknameEl = this._container.querySelector('#profile-nickname');
    if (nicknameEl) nicknameEl.textContent = settings.nickname || '同学';

    const goalEl = this._container.querySelector('#profile-goal');
    if (goalEl) goalEl.textContent = `🎯 每日目标: ${settings.dailyGoal || 1}次`;

    const goalValueEl = this._container.querySelector('#profile-goal-value');
    if (goalValueEl) goalValueEl.textContent = `${settings.dailyGoal || 1}次`;

    // 头像
    const avatarEl = this._container.querySelector('#profile-avatar');
    if (avatarEl) {
      const avatarEmoji = this._getAvatarEmoji(settings.avatar);
      avatarEl.textContent = avatarEmoji;
    }

    // 主题开关状态
    const switchEl = this._container.querySelector('#profile-theme-switch');
    if (switchEl && settings.theme === 'dark') {
      switchEl.classList.add('profile-switch--active');
    }
  }

  /**
   * 获取头像emoji
   * 优先从PresetAvatars常量获取，降级使用内置映射
   */
  _getAvatarEmoji(avatarId) {
    // 优先使用全局PresetAvatars常量
    if (typeof PresetAvatars !== 'undefined') {
      const found = PresetAvatars.find(a => a.id === avatarId);
      if (found) return found.emoji;
    }
    // 降级映射
    const avatarMap = {
      'default': '😊',
      'happy': '😄',
      'calm': '😌',
      'cool': '😎',
      'love': '🥰',
      'star': '🤩',
      'think': '🤔',
      'sleep': '😴',
      'cat': '🐱',
      'dog': '🐶',
      'rabbit': '🐰',
      'bear': '🐻',
      'panda': '🐼',
      'fox': '🦊',
      'flower': '🌸',
    };
    return avatarMap[avatarId] || avatarMap['default'];
  }

  /**
   * 初始化设置项的点击波纹效果
   */
  _initRippleEffects() {
    const items = this._container.querySelectorAll('.profile-setting-item');
    items.forEach(item => {
      item.addEventListener('click', (e) => {
        // 创建波纹元素
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';

        const rect = item.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
        `;

        item.appendChild(ripple);

        // 动画结束后移除
        ripple.addEventListener('animationend', () => {
          ripple.remove();
        });
      });
    });
  }

  _bindSettingEvents() {
    // 修改昵称
    const editNickname = this._container.querySelector('#profile-edit-nickname');
    if (editNickname) {
      this.bindEvent(editNickname, 'click', () => this._editNickname());
    }

    // 选择头像
    const editAvatar = this._container.querySelector('#profile-edit-avatar');
    if (editAvatar) {
      this.bindEvent(editAvatar, 'click', () => this._showAvatarPicker());
    }

    // 每日目标
    const editGoal = this._container.querySelector('#profile-edit-goal');
    if (editGoal) {
      this.bindEvent(editGoal, 'click', () => this._showGoalPicker());
    }

    // 主题切换
    const themeToggle = this._container.querySelector('#profile-theme-toggle');
    if (themeToggle) {
      this.bindEvent(themeToggle, 'click', () => {
        if (window.appThemeManager) {
          // 添加过渡动画类到整个页面
          document.body.classList.add('theme-transitioning');
          document.documentElement.classList.add('theme-transitioning');

          window.appThemeManager.toggleTheme();
          const switchEl = this._container.querySelector('#profile-theme-switch');
          if (switchEl) {
            switchEl.classList.toggle('profile-switch--active',
              window.appThemeManager.getCurrentTheme() === 'dark');
          }

          // 主题切换时头像添加旋转动画
          const avatarEl = this._container.querySelector('#profile-avatar');
          if (avatarEl) {
            avatarEl.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            avatarEl.style.transform = 'rotate(360deg) scale(1.1)';
            setTimeout(() => {
              avatarEl.style.transform = '';
            }, 500);
          }

          // 移除过渡动画类
          setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
            document.documentElement.classList.remove('theme-transitioning');
          }, 600);
        }
      });
    }

    // 导出数据
    const exportBtn = this._container.querySelector('#profile-export');
    if (exportBtn) {
      this.bindEvent(exportBtn, 'click', () => this._exportData());
    }

    // 导入数据
    const importBtn = this._container.querySelector('#profile-import');
    if (importBtn) {
      this.bindEvent(importBtn, 'click', () => this._importData());
    }

    // 关于
    const aboutBtn = this._container.querySelector('#profile-about');
    if (aboutBtn) {
      this.bindEvent(aboutBtn, 'click', () => this._showAbout());
    }
  }

  _editNickname() {
    const modal = new Modal(document.getElementById('app'), this._eventBus);
    const content = document.createElement('div');
    content.innerHTML = `
      <input type="text" id="modal-nickname-input" class="record-diary__textarea" style="min-height:44px" placeholder="输入昵称" maxlength="${AppConstants.MAX_NICKNAME_LENGTH}">
    `;
    modal.show('修改昵称', content, () => {
      const input = document.querySelector('#modal-nickname-input');
      if (input && input.value.trim() && window.appStorage) {
        const settingsService = new SettingsService(window.appStorage, this._eventBus);
        settingsService.updateNickname(input.value.trim());
        this._loadSettings();
      }
    });
  }

  /**
   * 显示头像选择弹窗
   * 增强：使用PresetAvatars常量，选中弹跳动画
   */
  _showAvatarPicker() {
    const modal = new Modal(document.getElementById('app'), this._eventBus);

    // 使用全局预设头像列表
    const avatarList = typeof PresetAvatars !== 'undefined' ? PresetAvatars : [
      { id: 'default', emoji: '😊', name: '微笑' },
      { id: 'happy', emoji: '😄', name: '开心' },
      { id: 'cool', emoji: '😎', name: '酷' },
      { id: 'love', emoji: '🥰', name: '喜爱' },
      { id: 'cat', emoji: '🐱', name: '猫咪' },
      { id: 'panda', emoji: '🐼', name: '熊猫' },
    ];

    const content = document.createElement('div');
    content.className = 'profile-avatar-picker';

    // 获取当前头像
    let currentAvatar = 'default';
    if (window.appStorage) {
      const settings = window.appStorage.getSettings();
      currentAvatar = settings.avatar || 'default';
    }

    const grid = document.createElement('div');
    grid.className = 'profile-avatar-picker__grid';

    avatarList.forEach(avatar => {
      const item = document.createElement('div');
      item.className = `profile-avatar-picker__item${avatar.id === currentAvatar ? ' profile-avatar-picker__item--selected' : ''}`;
      item.textContent = avatar.emoji;
      item.title = avatar.name;

      item.addEventListener('click', () => {
        // 选中弹跳动画
        item.classList.add('anim-bounce');
        item.addEventListener('animationend', () => {
          item.classList.remove('anim-bounce');
        }, { once: true });

        // 更新选中状态
        grid.querySelectorAll('.profile-avatar-picker__item').forEach(el => {
          el.classList.remove('profile-avatar-picker__item--selected');
        });
        item.classList.add('profile-avatar-picker__item--selected');

        // 保存头像
        if (window.appStorage) {
          const settingsService = new SettingsService(window.appStorage, this._eventBus);
          settingsService.updateAvatar(avatar.id);
          this._loadSettings();
        }

        // 延迟关闭弹窗
        setTimeout(() => {
          modal.hide();
        }, 300);
      });

      grid.appendChild(item);
    });

    content.appendChild(grid);
    modal.show('选择头像', content);
  }

  /**
   * 显示每日目标设定弹窗
   */
  _showGoalPicker() {
    const modal = new Modal(document.getElementById('app'), this._eventBus);

    // 获取当前目标
    let currentGoal = 1;
    if (window.appStorage) {
      const settings = window.appStorage.getSettings();
      currentGoal = settings.dailyGoal || 1;
    }

    const content = document.createElement('div');
    content.className = 'profile-goal-picker';

    const desc = document.createElement('p');
    desc.style.cssText = 'font-size: var(--font-size-sm); color: var(--text-secondary); text-align: center; margin-bottom: var(--spacing-md);';
    desc.textContent = '选择每天的记录目标次数';
    content.appendChild(desc);

    const options = document.createElement('div');
    options.className = 'profile-goal-picker__options';

    for (let i = AppConstants.MIN_DAILY_GOAL; i <= AppConstants.MAX_DAILY_GOAL; i++) {
      const option = document.createElement('div');
      option.className = `profile-goal-picker__option${i === currentGoal ? ' profile-goal-picker__option--selected' : ''}`;
      option.textContent = i;

      option.addEventListener('click', () => {
        // 更新选中状态
        options.querySelectorAll('.profile-goal-picker__option').forEach(el => {
          el.classList.remove('profile-goal-picker__option--selected');
        });
        option.classList.add('profile-goal-picker__option--selected');

        // 保存目标
        if (window.appStorage) {
          const settingsService = new SettingsService(window.appStorage, this._eventBus);
          settingsService.updateDailyGoal(i);
          this._loadSettings();
        }

        // 延迟关闭弹窗
        setTimeout(() => {
          modal.hide();
        }, 300);
      });

      options.appendChild(option);
    }

    content.appendChild(options);
    modal.show('每日目标', content);
  }

  _exportData() {
    if (!window.appStorage) return;
    const exporter = new DataExporter(window.appStorage);
    const result = exporter.exportAllData();
    if (result.success && result.recordCount > 0) {
      const today = new Date().toISOString().substring(0, 10);
      exporter.downloadAsJson(result.data, `mood-data-${today}.json`);
      this.showToast(`导出成功，共${result.recordCount}条记录`, 'success');
    } else if (result.recordCount === 0) {
      this.showToast('暂无数据可导出', 'info');
    } else {
      this.showToast('导出失败', 'error');
    }
  }

  /**
   * 导入数据
   * 增强：增加导入进度提示
   */
  _importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file || !window.appStorage) return;

      // 显示导入进度提示
      this.showToast('正在导入数据...', 'info', 5000);

      try {
        const exporter = new DataExporter(window.appStorage);
        const result = await exporter.importFromJson(file);

        if (result.success) {
          let msg = `导入成功，共导入${result.importedCount}条记录`;
          if (result.skippedCount > 0) msg += `，跳过${result.skippedCount}条重复记录`;
          this.showToast(msg, 'success');
        } else {
          this.showToast(result.error || '导入失败', 'error');
        }
      } catch (err) {
        console.error('[ProfileView] 导入异常:', err);
        this.showToast('导入失败，请检查文件格式', 'error');
      }
    });
    input.click();
  }

  _showAbout() {
    const modal = new Modal(document.getElementById('app'), this._eventBus);
    const content = `
      <div class="profile-about">
        <h3 class="profile-about__name">${AppConstants.APP_NAME}</h3>
        <p class="profile-about__version">版本 ${AppConstants.APP_VERSION}</p>
        <p class="profile-about__desc">一款专为大学生设计的心情记录与追踪工具。<br>帮助你记录每日心情、回顾情绪变化、获取个性化洞察。</p>
      </div>
    `;
    modal.show('关于', content);
  }
}

window.ProfileView = ProfileView;

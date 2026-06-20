/**
 * 首页视图 — 大学生心情记录助手
 * 展示问候语、打卡天数、每日语录、小贴士、快捷心情按钮
 * 增强：心情动画反馈、彩纸动画、欢迎引导、打卡数字跳动、
 *       卡片stagger动画、数据刷新过渡效果、欢迎体验优化
 */

class HomeView extends BaseView {
  mount() {
    super.mount();
    this._renderPage();
    this._loadData();
    this._subscribeEvents();
    this._checkFirstTime();
    this._playCardStaggerAnimation();
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
        <!-- 问候区域 -->
        <div class="home-greeting mb-lg anim-card-stagger" style="animation-delay: 0ms">
          <h1 class="home-greeting__title" id="home-nickname">你好，同学 👋</h1>
          <p class="home-greeting__subtitle">今天心情怎么样？</p>
        </div>

        <!-- 打卡卡片 — 渐变背景 -->
        <div class="card home-checkin-card mb-md anim-card-stagger" style="animation-delay: 60ms">
          <div class="home-checkin">
            <div class="home-checkin__streak">
              <span class="home-checkin__streak-number" id="home-streak">0</span>
              <span class="home-checkin__streak-label">连续打卡</span>
            </div>
            <div class="home-checkin__progress">
              <div class="home-checkin__progress-text" id="home-progress-text">今日已记录 0/1 次</div>
              <div class="home-checkin__progress-bar">
                <div class="home-checkin__progress-fill" id="home-progress-fill" style="width: 0%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 每日语录卡片 — 左侧装饰线 -->
        <div class="card home-quote-card mb-md anim-card-stagger" style="animation-delay: 120ms">
          <div class="home-quote">
            <span class="home-quote__icon">💬</span>
            <p class="home-quote__content" id="home-quote"></p>
            <span class="home-quote__category" id="home-quote-category"></span>
          </div>
        </div>

        <!-- 小贴士卡片 — 图标+文字 -->
        <div class="card home-tip-card mb-md anim-card-stagger" style="animation-delay: 180ms">
          <div class="home-tip">
            <span class="home-tip__icon">💡</span>
            <span class="home-tip__content" id="home-tip"></span>
          </div>
        </div>

        <!-- 快捷心情按钮组 -->
        <div class="card home-quick-mood-card anim-card-stagger" style="animation-delay: 240ms">
          <h3 class="home-section-title">快捷记录</h3>
          <div class="home-quick-mood" id="home-quick-mood"></div>
        </div>
      </div>
    `;

    this._renderQuickMood();
  }

  /**
   * 播放卡片出现的stagger动画效果
   * 依次延迟让各卡片渐入，营造流畅的视觉体验
   */
  _playCardStaggerAnimation() {
    const cards = this._container.querySelectorAll('.anim-card-stagger');
    // 动画类已在HTML中设置，这里只需确保动画结束后清理
    cards.forEach(card => {
      card.addEventListener('animationend', () => {
        card.classList.remove('anim-card-stagger');
      }, { once: true });
    });
  }

  _renderQuickMood() {
    const container = this._container.querySelector('#home-quick-mood');
    if (!container) return;

    Object.values(MoodType).forEach(type => {
      const config = MOOD_COLOR_MAP[type];
      const btn = document.createElement('div');
      btn.className = 'home-quick-mood__btn';
      btn.dataset.mood = type;
      btn.innerHTML = `<span class="home-quick-mood__emoji">${config.icon}</span><span class="home-quick-mood__label">${config.label}</span>`;
      btn.addEventListener('click', () => this._handleQuickMood(type, btn));
      container.appendChild(btn);
    });
  }

  /**
   * 加载页面数据
   * 增强：数据刷新时添加过渡动画效果
   */
  _loadData() {
    // 给数据区域添加刷新过渡效果
    const pageContent = this._container.querySelector('.page-content');
    if (pageContent) {
      pageContent.classList.add('home-refreshing');
    }

    // 读取设置
    if (window.appStorage) {
      const settings = window.appStorage.getSettings();
      const nicknameEl = this._container.querySelector('#home-nickname');
      if (nicknameEl && settings.nickname) {
        nicknameEl.textContent = `你好，${settings.nickname} 👋`;
      }
    }

    // 打卡天数
    if (window.appStorage) {
      const checkinService = new CheckInService(window.appStorage);
      const streak = checkinService.getStreakDays();
      const progress = checkinService.getTodayProgress();

      const streakEl = this._container.querySelector('#home-streak');
      if (streakEl) {
        // 数字跳动动画
        const oldStreak = parseInt(streakEl.textContent, 10) || 0;
        streakEl.textContent = streak;
        if (streak !== oldStreak && streak > 0) {
          AnimationController.countBump(streakEl);
        }
      }

      const progressTextEl = this._container.querySelector('#home-progress-text');
      if (progressTextEl) {
        progressTextEl.textContent = progress.isCompleted
          ? '今日目标已达成 🎉'
          : `今日已记录 ${progress.current}/${progress.goal} 次`;
      }

      const progressFillEl = this._container.querySelector('#home-progress-fill');
      if (progressFillEl) {
        const percent = Math.min(100, Math.round((progress.current / progress.goal) * 100));
        progressFillEl.style.width = `${percent}%`;
      }
    }

    // 每日语录
    const quote = getQuoteByDate();
    const quoteEl = this._container.querySelector('#home-quote');
    if (quoteEl) quoteEl.textContent = `"${quote.content}"`;

    const quoteCategoryEl = this._container.querySelector('#home-quote-category');
    if (quoteCategoryEl) {
      const categoryLabels = { encouragement: '鼓励', reflection: '感悟', humor: '幽默' };
      quoteCategoryEl.textContent = categoryLabels[quote.category] || '';
    }

    // 小贴士
    if (window.appStorage) {
      const insightService = new InsightService(window.appStorage);
      const tipEl = this._container.querySelector('#home-tip');
      if (tipEl) tipEl.textContent = insightService.getDailyTip();
    }

    // 移除刷新过渡效果
    if (pageContent) {
      setTimeout(() => {
        pageContent.classList.remove('home-refreshing');
      }, 300);
    }
  }

  /**
   * 处理快捷心情记录
   * 增强：点击表情后播放对应心情动画 + 记录成功后彩纸动画
   */
  _handleQuickMood(moodType, btnElement) {
    if (!window.appStorage) return;

    // 1. 播放心情表情动画
    const emojiEl = btnElement?.querySelector('.home-quick-mood__emoji');
    if (emojiEl) {
      AnimationController.playMoodAnimation(emojiEl, moodType);
    }

    // 2. 按钮选中反馈
    if (btnElement) {
      btnElement.classList.add('home-quick-mood__btn--success');
      setTimeout(() => {
        btnElement.classList.remove('home-quick-mood__btn--success');
      }, 800);
    }

    // 3. 创建心情记录
    const moodService = new MoodService(window.appStorage, this._eventBus);
    const record = moodService.quickRecord(moodType);

    if (record) {
      // 4. 播放彩纸动画
      this._playConfetti();

      // 5. 显示成功提示
      this.showToast(`已记录：${MOOD_COLOR_MAP[moodType]?.label || '心情'}`, 'success');

      // 6. 刷新数据
      this._loadData();
    } else {
      this.showToast('记录失败，请检查存储空间', 'error');
    }
  }

  /**
   * 播放彩纸动画效果
   */
  _playConfetti() {
    // 创建彩纸容器
    let confettiContainer = document.querySelector('.home-confetti-container');
    if (!confettiContainer) {
      confettiContainer = document.createElement('div');
      confettiContainer.className = 'home-confetti-container';
      document.body.appendChild(confettiContainer);
    }

    // 使用AnimationController播放彩纸
    AnimationController.playConfetti(confettiContainer, 12);

    // 动画结束后清理容器
    setTimeout(() => {
      if (confettiContainer && confettiContainer.parentNode) {
        confettiContainer.parentNode.removeChild(confettiContainer);
      }
    }, 1200);
  }

  /**
   * 检查是否首次使用，显示欢迎引导
   */
  _checkFirstTime() {
    if (!window.appStorage) return;

    const hasSeenWelcome = localStorage.getItem('mh_welcome_shown');
    if (!hasSeenWelcome) {
      this._showWelcomeGuide();
      localStorage.setItem('mh_welcome_shown', '1');
    }
  }

  /**
   * 显示欢迎引导弹窗
   * 增强：更丰富的引导内容、步骤指示、动画效果
   */
  _showWelcomeGuide() {
    const overlay = document.createElement('div');
    overlay.className = 'home-welcome-overlay';
    overlay.innerHTML = `
      <div class="home-welcome">
        <div class="home-welcome__emoji anim-welcome-wave">👋</div>
        <h2 class="home-welcome__title">欢迎使用心情记录助手</h2>
        <p class="home-welcome__desc">每天记录你的心情，<br>了解自己的情绪变化，<br>获取个性化洞察与建议。</p>
        <div class="home-welcome__features">
          <div class="home-welcome__feature">
            <span class="home-welcome__feature-icon">✏️</span>
            <span class="home-welcome__feature-text">快捷记录</span>
          </div>
          <div class="home-welcome__feature">
            <span class="home-welcome__feature-icon">📅</span>
            <span class="home-welcome__feature-text">日历回顾</span>
          </div>
          <div class="home-welcome__feature">
            <span class="home-welcome__feature-icon">📊</span>
            <span class="home-welcome__feature-text">数据洞察</span>
          </div>
        </div>
        <button class="home-welcome__btn">开始使用</button>
      </div>
    `;

    // 点击按钮或遮罩关闭
    const closeBtn = overlay.querySelector('.home-welcome__btn');
    closeBtn.addEventListener('click', () => {
      // 按钮按压反馈
      AnimationController.buttonPress(closeBtn);
      overlay.classList.add('anim-fade-out');
      overlay.addEventListener('animationend', () => overlay.remove());
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.add('anim-fade-out');
        overlay.addEventListener('animationend', () => overlay.remove());
      }
    });

    document.body.appendChild(overlay);
  }

  _subscribeEvents() {
    this.subscribeEvent(AppEvents.MOOD_RECORDED, () => {
      this._loadData();
    });
    this.subscribeEvent(AppEvents.SETTINGS_UPDATED, (data) => {
      if (data.key === 'nickname') {
        const nicknameEl = this._container.querySelector('#home-nickname');
        if (nicknameEl) nicknameEl.textContent = `你好，${data.value} 👋`;
      }
    });
  }
}

window.HomeView = HomeView;

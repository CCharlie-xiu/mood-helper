/**
 * 心情记录页视图 — 大学生心情记录助手
 * 心情类型选择、强度调节、文字日记、标签选择、图片上传
 * 增强：选中放大弹跳动画、心情表情动画、成功动画、表单重置、
 *       表单各部分渐入动画
 */

class RecordView extends BaseView {
  mount() {
    super.mount();
    this._formData = {
      moodType: null,
      intensity: AppConstants.DEFAULT_INTENSITY,
      diaryText: '',
      weatherTag: null,
      activityTags: [],
      images: [],
    };
    this._isSubmitting = false;
    this._renderPage();
    this._playFormStaggerAnimation();
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
        <h2 class="record-page-title anim-card-stagger" style="animation-delay: 0ms">记录心情</h2>

        <!-- 心情类型选择 -->
        <div class="card mb-md anim-card-stagger" style="animation-delay: 50ms">
          <h3 class="mb-sm text-semibold" style="color: var(--text-primary)">选择心情</h3>
          <div class="record-mood-types" id="record-mood-types"></div>
        </div>

        <!-- 强度滑块 -->
        <div class="card mb-md" id="record-intensity-card" style="display:none;">
          <div class="record-intensity">
            <div class="record-intensity__header">
              <span class="record-intensity__title">心情强度</span>
              <span class="record-intensity__value" id="record-intensity-value">${this._formData.intensity}/5</span>
            </div>
            <div id="record-intensity-slider"></div>
          </div>
        </div>

        <!-- 文字日记 -->
        <div class="card mb-md anim-card-stagger" style="animation-delay: 150ms">
          <div class="record-diary">
            <h3 class="record-diary__title">文字日记</h3>
            <textarea class="record-diary__textarea" id="record-diary-text" placeholder="今天的心情..." maxlength="${AppConstants.MAX_DIARY_LENGTH}"></textarea>
            <div class="record-diary__counter" id="record-diary-counter">0/${AppConstants.MAX_DIARY_LENGTH}</div>
          </div>
        </div>

        <!-- 天气标签 -->
        <div class="card mb-md anim-card-stagger" style="animation-delay: 200ms">
          <h3 class="mb-sm text-semibold" style="color: var(--text-primary)">天气</h3>
          <div id="record-weather-tags"></div>
        </div>

        <!-- 活动标签 -->
        <div class="card mb-md anim-card-stagger" style="animation-delay: 250ms">
          <h3 class="mb-sm text-semibold" style="color: var(--text-primary)">活动</h3>
          <div id="record-activity-tags"></div>
        </div>

        <!-- 图片上传 -->
        <div class="card mb-md anim-card-stagger" style="animation-delay: 300ms">
          <h3 class="mb-sm text-semibold" style="color: var(--text-primary)">图片</h3>
          <div id="record-images"></div>
        </div>

        <!-- 提交按钮 -->
        <div class="record-submit anim-card-stagger" style="animation-delay: 350ms">
          <button class="record-submit__btn" id="record-submit-btn">提交记录</button>
        </div>
      </div>
    `;

    // 强度滑块初始隐藏（选择心情后才显示）
    const intensityCard = this._container.querySelector('#record-intensity-card');
    if (intensityCard) intensityCard.style.display = 'none';

    this._initMoodTypes();
    this._initDiary();
    this._initTags();
    this._initImages();
    this._initSubmit();
  }

  /**
   * 播放表单各部分的渐入stagger动画
   */
  _playFormStaggerAnimation() {
    const items = this._container.querySelectorAll('.anim-card-stagger');
    items.forEach(item => {
      item.addEventListener('animationend', () => {
        item.classList.remove('anim-card-stagger');
      }, { once: true });
    });
  }

  _initMoodTypes() {
    const container = this._container.querySelector('#record-mood-types');
    Object.values(MoodType).forEach(type => {
      const config = MOOD_COLOR_MAP[type];
      const item = document.createElement('div');
      item.className = 'record-mood-type';
      item.dataset.mood = type;
      item.innerHTML = `<span class="record-mood-type__emoji">${config.icon}</span><span class="record-mood-type__label">${config.label}</span>`;
      item.addEventListener('click', () => this._selectMood(type));
      container.appendChild(item);
    });
  }

  /**
   * 选择心情类型
   * 增强：选中项放大+弹跳动画、播放对应表情动画
   */
  _selectMood(type) {
    this._formData.moodType = type;

    // 更新UI — 选中状态
    this._container.querySelectorAll('.record-mood-type').forEach(el => {
      const isSelected = el.dataset.mood === type;
      el.classList.toggle('record-mood-type--selected', isSelected);

      // 播放选中项的表情动画
      if (isSelected) {
        const emojiEl = el.querySelector('.record-mood-type__emoji');
        if (emojiEl) {
          AnimationController.playMoodAnimation(emojiEl, type);
        }
      }
    });

    // 显示强度滑块（带动画）
    const intensityCard = this._container.querySelector('#record-intensity-card');
    if (intensityCard) {
      if (intensityCard.style.display === 'none') {
        intensityCard.style.display = 'block';
        intensityCard.classList.add('anim-pop-in-up');
        intensityCard.addEventListener('animationend', () => {
          intensityCard.classList.remove('anim-pop-in-up');
        }, { once: true });
      }
    }

    // 初始化滑块
    if (!this._slider) {
      const sliderContainer = this._container.querySelector('#record-intensity-slider');
      this._slider = new IntensitySlider(sliderContainer, this._eventBus);
      this._slider.render((val) => {
        this._formData.intensity = val;
        const valueEl = this._container.querySelector('#record-intensity-value');
        if (valueEl) valueEl.textContent = `${val}/5`;
      });
    }
  }

  _initDiary() {
    const textarea = this._container.querySelector('#record-diary-text');
    const counter = this._container.querySelector('#record-diary-counter');
    if (textarea && counter) {
      textarea.addEventListener('input', () => {
        this._formData.diaryText = textarea.value;
        const len = textarea.value.length;
        counter.textContent = `${len}/${AppConstants.MAX_DIARY_LENGTH}`;

        // 接近字数上限时变红
        if (len >= AppConstants.MAX_DIARY_LENGTH * 0.9) {
          counter.classList.add('record-diary__counter--warning');
        } else {
          counter.classList.remove('record-diary__counter--warning');
        }
      });
    }
  }

  _initTags() {
    // 天气标签（单选）
    const weatherContainer = this._container.querySelector('#record-weather-tags');
    const weatherTags = Object.values(WeatherTag).map(t => ({
      value: t,
      label: WEATHER_TAG_MAP[t]?.label || t,
      icon: WEATHER_TAG_MAP[t]?.icon || '',
    }));
    this._weatherSelector = new TagSelector(weatherContainer, this._eventBus);
    this._weatherSelector.render(weatherTags, 'single', (val) => {
      this._formData.weatherTag = val;
    });

    // 活动标签（多选）
    const activityContainer = this._container.querySelector('#record-activity-tags');
    const activityTags = Object.values(ActivityTag).map(t => ({
      value: t,
      label: ACTIVITY_TAG_MAP[t]?.label || t,
      icon: ACTIVITY_TAG_MAP[t]?.icon || '',
    }));
    this._activitySelector = new TagSelector(activityContainer, this._eventBus);
    this._activitySelector.render(activityTags, 'multi', (val) => {
      this._formData.activityTags = val;
    });
  }

  _initImages() {
    const container = this._container.querySelector('#record-images');
    this._imageUploader = new ImageUploader(container, this._eventBus);
    this._imageUploader.render((images) => {
      this._formData.images = images;
    });
  }

  _initSubmit() {
    const btn = this._container.querySelector('#record-submit-btn');
    if (btn) {
      btn.addEventListener('click', () => this._handleSubmit());
    }
  }

  /**
   * 处理提交
   * 增强：提交成功后播放成功动画再跳转、表单自动重置
   */
  _handleSubmit() {
    if (this._isSubmitting) return;

    if (!this._formData.moodType) {
      this.showToast('请先选择你的心情', 'warning');
      // 心情选择区域抖动提示
      const moodTypesEl = this._container.querySelector('#record-mood-types');
      if (moodTypesEl) {
        moodTypesEl.classList.add('anim-shake');
        moodTypesEl.addEventListener('animationend', () => {
          moodTypesEl.classList.remove('anim-shake');
        }, { once: true });
      }
      return;
    }

    this._isSubmitting = true;
    const btn = this._container.querySelector('#record-submit-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '提交中...';
    }

    if (window.appStorage) {
      const moodService = new MoodService(window.appStorage, this._eventBus);
      const record = moodService.createRecord(this._formData);

      if (record) {
        // 播放成功动画
        this._playSuccessAnimation(() => {
          this.showToast('记录成功！', 'success');
          // 重置表单
          this._resetForm();
          // 跳转首页
          setTimeout(() => {
            if (window.appRouter) window.appRouter.navigate('/home');
          }, 300);
        });
      } else {
        this.showToast('记录失败，请检查存储空间', 'error');
        this._isSubmitting = false;
        if (btn) {
          btn.disabled = false;
          btn.textContent = '提交记录';
        }
      }
    }
  }

  /**
   * 播放提交成功动画
   * @param {Function} callback - 动画完成后的回调
   */
  _playSuccessAnimation(callback) {
    // 按钮成功状态
    const btn = this._container.querySelector('#record-submit-btn');
    if (btn) {
      btn.classList.add('record-submit__btn--success');
      btn.textContent = '✓ 记录成功';
    }

    // 创建成功动画覆盖层
    const overlay = document.createElement('div');
    overlay.className = 'record-success-overlay';
    overlay.innerHTML = `
      <div class="record-success-content">
        <div class="record-success-content__emoji">${MOOD_COLOR_MAP[this._formData.moodType]?.icon || '✨'}</div>
        <div class="record-success-content__text">记录成功</div>
      </div>
    `;

    document.body.appendChild(overlay);

    // 播放彩纸动画
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'home-confetti-container';
    document.body.appendChild(confettiContainer);
    AnimationController.playConfetti(confettiContainer, 10);

    // 清理函数：移除覆盖层和彩纸容器
    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      if (overlay.parentNode) overlay.remove();
      if (confettiContainer.parentNode) confettiContainer.remove();
      if (callback) callback();
    };

    // 动画结束后清理并回调
    setTimeout(() => {
      overlay.classList.add('anim-fade-out');
      // 监听 overlay 自身的 fade-out 动画结束
      const handleAnimEnd = (e) => {
        // 只响应 overlay 自身的动画结束事件，忽略子元素冒泡
        if (e.target === overlay) {
          overlay.removeEventListener('animationend', handleAnimEnd);
          cleanup();
        }
      };
      overlay.addEventListener('animationend', handleAnimEnd);
      // 超时保护：500ms 后强制清理（fade-out 动画 200ms + 缓冲）
      setTimeout(cleanup, 500);
    }, 800);
  }

  /**
   * 重置表单
   * 增强：完整重置所有表单组件（标签选择器、图片上传器、滑块）
   */
  _resetForm() {
    this._formData = {
      moodType: null,
      intensity: AppConstants.DEFAULT_INTENSITY,
      diaryText: '',
      weatherTag: null,
      activityTags: [],
      images: [],
    };

    // 重置心情选择
    this._container.querySelectorAll('.record-mood-type').forEach(el => {
      el.classList.remove('record-mood-type--selected');
      el.style.transform = '';
    });

    // 隐藏强度滑块
    const intensityCard = this._container.querySelector('#record-intensity-card');
    if (intensityCard) intensityCard.style.display = 'none';

    // 重置日记
    const textarea = this._container.querySelector('#record-diary-text');
    if (textarea) textarea.value = '';
    const counter = this._container.querySelector('#record-diary-counter');
    if (counter) counter.textContent = `0/${AppConstants.MAX_DIARY_LENGTH}`;

    // 重置标签选择器
    if (this._weatherSelector) this._weatherSelector.reset();
    if (this._activitySelector) this._activitySelector.reset();

    // 重置图片上传器
    if (this._imageUploader) this._imageUploader.reset();

    // 重置提交按钮
    const btn = this._container.querySelector('#record-submit-btn');
    if (btn) {
      btn.disabled = false;
      btn.textContent = '提交记录';
      btn.classList.remove('record-submit__btn--success');
    }

    this._isSubmitting = false;
    this._slider = null;
  }
}

window.RecordView = RecordView;

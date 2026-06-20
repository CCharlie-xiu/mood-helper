/**
 * 强度滑块组件 — 大学生心情记录助手
 * 自定义滑块，范围1-5，默认值3
 * 轨道使用渐变色，拖动时实时显示数值和颜色变化反馈
 */

class IntensitySlider {
  /**
   * @param {HTMLElement} container - 组件容器
   * @param {EventBus} eventBus - 事件总线
   */
  constructor(container, eventBus) {
    this._container = container;
    this._eventBus = eventBus;
    this._value = AppConstants.DEFAULT_INTENSITY;
    this._onChange = null;
    this._isDragging = false;
    this._trackEl = null;
    this._fillEl = null;
    this._thumbEl = null;
    this._valueDisplay = null;
  }

  /**
   * 渲染滑块组件
   * @param {Function} onChange - 值变化回调函数，参数为当前值
   */
  render(onChange) {
    this._onChange = onChange;
    this._renderSlider();
  }

  /**
   * 获取当前值
   * @returns {number}
   */
  getValue() {
    return this._value;
  }

  /**
   * 设置当前值
   * @param {number} val - 强度值 (1-5)
   */
  setValue(val) {
    this._value = Math.max(AppConstants.MIN_INTENSITY, Math.min(AppConstants.MAX_INTENSITY, val));
    this._updateUI();
  }

  /**
   * 渲染自定义滑块
   * @private
   */
  _renderSlider() {
    const wrapper = document.createElement('div');
    wrapper.className = 'intensity-slider';

    // 数值显示
    const valueDisplay = document.createElement('div');
    valueDisplay.className = 'intensity-slider__value';
    valueDisplay.textContent = this._value;
    this._valueDisplay = valueDisplay;

    // 轨道容器
    const trackWrapper = document.createElement('div');
    trackWrapper.className = 'intensity-slider__track-wrapper';

    // 轨道
    const track = document.createElement('div');
    track.className = 'intensity-slider__track';
    this._trackEl = track;

    // 填充条
    const fill = document.createElement('div');
    fill.className = 'intensity-slider__fill';
    this._fillEl = fill;

    // 滑块
    const thumb = document.createElement('div');
    thumb.className = 'intensity-slider__thumb';
    this._thumbEl = thumb;

    track.appendChild(fill);
    track.appendChild(thumb);
    trackWrapper.appendChild(track);

    // 标签
    const labels = document.createElement('div');
    labels.className = 'intensity-slider__labels';
    labels.innerHTML = '<span>弱</span><span>强</span>';

    wrapper.appendChild(valueDisplay);
    wrapper.appendChild(trackWrapper);
    wrapper.appendChild(labels);

    this._container.innerHTML = '';
    this._container.appendChild(wrapper);

    // 初始化UI状态
    this._updateUI();

    // 绑定事件
    this._bindDragEvents(track, thumb);
  }

  /**
   * 绑定拖拽事件
   * @param {HTMLElement} track - 轨道元素
   * @param {HTMLElement} thumb - 滑块元素
   * @private
   */
  _bindDragEvents(track, thumb) {
    // 鼠标/触摸事件处理
    const handleStart = (e) => {
      e.preventDefault();
      this._isDragging = true;
      thumb.classList.add('intensity-slider__thumb--active');
      this._handleMove(e);
    };

    const handleMove = (e) => {
      if (!this._isDragging) return;
      this._handleMove(e);
    };

    const handleEnd = () => {
      if (!this._isDragging) return;
      this._isDragging = false;
      thumb.classList.remove('intensity-slider__thumb--active');
    };

    // 点击轨道直接定位
    track.addEventListener('mousedown', handleStart);
    track.addEventListener('touchstart', handleStart, { passive: false });

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove, { passive: false });

    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);

    // 保存事件引用以便清理
    this._moveHandler = handleMove;
    this._endHandler = handleEnd;
  }

  /**
   * 处理移动事件，计算新值
   * @param {Event} e - 鼠标或触摸事件
   * @private
   */
  _handleMove(e) {
    const track = this._trackEl;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;

    // 计算点击位置在轨道中的百分比
    let percent = (clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));

    // 将百分比映射到1-5的整数值
    const min = AppConstants.MIN_INTENSITY;
    const max = AppConstants.MAX_INTENSITY;
    const newValue = Math.round(min + percent * (max - min));

    if (newValue !== this._value) {
      this._value = newValue;
      this._updateUI();
      if (this._onChange) {
        this._onChange(this._value);
      }
    }
  }

  /**
   * 更新UI状态
   * @private
   */
  _updateUI() {
    if (!this._fillEl || !this._thumbEl || !this._valueDisplay) return;

    const min = AppConstants.MIN_INTENSITY;
    const max = AppConstants.MAX_INTENSITY;
    const percent = ((this._value - min) / (max - min)) * 100;

    // 更新填充条宽度
    this._fillEl.style.width = `${percent}%`;

    // 更新滑块位置
    this._thumbEl.style.left = `${percent}%`;

    // 更新数值显示
    this._valueDisplay.textContent = this._value;

    // 根据值更新颜色
    const color = this._getIntensityColor(this._value);
    this._fillEl.style.background = color;
    this._thumbEl.style.background = color;
    this._valueDisplay.style.color = color;

    // 更新轨道渐变
    this._trackEl.style.background = `linear-gradient(to right, ${color} ${percent}%, var(--slider-track) ${percent}%)`;
  }

  /**
   * 根据强度值获取对应颜色
   * @param {number} value - 强度值 (1-5)
   * @returns {string} CSS颜色值
   * @private
   */
  _getIntensityColor(value) {
    // 从弱到强的颜色渐变：浅蓝 → 蓝绿 → 黄 → 橙 → 红（天空蔚蓝风格）
    const colors = {
      1: '#5EC4A8',  // 蓝绿（平静）
      2: '#4A9EDE',  // 天蓝
      3: '#FFD93D',  // 黄
      4: '#F4A261',  // 橙
      5: '#E76F6F',  // 红
    };
    return colors[value] || '#4A9EDE';
  }

  /**
   * 销毁组件，清理事件监听
   */
  destroy() {
    if (this._moveHandler) {
      document.removeEventListener('mousemove', this._moveHandler);
      document.removeEventListener('touchmove', this._moveHandler);
    }
    if (this._endHandler) {
      document.removeEventListener('mouseup', this._endHandler);
      document.removeEventListener('touchend', this._endHandler);
    }
    this._container.innerHTML = '';
  }
}

/* 将 IntensitySlider 挂载到全局 */
window.IntensitySlider = IntensitySlider;

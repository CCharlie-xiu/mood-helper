/**
 * 标签选择器组件 — 大学生心情记录助手
 * 支持单选模式（天气标签）和多选模式（活动标签）
 * 选中/取消选中有视觉反馈
 */

class TagSelector {
  /**
   * @param {HTMLElement} container - 组件容器
   * @param {EventBus} eventBus - 事件总线
   */
  constructor(container, eventBus) {
    this._container = container;
    this._eventBus = eventBus;
    this._selected = [];
    this._mode = 'multi'; // 'single' | 'multi'
    this._onChange = null;
    this._wrapper = null;
    this._tagItems = []; // 保存标签元素引用
  }

  /**
   * 渲染标签选择器
   * @param {Array<{value: string, label: string, icon?: string}>} tags - 标签列表
   * @param {'single'|'multi'} mode - 选择模式：single=单选，multi=多选
   * @param {Function} onChange - 选择变化回调函数，参数为当前选中值
   */
  render(tags, mode, onChange) {
    this._mode = mode || 'multi';
    this._selected = [];
    this._onChange = onChange;
    this._tagItems = [];
    this._renderTags(tags);
  }

  /**
   * 获取当前选中值
   * 单选模式返回单个值或null，多选模式返回数组
   * @returns {string|null|Array<string>}
   */
  getSelected() {
    return this._mode === 'single' ? (this._selected[0] || null) : [...this._selected];
  }

  /**
   * 设置选中值
   * @param {string|Array<string>} value - 选中的值
   */
  setSelected(value) {
    if (this._mode === 'single') {
      this._selected = value ? [value] : [];
    } else {
      this._selected = Array.isArray(value) ? [...value] : [];
    }
    this._updateSelectedUI();
  }

  /**
   * 渲染标签列表
   * @param {Array<{value: string, label: string, icon?: string}>} tags - 标签列表
   * @private
   */
  _renderTags(tags) {
    const wrapper = document.createElement('div');
    wrapper.className = `tag-selector tag-selector--${this._mode}`;
    this._wrapper = wrapper;

    tags.forEach(tag => {
      const item = document.createElement('div');
      item.className = 'tag-selector__item';
      item.dataset.value = tag.value;

      // 图标（如果有）
      if (tag.icon) {
        const iconSpan = document.createElement('span');
        iconSpan.className = 'tag-selector__icon';
        iconSpan.textContent = tag.icon;
        item.appendChild(iconSpan);
      }

      // 标签文字
      const labelSpan = document.createElement('span');
      labelSpan.className = 'tag-selector__label';
      labelSpan.textContent = tag.label;
      item.appendChild(labelSpan);

      // 点击事件
      item.addEventListener('click', () => {
        this._handleTagClick(tag.value, item);
      });

      wrapper.appendChild(item);
      this._tagItems.push({ value: tag.value, element: item });
    });

    this._container.innerHTML = '';
    this._container.appendChild(wrapper);
  }

  /**
   * 处理标签点击
   * @param {string} value - 标签值
   * @param {HTMLElement} element - 标签元素
   * @private
   */
  _handleTagClick(value, element) {
    if (this._mode === 'single') {
      // 单选模式：点击新标签取消其他选中
      if (this._selected.includes(value)) {
        // 再次点击已选中的标签，取消选中
        this._selected = [];
        element.classList.remove('tag-selector__item--active');
      } else {
        // 选中新标签
        this._selected = [value];
        // 取消其他标签的选中状态
        this._tagItems.forEach(item => {
          item.element.classList.remove('tag-selector__item--active');
        });
        element.classList.add('tag-selector__item--active');
      }
    } else {
      // 多选模式：切换选中状态
      const idx = this._selected.indexOf(value);
      if (idx > -1) {
        this._selected.splice(idx, 1);
        element.classList.remove('tag-selector__item--active');
      } else {
        this._selected.push(value);
        element.classList.add('tag-selector__item--active');
      }
    }

    // 触发回调
    if (this._onChange) {
      this._onChange(this.getSelected());
    }
  }

  /**
   * 更新选中状态的UI
   * @private
   */
  _updateSelectedUI() {
    this._tagItems.forEach(item => {
      if (this._selected.includes(item.value)) {
        item.element.classList.add('tag-selector__item--active');
      } else {
        item.element.classList.remove('tag-selector__item--active');
      }
    });
  }

  /**
   * 重置选择
   */
  reset() {
    this._selected = [];
    this._updateSelectedUI();
    if (this._onChange) {
      this._onChange(this.getSelected());
    }
  }
}

/* 将 TagSelector 挂载到全局 */
window.TagSelector = TagSelector;

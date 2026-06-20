/**
 * 空状态组件 — 大学生心情记录助手
 * SVG矢量插图展示 + 引导性文字 + 可选操作按钮
 * show(illustration, message, actionText, onAction) 方法
 */

class EmptyState {
  /**
   * @param {HTMLElement} container - 组件容器
   */
  constructor(container) {
    this._container = container;
  }

  /**
   * 显示空状态
   * @param {string} illustration - 插图类型标识，支持：'mood'/'calendar'/'stats'/'search' 或自定义SVG
   * @param {string} message - 引导性文字
   * @param {string} [actionText] - 操作按钮文字（可选）
   * @param {Function} [onAction] - 操作按钮回调函数（可选）
   */
  show(illustration, message, actionText, onAction) {
    this._render(illustration, message, actionText, onAction);
  }

  /**
   * 渲染空状态（兼容旧接口）
   * @param {string} icon - 图标/插图标识
   * @param {string} text - 引导文字
   * @param {string} [actionText] - 操作按钮文字
   * @param {Function} [onAction] - 操作按钮回调
   */
  render(icon, text, actionText, onAction) {
    this._render(icon, text, actionText, onAction);
  }

  /**
   * 渲染空状态组件
   * @param {string} illustration - 插图类型
   * @param {string} message - 引导文字
   * @param {string} [actionText] - 操作按钮文字
   * @param {Function} [onAction] - 操作按钮回调
   * @private
   */
  _render(illustration, message, actionText, onAction) {
    const wrapper = document.createElement('div');
    wrapper.className = 'empty-state anim-appear';

    // SVG插图
    const iconEl = document.createElement('div');
    iconEl.className = 'empty-state__illustration';
    iconEl.innerHTML = this._getIllustration(illustration);
    wrapper.appendChild(iconEl);

    // 引导文字
    const textEl = document.createElement('p');
    textEl.className = 'empty-state__text';
    textEl.textContent = message || '暂无数据';
    wrapper.appendChild(textEl);

    // 操作按钮（可选）
    if (actionText && onAction) {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'btn btn--primary btn--sm empty-state__action';
      actionBtn.textContent = actionText;
      actionBtn.addEventListener('click', onAction);
      wrapper.appendChild(actionBtn);
    }

    this._container.innerHTML = '';
    this._container.appendChild(wrapper);
  }

  /**
   * 获取SVG插图
   * @param {string} type - 插图类型
   * @returns {string} SVG HTML字符串
   * @private
   */
  _getIllustration(type) {
    const illustrations = {
      /* 心情记录空状态 - 笔记本和笔 */
      mood: `
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="empty-state__svg">
          <circle cx="60" cy="60" r="50" fill="var(--bg-tertiary)" opacity="0.5"/>
          <rect x="30" y="25" width="45" height="55" rx="4" fill="var(--card-bg)" stroke="var(--border-color)" stroke-width="2"/>
          <line x1="38" y1="38" x2="67" y2="38" stroke="var(--border-color)" stroke-width="2" stroke-linecap="round"/>
          <line x1="38" y1="48" x2="67" y2="48" stroke="var(--border-color)" stroke-width="2" stroke-linecap="round"/>
          <line x1="38" y1="58" x2="55" y2="58" stroke="var(--border-color)" stroke-width="2" stroke-linecap="round"/>
          <circle cx="38" cy="68" r="3" fill="var(--accent)"/>
          <rect x="65" y="40" width="25" height="8" rx="2" fill="var(--accent)" opacity="0.8" transform="rotate(-45 65 40)"/>
          <polygon points="55,80 50,90 60,85" fill="var(--accent)"/>
        </svg>
      `,
      /* 日历空状态 - 日历图标 */
      calendar: `
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="empty-state__svg">
          <circle cx="60" cy="60" r="50" fill="var(--bg-tertiary)" opacity="0.5"/>
          <rect x="25" y="28" width="70" height="65" rx="8" fill="var(--card-bg)" stroke="var(--border-color)" stroke-width="2"/>
          <rect x="25" y="28" width="70" height="20" rx="8" fill="var(--accent)" opacity="0.3"/>
          <line x1="25" y1="48" x2="95" y2="48" stroke="var(--border-color)" stroke-width="2"/>
          <line x1="45" y1="22" x2="45" y2="34" stroke="var(--border-color)" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="75" y1="22" x2="75" y2="34" stroke="var(--border-color)" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="45" cy="62" r="4" fill="var(--accent)" opacity="0.6"/>
          <circle cx="60" cy="62" r="4" fill="var(--accent)" opacity="0.6"/>
          <circle cx="75" cy="62" r="4" fill="var(--accent)" opacity="0.6"/>
          <circle cx="45" cy="78" r="4" fill="var(--accent)" opacity="0.6"/>
          <circle cx="60" cy="78" r="4" fill="var(--accent)" opacity="0.6"/>
        </svg>
      `,
      /* 统计空状态 - 图表图标 */
      stats: `
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="empty-state__svg">
          <circle cx="60" cy="60" r="50" fill="var(--bg-tertiary)" opacity="0.5"/>
          <rect x="30" y="70" width="12" height="25" rx="3" fill="var(--accent)" opacity="0.5"/>
          <rect x="48" y="55" width="12" height="40" rx="3" fill="var(--accent)" opacity="0.7"/>
          <rect x="66" y="45" width="12" height="50" rx="3" fill="var(--accent)" opacity="0.85"/>
          <rect x="84" y="35" width="12" height="60" rx="3" fill="var(--accent)"/>
          <line x1="25" y1="95" x2="100" y2="95" stroke="var(--border-color)" stroke-width="2" stroke-linecap="round"/>
          <line x1="25" y1="30" x2="25" y2="95" stroke="var(--border-color)" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `,
      /* 搜索空状态 - 放大镜 */
      search: `
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="empty-state__svg">
          <circle cx="60" cy="60" r="50" fill="var(--bg-tertiary)" opacity="0.5"/>
          <circle cx="52" cy="52" r="22" fill="var(--card-bg)" stroke="var(--border-color)" stroke-width="3"/>
          <line x1="68" y1="68" x2="88" y2="88" stroke="var(--border-color)" stroke-width="4" stroke-linecap="round"/>
          <line x1="42" y1="52" x2="62" y2="52" stroke="var(--border-color)" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
        </svg>
      `,
    };

    // 如果是预定义类型，返回对应SVG；否则作为自定义内容
    return illustrations[type] || illustrations.mood;
  }
}

/* 将 EmptyState 挂载到全局 */
window.EmptyState = EmptyState;

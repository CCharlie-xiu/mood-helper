/**
 * 模态框组件 — 大学生心情记录助手
 * 半透明黑色遮罩，底部滑入弹出动画
 * show(title, content, onConfirm) 方法
 * 支持点击遮罩或关闭按钮关闭
 */

class Modal {
  /**
   * @param {HTMLElement} container - 组件容器
   * @param {EventBus} eventBus - 事件总线
   */
  constructor(container, eventBus) {
    this._container = container;
    this._eventBus = eventBus;
    this._overlay = null;
    this._onConfirm = null;
    this._onClose = null;
  }

  /**
   * 显示模态框
   * @param {string} title - 模态框标题
   * @param {string|HTMLElement} content - 模态框内容，支持HTML字符串或DOM元素
   * @param {Function} [onConfirm] - 确认回调函数
   * @param {Object} [options] - 可选配置
   * @param {string} [options.confirmText='确定'] - 确认按钮文字
   * @param {string} [options.cancelText='取消'] - 取消按钮文字
   * @param {boolean} [options.showCancel=true] - 是否显示取消按钮
   */
  show(title, content, onConfirm, options = {}) {
    this._onConfirm = onConfirm;
    this._render(title, content, options);
  }

  /**
   * 隐藏模态框
   */
  hide() {
    if (!this._overlay) return;

    const overlay = this._overlay;
    const modalContent = overlay.querySelector('.modal-content');

    // 播放退出动画
    if (modalContent) {
      modalContent.classList.remove('anim-slide-up');
      modalContent.classList.add('anim-slide-down-out');
    }
    overlay.classList.remove('anim-fade-in');
    overlay.classList.add('anim-fade-out');

    const handleAnimationEnd = () => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    };
    overlay.addEventListener('animationend', handleAnimationEnd, { once: true });

    // 安全兜底：300ms后强制移除
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 350);

    this._overlay = null;

    // 触发关闭回调
    if (this._onClose) {
      this._onClose();
      this._onClose = null;
    }
  }

  /**
   * 渲染模态框
   * @param {string} title - 标题
   * @param {string|HTMLElement} content - 内容
   * @param {Object} options - 配置选项
   * @private
   */
  _render(title, content, options) {
    // 移除已有模态框
    const existingOverlay = this._container.querySelector('.modal-overlay');
    if (existingOverlay) existingOverlay.remove();

    const confirmText = options.confirmText || '确定';
    const cancelText = options.cancelText || '取消';
    const showCancel = options.showCancel !== false;

    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay anim-fade-in';
    this._overlay = overlay;

    // 创建内容区
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content anim-slide-up';

    // 把手
    const handle = document.createElement('div');
    handle.className = 'modal-handle';

    // 头部（标题 + 关闭按钮）
    const header = document.createElement('div');
    header.className = 'modal-header';

    const titleEl = document.createElement('h3');
    titleEl.className = 'modal-title';
    titleEl.textContent = title;

    const closeBtn = document.createElement('span');
    closeBtn.className = 'modal-close';
    closeBtn.textContent = '×';

    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    // 内容区
    const body = document.createElement('div');
    body.className = 'modal-body';
    if (typeof content === 'string') {
      body.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      body.appendChild(content);
    }

    // 底部按钮区
    const footer = document.createElement('div');
    footer.className = 'modal-footer';

    if (showCancel) {
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn btn--default modal-btn-cancel';
      cancelBtn.textContent = cancelText;
      cancelBtn.addEventListener('click', () => this.hide());
      footer.appendChild(cancelBtn);
    }

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btn--primary modal-btn-confirm';
    confirmBtn.textContent = confirmText;
    confirmBtn.addEventListener('click', () => {
      if (this._onConfirm) {
        this._onConfirm();
      }
      this.hide();
    });
    footer.appendChild(confirmBtn);

    // 组装
    modalContent.appendChild(handle);
    modalContent.appendChild(header);
    modalContent.appendChild(body);
    modalContent.appendChild(footer);
    overlay.appendChild(modalContent);

    // 事件绑定
    // 点击遮罩关闭
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.hide();
    });

    // 点击关闭按钮
    closeBtn.addEventListener('click', () => this.hide());

    this._container.appendChild(overlay);
  }

  /**
   * 设置关闭回调
   * @param {Function} callback - 关闭回调函数
   */
  onClose(callback) {
    this._onClose = callback;
  }
}

/* 将 Modal 挂载到全局 */
window.Modal = Modal;

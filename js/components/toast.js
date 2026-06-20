/**
 * 提示消息组件 — 大学生心情记录助手
 * 页面顶部居中展示，支持4种类型：success/error/info/warning
 * 顶部滑入→停留→顶部滑出动画
 */

class Toast {
  /**
   * 显示提示消息
   * @param {string} message - 提示文字
   * @param {'success'|'error'|'info'|'warning'} [type='info'] - 提示类型
   * @param {number} [duration=2000] - 展示时长（毫秒）
   */
  static show(message, type = 'info', duration = 2000) {
    // 获取或创建toast容器
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = `toast toast--${type} anim-toast-in`;

    // 图标
    const icon = document.createElement('span');
    icon.className = 'toast__icon';
    icon.textContent = Toast._getIcon(type);

    // 文字
    const text = document.createElement('span');
    text.className = 'toast__text';
    text.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(text);
    container.appendChild(toast);

    // 定时移除
    const timer = setTimeout(() => {
      Toast._dismiss(toast);
    }, duration);

    // 鼠标悬停时暂停倒计时
    toast.addEventListener('mouseenter', () => {
      clearTimeout(timer);
    });

    toast.addEventListener('mouseleave', () => {
      const newTimer = setTimeout(() => {
        Toast._dismiss(toast);
      }, 800);
      toast._dismissTimer = newTimer;
    });

    // 点击立即关闭
    toast.addEventListener('click', () => {
      clearTimeout(timer);
      if (toast._dismissTimer) clearTimeout(toast._dismissTimer);
      Toast._dismiss(toast);
    });
  }

  /**
   * 关闭toast
   * @param {HTMLElement} toast - toast元素
   * @private
   */
  static _dismiss(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.remove('anim-toast-in');
    toast.classList.add('anim-toast-out');
    toast.addEventListener('animationend', () => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, { once: true });
  }

  /**
   * 获取提示类型对应的图标
   * @param {string} type - 提示类型
   * @returns {string}
   * @private
   */
  static _getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
      warning: '⚠',
    };
    return icons[type] || icons.info;
  }

  /**
   * 快捷方法：成功提示
   * @param {string} message - 提示文字
   * @param {number} [duration=2000] - 展示时长
   */
  static success(message, duration = 2000) {
    Toast.show(message, 'success', duration);
  }

  /**
   * 快捷方法：错误提示
   * @param {string} message - 提示文字
   * @param {number} [duration=2000] - 展示时长
   */
  static error(message, duration = 2000) {
    Toast.show(message, 'error', duration);
  }

  /**
   * 快捷方法：信息提示
   * @param {string} message - 提示文字
   * @param {number} [duration=2000] - 展示时长
   */
  static info(message, duration = 2000) {
    Toast.show(message, 'info', duration);
  }

  /**
   * 快捷方法：警告提示
   * @param {string} message - 提示文字
   * @param {number} [duration=2000] - 展示时长
   */
  static warning(message, duration = 2000) {
    Toast.show(message, 'warning', duration);
  }
}

/* 将 Toast 挂载到全局 */
window.Toast = Toast;

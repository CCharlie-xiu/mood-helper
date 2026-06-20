/**
 * 动画控制器 — 大学生心情记录助手
 * 封装心情表情动画、记录成功动画、页面过渡动画、面板弹出/收起动画、卡片stagger动画
 * 所有方法通过 window.appAnimationController 全局访问
 */

class AnimationController {
  /**
   * 播放心情表情动画
   * 根据心情类型选择对应CSS动画类：
   *   happy → anim-bounce
   *   calm → anim-float
   *   anxious → anim-shake
   *   sad → anim-sink
   *   angry → anim-pulse
   * @param {HTMLElement} element - 目标元素
   * @param {string} moodType - 心情类型 (MoodType枚举值)
   * @param {number} [duration=600] - 动画时长（毫秒）
   */
  static playMoodAnimation(element, moodType, duration = 600) {
    if (!element) return;

    const animClass = MOOD_ANIMATION_MAP[moodType];
    if (!animClass) return;

    // 移除之前的动画类
    Object.values(MOOD_ANIMATION_MAP).forEach(cls => element.classList.remove(cls));

    // 强制重排以重新触发动画
    void element.offsetWidth;

    // 添加动画类
    element.classList.add(animClass);

    // 动画结束后移除类名（一次性动画，calm的float是持续动画不自动移除）
    if (moodType !== MoodType.CALM) {
      setTimeout(() => {
        element.classList.remove(animClass);
      }, duration);
    }
  }

  /**
   * 播放记录成功动画（success-pop + confetti）
   * @param {HTMLElement} element - 目标元素（如提交按钮）
   * @param {HTMLElement} [confettiContainer] - 彩纸动画容器，不传则创建临时容器
   */
  static playSuccessAnimation(element, confettiContainer = null) {
    if (!element) return;

    // 播放成功弹出动画
    element.classList.add('anim-success-pop');
    element.addEventListener('animationend', () => {
      element.classList.remove('anim-success-pop');
    }, { once: true });

    // 播放彩纸动画
    if (!confettiContainer) {
      // 创建临时容器
      confettiContainer = document.createElement('div');
      confettiContainer.className = 'home-confetti-container';
      document.body.appendChild(confettiContainer);
      AnimationController.playConfetti(confettiContainer, 10);
      // 动画结束后清理
      setTimeout(() => {
        if (confettiContainer && confettiContainer.parentNode) {
          confettiContainer.parentNode.removeChild(confettiContainer);
        }
      }, 1200);
    } else {
      AnimationController.playConfetti(confettiContainer, 10);
    }
  }

  /**
   * 播放彩纸动画
   * @param {HTMLElement} container - 容器元素
   * @param {number} [count=8] - 彩纸数量
   */
  static playConfetti(container, count = 8) {
    if (!container) return;

    const colors = ['#FFD93D', '#5EC4A8', '#F4A261', '#6BA3D6', '#E76F6F'];

    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: ${colors[i % colors.length]};
        top: 50%;
        left: ${30 + Math.random() * 40}%;
        pointer-events: none;
        z-index: 10;
      `;

      // 交替使用左右飘落动画
      const animClass = i % 3 === 0 ? 'anim-confetti' : (i % 3 === 1 ? 'anim-confetti-left' : 'anim-confetti-right');
      confetti.classList.add(animClass);

      container.style.position = 'relative';
      container.appendChild(confetti);

      // 动画结束后移除元素
      confetti.addEventListener('animationend', () => {
        confetti.remove();
      });
    }
  }

  /**
   * 播放页面过渡动画（与Router集成）
   * @param {HTMLElement} element - 页面容器元素
   * @param {'fadeIn'|'slideLeft'|'slideRight'} type - 过渡类型
   * @returns {Promise<void>}
   */
  static playPageTransition(element, type = 'fadeIn') {
    return new Promise((resolve) => {
      if (!element) { resolve(); return; }

      const animMap = {
        fadeIn: 'anim-fade-in',
        slideLeft: 'anim-slide-left',
        slideRight: 'anim-slide-right',
      };

      const animClass = animMap[type] || animMap.fadeIn;
      element.classList.add(animClass);

      const handleEnd = () => {
        element.classList.remove(animClass);
        element.removeEventListener('animationend', handleEnd);
        resolve();
      };

      element.addEventListener('animationend', handleEnd);

      // 超时保护
      setTimeout(() => {
        element.classList.remove(animClass);
        resolve();
      }, 300);
    });
  }

  /**
   * 播放面板弹出动画
   * @param {HTMLElement} panel - 面板元素
   */
  static slideUp(panel) {
    if (!panel) return;
    panel.classList.remove('anim-slide-down-out');
    panel.classList.add('anim-slide-up');
  }

  /**
   * 播放面板收起动画
   * @param {HTMLElement} panel - 面板元素
   * @returns {Promise<void>}
   */
  static slideDown(panel) {
    return new Promise((resolve) => {
      if (!panel) { resolve(); return; }

      panel.classList.remove('anim-slide-up');
      panel.classList.add('anim-slide-down-out');

      const handleEnd = () => {
        panel.classList.remove('anim-slide-down-out');
        panel.removeEventListener('animationend', handleEnd);
        resolve();
      };

      panel.addEventListener('animationend', handleEnd);

      // 超时保护
      setTimeout(resolve, 250);
    });
  }

  /**
   * 播放卡片stagger出现动画
   * 为一组卡片元素依次添加出现动画，形成错落出现效果
   * @param {NodeList|Array<HTMLElement>} cards - 卡片元素列表
   * @param {number} [delay=60] - 每个卡片之间的延迟（毫秒）
   */
  static staggerCards(cards, delay = 60) {
    if (!cards || cards.length === 0) return;

    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(16px)';

      setTimeout(() => {
        card.style.transition = 'opacity 400ms ease-out, transform 400ms ease-out';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';

        // 动画完成后清除内联样式，避免影响后续交互
        setTimeout(() => {
          card.style.transition = '';
          card.style.opacity = '';
          card.style.transform = '';
        }, 450);
      }, index * delay);
    });
  }

  /**
   * 播放按钮按压反馈
   * @param {HTMLElement} button - 按钮元素
   */
  static buttonPress(button) {
    if (!button) return;
    button.classList.add('anim-btn-press');
    button.addEventListener('animationend', () => {
      button.classList.remove('anim-btn-press');
    }, { once: true });
  }

  /**
   * 播放数字跳动动画
   * @param {HTMLElement} element - 数字元素
   */
  static countBump(element) {
    if (!element) return;
    element.classList.add('anim-count-bump');
    element.addEventListener('animationend', () => {
      element.classList.remove('anim-count-bump');
    }, { once: true });
  }

  /**
   * 创建实例方法（用于 window.appAnimationController 全局访问）
   * 实例方法代理所有静态方法，方便外部调用
   */
  playMoodAnimation(element, moodType, duration) {
    return AnimationController.playMoodAnimation(element, moodType, duration);
  }

  playSuccessAnimation(element, confettiContainer) {
    return AnimationController.playSuccessAnimation(element, confettiContainer);
  }

  playConfetti(container, count) {
    return AnimationController.playConfetti(container, count);
  }

  playPageTransition(element, type) {
    return AnimationController.playPageTransition(element, type);
  }

  slideUp(panel) {
    return AnimationController.slideUp(panel);
  }

  slideDown(panel) {
    return AnimationController.slideDown(panel);
  }

  staggerCards(cards, delay) {
    return AnimationController.staggerCards(cards, delay);
  }

  buttonPress(button) {
    return AnimationController.buttonPress(button);
  }

  countBump(element) {
    return AnimationController.countBump(element);
  }
}

/* 将 AnimationController 挂载到全局 */
window.AnimationController = AnimationController;

/* 创建全局实例，方便通过 window.appAnimationController 访问 */
window.appAnimationController = new AnimationController();

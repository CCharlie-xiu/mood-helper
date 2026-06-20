/**
 * 心情选择器组件 — 大学生心情记录助手
 * 底部弹出面板，展示5种心情类型
 */

class MoodPicker {
  constructor(container, eventBus) {
    this._container = container;
    this._eventBus = eventBus;
    this._onSelect = null;
  }

  show(onSelect) {
    this._onSelect = onSelect;
    this._render();
  }

  hide() {
    const panel = this._container.querySelector('.mood-picker-panel');
    if (panel) {
      panel.classList.add('anim-slide-down-out');
      panel.addEventListener('animationend', () => panel.remove(), { once: true });
    }
  }

  _render() {
    const panel = document.createElement('div');
    panel.className = 'mood-picker-panel anim-slide-up';

    const content = document.createElement('div');
    content.className = 'modal-content';

    const picker = document.createElement('div');
    picker.className = 'mood-picker';

    Object.values(MoodType).forEach(type => {
      const config = MOOD_COLOR_MAP[type];
      const item = document.createElement('div');
      item.className = 'mood-picker__item';
      item.innerHTML = `<span class="mood-picker__emoji">${config.icon}</span><span class="mood-picker__label">${config.label}</span>`;
      item.addEventListener('click', () => {
        if (this._onSelect) this._onSelect(type);
        this.hide();
      });
      picker.appendChild(item);
    });

    content.appendChild(picker);
    panel.appendChild(content);
    this._container.appendChild(panel);
  }
}

window.MoodPicker = MoodPicker;
/**
 * 日期详情面板组件 — 大学生心情记录助手
 * 底部弹出面板展示某日所有心情记录
 * 展示每条记录的时间、心情类型、强度、天气、活动、日记内容
 * 支持下拉手势关闭
 */

class DateDetail {
  /**
   * @param {HTMLElement} container - 组件容器
   * @param {EventBus} eventBus - 事件总线
   */
  constructor(container, eventBus) {
    this._container = container;
    this._eventBus = eventBus;
    this._panel = null;
    this._touchStartY = 0;
    this._touchCurrentY = 0;
    this._isSwiping = false;
  }

  /**
   * 显示日期详情面板
   * @param {string} date - 日期字符串 (YYYY-MM-DD)
   * @param {Array} records - 该日的心情记录列表
   */
  show(date, records) {
    this._render(date, records || []);
  }

  /**
   * 隐藏日期详情面板
   */
  hide() {
    if (!this._panel) return;
    const content = this._panel.querySelector('.modal-content');
    if (content) {
      content.classList.remove('anim-slide-up');
      content.classList.add('anim-slide-down-out');
    }
    this._panel.classList.remove('anim-fade-in');
    this._panel.classList.add('anim-fade-out');

    const panel = this._panel;
    const handleAnimationEnd = () => {
      if (panel && panel.parentNode) {
        panel.parentNode.removeChild(panel);
      }
    };
    this._panel.addEventListener('animationend', handleAnimationEnd, { once: true });
    // 安全兜底：300ms后强制移除
    setTimeout(() => {
      if (panel && panel.parentNode) {
        panel.parentNode.removeChild(panel);
      }
    }, 350);
    this._panel = null;
  }

  /**
   * 渲染日期详情面板
   * @param {string} date - 日期字符串
   * @param {Array} records - 心情记录列表
   * @private
   */
  _render(date, records) {
    // 移除已有面板
    const existingPanel = this._container.querySelector('.date-detail-panel');
    if (existingPanel) existingPanel.remove();

    const panel = document.createElement('div');
    panel.className = 'date-detail-panel modal-overlay anim-fade-in';
    this._panel = panel;

    const content = document.createElement('div');
    content.className = 'modal-content anim-slide-up';

    // 拖拽把手
    const handle = document.createElement('div');
    handle.className = 'modal-handle';

    // 日期标题
    const header = document.createElement('div');
    header.className = 'date-detail__header';
    const formattedDate = this._formatDateDisplay(date);
    header.innerHTML = `<span class="date-detail__date">${formattedDate}</span>`;

    // 记录列表
    const detail = document.createElement('div');
    detail.className = 'date-detail';

    if (records.length === 0) {
      // 无记录时的空状态
      const emptyEl = document.createElement('div');
      emptyEl.className = 'date-detail__empty';
      emptyEl.textContent = '这一天还没有记录哦，去记录一下吧';
      detail.appendChild(emptyEl);
    } else {
      records.forEach(record => {
        const config = MOOD_COLOR_MAP[record.moodType] || {};
        const recordEl = document.createElement('div');
        recordEl.className = 'date-detail__record';

        // 心情信息行
        const moodRow = document.createElement('div');
        moodRow.className = 'date-detail__mood';
        moodRow.innerHTML = `
          <span class="date-detail__emoji">${config.icon || ''}</span>
          <span class="date-detail__mood-label" style="color: ${config.primary || 'inherit'}">${config.label || record.moodType}</span>
          <span class="date-detail__intensity">强度: ${record.intensity}/5</span>
        `;

        // 天气和活动标签行
        const tagsRow = document.createElement('div');
        tagsRow.className = 'date-detail__tags';

        if (record.weatherTag) {
          const weatherConfig = WEATHER_TAG_MAP[record.weatherTag];
          if (weatherConfig) {
            const weatherTag = document.createElement('span');
            weatherTag.className = 'date-detail__tag date-detail__tag--weather';
            weatherTag.textContent = `${weatherConfig.icon} ${weatherConfig.label}`;
            tagsRow.appendChild(weatherTag);
          }
        }

        if (record.activityTags && record.activityTags.length > 0) {
          record.activityTags.forEach(tag => {
            const activityConfig = ACTIVITY_TAG_MAP[tag];
            if (activityConfig) {
              const activityTag = document.createElement('span');
              activityTag.className = 'date-detail__tag date-detail__tag--activity';
              activityTag.textContent = `${activityConfig.icon} ${activityConfig.label}`;
              tagsRow.appendChild(activityTag);
            }
          });
        }

        // 日记内容
        const diaryEl = document.createElement('div');
        if (record.diaryText) {
          diaryEl.className = 'date-detail__diary';
          diaryEl.textContent = record.diaryText;
        }

        // 时间
        const timeEl = document.createElement('div');
        timeEl.className = 'date-detail__time';
        timeEl.textContent = record.createdAt.substring(11, 16);

        recordEl.appendChild(moodRow);
        if (tagsRow.children.length > 0) {
          recordEl.appendChild(tagsRow);
        }
        if (record.diaryText) {
          recordEl.appendChild(diaryEl);
        }
        recordEl.appendChild(timeEl);

        detail.appendChild(recordEl);
      });
    }

    content.appendChild(handle);
    content.appendChild(header);
    content.appendChild(detail);
    panel.appendChild(content);

    // 点击遮罩关闭
    panel.addEventListener('click', (e) => {
      if (e.target === panel) this.hide();
    });

    // 绑定下拉手势关闭
    this._bindSwipeToClose(content);

    this._container.appendChild(panel);
  }

  /**
   * 绑定下拉手势关闭
   * @param {HTMLElement} content - 面板内容元素
   * @private
   */
  _bindSwipeToClose(content) {
    content.addEventListener('touchstart', (e) => {
      this._touchStartY = e.touches[0].clientY;
      this._isSwiping = true;
    }, { passive: true });

    content.addEventListener('touchmove', (e) => {
      if (!this._isSwiping) return;
      this._touchCurrentY = e.touches[0].clientY;
      const deltaY = this._touchCurrentY - this._touchStartY;

      // 只处理向下拉的情况
      if (deltaY > 0) {
        // 跟随手指移动
        content.style.transform = `translateY(${deltaY * 0.5}px)`;
        content.style.transition = 'none';
      }
    }, { passive: true });

    content.addEventListener('touchend', () => {
      if (!this._isSwiping) return;
      this._isSwiping = false;

      const deltaY = this._touchCurrentY - this._touchStartY;

      // 恢复过渡
      content.style.transition = '';

      // 如果下拉超过80px，关闭面板
      if (deltaY > 80) {
        this.hide();
      } else {
        // 否则回弹
        content.style.transform = '';
      }

      this._touchStartY = 0;
      this._touchCurrentY = 0;
    }, { passive: true });
  }

  /**
   * 格式化日期显示
   * @param {string} dateStr - YYYY-MM-DD 格式日期
   * @returns {string} 格式化后的日期显示文本
   * @private
   */
  _formatDateDisplay(dateStr) {
    try {
      const date = new Date(dateStr);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const weekDay = weekDays[date.getDay()];
      return `${month}月${day}日 ${weekDay}`;
    } catch (e) {
      return dateStr;
    }
  }
}

/* 将 DateDetail 挂载到全局 */
window.DateDetail = DateDetail;

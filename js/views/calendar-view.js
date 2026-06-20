/**
 * 日历回顾页视图 — 大学生心情记录助手
 * 月历视图、心情颜色标记、日期详情、月份切换
 * 增强：左右滑动手势、月份切换动画、日期点击效果、
 *       回到今天脉冲动画、心情圆点呼吸动画
 */

class CalendarView extends BaseView {
  mount() {
    super.mount();
    const now = new Date();
    this._currentYear = now.getFullYear();
    this._currentMonth = now.getMonth() + 1;
    this._touchStartX = 0;
    this._touchStartY = 0;
    this._isSwiping = false;
    this._renderPage();
    this._loadMonthData();
    this._initSwipeGesture();
    this._showSwipeHint();
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
        <!-- 月份导航 -->
        <div class="calendar-nav">
          <div class="calendar-nav__arrow" id="cal-prev">◀</div>
          <span class="calendar-nav__title" id="cal-title">${this._currentYear}年${this._currentMonth}月</span>
          <div class="calendar-nav__today" id="cal-today">今天</div>
          <div class="calendar-nav__arrow" id="cal-next">▶</div>
        </div>

        <!-- 星期标题 -->
        <div class="calendar-weekdays">
          <div class="calendar-weekday">日</div>
          <div class="calendar-weekday">一</div>
          <div class="calendar-weekday">二</div>
          <div class="calendar-weekday">三</div>
          <div class="calendar-weekday">四</div>
          <div class="calendar-weekday">五</div>
          <div class="calendar-weekday">六</div>
        </div>

        <!-- 日历网格 -->
        <div class="calendar-grid-wrapper">
          <div class="calendar-grid" id="cal-grid"></div>
        </div>
      </div>
    `;

    this._bindNavEvents();
    this._updateTodayButton();
  }

  _bindNavEvents() {
    const prevBtn = this._container.querySelector('#cal-prev');
    const nextBtn = this._container.querySelector('#cal-next');
    const todayBtn = this._container.querySelector('#cal-today');

    if (prevBtn) {
      this.bindEvent(prevBtn, 'click', () => {
        this._switchMonth('prev');
      });
    }

    if (nextBtn) {
      this.bindEvent(nextBtn, 'click', () => {
        this._switchMonth('next');
      });
    }

    if (todayBtn) {
      this.bindEvent(todayBtn, 'click', () => {
        const now = new Date();
        this._currentYear = now.getFullYear();
        this._currentMonth = now.getMonth() + 1;
        this._loadMonthData('right'); // 回到当前月份，从右滑入
      });
    }
  }

  /**
   * 切换月份
   * @param {'prev'|'next'} direction - 切换方向
   */
  _switchMonth(direction) {
    if (!window.appStorage) return;

    const calService = new CalendarService(window.appStorage);

    if (direction === 'prev') {
      // 检查是否已到最早月份
      const prev = calService.getPreviousMonth(this._currentYear, this._currentMonth);
      this._currentYear = prev.year;
      this._currentMonth = prev.month;
      this._loadMonthData('right'); // 上一月从右滑入
    } else {
      // 检查是否已到未来月份
      const next = calService.getNextMonth(this._currentYear, this._currentMonth);
      if (calService.isFutureMonth(next.year, next.month)) {
        this.showToast('不能查看未来月份', 'info');
        return;
      }
      this._currentYear = next.year;
      this._currentMonth = next.month;
      this._loadMonthData('left'); // 下一月从左滑入
    }
  }

  /**
   * 更新"今天"按钮的高亮效果
   * 增强：非当前月份时添加脉冲动画
   */
  _updateTodayButton() {
    const todayBtn = this._container.querySelector('#cal-today');
    if (!todayBtn) return;

    const now = new Date();
    const isCurrentMonth = this._currentYear === now.getFullYear() && this._currentMonth === now.getMonth() + 1;

    if (isCurrentMonth) {
      todayBtn.classList.remove('calendar-nav__today--highlight');
    } else {
      todayBtn.classList.add('calendar-nav__today--highlight');
    }
  }

  /**
   * 初始化左右滑动手势
   * 规则：水平距离>50px且大于垂直距离时触发
   * 左滑→下月，右滑→上月
   */
  _initSwipeGesture() {
    const gridWrapper = this._container.querySelector('.calendar-grid-wrapper');
    if (!gridWrapper) return;

    this.bindEvent(gridWrapper, 'touchstart', (e) => {
      this._touchStartX = e.touches[0].clientX;
      this._touchStartY = e.touches[0].clientY;
      this._isSwiping = false;
    });

    this.bindEvent(gridWrapper, 'touchmove', (e) => {
      if (!this._touchStartX) return;
      const deltaX = e.touches[0].clientX - this._touchStartX;
      const deltaY = e.touches[0].clientY - this._touchStartY;

      // 判断是否为水平滑动（水平位移大于垂直位移且超过10px）
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        this._isSwiping = true;
        // 阻止垂直滚动，避免手势冲突
        e.preventDefault();
      }
    }, { passive: false });

    this.bindEvent(gridWrapper, 'touchend', (e) => {
      if (!this._isSwiping) return;

      const endX = e.changedTouches[0].clientX;
      const deltaX = endX - this._touchStartX;

      // 滑动距离阈值
      const threshold = 50;

      if (deltaX > threshold) {
        // 右滑 → 上一月
        this._switchMonth('prev');
      } else if (deltaX < -threshold) {
        // 左滑 → 下一月
        this._switchMonth('next');
      }

      this._touchStartX = 0;
      this._touchStartY = 0;
      this._isSwiping = false;
    });
  }

  /**
   * 加载月份数据
   * @param {'left'|'right'} animDirection - 动画方向
   */
  _loadMonthData(animDirection = null) {
    if (!window.appStorage) return;

    const calService = new CalendarService(window.appStorage);
    const monthData = calService.getMonthData(this._currentYear, this._currentMonth);

    // 更新标题
    const titleEl = this._container.querySelector('#cal-title');
    if (titleEl) titleEl.textContent = `${monthData.year}年${monthData.month}月`;

    // 更新"今天"按钮
    this._updateTodayButton();

    // 渲染日历网格
    const gridEl = this._container.querySelector('#cal-grid');
    if (!gridEl) return;

    // 播放月份切换动画
    if (animDirection) {
      const animClass = animDirection === 'left' ? 'anim-calendar-left' : 'anim-calendar-right';
      gridEl.classList.add(animClass);
      gridEl.addEventListener('animationend', () => {
        gridEl.classList.remove(animClass);
      }, { once: true });
    }

    gridEl.innerHTML = '';

    // 移除旧的空月份提示
    const oldEmpty = this._container.querySelector('.calendar-empty');
    if (oldEmpty) oldEmpty.remove();

    // 填充月初空白
    for (let i = 0; i < monthData.startDayOfWeek; i++) {
      const empty = document.createElement('div');
      empty.className = 'calendar-day calendar-day--empty';
      gridEl.appendChild(empty);
    }

    // 填充日期
    monthData.days.forEach(day => {
      const dayEl = document.createElement('div');
      let classes = 'calendar-day';
      if (day.isToday) classes += ' calendar-day--today';
      if (day.isFuture) classes += ' calendar-day--future';
      dayEl.className = classes;

      // 心情圆点 — 今日使用脉冲动画，有记录的日期使用呼吸动画
      let moodDotClass = 'calendar-day__mood-dot';
      if (day.isToday) {
        moodDotClass += ' calendar-day__mood-dot--pulse';
      } else if (day.moodColor) {
        // 有心情记录的日期添加呼吸动画
        moodDotClass += ' anim-mood-dot-pulse';
      }

      dayEl.innerHTML = `
        <span class="calendar-day__number">${parseInt(day.date.substring(8), 10)}</span>
        ${day.moodColor ? `<div class="${moodDotClass}" style="background-color: ${day.moodColor}"></div>` : ''}
      `;

      if (!day.isFuture && day.recordCount > 0) {
        dayEl.addEventListener('click', () => {
          // 日期点击效果 — 缩放反馈 + 涟漪效果
          dayEl.style.transform = 'scale(0.93)';
          setTimeout(() => {
            dayEl.style.transform = '';
          }, 150);

          // 点击时心情圆点放大反馈
          const dotEl = dayEl.querySelector('.calendar-day__mood-dot');
          if (dotEl) {
            dotEl.style.transform = 'scale(1.8)';
            setTimeout(() => {
              dotEl.style.transform = '';
            }, 300);
          }

          const detail = calService.getDateDetail(day.date);
          if (detail) {
            const dateDetail = new DateDetail(document.getElementById('app'), this._eventBus);
            dateDetail.show(day.date, detail.records);
          }
        });
      }

      gridEl.appendChild(dayEl);
    });

    // 空月份提示
    if (monthData.recordCount === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'calendar-empty anim-content-fade-in';
      emptyState.innerHTML = `
        <div class="calendar-empty__icon">📅</div>
        <div class="calendar-empty__text">这个月还没有记录哦</div>
      `;
      gridEl.parentNode.appendChild(emptyState);
    }
  }

  /**
   * 首次进入日历页时显示滑动提示
   * 3秒后自动消失
   */
  _showSwipeHint() {
    const hasShownHint = localStorage.getItem('mh_swipe_hint_shown');
    if (hasShownHint) return;

    const gridWrapper = this._container.querySelector('.calendar-grid-wrapper');
    if (!gridWrapper) return;

    const hint = document.createElement('div');
    hint.className = 'calendar-swipe-hint anim-content-fade-in';
    hint.textContent = '👈 左右滑动切换月份 👉';
    gridWrapper.parentNode.insertBefore(hint, gridWrapper.nextSibling);

    // 3秒后自动消失
    setTimeout(() => {
      hint.classList.add('anim-fade-out');
      hint.addEventListener('animationend', () => hint.remove());
      localStorage.setItem('mh_swipe_hint_shown', '1');
    }, 3000);
  }
}

window.CalendarView = CalendarView;

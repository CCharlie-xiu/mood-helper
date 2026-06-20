/**
 * 左侧侧边栏组件 — 大学生心情记录助手
 * 提供导航项高亮切换、主题切换按钮
 */

class Sidebar {
  /**
   * @param {HTMLElement} container - 侧边栏容器（<aside>元素）
   * @param {Router} router - 路由管理器
   * @param {EventBus} eventBus - 事件总线
   */
  constructor(container, router, eventBus) {
    this._container = container;
    this._router = router;
    this._eventBus = eventBus;
    this._activePath = '/home';
  }

  /**
   * 初始化侧边栏
   * 绑定导航项点击事件和主题切换按钮事件
   */
  init() {
    this._bindNavEvents();
    this._bindThemeToggle();
    this._listenRouteChange();
  }

  /**
   * 绑定侧边栏导航项的点击事件
   * @private
   */
  _bindNavEvents() {
    const navItems = this._container.querySelectorAll('.sidebar-nav__item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const path = item.dataset.path;
        if (path) {
          this._router.navigate(path);
        }
      });
    });
  }

  /**
   * 绑定主题切换按钮事件
   * @private
   */
  _bindThemeToggle() {
    const toggleBtn = this._container.querySelector('#sidebar-theme-toggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      // 调用全局主题管理器切换主题
      if (window.appThemeManager) {
        window.appThemeManager.toggleTheme();
      }
    });

    // 监听主题变更事件，更新按钮文字和图标
    this._eventBus.on(AppEvents.THEME_CHANGE, (data) => {
      this._updateThemeToggle(data.theme);
    });

    // 初始化按钮状态
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    this._updateThemeToggle(currentTheme);
  }

  /**
   * 更新主题切换按钮的显示状态
   * @param {string} theme - 当前主题 ('light' | 'dark')
   * @private
   */
  _updateThemeToggle(theme) {
    const toggleBtn = this._container.querySelector('#sidebar-theme-toggle');
    if (!toggleBtn) return;

    const iconEl = toggleBtn.querySelector('.sidebar-theme-toggle__icon');
    const labelEl = toggleBtn.querySelector('.sidebar-theme-toggle__label');

    if (theme === 'dark') {
      if (iconEl) iconEl.textContent = '☀️';
      if (labelEl) labelEl.textContent = '浅色模式';
    } else {
      if (iconEl) iconEl.textContent = '🌙';
      if (labelEl) labelEl.textContent = '深色模式';
    }
  }

  /**
   * 监听路由变更事件，更新侧边栏高亮
   * @private
   */
  _listenRouteChange() {
    this._eventBus.on(AppEvents.ROUTE_CHANGE, (data) => {
      this._setActive(data.path);
    });
  }

  /**
   * 设置侧边栏当前激活的导航项
   * @param {string} path - 路由路径
   */
  _setActive(path) {
    this._activePath = path;
    const items = this._container.querySelectorAll('.sidebar-nav__item');
    items.forEach(item => {
      const isActive = item.dataset.path === path;
      if (isActive) {
        item.classList.add('sidebar-nav__item--active');
      } else {
        item.classList.remove('sidebar-nav__item--active');
      }
    });
  }
}

/* 将 Sidebar 挂载到全局 */
window.Sidebar = Sidebar;

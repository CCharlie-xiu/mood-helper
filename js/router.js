/**
 * Hash路由管理器 — 大学生心情记录助手
 * 基于hashchange事件实现SPA页面切换
 * 支持路由注册、编程式导航、过渡动画、视图生命周期
 */

class Router {
  /**
   * @param {HTMLElement} container - 页面渲染容器
   * @param {EventBus} eventBus - 全局事件总线
   */
  constructor(container, eventBus) {
    /** @type {HTMLElement} 页面渲染容器 */
    this._container = container;
    /** @type {EventBus} 全局事件总线 */
    this._eventBus = eventBus;
    /** @type {Map<string, {view: BaseView, title: string}>} 路由表 */
    this._routes = new Map();
    /** @type {string} 当前路径 */
    this._currentPath = '';
    /** @type {BaseView|null} 当前视图实例 */
    this._currentView = null;
    /** @type {boolean} 是否正在切换路由 */
    this._isNavigating = false;
    /** @type {Array<{from: string, to: string}>} 路由历史，用于判断前进/后退 */
    this._history = [];
  }

  /**
   * 注册路由与视图映射
   * @param {string} path - 路由路径（如 '/home'）
   * @param {BaseView} view - 视图实例
   * @param {string} [title=''] - 页面标题
   */
  register(path, view, title = '') {
    // 规范化路径，确保以 / 开头
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    this._routes.set(normalizedPath, { view, title });
  }

  /**
   * 编程式导航
   * @param {string} path - 目标路径
   */
  navigate(path) {
    // 防止重复导航
    if (this._isNavigating) return;

    // 规范化路径
    let normalizedPath = path.startsWith('/') ? path : `/${path}`;
    // 去除开头的 # 号（如果有）
    normalizedPath = normalizedPath.replace(/^#+/, '');

    // 查找路由表
    if (!this._routes.has(normalizedPath)) {
      // 未匹配路由，重定向至 /home
      console.warn(`[Router] 路由未匹配: ${normalizedPath}，重定向至 /home`);
      normalizedPath = '/home';
    }

    // 如果目标路径与当前路径相同，不执行导航
    if (normalizedPath === this._currentPath && this._currentView) {
      return;
    }

    const route = this._routes.get(normalizedPath);
    if (!route) return;

    this._isNavigating = true;

    // 判断导航方向（前进/后退/Tab切换）
    const direction = this._determineDirection(normalizedPath);

    // 执行路由切换
    this._switchView(route.view, normalizedPath, direction)
      .then(() => {
        // 更新浏览器hash
        const newHash = `#${normalizedPath}`;
        if (window.location.hash !== newHash) {
          window.history.replaceState(null, '', newHash);
        }

        // 更新页面标题
        if (route.title) {
          document.title = `${route.title} - 心情记录助手`;
        }

        // 记录历史
        this._history.push({ from: this._currentPath, to: normalizedPath });

        // 更新当前路径
        this._currentPath = normalizedPath;

        // 发射路由变更事件
        this._eventBus.emit(AppEvents.ROUTE_CHANGE, { path: normalizedPath, title: route.title });
      })
      .finally(() => {
        this._isNavigating = false;
      });
  }

  /**
   * 获取当前路由路径
   * @returns {string}
   */
  getCurrentPath() {
    return this._currentPath;
  }

  /**
   * 初始化路由监听
   */
  init() {
    // 监听 hashchange 事件
    window.addEventListener('hashchange', () => {
      this._handleHashChange();
    });

    // 解析初始hash
    this._handleHashChange();
  }

  /**
   * 处理hash变化
   * @private
   */
  _handleHashChange() {
    const hash = window.location.hash || '#/home';
    const path = hash.replace(/^#/, '') || '/home';
    this.navigate(path);
  }

  /**
   * 判断导航方向
   * @param {string} targetPath - 目标路径
   * @returns {'forward'|'backward'|'tab'} 导航方向
   * @private
   */
  _determineDirection(targetPath) {
    // Tab切换页面列表
    const tabPaths = ['/home', '/record', '/calendar', '/stats', '/profile'];

    const isCurrentTab = tabPaths.includes(this._currentPath);
    const isTargetTab = tabPaths.includes(targetPath);

    // 如果当前和目标都是Tab页面，则为Tab切换
    if (isCurrentTab && isTargetTab) {
      return 'tab';
    }

    // 根据历史记录判断方向
    if (this._history.length > 0) {
      const lastEntry = this._history[this._history.length - 1];
      if (lastEntry.to === targetPath) {
        return 'backward';
      }
    }

    return 'forward';
  }

  /**
   * 切换视图
   * @param {BaseView} newView - 新视图实例
   * @param {string} path - 目标路径
   * @param {'forward'|'backward'|'tab'} direction - 导航方向
   * @returns {Promise<void>}
   * @private
   */
  async _switchView(newView, path, direction) {
    // 1. 卸载当前视图
    if (this._currentView && typeof this._currentView.beforeUnmount === 'function') {
      this._currentView.beforeUnmount();
    }

    // 2. 执行过渡动画
    if (this._container) {
      // 添加退出动画类
      const exitAnimClass = this._getExitAnimClass(direction);
      this._container.classList.add(exitAnimClass);

      // 等待退出动画完成
      await this._waitForAnimation(this._container, 200);

      // 清空容器内容
      this._container.innerHTML = '';
      this._container.classList.remove(exitAnimClass);
    }

    // 3. 挂载新视图
    if (newView && typeof newView.mount === 'function') {
      newView.mount();
    }

    // 4. 添加进入动画类
    if (this._container) {
      const enterAnimClass = this._getEnterAnimClass(direction);
      this._container.classList.add(enterAnimClass);

      // 动画结束后移除类名
      const handleAnimEnd = () => {
        this._container.classList.remove(enterAnimClass);
        this._container.removeEventListener('animationend', handleAnimEnd);
      };
      this._container.addEventListener('animationend', handleAnimEnd);
    }

    // 5. 更新当前视图引用
    this._currentView = newView;
  }

  /**
   * 获取退出动画类名
   * @param {'forward'|'backward'|'tab'} direction
   * @returns {string}
   * @private
   */
  _getExitAnimClass(direction) {
    switch (direction) {
      case 'forward':
        return 'anim-fade-out';
      case 'backward':
        return 'anim-fade-out';
      case 'tab':
        return 'anim-fade-out';
      default:
        return 'anim-fade-out';
    }
  }

  /**
   * 获取进入动画类名
   * @param {'forward'|'backward'|'tab'} direction
   * @returns {string}
   * @private
   */
  _getEnterAnimClass(direction) {
    switch (direction) {
      case 'forward':
        return 'anim-slide-left';
      case 'backward':
        return 'anim-slide-right';
      case 'tab':
        return 'anim-fade-in';
      default:
        return 'anim-fade-in';
    }
  }

  /**
   * 等待动画完成
   * @param {HTMLElement} element - 目标元素
   * @param {number} timeout - 超时时间（毫秒）
   * @returns {Promise<void>}
   * @private
   */
  _waitForAnimation(element, timeout = 300) {
    return new Promise((resolve) => {
      let resolved = false;

      const done = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };

      // 监听动画结束
      element.addEventListener('animationend', done, { once: true });

      // 超时保护
      setTimeout(done, timeout);
    });
  }
}

/* 将 Router 挂载到全局 */
window.Router = Router;
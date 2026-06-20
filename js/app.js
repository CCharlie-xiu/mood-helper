/**
 * 应用入口与核心类 — 大学生心情记录助手
 * 包含：EventBus（事件总线）、BaseView（视图基类）、App（应用入口）
 */

/* ============================================
 * EventBus — 全局事件总线
 * 用于跨模块通信，支持订阅/取消订阅/发布
 * ============================================ */
class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} 事件监听器映射 */
    this._listeners = new Map();
  }

  /**
   * 订阅事件
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    if (typeof callback !== 'function') {
      console.warn(`[EventBus] on() 回调必须是函数，收到: ${typeof callback}`);
      return;
    }
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);
  }

  /**
   * 取消订阅事件
   * @param {string} event - 事件名称
   * @param {Function} callback - 要移除的回调函数
   */
  off(event, callback) {
    if (!this._listeners.has(event)) return;
    this._listeners.get(event).delete(callback);
    // 如果该事件已无监听器，清理Map条目
    if (this._listeners.get(event).size === 0) {
      this._listeners.delete(event);
    }
  }

  /**
   * 发布事件
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   */
  emit(event, data) {
    if (!this._listeners.has(event)) return;
    this._listeners.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[EventBus] 事件 "${event}" 回调执行出错:`, error);
      }
    });
  }

  /**
   * 清除所有事件监听器
   */
  clear() {
    this._listeners.clear();
  }
}

/* ============================================
 * 全局事件常量定义
 * ============================================ */
const AppEvents = Object.freeze({
  /** 主题切换通知 */
  THEME_CHANGE: 'theme:change',
  /** 新心情记录通知 */
  MOOD_RECORDED: 'mood:recorded',
  /** 记录删除通知 */
  MOOD_DELETED: 'mood:deleted',
  /** 设置更新通知 */
  SETTINGS_UPDATED: 'settings:updated',
  /** 存储异常通知 */
  STORAGE_ERROR: 'storage:error',
  /** 路由变更通知 */
  ROUTE_CHANGE: 'route:change',
});

/* ============================================
 * BaseView — 视图基类
 * 所有页面视图的基类，提供统一的生命周期和工具方法
 * ============================================ */
class BaseView {
  /**
   * @param {HTMLElement} container - 视图渲染容器
   * @param {EventBus} eventBus - 全局事件总线
   */
  constructor(container, eventBus) {
    /** @type {HTMLElement} 视图渲染容器 */
    this._container = container;
    /** @type {EventBus} 全局事件总线引用 */
    this._eventBus = eventBus;
    /** @type {Array<{element: HTMLElement, event: string, handler: Function}>} 已绑定的事件列表，用于自动清理 */
    this._boundEvents = [];
    /** @type {Array<{event: string, callback: Function}>} 已订阅的EventBus事件列表，用于自动清理 */
    this._eventBusSubscriptions = [];
    /** @type {boolean} 视图是否已挂载 */
    this._mounted = false;
  }

  /**
   * 挂载视图 — 创建DOM、绑定事件、渲染数据
   * 子类应重写此方法实现具体的视图初始化逻辑
   */
  mount() {
    this._mounted = true;
  }

  /**
   * 卸载前清理 — 清理事件绑定和EventBus订阅
   * 子类重写时应调用 super.beforeUnmount()
   */
  beforeUnmount() {
    // 清理所有DOM事件绑定
    this._boundEvents.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this._boundEvents = [];

    // 清理所有EventBus订阅
    this._eventBusSubscriptions.forEach(({ event, callback }) => {
      this._eventBus.off(event, callback);
    });
    this._eventBusSubscriptions = [];

    this._mounted = false;
  }

  /**
   * 渲染视图内容 — 子类必须重写此方法
   * @returns {string|HTMLElement} 视图的HTML内容
   */
  render() {
    return '';
  }

  /* ------------------------------------------
   * 工具方法
   * ------------------------------------------ */

  /**
   * 创建DOM元素
   * @param {string} tag - 标签名
   * @param {Object} [attrs={}] - 属性对象
   * @param {Array<string|HTMLElement>} [children=[]] - 子元素
   * @returns {HTMLElement} 创建的DOM元素
   */
  createElement(tag, attrs = {}, children = []) {
    const element = document.createElement(tag);

    // 设置属性
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        // 事件绑定（如 onClick → click）
        const eventName = key.slice(2).toLowerCase();
        this.bindEvent(element, eventName, value);
      } else if (key === 'dataset' && typeof value === 'object') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else {
        element.setAttribute(key, value);
      }
    });

    // 添加子元素
    if (!Array.isArray(children)) {
      children = [children];
    }
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      }
    });

    return element;
  }

  /**
   * 在视图容器内查询元素
   * @param {string} selector - CSS选择器
   * @returns {HTMLElement|null} 匹配的元素
   */
  query(selector) {
    return this._container.querySelector(selector);
  }

  /**
   * 在视图容器内查询所有匹配元素
   * @param {string} selector - CSS选择器
   * @returns {NodeList} 匹配的元素列表
   */
  queryAll(selector) {
    return this._container.querySelectorAll(selector);
  }

  /**
   * 绑定事件（自动记录用于清理）
   * @param {HTMLElement} element - 目标元素
   * @param {string} event - 事件名称
   * @param {Function} handler - 事件处理函数
   */
  bindEvent(element, event, handler) {
    element.addEventListener(event, handler);
    this._boundEvents.push({ element, event, handler });
  }

  /**
   * 订阅EventBus事件（自动记录用于清理）
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  subscribeEvent(event, callback) {
    this._eventBus.on(event, callback);
    this._eventBusSubscriptions.push({ event, callback });
  }

  /**
   * 显示提示消息
   * @param {string} message - 提示文字
   * @param {'success'|'error'|'info'|'warning'} [type='info'] - 提示类型
   * @param {number} [duration=2000] - 展示时长（毫秒）
   */
  showToast(message, type = 'info', duration = 2000) {
    // 使用全局Toast组件（如果已初始化）
    if (window.Toast && typeof window.Toast.show === 'function') {
      window.Toast.show(message, type, duration);
      return;
    }

    // 降级方案：直接操作toast容器
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type} anim-toast-in`;
    toast.textContent = message;
    toast.style.cssText = `
      padding: 10px 20px;
      border-radius: 8px;
      margin-bottom: 8px;
      font-size: 14px;
      pointer-events: auto;
      max-width: 80%;
      text-align: center;
    `;

    // 根据类型设置颜色
    const colors = {
      success: { bg: 'var(--toast-success-bg)', color: 'var(--toast-success-text)' },
      error: { bg: 'var(--toast-error-bg)', color: 'var(--toast-error-text)' },
      info: { bg: 'var(--toast-info-bg)', color: 'var(--toast-info-text)' },
      warning: { bg: 'var(--toast-warning-bg)', color: 'var(--toast-warning-text)' },
    };
    const style = colors[type] || colors.info;
    toast.style.backgroundColor = style.bg;
    toast.style.color = style.color;

    toastContainer.appendChild(toast);

    // 定时移除
    setTimeout(() => {
      toast.classList.remove('anim-toast-in');
      toast.classList.add('anim-toast-out');
      toast.addEventListener('animationend', () => {
        toast.remove();
      });
    }, duration);
  }

  /**
   * 检查视图是否已挂载
   * @returns {boolean}
   */
  isMounted() {
    return this._mounted;
  }
}

/* ============================================
 * App — 应用入口类
 * 负责初始化顺序和全局协调
 * ============================================ */
class App {
  constructor() {
    /** @type {EventBus} 全局事件总线 */
    this.eventBus = null;
    /** @type {Router} 路由管理器 */
    this.router = null;
    /** @type {ThemeManager} 主题管理器 */
    this.themeManager = null;
    /** @type {StorageAdapter} 存储适配器 */
    this.storageAdapter = null;
    /** @type {Sidebar} 左侧侧边栏 */
    this.sidebar = null;
    /** @type {AnimationController} 动画控制器实例 */
    this.animationController = null;
  }

  /**
   * 初始化应用
   * 初始化顺序：EventBus → StorageAdapter → 数据版本检查 → ThemeManager → AnimationController → Router → Sidebar → Router.init()
   */
  init() {
    // 1. 浏览器兼容性检测
    if (!this._checkBrowserSupport()) {
      this._showUnsupportedPage();
      return;
    }

    // 2. 初始化 EventBus
    this.eventBus = new EventBus();
    // 将 EventBus 挂载到全局，方便其他模块访问
    window.appEventBus = this.eventBus;

    // 3. 初始化 StorageAdapter
    this.storageAdapter = new StorageAdapter(this.eventBus);
    window.appStorage = this.storageAdapter;

    // 4. 数据版本检查与迁移
    this._checkDataVersion();

    // 5. 初始化 ThemeManager
    this.themeManager = new ThemeManager(this.eventBus, this.storageAdapter);
    this.themeManager.init();
    window.appThemeManager = this.themeManager;

    // 6. 初始化 AnimationController（确保已挂载到全局）
    // AnimationController 在 app.js 之前加载，已自动创建全局实例
    this.animationController = window.appAnimationController;
    if (!this.animationController) {
      // 如果全局实例不存在（脚本加载顺序问题），手动创建
      window.appAnimationController = new AnimationController();
      this.animationController = window.appAnimationController;
    }

    // 7. 初始化 Router
    const pageContainer = document.getElementById('page-container');
    this.router = new Router(pageContainer, this.eventBus);
    window.appRouter = this.router;

    // 8. 注册所有路由
    this._registerRoutes();

    // 9. 初始化 Sidebar
    const sidebarContainer = document.getElementById('sidebar');
    this.sidebar = new Sidebar(sidebarContainer, this.router, this.eventBus);
    this.sidebar.init();
    window.appSidebar = this.sidebar;

    // 10. 初始化路由监听
    this.router.init();

    // 11. 导航至初始路由
    const currentHash = window.location.hash || '#/home';
    this.router.navigate(currentHash.replace('#', ''));

    // 12. 首次使用引导检查
    this._checkFirstTimeGuide();

    console.log('[App] 应用初始化完成');
  }

  /**
   * 浏览器兼容性检测
   * 检测 localStorage、CSS Custom Properties、Promise、fetch 等关键特性
   * @returns {boolean} 是否兼容
   * @private
   */
  _checkBrowserSupport() {
    // 检测 localStorage
    try {
      localStorage.setItem('_mh_test', '1');
      localStorage.removeItem('_mh_test');
    } catch (e) {
      console.warn('[App] localStorage 不可用');
      return false;
    }

    // 检测 CSS Custom Properties
    if (window.CSS && CSS.supports) {
      if (!CSS.supports('--a', '0')) {
        console.warn('[App] CSS Custom Properties 不支持');
        return false;
      }
    }

    // 检测 Promise（ES6基础特性）
    if (typeof Promise === 'undefined') {
      console.warn('[App] Promise 不支持');
      return false;
    }

    // 检测 addEventListener（IE8+）
    if (typeof window.addEventListener === 'undefined') {
      console.warn('[App] addEventListener 不支持');
      return false;
    }

    // 检测 requestAnimationFrame（用于动画）
    if (typeof window.requestAnimationFrame === 'undefined') {
      console.warn('[App] requestAnimationFrame 不支持，动画可能不流畅');
      // 不阻止运行，只是警告
    }

    return true;
  }

  /**
   * 显示不兼容提示页
   * @private
   */
  _showUnsupportedPage() {
    const unsupportedEl = document.getElementById('unsupported-browser');
    const appEl = document.getElementById('app');
    if (unsupportedEl) {
      unsupportedEl.style.display = 'flex';
    }
    if (appEl) {
      appEl.style.display = 'none';
    }
  }

  /**
   * 数据版本检查与迁移
   * @private
   */
  _checkDataVersion() {
    const currentVersion = '1.0';
    const storedVersion = this.storageAdapter.get('mh_version');

    if (!storedVersion) {
      // 首次使用，初始化默认数据
      this.storageAdapter.set('mh_version', currentVersion);
      this.storageAdapter.set('mh_records', JSON.stringify([]));

      // 初始化默认设置
      const defaultSettings = {
        nickname: '同学',
        avatar: 'default',
        dailyGoal: 1,
        theme: 'light',
        createdAt: new Date().toISOString(),
      };
      this.storageAdapter.set('mh_settings', JSON.stringify(defaultSettings));

      console.log('[App] 首次使用，已初始化默认数据');
    } else if (storedVersion !== currentVersion) {
      // 版本不一致，执行数据迁移
      console.log(`[App] 数据版本从 ${storedVersion} 迁移至 ${currentVersion}`);
      this._migrateData(storedVersion, currentVersion);
      this.storageAdapter.set('mh_version', currentVersion);
    }
  }

  /**
   * 数据迁移
   * @param {string} fromVersion - 源版本
   * @param {string} toVersion - 目标版本
   * @private
   */
  _migrateData(fromVersion, toVersion) {
    // 当前只有1.0版本，暂无迁移逻辑
    // 未来版本升级时在此添加迁移代码
  }

  /**
   * 首次使用引导检查
   * 检查是否首次使用应用，如果是则设置标记
   * 实际的欢迎引导由 HomeView 负责
   * @private
   */
  _checkFirstTimeGuide() {
    // 首次使用的标记在 _checkDataVersion 中已通过 mh_version 设置
    // 这里仅做日志输出，实际的欢迎弹窗由 HomeView._checkFirstTime() 处理
    if (!localStorage.getItem('mh_welcome_shown')) {
      console.log('[App] 检测到首次使用，将在首页显示欢迎引导');
    }
  }

  /**
   * 注册所有路由
   * @private
   */
  _registerRoutes() {
    const pageContainer = document.getElementById('page-container');

    this.router.register('/home', new HomeView(pageContainer, this.eventBus), '首页');
    this.router.register('/record', new RecordView(pageContainer, this.eventBus), '记录心情');
    this.router.register('/calendar', new CalendarView(pageContainer, this.eventBus), '日历回顾');
    this.router.register('/stats', new StatsView(pageContainer, this.eventBus), '心情统计');
    this.router.register('/profile', new ProfileView(pageContainer, this.eventBus), '个人中心');
  }
}

/* 将核心类挂载到全局，供其他模块使用 */
window.EventBus = EventBus;
window.AppEvents = AppEvents;
window.BaseView = BaseView;
window.App = App;
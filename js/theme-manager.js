/**
 * 主题管理器 — 大学生心情记录助手
 * 支持亮色/暗色主题切换，Chart.js主题适配
 */

class ThemeManager {
  /**
   * @param {EventBus} eventBus - 全局事件总线
   * @param {StorageAdapter} storageAdapter - 存储适配器
   */
  constructor(eventBus, storageAdapter) {
    /** @type {EventBus} 全局事件总线 */
    this._eventBus = eventBus;
    /** @type {StorageAdapter} 存储适配器 */
    this._storageAdapter = storageAdapter;
    /** @type {'light'|'dark'} 当前主题 */
    this._currentTheme = 'light';
  }

  /**
   * 初始化主题管理器
   * 从localStorage读取保存的主题并应用
   */
  init() {
    // 从存储中读取用户设置的主题
    const savedTheme = this._getSavedTheme();
    this._currentTheme = savedTheme || 'light';
    this.applyTheme(this._currentTheme);
  }

  /**
   * 获取当前主题
   * @returns {'light'|'dark'}
   */
  getCurrentTheme() {
    return this._currentTheme;
  }

  /**
   * 设置主题
   * @param {'light'|'dark'} theme - 目标主题
   */
  setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') {
      console.warn(`[ThemeManager] 无效的主题值: ${theme}`);
      return;
    }

    if (this._currentTheme === theme) return;

    this._currentTheme = theme;
    this.applyTheme(theme);
    this._saveTheme(theme);

    // 发射主题变更事件
    this._eventBus.emit(AppEvents.THEME_CHANGE, { theme });
  }

  /**
   * 切换主题（亮色↔暗色）
   */
  toggleTheme() {
    const newTheme = this._currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * 应用主题到DOM
   * @param {'light'|'dark'} theme - 目标主题
   */
  applyTheme(theme) {
    // 在根元素上设置 data-theme 属性，CSS变量会自动切换
    document.documentElement.setAttribute('data-theme', theme);

    // 更新 meta theme-color 以适配浏览器UI
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', theme === 'dark' ? '#121D2B' : '#4A9EDE');
    }

    // 适配 Chart.js 主题
    this._updateChartTheme(theme);
  }

  /**
   * 获取主题变量值
   * @param {'light'|'dark'} theme - 目标主题
   * @returns {Object} 主题变量对象
   */
  getThemeVariables(theme) {
    const isDark = theme === 'dark';
    return {
      '--bg-primary': isDark ? '#121D2B' : '#F0F5FA',
      '--bg-secondary': isDark ? '#1A2838' : '#FFFFFF',
      '--text-primary': isDark ? '#E8EEF4' : '#1C2D42',
      '--text-secondary': isDark ? '#94AAC0' : '#5A7089',
      '--accent': isDark ? '#5EB3E8' : '#4A9EDE',
      '--card-bg': isDark ? '#1A2838' : '#FFFFFF',
      '--border-color': isDark ? '#2A3E52' : '#D6E2EE',
    };
  }

  /**
   * 从存储中读取保存的主题
   * @returns {'light'|'dark'|null}
   * @private
   */
  _getSavedTheme() {
    try {
      const settingsStr = this._storageAdapter.get('mh_settings');
      if (settingsStr) {
        const settings = JSON.parse(settingsStr);
        if (settings.theme === 'light' || settings.theme === 'dark') {
          return settings.theme;
        }
      }
    } catch (e) {
      console.warn('[ThemeManager] 读取保存主题失败:', e);
    }
    return null;
  }

  /**
   * 保存主题到存储
   * @param {'light'|'dark'} theme
   * @private
   */
  _saveTheme(theme) {
    try {
      const settingsStr = this._storageAdapter.get('mh_settings');
      if (settingsStr) {
        const settings = JSON.parse(settingsStr);
        settings.theme = theme;
        this._storageAdapter.set('mh_settings', JSON.stringify(settings));
      }
    } catch (e) {
      console.warn('[ThemeManager] 保存主题失败:', e);
    }
  }

  /**
   * 更新 Chart.js 图表主题
   * 主题切换时需更新图表的网格线颜色、文字颜色等
   * @param {'light'|'dark'} theme
   * @private
   */
  _updateChartTheme(theme) {
    // 检查 Chart.js 是否已加载
    if (typeof Chart === 'undefined') return;

    const textColor = theme === 'dark' ? '#94AAC0' : '#5A7089';
    const gridColor = theme === 'dark' ? '#1E3040' : '#EAF0F7';

    // 更新 Chart.js 全局默认值
    Chart.defaults.color = textColor;

    // 更新所有活跃图表实例的配置
    // Chart.js v4: Chart.instances 是 Map，v3 是数组
    if (Chart.instances) {
      const charts = Chart.instances instanceof Map
        ? Array.from(Chart.instances.values())
        : Array.from(Chart.instances);

      charts.forEach(chart => {
        try {
          // 更新坐标轴网格线颜色
          if (chart.options.scales) {
            Object.values(chart.options.scales).forEach(scale => {
              if (scale.grid) {
                scale.grid.color = gridColor;
              }
              // 更新刻度文字颜色
              if (scale.ticks) {
                scale.ticks.color = textColor;
              }
            });
          }
          // 更新图例颜色
          if (chart.options.plugins && chart.options.plugins.legend) {
            if (chart.options.plugins.legend.labels) {
              chart.options.plugins.legend.labels.color = textColor;
            }
          }
          // 触发图表重绘
          chart.update('none');
        } catch (e) {
          console.warn('[ThemeManager] 更新图表主题失败:', e);
        }
      });
    }
  }
}

/* 将 ThemeManager 挂载到全局 */
window.ThemeManager = ThemeManager;
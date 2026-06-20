/**
 * 数据统计页视图 — 大学生心情记录助手
 * 统计维度切换、折线图、饼图、洞察分析
 * 增强：渐变填充图表、圆角柱状图、自定义tooltip、空状态、
 *       降级文字摘要、饼图中心文字、洞察分析图标和动画、stagger动画
 */

class StatsView extends BaseView {
  mount() {
    super.mount();
    this._currentPeriod = StatsPeriod.WEEK;
    this._lineChart = null;
    this._pieChart = null;
    this._renderPage();
    this._loadStats();
    this._subscribeEvents();
    this._playStaggerAnimation();
  }

  beforeUnmount() {
    if (this._lineChart) { this._lineChart.destroy(); this._lineChart = null; }
    if (this._pieChart) { this._pieChart.destroy(); this._pieChart = null; }
    super.beforeUnmount();
  }

  render() {
    return '';
  }

  _renderPage() {
    this._container.innerHTML = `
      <div class="page-content">
        <h2 class="mb-lg anim-card-stagger" style="animation-delay: 0ms; font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--text-primary)">心情统计</h2>

        <!-- 维度切换 -->
        <div class="stats-period mb-md anim-card-stagger" style="animation-delay: 50ms">
          <button class="stats-period__btn stats-period__btn--active" data-period="${StatsPeriod.WEEK}">周</button>
          <button class="stats-period__btn" data-period="${StatsPeriod.MONTH}">月</button>
          <button class="stats-period__btn" data-period="${StatsPeriod.YEAR}">年</button>
        </div>

        <!-- 趋势折线图 -->
        <div class="card mb-md anim-card-stagger" style="animation-delay: 100ms">
          <h3 class="stats-chart__title">
            <span class="stats-chart__title-icon">📈</span>
            心情趋势
          </h3>
          <div class="stats-chart__canvas-wrapper" id="stats-line-chart-wrapper">
            <canvas id="stats-line-chart"></canvas>
          </div>
        </div>

        <!-- 分布饼图 -->
        <div class="card mb-md anim-card-stagger" style="animation-delay: 150ms">
          <h3 class="stats-chart__title">
            <span class="stats-chart__title-icon">🍩</span>
            心情分布
          </h3>
          <div class="stats-chart__canvas-wrapper" id="stats-pie-chart-wrapper">
            <canvas id="stats-pie-chart"></canvas>
          </div>
        </div>

        <!-- 洞察分析 -->
        <div class="card mb-md anim-card-stagger" style="animation-delay: 200ms">
          <h3 class="stats-insight__title">
            <span class="stats-insight__title-icon">💡</span>
            心情洞察
          </h3>
          <div id="stats-insight-content"></div>
        </div>
      </div>
    `;

    this._bindPeriodButtons();
  }

  /**
   * 播放页面元素的stagger渐入动画
   */
  _playStaggerAnimation() {
    const items = this._container.querySelectorAll('.anim-card-stagger');
    items.forEach(item => {
      item.addEventListener('animationend', () => {
        item.classList.remove('anim-card-stagger');
      }, { once: true });
    });
  }

  _bindPeriodButtons() {
    const buttons = this._container.querySelectorAll('.stats-period__btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('stats-period__btn--active'));
        btn.classList.add('stats-period__btn--active');
        this._currentPeriod = btn.dataset.period;
        this._loadStats();
      });
    });
  }

  _loadStats() {
    if (!window.appStorage) return;
    const statsService = new StatsService(window.appStorage);

    // 折线图
    this._renderLineChart(statsService);

    // 饼图
    this._renderPieChart(statsService);

    // 洞察分析
    this._renderInsight(statsService);
  }

  /**
   * 渲染折线图
   * 增强：渐变填充、圆角柱状图、自定义tooltip、空状态、降级
   */
  _renderLineChart(statsService) {
    const wrapper = this._container.querySelector('#stats-line-chart-wrapper');
    if (!wrapper) return;

    try {
      const lineConfig = statsService.getLineChartConfig(this._currentPeriod);

      // 检查是否有数据
      if (!lineConfig.data.labels || lineConfig.data.labels.length === 0) {
        this._showChartEmpty(wrapper, '暂无趋势数据');
        return;
      }

      // Chart.js不可用时降级为文字摘要
      if (typeof Chart === 'undefined') {
        this._showTextSummary(wrapper, statsService, 'line');
        return;
      }

      // 确保canvas存在
      let canvas = wrapper.querySelector('#stats-line-chart');
      if (!canvas) {
        wrapper.innerHTML = '<canvas id="stats-line-chart"></canvas>';
        canvas = wrapper.querySelector('#stats-line-chart');
      }

      // 增强Chart.js配置
      const enhancedConfig = this._enhanceLineChartConfig(lineConfig);

      if (this._lineChart) this._lineChart.destroy();
      this._lineChart = new Chart(canvas, enhancedConfig);
    } catch (e) {
      console.warn('[StatsView] 折线图渲染失败:', e);
      // 降级为文字摘要
      this._showTextSummary(wrapper, statsService, 'line');
    }
  }

  /**
   * 渲染饼图
   * 增强：空状态、降级
   */
  _renderPieChart(statsService) {
    const wrapper = this._container.querySelector('#stats-pie-chart-wrapper');
    if (!wrapper) return;

    try {
      const pieConfig = statsService.getPieChartConfig(this._currentPeriod);

      // 检查是否有数据
      if (!pieConfig.data.labels || pieConfig.data.labels.length === 0) {
        this._showChartEmpty(wrapper, '暂无分布数据');
        return;
      }

      // Chart.js不可用时降级为文字摘要
      if (typeof Chart === 'undefined') {
        this._showTextSummary(wrapper, statsService, 'pie');
        return;
      }

      // 确保canvas存在
      let canvas = wrapper.querySelector('#stats-pie-chart');
      if (!canvas) {
        wrapper.innerHTML = '<canvas id="stats-pie-chart"></canvas>';
        canvas = wrapper.querySelector('#stats-pie-chart');
      }

      // 增强Chart.js配置
      const enhancedConfig = this._enhancePieChartConfig(pieConfig);

      if (this._pieChart) this._pieChart.destroy();
      this._pieChart = new Chart(canvas, enhancedConfig);
    } catch (e) {
      console.warn('[StatsView] 饼图渲染失败:', e);
      this._showTextSummary(wrapper, statsService, 'pie');
    }
  }

  /**
   * 增强折线图配置
   * 渐变填充、圆角、自定义tooltip
   */
  _enhanceLineChartConfig(config) {
    // 获取当前主题色 — 天空蔚蓝风格
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const accentColor = isDark ? '#5EB3E8' : '#4A9EDE';
    const textColor = isDark ? '#94AAC0' : '#5A7089';
    const gridColor = isDark ? '#1E3040' : '#EAF0F7';

    // 创建渐变填充
    const canvas = document.getElementById('stats-line-chart');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 220);
      gradient.addColorStop(0, isDark ? 'rgba(94, 179, 232, 0.3)' : 'rgba(74, 158, 222, 0.25)');
      gradient.addColorStop(1, isDark ? 'rgba(94, 179, 232, 0.02)' : 'rgba(74, 158, 222, 0.02)');
      config.data.datasets[0].backgroundColor = gradient;
    }

    // 增强数据集
    config.data.datasets[0].borderColor = accentColor;
    config.data.datasets[0].borderWidth = 2.5;
    config.data.datasets[0].fill = true;
    config.data.datasets[0].tension = 0.4;
    config.data.datasets[0].pointRadius = 4;
    config.data.datasets[0].pointHoverRadius = 7;
    config.data.datasets[0].pointBorderWidth = 2;
    config.data.datasets[0].pointBorderColor = isDark ? '#1A2838' : '#FFFFFF';

    // 增强选项
    config.options = config.options || {};
    config.options.animation = {
      duration: 800,
      easing: 'easeOutQuart',
    };

    // 坐标轴样式
    if (config.options.scales) {
      if (config.options.scales.y) {
        config.options.scales.y.min = 0;
        config.options.scales.y.max = 5;
        config.options.scales.y.ticks = {
          stepSize: 1,
          color: textColor,
          font: { size: 11 },
        };
        config.options.scales.y.grid = {
          color: gridColor,
          drawBorder: false,
        };
        config.options.scales.y.border = { display: false };
      }
      if (config.options.scales.x) {
        config.options.scales.x.grid = { display: false };
        config.options.scales.x.ticks = {
          color: textColor,
          font: { size: 11 },
          maxRotation: 0,
        };
        config.options.scales.x.border = { display: false };
      }
    }

    // 自定义tooltip
    config.options.plugins = config.options.plugins || {};
    config.options.plugins.tooltip = {
      backgroundColor: isDark ? '#223344' : '#FFFFFF',
      titleColor: isDark ? '#E8EEF4' : '#1C2D42',
      bodyColor: isDark ? '#94AAC0' : '#5A7089',
      borderColor: isDark ? '#2E4458' : '#D6E2EE',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 10,
      displayColors: true,
      callbacks: {
        label: (ctx) => {
          const moodType = ctx.dataset.pointMoodTypes?.[ctx.dataIndex];
          const moodLabel = moodType ? MOOD_COLOR_MAP[moodType]?.label : '';
          return `强度: ${ctx.raw}${moodLabel ? ' · ' + moodLabel : ''}`;
        },
      },
    };

    // 保存心情类型到dataset以便tooltip使用
    const trendData = new StatsService(window.appStorage).getTrendData(this._currentPeriod);
    config.data.datasets[0].pointMoodTypes = trendData.map(d => d.dominantMood);

    return config;
  }

  /**
   * 增强饼图配置
   * 增强：中心文字插件、自定义颜色
   */
  _enhancePieChartConfig(config) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#94AAC0' : '#5A7089';
    const primaryColor = isDark ? '#E8EEF4' : '#1C2D42';

    // 使用心情主题色作为饼图颜色
    const moodColors = config.data.labels.map(label => {
      const moodEntry = Object.entries(MOOD_COLOR_MAP).find(([, v]) => v.label === label);
      return moodEntry ? moodEntry[1].primary : '#999';
    });
    config.data.datasets[0].backgroundColor = moodColors;

    // 增强数据集
    config.data.datasets[0].borderWidth = 3;
    config.data.datasets[0].borderColor = isDark ? '#1A2838' : '#FFFFFF';
    config.data.datasets[0].hoverOffset = 8;

    // 增强选项
    config.options = config.options || {};
    config.options.animation = {
      duration: 800,
      easing: 'easeOutQuart',
      animateRotate: true,
      animateScale: true,
    };
    config.options.cutout = '58%';

    // 中心文字插件 — 在饼图中心显示总记录数
    const centerTextPlugin = {
      id: 'centerText',
      afterDraw: (chart) => {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;
        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;

        // 计算总数
        const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);

        // 绘制总数
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 数字
        ctx.font = `bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillStyle = primaryColor;
        ctx.fillText(total, centerX, centerY - 8);

        // 标签
        ctx.font = `12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillStyle = textColor;
        ctx.fillText('次记录', centerX, centerY + 14);

        ctx.restore();
      },
    };

    // 保存插件引用以便后续使用
    config.plugins = [centerTextPlugin];

    // 图例样式
    config.options.plugins = config.options.plugins || {};
    config.options.plugins.legend = {
      position: 'bottom',
      labels: {
        color: textColor,
        padding: 16,
        usePointStyle: true,
        pointStyle: 'circle',
        font: { size: 12 },
      },
    };

    // 自定义tooltip
    config.options.plugins.tooltip = {
      backgroundColor: isDark ? '#223344' : '#FFFFFF',
      titleColor: isDark ? '#E8EEF4' : '#1C2D42',
      bodyColor: isDark ? '#94AAC0' : '#5A7089',
      borderColor: isDark ? '#2E4458' : '#D6E2EE',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 10,
      callbacks: {
        label: (ctx) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = total > 0 ? Math.round((ctx.raw / total) * 100) : 0;
          return `${ctx.label}: ${ctx.raw}次 (${percentage}%)`;
        },
      },
    };

    return config;
  }

  /**
   * 显示图表空状态
   * 增强：使用EmptyState组件展示更丰富的空状态
   */
  _showChartEmpty(wrapper, text) {
    const emptyState = new EmptyState(wrapper);
    emptyState.show('stats', text.replace('<br>', ' '), '去记录', () => {
      if (window.appRouter) window.appRouter.navigate('/record');
    });
  }

  /**
   * 降级为文字统计摘要
   */
  _showTextSummary(wrapper, statsService, chartType) {
    if (chartType === 'line') {
      const trendData = statsService.getTrendData(this._currentPeriod);
      if (trendData.length === 0) {
        this._showChartEmpty(wrapper, '暂无趋势数据');
        return;
      }
      const avgIntensity = trendData.reduce((s, d) => s + d.avgIntensity, 0) / trendData.length;
      const html = `
        <div class="stats-text-summary">
          <div class="stats-text-summary__item">
            <span class="stats-text-summary__label">📊 记录天数</span>
            <span class="stats-text-summary__value">${trendData.length}天</span>
          </div>
          <div class="stats-text-summary__item">
            <span class="stats-text-summary__label">📈 平均强度</span>
            <span class="stats-text-summary__value">${avgIntensity.toFixed(1)}</span>
          </div>
        </div>
      `;
      wrapper.innerHTML = html;
    } else {
      const distData = statsService.getDistributionData(this._currentPeriod);
      if (distData.items.length === 0) {
        this._showChartEmpty(wrapper, '暂无分布数据');
        return;
      }
      let html = '<div class="stats-text-summary">';
      distData.items.forEach(item => {
        const config = MOOD_COLOR_MAP[item.moodType];
        html += `
          <div class="stats-text-summary__item">
            <span class="stats-text-summary__label">
              <span class="stats-text-summary__dot" style="background-color: ${item.color}"></span>
              ${config?.icon || ''} ${config?.label || item.moodType}
            </span>
            <span class="stats-text-summary__value">${item.count}次 (${item.percentage}%)</span>
          </div>
        `;
      });
      html += '</div>';
      wrapper.innerHTML = html;
    }
  }

  /**
   * 渲染洞察分析
   * 增强：图标和动画、stagger延迟效果、主导心情图标
   */
  _renderInsight(statsService) {
    const insight = statsService.getInsight(this._currentPeriod);
    const insightEl = this._container.querySelector('#stats-insight-content');
    if (!insightEl) return;

    let html = '';

    if (insight.hasEnoughData) {
      // 主导心情图标
      const dominantMoodConfig = insight.dominantMood ? MOOD_COLOR_MAP[insight.dominantMood] : null;
      const dominantIcon = dominantMoodConfig ? dominantMoodConfig.icon : '📊';
      const dominantLabel = dominantMoodConfig ? dominantMoodConfig.label : '';

      html += `
        <div class="stats-insight__dominant anim-content-fade-in" style="text-align: center; margin-bottom: var(--spacing-lg);">
          <span style="font-size: 40px; display: inline-block;" class="anim-bounce">${dominantIcon}</span>
          <div style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-top: var(--spacing-xs);">
            主导心情: <span style="color: ${dominantMoodConfig?.primary || 'var(--accent)'}; font-weight: var(--font-weight-semibold);">${dominantLabel}</span>
          </div>
        </div>
      `;
      html += `<p class="stats-insight__summary anim-content-fade-in">${insight.summary}</p>`;
      insight.suggestions.forEach((s, i) => {
        const icons = ['💡', '🌿', '🧘', '💪', '🎯'];
        html += `
          <div class="stats-insight__suggestion anim-content-fade-in" style="animation-delay: ${(i + 1) * 100}ms">
            <span class="stats-insight__suggestion-icon">${icons[i % icons.length]}</span>
            <span>${s}</span>
          </div>
        `;
      });
    } else {
      html += `
        <div class="stats-empty anim-content-fade-in">
          <div class="stats-empty__icon">🌱</div>
          <div class="stats-empty__text">记录更多天数后可获得洞察分析</div>
        </div>
      `;
      insight.suggestions.forEach((s, i) => {
        const icons = ['💡', '🌿', '🧘', '💪', '🎯'];
        html += `
          <div class="stats-insight__suggestion anim-content-fade-in" style="animation-delay: ${(i + 1) * 100}ms">
            <span class="stats-insight__suggestion-icon">${icons[i % icons.length]}</span>
            <span>${s}</span>
          </div>
        `;
      });
    }

    insightEl.innerHTML = html;
  }

  _subscribeEvents() {
    this.subscribeEvent(AppEvents.THEME_CHANGE, () => {
      // 主题切换时重新加载图表以更新配色
      this._loadStats();
    });
  }
}

window.StatsView = StatsView;

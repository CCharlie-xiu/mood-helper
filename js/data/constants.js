/**
 * 常量定义 — 大学生心情记录助手
 * 包含：枚举类型、心情颜色映射、localStorage键名等
 */

/* ============================================
 * 心情类型枚举 (MoodType)
 * ============================================ */
const MoodType = Object.freeze({
  HAPPY: 'happy',
  CALM: 'calm',
  ANXIOUS: 'anxious',
  SAD: 'sad',
  ANGRY: 'angry',
});

/* ============================================
 * 天气标签枚举 (WeatherTag)
 * ============================================ */
const WeatherTag = Object.freeze({
  SUNNY: 'sunny',
  CLOUDY: 'cloudy',
  OVERCAST: 'overcast',
  RAINY: 'rainy',
  SNOWY: 'snowy',
});

/* ============================================
 * 活动标签枚举 (ActivityTag)
 * ============================================ */
const ActivityTag = Object.freeze({
  STUDY: 'study',
  SPORT: 'sport',
  SOCIAL: 'social',
  ENTERTAINMENT: 'entertainment',
  REST: 'rest',
  WORK: 'work',
});

/* ============================================
 * 统计周期枚举 (StatsPeriod)
 * ============================================ */
const StatsPeriod = Object.freeze({
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
});

/* ============================================
 * 心情颜色映射配置 (MOOD_COLOR_MAP)
 * 每种心情类型对应：primary主色、light浅色、dark深色、label中文标签、icon表情
 * ============================================ */
const MOOD_COLOR_MAP = Object.freeze({
  [MoodType.HAPPY]: {
    primary: '#FFD93D',
    light: '#FFF5D4',
    dark: '#E6C235',
    label: '开心',
    icon: '😊',
  },
  [MoodType.CALM]: {
    primary: '#5EC4A8',
    light: '#D4F0E6',
    dark: '#4AAF92',
    label: '平静',
    icon: '😌',
  },
  [MoodType.ANXIOUS]: {
    primary: '#F4A261',
    light: '#FDE8D0',
    dark: '#DB8F57',
    label: '焦虑',
    icon: '😰',
  },
  [MoodType.SAD]: {
    primary: '#6BA3D6',
    light: '#D4E8F7',
    dark: '#5A90C2',
    label: '难过',
    icon: '😢',
  },
  [MoodType.ANGRY]: {
    primary: '#E76F6F',
    light: '#FAD4D4',
    dark: '#D66060',
    label: '愤怒',
    icon: '😤',
  },
});

/* ============================================
 * 天气标签映射配置
 * ============================================ */
const WEATHER_TAG_MAP = Object.freeze({
  [WeatherTag.SUNNY]: { label: '晴天', icon: '☀️' },
  [WeatherTag.CLOUDY]: { label: '多云', icon: '⛅' },
  [WeatherTag.OVERCAST]: { label: '阴天', icon: '☁️' },
  [WeatherTag.RAINY]: { label: '雨天', icon: '🌧️' },
  [WeatherTag.SNOWY]: { label: '雪天', icon: '❄️' },
});

/* ============================================
 * 活动标签映射配置
 * ============================================ */
const ACTIVITY_TAG_MAP = Object.freeze({
  [ActivityTag.STUDY]: { label: '学习', icon: '📚' },
  [ActivityTag.SPORT]: { label: '运动', icon: '🏃' },
  [ActivityTag.SOCIAL]: { label: '社交', icon: '👥' },
  [ActivityTag.ENTERTAINMENT]: { label: '娱乐', icon: '🎮' },
  [ActivityTag.REST]: { label: '休息', icon: '😴' },
  [ActivityTag.WORK]: { label: '工作', icon: '💼' },
});

/* ============================================
 * 心情动画映射 — 心情类型对应的CSS动画类名
 * ============================================ */
const MOOD_ANIMATION_MAP = Object.freeze({
  [MoodType.HAPPY]: 'anim-bounce',
  [MoodType.CALM]: 'anim-float',
  [MoodType.ANXIOUS]: 'anim-shake',
  [MoodType.SAD]: 'anim-sink',
  [MoodType.ANGRY]: 'anim-pulse',
});

/* ============================================
 * localStorage 键名常量
 * ============================================ */
const StorageKeys = Object.freeze({
  /** 所有心情记录列表 */
  RECORDS: 'mh_records',
  /** 用户设置对象 */
  SETTINGS: 'mh_settings',
  /** 数据版本号 */
  VERSION: 'mh_version',
});

/* ============================================
 * 应用常量
 * ============================================ */
const AppConstants = Object.freeze({
  /** 应用名称 */
  APP_NAME: '心情记录助手',
  /** 应用版本号 */
  APP_VERSION: '1.0.0',
  /** 数据版本号 */
  DATA_VERSION: '1.0',
  /** 文字日记最大字数 */
  MAX_DIARY_LENGTH: 500,
  /** 心情强度最小值 */
  MIN_INTENSITY: 1,
  /** 心情强度最大值 */
  MAX_INTENSITY: 5,
  /** 心情强度默认值 */
  DEFAULT_INTENSITY: 3,
  /** 单条记录最大图片数 */
  MAX_IMAGES: 3,
  /** 单张图片最大大小（字节，2MB） */
  MAX_IMAGE_SIZE: 2 * 1024 * 1024,
  /** 每日记录目标最小值 */
  MIN_DAILY_GOAL: 1,
  /** 每日记录目标最大值 */
  MAX_DAILY_GOAL: 10,
  /** 昵称最大长度 */
  MAX_NICKNAME_LENGTH: 20,
  /** 活动标签最大选择数 */
  MAX_ACTIVITY_TAGS: 6,
  /** 支持的图片格式 */
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  /** 图片压缩最大宽度 */
  IMAGE_COMPRESS_MAX_WIDTH: 800,
  /** 图片压缩质量 */
  IMAGE_COMPRESS_QUALITY: 0.7,
});

/* ============================================
 * 路由路径常量
 * ============================================ */
const RoutePaths = Object.freeze({
  HOME: '/home',
  RECORD: '/record',
  CALENDAR: '/calendar',
  STATS: '/stats',
  PROFILE: '/profile',
});

/* ============================================
 * 导航栏项配置
 * ============================================ */
const TabBarItems = Object.freeze([
  { path: RoutePaths.HOME, label: '首页', icon: 'home', activeIcon: 'home-active' },
  { path: RoutePaths.RECORD, label: '记录', icon: 'edit', activeIcon: 'edit-active' },
  { path: RoutePaths.CALENDAR, label: '日历', icon: 'calendar', activeIcon: 'calendar-active' },
  { path: RoutePaths.STATS, label: '统计', icon: 'chart', activeIcon: 'chart-active' },
  { path: RoutePaths.PROFILE, label: '我的', icon: 'user', activeIcon: 'user-active' },
]);

/* ============================================
 * 预设头像列表
 * 使用emoji作为头像标识，纯前端项目无需图片文件
 * ============================================ */
const PresetAvatars = Object.freeze([
  { id: 'default', emoji: '😊', name: '微笑' },
  { id: 'happy', emoji: '😄', name: '开心' },
  { id: 'calm', emoji: '😌', name: '平静' },
  { id: 'cool', emoji: '😎', name: '酷' },
  { id: 'love', emoji: '🥰', name: '喜爱' },
  { id: 'star', emoji: '🤩', name: '星星' },
  { id: 'think', emoji: '🤔', name: '思考' },
  { id: 'sleep', emoji: '😴', name: '休息' },
  { id: 'cat', emoji: '🐱', name: '猫咪' },
  { id: 'dog', emoji: '🐶', name: '狗狗' },
  { id: 'rabbit', emoji: '🐰', name: '兔子' },
  { id: 'bear', emoji: '🐻', name: '小熊' },
  { id: 'panda', emoji: '🐼', name: '熊猫' },
  { id: 'fox', emoji: '🦊', name: '狐狸' },
  { id: 'flower', emoji: '🌸', name: '花朵' },
]);

/* ============================================
 * SVG图标内联定义
 * 用于TabBar等组件的SVG图标渲染
 * ============================================ */
const SvgIcons = Object.freeze({
  home: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  'home-active': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  edit: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  'edit-active': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  calendar: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  'calendar-active': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  chart: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  'chart-active': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="4" height="10" rx="1"/><rect x="10" y="4" width="4" height="16" rx="1"/><rect x="16" y="8" width="4" height="12" rx="1"/></svg>',
  user: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  'user-active': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
});

/* 将常量挂载到全局 */
window.MoodType = MoodType;
window.WeatherTag = WeatherTag;
window.ActivityTag = ActivityTag;
window.StatsPeriod = StatsPeriod;
window.MOOD_COLOR_MAP = MOOD_COLOR_MAP;
window.WEATHER_TAG_MAP = WEATHER_TAG_MAP;
window.ACTIVITY_TAG_MAP = ACTIVITY_TAG_MAP;
window.MOOD_ANIMATION_MAP = MOOD_ANIMATION_MAP;
window.StorageKeys = StorageKeys;
window.AppConstants = AppConstants;
window.RoutePaths = RoutePaths;
window.TabBarItems = TabBarItems;
window.PresetAvatars = PresetAvatars;
window.SvgIcons = SvgIcons;
/**
 * 心情语录数据 — 大学生心情记录助手
 * 预置不少于31条心情语录，按日期索引轮换展示
 * 包含 encouragement（鼓励）、reflection（感悟）、humor（幽默）三个分类
 */

/**
 * 语录数据列表
 * 每条语录包含：id、content（内容）、category（分类）
 * 按日期索引轮换：使用 new Date().getDate() - 1 作为索引
 */
const MoodQuotes = Object.freeze([
  /* ---- 第1天 ---- */
  {
    quoteId: 1,
    content: '每一天都是新的开始，给自己一个微笑吧。',
    category: 'encouragement',
  },
  /* ---- 第2天 ---- */
  {
    quoteId: 2,
    content: '生活不会一直完美，但总有值得期待的瞬间。',
    category: 'encouragement',
  },
  /* ---- 第3天 ---- */
  {
    quoteId: 3,
    content: '你不必总是坚强，允许自己偶尔脆弱也是一种勇气。',
    category: 'reflection',
  },
  /* ---- 第4天 ---- */
  {
    quoteId: 4,
    content: '今天的你比昨天更进步了一点点，哪怕只是记录了心情。',
    category: 'encouragement',
  },
  /* ---- 第5天 ---- */
  {
    quoteId: 5,
    content: '生活就像一盒巧克力，你永远不知道下一颗是什么味道。',
    category: 'humor',
  },
  /* ---- 第6天 ---- */
  {
    quoteId: 6,
    content: '慢慢来，比较快。给自己多一点耐心。',
    category: 'encouragement',
  },
  /* ---- 第7天 ---- */
  {
    quoteId: 7,
    content: '心情像天气，阴天之后总会有晴天。',
    category: 'reflection',
  },
  /* ---- 第8天 ---- */
  {
    quoteId: 8,
    content: '你已经做得很好了，别对自己太苛刻。',
    category: 'encouragement',
  },
  /* ---- 第9天 ---- */
  {
    quoteId: 9,
    content: '如果觉得累了，就给自己放个小假吧。',
    category: 'encouragement',
  },
  /* ---- 第10天 ---- */
  {
    quoteId: 10,
    content: '焦虑说明你在乎，在乎说明你认真，认真的人运气不会差。',
    category: 'reflection',
  },
  /* ---- 第11天 ---- */
  {
    quoteId: 11,
    content: '人生没有白走的路，每一步都算数。',
    category: 'encouragement',
  },
  /* ---- 第12天 ---- */
  {
    quoteId: 12,
    content: '别担心，一切都会好起来的。如果还没好，说明还没到最后。',
    category: 'encouragement',
  },
  /* ---- 第13天 ---- */
  {
    quoteId: 13,
    content: '今天不想努力也没关系，明天再说嘛。',
    category: 'humor',
  },
  /* ---- 第14天 ---- */
  {
    quoteId: 14,
    content: '记录心情本身就是一种自我关怀，你正在做一件很棒的事。',
    category: 'encouragement',
  },
  /* ---- 第15天 ---- */
  {
    quoteId: 15,
    content: '成长就是不断与不完美的自己和解的过程。',
    category: 'reflection',
  },
  /* ---- 第16天 ---- */
  {
    quoteId: 16,
    content: '你的感受很重要，不要忽视内心的声音。',
    category: 'encouragement',
  },
  /* ---- 第17天 ---- */
  {
    quoteId: 17,
    content: '世界上最勇敢的事，是微笑着面对一切未知。',
    category: 'encouragement',
  },
  /* ---- 第18天 ---- */
  {
    quoteId: 18,
    content: '难过的时候，就想想那些让你笑过的人和事。',
    category: 'encouragement',
  },
  /* ---- 第19天 ---- */
  {
    quoteId: 19,
    content: '生活不止眼前的苟且，还有诗和远方。以及外卖和WiFi。',
    category: 'humor',
  },
  /* ---- 第20天 ---- */
  {
    quoteId: 20,
    content: '每一次深呼吸，都是给心灵的一次小假期。',
    category: 'reflection',
  },
  /* ---- 第21天 ---- */
  {
    quoteId: 21,
    content: '你值得被温柔以待，首先从对自己温柔开始。',
    category: 'encouragement',
  },
  /* ---- 第22天 ---- */
  {
    quoteId: 22,
    content: '没有人规定你必须一直开心，做真实的自己就好。',
    category: 'reflection',
  },
  /* ---- 第23天 ---- */
  {
    quoteId: 23,
    content: '困难只是暂时的，而你的坚强是永久的。',
    category: 'encouragement',
  },
  /* ---- 第24天 ---- */
  {
    quoteId: 24,
    content: '有时候，最好的疗愈就是好好睡一觉。',
    category: 'encouragement',
  },
  /* ---- 第25天 ---- */
  {
    quoteId: 25,
    content: '人生苦短，不如吃顿好的。然后再继续加油。',
    category: 'humor',
  },
  /* ---- 第26天 ---- */
  {
    quoteId: 26,
    content: '每一个不曾起舞的日子，都是对生命的辜负。',
    category: 'reflection',
  },
  /* ---- 第27天 ---- */
  {
    quoteId: 27,
    content: '你的存在本身就有意义，不需要向任何人证明。',
    category: 'encouragement',
  },
  /* ---- 第28天 ---- */
  {
    quoteId: 28,
    content: '与其担心未来，不如好好把握现在。',
    category: 'reflection',
  },
  /* ---- 第29天 ---- */
  {
    quoteId: 29,
    content: '即使是最小的进步，也是值得庆祝的胜利。',
    category: 'encouragement',
  },
  /* ---- 第30天 ---- */
  {
    quoteId: 30,
    content: '如果生活给你柠檬，那就做杯柠檬水吧！',
    category: 'humor',
  },
  /* ---- 第31天 ---- */
  {
    quoteId: 31,
    content: '温柔地对待自己，你正在经历的一切都值得被理解。',
    category: 'encouragement',
  },
  /* ---- 第32天（闰年2月备用） ---- */
  {
    quoteId: 32,
    content: '所有的经历都是财富，包括那些不那么愉快的。',
    category: 'reflection',
  },
  /* ---- 第33天 ---- */
  {
    quoteId: 33,
    content: '今天也是值得被记录的一天，无论心情如何。',
    category: 'encouragement',
  },
  /* ---- 第34天 ---- */
  {
    quoteId: 34,
    content: '别和往事过不去，因为它已经过去；别和现实过不去，因为你还要过下去。',
    category: 'reflection',
  },
  /* ---- 第35天 ---- */
  {
    quoteId: 35,
    content: '你比你想象的更强大，比你认为的更勇敢。',
    category: 'encouragement',
  },
]);

/**
 * 根据日期获取当天的语录
 * 使用日期天数（1-31）作为索引，确保每月不重复
 * @param {Date} [date=new Date()] - 目标日期
 * @returns {{quoteId: number, content: string, category: string}} 当日语录
 */
function getQuoteByDate(date = new Date()) {
  const dayIndex = date.getDate() - 1; // 0-based索引
  const safeIndex = dayIndex % MoodQuotes.length;
  return MoodQuotes[safeIndex];
}

/**
 * 根据分类获取语录列表
 * @param {'encouragement'|'reflection'|'humor'} category - 语录分类
 * @returns {Array} 该分类下的语录列表
 */
function getQuotesByCategory(category) {
  return MoodQuotes.filter(q => q.category === category);
}

/**
 * 获取随机语录
 * @returns {{quoteId: number, content: string, category: string}} 随机语录
 */
function getRandomQuote() {
  const index = Math.floor(Math.random() * MoodQuotes.length);
  return MoodQuotes[index];
}

/* 将语录数据和函数挂载到全局 */
window.MoodQuotes = MoodQuotes;
window.getQuoteByDate = getQuoteByDate;
window.getQuotesByCategory = getQuotesByCategory;
window.getRandomQuote = getRandomQuote;
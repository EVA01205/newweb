/* ==========================================================================
   知行共创 CoLab · V1.0 交互原型
   沿用老师 V0.2「学生接企业需求 → 交付 → 报酬」主线，补齐：
   结构化需求 / 能力画像与匹配 / 跨专业组队 / 学分认定 / 托管结算 / 学校治理
   —— 纯前端演示，数据存 localStorage，刷新不丢
   ========================================================================== */

/* ----------------------------- 1. 基础数据 ----------------------------- */
const TRACKS = ['技术开发', '视觉设计', '内容运营', '商科分析', '工程制造', '语言服务'];

/* 线性图标（内联 SVG，避免依赖图标库） */
const SVG = (d) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
  'stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
const ICONS = {
  grid: SVG('<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>'),
  list: SVG('<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>'),
  user: SVG('<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6"/>'),
  chart: SVG('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  book: SVG('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M20 18v3H6.5"/>'),
  check: SVG('<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8 12.5l2.8 2.8L16.5 9"/>'),
  plus: SVG('<circle cx="12" cy="12" r="8.5"/><path d="M12 8.5v7M8.5 12h7"/>'),
  wallet: SVG('<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18"/><circle cx="17" cy="14.5" r="1.2"/>'),
  gavel: SVG('<path d="M14 3l7 7M11 6l7 7M4 20l7-7M9.5 4.5l10 10"/>'),
  award: SVG('<circle cx="12" cy="9" r="5.5"/><path d="M8.5 14L7 21l5-2.5L17 21l-1.5-7"/>')
};

const ROLES = {
  student:    { label: '学生', name: '林一鸣', desc: '人工智能学院 · 2025级智能科学与技术', avatar: '林' },
  teacher:    { label: '教师', name: '方老师', desc: '创新创业学院 · 项目监理', avatar: '方' },
  enterprise: { label: '企业', name: '苏太太电商', desc: '需求方 · 已完成 9 个需求', avatar: '苏' },
  school:     { label: '学校', name: '校创客中心', desc: '教务处 · 平台运营方', avatar: '校' }
};

const TABS = {
  student:    [{ p: 'square', i: 'grid', n: '广场' }, { p: 'tasks', i: 'list', n: '我的任务' },
               { p: 'profile', i: 'chart', n: '成长档案' }, { p: 'mine', i: 'user', n: '我的' }],
  teacher:    [{ p: 'todo', i: 'check', n: '待办' }, { p: 'course', i: 'book', n: '课程挂接' },
               { p: 'board', i: 'chart', n: '看板' }, { p: 'mine', i: 'user', n: '我的' }],
  enterprise: [{ p: 'publish', i: 'plus', n: '发布需求' }, { p: 'demands', i: 'list', n: '我的需求' },
               { p: 'settle', i: 'wallet', n: '结算托管' }, { p: 'mine', i: 'user', n: '我的' }],
  school:     [{ p: 'gov', i: 'chart', n: '治理看板' }, { p: 'arb', i: 'gavel', n: '仲裁' },
               { p: 'credit', i: 'award', n: '学分认定' }, { p: 'mine', i: 'user', n: '我的' }]
};

const DB = {
  seq: 200,

  /* 学生能力画像：技能名 + 自评/作品验证分（0-100） */
  profile: {
    skills: [{ n: '技术开发', v: 90 }, { n: '数据洞察', v: 72 }, { n: '视觉设计', v: 58 },
             { n: '内容写作', v: 66 }, { n: '工程实践', v: 74 }],
    credit: 96,          // 履约信用分
    done: 6,             // 已完成项目
    ontime: 0.94,        // 准时率
    rework: 0.08,        // 返工率
    hours: 62,           // 累计投入工时
    credits: 2,          // 已认定学分
    creditsNeed: 4,      // 认定所需学分
    works: [
      { t: '选品问答智能体（苏太太电商）', s: '技术开发 · 4.9 分 · 已上线', m: '¥2,340' },
      { t: '减速机装配工艺动画（恒力传动）', s: '工程可视化 · 4.8 分 · 企业复购', m: '¥3,200' },
      { t: '校园咖啡小程序点单页（拾光咖啡）', s: '前端开发 · 4.7 分 · 已交付', m: '¥1,480' }
    ]
  },

  /* 需求（Brief）——真实项目的最小信息单元 */
  needs: [
    { id: 1, title: '每日坚果礼盒「双十二」主图视频', company: '苏太太电商', verified: true,
      track: '内容运营', majors: ['新闻传播学院', '设计艺术学院'], budget: [800, 1200], days: 7,
      deadline: '11-30', skills: [{ n: '短视频拍摄', w: 45 }, { n: '剪辑调色', w: 35 }, { n: '电商卖点表达', w: 20 }],
      match: 91, team: false, roles: [{ n: '视频剪辑', who: '林一鸣' }], status: 'open',
      brief: '「双十二」大促主图视频，用于天猫主图第 1 位与详情页首屏，需突出「每日一包、独立包装、无添加」。',
      deliverables: ['15 秒竖版主图视频（1080×1920）', '视频源文件与字幕', '3 版备选封面'],
      criteria: ['首帧 1 秒内出现产品与核心卖点', '字幕无错别字，品牌名写法统一', '画面无第三方水印', '上线后 3 日进店数据回执'],
      revisions: 2, ip: '著作权归企业，学生保留署名权与作品集展示权',
      milestones: [{ n: '脚本确认', p: 20 }, { n: '初稿交付', p: 40 }, { n: '终稿验收', p: 40 }],
      bonus: '进店 0.5 元/人（上限 300 元）' },

    { id: 2, title: '校园咖啡店小程序点单页改版', company: '拾光咖啡（本地生活）', verified: true,
      track: '技术开发', majors: ['计算机学院', '人工智能学院'], budget: [1200, 1800], days: 12,
      deadline: '12-05', skills: [{ n: '前端开发', w: 50 }, { n: '交互设计', w: 30 }, { n: '小程序发布流程', w: 20 }],
      match: 88, team: true, roles: [{ n: '前端开发', who: null }, { n: '视觉设计', who: null }], status: 'open',
      brief: '现有小程序点单流程 5 步、流失率高。需重构点单页，目标：3 步内完成下单，首屏加载 < 1.2s。',
      deliverables: ['可运行的小程序代码仓库', '交互原型（Figma 链接）', '上线版本与回滚包'],
      criteria: ['下单步骤 ≤ 3 步', '首屏加载 < 1.2s（4G 环境）', '兼容主流机型，微信开发者工具无报错'],
      revisions: 2, ip: '代码著作权归企业，学生可复用通用组件',
      milestones: [{ n: '原型确认', p: 30 }, { n: '开发交付', p: 40 }, { n: '上线验收', p: 30 }],
      bonus: '加购 1 元/个（上限 200 元）' },

    { id: 3, title: '减速机装配工艺可视化动画', company: '恒力传动', verified: true,
      track: '工程制造', majors: ['机械工程学院', '设计艺术学院'], budget: [3000, 5000], days: 21,
      deadline: '12-15', skills: [{ n: '三维建模', w: 40 }, { n: '动画渲染', w: 35 }, { n: '机械工艺理解', w: 25 }],
      match: 74, team: true, roles: [{ n: '三维建模', who: null }, { n: '动画渲染', who: null }, { n: '工艺校核', who: null }], status: 'open',
      brief: '用于新员工培训与客户讲解：把 6 道装配工序做成 90 秒三维动画，需标注关键扭矩与配合公差。',
      deliverables: ['90 秒 1080P 动画', '工程图标注校对记录', '中英双字幕版本'],
      criteria: ['工序顺序与工艺卡一致', '关键参数标注误差为 0', '动画无穿模、无明显闪烁'],
      revisions: 3, ip: '企业独占使用，学生可展示低分辨率样片',
      milestones: [{ n: '分镜脚本', p: 20 }, { n: '白模预演', p: 30 }, { n: '终版交付', p: 50 }],
      bonus: '按验收评分 4.8 以上追加 500 元' },

    { id: 4, title: '富硒大米品牌包装与详情页', company: '金穗合作社', verified: true,
      track: '视觉设计', majors: ['设计艺术学院', '经济管理学院'], budget: [2000, 3000], days: 14,
      deadline: '12-08', skills: [{ n: '包装设计', w: 40 }, { n: '电商详情页', w: 35 }, { n: '品牌叙事', w: 25 }],
      match: 86, team: false, roles: [{ n: '视觉设计', who: '王雨' }], status: 'open',
      brief: '地理标志农产品，需做 5kg 礼盒包装 + 京东详情页，主线「富硒土壤 + 溯源可视」。',
      deliverables: ['包装印刷稿（含出血与刀版）', '详情页 8 屏设计稿', '品牌故事文案'],
      criteria: ['符合食品标签国标', '印刷文件 CMYK、300dpi', '详情页首屏 3 秒内说清差异化'],
      revisions: 2, ip: '设计著作权归合作社，学生可入作品集',
      milestones: [{ n: '概念提案', p: 30 }, { n: '设计定稿', p: 40 }, { n: '印刷跟单', p: 30 }],
      bonus: '包装上市后按销量返点 1%' },

    { id: 5, title: '英文产品手册本地化（中译英）', company: '海拓外贸', verified: true,
      track: '语言服务', majors: ['外国语学院'], budget: [900, 1400], days: 10,
      deadline: '12-02', skills: [{ n: '技术文档翻译', w: 55 }, { n: '术语一致性管理', w: 25 }, { n: '排版校对', w: 20 }],
      match: 81, team: false, roles: [], status: 'open',
      brief: '48 页产品手册中译英，面向北美经销商，需使用企业术语库（已提供）。',
      deliverables: ['英文手册 PDF + 可编辑源文件', '术语表（更新版）', '双人校对记录'],
      criteria: ['术语库命中率 100%', '无中式英语，母语审校通过', '版式与中文版一一对应'],
      revisions: 1, ip: '译文著作权归企业，学生留底稿用于作品集',
      milestones: [{ n: '样章试译', p: 30 }, { n: '全稿交付', p: 50 }, { n: '审校定稿', p: 20 }],
      bonus: '母语审校一次通过追加 200 元' },

    { id: 6, title: '选品问答智能体（含知识库）', company: '苏太太电商', verified: true,
      track: '技术开发', majors: ['人工智能学院', '计算机学院'], budget: [2000, 2600], days: 18,
      deadline: '12-10', skills: [{ n: '大模型应用', w: 45 }, { n: '知识库构建', w: 30 }, { n: '全栈开发', w: 25 }],
      match: 95, team: false, roles: [{ n: '技术开发', who: '林一鸣' }], status: 'open',
      brief: '根据客单价、口味偏好、送礼场景推荐坚果组合，接入店铺客服系统，回答需引用商品库并给购买链接。',
      deliverables: ['可部署的服务端代码', '商品知识库与测评集（≥100 条）', '上线配置说明'],
      criteria: ['测评集准确率 ≥ 88%', '单次响应 < 3s', '不出现价格与库存幻觉'],
      revisions: 2, ip: '代码著作权归企业，学生保留方法论复用权',
      milestones: [{ n: '方案确认', p: 30 }, { n: '联调交付', p: 40 }, { n: '上线验收', p: 30 }],
      bonus: '加购 1 元/个（上限 500 元）' },

    { id: 7, title: '实验数据可视化看板', company: '瑞泽生物', verified: false,
      track: '技术开发', majors: ['人工智能学院', '数学与统计学院'], budget: [2600, 3600], days: 20,
      deadline: '12-18', skills: [{ n: '数据可视化', w: 40 }, { n: 'Python 数据处理', w: 35 }, { n: '生物实验基础', w: 25 }],
      match: 79, team: true, roles: [{ n: '数据开发', who: null }, { n: '领域校核', who: null }], status: 'open',
      brief: '把 ELISA 实验的批次数据做成可交互看板，支持批次对比、异常值标注与导出报告。',
      deliverables: ['看板系统（Docker 部署）', '数据处理脚本', '使用手册'],
      criteria: ['10 万行数据加载 < 5s', '统计口径经领域同学复核签字', '导出报告含图表与原始数据链接'],
      revisions: 2, ip: '系统著作权归企业，学生可开源通用组件',
      milestones: [{ n: '需求确认', p: 30 }, { n: '开发交付', p: 40 }, { n: '部署验收', p: 30 }],
      bonus: '按期上线追加 300 元' },

    { id: 8, title: '短视频账号月度内容代运营', company: '云台文旅', verified: true,
      track: '内容运营', majors: ['新闻传播学院', '设计艺术学院'], budget: [1500, 2000], days: 30,
      deadline: '12-20', skills: [{ n: '短视频策划', w: 40 }, { n: '拍摄剪辑', w: 35 }, { n: '账号运营', w: 25 }],
      match: 84, team: true, roles: [{ n: '编导', who: null }, { n: '剪辑', who: null }], status: 'open',
      brief: '景区官方号月度 12 条内容，目标涨粉 3000、单条完播率 > 35%。',
      deliverables: ['12 条成片（含封面文案）', '选题日历', '月度数据复盘报告'],
      criteria: ['内容符合景区宣传口径（送审 1 次）', '完播率达标', '无版权音乐纠纷'],
      revisions: 1, ip: '素材授权企业使用，学生可署名展示',
      milestones: [{ n: '选题确认', p: 20 }, { n: '首批交付', p: 40 }, { n: '月度结案', p: 40 }],
      bonus: '涨粉达标另有 500 元奖励' },

    { id: 9, title: '合同风险提示知识库（技术 + 法学）', company: '明理律所', verified: true,
      track: '技术开发', majors: ['法学院', '人工智能学院'], budget: [1800, 2400], days: 15,
      deadline: '12-12', skills: [{ n: '知识库构建', w: 40 }, { n: '合同条款理解', w: 35 }, { n: '检索评测', w: 25 }],
      match: 70, team: true, roles: [{ n: '技术实现', who: null }, { n: '法学校核', who: null }], status: 'open',
      brief: '把 200 份采购合同的常见风险条款整理为可检索知识库，标注风险等级与修改建议。',
      deliverables: ['知识库与检索界面', '风险条款标注规范', '评测报告'],
      criteria: ['标注与律师复核一致率 ≥ 90%', '检索命中率 ≥ 85%', '不输出法律意见式结论'],
      revisions: 2, ip: '数据与标注归律所，方法可复用',
      milestones: [{ n: '标注规范', p: 30 }, { n: '知识库交付', p: 40 }, { n: '评测验收', p: 30 }],
      bonus: '复核一致率 95% 以上追加 300 元' },

    /* 企业刚提交、等待平台审核的需求（教师待办里可见，学生广场不可见） */
    { id: 10, title: '直播间福袋话术脚本（30 条）', company: '苏太太电商', verified: false,
      track: '内容运营', majors: ['新闻传播学院', '经济管理学院'], budget: [400, 600], days: 5,
      deadline: '11-28', skills: [{ n: '直播话术', w: 50 }, { n: '促销心理学', w: 30 }, { n: '合规意识', w: 20 }],
      match: 77, team: false, roles: [], status: 'review',
      brief: '为店铺直播间编写 30 条福袋话术，覆盖开场、憋单、逼单、下场预告四个环节。',
      deliverables: ['30 条话术脚本（含使用场景标注）', '违禁词自检表'],
      criteria: ['不出现「最」「第一」等违禁词', '每条话术标注适用场景', '与店铺客单价匹配'],
      revisions: 1, ip: '著作权归企业，学生保留署名权',
      milestones: [{ n: '试写 5 条', p: 30 }, { n: '全量交付', p: 70 }],
      bonus: '话术被采用 20 条以上追加 200 元' }
  ],

  /* 任务（认领后的执行实例） stage: 0 认领 1 制作 2 提交 3 验收 4 结算 */
  tasks: [
    { id: 101, needId: 6, title: '选品问答智能体（含知识库）', owner: '林一鸣', mine: true,
      status: 'check', stage: 2, pay: 2340, paid: false, submitted: '11-23 18:20',
      link: 'https://demo.colab.edu.cn/works/agent-nuts', note: '自测 108 条，准确率 91.7%',
      selfcheck: [true, true, true, true] },
    { id: 102, needId: 1, title: '每日坚果礼盒「双十二」主图视频', owner: '林一鸣', mine: true,
      status: 'doing', stage: 1, pay: 1180, paid: false, submitted: null, link: '', note: '',
      selfcheck: [false, false, false, false] },
    { id: 103, needId: 8, title: '短视频账号月度内容代运营', owner: '张华', mine: false,
      status: 'check', stage: 2, pay: 1600, paid: false, submitted: '11-23 20:05',
      link: 'https://demo.colab.edu.cn/works/video-yt', note: '首批 6 条已发布，完播 38%',
      selfcheck: [true, true, true, true] },
    { id: 104, needId: 4, title: '富硒大米品牌包装与详情页', owner: '王雨', mine: false,
      status: 'check', stage: 2, pay: 2450, paid: false, submitted: '11-24 09:12',
      link: 'https://demo.colab.edu.cn/works/rice-pack', note: '包装刀版已过印厂校核',
      selfcheck: [true, true, true, false] },
    { id: 105, needId: 3, title: '减速机装配工艺可视化动画', owner: '林一鸣', mine: true,
      status: 'done', stage: 4, pay: 3200, paid: true, submitted: '11-10 16:40',
      link: 'https://demo.colab.edu.cn/works/gear-anim', note: '企业评分 4.8，已结算',
      selfcheck: [true, true, true, true] },
    { id: 106, needId: 5, title: '英文产品手册本地化（中译英）', owner: '林一鸣', mine: true,
      status: 'done', stage: 4, pay: 1120, paid: true, submitted: '11-06 11:00',
      link: 'https://demo.colab.edu.cn/works/manual-en', note: '母语审校一次通过',
      selfcheck: [true, true, true, true] },
    { id: 107, needId: 9, title: '合同风险提示知识库（技术 + 法学）', owner: '陈默', mine: false,
      status: 'doing', stage: 1, pay: 2100, paid: false, submitted: null, link: '', note: '',
      selfcheck: [false, false, false, false], overdue: true },
    /* 教师已验收、等待企业释放款项的任务 */
    { id: 108, needId: 7, title: '实验数据可视化看板', owner: '王雨', mine: false,
      status: 'settle', stage: 3, pay: 2900, paid: false, submitted: '11-22 14:10',
      link: 'https://demo.colab.edu.cn/works/bio-board', note: '已通过教师验收，等待释放',
      selfcheck: [true, true, true, true] }
  ],

  /* 学校侧仲裁 */
  arbs: [
    { id: 1, taskId: 104, title: '富硒大米包装：印厂色差责任归属', parties: '王雨 / 金穗合作社',
      claim: '企业主张色差为重做，学生主张按印刷打样已确认', status: 'pending', days: 2 },
    { id: 2, taskId: 103, title: '文旅短视频：完播率未达标是否扣减', parties: '张华 / 云台文旅',
      claim: '企业要求按 70% 结算，学生要求全额', status: 'pending', days: 3 }
  ],

  /* 教师课程挂接 */
  courses: [
    { id: 1, name: '数字媒体创作实践', cls: '新闻传播学院 · 2024 级 3 班', needId: 1, joined: 38 },
    { id: 2, name: '小程序开发实训', cls: '计算机学院 · 2023 级 1 班', needId: 2, joined: 26 },
    { id: 3, name: '电子商务视觉设计', cls: '设计艺术学院 · 2024 级 2 班', needId: 4, joined: 31 }
  ],

  /* 学期治理数据（学校端） */
  gov: {
    students: 1284, majors: 14, enterprises: 63, repeats: 0.42,
    gmv: 386000, avgIncome: 301, arbitrations: 3, creditIssued: 118
  }
};

/* ----------------------------- 2. 状态 ----------------------------- */
const KEY = 'colab-v1-state';
let S = { role: 'student', page: 'square', filter: 'all', seg: 'all', needId: null };
let WIZ = null;

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      needs: DB.needs, tasks: DB.tasks, arbs: DB.arbs, courses: DB.courses, seq: DB.seq
    }));
  } catch (e) { /* file:// 下可能受限，忽略 */ }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    ['needs', 'tasks', 'arbs', 'courses'].forEach(k => { if (d[k]) DB[k] = d[k]; });
    if (d.seq) DB.seq = d.seq;
  } catch (e) { /* ignore */ }
}

/* ----------------------------- 3. 工具 ----------------------------- */
const money = n => '¥' + Number(n).toLocaleString('zh-CN');
/* 简单转义：数据虽多为内置，但用户可在发布向导里输入文本 */
const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function toast(m) {
  const t = document.getElementById('toast');
  t.textContent = m;
  t.classList.add('on');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('on'), 2000);
}

function ring(score) {
  const r = 19, c = 2 * Math.PI * r, off = c * (1 - score / 100);
  return '<div class="ring"><svg width="46" height="46" viewBox="0 0 46 46">' +
    '<circle cx="23" cy="23" r="19" fill="none" stroke="#edf1f0" stroke-width="4"/>' +
    '<circle cx="23" cy="23" r="19" fill="none" stroke="#0e6b5e" stroke-width="4" stroke-linecap="round" ' +
    'stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/></svg>' +
    '<div class="num">' + score + '</div></div>';
}

function radar(skills) {
  const cx = 84, cy = 78, R = 52, n = skills.length;
  const pt = (i, r) => [cx + R * r * Math.cos(-Math.PI / 2 + i * 2 * Math.PI / n),
                        cy + R * r * Math.sin(-Math.PI / 2 + i * 2 * Math.PI / n)];
  let grid = '';
  [0.25, 0.5, 0.75, 1].forEach(r => {
    grid += '<polygon points="' + skills.map((s, i) => pt(i, r).map(v => v.toFixed(1)).join(',')).join(' ') +
      '" fill="none" stroke="#e6ebe9" stroke-width="1"/>';
  });
  const axes = skills.map((s, i) => {
    const p = pt(i, 1);
    return '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) +
      '" stroke="#e6ebe9" stroke-width="1"/>';
  }).join('');
  const shape = skills.map((s, i) => pt(i, s.v / 100).map(v => v.toFixed(1)).join(',')).join(' ');
  const labels = skills.map((s, i) => {
    const p = pt(i, 1.24);
    return '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] + 3).toFixed(1) +
      '" font-size="8.5" fill="#5c6b68" text-anchor="middle">' + s.n + '</text>';
  }).join('');
  return '<svg viewBox="0 0 168 158" width="168" height="158">' + grid + axes +
    '<polygon points="' + shape + '" fill="rgba(14,107,94,.16)" stroke="#0e6b5e" stroke-width="1.6"/>' +
    labels + '</svg>';
}

function steps(cur) {
  const names = ['认领', '制作', '提交', '验收', '结算'];
  return '<div class="steps">' + names.map((n, i) =>
    '<div class="s ' + (i <= cur ? 'on' : '') + '"><i></i>' + n + '</div>').join('') + '</div>';
}

function statusTag(t) {
  if (t.status === 'doing') {
    return t.overdue ? '<span class="tag bad">已超时</span>' : '<span class="tag warn">制作中</span>';
  }
  if (t.status === 'check') return '<span class="tag info">待验收</span>';
  if (t.status === 'settle') return '<span class="tag acc">待结算</span>';
  return '<span class="tag ok">已结算</span>';
}

const needById = id => DB.needs.find(n => n.id === id);
const taskById = id => DB.tasks.find(t => t.id === id);

/* ----------------------------- 4. 渲染框架 ----------------------------- */
function render() {
  renderNav();
  const el = document.getElementById('page');
  const r = S.role, p = S.page;
  let html = '';
  if (r === 'student') {
    if (p === 'square') html = pageSquare();
    else if (p === 'need') html = pageNeed();
    else if (p === 'tasks') html = pageTasks();
    else if (p === 'profile') html = pageProfile();
    else html = pageMine();
  } else if (r === 'teacher') {
    if (p === 'todo') html = pageTodo();
    else if (p === 'course') html = pageCourse();
    else if (p === 'board') html = pageBoard();
    else html = pageMine();
  } else if (r === 'enterprise') {
    if (p === 'publish') html = pagePublish();
    else if (p === 'demands') html = pageDemands();
    else if (p === 'settle') html = pageSettle();
    else html = pageMine();
  } else {
    if (p === 'gov') html = pageGov();
    else if (p === 'arb') html = pageArb();
    else if (p === 'credit') html = pageCredit();
    else html = pageMine();
  }
  el.innerHTML = html;
}

/* 一套导航数据渲染三处：桌面侧边栏 / 移动端顶部栏 / 移动端底部标签栏 */
function renderNav() {
  const tabs = TABS[S.role], r = ROLES[S.role];
  const isOn = t => S.page === t.p || (S.page === 'need' && t.p === 'square');

  document.getElementById('sidenav').innerHTML =
    '<div class="brand"><div class="logo">知</div><div>' +
    '<div class="t">知行共创 CoLab</div><div class="s">校园真实需求共创平台 V1.0</div></div></div>' +
    '<div class="nav">' + tabs.map(t =>
      '<div class="nav-item ' + (isOn(t) ? 'on' : '') + '" onclick="A.go(\'' + t.p + '\')">' +
      (ICONS[t.i] || '') + '<span>' + t.n + '</span></div>').join('') + '</div>' +
    '<div class="side-user" onclick="A.openRoles()">' +
    '<div class="av">' + r.avatar + '</div>' +
    '<div class="grow"><div class="n">' + r.name + '</div><div class="d">' + r.desc + '</div></div>' +
    '<span class="switch">切换</span></div>';

  document.getElementById('appbar').innerHTML =
    '<div class="avatar">' + r.avatar + '</div>' +
    '<div class="who"><div class="n">' + r.name + '</div><div class="d">' + r.desc + '</div></div>' +
    '<div class="rolechip" onclick="A.openRoles()">' + r.label + ' 视角 ▾</div>';

  document.getElementById('tabbar').innerHTML = tabs.map(t =>
    '<div class="tb ' + (isOn(t) ? 'on' : '') + '" onclick="A.go(\'' + t.p + '\')">' +
    '<i>' + (ICONS[t.i] || '') + '</i>' + t.n + '</div>').join('');
}

/* ----------------------------- 5. 学生端 ----------------------------- */
function pageSquare() {
  const open = DB.needs.filter(n => n.status === 'open');
  let list = open.slice();
  if (S.filter === 'high') list = list.filter(n => n.match >= 85);
  if (S.filter === 'major') list = list.filter(n => n.majors.includes('人工智能学院'));
  if (S.filter === 'team') list = list.filter(n => n.team);
  if (S.filter === 'budget') list = list.filter(n => n.budget[1] >= 2000);
  list.sort((a, b) => b.match - a.match);

  const chips = [['all', '全部'], ['high', '高匹配'], ['major', '我的专业'], ['team', '可组队'], ['budget', '高预算']];
  return '<div class="h1">需求广场</div>' +
    '<div class="h1sub">今日为你匹配 <b>' + open.length + '</b> 个真实需求 · 按匹配度排序，不再先到先得</div>' +
    '<div class="grid3" style="margin-bottom:12px">' +
    '<div class="stat"><div class="n">' + open.filter(n => n.match >= 85).length + '</div><div class="l">高匹配需求</div></div>' +
    '<div class="stat"><div class="n">' + open.filter(n => n.team).length + '</div><div class="l">可跨专业组队</div></div>' +
    '<div class="stat"><div class="n">' + DB.profile.credit + '</div><div class="l">我的信用分</div></div></div>' +
    '<div class="chips">' + chips.map(c =>
      '<div class="chip ' + (S.filter === c[0] ? 'on' : '') + '" onclick="A.setFilter(\'' + c[0] + '\')">' + c[1] + '</div>').join('') +
    '</div>' +
    (list.length ? '<div class="needgrid">' + list.map(needCard).join('') + '</div>'
                 : '<div class="empty">没有符合条件的需求，换个筛选试试</div>') +
    '<div class="note mt14">匹配度 = 技能命中 50% + 专业相关 20% + 档期 15% + 履约信用 15%。认领前可先申请组队，补齐自己缺的技能位。</div>';
}

function needCard(n) {
  const openRoles = n.roles.filter(r => !r.who).length;
  return '<div class="card needcard" onclick="A.openNeed(' + n.id + ')">' +
    '<div class="row between top"><div class="grow">' +
    '<h4>' + esc(n.title) + '</h4>' +
    '<div class="co">' + esc(n.company) + (n.verified ? ' <span class="verified">✓ 已认证</span>' : ' <span class="tag line">审核中</span>') +
    ' · ' + n.track + '</div></div>' + ring(n.match) + '</div>' +
    '<div class="skillrow">' + n.skills.map(s => '<span class="tag pri">' + s.n + '</span>').join('') +
    (n.team ? '<span class="tag acc">可组队 ' + (openRoles || n.roles.length) + ' 个技能位</span>' : '') + '</div>' +
    '<div class="needmeta"><span class="money">' + money(n.budget[0]) + '–' + money(n.budget[1]) + '</span>' +
    '<span>' + n.days + ' 天</span><span>截止 ' + n.deadline + '</span></div></div>';
}

function pageNeed() {
  const n = needById(S.needId);
  if (!n) return '<div class="empty">需求不存在</div>';
  const mine = DB.tasks.find(t => t.needId === n.id && t.mine);
  const claimed = !!mine;
  const roleRows = n.roles.map(r =>
    '<div class="row between" style="padding:4px 0"><span class="small">' + r.n + '</span>' +
    (r.who ? '<span class="tag ok">' + r.who + ' 已认领</span>' : '<span class="tag line">待认领</span>') + '</div>').join('');
  const others = DB.needs.filter(x => x.status === 'open' && x.id !== n.id && x.track === n.track).slice(0, 3);

  /* 右栏（桌面）：预算摘要 + 认领入口；移动端只保留底部认领条 */
  const side =
    '<aside class="detail-side">' +
    '<div class="card side-card">' +
    '<div class="row between top"><div><div class="tiny muted">预算区间（元）</div>' +
    '<div class="strong" style="font-size:24px;color:var(--acc);line-height:1.3">' + n.budget[0] + '–' + n.budget[1] + '</div></div>' +
    ring(n.match) + '</div>' +
    '<div class="kv"><span class="k">工期</span><span class="v">' + n.days + ' 天</span></div>' +
    '<div class="kv"><span class="k">截止</span><span class="v">' + n.deadline + '</span></div>' +
    '<div class="kv"><span class="k">赛道</span><span class="v">' + n.track + '</span></div>' +
    '<div class="kv"><span class="k">付款节点</span><span class="v">' + n.milestones.length + ' 段（' +
      n.milestones.map(m => m.p).join('/') + '）</span></div>' +
    '<div class="kv"><span class="k">修改次数</span><span class="v">最多 ' + n.revisions + ' 次</span></div>' +
    '<div class="kv"><span class="k">组队</span><span class="v">' + (n.team ? '允许跨专业组队' : '个人承接') + '</span></div>' +
    '<div class="note mt10">匹配度 ' + n.match + ' · 命中 ' + n.skills.length + '/' + n.skills.length + ' 项技能 · 本周档期充足</div>' +
    '</div>' +
    (others.length ?
      '<div class="card side-card" style="margin-top:12px"><div class="tiny muted mb6">同赛道其他需求</div>' +
      others.map(o => '<div class="row between" style="padding:8px 0;border-bottom:1px solid #f1f4f3;cursor:pointer" onclick="A.openNeed(' + o.id + ')">' +
        '<div class="grow"><div class="small">' + esc(o.title) + '</div>' +
        '<div class="tiny muted">' + esc(o.company) + ' · ' + money(o.budget[1]) + '</div></div>' +
        '<span class="tag line">' + o.match + '</span></div>').join('') + '</div>' : '') +
    '<div class="side-cta">' +
    (claimed
      ? '<button class="btn ghost" onclick="A.go(\'tasks\')">已认领 · 去我的任务</button>'
      : '<button class="btn line" onclick="A.applyTeam(' + n.id + ')">申请组队</button>' +
        '<button class="btn" onclick="A.claim(' + n.id + ')">认领这个需求</button>') +
    '</div></aside>';

  const main =
    '<div class="detail-main">' +
    '<div class="card">' +
    '<div class="row between top"><div class="grow"><h4 style="margin:0 0 6px;font-size:19px;line-height:1.4">' + esc(n.title) + '</h4>' +
    '<div class="co small muted">' + esc(n.company) + ' · ' + n.track + '</div></div>' +
    '<span class="tag ' + (n.verified ? 'info' : 'line') + '">' + (n.verified ? '企业已实名认证' : '企业审核中') + '</span></div>' +
    '<div class="hide-desktop"><div class="grid3 mt14">' +
    '<div class="stat"><div class="n acc" style="font-size:17px">' + n.budget[0] + '–' + n.budget[1] + '</div><div class="l">预算（元）</div></div>' +
    '<div class="stat"><div class="n" style="font-size:17px">' + n.days + '</div><div class="l">工期（天）</div></div>' +
    '<div class="stat"><div class="n" style="font-size:17px">' + n.milestones.length + '</div><div class="l">付款节点</div></div></div></div>' +
    '</div>' +

    '<div class="sec"><div class="t">为什么推荐给你</div><div class="a">匹配说明</div></div>' +
    '<div class="card tight">' +
    n.skills.map(s => '<div class="row between" style="padding:3px 0"><span class="small">' + s.n + '</span>' +
      '<span class="small muted">权重 ' + s.w + '% · 你已具备</span></div>' +
      '<div class="bar mb6"><i style="width:' + Math.min(100, 40 + s.w) + '%"></i></div>').join('') +
    '<div class="note mt10">命中 ' + n.skills.length + '/' + n.skills.length + ' 项技能 · 专业相关度 高 · 本周档期充足</div></div>' +

    '<div class="sec"><div class="t">需求 Brief（结构化）</div><div class="a">' + n.revisions + ' 次修改上限</div></div>' +
    '<div class="card tight">' +
    '<div class="small strong mb6">项目背景</div><div class="small muted" style="line-height:1.7">' + esc(n.brief) + '</div>' +
    '<div class="small strong mt14 mb6">交付物清单</div>' +
    n.deliverables.map(d => '<div class="check"><div class="box" style="background:#0e6b5e;border-color:#0e6b5e">✓</div><div class="small">' + d + '</div></div>').join('') +
    '<div class="small strong mt14 mb6">验收标准</div>' +
    n.criteria.map(d => '<div class="small muted" style="padding:2px 0">· ' + d + '</div>').join('') +
    '<div class="small strong mt14 mb6">里程碑与付款</div>' +
    n.milestones.map(m => '<div class="row between" style="padding:3px 0"><span class="small">' + m.n + '</span>' +
      '<span class="small strong">' + m.p + '%</span></div>').join('') +
    '<div class="note gray mt14">知识产权：' + n.ip + '<br>效果奖励：' + n.bonus + '</div></div>' +

    (n.team ? '<div class="sec"><div class="t">组队进度</div><div class="a">跨专业协作</div></div>' +
      '<div class="card tight">' + roleRows + '<div class="note acc mt10">团队提交由队长负责，分润比例在开组时即锁定，避免结算争议。</div></div>' : '') +
    '</div>';

  return '<div class="row" style="margin:2px 0 14px">' +
    '<button class="btn line sm" onclick="A.back()">‹ 返回广场</button>' +
    '<span class="tiny muted">需求编号 #' + n.id + '</span></div>' +
    '<div class="detail-grid">' + main + side + '</div>';
}

function pageTasks() {
  const mine = DB.tasks.filter(t => t.mine);
  const segs = [['all', '全部'], ['doing', '进行中'], ['check', '待验收'], ['done', '已完成']];
  const list = mine.filter(t => S.seg === 'all' || t.status === S.seg);
  return '<div class="h1">我的任务</div>' +
    '<div class="h1sub">每条任务都有完整的 SOP、里程碑和结算记录</div>' +
    '<div class="seg">' + segs.map(s =>
      '<div class="' + (S.seg === s[0] ? 'on' : '') + '" onclick="A.setSeg(\'' + s[0] + '\')">' + s[1] +
      (s[0] === 'all' ? ' ' + mine.length : '') + '</div>').join('') + '</div>' +
    (list.length ? '<div class="taskgrid">' + list.map(taskCard).join('') + '</div>'
                 : '<div class="empty">这里还没有任务</div>') +
    '<div class="note mt14">提交后企业有 72 小时验收期，超时自动通过；被打回会回到「制作中」，修改次数计入 Brief 上限。</div>';
}

function taskCard(t) {
  const n = needById(t.needId) || { title: t.title, company: '' };
  let cta = '';
  if (t.status === 'doing') cta = '<button class="btn sm" onclick="A.openSubmit(' + t.id + ')">提交作品</button>';
  else if (t.status === 'check') cta = '<button class="btn sm line" onclick="A.timeline(' + t.id + ')">查看进度</button>';
  else if (t.status === 'settle') cta = '<button class="btn sm ghost" onclick="A.timeline(' + t.id + ')">等待打款</button>';
  else cta = '<button class="btn sm line" onclick="A.timeline(' + t.id + ')">结算凭证</button>';

  return '<div class="card">' +
    '<div class="row between top"><div class="grow">' +
    '<div class="strong" style="font-size:13.5px;line-height:1.4">' + esc(n.title) + '</div>' +
    '<div class="small muted mt6">' + esc(n.company) + ' · ' + statusTag(t) + '</div></div>' +
    '<div style="text-align:right"><div class="strong" style="color:#e07a3f">' + money(t.pay) + '</div>' +
    '<div class="tiny muted">' + (t.paid ? '已到账' : '托管中') + '</div></div></div>' +
    steps(t.stage) +
    '<div class="row between mt6">' +
    '<span class="tiny muted">' + (t.submitted ? '提交于 ' + t.submitted : '截止 11-30') + '</span>' + cta + '</div></div>';
}

function pageProfile() {
  const p = DB.profile;
  const left =
    '<div class="profile-left">' +
    '<div class="card"><div class="radarwrap">' + radar(p.skills) +
    '<div class="legend">能力来自<br><b>作品验证</b> 与 <b>三方评价</b><br>不是自填标签<br><br>' +
    '<span class="tag ok">信用分 ' + p.credit + '</span></div></div></div>' +
    '<div class="grid3" style="margin-bottom:12px">' +
    '<div class="stat"><div class="n">' + p.done + '</div><div class="l">完成项目</div></div>' +
    '<div class="stat"><div class="n">' + Math.round(p.ontime * 100) + '%</div><div class="l">准时交付率</div></div>' +
    '<div class="stat"><div class="n">' + p.hours + 'h</div><div class="l">累计工时</div></div></div>' +
    '<div class="card tight"><div class="row between mb6"><span class="small strong">实践学分认定</span>' +
    '<span class="small">' + p.credits + ' / ' + p.creditsNeed + ' 学分</span></div>' +
    '<div class="bar"><i style="width:' + (p.credits / p.creditsNeed * 100) + '%"></i></div>' +
    '<div class="note mt10">再完成 2 个学分即可打印《创新创业实践学分认定单》，由教务处盖章生效。</div></div>' +
    '</div>';

  const right =
    '<div class="profile-right">' +
    '<div class="sec" style="margin-top:0"><div class="t">能力证据卡</div>' +
    '<div class="a" onclick="A.toast(\'作品集 PDF 已生成（演示）\')">导出作品集</div></div>' +
    '<div class="card tight">' + p.works.map(w =>
      '<div class="work"><div class="thumb">◈</div><div class="grow">' +
      '<div class="wt">' + w.t + '</div><div class="ws">' + w.s + '</div></div>' +
      '<div class="tiny strong" style="color:var(--acc)">' + w.m + '</div></div>').join('') + '</div>' +
    '<div class="note acc mt10">每张证据卡包含：需求 Brief、你的交付物、企业评分、教师点评、可核验的交付时间线。</div>' +
    '</div>';

  return '<div class="h1">成长档案</div>' +
    '<div class="h1sub">能力、作品、信用与学分，一处沉淀、一键导出</div>' +
    '<div class="profile-grid">' + left + right + '</div>';
}

/* ----------------------------- 6. 教师端 ----------------------------- */
function pageTodo() {
  const checks = DB.tasks.filter(t => t.status === 'check' && !t.mine);
  const myCheck = DB.tasks.filter(t => t.status === 'check' && t.mine);
  const review = DB.needs.filter(n => n.status === 'review');
  const overdue = DB.tasks.filter(t => t.overdue);

  return '<div class="h1">待办</div>' +
    '<div class="h1sub">验收、需求审核与超时预警集中在一处</div>' +
    '<div class="grid3" style="margin-bottom:12px">' +
    '<div class="stat"><div class="n">' + (checks.length + myCheck.length) + '</div><div class="l">待验收</div></div>' +
    '<div class="stat"><div class="n">' + review.length + '</div><div class="l">需求待审核</div></div>' +
    '<div class="stat"><div class="n acc">' + overdue.length + '</div><div class="l">超时预警</div></div></div>' +

    (review.length ? '<div class="sec"><div class="t">需求审核</div><div class="a">企业提交后需人工过审</div></div>' +
      '<div class="taskgrid">' + review.map(n => '<div class="card tight"><div class="row between top"><div class="grow">' +
        '<div class="strong" style="font-size:13px">' + esc(n.title) + '</div>' +
        '<div class="small muted mt6">' + esc(n.company) + ' · ' + n.track + ' · ' + money(n.budget[0]) + '–' + money(n.budget[1]) + '</div></div>' +
        '<span class="tag warn">待审核</span></div>' +
        '<div class="row mt10"><button class="btn sm ghost grow" onclick="A.auditNeed(' + n.id + ',false)">退回补充</button>' +
        '<button class="btn sm grow" onclick="A.auditNeed(' + n.id + ',true)">通过并发布</button></div></div>').join('') + '</div>' : '') +

    '<div class="sec"><div class="t">待验收任务</div><div class="a">72h 内需处理</div></div>' +
    '<div class="taskgrid">' + checks.concat(myCheck).map(t => {
      const n = needById(t.needId) || { title: t.title };
      return '<div class="card tight"><div class="row between top"><div class="grow">' +
        '<div class="strong" style="font-size:13px">' + esc(n.title) + '</div>' +
        '<div class="small muted mt6">' + t.owner + ' 提交于 ' + (t.submitted || '—') + ' · ' + money(t.pay) + '</div></div>' +
        '<span class="tag info">待验收</span></div>' +
        '<div class="row mt10"><button class="btn sm line grow" onclick="A.timeline(' + t.id + ')">看交付</button>' +
        '<button class="btn sm grow" onclick="A.openReview(' + t.id + ')">验收</button></div></div>';
    }).join('') + '</div>' +

    (overdue.length ? '<div class="sec"><div class="t">超时预警</div><div class="a">系统自动提醒</div></div>' +
      '<div class="taskgrid" style="margin-bottom:10px">' + overdue.map(t => '<div class="card tight"><div class="small strong">' + t.title + '</div>' +
        '<div class="small muted mt6">' + t.owner + ' 已超期 2 天 · 建议催办或改派</div>' +
        '<div class="row mt10"><button class="btn sm line grow" onclick="A.toast(\'已发送催办提醒（演示）\')">催办</button>' +
        '<button class="btn sm ghost grow" onclick="A.toast(\'已进入改派候选池（演示）\')">改派</button></div></div>').join('') + '</div>' : '');
}

function pageCourse() {
  return '<div class="h1">课程挂接</div>' +
    '<div class="h1sub">把企业真实需求「挂牌」成课程作业，教学与生产同一套流程</div>' +
    DB.courses.map(c => {
      const n = needById(c.needId);
      return '<div class="card"><div class="row between top"><div class="grow">' +
        '<div class="strong" style="font-size:13.5px">' + esc(n ? n.title : '—') + '</div>' +
        '<div class="small muted mt6">' + c.name + ' · ' + c.cls + '</div></div>' +
        '<span class="tag ok">已挂接</span></div>' +
        '<div class="row between mt10"><span class="small muted">' + c.joined + ' 名学生参与 · 按任务量计分</span>' +
        '<button class="btn sm line" onclick="A.toast(\'已打开课程作业配置（演示）\')">配置评分</button></div></div>';
    }).join('') +
    '<div class="card tight"><div class="small strong mb6">可挂接的开放需求</div>' +
    DB.needs.filter(n => n.status === 'open').slice(0, 3).map(n =>
      '<div class="row between" style="padding:6px 0;border-bottom:1px solid #f1f4f3">' +
      '<div class="grow"><div class="small">' + esc(n.title) + '</div>' +
      '<div class="tiny muted">' + n.track + ' · ' + money(n.budget[1]) + '</div></div>' +
      '<button class="btn sm ghost" onclick="A.hookCourse(' + n.id + ')">挂牌</button></div>').join('') +
    '</div>' +
    '<div class="note mt6">挂接后：需求仍走企业验收，但学生会额外获得课程评分；优秀作品由教师推荐给企业作为长期合作对象。</div>';
}

function pageBoard() {
  const g = DB.gov;
  const cols = [
    ['人工智能学院', 268], ['计算机学院', 214], ['设计艺术学院', 196],
    ['新闻传播学院', 178], ['经济管理学院', 152], ['机械工程学院', 121], ['其他 8 个学院', 155]
  ];
  const max = Math.max.apply(null, cols.map(c => c[1]));
  return '<div class="h1">教学看板</div>' +
    '<div class="h1sub">监考式督导：谁在接、接得怎么样、有没有卡住</div>' +
    '<div class="grid4" style="margin-bottom:14px">' +
    '<div class="stat"><div class="n">' + g.students + '</div><div class="l">参与学生</div></div>' +
    '<div class="stat"><div class="n">' + g.enterprises + '</div><div class="l">合作企业</div></div>' +
    '<div class="stat"><div class="n">' + DB.tasks.filter(t => t.status === 'check').length + '</div><div class="l">待我验收</div></div>' +
    '<div class="stat"><div class="n acc">' + g.arbitrations + '</div><div class="l">待处理纠纷</div></div></div>' +
    '<div class="grid2">' +
    '<div class="card tight"><div class="small strong mb6">各学院参与人次</div>' +
    cols.map(c => '<div class="row" style="padding:4px 0"><span class="tiny muted" style="width:96px;flex:none">' + c[0] + '</span>' +
      '<div class="bar grow"><i style="width:' + Math.round(c[1] / max * 100) + '%"></i></div>' +
      '<span class="tiny strong" style="width:34px;text-align:right">' + c[1] + '</span></div>').join('') + '</div>' +
    '<div class="card tight"><div class="small strong mb6">教学质量指标</div>' +
    '<div class="kv"><span class="k">企业复购率</span><span class="v">' + Math.round(g.repeats * 100) + '%</span></div>' +
    '<div class="kv"><span class="k">学生人均收益</span><span class="v">' + money(g.avgIncome) + '</span></div>' +
    '<div class="kv"><span class="k">已认定学分</span><span class="v">' + g.creditIssued + ' 分</span></div>' +
    '<div class="kv"><span class="k">交付准时率</span><span class="v">94%</span></div>' +
    '<div class="kv"><span class="k">课程挂接数</span><span class="v">' + DB.courses.length + ' 门</span></div></div></div>' +
    '<div class="note mt14">这些指标可直接用于学院考核与专业认证的「实践教学成效」佐证。</div>';
}

/* ----------------------------- 7. 企业端 ----------------------------- */
function pagePublish() {
  WIZ = WIZ || { step: 1, title: '', track: '技术开发', brief: '', deliverables: ['成片/上线链接'],
                 criteria: '', days: 14, budget: '', team: true, host: '学校共管账户' };
  const w = WIZ;
  const delivOpts = ['源文件', '成片/上线链接', '数据回执', '使用说明', '版权清单'];
  let body = '';
  if (w.step === 1) {
    body = '<div class="field"><label>需求标题</label><input type="text" id="wTitle" placeholder="例如：门店小程序预约页改版" value="' + esc(w.title) + '"></div>' +
      '<div class="field"><label>所属赛道</label><div class="opt">' +
      TRACKS.map(t => '<span class="' + (w.track === t ? 'on' : '') + '" onclick="A.wTrack(\'' + t + '\')">' + t + '</span>').join('') + '</div></div>' +
      '<div class="field"><label>项目背景（一句话说清目标）</label><textarea id="wBrief" placeholder="现在的问题是什么、希望达到什么效果">' + esc(w.brief) + '</textarea></div>' +
      '<div class="note">结构化 Brief 能让 80% 的返工在发布前就被消灭——这是新版与原版最大的差别之一。</div>';
  } else if (w.step === 2) {
    body = '<div class="field"><label>可交付物（多选）</label><div class="opt">' +
      delivOpts.map(d => '<span class="' + (w.deliverables.indexOf(d) >= 0 ? 'on' : '') + '" onclick="A.wDeliv(\'' + d + '\')">' + d + '</span>').join('') + '</div></div>' +
      '<div class="field"><label>验收标准（逐条可判定的，不要写「好看」）</label>' +
      '<textarea id="wCrit" placeholder="例如：下单步骤 ≤ 3 步；首屏加载 < 1.2s；无第三方水印">' + w.criteria + '</textarea></div>' +
      '<div class="field"><label>工期（天）</label><input type="number" id="wDays" min="3" max="60" value="' + w.days + '"></div>' +
      '<div class="field"><label>是否允许跨专业组队</label><div class="opt">' +
      '<span class="' + (!w.team ? 'on' : '') + '" onclick="A.wTeam(false)">个人承接</span>' +
      '<span class="' + (w.team ? 'on' : '') + '" onclick="A.wTeam(true)">允许组队</span></div></div>' +
      '<div class="note acc">里程碑默认按 30 / 40 / 30 拆三次，验收一段释放一段，企业不怕「付了钱没交付」。</div>';
  } else {
    const est = w.budget || 2000;
    body = '<div class="field"><label>预算（元）</label><input type="number" id="wBudget" min="100" step="100" value="' + est + '">' +
      '<div class="help">平台参考价：同赛道同等体量需求均价 ¥1,860；预算低于 ¥800 会进入「低价预警」。</div></div>' +
      '<div class="field"><label>资金托管方式</label><select id="wHost">' +
      ['学校共管账户', '企业直付（平台留痕）'].map(h => '<option' + (w.host === h ? ' selected' : '') + '>' + h + '</option>').join('') + '</select></div>' +
      '<div class="card tight" style="margin:2px 0 10px"><div class="small strong mb6">发布预览</div>' +
      '<div class="kv"><span class="k">标题</span><span class="v">' + (w.title || '（未填写）') + '</span></div>' +
      '<div class="kv"><span class="k">赛道</span><span class="v">' + w.track + '</span></div>' +
      '<div class="kv"><span class="k">工期</span><span class="v">' + w.days + ' 天</span></div>' +
      '<div class="kv"><span class="k">交付物</span><span class="v">' + (w.deliverables.join('、') || '—') + '</span></div>' +
      '<div class="kv"><span class="k">组队</span><span class="v">' + (w.team ? '允许跨专业组队' : '个人承接') + '</span></div></div>' +
      '<div class="note">将自动匹配 <b>' + (12 + (est > 2000 ? 6 : 0)) + '</b> 位符合技能画像的学生，并推送订阅消息。' +
      '发布后进入平台审核（通常 2 小时内），审核通过即对学生可见。</div>';
  }
  return '<div class="form-wrap"><div class="h1">发布需求</div>' +
    '<div class="h1sub">三步生成一份可被验收、可被结算的 Brief</div>' +
    '<div class="steps"><div class="s ' + (w.step >= 1 ? 'on' : '') + '"><i></i>基本信息</div>' +
    '<div class="s ' + (w.step >= 2 ? 'on' : '') + '"><i></i>交付与验收</div>' +
    '<div class="s ' + (w.step >= 3 ? 'on' : '') + '"><i></i>预算与发布</div></div>' +
    '<div class="card">' + body + '</div>' +
    '<div class="row mt14">' +
    (w.step > 1 ? '<button class="btn line" style="min-width:110px" onclick="A.wStep(-1)">上一步</button>' : '') +
    '<div class="grow"></div>' +
    (w.step < 3 ? '<button class="btn" style="min-width:150px" onclick="A.wStep(1)">下一步</button>'
                : '<button class="btn" style="min-width:170px" onclick="A.publish()">提交审核并发布</button>') +
    '</div></div>';
}

function pageDemands() {
  const mine = DB.needs.filter(n => n.company.indexOf('苏太太') >= 0);
  return '<div class="h1">我的需求</div>' +
    '<div class="h1sub">从待认领到已结算，全生命周期可见</div>' +
    (mine.map(n => {
      const tags = n.status === 'review' ? '<span class="tag warn">待平台审核</span>'
        : n.status === 'open' ? '<span class="tag ok">招募中</span>' : '<span class="tag info">进行中</span>';
      const claimed = DB.tasks.filter(t => t.needId === n.id);
      return '<div class="card" onclick="A.openNeed(' + n.id + ')">' +
        '<div class="row between top"><div class="grow"><div class="strong" style="font-size:13.5px">' + esc(n.title) + '</div>' +
        '<div class="small muted mt6">' + n.track + ' · ' + money(n.budget[0]) + '–' + money(n.budget[1]) + ' · ' + n.days + ' 天</div></div>' + tags + '</div>' +
        '<div class="row between mt10"><span class="tiny muted">' +
        (claimed.length ? claimed.map(t => t.owner + ' · ' + (t.status === 'done' ? '已结算' : t.status === 'check' ? '待验收' : '制作中')).join(' / ') : '暂无人认领') +
        '</span><span class="tiny" style="color:#0e6b5e">查看详情 ›</span></div></div>';
    }).join('')) +
    '<div class="card tight"><div class="small strong mb6">托管余额</div>' +
    '<div class="row between"><span class="h1" style="color:#e07a3f;margin:0">' + money(6800) + '</span>' +
    '<span class="small muted">待释放 ' + money(DB.tasks.filter(t => t.status === 'settle').reduce((s, t) => s + t.pay, 0)) + '</span></div>' +
    '<div class="note gray mt10">资金进入学校共管账户，按里程碑释放；平台只记账，不做资金池。</div></div>';
}

function pageSettle() {
  const pend = DB.tasks.filter(t => t.status === 'settle');
  const done = DB.tasks.filter(t => t.status === 'done');
  return '<div class="h1">结算托管</div>' +
    '<div class="h1sub">验收通过即释放，凭证自动留痕，可导出对账单</div>' +
    '<div class="grid2" style="margin-bottom:11px">' +
    '<div class="stat"><div class="n acc">' + money(pend.reduce((s, t) => s + t.pay, 0)) + '</div><div class="l">待释放</div></div>' +
    '<div class="stat"><div class="n">' + money(done.reduce((s, t) => s + t.pay, 0)) + '</div><div class="l">已结算</div></div></div>' +
    '<div class="sec"><div class="t">待释放款项</div><div class="a">' + pend.length + ' 笔</div></div>' +
    (pend.length ? pend.map(t => '<div class="card tight"><div class="row between top"><div class="grow">' +
      '<div class="small strong">' + esc(t.title) + '</div>' +
      '<div class="tiny muted mt6">' + t.owner + ' · 已通过教师验收</div></div>' +
      '<div class="strong" style="color:#e07a3f">' + money(t.pay) + '</div></div>' +
      '<button class="btn sm block mt10" onclick="A.release(' + t.id + ')">确认释放款项</button></div>').join('')
      : '<div class="empty">没有待释放款项</div>') +
    '<div class="sec"><div class="t">已结算记录</div><div class="a" onclick="A.toast(\'对账单已导出（演示）\')">导出对账单</div></div>' +
    '<div class="card tight"><table class="list"><thead><tr><th>任务</th><th>学生</th><th>金额</th></tr></thead><tbody>' +
    done.slice(0, 5).map(t => '<tr><td class="ellip" style="max-width:150px">' + esc(t.title) + '</td>' +
      '<td>' + t.owner + '</td><td class="strong">' + money(t.pay) + '</td></tr>').join('') +
    '</tbody></table></div>' +
    '<div class="note mt6">每笔释放都生成「验收单 + 结算单 + 学生确认」三份留痕，可作为企业税前扣除凭证附件。</div>';
}

/* ----------------------------- 8. 学校端 ----------------------------- */
function pageGov() {
  const g = DB.gov;
  const pend = DB.arbs.filter(a => a.status === 'pending').length;
  return '<div class="h1">治理看板</div>' +
    '<div class="h1sub">全校视角：规模、结构、质量与风险</div>' +
    '<div class="grid4" style="margin-bottom:14px">' +
    '<div class="stat"><div class="n">' + g.students + '</div><div class="l">参与学生</div></div>' +
    '<div class="stat"><div class="n">' + g.majors + '</div><div class="l">覆盖学院</div></div>' +
    '<div class="stat"><div class="n">' + g.enterprises + '</div><div class="l">合作企业</div></div>' +
    '<div class="stat"><div class="n acc">' + pend + '</div><div class="l">待仲裁</div></div></div>' +
    '<div class="grid2">' +
    '<div class="card tight"><div class="small strong mb6">本学年关键指标</div>' +
    '<div class="kv"><span class="k">共创成交额</span><span class="v">' + money(g.gmv) + '</span></div>' +
    '<div class="kv"><span class="k">人均学生收益</span><span class="v">' + money(g.avgIncome) + '</span></div>' +
    '<div class="kv"><span class="k">企业复购率</span><span class="v">' + Math.round(g.repeats * 100) + '%</span></div>' +
    '<div class="kv"><span class="k">已认定实践学分</span><span class="v">' + g.creditIssued + ' 分</span></div></div>' +
    '<div class="card tight"><div class="small strong mb6">风险控制</div>' +
    '<div class="kv"><span class="k">实名 + 学籍校验</span><span class="v" style="color:#118a5e">已开启</span></div>' +
    '<div class="kv"><span class="k">单人每周接单上限</span><span class="v">2 单</span></div>' +
    '<div class="kv"><span class="k">低价预警线</span><span class="v">¥800 / 单</span></div>' +
    '<div class="kv"><span class="k">版权与保密模板</span><span class="v">已内置 3 套</span></div></div></div>' +
    '<div class="note mt14">这些数字与规则一起构成「可审计」的校园共创治理体系——原版只有任务流水，没有治理维度。</div>';
}

function pageArb() {
  const pend = DB.arbs.filter(a => a.status === 'pending');
  return '<div class="h1">仲裁</div>' +
    '<div class="h1sub">三级调解：教师辅导员 → 学院项目办 → 学校创客中心</div>' +
    (pend.length ? pend.map(a => '<div class="card"><div class="row between top"><div class="grow">' +
      '<div class="small strong">' + a.title + '</div>' +
      '<div class="tiny muted mt6">' + a.parties + ' · 已挂起 ' + a.days + ' 天</div></div>' +
      '<span class="tag warn">待处理</span></div>' +
      '<div class="note gray mt10">双方主张：' + a.claim + '</div>' +
      '<div class="row mt10"><button class="btn sm line grow" onclick="A.arbitrate(' + a.id + ',\'按 50% 折中\')">折中结算</button>' +
      '<button class="btn sm ghost grow" onclick="A.arbitrate(' + a.id + ',\'全额结算\')">支持学生</button></div></div>').join('')
      : '<div class="empty">暂无待处理纠纷 🎉</div>') +
    '<div class="note mt6">所有材料（Brief、提交版本、验收记录、聊天记录）自动归档，仲裁只看事实不看态度。</div>';
}

function pageCredit() {
  const p = DB.profile;
  return '<div class="h1">学分认定</div>' +
    '<div class="h1sub">把「接单」变成「学分」——这是原版没有的教学闭环</div>' +
    '<div class="card"><div class="row between"><span class="small strong">本学期认定进度</span>' +
    '<span class="small">' + p.credits + ' / ' + p.creditsNeed + ' 学分</span></div>' +
    '<div class="bar mt10"><i style="width:' + (p.credits / p.creditsNeed * 100) + '%"></i></div>' +
    '<div class="note mt10">认定规则：单笔 ≥ ¥800 且验收 ≥ 4.5 分 计 0.5 学分；累计 6 学分可替代专业选修实践环节。</div></div>' +
    '<div class="sec"><div class="t">待批量认定</div><div class="a" onclick="A.toast(\'已生成 68 份认定单（演示）\')">批量生成</div></div>' +
    '<div class="card tight"><table class="list"><thead><tr><th>学生</th><th>学院</th><th>学分</th></tr></thead><tbody>' +
    [['林一鸣', '人工智能学院', 0.5], ['张华', '新闻传播学院', 0.5], ['王雨', '设计艺术学院', 0.5], ['陈默', '法学院', 1.0]]
      .map(r => '<tr><td>' + r[0] + '</td><td class="muted">' + r[1] + '</td><td class="strong">' + r[2] + '</td></tr>').join('') +
    '</tbody></table></div>' +
    '<div class="note acc mt6">学分认定单含：需求 Brief、交付物、企业评分、教师评价、时间戳，可供教务与专业认证追溯。</div>';
}

/* ----------------------------- 9. 我的（通用） ----------------------------- */
function pageMine() {
  const r = ROLES[S.role];
  const role = S.role;
  const rows = {
    student: [['实名与学籍', '已认证 · 学号 2025****26'], ['收款方式', '微信零钱（免手续费）'], ['接单上限', '每周 2 单（防内卷）']],
    teacher: [['教师身份', '已认证 · 创新创业学院'], ['负责范围', '12 个合作企业 · 3 门课程'], ['验收提醒', '开启（每日 9:00 推送）']],
    enterprise: [['企业认证', '已认证 · 营业执照已核验'], ['对接人', '苏经理 · 138****6721'], ['资金托管', '学校共管账户']],
    school: [['运营身份', '平台运营 · 创客中心'], ['数据权限', '全校汇总（脱敏明细）'], ['审计日志', '全量保留 3 年']]
  }[role];

  return '<div class="h1">' + r.label + '中心</div>' +
    '<div class="h1sub">' + r.desc + '</div>' +
    '<div class="card"><div class="row"><div class="avatar" style="width:42px;height:42px;border-radius:13px;background:#0e6b5e;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700">' +
    r.avatar + '</div><div class="grow"><div class="strong">' + r.name + '</div>' +
    '<div class="small muted">' + r.desc + '</div></div><button class="btn sm line" onclick="A.openRoles()">切换身份</button></div></div>' +
    '<div class="card tight">' + rows.map(x => '<div class="kv"><span class="k">' + x[0] + '</span><span class="v">' + x[1] + '</span></div>').join('') + '</div>' +
    '<div class="card tight"><div class="small strong mb6">通知</div>' +
    '<div class="kv"><span class="k">待办提醒</span><span class="v">已开启</span></div>' +
    '<div class="kv"><span class="k">微信订阅消息</span><span class="v">已授权 3 类模板</span></div></div>' +
    '<div class="card tight"><div class="small strong mb6">演示数据</div>' +
    '<div class="tiny muted">本原型为纯前端演示，数据存浏览器本地。</div>' +
    '<button class="btn sm line block mt10" onclick="A.reset()">重置演示数据</button></div>' +
    '<div class="note mt10">V1.0 原型 · 沿用「学生—企业—教师」主线，新增组队、学分、托管、治理四层。</div>';
}

/* ----------------------------- 10. 交互动作 ----------------------------- */
const A = {
  go(p) { S.page = p; S.needId = null; render(); document.getElementById('main').scrollTop = 0; },
  back() { S.page = 'square'; S.needId = null; render(); },
  setFilter(f) { S.filter = f; render(); },
  setSeg(s) { S.seg = s; render(); },
  toast(m) { toast(m); },

  openRoles() {
    A.openSheet('切换演示身份',
      Object.keys(ROLES).map(k => '<div class="card tight" style="cursor:pointer" onclick="A.switchRole(\'' + k + '\')">' +
        '<div class="row between"><div><div class="strong">' + ROLES[k].label + ' · ' + ROLES[k].name + '</div>' +
        '<div class="small muted">' + ROLES[k].desc + '</div></div>' +
        '<span class="tag ' + (S.role === k ? 'ok' : 'line') + '">' + (S.role === k ? '当前' : '切换') + '</span></div></div>').join(''), '');
  },

  switchRole(k) {
    S.role = k;
    S.page = TABS[k][0].p;
    S.needId = null; S.seg = 'all';
    A.closeSheet();
    render();
    document.getElementById('main').scrollTop = 0;
    toast('已切换为「' + ROLES[k].label + '」视角');
  },

  openNeed(id) {
    S.needId = id; S.page = 'need'; render();
    document.getElementById('main').scrollTop = 0;
  },

  claim(id) {
    const n = needById(id);
    if (!n) return;
    if (DB.tasks.find(t => t.needId === id && t.mine)) return toast('你已经认领过这个需求了');
    DB.seq += 1;
    DB.tasks.unshift({
      id: DB.seq, needId: id, title: n.title, owner: '林一鸣', mine: true,
      status: 'doing', stage: 0, pay: Math.round((n.budget[0] + n.budget[1]) / 2 / 10) * 10,
      paid: false, submitted: null, link: '', note: '', selfcheck: [false, false, false, false]
    });
    /* 只把自己填进第一个空缺的技能位，其余留给组队 */
    let filled = false;
    n.roles = n.roles.map(r => {
      if (!filled && !r.who) { filled = true; return Object.assign({}, r, { who: '林一鸣' }); }
      return r;
    });
    save();
    toast('认领成功！已锁定档期，请按里程碑推进');
    S.page = 'tasks'; S.seg = 'all'; render();
  },

  applyTeam(id) {
    const n = needById(id);
    if (!n) return;
    toast(n.team ? '组队申请已发出，等待队长或企业确认（演示）' : '该需求为个人承接，无需组队');
  },

  openSubmit(taskId) {
    const t = taskById(taskId);
    if (!t) return;
    const checks = ['交付物齐备且与 Brief 一致', '已自测/自校（无错别字、无报错）', '版权与素材可商用', '数据回执已附'];
    A.openSheet('提交作品 · ' + t.title,
      '<div class="field"><label>作品链接（可访问）</label><input type="text" id="sLink" placeholder="https://" value="' + esc(t.link || '') + '"></div>' +
      '<div class="field"><label>交付说明</label><textarea id="sNote" placeholder="做了什么、怎么用、有哪些已知限制">' + esc(t.note || '') + '</textarea></div>' +
      '<div class="field"><label>提交前自检</label>' +
      checks.map((c, i) => '<div class="check ' + (t.selfcheck[i] ? 'on' : '') + '" id="chk' + i + '" onclick="A.toggleChk(' + i + ')">' +
        '<div class="box"></div><div class="small">' + c + '</div></div>').join('') + '</div>' +
      '<div class="note">提交后进入 72 小时验收期；被打回会回到「制作中」，本次修改计入 ' + (needById(t.needId) ? needById(t.needId).revisions : 2) + ' 次上限。</div>',
      '<button class="btn block" onclick="A.submitWork(' + taskId + ')">确认提交</button>');
    A._chk = t.selfcheck.slice();
  },

  toggleChk(i) {
    A._chk[i] = !A._chk[i];
    document.getElementById('chk' + i).classList.toggle('on', A._chk[i]);
  },

  submitWork(taskId) {
    const t = taskById(taskId);
    const link = (document.getElementById('sLink') || {}).value || '';
    const note = (document.getElementById('sNote') || {}).value || '';
    if (!link) return toast('请先填写作品链接');
    if (A._chk && A._chk.some(x => !x)) return toast('请先勾选全部自检项');
    t.link = link; t.note = note; t.selfcheck = A._chk || [true, true, true, true];
    t.status = 'check'; t.stage = 2;
    t.submitted = '11-24 ' + new Date().toTimeString().slice(0, 5);
    save(); A.closeSheet(); render();
    toast('已提交，等待企业/教师验收');
  },

  timeline(taskId) {
    const t = taskById(taskId);
    if (!t) return;
    const names = ['认领成功', '制作中', '提交作品', '验收', '结算'];
    A.openSheet('任务进度 · ' + t.title,
      '<div class="tl">' + names.map((n, i) => {
        const cls = i < t.stage ? 'done' : (i === t.stage ? 'cur' : '');
        const desc = i === 0 ? '已锁定档期，Brief 与里程碑确认'
          : i === 1 ? '按里程碑推进，可随时提交草稿'
          : i === 2 ? (t.submitted ? '提交于 ' + t.submitted : '待提交')
          : i === 3 ? (t.status === 'check' ? '等待验收（72h 内）' : (t.stage > 3 ? '已通过验收' : '未开始'))
          : (t.paid ? '已完成打款并留痕' : '验收通过后释放');
        return '<div class="step ' + cls + '"><div class="st">' + n + '</div><div class="sd">' + desc + '</div></div>';
      }).join('') + '</div>' +
      (t.link ? '<div class="card tight mt10"><div class="small strong mb6">交付物</div>' +
        '<div class="small muted" style="word-break:break-all">' + t.link + '</div>' +
        (t.note ? '<div class="small muted mt6">说明：' + t.note + '</div>' : '') + '</div>' : ''),
      '<button class="btn block line" onclick="A.closeSheet()">关闭</button>');
  },

  openReview(taskId) {
    const t = taskById(taskId);
    const n = needById(t.needId) || { criteria: [] };
    A.openSheet('验收 · ' + t.title,
      '<div class="card tight"><div class="small strong mb6">学生交付</div>' +
      '<div class="small muted" style="word-break:break-all">' + (t.link || '—') + '</div>' +
      (t.note ? '<div class="small muted mt6">' + t.note + '</div>' : '') + '</div>' +
      '<div class="card tight mt10"><div class="small strong mb6">按 Brief 逐条核验</div>' +
      (n.criteria || []).map(c => '<div class="check on"><div class="box"></div><div class="small">' + c + '</div></div>').join('') +
      '</div>' +
      '<div class="field mt10"><label>验收意见（打回时必填）</label>' +
      '<textarea id="rNote" placeholder="例如：第 2 条验收标准未满足，请补充数据回执"></textarea></div>' +
      '<div class="note">通过后进入待结算，企业释放款项；学生获得企业评分并可计入学分。</div>',
      '<button class="btn block line" onclick="A.reject(' + taskId + ')">打回修改</button>' +
      '<button class="btn block" onclick="A.approve(' + taskId + ')">通过验收</button>');
  },

  approve(taskId) {
    const t = taskById(taskId);
    t.status = 'settle'; t.stage = 3;
    save(); A.closeSheet(); render();
    toast('已通过验收，进入企业待结算队列');
  },

  reject(taskId) {
    const t = taskById(taskId);
    const note = (document.getElementById('rNote') || {}).value || '';
    if (!note.trim()) return toast('打回需要写明具体原因');
    t.status = 'doing'; t.stage = 1; t.feedback = note;
    save(); A.closeSheet(); render();
    toast('已打回，学生将收到具体修改意见');
  },

  release(taskId) {
    const t = taskById(taskId);
    t.status = 'done'; t.stage = 4; t.paid = true;
    save(); render();
    toast('款项已释放，结算凭证已生成');
  },

  auditNeed(id, pass) {
    const n = needById(id);
    if (!n) return;
    if (pass) { n.status = 'open'; n.verified = true; toast('已通过审核，需求已对学生可见'); }
    else { n.status = 'review'; toast('已退回企业补充材料'); }
    save(); render();
  },

  hookCourse(id) {
    const n = needById(id);
    if (!n) return;
    DB.courses.push({ id: DB.courses.length + 1, name: '新建实践课程', cls: '待选择班级', needId: id, joined: 0 });
    save(); render(); toast('已挂牌，请补充课程与班级信息（演示）');
  },

  arbitrate(id, plan) {
    const a = DB.arbs.find(x => x.id === id);
    if (!a) return;
    a.status = 'done';
    save(); render();
    toast('已出具调解方案：' + plan);
  },

  /* ---- 发布向导 ---- */
  /* 每次重渲染前先把当前步骤输入框里的值收回 WIZ，避免点标签时丢掉已填内容 */
  wCapture() {
    if (!WIZ) return;
    const val = id => { const el = document.getElementById(id); return el ? el.value : null; };
    if (WIZ.step === 1) {
      const a = val('wTitle'), b = val('wBrief');
      if (a !== null) WIZ.title = a;
      if (b !== null) WIZ.brief = b;
    }
    if (WIZ.step === 2) {
      const a = val('wCrit'), b = val('wDays');
      if (a !== null) WIZ.criteria = a;
      if (b !== null) WIZ.days = Number(b || 14);
    }
    if (WIZ.step === 3) {
      const a = val('wBudget'), b = val('wHost');
      if (a !== null) WIZ.budget = Number(a || 2000);
      if (b !== null) WIZ.host = b;
    }
  },

  wStep(d) {
    A.wCapture();
    if (WIZ.step === 1 && d > 0 && !String(WIZ.title).trim()) return toast('请先填写需求标题');
    WIZ.step = Math.min(3, Math.max(1, WIZ.step + d));
    render();
  },
  wTrack(t) { A.wCapture(); WIZ.track = t; render(); },
  wDeliv(d) {
    A.wCapture();
    const i = WIZ.deliverables.indexOf(d);
    if (i >= 0) { if (WIZ.deliverables.length > 1) WIZ.deliverables.splice(i, 1); }
    else WIZ.deliverables.push(d);
    render();
  },
  wTeam(v) { A.wCapture(); WIZ.team = v; render(); },

  publish() {
    A.wCapture();
    WIZ.budget = Number(WIZ.budget || 2000);
    DB.seq += 1;
    const n = {
      id: DB.seq, title: WIZ.title || '未命名需求', company: '苏太太电商', verified: false,
      track: WIZ.track, majors: ['人工智能学院'], budget: [Math.round(WIZ.budget * 0.8), WIZ.budget],
      days: WIZ.days, deadline: '12-30',
      skills: [{ n: WIZ.track, w: 60 }, { n: '项目协作', w: 40 }],
      match: 88, team: WIZ.team, roles: WIZ.team ? [{ n: '主责', who: null }, { n: '协作', who: null }] : [],
      status: 'review', brief: WIZ.brief || '（未填写背景）',
      deliverables: WIZ.deliverables.slice(), criteria: (WIZ.criteria || '按 Brief 验收').split(/[；;\n]/).filter(Boolean),
      revisions: 2, ip: '著作权归企业，学生保留署名与作品集展示权',
      milestones: [{ n: '首个里程碑', p: 30 }, { n: '第二阶段', p: 40 }, { n: '终验', p: 30 }],
      bonus: '按验收评分发放效果奖励'
    };
    DB.needs.unshift(n);
    save();
    WIZ = null;
    S.page = 'demands';
    render();
    toast('已提交平台审核，审核通过后自动匹配学生');
  },

  reset() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    location.reload();
  },

  /* ---- 抽屉 ---- */
  openSheet(title, body, foot) {
    document.getElementById('sheetTitle').textContent = title;
    document.getElementById('sheetBody').innerHTML = body;
    document.getElementById('sheetFoot').innerHTML = foot || '';
    document.getElementById('sheetFoot').style.display = foot ? 'flex' : 'none';
    document.getElementById('mask').classList.add('on');
  },
  closeSheet() { document.getElementById('mask').classList.remove('on'); },
  maskClick(e) { if (e.target.id === 'mask') A.closeSheet(); }
};

/* ----------------------------- 11. 启动 ----------------------------- */
/* 支持 ?role=teacher&page=todo&need=3 深链，便于分享某个视角 / 截图 */
(function initFromUrl() {
  try {
    const q = new URLSearchParams(location.search || '');
    const r = q.get('role');
    const p = q.get('page');
    const need = q.get('need');
    if (r && TABS[r]) { S.role = r; S.page = TABS[r][0].p; }
    if (p && TABS[S.role].some(t => t.p === p)) S.page = p;
    if (need && needById(Number(need))) { S.needId = Number(need); S.page = 'need'; }
  } catch (e) { /* 忽略 */ }
})();

load();
render();

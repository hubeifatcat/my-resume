export const agents = [
  {
    name: "知识检索 Agent",
    desc: "检索简历、项目经历与运维知识库，返回带来源的参考片段，不凭空编造。",
    evidence: "RAG 关键词检索 + 来源标签",
    icon: "知",
  },
  {
    name: "日志分析 Agent",
    desc: "解析 Nacos、网关、数据库等故障类问题，输出摘要、影响面与定位建议。",
    evidence: "内置演示日志样本",
    icon: "析",
  },
  {
    name: "脚本生成 Agent",
    desc: "按巡检、备份、磁盘等场景生成 Shell/Python 脚本，演示模式不执行真实命令。",
    evidence: "工具白名单 + 安全边界",
    icon: "码",
  },
  {
    name: "汇总回答 Agent",
    desc: "读取黑板上的中间结果，生成结构清晰、可直接阅读的中文最终回答。",
    evidence: "DeepSeek 驱动，失败自动降级",
    icon: "汇",
  },
];

export const stack = [
  "React / Vite",
  "FastAPI",
  "DeepSeek",
  "RuntimeHarness",
  "Blackboard",
  "IntentRouter",
  "RAG",
  "SQLite",
  "Docker Compose",
  "Caddy",
];

export const skillGroups = [
  {
    title: "AI 应用交付",
    items: ["Python / FastAPI", "React / Vite", "RAG", "Agent / MCP", "DeepSeek", "Ollama"],
  },
  {
    title: "实施与运维",
    items: ["阿里云 EDAS/SLB/ECS", "Docker / K8s", "Nacos / Redis / Nginx", "DataWorks", "MySQL / Oracle"],
  },
  {
    title: "工程与交付",
    items: ["GitHub Pages", "Docker Compose", "Caddy HTTPS", "SSH 远程运维", "客户培训", "交付文档"],
  },
];

export const jobs = [
  {
    company: "中电金信 · 实施交付工程师",
    period: "2025.03 - 至今",
    summary: "驻场国网数字化审计平台，负责阿里云生产环境部署、DataWorks 数据链路、中间件治理与客户培训。",
    points: ["打包、镜像、服务更新、测试验证、上线的完整交付链路", "DataWorks 数据同步与调度配置", "客户培训与操作手册编写"],
  },
  {
    company: "北京金轩锋 · 运维专员",
    period: "2024.07 - 2025.03",
    summary: "7×24 视频监测平台，Zabbix + Grafana 监控与视频链路故障排查。",
    points: ["监控体系搭建与告警处理", "监测点异常数据排查与问题溯源"],
  },
  {
    company: "南京华苏 · 实施工程师",
    period: "2023.10 - 2024.06",
    summary: "统一权限平台单体转微服务升级，阿里云迁移与 Oracle 到 MySQL 数据适配。",
    points: ["云上环境搭建与微服务部署", "数据迁移、一致性校验", "测试用例、部署文档、用户手册"],
  },
];

export const projects = [
  {
    name: "多智能体知识库 Agent 展示站",
    tag: "独立研发 · 已上线",
    tagType: "ai",
    year: "2026",
    desc: "把运维经验沉淀成可在线体验的多智能体系统：意图路由 → Agent 协作 → 黑板 → DeepSeek 汇总 → 轨迹回放。",
    points: ["4 个 Agent + RuntimeHarness 调度", "RAG 知识检索与来源标签", "登录后保存会话与轨迹", "GitHub Pages + Docker Compose + Caddy 上线"],
    links: [
      { label: "在线 Demo", url: "#/demo" },
      { label: "GitHub 源码", url: "https://github.com/hubeifatcat/my-resume" },
    ],
    shot: "/assets/screenshots/demo.png",
  },
  {
    name: "国网数字化审计平台部署",
    tag: "工作项目",
    tagType: "work",
    year: "2025",
    desc: "阿里云 EDAS 上完成慧监督、支撑保障两大模块 10+ 微服务容器化发布，打通公网 SLB → Nginx → 私网 SLB 访问链路。",
    points: ["145 页部署方案落地", "PolarDB / Redis / RocketMQ / Nacos / Seata 接入", "镜像构建、EDAS 发布与安全组治理"],
    links: [],
  },
  {
    name: "RAG 运维知识库实践",
    tag: "AI 落地",
    tagType: "ai",
    year: "2025",
    desc: "从 Ollama 本地模型、Dify Chatflow 到 Obsidian 双链知识治理，把故障案例结构化，为多智能体项目提供知识底座。",
    points: ["高频故障查询 10 分钟 → 1 分钟内", "报告草稿效率提升 50%+", "脚本编写时间缩短约 40%"],
    links: [],
  },
  {
    name: "统一权限平台云迁移",
    tag: "工作项目",
    tagType: "work",
    year: "2023",
    desc: "参与单体转微服务架构升级，完成阿里云环境搭建、Oracle 到 MySQL 数据迁移与全套交付文档。",
    points: ["表结构转换与数据一致性校验", "测试用例、部署文档、用户手册", "客户培训与版本宣贯"],
    links: [],
  },
];

export const metrics = [
  { value: "4", label: "Agent 协作单元", note: "知识 / 日志 / 脚本 / 汇总" },
  { value: "全程", label: "Trace 轨迹", note: "每一步可回放" },
  { value: "10→1", label: "故障定位分钟", note: "高频问题查询提速" },
  { value: "+40%", label: "脚本效率", note: "AI 辅助编写" },
];

export const architectureSteps = [
  "用户消息",
  "RuntimeHarness 调度器",
  "IntentRouter 意图路由",
  "Blackboard 黑板",
  "Agent 协作",
  "DeepSeek 汇总回答",
];

export const education = {
  school: "湖北工程学院新技术学院",
  major: "计算机科学与技术 · 本科",
  period: "2020 - 2024",
  extra: "2018.09 - 2020.09 服役 · 退伍军人",
  honors: ["网络安全管理员", "计算机三级", "普通话二级乙等", "C1 驾驶证"],
};

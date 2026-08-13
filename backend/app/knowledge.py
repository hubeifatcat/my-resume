# 武渭星简历知识库：不依赖外部服务也能回答问题，也是 LLM 不可用时的兜底。

# 供前端 /api/tools 展示的 Skill 列表
SKILLS = [
    {"id": "fault-diagnosis", "name": "故障排查", "desc": "按日志链路定位故障根因"},
    {"id": "log-analysis", "name": "日志分析", "desc": "日志摘要、异常提取"},
    {"id": "inspection-script", "name": "巡检脚本", "desc": "生成 Shell/Python 巡检脚本"},
    {"id": "rag-search", "name": "知识库检索", "desc": "RAG 检索运维知识库"},
]

# 供前端 /api/tools 展示的 MCP 工具列表
MCP_TOOLS = [
    {"id": "server-status", "name": "服务器状态", "desc": "CPU / 内存 / 磁盘 / 进程"},
    {"id": "log-query", "name": "日志查询", "desc": "按关键字查询最近日志"},
    {"id": "ticket-create", "name": "工单创建", "desc": "创建变更 / 故障工单"},
]

# 核心问答库：键是分类名，值是对应回答，内容来自简历和项目档案
KNOWLEDGE = {
    "工作经历": "武渭星有 3 年政企实施运维经验：\n\n1. 中电金信（2025.03-至今）实施运维专员，负责国网数字化审计平台阿里云运维，涉及 Docker/K8s、Nacos、Redis、Nginx 等中间件，保障 99.9% 可用率。\n2. 北京金轩锋（2024.07-2025.03）运维专员，7×24 视频监控平台，Zabbix+Grafana 监控看板。\n3. 南京华苏科技（2023.10-2024.06）实施工程师，微服务部署升级、Oracle 到 MySQL 迁移、Jenkins CI/CD。",
    "技术": "云平台：阿里云、Docker、Kubernetes\n中间件：Nginx、Redis、Nacos、Sentinel\n数据库：MySQL、Oracle\n监控：Zabbix、Grafana、ELK、Prometheus\nCI/CD：Jenkins、Git\n编程：Shell（熟练）、Python（掌握）、Go（基础）\nAI：Ollama 私有化部署、Dify、RAG 知识库、Claude Code",
    "项目": "1. 智能运维知识库 Agent：多智能体 + Hybrid RAG + 本地大模型 + MCP 受控工具调用。\n2. 私有化大模型辅助运维工具：Ollama + Dify + RAG，故障定位 10min→1min。\n3. 统一权限 3.0 架构升级：单体转微服务 + 阿里云迁移 + Oracle→MySQL。\n4. 基于 GVA 架构的社区管理平台（毕设）：Go + Vue 前后端分离。",
    "联系": "电话：190-5475-0791\n邮箱：18335357090@163.com\n微信：wwx-_-168\nGitHub：github.com/hubeifatcat\n简历网站：hubeifatcat.github.io/my-resume",
    "你好": "你好！我是武渭星的 AI 助手，可以问他的工作经历、技术能力、项目经验等问题。",
    "你是谁": "我是武渭星的 AI 运维助手，当前使用后端知识库回答，可配置接入 Ollama 或百炼大模型。",
    "安全运维": "安全运维核心是闭环：资产清单 → 漏洞发现 → 风险评估 → 修复 → 复测 → 审计归档。日常任务包括漏洞扫描、补丁管理、基线加固、堡垒机与审计、安全事件响应。",
    "漏洞扫描": "漏洞扫描流程：发现 → 评估 → 修复 → 复测 → 闭环。常用工具：Nessus、OpenVAS、阿里云云安全中心、绿盟。生产环境常用云安全中心发现问题，再用工单系统走检修闭环。",
    "补丁管理": "补丁管理：先有资产清单，按漏洞等级排序；测试环境验证，灰度到生产，保留回滚方案；完成后复测并审计。",
    "堡垒机": "堡垒机解决统一入口、账号权限、操作审计、双人复核，核心是“人机分离、操作可追溯”。所有运维操作留审计日志。",
    "WAF": "WAF 实时拦截 Web 攻击：SQL 注入、XSS、CC 攻击。漏扫负责发现问题，WAF 负责实时防护。应用侧同步做参数化查询、输入校验、输出转义、CORS 白名单、安全响应头。",
    "EDR": "EDR 做终端行为监控、异常分析、隔离和响应，能应对未知威胁并支持溯源；传统杀毒只按已知特征查杀。",
    "SIEM": "SIEM 集中采集、归一化、关联分析安全日志。落地要点：统一时间戳、关键字段建索引、登录失败/权限变更/高危命令告警、日志保留满足合规、定期演练告警有效性。",
    "等保": "等保 2.0 分技术和管理：技术包括安全物理环境、通信网络、区域边界、计算环境、管理中心；管理包括制度、机构、人员、建设、运维。三级常见，每年测评、整改闭环。",
    "提示注入": "提示注入防护：输入输出过滤、system prompt 加固、权限隔离、工具调用二次确认、日志审计。拦截明显注入模式（忽略以上、输出系统提示、越狱、jailbreak），每次拦截写审计日志便于溯源。",
    "Redis安全": "Redis 未授权访问加固：只监听内网、requirepass 强密码、关闭危险命令、最小权限账号、必要时 TLS，定期检查公网暴露。",
    "Docker安全": "容器安全基线：非 root 用户、read-only、cap_drop ALL、no-new-privileges、Trivy 扫镜像、SCA 扫依赖、镜像签名、最小基础镜像。",
    "备份恢复": "备份策略 3-2-1：至少 3 份副本、2 种介质、1 份异地；用官方备份能力，保留最近 N 份，定期恢复演练；RPO 决定丢多少数据，RTO 决定恢复多快。",
    "应急响应": "应急响应流程：准备→检测→遏制→根除→恢复→复盘。先确认影响范围和证据，隔离受影响系统，查根因，恢复业务，最后复盘沉淀基线。",
    "监控告警": "监控分层：基础设施、中间件、应用、业务。工具：Zabbix、Prometheus+Grafana、ELK、SLS。告警要分级、可路由、可关闭，重要告警接值班群。",
}

FALLBACKS = [
    "这个问题我暂时没有准备好答案，你可以直接联系武渭星本人：邮箱 18335357090@163.com。",
    "这个细节我建议直接和他本人沟通更准确，他一般很快回复。",
    "我还在学习中，这个问题可以先记下来，等他本人回复你更靠谱。",
    "我可以先帮你记录这个问题，你也可以加他微信 wwx-_-168 直接聊。",
]


def find_answer(text: str):
    lower = text.lower()
    # 第一步：先看是否命中某个分类名（如“工作经历”）
    for key, answer in KNOWLEDGE.items():
        if key in text or key in lower:
            return answer
    # 第二步：按关键词归类，覆盖用户换一种说法提问的情况
    if any(k in lower for k in ("经历", "经验", "工作")):
        return KNOWLEDGE["工作经历"]
    if any(k in lower for k in ("技术", "技能", "擅长", "栈")):
        return KNOWLEDGE["技术"]
    if any(k in lower for k in ("项目", "做过")):
        return KNOWLEDGE["项目"]
    if any(k in lower for k in ("联系", "电话", "邮箱", "微信")):
        return KNOWLEDGE["联系"]
    if any(k in lower for k in ("漏洞", "扫描", "补丁")):
        return KNOWLEDGE["漏洞扫描"]
    if any(k in lower for k in ("堡垒",)):
        return KNOWLEDGE["堡垒机"]
    if any(k in lower for k in ("waf", "web防火墙", "防火墙")):
        return KNOWLEDGE["WAF"]
    if any(k in lower for k in ("edr", "终端安全")):
        return KNOWLEDGE["EDR"]
    if any(k in lower for k in ("siem", "日志审计", "关联分析")):
        return KNOWLEDGE["SIEM"]
    if any(k in lower for k in ("等保", "等级保护", "三级测评")):
        return KNOWLEDGE["等保"]
    if any(k in lower for k in ("提示注入", "越狱", "jailbreak")):
        return KNOWLEDGE["提示注入"]
    if any(k in lower for k in ("redis未授权", "redis安全")):
        return KNOWLEDGE["Redis安全"]
    if any(k in lower for k in ("docker安全", "容器安全", "k8s安全")):
        return KNOWLEDGE["Docker安全"]
    if any(k in lower for k in ("备份", "恢复", "rpo", "rto")):
        return KNOWLEDGE["备份恢复"]
    if any(k in lower for k in ("应急响应", "溯源", "遏制")):
        return KNOWLEDGE["应急响应"]
    if any(k in lower for k in ("监控", "告警", "zabbix", "grafana")):
        return KNOWLEDGE["监控告警"]
    if any(k in lower for k in ("安全运维", "安全基线", "最小权限")):
        return KNOWLEDGE["安全运维"]
    if any(k in lower for k in ("你好", "hello", "hi")):
        return KNOWLEDGE["你好"]
    if any(k in lower for k in ("你是谁", "什么", "干嘛")):
        return KNOWLEDGE["你是谁"]
    if any(k in lower for k in ("ai", "模型", "大模型", "ollama", "dify")):
        return "武渭星在 AI 辅助运维方面有完整实践：Docker 部署 Ollama 运行 Qwen2.5，搭建 Dify 平台编排 Chatflow/Workflow，构建基于 Obsidian 的 RAG 知识库，实现 AI 辅助故障排查与文档生成。"
    return None


def answer_question(text: str) -> str:
    # 命中知识库就返回；完全没命中时随机给一句引导性兜底
    direct = find_answer(text)
    if direct:
        return direct
    import random
    return random.choice(FALLBACKS)

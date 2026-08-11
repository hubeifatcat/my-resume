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
}

FALLBACKS = [
    "好问题，不过这个超出了我的知识范围，建议直接联系武渭星本人详聊。",
    "这个问题我需要想想，你可以通过邮箱 18335357090@163.com 联系他。",
    "这个细节我不太确定，直接和他本人沟通更准确。",
    "这块我还没学会，他的技术栈还在不断扩展中。",
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

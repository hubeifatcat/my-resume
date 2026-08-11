# RAG 种子数据：把简历和项目档案整理成可切块的文档
SEED_DOCUMENTS = [
    {
        "source": "个人简介",
        "text": "武渭星是 AI 增强型实施运维工程师，3 年政企 SaaS 平台实施交付与运维经验，曾驻场国网信产项目。熟悉阿里云、Docker/K8s、Nacos/Redis/Nginx、DataWorks、Oracle/MySQL；AI 辅助运维已落地，故障定位从 10 分钟降到 1 分钟，脚本效率提升 40%，报告效率提升 50%。统招全日制本科，退伍军人，在北京求职。",
    },
    {
        "source": "工作经历-中电金信",
        "text": "中电金信软件有限公司，实施运维专员，2025.03 至今，驻场国网数字化审计平台。负责阿里云生产环境高可用保障，配置 ECS/SLB/RDS 告警；基于 DataWorks 构建离线数据同步管道；维护 Nacos、Redis、Nginx 中间件集群；制定蓝绿发布与灰度验证方案，生产变更零事故；执行安全加固（Redis 未授权、Nginx CVE、TLS）；基于 RBAC 管理权限，输出日报周报月报。",
    },
    {
        "source": "工作经历-金轩锋",
        "text": "北京金轩锋科技发展有限公司，运维专员，2024.07 至 2025.03，负责 7×24 视频监控监测平台。基于 GB/T 28181 维护视频流通道；Shell 巡检脚本 + Zabbix 告警，故障 5 分钟内闭环；Zabbix + Grafana 监控看板；tcpdump 抓包定位视频流中断问题。",
    },
    {
        "source": "工作经历-华苏",
        "text": "南京华苏科技有限公司，实施工程师，2023.10 至 2024.06，负责统一权限平台项目。阿里云生产环境微服务容器化部署；Nacos 服务发现与配置热更新；Sentinel 限流熔断、SkyWalking 链路追踪；DataWorks 全量+增量迁移；Oracle 到 MySQL 迁移适配；Jenkins+Git CI/CD；独立交付部署方案、测试用例、操作手册。",
    },
    {
        "source": "项目-智能运维知识库Agent",
        "text": "智能运维知识库 Agent，2026.05 至今，个人学习。基于 Python + FastAPI 的多智能体知识库问答系统。自研 Runtime Harness 调度器 + Blackboard 黑板机制，拆分为意图路由、风险判定、Prompt 组装、安全校验；Hybrid RAG（BM25 + Chroma 向量检索 + 重排），Recall@4=100%，MRR=0.876，P95 检索 260ms；Redis 短期记忆 + MySQL 长期快照，Token 输入量下降 13.54%；Ollama Qwen2.5-7B + ModelRouter + 三态熔断；MCP 受控工具调用。",
    },
    {
        "source": "项目-私有化大模型辅助运维",
        "text": "私有化大模型辅助运维工具，2025.04 至今，个人实践。基于 Docker 部署 Ollama 运行 Qwen2.5，搭建 Dify 平台编排 Chatflow；构建 RAG 运维知识库（Obsidian 双链 + Embedding），高频故障定位从 10 分钟压缩到 1 分钟；Claude Code 辅助生成 Shell/Python 脚本，效率提升 40%；结构化 Prompt 自动生成巡检报告，效率提升 50%。",
    },
    {
        "source": "项目-统一权限3.0",
        "text": "统一权限 3.0 架构升级，2023.10 至 2024.06，实施工程师。政企统一权限平台单体转微服务；阿里云生产环境容器化部署；云下系统整体迁移上云，DataWorks 数据迁移；Oracle 到 MySQL 迁移适配；全套交付文档，禅道闭环。",
    },
    {
        "source": "项目-GVA社区管理平台",
        "text": "基于 GVA 架构的社区管理平台，2023.06 至 2023.11，毕业设计。Go + Vue 前后端分离。Viper 配置管理、Zap 日志、Gorm 建表；JWT 登录凭证 + 拦截器鉴权；事务机制权限更新；CORS 联调；ElementUI + Axios + Pinia 前端。",
    },
    {
        "source": "技能",
        "text": "云平台：阿里云 ECS/SLB/RDS/OSS、Docker/K8s、Jenkins/GitLab CI、Nacos/Sentinel/SkyWalking、Ansible。操作系统：CentOS/Rocky、麒麟 OS、Shell、Ubuntu。中间件与数据库：Nginx、Redis、MySQL、Oracle、ELK、Prometheus+Grafana、Zabbix、RocketMQ/Kafka。编程：Python、Shell、Go/Gin、SQL。AI：Hybrid RAG、多智能体、MCP、Ollama、Dify、Chroma、Obsidian、Claude Code。",
    },
    {
        "source": "教育证书",
        "text": "湖北工程学院新技术学院，计算机科学与技术本科，2020-2024，专业排名前 20%。证书：网络安全管理员、计算机三级、退伍证、普通话二级乙等、驾驶证 C1、职场英语一级。",
    },
    {
        "source": "联系方式",
        "text": "电话 190-5475-0791；邮箱 18335357090@163.com；微信 wwx-_-168；GitHub github.com/hubeifatcat；简历网站 hubeifatcat.github.io/my-resume。目前在北京，接受出差，最快 9 月初到岗。",
    },
]

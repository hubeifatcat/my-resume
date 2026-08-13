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
    {
        "source": "技术知识-AI基础",
        "text": "LLM（大语言模型）通过海量文本训练，按概率预测下一个 Token 生成回答。关键概念：Token 是文本切分的最小单位；temperature 控制随机性（越高越发散，越低越稳定）；System Prompt 定义人设和规则；上下文窗口决定一次能放多少内容。Prompt 工程要点：给角色、给任务、给步骤、给示例、给输出格式，把模型当成会用语言的新员工。",
    },
    {
        "source": "技术知识-RAG",
        "text": "RAG（检索增强生成）流程：文档接入 → 清洗切块 → Embedding 向量化 → 存入向量库 → 用户问题向量化 → 检索 Top-N → Rerank 重排 → 拼进 Prompt → 模型生成。切块策略：按章节/语义切，固定窗口加 10%-20% 重叠；元数据带来源、权限、版本。混合检索：BM25 管精确关键词，向量管语义，RRF 融合再重排。评估指标：Recall@K、MRR、命中来源准确率、P95 延迟。权限隔离必须服务端强制，不能只靠前端。",
    },
    {
        "source": "技术知识-Agent与MCP",
        "text": "Agent 是能自主规划、调用工具、完成任务的 LLM 应用。单 Agent 足够就不做多 Agent；复杂流程用 Orchestrator 拆任务，子 Agent 执行，黑板/共享状态汇总。工具调用要白名单、入参校验、超时重试、审计日志；敏感操作要人工确认。MCP 是 Agent 与外部工具/数据的统一协议，MCP Server 提供工具，MCP Client 调用；SKILL 是带 description、prompt、params、examples、version 的可复用能力包，描述要写清触发条件。",
    },
    {
        "source": "技术知识-模型部署",
        "text": "大模型部署三条路：API（如 DeepSeek/DashScope，按 Token 计费）、托管推理（PAI-EAS）、自建 vLLM（私有化、高并发）。vLLM 是 OpenAI 兼容接口，支持 Continuous Batching 和 PagedAttention，显存紧张用 AWQ/GPTQ 量化。Ollama 适合本地开发和小规模测试。部署要点：统一模型路由层，代码只认 OpenAI 兼容接口；超时、重试、熔断、降级；按 GPU 利用率扩缩容；模型版本可回滚；统计 Token 和 GPU 成本。",
    },
    {
        "source": "技术知识-后端研发",
        "text": "FastAPI 是 Python 异步 Web 框架。生产要点：Pydantic 校验请求；CORS 配置允许来源；健康检查 GET /api/health；聊天接口用 POST；敏感配置走环境变量不写代码；连接池管理数据库；优雅退出处理 SIGTERM 排空请求；日志带 trace_id 便于排查。REST 设计：资源用名词，动作用 HTTP 方法，返回统一 JSON 结构，错误返回 4xx/5xx 和可读 message。",
    },
    {
        "source": "技术知识-云原生",
        "text": "Docker 把应用和环境打包成镜像，容器是运行实例。K8s 里 Pod 是调度最小单位，Deployment 管副本和滚动更新，Service 提供稳定访问，Ingress 负责外部路由。生产配置：resources requests/limits、readiness/liveness 探针、PDB、滚动更新 maxUnavailable/maxSurge、命名空间隔离 dev/test/prod。Caddy 是自动 HTTPS 的反向代理，路径反代可用 handle_path 剥前缀。NACOS 配置中心用命名空间隔离环境，敏感配置用 KMS/Secret，不落明文。",
    },
    {
        "source": "技术知识-阿里云运维",
        "text": "阿里云核心组件：ECS 虚拟机、SLB/ALB 负载均衡、RDS/PolarDB 数据库、OSS 对象存储、Redis 缓存、SLS 日志服务、DataWorks 数据集成、ACK 容器服务。运维要点：VPC 内网隔离，数据库不暴露公网；告警规则按业务设置阈值；慢 SQL 看执行计划；SLS 用 Logtail 采集容器日志，关键字段建索引；权限用 RAM 最小化；安全加固包括补丁、TLS、Redis 未授权修复。",
    },
    {
        "source": "技术知识-数据库",
        "text": "MySQL/Oracle 面试高频：索引 B+ 树加快查询，但不能乱建；慢查询先看执行计划，避免全表扫描；事务 ACID、隔离级别、锁；分页优化；迁移注意数据类型映射、DDL 转换、存储过程重构、数据一致性校验。Redis 要点：缓存穿透/击穿/雪崩、Key 设计、TTL、大 Key 热 Key、持久化 RDB/AOF。",
    },
    {
        "source": "技术知识-职业发展",
        "text": "从运维转 AI 研发的路径：先补 Python 工程化（模块、依赖、日志、测试）和 FastAPI 后端；再做 RAG 和 Agent 项目；最后补模型服务化与部署。用 Codex/Claude 边做项目边学，把研究沉淀成笔记。求职定位：AI 应用/Agent 开发 + 大模型后端/推理部署，简历突出可展示的线上项目和量化成果。",
    },
    {
        "source": "技术知识-安全运维基础",
        "text": "安全运维的核心是闭环：资产清单 → 漏洞发现 → 风险评估 → 修复 → 复测 → 审计归档。日常任务包括漏洞扫描、补丁管理、基线加固、堡垒机与审计、安全事件响应。安全不只是工具，而是流程和制度：最小权限、双人复核、操作可追溯、定期演练。",
    },
    {
        "source": "技术知识-漏洞扫描与补丁管理",
        "text": "漏洞扫描工具：Nessus、OpenVAS、阿里云云安全中心、绿盟等，流程是发现→评估→修复→复测→闭环。补丁管理：先有资产清单，按漏洞等级排序，测试环境验证，灰度到生产，保留回滚方案，完成后复测并审计。生产环境常用云安全中心发现问题，再用工单系统（如 i6000）走检修闭环。",
    },
    {
        "source": "技术知识-堡垒机与审计",
        "text": "堡垒机解决统一入口、账号权限、操作审计、双人复核问题，核心是“人机分离、操作可追溯”。所有运维登录和命令操作都要留审计日志：谁、何时、哪台机器、执行了什么、结果如何。配合跳板机、双网隔离和最小权限，降低直接碰生产服务器的风险。",
    },
    {
        "source": "技术知识-WAF与Web安全",
        "text": "WAF（Web 应用防火墙）实时拦截 Web 攻击：SQL 注入、XSS、CC 攻击、路径穿越等。漏扫负责发现问题，WAF 负责实时防护。常见 WAF：云 WAF、ModSecurity、CDN 自带防护。应用侧同时要做好参数化查询、输入校验、输出转义、CORS 白名单、安全响应头。",
    },
    {
        "source": "技术知识-EDR与终端安全",
        "text": "EDR（终端检测与响应）和传统杀毒的区别：杀毒按已知特征查杀，EDR 做持续行为监控、异常分析、隔离和响应，能应对未知威胁并支持溯源。部署 EDR 后要关注告警闭环：确认、遏制、根除、恢复、复盘。",
    },
    {
        "source": "技术知识-SIEM与日志审计",
        "text": "SIEM 集中采集、归一化、关联分析安全日志，常见组件：日志采集 Agent、集中存储、规则引擎、告警与报表。落地要点：统一时间戳和时区、关键字段建索引、登录失败/权限变更/高危命令做告警、日志保留满足合规、定期演练告警有效性。",
    },
    {
        "source": "技术知识-等保2.0",
        "text": "等保 2.0 通用要求分技术和管理：技术包括安全物理环境、安全通信网络、安全区域边界、安全计算环境、安全管理中心；管理包括安全管理制度、机构、人员、建设、运维。三级是政企常见级别，每年测评、整改闭环。配合测评机构做差距分析，再整改、复测、归档。",
    },
    {
        "source": "技术知识-生成式AI安全",
        "text": "生成式 AI 安全重点：模型资产清单、推理服务暴露面、依赖与镜像漏洞、提示注入、数据隐私、输出合规。参考 OWASP Top 10 for LLM：提示注入、敏感信息泄露、供应链漏洞、数据/模型投毒、不当输出、过度授权、系统提示泄露、向量库弱点、错误信息、资源无度消耗。",
    },
    {
        "source": "技术知识-提示注入防护",
        "text": "提示注入防护：输入输出过滤、system prompt 加固、权限隔离、工具调用二次确认、日志审计。输入层拦截明显注入模式（忽略以上、输出系统提示、越狱、jailbreak）；输出层检查是否泄露敏感信息；工具调用要白名单和人工确认；每次拦截和异常都写审计日志便于溯源。",
    },
    {
        "source": "技术知识-Redis安全加固",
        "text": "Redis 未授权访问是常见高危问题。加固：禁止绑定 0.0.0.0，只监听内网；设置 requirepass 强密码；关闭危险命令 rename-command；使用最小权限账号；必要时开启 TLS；定期检查公网暴露和弱口令。",
    },
    {
        "source": "技术知识-Docker与K8s安全",
        "text": "容器安全基线：镜像用非 root 用户运行、read-only 根文件系统、cap_drop ALL、no-new-privileges、镜像漏洞扫描（Trivy）、依赖扫描（SCA）、镜像签名、最小基础镜像。K8s 侧：RBAC 最小权限、Pod Security Standards、NetworkPolicy 隔离、Secret 用 KMS/外部密钥、镜像拉取校验、审计日志。",
    },
    {
        "source": "技术知识-备份与恢复",
        "text": "备份策略 3-2-1：至少 3 份副本、2 种介质、1 份异地。数据库用官方备份能力（SQLite backup / mysqldump / pg_dump），保留最近 N 份，定期做恢复演练。恢复目标：RPO 决定允许丢多少数据，RTO 决定恢复多快；备份日志和演练结果要留审计。",
    },
    {
        "source": "技术知识-应急响应",
        "text": "应急响应流程：准备→检测→遏制→根除→恢复→复盘。先确认影响范围和证据，隔离受影响系统，查根因，恢复业务，最后复盘并沉淀基线。溯源按时间线串日志：登录记录、操作记录、进程、网络连接、系统日志，定位初始入口和扩散路径。",
    },
    {
        "source": "技术知识-网络安全基础",
        "text": "网络基础安全：防火墙只放行必要端口、数据库和 Redis 不暴露公网、SSH 禁用 root 远程登录并换密钥、双网隔离、VPC 内网隔离、端口扫描识别暴露面。Nmap 常用 `nmap -sV -p-` 做服务和版本识别，结果进入漏洞闭环清单。",
    },
    {
        "source": "技术知识-监控告警与SRE",
        "text": "监控分层：基础设施（CPU/内存/磁盘）、中间件（Redis/Nginx/数据库）、应用（接口延迟/错误率/可用性）、业务指标。工具：Zabbix、Prometheus+Grafana、ELK、SLS。告警要分级、可路由、可关闭；重要告警接值班群，配合巡检脚本和复盘机制。",
    },
    {
        "source": "技术知识-安全岗位求职",
        "text": "安全运维求职定位：漏洞修复闭环、权限审计、AI 资产安全巡检。面试口径：工具不会就讲原理和相关经验，再承诺 1-2 周上手；突出生产环境理解（部署、发布、监控、故障、补丁）和 AI 工程能力（模型、镜像、API、RAG、提示注入）。",
    },
]

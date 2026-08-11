# 武渭星 · 个人简历网站

> AI增强型运维工程师 · 3年政企项目实施经验 · 北京求职

## 技术栈

- **前端**：原生 HTML + CSS + JavaScript（单页响应式）
- **部署**：GitHub Pages + Cloudflare CDN
- **后端**（规划中）：阿里云 ECS + FastAPI + Ollama（AI助手）

## 本地预览

直接用浏览器打开 `index.html` 即可。

## 部署步骤

### 1. 推送到 GitHub

```bash
git init
git add .
git commit -m "init: 个人简历网站"
git branch -M main
git remote add origin https://github.com/你的用户名/resume.git
git push -u origin main
```

### 2. 开启 GitHub Pages

仓库 → Settings → Pages → 选择 `main` 分支 `/root` 目录 → Save

访问 `https://你的用户名.github.io/resume`

### 3. 绑定自定义域名（可选）

- 购买域名（Namesilo / 阿里云万网）
- 注册 Cloudflare，修改 NS 记录
- 添加 DNS 记录指向 GitHub Pages
- 仓库 Settings → Pages → Custom domain

### 4. 部署后端（可选，后期）

购买阿里云 ECS → 部署 FastAPI + Ollama → 开启 AI 助手对话功能

## 网站结构

```
resume-website/
├── index.html     # 主页面
├── README.md      # 本文件
└── assets/        # 资源（可选）
    └── resume.pdf # 可下载的PDF简历
```

## 自定义修改

打开 `index.html`，修改以下内容为你自己的信息：

- `第27行附近`：GitHub 链接
- `联系方式区域`：电话、邮箱、微信
- `个人照片`：头像（可替换 hero-avatar 区域的文字为头像图片）

---

## Vault 关联笔记

- [[AI+实施运维/简历网站搭建指南]] — 域名+Cloudflare+ECS部署方案
- [[AI+实施运维/知识种子材料#五、简历网站架构]] — 网站架构速查
- [[AI+实施运维/BOSS直聘简历优化与面试准备]] — 简历内容来源

## React 版（2026-08-11）

- 源码位于 `react-app/`，使用 React + Vite 构建。
- 部署：本地构建后把 `react-app/dist` 推送到 `gh-pages` 分支，仓库 Settings → Pages 的 Source 选择 gh-pages 分支 `/root`。
- 收录策略：`index.html` 带 `noindex, nofollow`，`public/robots.txt` 禁止抓取，正文由 JS 渲染，爬虫抓到的只有标题和入口。
- AI 助手页左侧 SKILL/MCP 模块为前端占位，后端已接入 `https://api.liumingqing.com/wuxing/api/chat`（配置在 `react-app/src/Chat.jsx`）。

## 后端（2026-08-11）

- `backend/`：FastAPI 简历 AI 后端，提供 `POST /api/chat`、`GET /api/tools`、`GET /api/health`。
- 默认用内置武渭星知识库回答；`.env` 可切换 `LLM_PROVIDER=ollama` / `dashscope` / `deepseek`。
- 部署到服务器：上传 `backend/`，执行 `docker compose up -d --build`，详见 `backend/部署说明.md`。

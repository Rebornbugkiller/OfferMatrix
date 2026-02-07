<div align="center">

# 🌸 OfferMatrix

**面试管理神器 · 樱花粉主题 · 颜值与实用并存**

求职季的你，是不是也曾在 Excel 里疯狂记录面试时间，然后还是忘了明天有场面试？

[![License: MIT](https://img.shields.io/badge/License-MIT-ec4899.svg)](LICENSE)
[![Go](https://img.shields.io/badge/Go-1.23-00ADD8.svg)](https://go.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://docs.docker.com/compose/)

</div>

---

## 为什么需要它？

面试季的痛点：
- 面了 10 家公司，哪家进行到哪一轮了？
- 明天几点面试来着？会议链接呢？
- 上次那道算法题怎么答的？下次还会挂...
- 面了这么多，到底 Offer 率多少？

**OfferMatrix 帮你搞定这一切：**

- **一眼看清本周所有面试** — 周历视图，再也不会撞车
- **追踪每家公司进度** — 进行中 / Offer / 挂了，状态一目了然
- **AI 智能解析** — 粘贴面试通知，自动提取公司、时间、会议链接
- **面试复盘** — 记录问题和反思，同样的坑不踩两次
- **数据统计** — Offer 率、面试趋势、轮次分布，用数据复盘求职季

## 截图预览

<div align="center">

### 面试日历
![面试日历](docs/images/dashboard.png)

### 公司申请
![公司申请](docs/images/applications.png)

### 数据统计
![数据统计](docs/images/statistics.png)

</div>

<details>
<summary>更多截图</summary>

| 面试详情 | 面试复盘 |
|---------|---------|
| ![详情](docs/images/interview-detail.png) | ![复盘](docs/images/interview-review.png) |

</details>

## 功能亮点

### 可视化周历
- 拖拽调整面试时间，比 Google Calendar 更专注
- 智能颜色标记：待面试蓝色、过期橙色、Offer 绿色、挂了红色
- 毛玻璃卡片 + 渐变统计面板，樱花飘落动画背景

### AI 智能添加
- 粘贴面试邀请邮件或消息，AI 自动解析
- 提取公司名称、面试时间、会议链接
- 支持自定义 LLM 配置（OpenAI 兼容接口）

### 公司申请管理
- 追踪每家公司的申请状态和面试进度
- 快速添加面试，一键为进行中的公司安排下一轮
- 状态筛选：按进行中 / Offer / 已挂过滤查看

### 面试复盘
- 记录每场面试的问题和你的回答
- Markdown 格式支持，写下反思

### 数据统计
- **核心指标**：总面试数、Offer 率、复盘完成率
- **趋势分析**：按周/月查看面试数量变化（渐变面积图）
- **分布图表**：公司状态分布（环形图）、面试轮次分布（柱状图）

## 技术栈

```
前端: React 19 + TypeScript + Vite 7 + Ant Design 6 + FullCalendar + Recharts + TailwindCSS 4
后端: Go 1.23 + Gin + GORM + JWT
数据库: MySQL 8
部署: Docker Compose 一键启动
AI: OpenAI 兼容接口（可配置）
```

## 快速开始

```bash
# 克隆项目
git clone https://github.com/Rebornbugkiller/OfferMatrix.git
cd OfferMatrix

# 配置
cp backend/config.docker.example.yaml backend/config.docker.yaml
# 编辑 config.docker.yaml 设置数据库密码

# 启动（需要 Docker）
docker compose up -d --build

# 访问 http://localhost 开始使用
```

## 本地开发

<details>
<summary>点击展开</summary>

### 数据库
```sql
CREATE DATABASE offermatrix;
```

### 后端
```bash
cd backend
cp config.example.yaml config.yaml
# 编辑 config.yaml 设置本地数据库连接
go run cmd/server/main.go
# 运行在 http://localhost:8080
```

### 前端
```bash
cd frontend
npm install
npm run dev
# 运行在 http://localhost:5173
```

</details>

## 项目结构

```
OfferMatrix/
├── backend/                 # Go 后端
│   ├── cmd/server/         # 入口
│   └── internal/           # 业务逻辑（handler/model/repository）
├── frontend/               # React 前端
│   └── src/
│       ├── components/     # 可复用组件
│       ├── pages/          # 页面（Dashboard/Applications/Statistics）
│       └── services/       # API 封装
├── database/               # SQL 脚本
└── docker-compose.yml      # 一键部署
```

## Roadmap

- [x] 面试日历（周历视图 + 拖拽）
- [x] 公司申请管理
- [x] 面试复盘
- [x] 数据统计
- [x] AI 智能解析面试通知
- [x] 状态筛选过滤
- [x] 樱花粉主题 + 毛玻璃视觉升级
- [ ] 面试提醒（邮件/微信通知）
- [ ] 导出面试记录（PDF/Excel）
- [ ] 多用户协作

## License

MIT

---

<div align="center">

**祝你 Offer 拿到手软！** 🌸

</div>

# OfferMatrix

> 求职季的你，是不是也曾在 Excel 里疯狂记录面试时间，然后还是忘了明天有场面试？

**OfferMatrix** 是一个面试管理神器，让你告别混乱的求职流程。

## 为什么需要它？

面试季的痛点：
- 面了 10 家公司，哪家进行到哪一轮了？🤯
- 明天几点面试来着？会议链接呢？😱
- 上次那道算法题怎么答的？下次还会挂... 😭

**OfferMatrix 帮你搞定这一切：**

✅ **一眼看清本周所有面试** - 周历视图，再也不会撞车

✅ **追踪每家公司进度** - 进行中 / Offer / 挂了，状态一目了然

✅ **面试复盘** - 记录问题和反思，同样的坑不踩两次

## 截图

| 面试日历 | 公司列表 |
|---------|---------|
| ![日历](docs/images/dashboard.png) | ![列表](docs/images/applications.png) |

| 面试详情 | 面试复盘 |
|---------|---------|
| ![详情](docs/images/interview-detail.png) | ![复盘](docs/images/interview-review.png) |

## 功能亮点

- 📅 **可视化周历** - 拖拽调整面试时间，比 Google Calendar 更专注
- 🎨 **智能颜色标记** - 过期面试橙色提醒，Offer 绿色庆祝，挂了红色... 默哀
- 🚀 **快速添加面试** - 一键为进行中的公司添加下一轮
- 📝 **面试复盘** - 记录问题、反思、下次怎么答

## 技术栈

```
前端: React + TypeScript + Vite + Ant Design + FullCalendar
后端: Go + Gin + GORM + JWT
数据库: MySQL
部署: Docker Compose 一键启动
```

## 快速开始

```bash
# 克隆项目
git clone https://github.com/Rebornbugkiller/OfferMatrix.git
cd OfferMatrix

# 配置
cp backend/config.docker.example.yaml backend/config.docker.yaml
# 编辑 config.docker.yaml 设置密码

# 启动（需要 Docker）
export MYSQL_ROOT_PASSWORD=your_password
docker-compose up -d --build

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
│   └── internal/           # 业务逻辑
├── frontend/               # React 前端
│   └── src/
│       ├── components/     # 组件
│       ├── pages/          # 页面
│       └── services/       # API
└── docker-compose.yml      # 一键部署
```

## License

MIT

---

**祝你 Offer 拿到手软！** 🎉

# OfferMatrix - 面试管理系统

一个帮助你管理求职面试流程的 Web 应用。

核心价值：**宏观时间视图（周历）+ 微观流程视图（公司时间线和复盘）**

## 技术栈

- **前端**: React + Vite + TypeScript + Tailwind CSS + Ant Design
- **后端**: Go + Gin
- **数据库**: MySQL

## 快速开始

### 1. 数据库配置

确保 MySQL 已安装并运行，然后执行：

```bash
mysql -u root -p < database/schema.sql
```

或者手动创建数据库：

```sql
CREATE DATABASE offermatrix;
```

### 2. 启动后端

```bash
cd backend

# 修改配置文件（如需要）
# 编辑 config.yaml 设置你的 MySQL 密码

# 运行
go run cmd/server/main.go
```

后端将在 http://localhost:8080 启动。

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端将在 http://localhost:5173 启动。

## 功能特性

### 周历视图
- 可视化周历展示所有面试安排
- 颜色编码：待进行=蓝色，已通过=绿色，已拒绝=红色
- 支持拖拽调整面试时间

### 公司申请管理
- 列表/搜索查看所有申请的公司
- 按公司分组面试（如：字节跳动 -> 一面 -> 二面）

### 面试详情与复盘
- 点击日历事件打开详情抽屉
- 支持 Markdown 格式的复盘笔记
- 记录面试问题和事后反思

## API 端点

### Applications
- `GET /api/applications` - 获取所有申请
- `GET /api/applications/:id` - 获取申请详情（含面试列表）
- `POST /api/applications` - 创建申请
- `PUT /api/applications/:id` - 更新申请
- `DELETE /api/applications/:id` - 删除申请

### Interviews
- `GET /api/interviews` - 获取所有面试
- `GET /api/interviews/:id` - 获取面试详情
- `POST /api/interviews` - 创建面试
- `PUT /api/interviews/:id` - 更新面试
- `PATCH /api/interviews/:id/review` - 更新复盘内容
- `DELETE /api/interviews/:id` - 删除面试

## 项目结构

```
OfferMatrix/
├── backend/                    # Go 后端
│   ├── cmd/server/main.go     # 入口文件
│   ├── internal/
│   │   ├── config/            # 配置管理
│   │   ├── handler/           # API 处理器
│   │   ├── model/             # 数据模型
│   │   └── repository/        # 数据访问层
│   └── pkg/database/          # 数据库连接
│
├── frontend/                   # React 前端
│   └── src/
│       ├── components/        # 组件
│       ├── pages/             # 页面
│       ├── services/          # API 服务
│       └── types/             # 类型定义
│
└── database/
    └── schema.sql             # 数据库脚本
```

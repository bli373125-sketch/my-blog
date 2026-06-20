# 前端文件分析文档

> 项目：personal-site (个人博客)  
> 技术栈：React 18 + Vite 5 + Tailwind CSS 3 + React Router v6  
> 分析日期：2026-06-20

---

## 一、项目概览

这是一个全栈个人博客应用，分为 `client/`（前端 React SPA）和 `server/`（Express + SQLite 后端）。本文档分析前端部分的所有文件。

### 技术栈速览

| 层面 | 技术 |
|------|------|
| 框架 | React 18 (`react`, `react-dom`) |
| 语言 | JavaScript (JSX) |
| 构建工具 | Vite 5 + `@vitejs/plugin-react` |
| 路由 | React Router DOM v6 |
| 样式 | Tailwind CSS 3 + Autoprefixer + PostCSS |
| Markdown | `react-markdown` v9 + `react-syntax-highlighter` (Prism, oneDark 主题) |
| SEO | `react-helmet-async` |
| 暗色模式 | 自定义 React Context + Tailwind `dark:` class 切换 |

### 目录结构

```
client/
├── index.html                  # HTML 入口
├── package.json                # 依赖清单
├── vite.config.js              # Vite 构建配置
├── tailwind.config.js          # Tailwind CSS 配置
├── postcss.config.js           # PostCSS 配置
└── src/
    ├── main.jsx                # 应用启动入口
    ├── App.jsx                 # 根布局组件（路由定义）
    ├── index.css               # 全局样式（Tailwind 指令）
    ├── useTheme.jsx            # 暗色模式 Context
    ├── api/
    │   └── index.js            # API 通信层（集中管理所有后端请求）
    ├── components/
    │   ├── Navbar.jsx          # 顶部导航栏
    │   ├── Footer.jsx          # 页脚
    │   ├── ArticleCard.jsx     # 文章卡片（首页列表用）
    │   └── Toc.jsx             # 文章目录侧边栏
    └── pages/
        ├── Home.jsx            # 首页（文章列表 + 搜索 + 标签过滤 + 分页）
        ├── Article.jsx         # 文章详情页（Markdown 渲染 + 评论区）
        ├── About.jsx           # 关于/个人介绍页
        └── Admin.jsx           # 管理后台（文章 CRUD + 个人信息编辑）
```

---

## 二、根配置文件

### `client/index.html`
**HTML 入口文件 —— 整个 SPA 的挂载点。**

- 设置 `lang="zh-CN"`，声明页面语言为中文
- `<meta charset="UTF-8">` 和 `viewport` meta 标签保证移动端适配
- `<div id="root">` 是 React 应用的挂载容器，`main.jsx` 中通过 `createRoot` 将 `<App />` 渲染到此处
- `<script type="module" src="/src/main.jsx">` 告诉 Vite 入口模块的位置
- `body` 预设了暗色模式基础样式（`bg-gray-50 dark:bg-gray-950` 等），确保页面加载瞬间不会闪烁

### `client/vite.config.js`
**Vite 构建工具配置 —— 控制开发服务器和打包行为。**

- `plugins: [react()]` —— 启用 `@vitejs/plugin-react`，支持 JSX 编译和 Fast Refresh（热更新不改状态）
- `server.port: 5173` —— 开发服务器固定端口
- `server.proxy` —— 所有 `/api` 开头的请求被代理转发到 `http://localhost:3001`（后端 Express 服务器）。这解决了开发环境下的跨域问题，生产环境中前端构建产物由后端直接托管

### `client/tailwind.config.js`
**Tailwind CSS 配置 —— 定义样式系统的扫描范围和暗色策略。**

- `content` —— 指定扫描 `index.html` 和 `src/**/*.{js,jsx}` 中的类名。Vite 构建时，未被使用的 Tailwind 类会被 Tree-shaking 掉，最终 CSS 仅包含实际用到的样式
- `darkMode: "class"` —— 暗色模式通过 HTML 标签上的 `class="dark"` 切换（在 `useTheme.jsx` 中控制），而非跟随系统 `prefers-color-scheme`

### `client/postcss.config.js`
**PostCSS 处理配置 —— CSS 构建管道。**

- `tailwindcss: {}` —— 先将 Tailwind 指令（`@tailwind base/components/utilities`）编译为实际 CSS
- `autoprefixer: {}` —— 自动添加浏览器厂商前缀，保证兼容性

### `client/package.json`
**前端依赖清单与脚本定义。**

- **脚本**：
  - `npm run dev` → 启动 Vite 开发服务器（端口 5173，支持 HMR）
  - `npm run build` → 生产构建，输出到 `dist/`
  - `npm run preview` → 本地预览生产构建
- **运行时依赖**（6 个）：`react`、`react-dom`、`react-helmet-async`、`react-markdown`、`react-router-dom`、`react-syntax-highlighter`
- **开发依赖**（5 个）：`vite`、`@vitejs/plugin-react`、`tailwindcss`、`postcss`、`autoprefixer`

---

## 三、应用入口层

### `client/src/main.jsx`
**应用启动入口 —— 所有代码的起点。**

负责将 React 挂载到 DOM，并按"洋葱皮"模式包裹三层 Provider：

```
React.StrictMode          ← 开发环境检查，帮助发现潜在问题
  └─ HelmetProvider        ← react-helmet-async，管理各页面 <head> 中的 SEO 标签
       └─ ThemeProvider     ← 自定义主题 Context，向全应用注入 { dark, toggle }
            └─ BrowserRouter ← React Router，启用客户端路由
                 └─ <App /> ← 根组件
```

这种包裹模式确保全局能力（路由导航、主题切换、SEO 设置）在应用的任何角落都可用。

### `client/src/App.jsx`
**根布局组件 —— 定义页面的"骨架"。**

- 采用 `min-h-screen flex flex-col` 的粘性底部布局：Navbar 在顶、Footer 在底、中间主内容区自动撑满
- 主内容区限制最大宽度 `max-w-4xl` 并水平居中
- `<Routes>` 定义四条路由：
  | 路径 | 页面组件 | 说明 |
  |------|----------|------|
  | `/` | `<Home />` | 首页，文章列表 |
  | `/article/:id` | `<Article />` | 文章详情，`:id` 为动态参数 |
  | `/about` | `<About />` | 关于/个人介绍 |
  | `/admin` | `<Admin />` | 管理后台（需登录） |
- 暗色模式通过 `bg-gray-50 dark:bg-gray-950 transition-colors` 实现平滑过渡

### `client/src/index.css`
**全局样式入口 —— 仅有三行 Tailwind 指令。**

```css
@tailwind base;       /* 基础样式重置（normalize） */
@tailwind components; /* 组件类（可通过 @layer components 自定义） */
@tailwind utilities;  /* 工具类（margin、padding、颜色等） */
```

所有样式都在 JSX 中通过 Tailwind 工具类直接定义，无需手写 CSS。

---

## 四、全局状态与工具模块

### `client/src/useTheme.jsx`
**暗色模式 Context —— 项目中唯一的全局状态管理。**

- **初始化逻辑**：优先读取 `localStorage.getItem("theme")`；若无，则通过 `window.matchMedia("(prefers-color-scheme: dark)")` 检测系统偏好
- **切换行为**：调用 `toggle()` → 反转 `dark` 布尔值 → 在 `<html>` 上增删 `"dark"` class → 写入 `localStorage`
- **导出**：`ThemeProvider`（包裹组件）和 `useTheme()` hook（返回 `{ dark, toggle }`）
- 任何组件只需 `const { dark, toggle } = useTheme()` 即可读取或切换主题

### `client/src/api/index.js`
**API 通信层 —— 整个前端数据的唯一入口，集中管理所有后端请求。**

**认证机制**：
- `authHeaders()` 从 `localStorage` 读取 `blog_token`（JWT），拼装 `Authorization: Bearer <token>` 请求头
- 只有写操作（创建/更新/删除文章、修改信息、上传图片）携带认证头
- 读操作（查看文章列表、详情、标签、评论、个人信息）无需认证

**API 函数清单**：

| 函数 | 方法 | 端点 | 是否认证 |
|------|------|------|----------|
| `login(password)` | POST | `/api/auth/login` | 否 |
| `logout()` | - | (仅清除 localStorage) | - |
| `fetchArticles({page, tag, q})` | GET | `/api/articles?page=&tag=&q=` | 否 |
| `fetchTags()` | GET | `/api/articles/tags/all` | 否 |
| `fetchArticle(id)` | GET | `/api/articles/:id` | 否 |
| `createArticle(data)` | POST | `/api/articles` | 是 |
| `updateArticle(id, data)` | PUT | `/api/articles/:id` | 是 |
| `deleteArticle(id)` | DELETE | `/api/articles/:id` | 是 |
| `fetchComments(articleId)` | GET | `/api/comments/article/:articleId` | 否 |
| `postComment(articleId, {author, content})` | POST | `/api/comments/article/:articleId` | 否 |
| `fetchProfile()` | GET | `/api/profile` | 否 |
| `updateProfile(data)` | PUT | `/api/profile` | 是 |
| `uploadImage(file)` | POST | `/api/upload` | 是 |

**设计优点**：如果以后需要替换 fetch 为 Axios、添加全局错误处理、请求/响应拦截器，只需修改这一个文件。

---

## 五、公共组件层 (`components/`)

### `client/src/components/Navbar.jsx`
**顶部导航栏 —— 三个核心功能：**

1. **品牌标识**："My Blog" 文字，链接回首页（`/`），使用 `text-indigo-600` 主题色
2. **导航链接**：通过 `links` 数组动态渲染 Home (`/`)、About (`/about`)、Write (`/admin`)。使用 `useLocation().pathname` 与链接 `to` 精确匹配实现当前页高亮
3. **暗色模式切换按钮**：调用 `useTheme().toggle`，显示 ☀（暗色模式时，点击切亮）或 ☾（亮色模式时，点击切暗）

### `client/src/components/Footer.jsx`
**页脚组件 —— 纯展示型组件。**
- 显示版权年份（`new Date().getFullYear()`，动态生成）和 "Built with React + Express." 标识
- 带顶部边框分隔 `border-t`

### `client/src/components/ArticleCard.jsx`
**文章卡片组件 —— 用于首页文章列表。**

- 接收 `article` 对象作为 prop
- 展示：标题（`text-xl font-semibold`）+ 摘要（可选）+ 发布日期（`zh-CN` 格式）+ 标签
- 标签处理：通过 `JSON.parse(article.tags)` 将 JSON 字符串转为数组，渲染为灰色小圆角标签
- 整体是 `<Link to={/article/${article.id}}>`，hover 时阴影加深
- 暗色模式：卡片背景 (`dark:bg-gray-800`)、文字颜色等均有对应暗色样式

### `client/src/components/Toc.jsx`
**文章目录（Table of Contents）侧边栏 —— 文章详情页的辅助导航。**

- **标题提取**：通过正则 `/^(#{1,3})\s+(.+)$/gm` 从 Markdown 内容中提取 h1~h3 标题
- **锚点 ID 生成**：`slugify` 算法 —— 转小写 + 将非单词/非中文字符替换为 `-` + 去除首尾连字符。正则 `[^\w一-鿿]` 特别包含了中文字符的 Unicode 范围（U+4E00 ~ U+9FFF）
- **活跃章节追踪**：使用 `IntersectionObserver` API 监听各标题元素是否在视口中，自动高亮当前阅读章节。`rootMargin: "-80px 0px -80% 0px"` 表示当标题滚动到距顶部 80px 时即视为进入视口
- **显示条件**：
  - 仅在 `lg` 及以上屏幕显示（`hidden lg:block`），移动端隐藏
  - 标题少于 2 个时返回 `null`，不渲染
  - 使用 `sticky top-20` 固定在侧边

---

## 六、页面组件层 (`pages/`)

### `client/src/pages/Home.jsx`
**首页 —— 文章列表页，功能最丰富的公开页面。**

**数据流**：
1. 组件挂载时调用 `fetchTags()` 获取所有标签（仅一次）
2. 当 `page`、`activeTag`、`q`（搜索关键词）任一变化时，调用 `fetchArticles({ page, tag, q })` 重新获取文章

**功能模块**：

| 功能 | 实现方式 |
|------|----------|
| 搜索 | 表单提交 → `setQ(search)` + `setPage(1)` → 触发重新 fetch。支持清除按钮 |
| 标签过滤 | 遍历所有标签渲染按钮，点击切换 `activeTag`（再次点击取消），重置到第 1 页 |
| 文章列表 | 加载中显示 Loading...；无文章时引导到 `/admin`；有文章时用 `<ArticleCard>` 网格展示 |
| 分页 | Prev/Next 按钮，边界禁用（`disabled={page === 1}` 和 `disabled={page === totalPages}`），显示 `当前页 / 总页数` |
| SEO | `<Helmet>` 设置 `<title>My Blog</title>` |

### `client/src/pages/Article.jsx`
**文章详情页 —— 最复杂的展示页面。**

**数据流**：
- 通过 `useParams()` 获取 URL 中的 `:id` 参数
- 并行调用 `fetchArticle(id)` 和 `fetchComments(id)` 获取文章和评论

**Markdown 渲染**（核心功能）：
- 使用 `react-markdown` 渲染正文，通过 `components` prop 自定义渲染规则：
  - **自定义标题**：h1~h3 自动生成 `id` 属性（`slugify(children)`），供 TOC 组件跳转使用
  - **代码块**：行内代码渲染为 `<code>`；围栏代码块使用 `react-syntax-highlighter` 的 Prism 引擎 + `oneDark` 主题语法高亮
- **排版**：通过 Tailwind 的 `prose prose-lg dark:prose-invert` 类获得精美的文章排版，并用任意选择器（如 `[&_pre]:!bg-[#282c34]`）精确控制代码块样式

**评论区**：
- 展示已有评论（作者名 + 日期 + 内容，`whitespace-pre-wrap` 保留评论中的换行）
- 发布表单：作者名（可选）+ 内容（必填），提交后调用 `postComment()` → 清空表单 → 重新加载评论列表
- 成功/失败提示（2 秒后自动消失）

**其他**：
- 错误处理：文章不存在时显示 404 样式（"Article not found" + 返回首页链接）
- SEO：动态设置 `<title>{文章标题} — My Blog</title>` 和 `<meta name="description">`
- 布局：文章正文 + 右侧 TOC 侧边栏的 flex 两栏布局

### `client/src/pages/About.jsx`
**关于/个人介绍页 —— 相对简单的信息展示页。**

- 挂载时调用 `fetchProfile()` 获取个人信息
- 展示内容：
  - **头像**（可选）：`w-24 h-24 rounded-full object-cover` 圆形容器
  - **姓名**和**简介**（`whitespace-pre-wrap` 保留换行格式）
  - **技能标签**：将 `skills` 字符串按逗号/空格拆分，渲染为 indigo 主题色圆角标签
  - **联系方式**：Email 和 GitHub 链接
- 整体卡片式布局（`bg-white dark:bg-gray-800 rounded-lg shadow-sm`）

### `client/src/pages/Admin.jsx`
**管理后台 —— 项目中最复杂、功能最多的组件，约 190 行。**

**身份认证**：
- 进入页面时检查 `localStorage` 中是否存在 `blog_token`（`!!getToken()`）
- 若不存在 → 显示密码登录表单 → 调用 `login(password)` → 成功后设置 `loggedIn = true`，失败显示 "Wrong password"
- 提供 Logout 按钮，调用 `logout()` 清除 token 并重置状态
- Token 过期处理：API 调用抛出异常时自动调用 `handleLogout()`

**双 Tab 布局**：
- "Articles" Tab → 文章管理
- "Profile" Tab → 个人信息编辑
- 切换通过 `tab` 状态 + 底部边框高亮实现

**Articles Tab —— 两栏布局**：

| 左侧（表单） | 右侧（预览） |
|-------------|-------------|
| 标题输入框 | 实时渲染标题 |
| 摘要输入框 | 实时渲染摘要 |
| 标签输入框（逗号分隔） | 实时 Markdown 渲染（`<ReactMarkdown>`） |
| 图片上传按钮 → 插入 `![name](url)` | 空态提示 "Start typing to preview..." |
| Markdown 正文编辑区（`font-mono` 等宽字体） | — |
| Publish / Save 按钮 | — |
| Cancel 按钮（编辑模式） | — |

- **图片上传**：用户选择文件 → `uploadImage(file)` → 服务端返回 URL → 在正文末尾追加 `![文件名](URL)` Markdown 语法
- **编辑 vs 新建**：通过 `editId` 状态区分 —— 有值则调用 `updateArticle`，无值则调用 `createArticle`
- **文章列表**（Tab 下方）：分页展示，每条有 Edit（回填表单）和 Delete（带 `window.confirm` 确认）按钮

**Profile Tab**：
- 动态表单，通过 `["name","bio","avatar","email","github","skills"]` 数组渲染 6 个字段
- `bio` 字段使用 `<textarea>`，其余使用 `<input>`
- 保存调用 `updateProfile(profile)`

---

## 七、整体架构图

```
index.html (挂载点)
└── main.jsx (启动入口，三层 Provider 洋葱包裹)
    └── App.jsx (根布局: Navbar + Routes + Footer)
        │
        ├── useTheme.jsx ────── 暗色模式 Context (全局)
        ├── api/index.js ─────── API 通信层 (全局)
        │
        ├── Navbar.jsx ───────── 导航栏 + 暗色切换按钮
        ├── Footer.jsx ───────── 页脚
        │
        ├── Routes:
        │   ├── Home.jsx ─────── 文章列表 + 搜索 + 标签过滤 + 分页
        │   │   └── ArticleCard.jsx ─ 文章卡片
        │   │
        │   ├── Article.jsx ──── Markdown 渲染 + 代码高亮 + 评论区
        │   │   └── Toc.jsx ──── 目录侧边栏 (IntersectionObserver)
        │   │
        │   ├── About.jsx ────── 个人介绍展示 (头像/技能/联系方式)
        │   │
        │   └── Admin.jsx ────── 管理后台 (JWT 登录 + 文章 CRUD + 个人信息编辑)
```

---

## 八、关键设计特点

1. **无第三方状态管理库**：项目规模适合仅使用 React 内置 hook（`useState`/`useEffect`/`useContext`），避免过度工程化。唯一需要跨组件共享的状态（暗色模式）通过 Context 解决。

2. **API 层集中化**：`api/index.js` 是所有网络请求的唯一入口。替换 fetch 为 Axios、添加全局错误拦截器、请求重试等，都只需修改这一个文件。

3. **暗色模式系统级实现**：通过 `<html>` 上的 `dark` class + Tailwind 的 `dark:` 变体，任何组件只需添加 `dark:text-white` 等类名即可适配暗色模式，实现极其简洁。

4. **组件粒度合理**：`Toc`（目录）和 `ArticleCard`（卡片）被抽成独立组件在多个上下文中复用；`Admin.jsx` 功能虽多但职责明确（管理后台的所有操作），拆分反而会增加 props 传递的复杂度。

5. **构建时 CSS 优化**：Tailwind 只生成实际用到的 CSS 类，生产构建的 CSS 体积极小。

6. **无 TypeScript**：所有文件使用 JSX（JavaScript），未引入类型系统。

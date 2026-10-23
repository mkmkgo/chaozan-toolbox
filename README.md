# 超赞工具箱

自媒体人的一站式在线工具集。一个域名、一个静态站点装下所有工具，工具之间共用统一导航，全部免登录、浏览器本地处理。

- 主页：`/`
- 工具：`/mini-cover/`、`/thiscover/`、`/pai-ban/`、`/img-compress/` …
- 部署：腾讯云 EdgeOne Pages（国内站），纯静态，不需要服务器、不需要每个工具单独一个 Worker

## 为什么不是「一个工具一个 Worker」

所有工具在**同一个 EdgeOne Pages 项目**里，靠子目录区分路径：

```
dist/
├── index.html          # 主页（工具导航）
├── tools.config.json   # 工具清单（唯一数据源）
├── assets/             # 公共图片、LOGO
├── shared/chrome.js    # 统一导航条（返回首页 / 博客 / 社交）
├── mini-cover/         # 工具 A，访问 /mini-cover/
├── thiscover/          # 工具 B，访问 /thiscover/
└── pai-ban/            # 工具 C，访问 /pai-ban/
```

没有反向代理、没有跨域、没有多项目绑定，一个 `dist/` 传上去就完事。新增工具也不会多出任何域名或项目。

## 新增一个工具（3 步）

1. **拿到产物**：把工具源码放到 `vendor/<名字>/`，跑它的构建命令得到静态产物（如 `dist/`、`out/`）。纯手写工具直接放在 `tools/<slug>/`。
2. **登记**：在 `tools.config.json` 的 `tools` 里加一条：

   ```json
   {
     "slug": "img-compress",
     "name": "图片压缩",
     "desc": "批量压缩与格式转换",
     "category": "image",
     "icon": "image",
     "color": "#0F6E56",
     "tags": ["压缩", "WebP"],
     "status": "ready",
     "license": "自研",
     "buildDir": "tools/img-compress"
   }
   ```

   `status` 取值：`ready`（本站内运行）、`external`（外链跳转，配 `url`）、`planned`（占位，暂不开放）。
3. **构建**：`node scripts/build.mjs`，产物自动进 `dist/<slug>/`，并自动注入统一导航条。

主页卡片、搜索、分类全部由 `tools.config.json` 驱动，不用改任何页面代码。

## 命令

```bash
node scripts/fetch-vendor.mjs   # 拉取并解压第三方工具源码（首次）
node scripts/build.mjs          # 汇总构建到 dist/
node scripts/build.mjs --serve  # 构建后本地预览 http://127.0.0.1:8899
```

第三方工具各自构建（在 `vendor/<名字>/` 内）：

```bash
# Mini-Cover（Vue3 + Vite）
npm install
npx vite build --base=./

# ThisCover（Next.js 16，静态导出）
npm install --legacy-peer-deps
npx next build          # 产物在 out/
```

> 注意 `--base=./` 用相对路径，这样工具在 `/mini-cover/` 子目录下也能正确加载资源。

## 部署到 EdgeOne Pages（国内站）

1. 控制台 → EdgeOne Pages → 创建项目 → **直接上传**，把 `dist/` 整个目录拖进去。
2. 不需要构建命令、不需要 Node 环境；系统会分配一个默认域名。
3. 绑定自定义域名（如 `mytools.202597.xyz`）需该域名**已完成 ICP 备案**，国内站这是硬性要求。
4. 之后更新：重新 `node scripts/build.mjs` 再上传覆盖即可。

若用 Git 仓库自动部署：构建命令填 `node scripts/build.mjs`，输出目录填 `dist`，Node 版本 20+。

## 目录

```
hub/                 主页源码（原样输出到 dist 根）
shared/chrome.js     统一导航条，Shadow DOM 注入，不干扰工具自身样式
assets/logo.svg      站点 LOGO
tools/               自研工具源码
vendor/              第三方工具源码（不入库，由 fetch-vendor 拉取）
scripts/build.mjs    汇总构建
scripts/fetch-vendor.mjs  拉取第三方源码
tools.config.json    工具清单（唯一数据源）
```

## 合规与授权

- **本项目自身代码**：MIT。
- **第三方工具**均为 MIT，保留原版权声明，详见 [THIRD-PARTY.md](THIRD-PARTY.md)。
- **不做的事**：不内置去水印解析（仅外链跳转到原作者站点）、不代理任何视频、不收集用户图片。所有工具都在浏览器本地处理文件。
- **上线前必须替换**：`tools.config.json` 里的 `blog` / `repo` / `social` / 备案号占位，别沿用别人的备案号。
- **ThisCover** 需要 Unsplash API Key（`NEXT_PUBLIC_API_ACCESS_KEY`），Key 会出现在前端产物里，请自行在 Unsplash 后台限制来源域名。

## 已知限制

- 公众号「同步到草稿箱」类功能需要公众号 OAuth 授权 + 后端，与「免登录」冲突，因此排版助手只做本地排版与导出。
- 第三方工具升级后可能改变构建方式，重新构建时请对照其 README。

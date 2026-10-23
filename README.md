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

## 站内工具

| 路径 | 名称 | 来源 | 说明 |
| --- | --- | --- | --- |
| `/pai-ban/` | 超赞排版 | 自研 | 公众号图文排版：10 套模板、圆角/阴影/行距/内边距、上文案下文案、图文混排、背景、预留空行、防盗图、导出高清长图、复制富文本、封面裁切 |
| `/img-compress/` | 图片压缩 | 自研 | 批量压缩与格式转换：JPG / PNG / WebP、画质、等比缩放、ZIP 打包下载 |
| `/mini-cover/` | Mini-Cover | MIT · JLinMr | 封面生成器，图标库 + 字体 + 水印 |
| `/thiscover/` | ThisCover | MIT · weizwz | 18+ 主题、3000+ 图标、29+ 商用字体 |
| 外链 | 短视频解析 | MIT · BugPk | 仅跳转原作者站点，本站不代理、不存储 |

### 超赞排版的技术取舍

- **Canvas 单一渲染管线**：预览与导出共用 `PB.computeLayout()` + `PB.paint()`，所见即所得，不会出现「预览好看、导出错位」。
- **固定 1080px 设计稿**：导出 1x/2x/3x，超过浏览器画布上限（16384px）时自动降级倍率。
- **不登录、不上传**：所有解码、缩放、重编码都在浏览器里完成；因为没有后端，所以**不做**「同步到公众号草稿箱」（那需要公众号 OAuth 授权 + 服务端中转），改为「导出长图」与「复制富文本」两条本地路径。
- **防盗图**只在「复制富文本」时生效——把 `<img>` 换成 `background-image` 的 `div`，读者长按拿不到原图。

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
tools/pai-ban/       自研 · 公众号图文排版助手
tools/img-compress/  自研 · 批量图片压缩
vendor/              第三方工具源码（不入库，由 fetch-vendor 拉取）
scripts/build.mjs    汇总构建
scripts/fetch-vendor.mjs  拉取第三方源码
tools.config.json    工具清单（唯一数据源）
```

## 合规与授权

- **本项目自身代码**：MIT。
- **第三方工具**均为 MIT，保留原版权声明，详见 [THIRD-PARTY.md](THIRD-PARTY.md)。
- **不做的事**：不内置去水印解析（仅外链跳转到原作者站点）、不代理任何视频、不收集用户图片。所有工具都在浏览器本地处理文件。
- **主页底部内置《版权与免责声明》**，文案在 `tools.config.json` 的 `site.legal.items` 里，按需改写即可。
- **上线前必须替换**：`tools.config.json` 里的 `blog` / `repo` / `social` / 备案号占位，别沿用别人的备案号。
- **ThisCover** 需要 Unsplash API Key（`NEXT_PUBLIC_API_ACCESS_KEY`），Key 会出现在前端产物里，请自行在 Unsplash 后台限制来源域名。

## 已知限制

- 公众号「同步到草稿箱」类功能需要公众号 OAuth 授权 + 后端，与「免登录」冲突，因此排版助手只做本地排版与导出。
- 「复制富文本」走的是 base64 内嵌图片，粘贴进公众号编辑器后若图片丢失，请改用「导出长图」再插入（公众号对 base64 图片的处理策略会变）。
- 浏览器 Canvas 不支持保留 GIF 动画，GIF 进排版会被当作静态图；压缩工具也不处理 GIF 动效。
- 第三方工具升级后可能改变构建方式，重新构建时请对照其 README。

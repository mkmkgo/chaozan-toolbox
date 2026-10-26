# 第三方组件与授权

本项目通过 `vendor/` 与 `tools/` 引入以下开源项目，许可包括 MIT、Apache-2.0 与 AGPL-3.0（逐项标注）。分发构建产物（`dist/`）时须保留各项目原始的版权声明与许可文本 —— 构建脚本会自动把 `THIRD-PARTY-LICENSES/` 与 `NOTICE` 复制到 `dist/licenses/`。

> 一句话原则：**MIT 允许你改代码、改名字、商用甚至闭源，但要求你保留版权声明与许可全文，并且不能声称那部分代码是你原创的。** 所以「作为自己的项目开源」的正确姿势是：以自己的名义发布整合成果，同时如实标注上游。

## 1. Mini-Cover — 封面生成器

- 仓库：https://github.com/JLinMr/Mini-Cover
- 许可：MIT（全文见 `THIRD-PARTY-LICENSES/Mini-Cover-LICENSE.txt`）
- 版权：Copyright (c) 2025 摸鱼玩家（JLinMr）
- 技术栈：Vue 3 + Vite + Tailwind CSS
- 本站改动：
  - 构建时使用相对路径 `--base=./`，使其可在 `/mini-cover/` 子目录运行
  - 默认文本与水印文案 `梦爱吃鱼` → `超赞资源`
  - 页脚版权信息改为本项目，移除指向原作者个人站点 `bsgun.cn` 的链接
  - 修复「刷新页面」链接在子目录部署下跳到站点根目录的问题（`href="/"` → `href="./"`）
  - `.env` 中清空原作者 ICP 备案号（避免冒用备案信息）
  - `.env` 中清空 `VITE_APP_UPLOAD_API_URL`，关闭向作者图床 `dev.bsgun.cn` 上传图片，所有图片仅在本机处理
  - `.env` 中清空 `VITE_APP_FONT_CSS_URL`（原指向作者自建字体 CDN `oss-cdn.bsgun.cn`），默认字体改用系统字体，不占用他人带宽
  - 构建产物注入统一导航条 `/shared/chrome.js`
- 未改动其业务逻辑与封面渲染。

## 2. ThisCover — 封面生成器

- 仓库：https://github.com/weizwz/cover
- 许可：MIT（全文见 `THIRD-PARTY-LICENSES/ThisCover-LICENSE.txt`）
- 版权：Copyright (c) 2025 weizwz
- 技术栈：Next.js 16 + React 19 + shadcn/ui + Tailwind CSS 4 + SnapDOM
- 本站改动：
  - `next.config.ts` 增加 `output: 'export'`、`basePath: '/thiscover'`、`trailingSlash: true`，改为纯静态导出
  - 顶栏增加「返回超赞工具箱」入口，品牌字样 `ThisCover` → `chaozan`，外链指向本项目仓库
  - 首页与示例数据中的预览图改为**本项目用该工具自行渲染**的本地图片（`public/previews/`），原因：原图床 `p.weizwz.com` 开启防盗链，站外引用返回 403，图片全部无法显示
  - 示例数据中的作者文案（`weizwz` / `唯知笔记` / `唯知为之` / `note.weizwz.com`）改为 `chaozan` / `超赞资源`
  - `layout.tsx` 的关键词与描述去除了原作者个人品牌，`lang` 改为 `zh-CN`
  - **移除**原项目内置的 Cloudflare 访问统计脚本（本站承诺无第三方统计）
  - 新增 `.env.local` 提供 Unsplash / Iconify 的公开配置项
  - 构建产物注入统一导航条
- 项目灵感来源：rutikwankhade/CoverView

## 3. shortvideo-html — 短视频解析（仅外链）

- 仓库：https://github.com/jiuhunwl/shortvideo-html
- 许可：MIT
- 版权：Copyright (c) 2024 BugPk & JH-Ahua
- **本站不包含其代码**，仅在主页提供一张跳转卡片，点击后在新窗口打开作者演示站 https://sv.bugpk.com 。
- 原因：该工具的解析依赖作者自建的第三方 API，且「去水印」涉及平台规则与版权风险，不适合由本站代理或托管。相关法律责任与可用性由原站承担。

## 4. 超赞排版 — 代码自研，界面与模板参照麻雀排版

- **代码层面完全自研**：`/pai-ban/` 全部为原生 JS 手写（`render.js` / `select.js` / `export.js` / `app.js`），**未使用、未反编译、未复制任何第三方产品的源代码**。原站是 uni-app + Vue 2 + TinyMCE + Cropper.js + jQuery 的重型 SPA，本站零框架、零第三方依赖，整包 178 KB。
- **参照部分**（须如实标注）：
  - 界面结构与参数体系：参照 [麻雀排版](https://maque.toai.art/) 公开页面复刻（三栏布局、12 组参数卡片、积木块选中交互），目的是让用过原站的用户零学习成本迁移。
  - 排版模板数据：通过其公开接口 `POST /v1/api/muban_action` 获取的**免费模板**（`vip_type = 0`），共 33 套，整理为 `tools/pai-ban/js/templates.js`。**未收录任何 PRO 付费模板**。
  - 参数默认值：读取其公开页面运行时的数据对象得到（圆角 0、阴影 `0/3/6/#bab7b7`、行间隔 0–200、文案 14px/17px/居中）。
- **已做的替换与规避**：
  - 品牌字样 `麻雀排版` → `超赞排版`，LOGO 与配色变量重新取值
  - 模板中的占位图 `toai.art/b1.png` 与 `static/emoji/default_tx.png` → 本地 `assets/ph.svg`，**不请求原站图床**
  - 模板属性名 `maque` / `maque_box_index` / `maque_box_parent` 统一改为 `data-maque*` 前缀
  - 原站的自绘插画（小熊、仙人掌、存钱罐）改为本项目手写 SVG
- **「智能广告」按原站算法自行实现**：在原站源码中确认其做法是在每行图片前后插入 `display:none` 的隐藏文字段落（`<p class="mqad" style="display:none!important;color:#fff!important;">`），并非调用任何公众号接口。本站用原生 JS 重写了同样的逻辑（循环截取用户文本、每侧首段 100–150 字、其余 10–20 字、跳过第 1 行、最多 20 行），未复制其代码。该功能可能违反微信流量主规则，卡片内完整保留原站的风险提示，是否使用由使用者自行判断。
- **两项依赖账号体系的功能无法在纯前端实现**，保留入口并明确提示，不做假成功：
  - 「同步导出到草稿箱」——需要公众号 OAuth 授权与服务端中转，与「免登录、纯本地」冲突。
  - 「绑定公众号（0/0）」——同上，需要公众号后台授权。
- **「文章排版提取」本站自行实现**：用户在弹层里粘贴自己有权使用的内容，本地解析 DOM，不抓取、不代理任何文章。
- 用户使用本工具制作的图片与文字，版权与合规责任由使用者自行承担。
- **若麻雀排版权利人认为不妥**：模板数据集中在 `tools/pai-ban/js/templates.js` 一个文件里，删除该文件并把 `TPL` 兜底为空即可下线全部模板，其余功能不受影响。

## 5. 超赞水印 — 代码自研，功能参照 image-watermark

- 参照：https://github.com/xyh9949/image-watermark（MIT）
- **代码层面完全自研**：`tools/watermark/` 为原生 JS 手写（`js/app.js` 约 700 行），使用 Canvas 2D 自行实现文字水印、图片水印、全屏平铺、九宫格定位、透明度 / 旋转 / 描边 / 阴影，以及批量导出与手写 ZIP（store 模式）打包。**未复制上游源码**。
- 原因：上游为 Next.js 16 + Ant Design 6 的**服务端渲染应用**（`output: "standalone"`），含 rewrites / headers / EXIF WASM 等依赖，无法静态导出到子目录；且其 UI 与本项目设计语言差异较大。
- 参照范围：功能清单与交互概念（批量、平铺、九宫格、透明度与旋转）。界面、代码、交互细节均为本站自行设计与实现。

## 6. 超赞证件照 — Passport Photo Studio

- 仓库：https://github.com/dashancn/passport-photo-studio
- 许可：**AGPL-3.0-only**（全文见 `THIRD-PARTY-LICENSES/PassportPhoto-AGPL-3.0.txt`）
- 技术栈：Vite + 原生 JS + `@imgly/background-removal`（本地抠图，模型随站点同源分发）
- 本站改动：
  - 以 `vite build --base=./` 构建，使其可在 `/passport-photo/` 子目录运行
  - 品牌 `证件照工作室` / `i41` → `超赞证件照` / `超赞工具箱`；标题、描述、canonical、og、JSON-LD 全部改写
  - **移除**顶部品牌生态导航（9 个指向 i41 系列站点的外链与 tooltip 文案）与「关注 i方案」推广横幅
  - **移除**页脚与许可证说明中指向原作者仓库的链接，改为指向本站 `/licenses/`
  - 顶栏新增「返回超赞工具箱」箭头
  - 缓存键 `i41-passport-heic-decoder-success-v1` → `chaozan-...`（仅本地 localStorage 键名）
  - robots / sitemap / 404 页域名改为本站
- **AGPL 说明**：本站以公开仓库分发修改后的完整源码，履行 AGPL 的对应源义务；该工具的许可不因整合而改变。若你二次分发本站，同样需要遵守 AGPL-3.0。

## 7. 超赞 PDF — PDFCraft

- 仓库：https://github.com/PDFCraftTool/pdfcraft
- 许可：**AGPL-3.0**
- 技术栈：Next.js 15（`output: 'export'` 静态导出）+ Tailwind CSS 4 + PDF.js / pdf-lib / PyMuPDF(WASM)
- 本站改动：品牌替换、移除原作者外链与推广位、注入统一导航、`BASE_PATH` 子目录适配。
- **AGPL 说明**：同上，源码随公开仓库分发。

## 8. 超赞图片工坊 — Squoosh（dashancn fork）

- 上游：https://github.com/GoogleChromeLabs/squoosh（Apache-2.0）
- 采用分支：https://github.com/dashancn/squoosh（commit `6f0d0d5`）
- 技术栈：Preact + Rollup + 各编码器 WASM（MozJPEG / WebP / AVIF / JPEG XL / OxiPNG / imagequant / QOI）
- 本站改动：
  - 仅构建压缩器主应用（`npm run build:compressor`），不构建抠图 / 拼贴 / HEIC 子应用
  - 品牌 `i41 图片压缩` → `超赞图片工坊`；标题、描述、og、manifest、sitemap、robots、404 全部改写
  - **移除** `stats.i41.cn` 匿名统计脚本与对应 CSP 白名单条目
  - **移除**顶部品牌生态导航（i方案 / 开发者工具 / PDF / 水印 / 剪贴板 / 证件照）与推广横幅、页脚 GitHub 源码外链
  - 主题色由粉色 `#ff3385` 改为品牌蓝 `#1f5fbf`
  - 补上缺失的 `<meta charset="utf-8">`（原构建未输出，浏览器按 GBK 解析会中文乱码）
  - **不注册 Service Worker**（子目录托管下作用域与缓存会互相干扰），保留产物文件避免构建报错
  - 构建产物使用绝对路径 `/c/...`，由 `scripts/build.mjs` 的 `rewritePrefixes` 重写为 `/squoosh/c/...`
  - 缓存键 `i41-compressor-heic-success-v1` → `chaozan-...`



- Mini-Cover 原本默认引用 `oss-cdn.bsgun.cn` 的 LXGW Bright Medium（霞鹜文楷，SIL Open Font License）。**本项目已清空该地址**，默认改用系统字体；想用霞鹜文楷可自行下载 woff2 放到 `public/fonts/` 后填写本地路径，字体本身是 OFL，允许自托管与再分发。
- Mini-Cover 字体下拉里的其他几款（悠哉字体、寒蝉全圆体、抖音美好体、猫啃珠圆体）来自第三方字体 CDN `cn-font.claude-code-best.win`，与原作者无关；这些字体各自的许可不同，商用前请逐一核对。
- ThisCover 通过 Iconify API（`api.iconify.design`）拉取 simple-icons 等图标集，各图标集适用其原始许可（多为 CC0 / Apache-2.0 / MIT），商用前请核对具体图标集。
- ThisCover 的在线图库使用 Unsplash API，需自行申请免费 Key 并遵守 Unsplash API 使用条款（必须标注来源、不得用于同类竞品）。
- 示例封面图（`vendor/cover-main/public/previews/`）为**本项目用工具自身渲染**后截图保存，不含任何第三方素材（其中背景图来自 Unsplash，按 Unsplash 条款可免费使用）。
- 本站 LOGO（`assets/logo.svg`）为原创，随本项目以 MIT 分发。

## 上线前检查清单

- [ ] 替换 `tools.config.json` 中的博客 / GitHub / 社交链接
- [ ] 把公众号与小程序二维码放到 `assets/qr-gzh.png`、`assets/qr-miniapp.png`（缺失时面板会显示「待补充」占位）
- [ ] 填入自己域名对应的 ICP 备案号
- [ ] 如需 Unsplash 图库，申请 Key 并限制来源域名
- [ ] 保留本文件、`NOTICE`、`THIRD-PARTY-LICENSES/` 与各工具的 LICENSE
- [ ] 若二次分发含 AGPL 工具（证件照 / PDF），须同时提供修改后的完整源码

## 如果上游作者提出异议

MIT 是法律许可，不是道德豁免。上游作者通常在意两件事：**有没有保留署名**、**有没有拿他的作品当自己的原创**。本项目已按这两点处理。若仍有异议，标准处理顺序是：

1. 先在 Issue / 邮件里沟通，说明改动范围与署名位置（`NOTICE` 与 `THIRD-PARTY.md`）。
2. 若对方要求撤下，直接移除对应工具目录与主页卡片，构建脚本无需改动。
3. 若对方要求改名，改 `tools.config.json` 里的 `name` 与页面标题即可，功能不受影响。

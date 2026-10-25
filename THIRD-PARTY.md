# 第三方组件与授权

本项目通过 `vendor/` 引入以下开源项目，均为 MIT 许可。分发构建产物（`dist/`）时须保留各项目原始的版权声明与许可文本 —— 构建脚本会自动把 `THIRD-PARTY-LICENSES/` 与 `NOTICE` 复制到 `dist/licenses/`。

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

## 4. 超赞排版 — 原创重写说明

- `/pai-ban/` 为本站原创实现，**未使用、未反编译、未复制任何第三方产品的代码与素材**。
- 功能形态参考了同类公众号排版工具的通用交互（多图拼版、圆角阴影、行距边距、导出长图），这些属于通用功能设计，不构成代码复制。
- 界面配色、图标、文案、模板排布方式均为本站自绘自写。
- **刻意未实现的三项**，同时也是为规避风险：
  - 「同步到公众号草稿箱」——需要公众号 OAuth 授权与服务端中转，与「免登录」冲突，且会把用户素材上传到服务器。
  - 「智能广告自动插入」——该类功能可能违反微信流量主规则，可能给使用者账号带来处罚。
  - 「文章排版提取」——会抓取他人已发布文章的内容与图片，存在著作权风险。
- 用户使用本工具制作的图片与文字，版权与合规责任由使用者自行承担。

## 字体、图标与其他素材

- Mini-Cover 原本默认引用 `oss-cdn.bsgun.cn` 的 LXGW Bright Medium（霞鹜文楷，SIL Open Font License）。**本项目已清空该地址**，默认改用系统字体；想用霞鹜文楷可自行下载 woff2 放到 `public/fonts/` 后填写本地路径，字体本身是 OFL，允许自托管与再分发。
- Mini-Cover 字体下拉里的其他几款（悠哉字体、寒蝉全圆体、抖音美好体、猫啃珠圆体）来自第三方字体 CDN `cn-font.claude-code-best.win`，与原作者无关；这些字体各自的许可不同，商用前请逐一核对。
- ThisCover 通过 Iconify API（`api.iconify.design`）拉取 simple-icons 等图标集，各图标集适用其原始许可（多为 CC0 / Apache-2.0 / MIT），商用前请核对具体图标集。
- ThisCover 的在线图库使用 Unsplash API，需自行申请免费 Key 并遵守 Unsplash API 使用条款（必须标注来源、不得用于同类竞品）。
- 示例封面图（`vendor/cover-main/public/previews/`）为**本项目用工具自身渲染**后截图保存，不含任何第三方素材（其中背景图来自 Unsplash，按 Unsplash 条款可免费使用）。
- 本站 LOGO（`assets/logo.svg`）为原创，随本项目以 MIT 分发。

## 上线前检查清单

- [ ] 替换 `tools.config.json` 中的博客 / GitHub / 社交链接
- [ ] 填入自己域名对应的 ICP 备案号
- [ ] 如需 Unsplash 图库，申请 Key 并限制来源域名
- [ ] 保留本文件、`NOTICE`、`THIRD-PARTY-LICENSES/` 与各工具的 LICENSE

## 如果上游作者提出异议

MIT 是法律许可，不是道德豁免。上游作者通常在意两件事：**有没有保留署名**、**有没有拿他的作品当自己的原创**。本项目已按这两点处理。若仍有异议，标准处理顺序是：

1. 先在 Issue / 邮件里沟通，说明改动范围与署名位置（`NOTICE` 与 `THIRD-PARTY.md`）。
2. 若对方要求撤下，直接移除对应工具目录与主页卡片，构建脚本无需改动。
3. 若对方要求改名，改 `tools.config.json` 里的 `name` 与页面标题即可，功能不受影响。

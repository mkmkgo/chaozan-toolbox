# 第三方组件与授权

本站点通过 `vendor/` 引入以下开源项目，均为 MIT 许可。分发构建产物（`dist/`）时请保留各项目原始的版权声明与许可文本。

## 1. Mini-Cover — 封面生成器

- 仓库：https://github.com/JLinMr/Mini-Cover
- 许可：MIT
- 版权：Copyright (c) 2025 摸鱼玩家（JLinMr）
- 技术栈：Vue 3 + Vite + Tailwind CSS
- 本站改动：
  - 构建时使用相对路径 `--base=./`，使其可在 `/mini-cover/` 子目录运行
  - `.env` 中清空原作者 ICP 备案号（避免冒用备案信息）
  - `.env` 中清空 `VITE_APP_UPLOAD_API_URL`，关闭向作者图床 `dev.bsgun.cn` 上传图片，所有图片仅在本机处理
  - 构建产物注入统一导航条 `/shared/chrome.js`
- 未改动其业务逻辑与界面。

## 2. ThisCover — 封面生成器

- 仓库：https://github.com/weizwz/cover
- 许可：MIT
- 版权：Copyright (c) 2025 weizwz
- 技术栈：Next.js 16 + React 19 + shadcn/ui + Tailwind CSS 4 + SnapDOM
- 本站改动：
  - `next.config.ts` 增加 `output: 'export'`、`basePath: '/thiscover'`、`trailingSlash: true`，改为纯静态导出
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

- Mini-Cover 默认引用 `oss-cdn.bsgun.cn` 的 LXGW Bright Medium 网络字体（霞鹜文楷，SIL Open Font License）。如不希望依赖外部 CDN，可将 `.env` 中的 `VITE_APP_FONT_CSS_URL` 留空。
- ThisCover 通过 Iconify API（`api.iconify.design`）拉取 simple-icons 等图标集，各图标集适用其原始许可（多为 CC0 / Apache-2.0 / MIT），商用前请核对具体图标集。
- ThisCover 的在线图库使用 Unsplash API，需自行申请免费 Key 并遵守 Unsplash API 使用条款（必须标注来源、不得用于同类竞品）。
- 本站 LOGO（`assets/logo.svg`）为原创，随本项目以 MIT 分发。

## 上线前检查清单

- [ ] 替换 `tools.config.json` 中的博客 / GitHub / 社交链接
- [ ] 填入自己域名对应的 ICP 备案号
- [ ] 如需 Unsplash 图库，申请 Key 并限制来源域名
- [ ] 保留本文件与各工具的 LICENSE

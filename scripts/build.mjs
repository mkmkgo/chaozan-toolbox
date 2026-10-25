#!/usr/bin/env node
/**
 * 超赞工具箱 · 构建脚本
 *
 * 把所有工具汇总成一个可直接上传到 EdgeOne Pages 的静态目录 dist/。
 * 新增一个工具只需要两步：
 *   1) 在 tools.config.json 的 tools 里加一条记录（带 buildDir 指向它的构建产物目录）
 *   2) 运行 node scripts/build.mjs
 *
 * 约定：
 *   hub/           主页源码（原样输出到 dist 根目录）
 *   shared/        统一导航条等公共资源（输出到 dist/shared）
 *   assets/        公共图片（输出到 dist/assets）
 *   工具产物目录   由 tools.config.json 的 buildDir 指定，输出到 dist/<slug>/
 */
import { readFileSync, existsSync, rmSync, mkdirSync, writeFileSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const CHROME_TAG = '<script src="/shared/chrome.js" defer></script>';

const cfg = JSON.parse(readFileSync(join(ROOT, 'tools.config.json'), 'utf8'));

function log(msg) { console.log(msg); }

/** 递归复制目录（逐文件复制，兼容性好于 cpSync） */
function copyDir(from, to) {
  if (!existsSync(from)) return false;
  mkdirSync(to, { recursive: true });
  for (const name of readdirSync(from)) {
    const src = join(from, name);
    const dst = join(to, name);
    const st = statSync(src);
    if (st.isDirectory()) copyDir(src, dst);
    else copyFileSync(src, dst);
  }
  return true;
}

function dirSize(p) {
  let total = 0;
  for (const name of readdirSync(p)) {
    const f = join(p, name);
    const s = statSync(f);
    total += s.isDirectory() ? dirSize(f) : s.size;
  }
  return total;
}

/** 给工具的所有页面注入统一导航条（含 /editor/ 这类子页面） */
function injectChrome(toolDir, offset) {
  let count = 0;
  const pre = offset ? `<script>window.CZ_CHROME_OFFSET=${Number(offset)}</script>` : '';

  function walk(dir) {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) { walk(p); continue; }
      if (!name.endsWith('.html')) continue;
      let html = readFileSync(p, 'utf8');
      if (html.includes('/shared/chrome.js')) continue;
      const block = (pre ? '  ' + pre + '\n' : '') + '  ' + CHROME_TAG;
      html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, block + '\n</body>') : html + '\n' + block + '\n';
      writeFileSync(p, html, 'utf8');
      count++;
    }
  }
  walk(toolDir);
  return count;
}

/**
 * 把工具里写死的根路径（如 src="/logo.png"）改写到它自己的子目录前缀。
 * 第三方项目常把静态资源写成绝对根路径，放到子目录后就会 404。
 * 除了 HTML，还要处理 JS chunk 与 Next.js 的 RSC payload（.txt），
 * 因为它们同样会以字符串形式引用 "/logo.png"。
 */
function rewriteRootPaths(toolDir, basePath) {
  if (!basePath) return 0;
  const rootFiles = readdirSync(toolDir).filter((f) => {
    try { return statSync(join(toolDir, f)).isFile(); } catch (e) { return false; }
  });
  if (!rootFiles.length) return 0;

  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let changed = 0;

  function walk(dir) {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) { walk(p); continue; }

      const isHtml = name.endsWith('.html');
      const isJs = name.endsWith('.js') || name.endsWith('.mjs');
      const isTxt = name.endsWith('.txt');
      if (!isHtml && !isJs && !isTxt) continue;

      let text = readFileSync(p, 'utf8');
      let hit = false;

      for (const f of rootFiles) {
        if (f === 'index.html') continue;
        const ef = esc(f);

        if (isHtml) {
          const re = new RegExp('(src|href)="\\/' + ef + '"', 'g');
          if (re.test(text)) { text = text.replace(re, `$1="${basePath}/${f}"`); hit = true; }
        }

        // JS / RSC：只替换完整的带引号字符串，避免误伤子串
        const reD = new RegExp('"/' + ef + '"', 'g');
        const reS = new RegExp("'/" + ef + "'", 'g');
        if (reD.test(text)) { text = text.replace(reD, `"${basePath}/${f}"`); hit = true; }
        if (reS.test(text)) { text = text.replace(reS, `'${basePath}/${f}'`); hit = true; }
      }

      if (hit) { writeFileSync(p, text, 'utf8'); changed++; }
    }
  }
  walk(toolDir);
  return changed;
}

/* ---------- 清理 ---------- */
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

/* ---------- 主页 ---------- */
copyDir(join(ROOT, 'hub'), DIST);
copyDir(join(ROOT, 'assets'), join(DIST, 'assets'));
copyDir(join(ROOT, 'shared'), join(DIST, 'shared'));
copyFileSync(join(ROOT, 'tools.config.json'), join(DIST, 'tools.config.json'));

// 第三方许可证随产物一起分发（MIT 要求：副本中须包含版权声明与许可声明）
copyDir(join(ROOT, 'THIRD-PARTY-LICENSES'), join(DIST, 'licenses'));
copyFileSync(join(ROOT, 'NOTICE'), join(DIST, 'licenses', 'NOTICE.txt'));
log('✓ 主页与公共资源已输出');

/**
 * Next.js 静态导出 + trailingSlash 时，客户端会去预取
 * <dir>/__next.<seg>.__PAGE__.txt，但导出只生成了 __next.<seg>.txt，
 * 控制台会因此报 404。这里补一份同内容文件，消掉噪音。
 */
function patchNextPrefetch(toolDir) {
  let fixed = 0;
  function walk(dir) {
    const files = readdirSync(dir);
    for (const name of files) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) { walk(p); continue; }
      const m = /^__next\.(.+)\.txt$/.exec(name);
      if (!m || m[1].includes('.__PAGE__')) continue;
      const target = join(dir, '__next.' + m[1] + '.__PAGE__.txt');
      if (!existsSync(target)) {
        copyFileSync(p, target);
        fixed++;
      }
    }
  }
  walk(toolDir);
  return fixed;
}

/* ---------- 各工具 ---------- */const rows = [];
for (const tool of cfg.tools || []) {
  const { slug, name, status } = tool;
  const buildDir = tool.buildDir ? join(ROOT, tool.buildDir) : null;

  if (status !== 'ready') { rows.push([slug, name, status, '—', '跳过（未启用）']); continue; }
  if (!buildDir || !existsSync(buildDir)) { rows.push([slug, name, status, '—', '缺少构建产物 ' + (tool.buildDir || 'buildDir')]); continue; }

  const target = join(DIST, slug);
  mkdirSync(target, { recursive: true });
  copyDir(buildDir, target);
  const fixed = rewriteRootPaths(target, tool.basePath || '/' + slug);
  const patched = patchNextPrefetch(target);
  // chrome:false 表示该工具自己顶栏里已经有「返回首页」，不用再注入浮动导航
  const pages = tool.chrome === false ? 0 : injectChrome(target, tool.chromeOffset);
  rows.push([slug, name, status, (dirSize(target) / 1024).toFixed(0) + ' KB',
    (tool.chrome === false ? '使用自带返回按钮' : '注入导航 ' + pages + ' 页') +
    (fixed ? '，修正 ' + fixed + ' 个根路径' : '') +
    (patched ? '，补 ' + patched + ' 个 RSC 预取文件' : '')]);
}
log('✓ 工具汇总完成\n');

/* ---------- 汇总 ---------- */
const pad = (s, n) => String(s).padEnd(n, ' ');
log(pad('slug', 16) + pad('名称', 20) + pad('状态', 10) + pad('体积', 10) + '结果');
log('-'.repeat(76));
for (const r of rows) log(pad(r[0], 16) + pad(r[1], 20) + pad(r[2], 10) + pad(r[3], 10) + r[4]);

log('\n输出目录：' + DIST);
log('部署方式：把 dist/ 整个上传到 EdgeOne Pages（静态站点，无需构建命令）');

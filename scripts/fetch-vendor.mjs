#!/usr/bin/env node
/**
 * 拉取并解压第三方工具源码到 vendor/
 *
 * 这些项目不进 Git（见 .gitignore），首次 clone 后跑一次即可。
 * 使用 codeload.github.com 下载 zip，再用系统自带 tar 解压（Win10+ / macOS / Linux 均可用）。
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VENDOR = join(ROOT, 'vendor');

const SOURCES = [
  { repo: 'JLinMr/Mini-Cover', folder: 'Mini-Cover-main', zip: 'mini-cover.zip' },
  { repo: 'weizwz/cover', folder: 'cover-main', zip: 'thiscover.zip' }
];

mkdirSync(VENDOR, { recursive: true });

for (const s of SOURCES) {
  const target = join(VENDOR, s.folder);
  if (existsSync(target)) {
    console.log(`✓ ${s.repo} 已存在，跳过`);
    continue;
  }
  const zip = join(VENDOR, s.zip);
  const url = `https://codeload.github.com/${s.repo}/zip/refs/heads/main`;
  console.log(`↓ 下载 ${s.repo}`);
  execFileSync('curl', ['-sL', '--max-time', '180', '-o', zip, url], { stdio: 'inherit' });
  console.log(`  解压到 vendor/${s.folder}`);
  execFileSync('tar', ['-xf', zip, '-C', VENDOR], { stdio: 'inherit' });
  const extracted = join(VENDOR, s.folder);
  if (!existsSync(extracted)) {
    const guess = join(VENDOR, s.repo.split('/')[1] + '-main');
    if (existsSync(guess)) renameSync(guess, extracted);
  }
  rmSync(zip, { force: true });
  console.log(`✓ ${s.repo} 完成`);
}

console.log('\n下一步：分别进入 vendor/<项目> 执行 npm install 与构建，再运行 node scripts/build.mjs');

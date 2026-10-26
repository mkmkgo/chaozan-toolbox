/* 超赞工具箱 · 统一导航
   注入到第三方工具页：左上角「返回首页」直链（一次点击即回主页），
   右侧「⋯」展开博客 / 社交 / 公众号与小程序二维码 / 更多工具。
   以 Shadow DOM 注入，避免与各工具自身样式冲突。
   用法：在工具页 </body> 前加入 <script src="/shared/chrome.js" defer></script>
   配置可选：window.CZ_CHROME = { site: {...} }，否则自动读取 /tools.config.json
   可选变量：window.CZ_CHROME_OFFSET（距顶像素，避让工具自己的顶栏） */
(function () {
  'use strict';
  if (window.__czChromeReady) return;
  window.__czChromeReady = true;

  var DEFAULTS = {
    name: '超赞工具箱',
    home: '/',
    blog: '',
    social: [],
    qr: []
  };

  var host = document.createElement('div');
  host.setAttribute('data-cz-chrome', '');
  var root = host.attachShadow({ mode: 'open' });

  var css = [
    ':host{all:initial}',
    '*{box-sizing:border-box;font-family:"PingFang SC","Microsoft YaHei",system-ui,-apple-system,sans-serif}',
    '.wrap{position:fixed;left:12px;top:12px;z-index:2147483000;display:flex;align-items:flex-start;gap:8px}',
    /* 右下角浮标模式（自研工具自带返回按钮时使用） */
    '.wrap.br{left:auto;right:14px;top:auto;bottom:16px;align-items:flex-end}',
    '.back,.more{display:flex;align-items:center;height:34px;border-radius:999px;background:#fff;',
    'border:1px solid rgba(20,23,42,.10);box-shadow:0 4px 14px rgba(20,23,42,.12);color:#14172A;',
    'text-decoration:none;font-size:13px;font-weight:600;letter-spacing:.2px;cursor:pointer;',
    'transition:transform .15s ease,box-shadow .15s ease,background .15s ease}',
    '.back{padding:0 14px 0 10px;gap:6px}',
    '.more{width:34px;justify-content:center;padding:0;font-size:15px;line-height:1;letter-spacing:0}',
    '.wrap.br .more{width:auto;padding:0 15px 0 12px;gap:7px;font-size:13px}',
    '.more .mic{display:flex;align-items:center;justify-content:center}',
    '.more .mic svg{width:15px;height:15px;color:#5B4BF5}',
    '.back:hover,.more:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(20,23,42,.16);background:#FBFAFF}',
    '.back:active,.more:active{transform:translateY(0)}',
    '.back svg{width:15px;height:15px;display:block;color:#5B4BF5}',
    '.panel{position:absolute;left:0;top:42px;width:272px;padding:6px;border-radius:14px;',
    'background:#fff;border:1px solid rgba(20,23,42,.10);box-shadow:0 18px 40px rgba(20,23,42,.20);',
    'opacity:0;transform:translateY(-6px) scale(.98);pointer-events:none;transition:all .16s ease}',
    '.wrap.br .panel{left:auto;right:0;top:auto;bottom:44px;transform:translateY(6px) scale(.98)}',
    '.panel.on{opacity:1;transform:none;pointer-events:auto}',
    '.wrap.br .panel.on{transform:none}',
    '.item{display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:9px;',
    'color:#14172A;text-decoration:none;font-size:13px;line-height:1.2}',
    '.item:hover{background:#F2F1FE;color:#5B4BF5}',
    '.item .ic{width:16px;height:16px;display:flex;align-items:center;justify-content:center;color:#5B4BF5;flex:0 0 auto}',
    '.item svg{width:16px;height:16px}',
    '.sep{height:1px;background:rgba(20,23,42,.08);margin:5px 8px}',
    '.tip{padding:7px 10px 4px;font-size:11px;color:#8A90A6}',
    '.lbl{padding:8px 10px 2px;font-size:11px;color:#8A90A6;letter-spacing:.4px}',
    '.qrs{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:4px 8px 8px}',
    '.qr{border:1px solid rgba(20,23,42,.09);border-radius:10px;padding:7px;text-align:center;background:#FCFCFE}',
    '.qr .box{position:relative;width:100%;aspect-ratio:1/1;border-radius:7px;overflow:hidden;background:#F2F3F9}',
    '.qr img{width:100%;height:100%;object-fit:contain;display:block;background:#fff}',
    '.qr .ph{position:absolute;inset:0;display:none;align-items:center;justify-content:center;',
    'font-size:10px;color:#9AA0B4;text-align:center;padding:4px;line-height:1.4}',
    '.qr.noimg .ph{display:flex}',
    '.qr b{display:block;margin-top:6px;font-size:11.5px;font-weight:600;color:#14172A}',
    '.qr small{display:block;font-size:10px;color:#8A90A6;margin-top:1px}',
    '@media (max-width:600px){',
    '.wrap{left:10px;top:10px}',
    '.back{width:34px;padding:0;justify-content:center}',
    '.back span{display:none}',
    '.panel{width:min(272px,calc(100vw - 20px))}',
    '}',
    '@media (prefers-color-scheme: dark){',
    '.back,.more,.panel{background:#161926;border-color:rgba(255,255,255,.10);color:#F2F3F8}',
    '.back:hover,.more:hover{background:#1D2132}',
    '.back svg{color:#A79BFF}',
    '.item{color:#F2F3F8}.item:hover{background:#232741;color:#A79BFF}',
    '.qr{background:#1B1F2E;border-color:rgba(255,255,255,.08)}',
    '.qr .box{background:#12151F}',
    '.qr b{color:#F2F3F8}',
    '.sep{background:rgba(255,255,255,.10)}.tip,.lbl,.qr small{color:#737A90}}'
  ].join('');

  var ICONS = {
    arrow: '<path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    home: '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8Z" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linejoin="round"/>',
    blog: '<path d="M5 4h9l5 5v11H5V4Z" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M14 4v5h5M8 13h8M8 17h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    github: '<path d="M9 19c-4 1.2-4-2-5.5-2.5M15 21v-3.4a3 3 0 0 0-.8-2.3c2.7-.3 5.3-1.4 5.3-6a4.7 4.7 0 0 0-1.3-3.2 4.4 4.4 0 0 0-.1-3.3s-1.3-.4-4.2 1.6a12 12 0 0 0-6.2 0C4.8 2.4 3.5 2.8 3.5 2.8a4.4 4.4 0 0 0-.1 3.3A4.7 4.7 0 0 0 2 9.3c0 4.6 2.6 5.7 5.3 6A3 3 0 0 0 6.5 18v3" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    video: '<rect x="3" y="5.5" width="13" height="13" rx="2.5" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M16 10.5l4.2-2.4a.8.8 0 0 1 1.2.7v6.4a.8.8 0 0 1-1.2.7L16 13.5" stroke="currentColor" stroke-width="1.7" fill="none"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" stroke="currentColor" stroke-width="1.7" fill="none"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.7" fill="none"/><rect x="13.5" y="3.5" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.7" fill="none"/><rect x="3.5" y="13.5" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.7" fill="none"/><rect x="13.5" y="13.5" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.7" fill="none"/>',
    heart: '<path d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7 3.1C19 15.6 12 20 12 20Z" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linejoin="round"/>'
  };

  function svg(name) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || ICONS.grid) + '</svg>';
  }

  function iconFor(name) {
    var n = String(name || '').toLowerCase();
    if (n.indexOf('github') >= 0) return 'github';
    if (n.indexOf('博') >= 0 || n.indexOf('blog') >= 0) return 'blog';
    if (n.indexOf('视频') >= 0 || n.indexOf('bili') >= 0) return 'video';
    if (n.indexOf('书') >= 0 || n.indexOf('小红') >= 0) return 'book';
    return 'grid';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function qrBlock(list) {
    if (!list || !list.length) return '';
    var cards = list.slice(0, 2).map(function (q) {
      if (!q || !q.img) return '';
      return '<div class="qr" data-qr>' +
        '<div class="box">' +
          '<img src="' + esc(q.img) + '" alt="' + esc(q.title || q.name || '') + '">' +
          '<span class="ph">' + esc(q.name || '二维码') + '<br>待补充</span>' +
        '</div>' +
        '<b>' + esc(q.title || q.name || '') + '</b>' +
        (q.sub ? '<small>' + esc(q.sub) + '</small>' : '') +
      '</div>';
    }).join('');
    if (!cards) return '';
    return '<div class="lbl">关注我</div><div class="qrs">' + cards + '</div>';
  }

  function render(cfg) {
    var site = (cfg && cfg.site) || {};
    var name = site.name || DEFAULTS.name;
    var home = site.home || '/';
    var noBack = !!window.CZ_CHROME_NO_BACK;
    var items = [];

    if (site.blog) {
      items.push('<a class="item" href="' + esc(site.blog) + '" target="_blank" rel="noopener"><span class="ic">' + svg('blog') + '</span>我的博客</a>');
    }
    (site.social || []).forEach(function (s) {
      if (!s || !s.url) return;
      items.push('<a class="item" href="' + esc(s.url) + '" target="_blank" rel="noopener"><span class="ic">' +
        svg(iconFor(s.icon || s.name)) + '</span>' + esc(s.name || '链接') + '</a>');
    });
    if (items.length) items.push('<div class="sep"></div>');
    items.push(qrBlock(site.qr));
    if (site.qr && site.qr.length) items.push('<div class="sep"></div>');
    items.push('<a class="item" href="' + esc(home) + '"><span class="ic">' + svg('grid') + '</span>更多工具</a>');
    items.push('<div class="tip">' + esc(name) + ' · 免登录 · 本地处理</div>');

    root.innerHTML =
      '<style>' + css + '</style>' +
      '<div class="wrap' + (noBack ? ' br' : '') + '">' +
        (noBack ? '' :
          '<a class="back" href="' + esc(home) + '" aria-label="返回' + esc(name) + '首页" title="返回' + esc(name) + '首页">' +
            svg('arrow') + '<span>返回首页</span>' +
          '</a>') +
        '<button class="more" type="button" aria-label="关注与更多" title="关注与更多">' +
          (noBack
            ? '<span class="mic">' + svg('heart') + '</span><span>关注超赞</span>'
            : '⋯') +
        '</button>' +
        '<div class="panel" role="menu">' + items.join('') + '</div>' +
      '</div>';

    // 二维码缺失时优雅降级
    Array.prototype.forEach.call(root.querySelectorAll('[data-qr]'), function (card) {
      var img = card.querySelector('img');
      if (!img) return;
      img.addEventListener('error', function () { card.classList.add('noimg'); img.style.visibility = 'hidden'; });
      if (img.complete && img.naturalWidth === 0) card.classList.add('noimg');
    });

    var more = root.querySelector('.more');
    var panel = root.querySelector('.panel');
    var offset = Number(window.CZ_CHROME_OFFSET || 0);
    if (offset > 0 && !noBack) {
      root.querySelector('.wrap').style.top = (12 + offset) + 'px';
    }
    function toggle(force) {
      var on = typeof force === 'boolean' ? force : !panel.classList.contains('on');
      panel.classList.toggle('on', on);
    }
    more.addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
    document.addEventListener('click', function () { toggle(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(host);
    if (window.CZ_CHROME) return render(window.CZ_CHROME);
    fetch('/tools.config.json', { cache: 'force-cache' })
      .then(function (r) { return r.json(); })
      .then(render)
      .catch(function () { render({ site: DEFAULTS }); });
  });
})();

/* 超赞工具箱 · 统一导航条
   以 Shadow DOM 注入，避免与各工具自身样式冲突。
   用法：在工具页 </body> 前加入 <script src="/shared/chrome.js" defer></script>
   配置可选：window.CZ_CHROME = { site: {...} }，否则自动读取 /tools.config.json */
(function () {
  'use strict';
  if (window.__czChromeReady) return;
  window.__czChromeReady = true;

  var DEFAULTS = {
    name: '超赞工具箱',
    home: '/',
    blog: '',
    social: []
  };

  var host = document.createElement('div');
  host.setAttribute('data-cz-chrome', '');
  var root = host.attachShadow({ mode: 'open' });

  var css = [
    ':host{all:initial}',
    '*{box-sizing:border-box;font-family:"PingFang SC","Microsoft YaHei",system-ui,-apple-system,sans-serif}',
    '.wrap{position:fixed;left:18px;bottom:18px;z-index:2147483000}',
    '.pill{display:flex;align-items:center;gap:8px;height:38px;padding:0 14px 0 9px;',
    'border-radius:999px;background:#fff;border:1px solid rgba(20,23,42,.10);',
    'box-shadow:0 6px 20px rgba(20,23,42,.14);cursor:pointer;color:#14172A;',
    'font-size:13px;font-weight:600;letter-spacing:.2px;transition:transform .16s ease,box-shadow .16s ease}',
    '.pill:hover{transform:translateY(-1px);box-shadow:0 10px 26px rgba(20,23,42,.18)}',
    '.pill img{width:22px;height:22px;display:block}',
    '.panel{position:absolute;left:0;bottom:48px;width:212px;padding:6px;border-radius:14px;',
    'background:#fff;border:1px solid rgba(20,23,42,.10);box-shadow:0 18px 40px rgba(20,23,42,.20);',
    'opacity:0;transform:translateY(6px) scale(.98);pointer-events:none;transition:all .16s ease}',
    '.panel.on{opacity:1;transform:none;pointer-events:auto}',
    '.item{display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:9px;',
    'color:#14172A;text-decoration:none;font-size:13px;line-height:1.2}',
    '.item:hover{background:#F2F1FE;color:#5B4BF5}',
    '.item .ic{width:16px;height:16px;display:flex;align-items:center;justify-content:center;color:#5B4BF5;flex:0 0 auto}',
    '.item svg{width:16px;height:16px}',
    '.sep{height:1px;background:rgba(20,23,42,.08);margin:5px 8px}',
    '.tip{padding:7px 10px 4px;font-size:11px;color:#8A90A6}',
    '@media (max-width:600px){',
    '.wrap{left:12px;bottom:12px}',
    '.pill{width:44px;height:44px;padding:0;justify-content:center}',
    '.pill span{display:none}',
    '.panel{width:min(212px,calc(100vw - 24px))}',
    '}',
    '@media (prefers-color-scheme: dark){',
    '.pill,.panel{background:#161926;border-color:rgba(255,255,255,.10);color:#F2F3F8}',
    '.item{color:#F2F3F8}.item:hover{background:#232741;color:#A79BFF}',
    '.sep{background:rgba(255,255,255,.10)}.tip{color:#737A90}}'
  ].join('');

  var ICONS = {
    home: '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8Z" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linejoin="round"/>',
    blog: '<path d="M5 4h9l5 5v11H5V4Z" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M14 4v5h5M8 13h8M8 17h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    github: '<path d="M9 19c-4 1.2-4-2-5.5-2.5M15 21v-3.4a3 3 0 0 0-.8-2.3c2.7-.3 5.3-1.4 5.3-6a4.7 4.7 0 0 0-1.3-3.2 4.4 4.4 0 0 0-.1-3.3s-1.3-.4-4.2 1.6a12 12 0 0 0-6.2 0C4.8 2.4 3.5 2.8 3.5 2.8a4.4 4.4 0 0 0-.1 3.3A4.7 4.7 0 0 0 2 9.3c0 4.6 2.6 5.7 5.3 6A3 3 0 0 0 6.5 18v3" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    video: '<rect x="3" y="5.5" width="13" height="13" rx="2.5" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M16 10.5l4.2-2.4a.8.8 0 0 1 1.2.7v6.4a.8.8 0 0 1-1.2.7L16 13.5" stroke="currentColor" stroke-width="1.7" fill="none"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" stroke="currentColor" stroke-width="1.7" fill="none"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.7" fill="none"/><rect x="13.5" y="3.5" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.7" fill="none"/><rect x="3.5" y="13.5" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.7" fill="none"/><rect x="13.5" y="13.5" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.7" fill="none"/>'
  };

  function svg(name) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || ICONS.grid) + '</svg>';
  }

  function iconFor(name) {
    var n = String(name || '').toLowerCase();
    if (n.indexOf('github') >= 0) return 'github';
    if (n.indexOf('博') >= 0 || n.indexOf('blog') >= 0) return 'blog';
    if (n.indexOf('b 站') >= 0 || n.indexOf('视频') >= 0 || n.indexOf('bili') >= 0) return 'video';
    if (n.indexOf('书') >= 0 || n.indexOf('小红') >= 0) return 'book';
    return 'grid';
  }

  function render(cfg) {
    var site = (cfg && cfg.site) || {};
    var name = site.name || DEFAULTS.name;
    var home = site.home || '/';
    var items = ['<a class="item" href="' + home + '"><span class="ic">' + svg('home') + '</span>返回首页</a>'];

    if (site.blog) {
      items.push('<a class="item" href="' + site.blog + '" target="_blank" rel="noopener"><span class="ic">' + svg('blog') + '</span>我的博客</a>');
    }
    (site.social || []).forEach(function (s) {
      if (!s || !s.url) return;
      items.push('<a class="item" href="' + s.url + '" target="_blank" rel="noopener"><span class="ic">' +
        svg(iconFor(s.icon || s.name)) + '</span>' + (s.name || '链接') + '</a>');
    });
    items.push('<div class="sep"></div>');
    items.push('<a class="item" href="' + home + '"><span class="ic">' + svg('grid') + '</span>更多工具</a>');
    items.push('<div class="tip">' + name + ' · 免登录 · 本地处理</div>');

    root.innerHTML =
      '<style>' + css + '</style>' +
      '<div class="wrap">' +
        '<div class="panel" role="menu">' + items.join('') + '</div>' +
        '<div class="pill" role="button" tabindex="0" aria-label="打开导航菜单">' +
          '<img src="' + (site.logo || '/assets/logo.svg') + '" alt="">' +
          '<span>' + name + '</span>' +
        '</div>' +
      '</div>';

    var pill = root.querySelector('.pill');
    var panel = root.querySelector('.panel');
    var offset = Number(window.CZ_CHROME_OFFSET || 0);
    if (offset > 0) {
      var wrap = root.querySelector('.wrap');
      wrap.style.bottom = (18 + offset) + 'px';
    }
    function toggle(force) {
      var on = typeof force === 'boolean' ? force : !panel.classList.contains('on');
      panel.classList.toggle('on', on);
    }
    pill.addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
    pill.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
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

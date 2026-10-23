(function () {
  'use strict';

  var ICONS = {
    layout: '<path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h6A1.5 1.5 0 0 1 12 4.5v15A1.5 1.5 0 0 1 10.5 21h-6A1.5 1.5 0 0 1 3 19.5v-15Z" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M15 4.5A1.5 1.5 0 0 1 16.5 3h3A1.5 1.5 0 0 1 21 4.5v6A1.5 1.5 0 0 1 19.5 12h-3A1.5 1.5 0 0 1 15 10.5v-6Z" stroke="currentColor" stroke-width="1.7" fill="none"/>',
    cover: '<rect x="3" y="4" width="18" height="16" rx="2.5" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M7 15.5l3.4-4.2 2.6 3 2.2-2.6 2.8 3.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="8.5" cy="8.5" r="1.4" fill="currentColor"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.3 0 2-.8 2-1.8 0-1.6-1.6-1.7-1.6-3 0-.9.7-1.6 1.7-1.6H16a5 5 0 0 0 5-5C21 5.4 17 3 12 3Z" stroke="currentColor" stroke-width="1.7" fill="none"/><circle cx="8" cy="9.5" r="1.2" fill="currentColor"/><circle cx="12" cy="7.5" r="1.2" fill="currentColor"/><circle cx="7" cy="14" r="1.2" fill="currentColor"/>',
    video: '<rect x="3" y="5.5" width="13" height="13" rx="2.5" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M16 10.5l4.2-2.4a.8.8 0 0 1 1.2.7v6.4a.8.8 0 0 1-1.2.7L16 13.5" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" fill="none"/>',
    image: '<rect x="3" y="4.5" width="18" height="15" rx="2.5" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M6.5 16l4-5 3 3.6 2.2-2.4L20 16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="8.4" cy="8.6" r="1.3" fill="currentColor"/>',
    code: '<path d="M8.5 8L4.5 12l4 4M15.5 8l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M13.5 5.5l-3 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    text: '<path d="M4 6h16M4 11h11M4 16h16M4 21h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    blog: '<path d="M5 4h9l5 5v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M14 4v5h5M8 13h8M8 17h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    github: '<path d="M9 19c-4 1.2-4-2-5.5-2.5M15 21v-3.4a3 3 0 0 0-.8-2.3c2.7-.3 5.3-1.4 5.3-6a4.7 4.7 0 0 0-1.3-3.2 4.4 4.4 0 0 0-.1-3.3s-1.3-.4-4.2 1.6a12 12 0 0 0-6.2 0C4.8 2.4 3.5 2.8 3.5 2.8a4.4 4.4 0 0 0-.1 3.3A4.7 4.7 0 0 0 2 9.3c0 4.6 2.6 5.7 5.3 6A3 3 0 0 0 6.5 18v3" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" stroke="currentColor" stroke-width="1.7" fill="none"/>'
  };

  var state = { cfg: null, cat: 'all', q: '' };

  var $ = function (s) { return document.querySelector(s); };

  function icon(name) {
    var body = ICONS[name] || ICONS.layout;
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + body + '</svg>';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---------- 主题 ---------- */
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('cz-theme', t); } catch (e) {}
  }
  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem('cz-theme'); } catch (e) {}
    if (!saved) saved = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    applyTheme(saved);
    $('#themeBtn').addEventListener('click', function () {
      applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  /* ---------- 渲染 ---------- */
  function renderCats() {
    var cats = state.cfg.categories || [];
    $('#cats').innerHTML = cats.map(function (c) {
      return '<a href="#cat-' + esc(c.id) + '" data-cat="' + esc(c.id) + '" class="' + (state.cat === c.id ? 'on' : '') + '">' + esc(c.name) + '</a>';
    }).join('');

    var quick = cats.filter(function (c) { return c.id !== 'all'; }).slice(0, 5);
    $('#quick').innerHTML = quick.map(function (c) {
      return '<button data-qcat="' + esc(c.id) + '">' + esc(c.name) + '</button>';
    }).join('');
  }

  function bindDelegates() {
    $('#cats').addEventListener('click', function (e) {
      var a = e.target.closest('[data-cat]');
      if (!a) return;
      e.preventDefault();
      state.cat = a.getAttribute('data-cat');
      renderCats(); renderGrid();
    });

    $('#quick').addEventListener('click', function (e) {
      var b = e.target.closest('[data-qcat]');
      if (!b) return;
      state.cat = b.getAttribute('data-qcat');
      renderCats(); renderGrid();
      $('#grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    $('#grid').addEventListener('click', function (e) {
      var a = e.target.closest('[data-off]');
      if (a) e.preventDefault();
    });
  }

  function match(t) {
    if (state.cat !== 'all' && t.category !== state.cat) return false;
    if (!state.q) return true;
    var q = state.q.toLowerCase();
    var hay = [t.name, t.desc, t.slug, (t.tags || []).join(' ')].join(' ').toLowerCase();
    return hay.indexOf(q) >= 0;
  }

  function renderGrid() {
    var tools = (state.cfg.tools || []).filter(match);
    var grid = $('#grid');
    $('#empty').hidden = tools.length > 0;
    grid.innerHTML = tools.map(function (t) {
      var isReady = t.status === 'ready';
      var isExternal = t.status === 'external';
      var badge = '';
      if (isExternal) badge = '<span class="badge ext">外链</span>';
      if (t.status === 'planned') badge = '<span class="badge planned">规划中</span>';
      var href = isReady ? esc(t.slug) + '/' : (isExternal ? esc(t.url) : '#');
      var attrs = isExternal ? ' target="_blank" rel="noopener nofollow"' : '';
      var openTxt = isReady ? '打开工具 →' : (isExternal ? '前往官网 ↗' : '即将上线');
      return '<a class="card' + (isReady || isExternal ? '' : ' disabled') + '" href="' + href + '"' +
        (isReady || isExternal ? '' : ' data-off="1"') + attrs + '>' +
        '<div class="card-top">' +
          '<div class="card-icon" style="background:' + esc(t.color) + '16;color:' + esc(t.color) + '">' + icon(t.icon) + '</div>' +
          '<div class="card-name">' + esc(t.name) + badge + '</div>' +
        '</div>' +
        '<p class="card-desc">' + esc(t.desc) + '</p>' +
        (t.note ? '<p class="card-note">' + esc(t.note) + '</p>' : '') +
        '<div class="card-foot">' +
          '<div class="tags">' + (t.tags || []).slice(0, 3).map(function (g) { return '<span class="tag">' + esc(g) + '</span>'; }).join('') + '</div>' +
          '<span class="open">' + openTxt + '</span>' +
        '</div>' +
      '</a>';
    }).join('');

    if (state.q) $('#empty').hidden = tools.length > 0;
  }

  function renderChrome() {
    var s = state.cfg.site || {};
    document.title = s.name + ' · ' + s.tagline;
    $('#subtitle').textContent = s.description || s.tagline;
    $('#blogLink').href = s.blog || '#';
    $('#repoLink').href = s.repo || '#';
    $('#ftrName').textContent = s.name;
    $('#ftrDesc').textContent = s.description || '';
    var links = (s.social || []).map(function (x) {
      return '<a href="' + esc(x.url) + '" target="_blank" rel="noopener">' + esc(x.name) + '</a>';
    });
    $('#ftrLinks').innerHTML = links.join('');
    var f = s.footer || {};
    $('#ftrNote').textContent = f.disclaimer || '';
    $('#ftrCopy').innerHTML = [f.copyright, f.icp, f.police].filter(Boolean).map(esc).join(' · ');

    var lg = s.legal || {};
    if (lg.items && lg.items.length) {
      $('#legalTitle').textContent = lg.title || '版权与免责声明';
      $('#legalList').innerHTML = lg.items.map(function (t) {
        return '<li>' + esc(t) + '</li>';
      }).join('');
    } else {
      $('#legal').hidden = true;
    }
  }

  /* ---------- 搜索 ---------- */
  function initSearch() {
    var q = $('#q');
    q.addEventListener('input', function () {
      state.q = q.value.trim();
      renderGrid();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== q) {
        e.preventDefault();
        q.focus();
      }
      if (e.key === 'Escape' && document.activeElement === q) {
        q.value = ''; state.q = ''; q.blur(); renderGrid();
      }
    });
  }

  /* ---------- 启动 ---------- */
  function boot(cfg) {
    state.cfg = cfg;
    renderChrome();
    bindDelegates();
    renderCats();
    renderGrid();
    initSearch();
  }

  initTheme();
  fetch('tools.config.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(boot)
    .catch(function () {
      $('#grid').innerHTML = '<p class="empty">工具清单加载失败，请通过 http 访问本站（本地直接双击 HTML 无法读取配置）。</p>';
    });
})();

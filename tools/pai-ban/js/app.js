/* ==========================================================
   超赞排版 · 主逻辑
   ========================================================== */
(function () {
  'use strict';

  var PB = window.PB;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* ==========================================================
     状态
     ========================================================== */
  var DEFAULTS = {
    template: 'single',
    padding: 24,
    gapTop: 8,
    gapBottom: 8,
    gapX: 8,
    radius: 0,
    shadow: 0,
    blankTop: 0,
    blankBottom: 0,
    bgColor: '#ffffff',
    bgRadius: 0,
    textTop: '',
    textBottom: '',
    fontSize: 30,
    fontColor: '#222222',
    bold: false,
    align: 'left',
    lineHeight: 1.8,
    protect: false,
    zoom: 55
  };

  var state = Object.assign({}, DEFAULTS);
  var images = [];      // { id, el, url, file }
  var bgImg = null;
  var uid = 1;

  function docOf() {
    return {
      images: images,
      template: state.template,
      padding: state.padding,
      gapTop: state.gapTop,
      gapBottom: state.gapBottom,
      gapX: state.gapX,
      radius: state.radius,
      shadow: state.shadow,
      blankTop: state.blankTop,
      blankBottom: state.blankBottom,
      bg: { color: state.bgColor, img: bgImg, radius: state.bgRadius },
      textTop: state.textTop,
      textBottom: state.textBottom,
      protect: state.protect,
      style: {
        size: state.fontSize,
        color: state.fontColor,
        bold: state.bold,
        align: state.align,
        lineHeight: state.lineHeight
      },
      cardColor: '#ffffff'
    };
  }

  /* ==========================================================
     提示条
     ========================================================== */
  var toastEl, toastTimer;
  function toast(msg, isErr) {
    toastEl.hidden = false;
    toastEl.textContent = msg;
    toastEl.className = 'toast show' + (isErr ? ' err' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('show');
      setTimeout(function () { toastEl.hidden = true; }, 260);
    }, isErr ? 3200 : 2200);
  }
  PB.toast = toast;

  /* ==========================================================
     渲染
     ========================================================== */
  var cv;
  var rafId = 0;

  function render() {
    if (rafId) return;
    rafId = requestAnimationFrame(function () {
      rafId = 0;
      draw();
    });
  }

  function draw() {
    var has = images.length > 0;
    $('#emptyHint').hidden = has;
    $('#canvasWrap').hidden = !has;
    if (!has) {
      $('#canvasInfo').textContent = '1080 × 0';
      return;
    }

    var d = docOf();
    var L = PB.computeLayout(d);
    var z = state.zoom / 100;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var s = z * dpr;
    var MAXSIDE = 16384;
    if (L.height * s > MAXSIDE) s = MAXSIDE / L.height;

    cv.width = Math.max(1, Math.round(L.width * s));
    cv.height = Math.max(1, Math.round(L.height * s));
    cv.style.width = Math.round(L.width * z) + 'px';
    cv.style.height = Math.round(L.height * z) + 'px';

    var ctx = cv.getContext('2d');
    ctx.setTransform(s, 0, 0, s, 0, 0);
    PB.paint(ctx, L, d, s);

    $('#canvasInfo').textContent = L.width + ' × ' + L.height;
  }

  /* ==========================================================
     图片管理
     ========================================================== */
  function loadFiles(files) {
    var list = [].slice.call(files || []).filter(function (f) {
      return f && /^image\//.test(f.type);
    });
    if (!list.length) return;

    var pending = list.length;
    var added = 0;

    list.forEach(function (file) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.decoding = 'async';
      img.onload = function () {
        images.push({ id: uid++, el: img, url: url, file: file });
        added++;
        done();
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        done();
      };
      img.src = url;
    });

    function done() {
      if (--pending > 0) return;
      if (added) {
        var wasEmpty = images.length === added;
        renderThumbs();
        if (wasEmpty) autoFitZoom();
        render();
        toast('已添加 ' + added + ' 张图片');
      } else {
        toast('图片读取失败，请换一张试试', true);
      }
    }
  }

  function autoFitZoom() {
    var scroll = $('#stageScroll');
    var avail = scroll.clientWidth - 60;
    if (avail <= 0) return;
    var z = Math.min(100, Math.max(20, Math.round((avail / 1080) * 100)));
    state.zoom = z;
    $('#zoom').value = z;
    $('#zoomVal').textContent = z + '%';
  }

  function renderThumbs() {
    var box = $('#thumbs');
    box.innerHTML = '';
    images.forEach(function (im, i) {
      var d = document.createElement('div');
      d.className = 'thumb';
      d.draggable = true;
      d.dataset.i = i;
      d.innerHTML =
        '<img src="' + im.url + '" alt="" draggable="false">' +
        '<span class="idx">' + (i + 1) + '</span>' +
        '<button class="del" title="删除">×</button>';
      box.appendChild(d);
    });
    $('#imgCount').textContent = images.length;
  }

  function removeImage(i) {
    var im = images[i];
    if (!im) return;
    if (im.url) URL.revokeObjectURL(im.url);
    images.splice(i, 1);
    renderThumbs();
    render();
  }

  /* ==========================================================
     缩略图拖拽排序
     ========================================================== */
  var dragIdx = -1;

  function bindThumbDrag() {
    var box = $('#thumbs');

    box.addEventListener('dragstart', function (e) {
      var t = e.target.closest('.thumb');
      if (!t) return;
      dragIdx = Number(t.dataset.i);
      t.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', String(dragIdx)); } catch (err) {}
    });

    box.addEventListener('dragend', function () {
      dragIdx = -1;
      $$('.thumb', box).forEach(function (x) {
        x.classList.remove('dragging', 'over');
      });
    });

    box.addEventListener('dragover', function (e) {
      if (dragIdx < 0) return;
      e.preventDefault();
      var t = e.target.closest('.thumb');
      $$('.thumb', box).forEach(function (x) { x.classList.remove('over'); });
      if (t && Number(t.dataset.i) !== dragIdx) t.classList.add('over');
    });

    box.addEventListener('drop', function (e) {
      if (dragIdx < 0) return;
      e.preventDefault();
      var t = e.target.closest('.thumb');
      if (!t) return;
      var to = Number(t.dataset.i);
      if (to === dragIdx) return;
      var moved = images.splice(dragIdx, 1)[0];
      images.splice(to, 0, moved);
      dragIdx = -1;
      renderThumbs();
      render();
    });

    box.addEventListener('click', function (e) {
      var del = e.target.closest('.del');
      if (!del) return;
      var t = e.target.closest('.thumb');
      removeImage(Number(t.dataset.i));
    });
  }

  /* ==========================================================
     控件绑定
     ========================================================== */
  function bindRange(id, key, labelId, suffix, onAfter) {
    var el = $('#' + id);
    if (!el) return;
    el.addEventListener('input', function () {
      state[key] = Number(el.value);
      if (labelId) $('#' + labelId).textContent = el.value + (suffix || '');
      if (onAfter) onAfter();
      render();
      save();
    });
  }

  function bindNum(id, key, min, max, onAfter) {
    var el = $('#' + id);
    if (!el) return;
    function commit() {
      var v = Number(el.value);
      if (!isFinite(v)) v = 0;
      v = Math.max(min, Math.min(max, Math.round(v)));
      el.value = v;
      state[key] = v;
      if (onAfter) onAfter();
      render();
      save();
    }
    el.addEventListener('change', commit);
    el.addEventListener('blur', commit);
  }

  function bindText(id, key) {
    var el = $('#' + id);
    if (!el) return;
    el.addEventListener('input', function () {
      state[key] = el.value;
      render();
      save();
    });
  }

  /* ==========================================================
     模板网格
     ========================================================== */
  function renderTemplates() {
    var box = $('#tplGrid');
    box.innerHTML = '';
    PB.TEMPLATES.forEach(function (t) {
      var b = document.createElement('button');
      b.className = 'tpl' + (t.id === state.template ? ' is-on' : '');
      b.dataset.id = t.id;
      var ico = '';
      t.icon.forEach(function (row, ri) {
        if (ri) ico += '<span style="width:100%;height:2px"></span>';
        row.forEach(function (w) {
          ico += '<i style="width:' + w + '%;height:' + (t.icon.length > 1 ? 10 : 24) + 'px"></i>';
        });
      });
      b.innerHTML =
        '<div class="tpl-ico" style="flex-wrap:wrap;align-content:center;gap:2px">' + ico + '</div>' +
        '<div class="tpl-name">' + t.name + '</div>';
      box.appendChild(b);
    });
  }

  /* ==========================================================
     背景色板
     ========================================================== */
  var BG_COLORS = ['#ffffff', '#f7f7f8', '#fff8f0', '#f0f7ff', '#f3fbf5', '#fdf2f6', '#1c1c1e', '#2b2b2e'];

  function renderSwatches() {
    var box = $('#bgSwatches');
    box.innerHTML = '';
    BG_COLORS.forEach(function (c) {
      var b = document.createElement('button');
      b.className = 'swatch' + (c.toLowerCase() === state.bgColor.toLowerCase() ? ' is-on' : '');
      b.style.background = c;
      b.dataset.c = c;
      b.title = c;
      box.appendChild(b);
    });
  }

  /* ==========================================================
     导出
     ========================================================== */
  function download(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
  }

  function exportPNG(scale) {
    if (!images.length) { toast('请先添加图片', true); return; }
    toast('正在生成，请稍候…');
    setTimeout(function () {
      var r = PB.renderToCanvas(docOf(), scale);
      r.canvas.toBlob(function (blob) {
        if (!blob) { toast('导出失败，图片可能过大', true); return; }
        download(blob, 'paiban-' + r.canvas.width + 'x' + r.canvas.height + '.png');
        toast('已导出 ' + r.canvas.width + ' × ' + r.canvas.height + ' 长图');
      }, 'image/png');
    }, 30);
  }

  function copyImage() {
    if (!images.length) { toast('请先添加图片', true); return; }
    if (!navigator.clipboard || !window.ClipboardItem) {
      toast('当前浏览器不支持复制图片，请用「导出长图」', true);
      return;
    }
    toast('正在复制…');
    var r = PB.renderToCanvas(docOf(), 1);
    r.canvas.toBlob(function (blob) {
      if (!blob) { toast('复制失败', true); return; }
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        .then(function () { toast('已复制图片，可直接粘贴进公众号编辑器'); })
        .catch(function () { toast('复制失败，请改用「导出长图」', true); });
    }, 'image/png');
  }

  /* ---------- 富文本 ---------- */
  var dataCache = new Map();

  function toDataURL(im) {
    return new Promise(function (resolve) {
      if (dataCache.has(im.el)) return resolve(dataCache.get(im.el));
      var maxW = 1080;
      var k = Math.min(1, maxW / (im.el.width || maxW));
      var c = document.createElement('canvas');
      c.width = Math.max(1, Math.round((im.el.width || maxW) * k));
      c.height = Math.max(1, Math.round((im.el.height || maxW) * k));
      var g = c.getContext('2d');
      g.fillStyle = '#ffffff';
      g.fillRect(0, 0, c.width, c.height);
      g.drawImage(im.el, 0, 0, c.width, c.height);
      var isPng = im.file && /png|webp/.test(im.file.type) && im.file.size < 500 * 1024;
      var url = c.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.92);
      dataCache.set(im.el, url);
      resolve(url);
    });
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var K = 0.63; // 1080 设计稿 → 公众号正文宽度 的换算系数

  function px(v) { return Math.round(v * K) + 'px'; }

  function imgTag(url, wPercent, radius, shadow, protect, aspect) {
    if (protect) {
      // 防盗图：用背景图代替 <img>，读者长按无法「保存图片」
      var pb = aspect ? (100 / aspect).toFixed(2) : 66.67;
      return '<div style="width:' + wPercent + '%;height:0;padding-bottom:' + pb + '%;' +
        'background-image:url(' + url + ');background-size:cover;background-position:center;' +
        'background-repeat:no-repeat;border-radius:' + px(radius) + ';' +
        (shadow ? 'box-shadow:0 4px 12px rgba(0,0,0,.18);' : '') +
        'display:block;overflow:hidden"></div>';
    }
    return '<img src="' + url + '" style="width:' + wPercent + '%;display:block;' +
      'border-radius:' + px(radius) + ';' +
      (shadow ? 'box-shadow:0 4px 12px rgba(0,0,0,.18);' : '') + '">';
  }

  async function buildHTML() {
    var d = docOf();
    var tpl = PB.getTemplate(d.template);
    var radius = tpl.seamless ? 0 : d.radius;
    var shadow = tpl.seamless ? 0 : d.shadow;
    var gapX = tpl.seamless ? 0 : d.gapX;
    var gapT = tpl.seamless ? 0 : d.gapTop;
    var gapB = tpl.seamless ? 0 : d.gapBottom;
    var cardPad = tpl.card ? 14 : 0;

    var cache = new Map();
    for (var i = 0; i < images.length; i++) {
      cache.set(images[i].id, await toDataURL(images[i]));
    }

    function textHTML(txt) {
      if (!txt || !txt.trim()) return '';
      var lines = txt.split('\n').map(function (l) {
        return l ? esc(l) : '&nbsp;';
      }).join('<br>');
      return '<p style="font-size:' + px(d.style.size) + ';line-height:' + d.style.lineHeight +
        ';color:' + d.style.color + ';text-align:' + d.style.align +
        ';font-weight:' + (d.style.bold ? 700 : 400) + ';margin:0 0 ' + px(gapB) + ';">' + lines + '</p>';
    }

    var out = [];
    out.push('<section style="box-sizing:border-box;padding:' + px(d.padding) + ';' +
      (d.bg.img ? '' : 'background:' + (d.bg.color || '#ffffff') + ';') +
      (d.bg.radius ? 'border-radius:' + px(d.bg.radius) + ';' : '') +
      'max-width:100%;">');

    if (d.blankTop > 0) out.push('<p style="height:' + px(d.blankTop) + ';margin:0;font-size:0;line-height:0">&nbsp;</p>');
    out.push(textHTML(d.textTop));

    var rows = tpl.masonry
      ? PB.rowsFor({ pattern: [[1, 1]] }, images.length)
      : PB.rowsFor(tpl, images.length);

    var paras = tpl.interleave
      ? d.textBottom.split(/\n\s*\n/).map(function (s) { return s.trim(); }).filter(Boolean)
      : null;
    var pi = 0;

    rows.forEach(function (row) {
      var n = row.idxs.length;
      var wsum = row.pat.reduce(function (a, b) { return a + b; }, 0);
      var fullW = 100 - (gapX / 1080 * 100) * (row.pat.length - 1);

      out.push('<section style="display:flex;gap:' + px(gapX) + ';margin:' + px(gapT) + ' 0 ' + px(gapB) + ';">');
      row.idxs.forEach(function (idx, j) {
        var im = images[idx];
        var url = cache.get(im.id);
        var w = (fullW * row.pat[j] / wsum).toFixed(3);
        var aspect = (im.el.width && im.el.height) ? im.el.width / im.el.height : 1;
        if (cardPad) {
          out.push('<div style="width:' + w + '%;background:#fff;border-radius:' + px(radius + 8) +
            ';padding:' + px(cardPad) + ';box-sizing:border-box;box-shadow:0 4px 14px rgba(0,0,0,.12)">' +
            imgTag(url, 100, radius, 0, false, aspect) + '</div>');
        } else {
          out.push('<div style="width:' + w + '%">' + imgTag(url, 100, radius, shadow, d.protect, aspect) + '</div>');
        }
      });
      out.push('</section>');

      if (paras && pi < paras.length) out.push(textHTML(paras[pi++]));
    });

    if (paras) {
      while (pi < paras.length) out.push(textHTML(paras[pi++]));
    } else {
      out.push(textHTML(d.textBottom));
    }

    if (d.blankBottom > 0) out.push('<p style="height:' + px(d.blankBottom) + ';margin:0;font-size:0;line-height:0">&nbsp;</p>');
    out.push('</section>');
    return out.join('');
  }

  async function copyRichText() {
    if (!images.length) { toast('请先添加图片', true); return; }
    toast('正在整理富文本…');
    try {
      var html = await buildHTML();
      var ok = false;

      if (navigator.clipboard && window.ClipboardItem) {
        try {
          await navigator.clipboard.write([new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([html.replace(/<[^>]+>/g, '')], { type: 'text/plain' })
          })]);
          ok = true;
        } catch (e) { ok = false; }
      }

      if (!ok) {
        var holder = document.createElement('div');
        holder.contentEditable = 'true';
        holder.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
        holder.innerHTML = html;
        document.body.appendChild(holder);
        var range = document.createRange();
        range.selectNodeContents(holder);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        ok = document.execCommand('copy');
        sel.removeAllRanges();
        holder.remove();
      }

      toast(ok
        ? '已复制富文本，去公众号编辑器 Ctrl+V 粘贴'
        : '复制失败，请改用「导出长图」再插入', !ok);
    } catch (e) {
      toast('复制失败：' + e.message, true);
    }
  }

  /* ==========================================================
     保存设置
     ========================================================== */
  var SAVE_KEY = 'pb-settings-v1';

  function save() {
    try {
      var o = Object.assign({}, state);
      localStorage.setItem(SAVE_KEY, JSON.stringify(o));
    } catch (e) {}
  }

  function restore() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      var o = JSON.parse(raw);
      Object.keys(DEFAULTS).forEach(function (k) {
        if (o[k] !== undefined && typeof o[k] === typeof DEFAULTS[k]) state[k] = o[k];
      });
    } catch (e) {}
  }

  function syncControls() {
    $('#radius').value = state.radius;
    $('#vRadius').textContent = state.radius + 'px';
    $('#shadow').value = state.shadow;
    $('#vShadow').textContent = state.shadow;
    $('#gapTop').value = state.gapTop;
    $('#gapBottom').value = state.gapBottom;
    $('#gapX').value = state.gapX;
    $('#padding').value = state.padding;
    $('#blankTop').value = state.blankTop;
    $('#blankBottom').value = state.blankBottom;
    $('#bgColor').value = state.bgColor;
    $('#bgRadius').value = state.bgRadius;
    $('#textTop').value = state.textTop;
    $('#textBottom').value = state.textBottom;
    $('#fontSize').value = state.fontSize;
    $('#lineHeight').value = state.lineHeight;
    $('#fontColor').value = state.fontColor;
    $('#protect').checked = state.protect;
    $('#zoom').value = state.zoom;
    $('#zoomVal').textContent = state.zoom + '%';
    $('#fontBold').classList.toggle('is-on', state.bold);
    $$('#aligns button').forEach(function (b) {
      b.classList.toggle('is-on', b.dataset.align === state.align);
    });
    renderSwatches();
    renderTemplates();
  }

  /* ==========================================================
     主题
     ========================================================== */
  function initTheme() {
    var t = 'light';
    try { t = localStorage.getItem('cz-theme') || 'light'; } catch (e) {}
    document.documentElement.setAttribute('data-theme', t);
    $('#btnTheme').addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      try { localStorage.setItem('cz-theme', cur); } catch (e) {}
    });
  }

  /* ==========================================================
     视图切换
     ========================================================== */
  function switchView(v) {
    $$('.seg-btn').forEach(function (b) { b.classList.toggle('is-on', b.dataset.view === v); });
    $('#viewLayout').hidden = v !== 'layout';
    $('#viewCover').hidden = v !== 'cover';
    if (v === 'cover') PB.Cover.activate();
    else render();
  }

  /* ==========================================================
     初始化
     ========================================================== */
  function init() {
    toastEl = $('#toast');
    cv = $('#cv');

    restore();
    syncControls();
    bindThumbDrag();
    initTheme();
    PB.Cover.init();

    /* ---- 上传 ---- */
    var input = $('#fileInput');
    var dz = $('#dropzone');

    dz.addEventListener('click', function () { input.click(); });
    dz.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
    });
    input.addEventListener('change', function () {
      loadFiles(input.files);
      input.value = '';
    });

    ['dragenter', 'dragover'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) {
        e.preventDefault();
        dz.classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) {
        e.preventDefault();
        dz.classList.remove('dragover');
      });
    });
    dz.addEventListener('drop', function (e) {
      if (e.dataTransfer.files && e.dataTransfer.files.length) loadFiles(e.dataTransfer.files);
    });

    // 整页拖拽
    window.addEventListener('dragover', function (e) { e.preventDefault(); });
    window.addEventListener('drop', function (e) {
      if (e.target.closest('.dropzone')) return;
      if (e.dataTransfer.files && e.dataTransfer.files.length) {
        e.preventDefault();
        loadFiles(e.dataTransfer.files);
      }
    });

    // 粘贴
    document.addEventListener('paste', function (e) {
      if (!e.clipboardData) return;
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      var files = [].slice.call(e.clipboardData.files || []);
      if (files.length) { e.preventDefault(); loadFiles(files); }
    });

    /* ---- 左栏按钮 ---- */
    $('#btnClearImg').addEventListener('click', function () {
      if (!images.length) return;
      if (!confirm('确定清空全部图片？')) return;
      images.forEach(function (im) { URL.revokeObjectURL(im.url); });
      images = [];
      dataCache.clear();
      renderThumbs();
      render();
    });

    $('#btnShuffle').addEventListener('click', function () {
      if (images.length < 2) return;
      for (var i = images.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = images[i]; images[i] = images[j]; images[j] = t;
      }
      renderThumbs();
      render();
    });

    $('#btnReverse').addEventListener('click', function () {
      images.reverse();
      renderThumbs();
      render();
    });

    /* ---- 模板 ---- */
    $('#tplGrid').addEventListener('click', function (e) {
      var b = e.target.closest('.tpl');
      if (!b) return;
      state.template = b.dataset.id;
      $$('.tpl', this).forEach(function (x) { x.classList.toggle('is-on', x === b); });
      render();
      save();
    });

    /* ---- 滑块 ---- */
    bindRange('radius', 'radius', 'vRadius', 'px');
    bindRange('shadow', 'shadow', 'vShadow', '');
    bindRange('zoom', 'zoom', 'zoomVal', '%');

    /* ---- 数字 ---- */
    bindNum('gapTop', 'gapTop', 0, 120);
    bindNum('gapBottom', 'gapBottom', 0, 120);
    bindNum('gapX', 'gapX', 0, 120);
    bindNum('padding', 'padding', 0, 120);
    bindNum('blankTop', 'blankTop', 0, 600);
    bindNum('blankBottom', 'blankBottom', 0, 600);
    bindNum('fontSize', 'fontSize', 18, 80);
    bindNum('lineHeight', 'lineHeight', 1.2, 3);
    bindNum('bgRadius', 'bgRadius', 0, 160);

    /* ---- 背景 ---- */
    $('#bgSwatches').addEventListener('click', function (e) {
      var b = e.target.closest('.swatch');
      if (!b) return;
      state.bgColor = b.dataset.c;
      $('#bgColor').value = state.bgColor;
      renderSwatches();
      render();
      save();
    });

    $('#bgColor').addEventListener('input', function () {
      state.bgColor = this.value;
      renderSwatches();
      render();
      save();
    });

    var bgInput = document.createElement('input');
    bgInput.type = 'file';
    bgInput.accept = 'image/*';
    bgInput.addEventListener('change', function () {
      var f = bgInput.files && bgInput.files[0];
      if (!f) return;
      var url = URL.createObjectURL(f);
      var img = new Image();
      img.onload = function () {
        bgImg = img;
        render();
        toast('背景图已设置');
      };
      img.src = url;
      bgInput.value = '';
    });
    $('#bgUpload').addEventListener('click', function () { bgInput.click(); });
    $('#bgClear').addEventListener('click', function () {
      bgImg = null;
      render();
      save();
    });

    /* ---- 文案 ---- */
    bindText('textTop', 'textTop');
    bindText('textBottom', 'textBottom');
    $('#fontColor').addEventListener('input', function () {
      state.fontColor = this.value;
      render();
      save();
    });
    $('#fontBold').addEventListener('click', function () {
      state.bold = !state.bold;
      this.classList.toggle('is-on', state.bold);
      render();
      save();
    });
    $('#aligns').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      state.align = b.dataset.align;
      $$('button', this).forEach(function (x) { x.classList.toggle('is-on', x === b); });
      render();
      save();
    });

    /* ---- 防盗图 ---- */
    $('#protect').addEventListener('change', function () {
      state.protect = this.checked;
      save();
    });

    /* ---- 导出菜单 ---- */
    var menu = $('#exportMenu');
    $('#btnExport').addEventListener('click', function (e) {
      e.stopPropagation();
      menu.hidden = !menu.hidden;
    });
    document.addEventListener('click', function () { menu.hidden = true; });
    menu.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      menu.hidden = true;
      var act = b.dataset.act;
      if (act === 'png1') exportPNG(1);
      else if (act === 'png2') exportPNG(2);
      else if (act === 'png3') exportPNG(3);
      else if (act === 'clipimg') copyImage();
      else if (act === 'cliphtml') copyRichText();
    });

    /* ---- 重置 ---- */
    $('#btnReset').addEventListener('click', function () {
      if (!confirm('确定重置全部设置并清空图片？')) return;
      images.forEach(function (im) { URL.revokeObjectURL(im.url); });
      images = [];
      bgImg = null;
      dataCache.clear();
      state = Object.assign({}, DEFAULTS);
      try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
      syncControls();
      renderThumbs();
      render();
      toast('已重置');
    });

    /* ---- 视图切换 ---- */
    $$('.seg-btn').forEach(function (b) {
      b.addEventListener('click', function () { switchView(b.dataset.view); });
    });

    /* ---- 离开提醒 ---- */
    window.addEventListener('beforeunload', function (e) {
      if (!images.length) return;
      e.preventDefault();
      e.returnValue = '';
      return '';
    });

    /* ---- 窗口尺寸变化 ---- */
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(render, 160);
    });

    renderThumbs();
    render();
  }

  PB.getFirstImage = function () {
    return images.length ? images[0].el : null;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

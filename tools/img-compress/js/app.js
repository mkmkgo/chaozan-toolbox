/* ==========================================================
   图片压缩 · 格式转换
   ========================================================== */
(function () {
  'use strict';

  var $ = function (s) { return document.querySelector(s); };

  var MAX_EDGE_STEPS = [0, 2560, 2048, 1920, 1600, 1440, 1280, 1080, 960, 800, 640, 480, 320];

  var cfg = {
    format: 'keep',
    quality: 82,
    maxEdge: 0,
    bgColor: '#ffffff'
  };

  var items = [];
  var uid = 1;
  var busy = false;
  var pendingRun = false;

  /* ==========================================================
     工具函数
     ========================================================== */
  function fmtSize(n) {
    if (n == null) return '—';
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / 1024 / 1024).toFixed(2) + ' MB';
  }

  function baseName(name) {
    return String(name || 'image').replace(/\.[^.]+$/, '');
  }

  function extOf(type) {
    if (type === 'image/jpeg') return 'jpg';
    if (type === 'image/webp') return 'webp';
    if (type === 'image/png') return 'png';
    if (type === 'image/avif') return 'avif';
    return 'png';
  }

  function toast(msg, isErr) {
    var el = $('#toast');
    el.hidden = false;
    el.textContent = msg;
    el.className = 'toast show' + (isErr ? ' err' : '');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { el.hidden = true; }, 260);
    }, isErr ? 3200 : 2200);
  }

  function resolveType(item) {
    if (cfg.format !== 'keep') return cfg.format;
    var t = item.file.type;
    if (t === 'image/jpeg' || t === 'image/png' || t === 'image/webp') return t;
    return 'image/png';
  }

  /* ==========================================================
     压缩
     ========================================================== */
  function targetSize(item) {
    var w = item.srcW;
    var h = item.srcH;
    var max = cfg.maxEdge;
    if (max > 0 && Math.max(w, h) > max) {
      var k = max / Math.max(w, h);
      w = Math.round(w * k);
      h = Math.round(h * k);
    }
    return { w: Math.max(1, w), h: Math.max(1, h) };
  }

  function encode(item) {
    return new Promise(function (resolve) {
      var size = targetSize(item);
      var type = resolveType(item);
      var cv = document.createElement('canvas');
      cv.width = size.w;
      cv.height = size.h;
      var g = cv.getContext('2d');
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = 'high';

      if (type === 'image/jpeg') {
        g.fillStyle = cfg.bgColor || '#ffffff';
        g.fillRect(0, 0, size.w, size.h);
      }
      g.drawImage(item.img, 0, 0, size.w, size.h);

      var q = cfg.quality / 100;
      cv.toBlob(function (blob) {
        if (!blob) { resolve(null); return; }
        resolve({ blob: blob, w: size.w, h: size.h, type: type });
      }, type, q);
    });
  }

  function yieldUI() {
    return new Promise(function (r) { setTimeout(r, 0); });
  }

  async function processAll() {
    if (busy) { pendingRun = true; return; }
    busy = true;
    pendingRun = false;
    $('#btnZip').disabled = true;

    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (!it) continue;
      it.status = 'working';
      paintItem(it);

      var out = await encode(it);
      if (out) {
        if (it.outUrl) URL.revokeObjectURL(it.outUrl);
        it.outBlob = out.blob;
        it.outUrl = URL.createObjectURL(out.blob);
        it.outW = out.w;
        it.outH = out.h;
        it.outSize = out.blob.size;
        it.outType = out.type;
        it.outName = baseName(it.name) + '-min.' + extOf(out.type);
        it.status = 'done';
      } else {
        it.status = 'error';
      }
      paintItem(it);
      updateSummary();
      await yieldUI();
    }

    busy = false;
    $('#btnZip').disabled = items.length === 0;
    if (pendingRun) processAll();
  }

  var reprocessTimer;
  function scheduleReprocess() {
    clearTimeout(reprocessTimer);
    reprocessTimer = setTimeout(function () {
      if (items.length) processAll();
    }, 220);
  }

  /* ==========================================================
     渲染
     ========================================================== */
  function savedPercent(it) {
    if (!it.outSize || !it.srcSize) return 0;
    return Math.round((1 - it.outSize / it.srcSize) * 100);
  }

  function paintItem(it) {
    var el = document.getElementById('item-' + it.id);
    if (!el) return;

    var pct = savedPercent(it);
    var badgeCls = pct > 0 ? 'badge' : pct === 0 ? 'badge zero' : 'badge bad';
    var badgeTxt = pct > 0 ? '↓ ' + pct + '%' : pct === 0 ? '持平' : '↑ ' + Math.abs(pct) + '%';

    var after = it.status === 'done'
      ? '<span class="arrow">→</span>' +
        '<span class="after">' + fmtSize(it.outSize) + '</span>' +
        '<span class="' + badgeCls + '">' + badgeTxt + '</span>' +
        '<span>' + it.outW + ' × ' + it.outH + '</span>' +
        '<span>' + extOf(it.outType).toUpperCase() + '</span>'
      : it.status === 'working'
        ? '<span class="arrow">→</span><span>处理中…</span>'
        : '<span class="arrow">→</span><span>处理失败</span>';

    el.className = 'item' + (it.status === 'done' ? ' done' : '');

    var ops = it.status === 'done'
      ? '<button class="primary" data-act="save">下载</button>' +
        '<button data-act="copy">复制</button>' +
        '<button class="del" data-act="del">删除</button>'
      : '<button class="del" data-act="del">删除</button>';

    el.innerHTML =
      '<div class="thumb" data-act="preview" title="点击预览压缩后效果">' +
        '<img src="' + (it.outUrl || it.srcUrl) + '" alt="">' +
      '</div>' +
      '<div class="meta">' +
        '<div class="name" title="' + it.name + '">' + it.name + '</div>' +
        '<div class="stats">' +
          '<span>' + it.srcW + ' × ' + it.srcH + '</span>' +
          '<span>' + fmtSize(it.srcSize) + '</span>' +
          after +
        '</div>' +
      '</div>' +
      '<div class="ops">' + ops + '</div>';
  }

  function renderAll() {
    var box = $('#list');
    box.innerHTML = '';
    items.forEach(function (it) {
      var el = document.createElement('div');
      el.className = 'item';
      el.id = 'item-' + it.id;
      el.dataset.id = it.id;
      box.appendChild(el);
      paintItem(it);
    });
    updateSummary();
  }

  function updateSummary() {
    var done = items.filter(function (i) { return i.status === 'done'; });
    var before = 0;
    var after = 0;
    items.forEach(function (i) { before += i.srcSize || 0; });
    done.forEach(function (i) { after += i.outSize || 0; });

    $('#summary').hidden = items.length === 0;
    $('#sumCount').textContent = items.length;
    $('#sumBefore').textContent = fmtSize(before);
    $('#sumAfter').textContent = fmtSize(after);
    $('#sumSaved').textContent = before && after
      ? Math.round((1 - after / before) * 100) + '%'
      : '—';
    $('#btnZip').disabled = done.length === 0;
  }

  /* ==========================================================
     添加 / 删除
     ========================================================== */
  function addFiles(files) {
    var list = [].slice.call(files || []).filter(function (f) {
      return f && /^image\//.test(f.type);
    });
    if (!list.length) { toast('没有可处理的图片', true); return; }

    var pending = list.length;

    list.forEach(function (file) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        items.push({
          id: uid++,
          file: file,
          name: file.name || ('image-' + uid + '.' + extOf(file.type)),
          srcUrl: url,
          img: img,
          srcW: img.naturalWidth,
          srcH: img.naturalHeight,
          srcSize: file.size,
          status: 'pending'
        });
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
      renderAll();
      processAll();
      toast('已添加 ' + list.length + ' 张图片');
    }
  }

  function removeItem(id) {
    var i = items.findIndex(function (x) { return x.id === id; });
    if (i < 0) return;
    var it = items[i];
    if (it.srcUrl) URL.revokeObjectURL(it.srcUrl);
    if (it.outUrl) URL.revokeObjectURL(it.outUrl);
    items.splice(i, 1);
    var el = document.getElementById('item-' + id);
    if (el) el.remove();
    updateSummary();
  }

  /* ==========================================================
     ZIP（store 模式，无压缩，纯前端）
     ========================================================== */
  var CRC_TABLE = (function () {
    var t = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(u8) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < u8.length; i++) {
      c = CRC_TABLE[(c ^ u8[i]) & 0xFF] ^ (c >>> 8);
    }
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function dosTime(d) {
    var time = ((d.getHours() & 31) << 11) | ((d.getMinutes() & 63) << 5) | ((d.getSeconds() / 2) & 31);
    var date = (((d.getFullYear() - 1980) & 127) << 9) | (((d.getMonth() + 1) & 15) << 5) | (d.getDate() & 31);
    return { time: time, date: date };
  }

  async function makeZip(entries) {
    var enc = new TextEncoder();
    var chunks = [];
    var central = [];
    var offset = 0;
    var now = dosTime(new Date());

    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      var nameBytes = enc.encode(e.name);
      var data = new Uint8Array(await e.blob.arrayBuffer());
      var crc = crc32(data);

      var lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true);
      lh.setUint16(4, 20, true);
      lh.setUint16(6, 0x0800, true);       // UTF-8 文件名
      lh.setUint16(8, 0, true);            // store
      lh.setUint16(10, now.time, true);
      lh.setUint16(12, now.date, true);
      lh.setUint32(14, crc, true);
      lh.setUint32(18, data.length, true);
      lh.setUint32(22, data.length, true);
      lh.setUint16(26, nameBytes.length, true);
      lh.setUint16(28, 0, true);

      chunks.push(new Uint8Array(lh.buffer), nameBytes, data);

      var ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true);
      ch.setUint16(4, 20, true);
      ch.setUint16(6, 20, true);
      ch.setUint16(8, 0x0800, true);
      ch.setUint16(10, 0, true);
      ch.setUint16(12, now.time, true);
      ch.setUint16(14, now.date, true);
      ch.setUint32(16, crc, true);
      ch.setUint32(20, data.length, true);
      ch.setUint32(24, data.length, true);
      ch.setUint16(28, nameBytes.length, true);
      ch.setUint16(30, 0, true);
      ch.setUint16(32, 0, true);
      ch.setUint16(34, 0, true);
      ch.setUint16(36, 0, true);
      ch.setUint32(38, 0, true);
      ch.setUint32(42, offset, true);
      central.push(new Uint8Array(ch.buffer), nameBytes);

      offset += 30 + nameBytes.length + data.length;
    }

    var cdStart = offset;
    var cdSize = 0;
    central.forEach(function (c) { cdSize += c.length; });

    var end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, entries.length, true);
    end.setUint16(10, entries.length, true);
    end.setUint32(12, cdSize, true);
    end.setUint32(16, cdStart, true);

    return new Blob(chunks.concat(central, [new Uint8Array(end.buffer)]), { type: 'application/zip' });
  }

  /* ==========================================================
     下载
     ========================================================== */
  function download(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 6000);
  }

  async function downloadZip() {
    var done = items.filter(function (i) { return i.status === 'done' && i.outBlob; });
    if (!done.length) { toast('还没有可下载的图片', true); return; }

    toast('正在打包 ' + done.length + ' 张图片…');
    var seen = {};
    var entries = done.map(function (it) {
      var key = it.outName;
      seen[key] = (seen[key] || 0) + 1;
      var name = seen[key] === 1
        ? key
        : baseName(it.outName) + '(' + seen[key] + ').' + extOf(it.outType);
      return { name: name, blob: it.outBlob };
    });

    try {
      var zip = await makeZip(entries);
      download(zip, 'compressed-' + Date.now() + '.zip');
      toast('已打包下载 ' + entries.length + ' 张');
    } catch (e) {
      toast('打包失败：' + e.message, true);
    }
  }

  async function copyItem(it) {
    if (!it.outBlob) return;
    if (!navigator.clipboard || !window.ClipboardItem) {
      toast('当前浏览器不支持复制图片', true);
      return;
    }
    try {
      var type = it.outBlob.type || 'image/png';
      var blob = it.outBlob;
      if (type !== 'image/png') {
        // 剪贴板只保证支持 PNG
        var cv = document.createElement('canvas');
        cv.width = it.outW;
        cv.height = it.outH;
        var g = cv.getContext('2d');
        g.drawImage(it.img, 0, 0, it.outW, it.outH);
        blob = await new Promise(function (r) { cv.toBlob(r, 'image/png'); });
        type = 'image/png';
      }
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      toast('已复制到剪贴板');
    } catch (e) {
      toast('复制失败，请用下载', true);
    }
  }

  /* ==========================================================
     事件
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

  function init() {
    initTheme();

    /* 上传 */
    var input = $('#fileInput');
    var dz = $('#dropzone');
    dz.addEventListener('click', function () { input.click(); });
    dz.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
    });
    input.addEventListener('change', function () {
      addFiles(input.files);
      input.value = '';
    });

    ['dragenter', 'dragover'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('dragover'); });
    });
    dz.addEventListener('drop', function (e) {
      if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });

    window.addEventListener('dragover', function (e) { e.preventDefault(); });
    window.addEventListener('drop', function (e) {
      if (e.target.closest('.dropzone')) return;
      if (e.dataTransfer.files && e.dataTransfer.files.length) {
        e.preventDefault();
        addFiles(e.dataTransfer.files);
      }
    });

    document.addEventListener('paste', function (e) {
      if (!e.clipboardData) return;
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      var files = [].slice.call(e.clipboardData.files || []);
      if (files.length) { e.preventDefault(); addFiles(files); }
    });

    /* 格式 */
    $('#formatChips').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      [].forEach.call(this.children, function (x) { x.classList.remove('is-on'); });
      b.classList.add('is-on');
      cfg.format = b.dataset.f;
      scheduleReprocess();
    });

    /* 画质 */
    $('#quality').addEventListener('input', function () {
      cfg.quality = Number(this.value);
      $('#vQuality').textContent = cfg.quality;
      scheduleReprocess();
    });

    /* 最大边长 */
    var maxEdgeEl = $('#maxEdge');
    maxEdgeEl.max = MAX_EDGE_STEPS.length - 1;
    maxEdgeEl.addEventListener('input', function () {
      cfg.maxEdge = MAX_EDGE_STEPS[Number(this.value)] || 0;
      $('#vMaxEdge').textContent = cfg.maxEdge ? cfg.maxEdge + 'px' : '不限制';
      scheduleReprocess();
    });

    /* 背景色 */
    $('#bgColor').addEventListener('input', function () {
      cfg.bgColor = this.value;
      scheduleReprocess();
    });

    /* 列表操作 */
    $('#list').addEventListener('click', function (e) {
      var act = e.target.closest('[data-act]');
      if (!act) return;
      var host = e.target.closest('.item');
      if (!host) return;
      var id = Number(host.dataset.id);
      var it = items.find(function (x) { return x.id === id; });
      if (!it) return;
      var a = act.dataset.act;

      if (a === 'del') removeItem(id);
      else if (a === 'save' && it.outBlob) download(it.outBlob, it.outName);
      else if (a === 'copy') copyItem(it);
      else if (a === 'preview' && it.outUrl) window.open(it.outUrl, '_blank', 'noopener');
    });

    /* 清空 */
    $('#btnClear').addEventListener('click', function () {
      if (!items.length) return;
      if (!confirm('确定清空全部图片？')) return;
      items.forEach(function (it) {
        URL.revokeObjectURL(it.srcUrl);
        if (it.outUrl) URL.revokeObjectURL(it.outUrl);
      });
      items = [];
      renderAll();
      $('#list').innerHTML = '';
    });

    /* 打包 */
    $('#btnZip').addEventListener('click', downloadZip);
    $('#btnZip').disabled = true;

    updateSummary();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

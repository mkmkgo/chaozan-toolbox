/* 超赞水印 · 批量图片加水印
   纯前端，Canvas 渲染，文件不出浏览器。 */
(function () {
  'use strict';

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  /* ==========================================================
     状态
     ========================================================== */
  var st = {
    type: 'text',
    text: '超赞工具箱',
    size: 32,
    spacing: 0,
    color: '#ffffff',
    font: 'system',
    bold: true,
    stroke: false,
    shadow: true,
    strokeColor: '#000000',
    strokeW: 2,
    logoScale: 18,
    logoRot: 0,
    opacity: 55,
    rotate: 0,
    pos: 'mc',
    mode: 'single',
    gap: 80,
    tileRot: -30,
    margin: 24,
    format: 'image/jpeg',
    quality: 92,
    custom: { x: 0.5, y: 0.5 }
  };

  var FONTS = {
    system: '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,sans-serif',
    song: '"Songti SC","SimSun",serif',
    kai: '"Kaiti SC","KaiTi",serif',
    serif: 'Georgia,"Times New Roman",serif',
    mono: '"SFMono-Regular",Consolas,"Courier New",monospace'
  };

  var items = [];       // { id, name, img, url, w, h }
  var cur = -1;
  var logoImg = null;
  var canvas = $('#canvas');
  var ctx = canvas.getContext('2d');
  var lastBox = null;   // 预览中水印的包围盒（CSS 像素），用于拖动命中
  var seq = 0;

  /* ==========================================================
     工具
     ========================================================== */
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    requestAnimationFrame(function () { t.classList.add('on'); });
    clearTimeout(t._tm);
    t._tm = setTimeout(function () {
      t.classList.remove('on');
      setTimeout(function () { t.hidden = true; }, 220);
    }, 1900);
  }

  function download(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 6000);
  }

  function extOf(mime) {
    return mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
  }

  function baseName(name) {
    return String(name || 'image').replace(/\.[^.]+$/, '');
  }

  /* ==========================================================
     主题
     ========================================================== */
  (function theme() {
    var saved = null;
    try { saved = localStorage.getItem('cz-theme'); } catch (e) {}
    if (!saved) saved = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', saved);
    $('#btnTheme').addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('cz-theme', next); } catch (e) {}
      render();
    });
  })();

  /* ==========================================================
     水印绘制（W/H 为画布尺寸，img 为底图）
     ========================================================== */
  function fontOf() {
    return (st.bold ? '700 ' : '400 ') + '1px ' + (FONTS[st.font] || FONTS.system);
  }

  function measure(W, H) {
    var unit = Math.min(W, H);
    var px = Math.max(1, (st.size / 1000) * unit);
    ctx.save();
    ctx.font = (st.bold ? '700 ' : '400 ') + px + 'px ' + (FONTS[st.font] || FONTS.system);
    if ('letterSpacing' in ctx) ctx.letterSpacing = ((st.spacing / 1000) * unit) + 'px';
    var m = ctx.measureText(st.text || ' ');
    ctx.restore();
    return {
      fontPx: px,
      w: Math.max(m.width, 1),
      h: px * 1.18,
      unit: unit,
      gapPx: (st.gap / 1000) * unit,
      marginPx: (st.margin / 1000) * unit,
      strokePx: Math.max(0.5, (st.strokeW / 1000) * unit)
    };
  }

  function logoBox(W) {
    var lw = (st.logoScale / 100) * W;
    var lh = logoImg ? lw * (logoImg.naturalHeight / logoImg.naturalWidth) : lw;
    return { w: lw, h: lh };
  }

  /** 单个水印的中心点 */
  function anchorPoint(W, H) {
    var m = measure(W, H);
    var mg = m.marginPx;
    if (st.type === 'image' && logoImg) {
      var lb = logoBox(W);
      var hw = lb.w / 2, hh = lb.h / 2;
      switch (st.pos) {
        case 'tl': return { x: mg + hw, y: mg + hh };
        case 'tc': return { x: W / 2, y: mg + hh };
        case 'tr': return { x: W - mg - hw, y: mg + hh };
        case 'ml': return { x: mg + hw, y: H / 2 };
        case 'mr': return { x: W - mg - hw, y: H / 2 };
        case 'bl': return { x: mg + hw, y: H - mg - hh };
        case 'bc': return { x: W / 2, y: H - mg - hh };
        case 'br': return { x: W - mg - hw, y: H - mg - hh };
        default: return { x: st.custom.x * W, y: st.custom.y * H };
      }
    }
    var hw2 = m.w / 2, hh2 = m.h / 2;
    switch (st.pos) {
      case 'tl': return { x: mg + hw2, y: mg + hh2 };
      case 'tc': return { x: W / 2, y: mg + hh2 };
      case 'tr': return { x: W - mg - hw2, y: mg + hh2 };
      case 'ml': return { x: mg + hw2, y: H / 2 };
      case 'mr': return { x: W - mg - hw2, y: H / 2 };
      case 'bl': return { x: mg + hw2, y: H - mg - hh2 };
      case 'bc': return { x: W / 2, y: H - mg - hh2 };
      case 'br': return { x: W - mg - hw2, y: H - mg - hh2 };
      default: return { x: st.custom.x * W, y: st.custom.y * H };
    }
  }

  function applyAlpha() {
    ctx.globalAlpha = st.opacity / 100;
  }

  function drawTextAt(x, y, rot, m) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot * Math.PI / 180);
    ctx.font = (st.bold ? '700 ' : '400 ') + m.fontPx + 'px ' + (FONTS[st.font] || FONTS.system);
    if ('letterSpacing' in ctx) ctx.letterSpacing = ((st.spacing / 1000) * m.unit) + 'px';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (st.shadow) {
      ctx.shadowColor = 'rgba(0,0,0,.45)';
      ctx.shadowBlur = m.fontPx * 0.18;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = m.fontPx * 0.06;
    }
    if (st.stroke) {
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeStyle = st.strokeColor;
      ctx.lineWidth = m.strokePx * 2;
      ctx.strokeText(st.text, 0, 0);
    }
    ctx.fillStyle = st.color;
    ctx.fillText(st.text, 0, 0);
    ctx.restore();
  }

  function drawLogoAt(x, y, W) {
    var lb = logoBox(W);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(st.logoRot * Math.PI / 180);
    ctx.drawImage(logoImg, -lb.w / 2, -lb.h / 2, lb.w, lb.h);
    ctx.restore();
    return lb;
  }

  /** 主绘制：把底图和全部水印画到 ctx */
  function drawScene(W, H, img) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    ctx.drawImage(img, 0, 0, W, H);

    if (st.type === 'image' && !logoImg) return;
    if (st.type === 'text' && !String(st.text || '').trim()) return;

    var m = measure(W, H);
    applyAlpha();

    if (st.mode === 'tile') {
      var rot = st.tileRot * Math.PI / 180;
      var diag = Math.hypot(W, H);
      var stepX, stepY;
      if (st.type === 'image' && logoImg) {
        var lb = logoBox(W);
        stepX = lb.w + m.gapPx;
        stepY = lb.h + m.gapPx * 0.9;
      } else {
        stepX = m.w + m.gapPx;
        stepY = m.h + m.gapPx * 0.75;
      }
      stepX = Math.max(stepX, 12);
      stepY = Math.max(stepY, 12);

      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.rotate(rot);
      var cols = Math.ceil(diag / stepX) + 2;
      var rows = Math.ceil(diag / stepY) + 2;
      var x0 = -diag / 2;
      var y0 = -diag / 2;
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var x = x0 + c * stepX + (r % 2 ? stepX / 2 : 0);
          var y = y0 + r * stepY;
          if (st.type === 'image' && logoImg) {
            var lbb = logoBox(W);
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(st.logoRot * Math.PI / 180);
            ctx.drawImage(logoImg, -lbb.w / 2, -lbb.h / 2, lbb.w, lbb.h);
            ctx.restore();
          } else {
            ctx.save();
            ctx.font = (st.bold ? '700 ' : '400 ') + m.fontPx + 'px ' + (FONTS[st.font] || FONTS.system);
            if ('letterSpacing' in ctx) ctx.letterSpacing = ((st.spacing / 1000) * m.unit) + 'px';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (st.shadow) {
              ctx.shadowColor = 'rgba(0,0,0,.4)';
              ctx.shadowBlur = m.fontPx * 0.16;
              ctx.shadowOffsetY = m.fontPx * 0.05;
            }
            if (st.stroke) {
              ctx.lineJoin = 'round';
              ctx.strokeStyle = st.strokeColor;
              ctx.lineWidth = m.strokePx * 2;
              ctx.strokeText(st.text, x, y);
            }
            ctx.fillStyle = st.color;
            ctx.fillText(st.text, x, y);
            ctx.restore();
          }
        }
      }
      ctx.restore();
      return;
    }

    // 单个水印
    var p = anchorPoint(W, H);
    if (st.type === 'image' && logoImg) {
      drawLogoAt(p.x, p.y, W);
    } else {
      drawTextAt(p.x, p.y, st.rotate, m);
    }
    ctx.globalAlpha = 1;
  }

  /* ==========================================================
     预览
     ========================================================== */
  function fitSize() {
    var stage = $('#stage');
    var pad = 44;
    var maxW = Math.max(120, stage.clientWidth - pad);
    var maxH = Math.max(120, stage.clientHeight - pad);
    var it = items[cur];
    if (!it) return { w: maxW, h: maxH };
    var s = Math.min(maxW / it.w, maxH / it.h, 1.6);
    return { w: Math.round(it.w * s), h: Math.round(it.h * s) };
  }

  function render() {
    var it = items[cur];
    if (!it) {
      canvas.hidden = true;
      $('#stageEmpty').hidden = false;
      lastBox = null;
      return;
    }
    canvas.hidden = false;
    $('#stageEmpty').hidden = true;

    var size = fitSize();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.style.width = size.w + 'px';
    canvas.style.height = size.h + 'px';
    canvas.width = Math.round(size.w * dpr);
    canvas.height = Math.round(size.h * dpr);

    var W = canvas.width, H = canvas.height;
    drawScene(W, H, it.img);

    // 记录水印包围盒（用于拖动命中）
    if (st.mode === 'single') {
      if (st.type === 'image' && logoImg) {
        var lb = logoBox(W);
        var p = anchorPoint(W, H);
        lastBox = { x: p.x, y: p.y, w: lb.w, h: lb.h, W: W, H: H, dpr: dpr };
      } else {
        var m = measure(W, H);
        var p2 = anchorPoint(W, H);
        lastBox = { x: p2.x, y: p2.y, w: m.w, h: m.h, W: W, H: H, dpr: dpr };
      }
    } else {
      lastBox = null;
    }
  }

  /* ==========================================================
     图片列表
     ========================================================== */
  function addFiles(fileList) {
    var arr = Array.prototype.slice.call(fileList || []).filter(function (f) {
      return /^image\//.test(f.type);
    });
    if (!arr.length) return;

    var pending = arr.length;
    arr.forEach(function (file) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        items.push({
          id: 'f' + (++seq),
          name: file.name,
          img: img,
          url: url,
          w: img.naturalWidth,
          h: img.naturalHeight
        });
        if (cur < 0) cur = 0;
        pending--;
        if (pending === 0) { renderFiles(); render(); syncButtons(); }
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        toast('有图片无法读取：' + file.name);
        pending--;
        if (pending === 0) { renderFiles(); render(); syncButtons(); }
      };
      img.src = url;
    });
  }

  function renderFiles() {
    var box = $('#files');
    box.innerHTML = items.map(function (it, i) {
      return '<div class="file' + (i === cur ? ' on' : '') + '" data-i="' + i + '" title="' + it.name + '">' +
        '<img src="' + it.url + '" alt="">' +
        '<span class="x" data-del="' + i + '">×</span>' +
        '</div>';
    }).join('');
    $('#fileCount').textContent = items.length + ' 张';
    var it = items[cur];
    $('#pvName').textContent = it ? (it.name + ' · ' + it.w + '×' + it.h) : '未选择图片';
  }

  function syncButtons() {
    var has = items.length > 0;
    $('#btnExportAll').disabled = !has;
    $('#btnExportOne').disabled = !has;
  }

  function removeAt(i) {
    var it = items[i];
    if (!it) return;
    URL.revokeObjectURL(it.url);
    items.splice(i, 1);
    if (cur >= items.length) cur = items.length - 1;
    if (cur < 0) cur = items.length ? 0 : -1;
    renderFiles(); render(); syncButtons();
  }

  /* ==========================================================
     拖动水印
     ========================================================== */
  var drag = null;

  function canvasPos(e) {
    var r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (canvas.width / r.width),
      y: (e.clientY - r.top) * (canvas.height / r.height)
    };
  }

  canvas.addEventListener('pointerdown', function (e) {
    if (!lastBox || st.mode !== 'single') return;
    var p = canvasPos(e);
    var b = lastBox;
    var padX = Math.max(b.w * 0.12, 14 * b.dpr);
    var padY = Math.max(b.h * 0.3, 14 * b.dpr);
    if (Math.abs(p.x - b.x) <= b.w / 2 + padX && Math.abs(p.y - b.y) <= b.h / 2 + padY) {
      drag = { dx: p.x - b.x, dy: p.y - b.y };
      canvas.classList.add('dragging');
      canvas.setPointerCapture(e.pointerId);
    }
  });

  canvas.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var p = canvasPos(e);
    var x = (p.x - drag.dx) / canvas.width;
    var y = (p.y - drag.dy) / canvas.height;
    st.custom.x = Math.min(1, Math.max(0, x));
    st.custom.y = Math.min(1, Math.max(0, y));
    st.pos = 'custom';
    $$('#grid9 button').forEach(function (b) { b.classList.remove('on'); });
    render();
  });

  function endDrag(e) {
    if (!drag) return;
    drag = null;
    canvas.classList.remove('dragging');
    try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
  }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  /* ==========================================================
     导出
     ========================================================== */
  function renderFull(it) {
    var c = document.createElement('canvas');
    c.width = it.w;
    c.height = it.h;
    var old = ctx;
    ctx = c.getContext('2d');
    drawScene(c.width, c.height, it.img);
    ctx = old;
    return c;
  }

  function toBlob(canvasEl) {
    return new Promise(function (resolve) {
      canvasEl.toBlob(function (b) { resolve(b); }, st.format, st.quality / 100);
    });
  }

  async function exportOne() {
    var it = items[cur];
    if (!it) return;
    var c = renderFull(it);
    var blob = await toBlob(c);
    if (!blob) { toast('导出失败，请换一种格式试试'); return; }
    download(blob, '超赞水印_' + baseName(it.name) + '.' + extOf(st.format));
    toast('已导出当前图片');
  }

  async function exportAll() {
    if (!items.length) return;
    var btn = $('#btnExportAll');
    btn.disabled = true;
    var old = btn.textContent;
    btn.textContent = '处理中…';
    try {
      var entries = [];
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var c = renderFull(it);
        var blob = await toBlob(c);
        if (blob) {
          entries.push({
            name: '超赞水印_' + baseName(it.name) + '.' + extOf(st.format),
            blob: blob
          });
        }
        btn.textContent = '处理中 ' + (i + 1) + '/' + items.length;
      }
      if (!entries.length) { toast('没有可导出的图片'); return; }
      if (entries.length === 1) {
        download(entries[0].blob, entries[0].name);
      } else {
        var zip = await makeZip(entries);
        download(zip, '超赞水印_' + stamp() + '.zip');
      }
      toast('已导出 ' + entries.length + ' 张');
    } finally {
      btn.textContent = old;
      btn.disabled = false;
    }
  }

  function stamp() {
    var d = new Date();
    var p = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '_' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds());
  }

  /* ---------- ZIP（store 模式） ---------- */
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
    for (var i = 0; i < u8.length; i++) c = CRC_TABLE[(c ^ u8[i]) & 0xFF] ^ (c >>> 8);
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
      lh.setUint16(6, 0x0800, true);
      lh.setUint16(8, 0, true);
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
     事件绑定
     ========================================================== */
  function bindRange(id, key, label, mul) {
    var el = $('#' + id);
    el.addEventListener('input', function () {
      var v = Number(el.value);
      st[key] = v;
      if (label) $('#' + label).textContent = v;
      render();
    });
  }

  function initControls() {
    // 上传
    var drop = $('#drop');
    var input = $('#fileInput');
    drop.addEventListener('click', function () { input.click(); });
    drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
    input.addEventListener('change', function () { addFiles(input.files); input.value = ''; });

    ['dragenter', 'dragover'].forEach(function (t) {
      drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('over'); });
    });
    ['dragleave', 'drop'].forEach(function (t) {
      drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove('over'); });
    });
    drop.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });

    // 图片列表
    $('#files').addEventListener('click', function (e) {
      var del = e.target.closest('[data-del]');
      if (del) { e.stopPropagation(); removeAt(Number(del.getAttribute('data-del'))); return; }
      var f = e.target.closest('[data-i]');
      if (!f) return;
      cur = Number(f.getAttribute('data-i'));
      renderFiles(); render();
    });

    // 水印类型
    $('#typeSeg').addEventListener('click', function (e) {
      var b = e.target.closest('[data-type]');
      if (!b) return;
      st.type = b.getAttribute('data-type');
      $$('#typeSeg button').forEach(function (x) { x.classList.toggle('on', x === b); });
      $('#paneText').hidden = st.type !== 'text';
      $('#paneImage').hidden = st.type !== 'image';
      render();
    });

    // 文字
    $('#text').addEventListener('input', function () { st.text = $('#text').value; render(); });
    bindRange('size', 'size', 'vSize');
    bindRange('spacing', 'spacing', 'vSpacing');
    bindRange('opacity', 'opacity', 'vOpacity');
    bindRange('rotate', 'rotate', 'vRotate');
    bindRange('strokeW', 'strokeW', 'vStroke');
    bindRange('margin', 'margin', 'vMargin');
    bindRange('gap', 'gap', 'vGap');
    bindRange('tileRot', 'tileRot', 'vTileRot');
    bindRange('logoScale', 'logoScale', 'vLogoScale');
    bindRange('logoRot', 'logoRot', 'vLogoRot');
    bindRange('quality', 'quality', 'vQuality');

    $('#font').addEventListener('change', function () { st.font = $('#font').value; render(); });
    $('#bold').addEventListener('change', function () { st.bold = $('#bold').checked; render(); });
    $('#shadow').addEventListener('change', function () { st.shadow = $('#shadow').checked; render(); });
    $('#stroke').addEventListener('change', function () {
      st.stroke = $('#stroke').checked;
      $('#strokeRow').hidden = !st.stroke;
      render();
    });

    // 颜色
    function bindColor(pickerId, hexId, key) {
      var p = $('#' + pickerId), h = $('#' + hexId);
      p.addEventListener('input', function () { st[key] = p.value; h.value = p.value.toUpperCase(); render(); });
      h.addEventListener('change', function () {
        var v = h.value.trim();
        if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) { h.value = st[key].toUpperCase(); return; }
        if (v.length === 4) v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
        st[key] = v; p.value = v; h.value = v.toUpperCase(); render();
      });
    }
    bindColor('color', 'colorHex', 'color');
    bindColor('strokeColor', 'strokeHex', 'strokeColor');

    // 九宫格
    $('#grid9').addEventListener('click', function (e) {
      var b = e.target.closest('[data-pos]');
      if (!b) return;
      st.pos = b.getAttribute('data-pos');
      $$('#grid9 button').forEach(function (x) { x.classList.toggle('on', x === b); });
      render();
    });

    // 单个 / 平铺
    $('#modeSeg').addEventListener('click', function (e) {
      var b = e.target.closest('[data-mode]');
      if (!b) return;
      st.mode = b.getAttribute('data-mode');
      $$('#modeSeg button').forEach(function (x) { x.classList.toggle('on', x === b); });
      $('#tileRow').hidden = st.mode !== 'tile';
      render();
    });

    // 水印图片
    var logoDrop = $('#logoDrop');
    var logoInput = $('#logoInput');
    logoDrop.addEventListener('click', function () { logoInput.click(); });
    logoInput.addEventListener('change', function () {
      var f = logoInput.files && logoInput.files[0];
      logoInput.value = '';
      if (!f) return;
      var img = new Image();
      img.onload = function () {
        logoImg = img;
        $('#logoName').textContent = f.name;
        render();
      };
      img.onerror = function () { toast('水印图片无法读取'); };
      img.src = URL.createObjectURL(f);
    });

    // 格式 / 画质
    $('#format').addEventListener('change', function () {
      st.format = $('#format').value;
      $('#qualityRow').hidden = st.format === 'image/png';
    });

    // 导出
    $('#btnExportOne').addEventListener('click', exportOne);
    $('#btnExportAll').addEventListener('click', exportAll);
    $('#btnFit').addEventListener('click', render);
    $('#btnClear').addEventListener('click', function () {
      items.forEach(function (it) { URL.revokeObjectURL(it.url); });
      items = []; cur = -1;
      renderFiles(); render(); syncButtons();
      toast('已清空');
    });

    window.addEventListener('resize', function () { render(); });
  }

  /* ==========================================================
     启动
     ========================================================== */
  initControls();
  renderFiles();
  render();
  syncButtons();
})();

/* ==========================================================
   排版引擎：布局计算 + Canvas 绘制
   设计稿宽度固定 1080px，导出时按倍数放大
   ========================================================== */
(function () {
  var PB = (window.PB = window.PB || {});

  var DOC_W = 1080;
  var FONT_STACK = '"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Source Han Sans SC",system-ui,sans-serif';

  var mcv = document.createElement('canvas');
  var mctx = mcv.getContext('2d');

  function fontStr(size, bold) {
    return (bold ? '700 ' : '400 ') + size + 'px ' + FONT_STACK;
  }

  /* ---------- 文本折行 ---------- */
  function tokenize(para) {
    var tokens = [];
    var buf = '';
    for (var i = 0; i < para.length; i++) {
      var ch = para[i];
      if (/[\x00-\x7F]/.test(ch) && !/\s/.test(ch)) {
        buf += ch;
      } else {
        if (buf) { tokens.push(buf); buf = ''; }
        tokens.push(ch);
      }
    }
    if (buf) tokens.push(buf);
    return tokens;
  }

  function wrapText(text, size, bold, maxW) {
    mctx.font = fontStr(size, bold);
    var out = [];
    var paras = String(text == null ? '' : text).split('\n');
    for (var p = 0; p < paras.length; p++) {
      var para = paras[p];
      if (!para) { out.push(''); continue; }
      var tokens = tokenize(para);
      var line = '';
      for (var i = 0; i < tokens.length; i++) {
        var t = line + tokens[i];
        if (line && mctx.measureText(t).width > maxW) {
          out.push(line);
          line = tokens[i] === ' ' ? '' : tokens[i];
        } else {
          line = t;
        }
      }
      out.push(line);
    }
    return out;
  }

  PB.wrapText = wrapText;

  /* ---------- 圆角矩形 ---------- */
  function roundRect(ctx, x, y, w, h, r) {
    var rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    ctx.beginPath();
    if (rr <= 0) {
      ctx.rect(x, y, w, h);
      return;
    }
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.arcTo(x + w, y, x + w, y + rr, rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
    ctx.lineTo(x + rr, y + h);
    ctx.arcTo(x, y + h, x, y + h - rr, rr);
    ctx.lineTo(x, y + rr);
    ctx.arcTo(x, y, x + rr, y, rr);
    ctx.closePath();
  }
  PB.roundRect = roundRect;

  function aspectOf(img) {
    if (!img || !img.height) return 1;
    return img.width / img.height;
  }

  function parasOf(text) {
    return String(text || '')
      .split(/\n\s*\n/)
      .map(function (s) { return s.trim(); })
      .filter(Boolean);
  }

  /* ==========================================================
     布局
     ========================================================== */
  PB.computeLayout = function (doc) {
    var tpl = PB.getTemplate(doc.template);
    var W = DOC_W;
    var pad = doc.padding;
    var contentW = W - pad * 2;

    var gapTop = tpl.seamless ? 0 : doc.gapTop;
    var gapBottom = tpl.seamless ? 0 : doc.gapBottom;
    var gapX = tpl.seamless ? 0 : doc.gapX;
    var radius = tpl.seamless ? 0 : doc.radius;
    var shadow = tpl.seamless ? 0 : doc.shadow;
    var cardPad = tpl.card ? 14 : 0;

    var items = [];
    var y = pad + doc.blankTop;
    var st = doc.style;

    function addText(text, extraGap) {
      if (!text || !String(text).trim()) return;
      var lines = wrapText(text, st.size, st.bold, contentW);
      var lh = Math.round(st.size * st.lineHeight);
      items.push({
        type: 'text',
        x: pad,
        y: y,
        w: contentW,
        lines: lines,
        size: st.size,
        lh: lh,
        color: st.color,
        bold: st.bold,
        align: st.align
      });
      y += lines.length * lh;
      if (extraGap) y += extraGap;
    }

    // 上文案
    if (doc.textTop && doc.textTop.trim()) {
      addText(doc.textTop, 0);
      y += gapTop;
    }

    var imgs = doc.images || [];
    var interleaveParas = tpl.interleave ? parasOf(doc.textBottom) : null;
    var usedPara = 0;

    function flushPara() {
      if (!interleaveParas) return;
      if (usedPara >= interleaveParas.length) return;
      addText(interleaveParas[usedPara++], 0);
      y += gapBottom;
    }

    /* ---------- 瀑布流 ---------- */
    if (tpl.masonry && imgs.length) {
      var cols = 2;
      var colW = (contentW - gapX * (cols - 1)) / cols;
      var colH = [y, y];
      for (var i = 0; i < imgs.length; i++) {
        var c = colH[0] <= colH[1] ? 0 : 1;
        var im = imgs[i];
        var h = Math.round(colW / aspectOf(im.el));
        items.push({
          type: 'image',
          x: pad + c * (colW + gapX),
          y: colH[c],
          w: colW,
          h: h,
          img: im.el,
          radius: radius,
          shadow: shadow,
          card: 0
        });
        colH[c] += h + (c === 0 ? 0 : 0) + gapBottom + gapTop;
      }
      y = Math.max(colH[0], colH[1]) - (gapBottom + gapTop);
      if (y < pad) y = pad;
    } else if (imgs.length) {
      /* ---------- 规则网格 ---------- */
      var rows = PB.rowsFor(tpl, imgs.length);
      for (var r = 0; r < rows.length; r++) {
        var row = rows[r];
        var slots = row.pat.length;
        var n = row.idxs.length;
        var wsum = row.pat.reduce(function (a, b) { return a + b; }, 0);
        var fullW = contentW - gapX * (slots - 1);

        var cells = [];
        for (var k = 0; k < n; k++) cells.push(fullW * row.pat[k] / wsum);
        var rowW = cells.reduce(function (a, b) { return a + b; }, 0) + gapX * (n - 1);
        var x0 = pad + (contentW - rowW) / 2;

        // 行高：取平均宽高比
        var aspectSum = 0;
        for (var q = 0; q < n; q++) aspectSum += aspectOf(imgs[row.idxs[q]].el);
        var avgAspect = aspectSum / n;
        var avgW = rowW / n;
        var cellH = avgW / (avgAspect || 1);
        if (n > 1) {
          cellH = Math.min(Math.max(cellH, avgW * 0.55), avgW * 1.7);
        }
        cellH = Math.round(cellH);

        var rowH = cellH + cardPad * 2;

        y += gapTop;
        var x = x0;
        for (var j = 0; j < n; j++) {
          var cw = Math.round(cells[j]);
          items.push({
            type: 'image',
            x: Math.round(x),
            y: y,
            w: cw,
            h: rowH,
            img: imgs[row.idxs[j]].el,
            radius: radius,
            shadow: shadow,
            card: cardPad
          });
          x += cw + gapX;
        }
        y += rowH + gapBottom;

        flushPara();
      }
    }

    // 剩余文案
    if (interleaveParas) {
      while (usedPara < interleaveParas.length) {
        addText(interleaveParas[usedPara++], 0);
        y += gapBottom;
      }
    } else if (doc.textBottom && doc.textBottom.trim()) {
      y += gapTop;
      addText(doc.textBottom, 0);
    }

    y += doc.blankBottom + pad;
    if (items.length === 0) y = Math.max(y, 420);

    var H = Math.max(200, Math.round(y));

    return {
      width: W,
      height: H,
      items: items,
      doc: doc
    };
  };

  /* ==========================================================
     绘制
     ========================================================== */
  function drawCover(ctx, img, x, y, w, h) {
    var ar = aspectOf(img);
    var cr = w / h;
    var sw, sh, sx, sy;
    if (ar > cr) {
      sh = img.height;
      sw = sh * cr;
      sx = (img.width - sw) / 2;
      sy = 0;
    } else {
      sw = img.width;
      sh = sw / cr;
      sx = 0;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  PB.paint = function (ctx, L, doc, scale) {
    var s = scale || 1;
    var W = L.width;
    var H = L.height;

    ctx.clearRect(0, 0, W, H);

    /* ---- 背景 ---- */
    var bgR = doc.bg.radius || 0;
    ctx.save();
    roundRect(ctx, 0, 0, W, H, bgR);
    ctx.clip();

    if (doc.bg.img) {
      drawCover(ctx, doc.bg.img, 0, 0, W, H);
    } else {
      ctx.fillStyle = doc.bg.color || '#ffffff';
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();

    /* ---- 内容 ---- */
    for (var i = 0; i < L.items.length; i++) {
      var it = L.items[i];

      if (it.type === 'text') {
        ctx.save();
        ctx.font = fontStr(it.size, it.bold);
        ctx.fillStyle = it.color;
        ctx.textBaseline = 'top';
        ctx.textAlign = it.align === 'center' ? 'center' : it.align === 'right' ? 'right' : 'left';
        var tx = it.align === 'center' ? it.x + it.w / 2 : it.align === 'right' ? it.x + it.w : it.x;
        for (var li = 0; li < it.lines.length; li++) {
          var line = it.lines[li];
          if (!line) continue;
          ctx.fillText(line, tx, it.y + li * it.lh + (it.lh - it.size) / 2);
        }
        ctx.restore();
        continue;
      }

      if (it.type === 'image') {
        var cp = it.card || 0;
        var cardR = it.radius + (cp ? 8 : 0);

        // 阴影（先画一个不透明底板投影，再覆盖图片）
        if (it.shadow > 0) {
          ctx.save();
          ctx.shadowColor = 'rgba(18, 22, 40, 0.30)';
          ctx.shadowBlur = it.shadow * s * 2.1;
          ctx.shadowOffsetY = it.shadow * s * 0.45;
          ctx.fillStyle = cp ? (doc.cardColor || '#ffffff') : (doc.bg.img ? '#ffffff' : (doc.bg.color || '#ffffff'));
          roundRect(ctx, it.x, it.y, it.w, it.h, cardR);
          ctx.fill();
          ctx.restore();
        }

        if (cp) {
          ctx.save();
          ctx.fillStyle = doc.cardColor || '#ffffff';
          roundRect(ctx, it.x, it.y, it.w, it.h, cardR);
          ctx.fill();
          ctx.restore();
        }

        var ix = it.x + cp;
        var iy = it.y + cp;
        var iw = it.w - cp * 2;
        var ih = it.h - cp * 2;

        ctx.save();
        roundRect(ctx, ix, iy, iw, ih, it.radius);
        ctx.clip();
        drawCover(ctx, it.img, ix, iy, iw, ih);
        ctx.restore();
      }
    }
  };

  /* ==========================================================
     离屏渲染（导出）
     ========================================================== */
  var MAX_SIDE = 16384;

  PB.renderToCanvas = function (doc, scale) {
    var L = PB.computeLayout(doc);
    var s = scale || 1;

    // 超出浏览器画布上限时自动降级
    while (s > 1 && (L.height * s > MAX_SIDE || L.width * s > MAX_SIDE)) {
      s = Math.floor(s * 0.8 * 10) / 10;
      if (s < 1) { s = 1; break; }
    }

    var cv = document.createElement('canvas');
    cv.width = Math.round(L.width * s);
    cv.height = Math.round(L.height * s);
    var ctx = cv.getContext('2d');
    ctx.scale(s, s);
    PB.paint(ctx, L, doc, s);
    return { canvas: cv, layout: L, scale: s };
  };
})();

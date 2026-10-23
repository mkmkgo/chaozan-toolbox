/* ==========================================================
   封面制作：拖拽 + 缩放 + 裁切导出
   ========================================================== */
(function () {
  var PB = (window.PB = window.PB || {});

  var $ = function (s) { return document.querySelector(s); };

  var cv, ctx, wrap;
  var st = {
    img: null,
    ratio: 2.35,
    zoom: 100,
    ox: 0,
    oy: 0,
    radius: 0,
    outW: 1080
  };

  var vw = 0;
  var vh = 0;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function viewSize() {
    var scroll = cv.parentNode.parentNode; // .stage-scroll
    var availW = Math.max(240, scroll.clientWidth - 56);
    var availH = Math.max(160, scroll.clientHeight - 56);
    var w = Math.min(availW, availH * st.ratio, 980);
    return { w: Math.round(w), h: Math.round(w / st.ratio) };
  }

  function resize() {
    var s = viewSize();
    vw = s.w;
    vh = s.h;
    cv.style.width = vw + 'px';
    cv.style.height = vh + 'px';
    cv.width = Math.round(vw * dpr);
    cv.height = Math.round(vh * dpr);
    draw();
  }

  function baseScale() {
    if (!st.img) return 1;
    return Math.max(vw / st.img.width, vh / st.img.height);
  }

  function effScale() {
    return baseScale() * (st.zoom / 100);
  }

  function clampOffset() {
    if (!st.img) return;
    var s = effScale();
    var dw = st.img.width * s;
    var dh = st.img.height * s;
    var maxX = Math.max(0, (dw - vw) / 2);
    var maxY = Math.max(0, (dh - vh) / 2);
    st.ox = Math.max(-maxX, Math.min(maxX, st.ox));
    st.oy = Math.max(-maxY, Math.min(maxY, st.oy));
  }

  function paintInto(c, cssW, cssH, ratio) {
    var s = effScale();
    var dw = st.img.width * s;
    var dh = st.img.height * s;
    var dx = (cssW - dw) / 2 + st.ox * ratio;
    var dy = (cssH - dh) / 2 + st.oy * ratio;

    c.save();
    PB.roundRect(c, 0, 0, cssW, cssH, st.radius * ratio);
    c.clip();
    c.imageSmoothingQuality = 'high';
    c.drawImage(st.img, dx, dy, dw, dh);
    c.restore();
  }

  function draw() {
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, vw, vh);

    if (!st.img) {
      ctx.save();
      ctx.fillStyle = 'rgba(140,145,170,.10)';
      ctx.fillRect(0, 0, vw, vh);
      ctx.restore();
      return;
    }
    clampOffset();
    paintInto(ctx, vw, vh, 1);
  }

  /* ---------- 交互 ---------- */
  var dragging = false;
  var lastX = 0;
  var lastY = 0;

  function onDown(e) {
    if (!st.img) return;
    dragging = true;
    var p = e.touches ? e.touches[0] : e;
    lastX = p.clientX;
    lastY = p.clientY;
    cv.setPointerCapture && e.pointerId != null && cv.setPointerCapture(e.pointerId);
    e.preventDefault();
  }

  function onMove(e) {
    if (!dragging) return;
    var p = e.touches ? e.touches[0] : e;
    st.ox += p.clientX - lastX;
    st.oy += p.clientY - lastY;
    lastX = p.clientX;
    lastY = p.clientY;
    draw();
    e.preventDefault();
  }

  function onUp() { dragging = false; }

  function onWheel(e) {
    if (!st.img) return;
    e.preventDefault();
    var delta = e.deltaY > 0 ? -6 : 6;
    st.zoom = Math.max(50, Math.min(400, st.zoom + delta));
    $('#coverZoom').value = st.zoom;
    $('#vCoverZoom').textContent = st.zoom + '%';
    draw();
  }

  function loadFile(file) {
    if (!file || !/^image\//.test(file.type)) return;
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      st.img = img;
      st.zoom = 100;
      st.ox = 0;
      st.oy = 0;
      $('#coverZoom').value = 100;
      $('#vCoverZoom').textContent = '100%';
      URL.revokeObjectURL(url);
      resize();
      updateInfo();
    };
    img.src = url;
  }

  function updateInfo() {
    var el = $('#coverInfo');
    if (!st.img) { el.textContent = '—'; return; }
    el.textContent = '原图 ' + st.img.width + ' × ' + st.img.height +
      ' · 导出 ' + st.outW + ' × ' + Math.round(st.outW / st.ratio);
  }

  function exportCover() {
    if (!st.img) { PB.toast('请先上传一张图片', true); return; }
    var outH = Math.round(st.outW / st.ratio);
    var c = document.createElement('canvas');
    c.width = st.outW;
    c.height = outH;
    var g = c.getContext('2d');
    g.imageSmoothingQuality = 'high';
    var ratio = st.outW / vw;
    paintInto(g, st.outW, outH, ratio);
    c.toBlob(function (blob) {
      if (!blob) { PB.toast('导出失败，请重试', true); return; }
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'cover-' + st.outW + 'x' + outH + '.png';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      PB.toast('封面已导出');
    }, 'image/png');
  }

  /* ---------- 初始化 ---------- */
  PB.Cover = {
    init: function () {
      cv = $('#coverCv');
      if (!cv) return;
      ctx = cv.getContext('2d');
      wrap = $('#coverWrap');

      cv.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      cv.addEventListener('wheel', onWheel, { passive: false });

      var input = $('#coverInput');
      var drop = $('#coverDrop');
      drop.addEventListener('click', function () { input.click(); });
      input.addEventListener('change', function () {
        if (input.files && input.files[0]) loadFile(input.files[0]);
        input.value = '';
      });
      drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('dragover'); });
      drop.addEventListener('dragleave', function () { drop.classList.remove('dragover'); });
      drop.addEventListener('drop', function (e) {
        e.preventDefault();
        drop.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
      });

      $('#coverZoom').addEventListener('input', function () {
        st.zoom = Number(this.value);
        $('#vCoverZoom').textContent = st.zoom + '%';
        draw();
      });

      $('#coverRadius').addEventListener('input', function () {
        st.radius = Number(this.value);
        $('#vCoverRadius').textContent = st.radius + 'px';
        draw();
      });

      $('#ratioGrid').addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        [].forEach.call(this.children, function (x) { x.classList.remove('is-on'); });
        b.classList.add('is-on');
        st.ratio = Number(b.dataset.ratio);
        st.ox = 0;
        st.oy = 0;
        resize();
        updateInfo();
      });

      $('#coverWidth').addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        [].forEach.call(this.children, function (x) { x.classList.remove('is-on'); });
        b.classList.add('is-on');
        st.outW = Number(b.dataset.w);
        updateInfo();
      });

      $('#coverFit').addEventListener('click', function () {
        st.zoom = 100;
        st.ox = 0;
        st.oy = 0;
        $('#coverZoom').value = 100;
        $('#vCoverZoom').textContent = '100%';
        draw();
      });

      $('#coverCenter').addEventListener('click', function () {
        st.ox = 0;
        st.oy = 0;
        draw();
      });

      $('#coverFromFirst').addEventListener('click', function () {
        var first = PB.getFirstImage && PB.getFirstImage();
        if (!first) { PB.toast('排版里还没有图片', true); return; }
        st.img = first;
        st.zoom = 100;
        st.ox = 0;
        st.oy = 0;
        $('#coverZoom').value = 100;
        $('#vCoverZoom').textContent = '100%';
        resize();
        updateInfo();
      });

      $('#coverExport').addEventListener('click', exportCover);

      window.addEventListener('resize', function () {
        if ($('#viewCover').hidden) return;
        resize();
      });
    },

    /** 从排版视图切过来时重新计算尺寸 */
    activate: function () {
      if (!cv) return;
      requestAnimationFrame(function () { resize(); updateInfo(); });
    }
  };
})();

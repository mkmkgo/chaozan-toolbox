/**
 * 超赞排版 — 主逻辑
 *
 * 状态 → 渲染 → 交互 的单向流：
 *   用户操作改 state，再调 render()（重建 DOM）或 applyParams()（原地改样式）。
 *   拖动滑块这类高频操作用 applyParams()，避免整棵树重建导致卡顿与选中丢失。
 */
(function () {
  'use strict';

  var TPL = window.PB_TEMPLATES || [];
  var R = window.PBRender;
  var S = window.PBSelect;
  var E = window.PBExport;

  /* ============================================================
     状态（默认值取自原站 PostsData[0]）
     ============================================================ */

  var STORE_KEY = 'cz-paiban-v3';

  /** 原站默认模板：id=2「三图模板不带阴影」，空态就是 3 列灰块 */
  var DEFAULT_TPL_ID = 2;
  /** 空态重复几轮撑满手机预览（3 图 × 6 轮 = 18 个灰块，最后一排露一半） */
  var EMPTY_ROUNDS = 6;

  function defaultState() {
    return {
      images: [],
      tplId: DEFAULT_TPL_ID,
      title: '',
      radiusOn: false,
      radius: { all: 0, top_left: 0, top_right: 0, bottom_right: 0, bottom_left: 0 },
      shadowOn: false,
      shadow: { left_or_right: 0, top_or_bottom: 3, range: 6, color: '#bab7b7' },
      margin: { top: 0, bottom: 0 },
      paddingOn: false,
      padding: { all: 0, top: 0, bottom: 0, left: 0, right: 0 },
      bgUrl: '',
      bgRadius: { all: 0 },
      bgColor: '#ffffff',
      bgColorOn: false,
      protect: false,
      star: false,
      end: false,
      ad: false,
      adText: '',
      wenan: {
        text: '',
        pos: 'after',
        fontSize: 14,
        lineHeight: 17,
        letterSpacing: 0,
        color: '#000000',
        align: 'center',
        weight: 'normal',
        padding: 0,
      },
    };
  }

  var state = defaultState();
  var pageRoot = null;
  var tplCat = 'all';

  /* ============================================================
     小工具
     ============================================================ */

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return [].slice.call(document.querySelectorAll(sel)); }

  var elPageBox, elPhone, elMidHint, elImgList, elImgListBody, elImgCount;
  var elLeftEmpty, elDropZone, elFileInput;

  var uidSeed = 1;
  function uid() { return 'i' + Date.now().toString(36) + (uidSeed++); }

  var toastTimer = null;
  function toast(msg, isErr) {
    var el = $('#toast');
    el.textContent = msg;
    el.classList.toggle('is-err', !!isErr);
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, isErr ? 3400 : 2000);
  }

  function loadImageSize(url) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve({ w: img.naturalWidth, h: img.naturalHeight }); };
      img.onerror = function () { resolve({ w: 0, h: 0 }); };
      img.src = url;
    });
  }

  function currentTpl() {
    if (!TPL.length) return null;
    return TPL.filter(function (t) { return t.id === state.tplId; })[0] || TPL[0];
  }

  function openModal(sel) {
    $(sel).hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeModal(sel) {
    $(sel).hidden = true;
    document.body.style.overflow = '';
  }

  /* ============================================================
     渲染
     ============================================================ */

  function render() {
    var tpl = currentTpl();

    // 没有图片时用灰色占位图撑起模板骨架，和原站的空态预览一致（3 列 × 5 行）
    var list = state.images;
    if (!list.length) {
      var per = tpl ? (R.slots(R.parse(tpl.html)).length || tpl.imgs || 1) : 1;
      list = [];
      for (var i = 0; i < per * EMPTY_ROUNDS; i++) {
        list.push({ id: 'ph' + i, url: './assets/ph.svg', w: 300, h: 300 });
      }
    }

    var root = R.render(tpl, list, state);
    root.id = 'pageBox';
    pageRoot = root;

    if (elPageBox && elPageBox.parentNode) {
      elPageBox.parentNode.replaceChild(root, elPageBox);
    } else {
      elPhone.appendChild(root);
    }
    elPageBox = root;

    S.rebind(root);
    S.bind(root, onSelect);

    updateMeta();
  }

  function applyParams() {
    if (!pageRoot) return;
    R.applyAll(pageRoot, state);
    updateMeta();
  }

  function updateMeta() {
    // 原站这行只有「文章背景」「行间距」两个词，不显示数值
    elMidHint.hidden = state.images.length > 0;
    updateAdCount();
  }

  /* ============================================================
     智能广告
     ============================================================ */

  function updateAdCount() {
    var el = $('#adCount');
    if (!el) return;
    var n = String(state.adText || '').trim().length;
    if (!n) { el.textContent = ''; return; }
    el.textContent = '当前字数:' + n + ' 覆盖:' + Math.round(n / 300) + '行图片';
  }

  function syncAdUI() {
    var box = $('#adBox');
    var label = $('#adLabel');
    var ta = $('#adText');
    if (box) box.hidden = !state.ad;
    if (label) label.textContent = state.ad ? '已启用' : '点击启用';
    if (ta && ta.value !== (state.adText || '')) ta.value = state.adText || '';
    updateAdCount();
  }

  /* ============================================================
     选中浮动条
     ============================================================ */

  function onSelect(cur) {
    var bar = $('#selBar');
    if (!cur) { if (bar) bar.remove(); return; }

    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'selBar';
      bar.className = 'sel-bar';
      bar.innerHTML =
        '<span class="sel-label"></span>' +
        '<button data-a="up" title="上移">↑</button>' +
        '<button data-a="down" title="下移">↓</button>' +
        '<button data-a="del" title="删除">×</button>';
      document.body.appendChild(bar);
      bar.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        var a = b.getAttribute('data-a');
        if (a === 'del') { S.remove(); render(); }
        else if (S.move(a === 'up' ? -1 : 1)) render();
      });
    }

    var label = {
      insert: '插入块', row: '图片行', card: '卡片',
      wenan: '文案块', infer: '内容块', child: '内容块',
    };
    bar.querySelector('.sel-label').textContent = label[cur.type] || '内容块';

    var r = cur.el.getBoundingClientRect();
    bar.style.top = Math.max(8, r.top - 36) + 'px';
    bar.style.left = (r.left + r.width / 2) + 'px';
    bar.hidden = false;
  }

  /* ============================================================
     图片
     ============================================================ */

  function addFiles(files) {
    var list = [].slice.call(files || []).filter(function (f) {
      return /^image\//.test(f.type) && !/heic|heif/i.test(f.type);
    });
    if (!list.length) { toast('请选择图片文件', true); return; }

    toast('正在读取 ' + list.length + ' 张图片…');

    Promise.all(
      list.map(function (f) {
        return new Promise(function (resolve) {
          var url = URL.createObjectURL(f);
          loadImageSize(url).then(function (size) {
            resolve({ id: uid(), url: url, w: size.w, h: size.h, name: f.name });
          });
        });
      })
    ).then(function (items) {
      state.images = state.images.concat(items);
      afterImagesChange();
      toast('已添加 ' + items.length + ' 张图片');
    });
  }

  function afterImagesChange() {
    renderThumbs();
    updateLayoutMode();
    render();
  }

  function updateLayoutMode() {
    var has = state.images.length > 0;
    elLeftEmpty.hidden = has;
    elImgList.hidden = !has;
  }

  function renderThumbs() {
    elImgCount.textContent = state.images.length;
    elImgListBody.innerHTML = '';
    state.images.forEach(function (item, i) {
      var d = document.createElement('div');
      d.className = 'thumb';
      d.draggable = true;
      d.dataset.id = item.id;
      d.innerHTML =
        '<img src="' + item.url + '" alt="">' +
        '<span class="thumb-idx">' + (i + 1) + '</span>' +
        '<button class="thumb-x" data-del="' + item.id + '" title="移除">×</button>';
      elImgListBody.appendChild(d);
    });
  }

  var dragId = null;
  function bindThumbDrag() {
    elImgListBody.addEventListener('dragstart', function (e) {
      var t = e.target.closest('.thumb');
      if (!t) return;
      dragId = t.dataset.id;
      t.classList.add('is-drag');
      e.dataTransfer.effectAllowed = 'move';
    });
    elImgListBody.addEventListener('dragend', function (e) {
      var t = e.target.closest('.thumb');
      if (t) t.classList.remove('is-drag');
      $$('.thumb.is-over').forEach(function (n) { n.classList.remove('is-over'); });
      dragId = null;
    });
    elImgListBody.addEventListener('dragover', function (e) {
      var t = e.target.closest('.thumb');
      if (!t || !dragId) return;
      e.preventDefault();
      $$('.thumb.is-over').forEach(function (n) { n.classList.remove('is-over'); });
      if (t.dataset.id !== dragId) t.classList.add('is-over');
    });
    elImgListBody.addEventListener('drop', function (e) {
      var t = e.target.closest('.thumb');
      if (!t || !dragId) return;
      e.preventDefault();
      var from = state.images.findIndex(function (x) { return x.id === dragId; });
      var to = state.images.findIndex(function (x) { return x.id === t.dataset.id; });
      if (from < 0 || to < 0 || from === to) return;
      var moved = state.images.splice(from, 1)[0];
      state.images.splice(to, 0, moved);
      afterImagesChange();
    });

    elImgListBody.addEventListener('click', function (e) {
      var b = e.target.closest('[data-del]');
      if (!b) return;
      var id = b.getAttribute('data-del');
      var idx = state.images.findIndex(function (x) { return x.id === id; });
      if (idx < 0) return;
      URL.revokeObjectURL(state.images[idx].url);
      state.images.splice(idx, 1);
      afterImagesChange();
    });
  }

  /* ============================================================
     模板面板
     ============================================================ */

  function tplFiltered() {
    if (tplCat === 'all') return TPL;
    if (tplCat === 'many') return TPL.filter(function (t) { return t.imgs >= 5; });
    return TPL.filter(function (t) { return t.imgs === Number(tplCat); });
  }

  function buildTplGrid() {
    var grid = $('#tplGrid');
    var list = tplFiltered();
    grid.innerHTML = '';

    if (!list.length) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#9AA0AC;padding:40px 0;font-size:13px">这个分类下还没有模板</p>';
      return;
    }

    var imgs = state.images.length
      ? state.images
      : [{ id: 'ph', url: './assets/ph.svg', w: 300, h: 300 }];

    list.forEach(function (t) {
      var card = document.createElement('div');
      card.className = 'tpl-card' + (t.id === state.tplId ? ' is-on' : '');
      card.dataset.id = t.id;

      var name = document.createElement('div');
      name.className = 'tpl-name';
      name.innerHTML = '<span>' + t.title + '</span><em>' + t.imgs + ' 图</em>';

      var sub = document.createElement('div');
      sub.className = 'tpl-sub';
      sub.innerHTML = '<span>超赞排版</span><span>序号:' + t.id + '</span>';

      var prev = document.createElement('div');
      prev.className = 'tpl-prev';
      var inner = document.createElement('div');
      inner.className = 'tpl-prev-inner';
      prev.appendChild(inner);

      card.appendChild(name);
      card.appendChild(sub);
      card.appendChild(prev);
      grid.appendChild(card);

      var root = R.renderTemplate(t, imgs);
      root.style.width = '300px';
      inner.appendChild(root);

      requestAnimationFrame(function () {
        var box = prev.getBoundingClientRect();
        var k = (box.width - 16) / 300;
        if (!k || k <= 0) k = 0.6;
        inner.style.transform = 'scale(' + k.toFixed(4) + ')';
        inner.style.width = '300px';
        inner.style.height = (100 / k).toFixed(1) + '%';
      });
    });

    grid.onclick = function (e) {
      var card = e.target.closest('.tpl-card');
      if (!card) return;
      state.tplId = Number(card.dataset.id);
      closeModal('#mTpl');
      render();
      toast('已应用模板：' + currentTpl().title);
    };
  }

  /* ============================================================
     参数绑定
     ============================================================ */

  /** 滑块数值同步（滑块 + 数字都在 .slider-col 里） */
  function setSliderVal(el, v, unit) {
    var col = el.closest('.slider-col');
    if (col) {
      var b = col.querySelector('b');
      if (b) b.textContent = v + (unit || '');
    }
    // 填充色
    var min = Number(el.min) || 0;
    var max = Number(el.max) || 100;
    var pct = max > min ? ((v - min) / (max - min)) * 100 : 0;
    el.classList.add('is-fill');
    el.style.setProperty('--fill', pct.toFixed(1) + '%');
  }

  function bindSwitch(id, panelId, key, after) {
    var input = $(id);
    if (!input) return;
    input.addEventListener('change', function () {
      state[key] = input.checked;
      if (panelId) $(panelId).classList.toggle('is-open', input.checked);
      applyParams();
      if (after) after(input.checked);
    });
  }

  function bindSliders() {
    $$('[data-radius]').forEach(function (el) {
      el.addEventListener('input', function () {
        var k = el.getAttribute('data-radius');
        var v = Number(el.value);
        state.radius[k] = v;
        if (k === 'all') {
          ['top_left', 'top_right', 'bottom_right', 'bottom_left'].forEach(function (c) {
            state.radius[c] = v;
            var s = document.querySelector('[data-radius="' + c + '"]');
            if (s) { s.value = v; setSliderVal(s, v, 'px'); }
          });
        }
        setSliderVal(el, v, 'px');
        applyParams();
      });
    });

    $$('[data-shadow]').forEach(function (el) {
      el.addEventListener('input', function () {
        var k = el.getAttribute('data-shadow');
        var v = Number(el.value);
        state.shadow[k] = v;
        setSliderVal(el, v, 'px');
        applyParams();
      });
    });

    $$('[data-margin]').forEach(function (el) {
      el.addEventListener('input', function () {
        var k = el.getAttribute('data-margin');
        var v = Number(el.value);
        state.margin[k] = v;
        setSliderVal(el, v, 'px');
        applyParams();
      });
    });

    $$('[data-padding]').forEach(function (el) {
      el.addEventListener('input', function () {
        var k = el.getAttribute('data-padding');
        var v = Number(el.value);
        state.padding[k] = v;
        if (k === 'all') {
          ['top', 'right', 'bottom', 'left'].forEach(function (c) {
            state.padding[c] = v;
            var s = document.querySelector('[data-padding="' + c + '"]');
            if (s) { s.value = v; setSliderVal(s, v, 'px'); }
          });
        }
        setSliderVal(el, v, 'px');
        applyParams();
      });
    });

    var bgR = document.querySelector('[data-bg="all"]');
    if (bgR) {
      bgR.addEventListener('input', function () {
        state.bgRadius.all = Number(bgR.value);
        setSliderVal(bgR, bgR.value, 'px');
        applyParams();
      });
    }

    var sc = $('#shadowColor');
    sc.addEventListener('input', function () {
      state.shadow.color = sc.value;
      $('#shadowColorTxt').textContent = sc.value;
      applyParams();
    });

    var bc = $('#bgColor');
    bc.addEventListener('input', function () {
      state.bgColor = bc.value;
      state.bgColorOn = true;
      $('#bgColorTxt').textContent = bc.value;
      applyParams();
    });
  }

  /* ============================================================
     文案
     ============================================================ */

  function bindWenan() {
    var w = state.wenan;

    $('#segPos').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      $$('#segPos button').forEach(function (n) { n.classList.remove('on'); });
      b.classList.add('on');
      w.pos = b.dataset.v;
    });
    $('#segAlign').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      $$('#segAlign button').forEach(function (n) { n.classList.remove('on'); });
      b.classList.add('on');
      w.align = b.dataset.v;
    });
    $('#segWeight').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      $$('#segWeight button').forEach(function (n) { n.classList.remove('on'); });
      b.classList.add('on');
      w.weight = b.dataset.v;
    });

    var fs = $('#rFontSize');
    fs.addEventListener('input', function () { w.fontSize = Number(fs.value); $('#vFontSize').textContent = fs.value; });
    var lh = $('#rLineHeight');
    lh.addEventListener('input', function () { w.lineHeight = Number(lh.value); $('#vLineHeight').textContent = lh.value; });
    var ls = $('#rLetter');
    ls.addEventListener('input', function () { w.letterSpacing = Number(ls.value); $('#vLetter').textContent = ls.value; });
    var cw = $('#cWenan');
    cw.addEventListener('input', function () { w.color = cw.value; $('#vColor').textContent = cw.value; });

    $('#btnTextOk').addEventListener('click', function () {
      w.text = $('#txtWenan').value;
      closeModal('#mText');
      applyParams();
      toast(w.text.trim() ? '文案已应用' : '文案已清空');
    });
  }

  function openWenan() {
    var w = state.wenan;
    $('#txtWenan').value = w.text;
    $$('#segPos button').forEach(function (n) { n.classList.toggle('on', n.dataset.v === w.pos); });
    $$('#segAlign button').forEach(function (n) { n.classList.toggle('on', n.dataset.v === w.align); });
    $$('#segWeight button').forEach(function (n) { n.classList.toggle('on', n.dataset.v === w.weight); });
    $('#rFontSize').value = w.fontSize; $('#vFontSize').textContent = w.fontSize;
    $('#rLineHeight').value = w.lineHeight; $('#vLineHeight').textContent = w.lineHeight;
    $('#rLetter').value = w.letterSpacing; $('#vLetter').textContent = w.letterSpacing;
    $('#cWenan').value = w.color; $('#vColor').textContent = w.color;
    openModal('#mText');
  }

  /* ============================================================
     预设
     ============================================================ */

  function savePreset() {
    var snap = JSON.parse(JSON.stringify(state));
    delete snap.images;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(snap));
      toast('参数已保存为预设');
    } catch (e) {
      toast('保存失败：存储空间不足', true);
    }
  }

  function loadPreset(silent) {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) { if (!silent) toast('还没有保存过预设'); return false; }
      var snap = JSON.parse(raw);
      var imgs = state.images;
      state = Object.assign(defaultState(), snap);
      state.images = imgs;
      syncUI();
      render();
      if (!silent) toast('已载入预设');
      return true;
    } catch (e) {
      return false;
    }
  }

  function syncUI() {
    if ($('#swProtect')) $('#swProtect').checked = state.protect;
    if ($('#swProtect2')) $('#swProtect2').checked = state.protect;
    $('#swRadius').checked = state.radiusOn;
    $('#pnRadius').classList.toggle('is-open', state.radiusOn);
    $('#swShadow').checked = state.shadowOn;
    $('#pnShadow').classList.toggle('is-open', state.shadowOn);
    $('#swPadding').checked = state.paddingOn;
    $('#pnPadding').classList.toggle('is-open', state.paddingOn);
    $('#swStar').checked = state.star;
    $('#swEnd').checked = state.end;
    $('#swAd').checked = state.ad;
    syncAdUI();

    $$('[data-radius]').forEach(function (el) {
      var v = state.radius[el.getAttribute('data-radius')] || 0;
      el.value = v;
      setSliderVal(el, v, 'px');
    });
    $$('[data-shadow]').forEach(function (el) {
      var v = state.shadow[el.getAttribute('data-shadow')] || 0;
      el.value = v;
      setSliderVal(el, v, 'px');
    });
    $$('[data-margin]').forEach(function (el) {
      var v = state.margin[el.getAttribute('data-margin')] || 0;
      el.value = v;
      setSliderVal(el, v, 'px');
    });
    $$('[data-padding]').forEach(function (el) {
      var v = state.padding[el.getAttribute('data-padding')] || 0;
      el.value = v;
      setSliderVal(el, v, 'px');
    });
    var bgR = document.querySelector('[data-bg="all"]');
    if (bgR) {
      bgR.value = state.bgRadius.all || 0;
      setSliderVal(bgR, state.bgRadius.all || 0, 'px');
    }

    $('#shadowColor').value = state.shadow.color;
    $('#shadowColorTxt').textContent = state.shadow.color;
    $('#bgColor').value = state.bgColor;
    $('#bgColorTxt').textContent = state.bgColorOn ? state.bgColor : '无';

    if (state.bgUrl) {
      $('#bgPreview').hidden = false;
      $('#bgImg').src = state.bgUrl;
    } else {
      $('#bgPreview').hidden = true;
    }

    $('#postTitle').value = state.title || '';
  }

  /* ============================================================
     导出
     ============================================================ */

  function requireImages() {
    if (!state.images.length) {
      toast('请先添加图片', true);
      return false;
    }
    return true;
  }

  function doCopy() {
    if (!requireImages()) return;
    S.clear();
    toast('正在生成，请稍候…');
    E.copyRich(pageRoot)
      .then(function (ok) {
        if (ok) toast('已复制，去公众号编辑器 Ctrl+V 粘贴');
        else toast('复制失败，请改用「导出长图」', true);
      })
      .catch(function (err) {
        toast('复制失败：' + (err.message || '未知错误'), true);
      });
  }

  function doExportImage() {
    if (!requireImages()) return;
    S.clear();
    toast('正在生成高清长图…');
    E.downloadImage(pageRoot, state.title || '超赞排版', 2)
      .then(function (size) {
        toast('已导出（' + (size / 1024).toFixed(0) + ' KB）');
      })
      .catch(function (err) {
        toast('导出失败：' + (err.message || '未知错误'), true);
      });
  }

  /* ============================================================
     文字替换
     ============================================================ */

  function doReplace() {
    if (!state.images.length) { toast('请先添加图片', true); return; }
    var from = prompt('要被替换的文字（例如昵称）');
    if (from === null || !from) return;
    var to = prompt('替换成', '');
    if (to === null) return;

    var n = 0;
    var walker = document.createTreeWalker(pageRoot, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      if (node.nodeValue && node.nodeValue.indexOf(from) >= 0) {
        node.nodeValue = node.nodeValue.split(from).join(to);
        n++;
      }
    });
    toast(n ? '已替换 ' + n + ' 处' : '没有找到「' + from + '」', !n);
  }

  /* ============================================================
     排版提取
     ============================================================ */

  function doExtract() {
    var area = $('#extractArea');
    var html = area.innerHTML.trim();
    if (!html || area.innerText.trim().length < 2) {
      toast('请先粘贴要提取的内容', true);
      return;
    }

    // 清掉脚本/样式，保留结构
    var box = document.createElement('div');
    box.innerHTML = html;
    box.querySelectorAll('script,style,link,iframe').forEach(function (n) { n.remove(); });
    // 去掉公众号特有的干扰属性
    box.querySelectorAll('[data-mpa-*],[data-role]').forEach(function (n) {
      n.removeAttribute('data-role');
    });

    var root = document.createElement('div');
    root.className = 'mq_page_box';
    root.id = 'pageBox';
    root.style.cssText = 'font-size:15px;line-height:1.75;color:#333;padding:3px;';
    while (box.firstChild) root.appendChild(box.firstChild);

    if (!root.children.length) { toast('没识别到内容，请检查粘贴的内容', true); return; }

    elPageBox.parentNode.replaceChild(root, elPageBox);
    elPageBox = root;
    pageRoot = root;
    S.rebind(root);
    S.bind(root, onSelect);

    closeModal('#mExtract');
    area.innerHTML = '';
    elMidHint.hidden = true;
    toast('已提取排版，可直接复制导出');
  }

  /* ============================================================
     事件
     ============================================================ */

  function bindAll() {
    function pickFile() { elFileInput.click(); }
    $('#btnAddImg').addEventListener('click', pickFile);
    elDropZone.addEventListener('click', pickFile);

    elFileInput.addEventListener('change', function () {
      if (elFileInput.files && elFileInput.files.length) addFiles(elFileInput.files);
      elFileInput.value = '';
    });

    ['dragenter', 'dragover'].forEach(function (ev) {
      elDropZone.addEventListener(ev, function (e) {
        e.preventDefault();
        elDropZone.classList.add('is-over');
      });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      elDropZone.addEventListener(ev, function (e) {
        e.preventDefault();
        elDropZone.classList.remove('is-over');
      });
    });
    elDropZone.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });

    document.addEventListener('dragover', function (e) {
      if (state.images.length && e.dataTransfer && e.dataTransfer.types.indexOf('Files') >= 0) {
        e.preventDefault();
      }
    });
    document.addEventListener('drop', function (e) {
      if (!state.images.length) return;
      if (e.target.closest('#dropZone')) return;
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        e.preventDefault();
        addFiles(e.dataTransfer.files);
      }
    });

    document.addEventListener('paste', function (e) {
      var t = e.target;
      if (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT' || t.isContentEditable) return;
      var items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      var files = [];
      for (var i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
          var f = items[i].getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length) {
        e.preventDefault();
        addFiles(files);
      }
    });

    // 图片列表操作
    $('#imgList').addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b) return;
      var act = b.getAttribute('data-act');
      if (act === 'add') { pickFile(); return; }
      if (act === 'clear') {
        state.images.forEach(function (x) { URL.revokeObjectURL(x.url); });
        state.images = [];
        afterImagesChange();
        return;
      }
      if (act === 'reverse') {
        state.images.reverse();
        afterImagesChange();
        return;
      }
      if (act === 'shuffle') {
        for (var i = state.images.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var t = state.images[i]; state.images[i] = state.images[j]; state.images[j] = t;
        }
        afterImagesChange();
        return;
      }
    });

    // 模板
    $('#btnTpl').addEventListener('click', function () {
      tplCat = 'all';
      $$('#tplTabs button').forEach(function (n) { n.classList.toggle('on', n.dataset.cat === 'all'); });
      buildTplGrid();
      openModal('#mTpl');
    });
    $('#tplTabs').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      tplCat = b.dataset.cat;
      $$('#tplTabs button').forEach(function (n) { n.classList.remove('on'); });
      b.classList.add('on');
      buildTplGrid();
    });

    $('#btnText').addEventListener('click', openWenan);

    // 关闭弹层
    document.addEventListener('click', function (e) {
      var c = e.target.closest('[data-close]');
      if (!c) return;
      var m = c.closest('.modal');
      if (m) closeModal('#' + m.id);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        $$('.modal').forEach(function (m) { if (!m.hidden) closeModal('#' + m.id); });
        $('#menuPop').hidden = true;
        S.clear();
      }
    });

    // 开关
    bindSwitch('#swRadius', '#pnRadius', 'radiusOn');
    bindSwitch('#swShadow', '#pnShadow', 'shadowOn');
    bindSwitch('#swPadding', '#pnPadding', 'paddingOn');
    bindSwitch('#swStar', null, 'star');
    bindSwitch('#swEnd', null, 'end');

    // 防盗图两处开关互相同步
    ['#swProtect', '#swProtect2'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener('change', function () {
        state.protect = el.checked;
        if ($('#swProtect')) $('#swProtect').checked = el.checked;
        if ($('#swProtect2')) $('#swProtect2').checked = el.checked;
        applyParams();
        toast(el.checked ? '已开启防盗图' : '已关闭防盗图');
      });
    });

    bindSliders();
    bindWenan();
    bindThumbDrag();

    $('#postTitle').addEventListener('input', function () {
      state.title = $('#postTitle').value;
    });

    // 「文章背景」「行间距」点击跳到对应参数卡片并高亮（原站行为）
    $$('.meta-left [data-goto]').forEach(function (n) {
      n.addEventListener('click', function () {
        var sec = document.getElementById(n.getAttribute('data-goto'));
        if (!sec) return;
        sec.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (sec.animate) {
          sec.animate(
            [
              { background: 'rgba(29,158,147,.16)' },
              { background: 'transparent' },
            ],
            { duration: 600, easing: 'ease', iterations: 3 }
          );
        }
      });
    });

    $('#btnPreset').addEventListener('click', savePreset);
    $('#btnDelPost').addEventListener('click', function () {
      if (!state.images.length && !state.wenan.text) { toast('没有可清除的内容'); return; }
      if (!confirm('确定清空当前排版？图片和文案都会移除。')) return;
      state.images.forEach(function (x) { URL.revokeObjectURL(x.url); });
      state.images = [];
      state.wenan.text = '';
      afterImagesChange();
      toast('已清空');
    });

    // 导出
    $('#btnCopy').addEventListener('click', doCopy);
    $('#btnSync').addEventListener('click', function () {
      toast('同步到草稿箱需要绑定公众号，本地版请用「复制导出」', true);
    });

    // 背景
    $('#btnBgAdd').addEventListener('click', function () {
      var inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'image/*';
      inp.onchange = function () {
        var f = inp.files && inp.files[0];
        if (!f) return;
        var url = URL.createObjectURL(f);
        state.bgUrl = url;
        $('#bgPreview').hidden = false;
        $('#bgImg').src = url;
        applyParams();
        toast('背景已设置');
      };
      inp.click();
    });
    $('#btnBgDel').addEventListener('click', function () {
      state.bgUrl = '';
      $('#bgPreview').hidden = true;
      applyParams();
      toast('背景已移除');
    });

    // 链接导入
    $('#btnLinkImport').addEventListener('click', function () { openModal('#mLink'); });
    $('#btnLinkOk').addEventListener('click', function () {
      var url = $('#linkInput').value.trim();
      if (!url) { toast('请填写链接', true); return; }
      toast('受跨域限制无法直接抓取，请改用 Ctrl+V 粘贴图片', true);
    });

    // 右栏业务卡片
    $('#btnAddGzh').addEventListener('click', function () {
      toast('绑定公众号需公众号后台授权，本地版暂不支持', true);
    });
    $('#btnCover').addEventListener('click', function () {
      window.open('/mini-cover/', '_blank', 'noopener');
    });
    $('#swAd').addEventListener('change', function () {
      state.ad = $('#swAd').checked;
      syncAdUI();

      // 只重建隐藏段落，不跑整套 applyAll（滑块状态无需重算）
      if (pageRoot) R.applyAd(pageRoot, state);

      if (!state.ad) { toast('已关闭智能广告'); return; }

      if (!state.images.length) {
        toast('已开启，添加图片后自动插入隐藏文字');
        return;
      }
      var n = pageRoot.querySelectorAll('.mqad').length;
      toast(n ? '已插入 ' + n + ' 段隐藏文字（读者不可见）' : '当前内容过少，未插入');
    });

    // 广告文案：输入后 260ms 重建隐藏段落，避免逐字重建
    var adTimer = null;
    $('#adText').addEventListener('input', function () {
      state.adText = $('#adText').value;
      updateAdCount();
      clearTimeout(adTimer);
      adTimer = setTimeout(function () {
        if (pageRoot) R.applyAd(pageRoot, state);
      }, 260);
    });
    $('#btnExtract').addEventListener('click', function () { openModal('#mExtract'); });
    $('#btnExtractOk').addEventListener('click', doExtract);
    $('#btnKefu').addEventListener('click', function () { openModal('#mQr'); });
    $('#btnKefuCopy').addEventListener('click', function () {
      var txt = '公众号：' + $('#kefuGzh').textContent + '\n邮箱：' + $('#kefuMail').textContent;
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject())
        .then(function () { toast('已复制联系方式'); })
        .catch(function () { toast('复制失败，请手动选中', true); });
    });

    // 右侧浮动工具条
    $('.rail-right').addEventListener('click', function (e) {
      var b = e.target.closest('[data-tool]');
      if (!b) return;
      var t = b.dataset.tool;
      if (t === 'replace') doReplace();
      else if (t === 'cover') window.open('/mini-cover/', '_blank', 'noopener');
      else if (t === 'kefu') openModal('#mQr');
      else if (t === 'tutorial') openModal('#mTutorial');
      else if (t === 'guide') openModal('#mGuide');
    });

    // 左侧浮动工具条
    $('.rail-left').addEventListener('click', function (e) {
      var b = e.target.closest('[data-tool]');
      if (!b) return;
      var t = b.dataset.tool;
      if (t === 'preset') loadPreset();
      else if (t === 'exportImg') doExportImage();
    });

    // 更多功能菜单
    var pop = $('#menuPop');
    $('#btnMenu').addEventListener('click', function (e) {
      e.stopPropagation();
      var r = $('#btnMenu').getBoundingClientRect();
      pop.style.top = (r.bottom + 6) + 'px';
      pop.style.left = Math.min(r.left, window.innerWidth - 148) + 'px';
      pop.hidden = !pop.hidden;
    });
    pop.addEventListener('click', function (e) {
      var b = e.target.closest('[data-menu]');
      if (!b) return;
      pop.hidden = true;
      var m = b.dataset.menu;
      if (m === 'exportImg') doExportImage();
      else if (m === 'savePreset') savePreset();
      else if (m === 'loadPreset') loadPreset();
      else if (m === 'replace') doReplace();
      else if (m === 'guide') openModal('#mGuide');
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#menuPop') && !e.target.closest('#btnMenu')) pop.hidden = true;
    });

    // 选中条跟随
    window.addEventListener('scroll', function () {
      if (S.current) onSelect(S.current);
    }, true);

    var rt = null;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { if (S.current) onSelect(S.current); }, 120);
    });
  }

  /* ============================================================
     启动
     ============================================================ */

  function boot() {
    elPhone = $('#index_phone');
    elPageBox = $('#pageBox');
    elMidHint = $('#midHint');
    elImgList = $('#imgList');
    elImgListBody = $('#imgListBody');
    elImgCount = $('#imgCount');
    elLeftEmpty = $('#leftEmpty');
    elDropZone = $('#dropZone');
    elFileInput = $('#fileInput');

    pageRoot = elPageBox;

    if (!TPL.length) {
      toast('模板数据加载失败', true);
      return;
    }

    // 默认模板对齐原站：三图模板（3 列灰块）
    state.tplId = (TPL.filter(function (t) { return t.id === DEFAULT_TPL_ID; })[0] || TPL[0]).id;

    bindAll();
    S.bind(pageRoot, onSelect);
    updateLayoutMode();

    // 恢复上次的预设参数
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var snap = JSON.parse(raw);
        state = Object.assign(defaultState(), snap, { images: [] });
      }
    } catch (e) { /* 忽略 */ }

    syncUI();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.__pb = { get state() { return state; }, render: render, applyParams: applyParams };
})();

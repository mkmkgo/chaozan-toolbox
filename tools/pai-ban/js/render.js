/**
 * 渲染引擎
 *
 * 模板是 inline-style 的 section 嵌套结构，图片位用 data-maque="1" +
 * data-maque-box-index 标记。本模块负责：
 *   1. 把模板 HTML 转成 DOM，按顺序填入用户图片
 *   2. 把排版参数（圆角/阴影/行间隔/内边距/背景）写进 DOM
 *   3. 生成文案块与预留空行
 *
 * 参数作用位置：
 *   圆角 / 阴影  → 每张图片的直接父 section（模板里本来就带 border-radius）
 *   行间隔       → 每个图片行（[data-mq-box-parent]）的上下 margin
 *   内边距       → 页面根容器 .mq_page_box 的 padding
 *   背景         → 页面根容器 .mq_page_box 的 background
 */
(function (global) {
  'use strict';

  var PH = './assets/ph.svg';

  /* ---------------- 工具 ---------------- */

  function px(n) {
    return (Math.round(n * 100) / 100) + 'px';
  }

  function hexToRgb(hex) {
    var h = String(hex || '#000').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) return '0,0,0';
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(',');
  }

  /* ---------------- 模板 → DOM ---------------- */

  /**
   * 把模板 HTML 解析成 DocumentFragment
   * @param {string} html
   * @returns {DocumentFragment}
   */
  function parse(html) {
    var tpl = document.createElement('template');
    tpl.innerHTML = String(html || '').trim();
    return tpl.content;
  }

  /**
   * 补齐行标记。
   *
   * 模板 API 返回的 HTML 里，有一部分模板（33 套里有 12 套）的顶层 section
   * 没有 data-mq-box-parent —— 原站是运行时补上去的。凡是「直接含图片位的
   * 顶层 section」都补一个，否则行间隔、文案穿插、隐藏文字全都找不到
   * 「行」这个单位，只能退化到逐张图片处理。
   *
   * 幂等，可以重复调用。
   */
  function markRows(root) {
    [].slice.call(root.children || []).forEach(function (top) {
      if (top.nodeType !== 1) return;
      if (top.hasAttribute('data-mq-box-parent')) return;
      if (top.querySelector('[data-maque]')) top.setAttribute('data-mq-box-parent', '1');
    });
    return root;
  }

  /**
   * 找出模板里所有图片位。
   *
   * 顺序规则：先按「行」（[data-mq-box-parent]）在 DOM 中的先后，
   * 行内再按 data-maque-box-index 排。因为多行模板每行的 index 都从 0 开始，
   * 全局排序会把行打乱。
   *
   * @param {ParentNode} root
   */
  function slots(root) {
    markRows(root);
    var all = [].slice.call(root.querySelectorAll('[data-maque]'));
    if (!all.length) return [];

    var groups = [];
    var index = new Map();

    all.forEach(function (el) {
      var p = el.closest('[data-mq-box-parent]') || root;
      if (!index.has(p)) {
        index.set(p, groups.length);
        groups.push([]);
      }
      groups[index.get(p)].push(el);
    });

    var out = [];
    groups.forEach(function (g) {
      g.sort(function (a, b) {
        var ia = Number(a.getAttribute('data-maque-box-index'));
        var ib = Number(b.getAttribute('data-maque-box-index'));
        if (isNaN(ia)) ia = 1e9;
        if (isNaN(ib)) ib = 1e9;
        return ia - ib;
      });
      out = out.concat(g);
    });
    return out;
  }

  /**
   * 渲染模板
   * @param {object} tpl  模板对象（来自 PB_TEMPLATES）
   * @param {Array}  images  [{ id, url, w, h }]
   * @returns {HTMLElement} .mq_page_box 根节点
   */
  function renderTemplate(tpl, images) {
    var root = document.createElement('div');
    root.className = 'mq_page_box';

    var list = images || [];

    // 无模板：单列平铺
    if (!tpl) {
      list.forEach(function (item) {
        var sec = document.createElement('section');
        sec.setAttribute('data-mq-box-parent', '1');
        sec.style.cssText = 'margin:8px 0;';
        var inner = document.createElement('section');
        inner.style.cssText = 'border-radius:8px;overflow:hidden;';
        var img = document.createElement('img');
        img.src = item.url;
        img.setAttribute('data-pb-img', item.id);
        img.style.cssText = 'width:100%;vertical-align:bottom;display:block;';
        inner.appendChild(img);
        sec.appendChild(inner);
        root.appendChild(sec);
      });
      return root;
    }

    // 模板顶部装饰（只加一次）
    if (tpl.top) {
      var wrap = document.createElement('div');
      wrap.setAttribute('data-pb-top', '1');
      wrap.appendChild(parse(tpl.top));
      root.appendChild(wrap);
    }

    /**
     * 模板里一组能放几张图。图片多时整组重复，图片少时多余位隐藏
     * （隐藏而非删除，flex 会自动把剩下的图撑满）。
     */
    var probe = markRows(parse(tpl.html));
    var perRound = slots(probe).length || tpl.imgs || 1;
    var total = list.length;

    // 没有图片时只渲染一轮占位
    var rounds = total > perRound ? Math.ceil(total / perRound) : 1;

    for (var r = 0; r < rounds; r++) {
      var frag = markRows(parse(tpl.html));
      var imgs = slots(frag);

      imgs.forEach(function (img, i) {
        var globalIdx = r * perRound + i;
        var item = list[globalIdx];

        if (!item) {
          // 本轮多出来的位：连父容器一起隐藏
          var holder = img.parentElement;
          if (holder && holder !== frag) {
            holder.style.display = 'none';
          } else {
            img.style.display = 'none';
          }
          return;
        }

        img.src = item.url;
        img.setAttribute('data-pb-img', item.id);
        if (item.w && item.h) {
          img.setAttribute('data-w', item.w);
          img.setAttribute('data-ratio', (item.h / item.w).toFixed(4));
        }
        img.setAttribute('alt', '');
        img.removeAttribute('data-maque');
      });

      while (frag.firstChild) root.appendChild(frag.firstChild);
    }

    return root;
  }

  /* ---------------- 参数应用 ---------------- */

  /**
   * 取出所有「图片占位节点」——正常情况是 <img>，开启防盗图后被换成
   * <div data-pb-protect="1">。两种都要能继续接受圆角/阴影。
   */
  function visuals(root) {
    return [].slice.call(root.querySelectorAll('img, [data-pb-protect="1"]'));
  }

  /**
   * 给每张图片的外层 section 应用圆角与阴影
   */
  function applyBoxStyle(root, st) {
    visuals(root).forEach(function (img) {
      var holder = img.parentElement;
      if (!holder || holder === root) return;

      // 圆角
      if (st.radiusOn) {
        var r = st.radius;
        var all = Number(r.all) || 0;
        var tl = all || Number(r.top_left) || 0;
        var tr = all || Number(r.top_right) || 0;
        var br = all || Number(r.bottom_right) || 0;
        var bl = all || Number(r.bottom_left) || 0;
        holder.style.borderRadius = px(tl) + ' ' + px(tr) + ' ' + px(br) + ' ' + px(bl);
        holder.style.overflow = 'hidden';
        img.style.borderRadius = 'inherit';
      } else {
        holder.style.borderRadius = '';
        img.style.borderRadius = '';
      }

      // 阴影
      if (st.shadowOn) {
        var s = st.shadow;
        holder.style.boxShadow =
          px(s.left_or_right) + ' ' + px(s.top_or_bottom) + ' ' + px(s.range) + ' ' +
          'rgba(' + hexToRgb(s.color) + ',.9)';
      } else {
        holder.style.boxShadow = '';
      }
    });
  }

  /**
   * 行间隔：每个图片行的上下 margin
   *
   * 注意不能用 removeProperty('margin-top') 复位 —— 模板里写的是
   * `margin: 8px 10px` 这种简写，删掉 top 这个 longhand 会把简写拆开，
   * 上下边距直接变成 0，行与行就贴在一起了。所以先把模板自带的
   * margin 存进 dataset，滑块为 0 时还原，大于 0 时覆盖。
   */
  function applyRowGap(root, st) {
    var rows = root.querySelectorAll('[data-mq-box-parent]');
    var top = Number(st.margin.top) || 0;
    var bottom = Number(st.margin.bottom) || 0;

    function apply(row) {
      if (row.dataset.pbMt === undefined) {
        // 从内联 style 读，不用 getComputedStyle —— 首次渲染时 root 还没插进
        // 文档，计算样式会返回 0，模板自带的边距就丢了。
        row.dataset.pbMt = String(parseFloat(row.style.marginTop) || 0);
        row.dataset.pbMb = String(parseFloat(row.style.marginBottom) || 0);
      }
      row.style.marginTop = px(top > 0 ? top : Number(row.dataset.pbMt));
      row.style.marginBottom = px(bottom > 0 ? bottom : Number(row.dataset.pbMb));
    }

    if (rows.length) {
      [].forEach.call(rows, apply);
    } else {
      // 单图无标记时，作用到图片父级
      [].forEach.call(root.querySelectorAll('img'), function (img) {
        var h = img.parentElement;
        if (h && h !== root) apply(h);
      });
    }
  }

  /**
   * 内边距 + 背景 + 防盗图
   */
  function applyPageStyle(root, st) {
    // 内边距
    if (st.paddingOn) {
      var p = st.padding;
      var all = Number(p.all) || 0;
      root.style.padding =
        px(all || Number(p.top) || 0) + ' ' +
        px(all || Number(p.right) || 0) + ' ' +
        px(all || Number(p.bottom) || 0) + ' ' +
        px(all || Number(p.left) || 0);
    } else {
      root.style.removeProperty('padding');
    }

    // 背景图
    if (st.bgUrl) {
      root.style.backgroundImage = 'url("' + st.bgUrl + '")';
      root.style.backgroundSize = '100% auto';
      root.style.backgroundPosition = '0% 0%';
      root.style.backgroundRepeat = 'repeat-y';
    } else {
      root.style.backgroundImage = '';
    }

    // 纯色背景
    if (st.bgColorOn) {
      root.style.backgroundColor = st.bgColor;
    } else if (!st.bgUrl) {
      root.style.backgroundColor = '';
    }

    // 背景圆角
    var bgr = Number((st.bgRadius && st.bgRadius.all) || 0);
    if (bgr > 0) {
      root.style.borderRadius = px(bgr);
      root.style.overflow = 'hidden';
    } else {
      root.style.removeProperty('border-radius');
      root.style.removeProperty('overflow');
    }

    // 防盗图：把 img 换成 background-image，读者长按拿不到原图
    var imgs = root.querySelectorAll('img');
    [].forEach.call(imgs, function (img) {
      var holder = img.parentElement;
      if (!holder || holder === root) return;
      if (st.protect) {
        if (img.getAttribute('data-pb-protect') === '1') return;
        var src = img.getAttribute('src');
        if (!src) return;
        var ratio = Number(img.getAttribute('data-ratio')) || 0;
        var box = document.createElement('div');
        box.setAttribute('data-pb-protect', '1');
        box.setAttribute('data-pb-img', img.getAttribute('data-pb-img') || '');
        box.style.cssText =
          'width:100%;padding-top:' + (ratio ? (ratio * 100).toFixed(2) : 100) + '%;' +
          'background-image:url("' + src + '");background-size:cover;' +
          'background-position:center;border-radius:inherit;display:block;';
        holder.replaceChild(box, img);
      }
    });
    if (!st.protect) {
      var boxes = root.querySelectorAll('[data-pb-protect="1"]');
      [].forEach.call(boxes, function (box) {
        var m = /url\("?([^")]+)"?\)/.exec(box.style.backgroundImage || '');
        var img = document.createElement('img');
        img.src = m ? m[1] : PH;
        img.setAttribute('data-pb-img', box.getAttribute('data-pb-img') || '');
        img.style.cssText = 'width:100%;vertical-align:bottom;display:block;border-radius:inherit;';
        box.parentElement.replaceChild(img, box);
      });
    }
  }

  /* ---------------- 文案 ---------------- */

  function wenanStyle(st) {
    var w = st.wenan;
    return (
      'font-size:' + (Number(w.fontSize) || 14) + 'px;' +
      'line-height:' + (Number(w.lineHeight) || 17) + 'px;' +
      'letter-spacing:' + (Number(w.letterSpacing) || 0) + 'px;' +
      'color:' + (w.color || '#000') + ';' +
      'text-align:' + (w.align || 'center') + ';' +
      'font-weight:' + (w.weight || 'normal') + ';' +
      'padding-left:' + (Number(w.padding) || 0) + 'px;' +
      'padding-right:' + (Number(w.padding) || 0) + 'px;'
    );
  }

  /**
   * 生成文案块
   * @param {string[]} lines 文案行
   */
  function buildWenanBlock(lines, st) {
    var sec = document.createElement('section');
    sec.setAttribute('data-mq-box-wenan', '1');
    sec.style.cssText = 'margin:10px 0;' + wenanStyle(st);
    lines.forEach(function (line) {
      var p = document.createElement('p');
      p.style.cssText = 'margin:0;' + wenanStyle(st);
      p.textContent = line;
      sec.appendChild(p);
    });
    return sec;
  }

  /**
   * 插入文案
   * @param {HTMLElement} root
   * @param {object} st
   */
  function applyWenan(root, st) {
    // 先清掉旧的
    var old = root.querySelectorAll('[data-mq-box-wenan]');
    [].forEach.call(old, function (n) { n.remove(); });

    var text = String(st.wenan.text || '').trim();
    if (!text) return;

    var lines = text.split(/\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (!lines.length) return;

    var mode = st.wenan.pos || 'after';

    if (mode === 'mix') {
      // 按空行分组，逐组插到图片行之间
      var groups = String(st.wenan.text).split(/\n\s*\n/).map(function (g) {
        return g.split(/\n/).map(function (s) { return s.trim(); }).filter(Boolean);
      }).filter(function (g) { return g.length; });

      var rows = [].slice.call(root.children).filter(function (n) {
        return n.getAttribute && n.getAttribute('data-mq-box-parent');
      });
      if (!rows.length) {
        rows = [].slice.call(root.querySelectorAll('[data-mq-box-parent]'));
      }
      if (!rows.length) {
        root.appendChild(buildWenanBlock(lines, st));
        return;
      }

      groups.forEach(function (g, i) {
        var target = rows[i] || rows[rows.length - 1];
        var block = buildWenanBlock(g, st);
        if (i < rows.length) {
          target.parentNode.insertBefore(block, target.nextSibling);
        } else {
          root.appendChild(block);
        }
      });
      return;
    }

    var block = buildWenanBlock(lines, st);
    if (mode === 'before') {
      root.insertBefore(block, root.firstChild);
    } else {
      root.appendChild(block);
    }
  }

  /* ---------------- 预留空行 ---------------- */

  function applyEmptyRows(root, st) {
    var olds = root.querySelectorAll('[data-pb-empty]');
    [].forEach.call(olds, function (n) { n.remove(); });

    function empty() {
      var p = document.createElement('p');
      p.setAttribute('data-pb-empty', '1');
      p.style.cssText = 'margin:0;height:26px;line-height:26px;';
      p.innerHTML = '<br>';
      return p;
    }
    if (st.star) root.insertBefore(empty(), root.firstChild);
    if (st.end) root.appendChild(empty());
  }

  /* ---------------- 智能广告（隐藏文字） ---------------- */

  var AD_DOTS = new Array(301).join('.'); // 300 个点，留空时的默认填充

  function randInt(a, b) {
    if (global.crypto && global.crypto.getRandomValues) {
      var buf = new Uint32Array(1);
      global.crypto.getRandomValues(buf);
      return a + (buf[0] % (b - a + 1));
    }
    return a + Math.floor(Math.random() * (b - a + 1));
  }

  /** 从 str 的 start 位置循环取 len 个字符（到末尾绕回开头） */
  function cutCircular(str, start, len) {
    var n = str.length;
    if (!n) return { content: '', next: 0 };
    var out = '';
    var i = start % n;
    for (var k = 0; k < len; k++) {
      out += str.charAt(i);
      i = (i + 1) % n;
    }
    return { content: out, next: i };
  }

  function mkAd(text) {
    var p = document.createElement('p');
    p.className = 'mqad';
    p.setAttribute('style', 'display:none!important;color:#fff!important;');
    p.textContent = text;
    return p;
  }

  /**
   * 在每行图片前后插入 display:none 的隐藏文字。
   *
   * 公众号会把正文文本纳入搜索索引，读者看不见但能带来站内搜索流量。
   * 规则与原站一致：跳过第 0 个块、最多处理 20 块；每块前后各插 8 段；
   * 每侧首段 100–150 字、其余 10–20 字；用户文本循环截取，留空用 300 个点。
   *
   * @returns {number} 实际插入的段数
   */
  function applyAd(root, st) {
    var olds = root.querySelectorAll('.mqad');
    [].forEach.call(olds, function (n) { n.remove(); });
    if (!st.ad) return 0;

    var src = String(st.adText || '').trim() || AD_DOTS;

    // 只对「图片行」下手：排除文案块、空行块、顶部装饰
    var rows = [].slice.call(root.children).filter(function (n) {
      if (n.nodeType !== 1) return false;
      if (n.hasAttribute('data-mq-box-wenan')) return false;
      if (n.hasAttribute('data-pb-empty')) return false;
      if (n.hasAttribute('data-pb-top')) return false;
      return true;
    });

    var inserted = 0;
    rows.forEach(function (row, i) {
      if (i === 0 || i >= 20) return;

      var cursor = 0;
      var k, seg, anchor;

      // 前 8 段
      for (k = 0; k < 8; k++) {
        seg = cutCircular(src, cursor, k === 0 ? randInt(100, 150) : randInt(10, 20));
        cursor = seg.next;
        row.parentNode.insertBefore(mkAd(seg.content), row);
        inserted++;
      }

      // 后 8 段（用固定 anchor 保证顺序不反转）
      anchor = row.nextSibling;
      for (k = 0; k < 8; k++) {
        seg = cutCircular(src, cursor, k === 0 ? randInt(100, 150) : randInt(10, 20));
        cursor = seg.next;
        row.parentNode.insertBefore(mkAd(seg.content), anchor);
        inserted++;
      }
    });

    return inserted;
  }

  /* ---------------- 总入口 ---------------- */

  /**
   * 把状态应用到已渲染的根节点（原地修改）
   *
   * 注意：不含 applyAd。隐藏文字要重建十几到上百个节点，放在这里会被
   * 滑块拖动这类高频操作反复触发。广告由调用方在开关/文案变化时单独调用。
   */
  function applyAll(root, st) {
    if (!root) return;
    applyBoxStyle(root, st);
    applyRowGap(root, st);
    applyPageStyle(root, st);
    applyWenan(root, st);
    applyEmptyRows(root, st);
  }

  /**
   * 完整渲染：模板 + 图片 + 全部参数（含隐藏文字）
   */
  function render(tpl, images, st) {
    var root = renderTemplate(tpl, images);
    applyAll(root, st);
    applyAd(root, st);
    return root;
  }

  global.PBRender = {
    render: render,
    renderTemplate: renderTemplate,
    applyAll: applyAll,
    applyAd: applyAd,
    markRows: markRows,
    slots: slots,
    parse: parse,
    px: px,
    hexToRgb: hexToRgb,
  };
})(window);

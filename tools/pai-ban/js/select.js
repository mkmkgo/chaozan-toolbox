/**
 * 积木块选中
 *
 * 点击预览区任意位置时，按优先级推断用户想操作的是哪一块：
 *   1. 插入块（.phone_insert_box）
 *   2. 图片行（[data-mq-box-parent]）
 *   3. 公众号卡片（[data-mq-gzh-kp-id]）
 *   4. 文案块（[data-mq-box-wenan]）
 *   5. 智能推断：向上找「有兄弟节点且尺寸接近」的祖先
 *   6. 兜底：页面根容器的直接子元素
 *
 * 选中后加绿框，并回调通知外部（用于显示浮动操作条）。
 */
(function (global) {
  'use strict';

  var HOVER = 'pb-hover';
  var HOVER_PARENT = 'pb-hover-parent';

  var root = null;
  var current = null;
  var onChange = null;

  function clear() {
    if (!root) return;
    var all = root.querySelectorAll('.' + HOVER + ', .' + HOVER_PARENT);
    [].forEach.call(all, function (n) {
      n.classList.remove(HOVER);
      n.classList.remove(HOVER_PARENT);
    });
    current = null;
    if (onChange) onChange(null);
  }

  function select(el, type) {
    if (!el || !root || !root.contains(el) || el === root) return;
    clear();
    el.classList.add(HOVER);
    current = { el: el, type: type || 'block' };
    if (onChange) onChange(current);
  }

  /** 两个元素尺寸是否接近（差值 < 30%） */
  function sizeLike(a, b) {
    var ra = a.getBoundingClientRect();
    var rb = b.getBoundingClientRect();
    if (!ra.width || !rb.width) return false;
    var dw = Math.abs(ra.width - rb.width) / Math.max(ra.width, rb.width);
    var dh = Math.abs(ra.height - rb.height) / Math.max(ra.height, rb.height);
    return dw < 0.3 && dh < 0.3;
  }

  /** 有兄弟节点，且尺寸和自己接近 */
  function hasLikeSiblings(el) {
    var p = el.parentElement;
    if (!p) return false;
    var sibs = [].slice.call(p.children).filter(function (n) { return n !== el; });
    if (!sibs.length) return false;
    return sibs.some(function (s) { return sizeLike(el, s); });
  }

  /** 智能推断：从点击点向上找最合适的块 */
  function infer(target) {
    var node = target;
    var depth = 0;
    var best = null;

    while (node && node !== root && depth < 8) {
      if (hasLikeSiblings(node)) {
        best = node;
        // 继续向上，但如果父级也满足且宽度更大，优先父级（整行）
        var p = node.parentElement;
        if (p && p !== root && hasLikeSiblings(p)) {
          var rn = node.getBoundingClientRect();
          var rp = p.getBoundingClientRect();
          if (rp.width > rn.width * 1.15) best = p;
        }
        break;
      }
      node = node.parentElement;
      depth++;
    }
    return best;
  }

  /** 主入口：处理一次点击 */
  function pick(target) {
    if (!root || !target || !root.contains(target)) return null;

    // 1. 插入块
    var el = target.closest('.phone_insert_box');
    if (el && root.contains(el)) return { el: el, type: 'insert' };

    // 2. 图片行
    el = target.closest('[data-mq-box-parent]');
    if (el && root.contains(el)) return { el: el, type: 'row' };

    // 3. 公众号卡片
    el = target.closest('[data-mq-gzh-kp-id]');
    if (el && root.contains(el)) return { el: el, type: 'card' };

    // 4. 文案块
    el = target.closest('[data-mq-box-wenan]');
    if (el && root.contains(el)) return { el: el, type: 'wenan' };

    // 5. 智能推断
    el = infer(target);
    if (el) return { el: el, type: 'infer' };

    // 6. 兜底：根容器的直接子元素
    var kids = [].slice.call(root.children);
    for (var i = 0; i < kids.length; i++) {
      if (kids[i].contains(target)) return { el: kids[i], type: 'child' };
    }
    return null;
  }

  /* ---------------- 块操作 ---------------- */

  function move(dir) {
    if (!current) return false;
    var el = current.el;
    var p = el.parentElement;
    if (!p) return false;
    if (dir < 0) {
      var prev = el.previousElementSibling;
      if (!prev) return false;
      p.insertBefore(el, prev);
    } else {
      var next = el.nextElementSibling;
      if (!next) return false;
      p.insertBefore(next, el);
    }
    // 重新选中
    var keep = el;
    setTimeout(function () { select(keep, current ? current.type : 'block'); }, 0);
    return true;
  }

  function remove() {
    if (!current) return false;
    var el = current.el;
    el.remove();
    current = null;
    if (onChange) onChange(null);
    return true;
  }

  /** 在选中块后面插入一段 HTML */
  function insertAfter(html) {
    if (!current) return null;
    var frag = document.createElement('template');
    frag.innerHTML = html;
    var node = frag.content.firstElementChild;
    if (!node) return null;
    node.classList.add('phone_insert_box');
    node.style.minHeight = '20px';
    current.el.parentElement.insertBefore(node, current.el.nextSibling);
    select(node, 'insert');
    return node;
  }

  /* ---------------- 绑定 ---------------- */

  /**
   * @param {HTMLElement} rootEl 预览根节点
   * @param {Function} cb 选中变化回调
   */
  function bind(rootEl, cb) {
    root = rootEl;
    onChange = cb;
    if (!root) return;

    root.addEventListener('click', function (e) {
      // 忽略正在编辑的文本
      if (e.target.isContentEditable) return;
      var hit = pick(e.target);
      if (!hit) { clear(); return; }
      select(hit.el, hit.type);
    });
  }

  function rebind(newRoot) {
    root = newRoot;
    current = null;
    if (onChange) onChange(null);
  }

  global.PBSelect = {
    bind: bind,
    rebind: rebind,
    clear: clear,
    select: select,
    pick: pick,
    move: move,
    remove: remove,
    insertAfter: insertAfter,
    get current() { return current; },
  };
})(window);

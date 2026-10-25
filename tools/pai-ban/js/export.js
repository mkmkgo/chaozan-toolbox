/**
 * 导出
 *
 * 两条路径：
 *   1. 复制富文本 —— 公众号编辑器只认 inline style，所以要把预览 DOM 清洗成
 *      纯内联样式，图片转 base64（blob URL 粘不过去），再写进剪贴板。
 *   2. 导出长图 —— 用 SVG foreignObject 把 DOM 序列化后画进 Canvas，
 *      不引任何第三方截图库。
 */
(function (global) {
  'use strict';

  var PH = './assets/ph.svg';

  /* ---------------- 基础工具 ---------------- */

  function blobToDataURL(url) {
    return fetch(url)
      .then(function (r) { return r.blob(); })
      .then(function (b) {
        return new Promise(function (res, rej) {
          var fr = new FileReader();
          fr.onload = function () { res(fr.result); };
          fr.onerror = rej;
          fr.readAsDataURL(b);
        });
      })
      .catch(function () { return url; });
  }

  function imgToDataURL(src) {
    return new Promise(function (resolve) {
      if (!src || /^data:/.test(src)) return resolve(src);
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () {
        try {
          var c = document.createElement('canvas');
          c.width = img.naturalWidth;
          c.height = img.naturalHeight;
          c.getContext('2d').drawImage(img, 0, 0);
          resolve(c.toDataURL('image/png'));
        } catch (e) {
          resolve(src);
        }
      };
      img.onerror = function () { resolve(src); };
      img.src = src;
    });
  }

  /* ---------------- 复制富文本 ---------------- */

  var BASE_CSS =
    'font-size:15px;line-height:1.75;color:#333;word-break:break-word;' +
    'max-width:100%;box-sizing:border-box;';

  /**
   * 把预览 DOM 清洗成可直接粘进公众号的 HTML
   * @param {HTMLElement} root
   * @param {object} opts { baseUrl }
   */
  function toCopyHtml(root, opts) {
    opts = opts || {};
    var clone = root.cloneNode(true);

    // 1. 去掉编辑态
    [].forEach.call(clone.querySelectorAll('.pb-hover, .pb-hover-parent'), function (n) {
      n.classList.remove('pb-hover');
      n.classList.remove('pb-hover-parent');
    });
    [].forEach.call(clone.querySelectorAll('.phone_insert_box'), function (n) {
      n.classList.remove('phone_insert_box');
      n.removeAttribute('contenteditable');
    });
    // 移除空行标记属性（保留元素）
    [].forEach.call(clone.querySelectorAll('[data-pb-empty]'), function (n) {
      n.removeAttribute('data-pb-empty');
    });

    // 2. 图片转 base64（异步，调用方 await）
    var imgs = [].slice.call(clone.querySelectorAll('img'));
    var jobs = imgs.map(function (img) {
      var src = img.getAttribute('src') || '';
      if (/^data:/.test(src)) return Promise.resolve();
      return imgToDataURL(src).then(function (d) { img.setAttribute('src', d); });
    });

    // 3. 防盗图块：background-image 也转 base64
    var boxes = [].slice.call(clone.querySelectorAll('[data-pb-protect="1"]'));
    boxes.forEach(function (box) {
      var m = /url\("?([^")]+)"?\)/.exec(box.style.backgroundImage || '');
      if (!m) return;
      jobs.push(imgToDataURL(m[1]).then(function (d) {
        box.style.backgroundImage = 'url("' + d + '")';
      }));
    });

    // 4. 清掉本项目自加的标记属性
    [].forEach.call(clone.querySelectorAll('*'), function (n) {
      n.removeAttribute('data-pb-img');
      n.removeAttribute('data-pb-protect');
      n.removeAttribute('data-pb-top');
      n.removeAttribute('data-pb-mt');
      n.removeAttribute('data-pb-mb');
      n.removeAttribute('data-maque');
      n.removeAttribute('data-maque-box-index');
      if (n.getAttribute('class') === '') n.removeAttribute('class');
    });

    return Promise.all(jobs).then(function () {
      // 5. 外层包一层，保证公众号里宽度自适应。
      //    注意顺序：先把 margin/padding 归零，再叠加根节点自己的内联样式，
      //    否则「排版缩放（内边距）」会被 padding:0 覆盖掉。
      var wrap = document.createElement('section');
      var inline = (clone.getAttribute('style') || '').trim();
      wrap.setAttribute(
        'style',
        'margin:0;padding:0;' + BASE_CSS + (inline ? inline.replace(/;?$/, ';') : '')
      );
      while (clone.firstChild) wrap.appendChild(clone.firstChild);
      clone.removeAttribute('style');
      clone.removeAttribute('class');
      return wrap.outerHTML;
    });
  }

  /**
   * 复制到剪贴板（富文本）
   * @returns {Promise<boolean>}
   */
  function copyRich(root) {
    return toCopyHtml(root).then(function (html) {
      // 优先 ClipboardItem（保留格式）
      if (global.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
        try {
          var item = new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([root.innerText || ''], { type: 'text/plain' }),
          });
          return navigator.clipboard.write([item]).then(function () { return true; });
        } catch (e) {
          // 落到 execCommand
        }
      }
      return legacyCopy(html);
    });
  }

  /** 兼容方案：选中临时节点后 execCommand('copy') */
  function legacyCopy(html) {
    return new Promise(function (resolve) {
      var box = document.createElement('div');
      box.contentEditable = 'true';
      box.style.cssText =
        'position:fixed;left:-9999px;top:0;width:420px;opacity:0;pointer-events:none;';
      box.innerHTML = html;
      document.body.appendChild(box);

      var range = document.createRange();
      range.selectNodeContents(box);
      var sel = global.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);

      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }

      sel.removeAllRanges();
      box.remove();
      resolve(ok);
    });
  }

  /* ---------------- 导出长图 ---------------- */

  /**
   * foreignObject 里的内容拿不到外部样式表，所以把计算样式逐个内联。
   * 只挑影响排版的属性，避免生成一堆无用 CSS。
   */
  var COPY_PROPS = [
    'font-size', 'font-weight', 'font-style', 'line-height', 'color',
    'text-align', 'letter-spacing', 'text-decoration-line', 'text-indent',
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'display', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items',
    'align-self', 'flex-grow', 'flex-shrink', 'flex-basis', 'gap', 'row-gap', 'column-gap',
    'width', 'height', 'max-width', 'min-width', 'max-height',
    'border-radius', 'box-shadow', 'overflow',
    'background-color', 'background-image', 'background-size',
    'background-position', 'background-repeat',
    'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
    'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
    'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
    'vertical-align', 'object-fit', 'box-sizing', 'list-style-type', 'opacity',
  ];

  function inlineStyles(src, dst) {
    var cs = getComputedStyle(src);
    var css = '';
    for (var i = 0; i < COPY_PROPS.length; i++) {
      var p = COPY_PROPS[i];
      var v = cs.getPropertyValue(p);
      if (!v || v === 'none' && /background-image|box-shadow/.test(p)) continue;
      if (v === 'normal' && p === 'letter-spacing') continue;
      if (v === 'rgba(0, 0, 0, 0)' && p === 'background-color') continue;
      css += p + ':' + v + ';';
    }
    dst.setAttribute('style', css + (dst.getAttribute('style') || ''));

    var sc = src.children;
    var dc = dst.children;
    for (var j = 0; j < sc.length && j < dc.length; j++) {
      inlineStyles(sc[j], dc[j]);
    }
  }

  /**
   * DOM → Canvas（SVG foreignObject 方案，零依赖）
   * @param {HTMLElement} root
   * @param {number} scale 2 = 2 倍图
   */
  function toCanvas(root, scale) {
    scale = scale || 2;
    var w = Math.ceil(root.offsetWidth);
    var h = Math.ceil(root.scrollHeight);
    if (!w || !h) return Promise.reject(new Error('内容为空'));

    var clone = root.cloneNode(true);
    [].forEach.call(clone.querySelectorAll('.pb-hover, .pb-hover-parent'), function (n) {
      n.classList.remove('pb-hover');
      n.classList.remove('pb-hover-parent');
    });

    // 先把整棵树的计算样式内联（此时 clone 还不在文档里，需要对照原树）
    inlineStyles(root, clone);

    // 图片转 dataURL，避免 canvas 被污染
    var imgs = [].slice.call(clone.querySelectorAll('img'));
    var jobs = imgs.map(function (img) {
      var src = img.getAttribute('src') || '';
      if (/^data:/.test(src)) return Promise.resolve();
      return imgToDataURL(src).then(function (d) { img.setAttribute('src', d); });
    });
    var boxes = [].slice.call(clone.querySelectorAll('[data-pb-protect="1"]'));
    boxes.forEach(function (box) {
      var m = /url\("?([^")]+)"?\)/.exec(box.style.backgroundImage || '');
      if (!m) return;
      jobs.push(imgToDataURL(m[1]).then(function (d) {
        box.style.backgroundImage = 'url("' + d + '")';
      }));
    });

    return Promise.all(jobs).then(function () {
      var holder = document.createElement('div');
      holder.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
      holder.style.cssText = 'width:' + w + 'px;background:#fff;';
      while (clone.firstChild) holder.appendChild(clone.firstChild);

      var xhtml = new XMLSerializer().serializeToString(holder);
      var svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '">' +
        '<foreignObject x="0" y="0" width="' + w + '" height="' + h + '">' +
        xhtml +
        '</foreignObject></svg>';

      var url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

      return new Promise(function (resolve, reject) {
        var img = new Image();
        img.onload = function () {
          var c = document.createElement('canvas');
          c.width = w * scale;
          c.height = h * scale;
          var ctx = c.getContext('2d');
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, c.width, c.height);
          ctx.drawImage(img, 0, 0, c.width, c.height);
          resolve(c);
        };
        img.onerror = function () { reject(new Error('图像生成失败')); };
        img.src = url;
      });
    });
  }

  /**
   * 下载长图
   * @param {HTMLElement} root
   * @param {string} name
   * @param {number} scale
   */
  function downloadImage(root, name, scale) {
    return toCanvas(root, scale).then(function (canvas) {
      return new Promise(function (resolve, reject) {
        canvas.toBlob(function (blob) {
          if (!blob) return reject(new Error('导出失败'));
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = (name || '排版长图') + '.png';
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
          resolve(blob.size);
        }, 'image/png');
      });
    });
  }

  /**
   * 复制图片到剪贴板
   */
  function copyImage(root, scale) {
    return toCanvas(root, scale || 2).then(function (canvas) {
      return new Promise(function (resolve, reject) {
        canvas.toBlob(function (blob) {
          if (!blob) return reject(new Error('生成失败'));
          if (global.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
            navigator.clipboard
              .write([new ClipboardItem({ 'image/png': blob })])
              .then(function () { resolve(true); })
              .catch(reject);
          } else {
            reject(new Error('浏览器不支持复制图片'));
          }
        }, 'image/png');
      });
    });
  }

  global.PBExport = {
    toCopyHtml: toCopyHtml,
    copyRich: copyRich,
    toCanvas: toCanvas,
    downloadImage: downloadImage,
    copyImage: copyImage,
  };
})(window);

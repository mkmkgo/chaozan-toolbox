/* ==========================================================
   模板定义
   pattern：一行内各列的相对宽度，按顺序循环取用
   ========================================================== */
(function () {
  var PB = (window.PB = window.PB || {});

  PB.TEMPLATES = [
    {
      id: 'single',
      name: '单图流',
      pattern: [[1]],
      // 缩略图示意：一行一个
      icon: [[100]]
    },
    {
      id: 'double',
      name: '双图并排',
      pattern: [[1, 1]],
      icon: [[46, 46]]
    },
    {
      id: 'triple',
      name: '三图并排',
      pattern: [[1, 1, 1]],
      icon: [[30, 30, 30]]
    },
    {
      id: 'grid',
      name: '九宫格',
      pattern: [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
      icon: [[30, 30, 30], [30, 30, 30]]
    },
    {
      id: 'wide-left',
      name: '左大右小',
      pattern: [[2, 1], [1, 2]],
      icon: [[62, 30], [30, 62]]
    },
    {
      id: 'mosaic',
      name: '错落拼贴',
      pattern: [[1], [1, 1], [1, 1, 1]],
      icon: [[100], [46, 46]]
    },
    {
      id: 'card',
      name: '卡片',
      pattern: [[1]],
      card: true,
      icon: [[80]]
    },
    {
      id: 'seamless',
      name: '无缝长图',
      pattern: [[1]],
      seamless: true,
      icon: [[100]]
    },
    {
      id: 'waterfall',
      name: '双列瀑布',
      pattern: [[1, 1]],
      masonry: true,
      icon: [[46], [46]]
    },
    {
      id: 'mixed',
      name: '图文混排',
      pattern: [[1, 1]],
      interleave: true,
      icon: [[46, 46], [100]]
    }
  ];

  PB.getTemplate = function (id) {
    for (var i = 0; i < PB.TEMPLATES.length; i++) {
      if (PB.TEMPLATES[i].id === id) return PB.TEMPLATES[i];
    }
    return PB.TEMPLATES[0];
  };

  /**
   * 按模板把 N 张图切成若干行。
   * 返回 [{ pat: 完整列宽数组, idxs: 本行实际图片下标数组 }]
   */
  PB.rowsFor = function (tpl, count) {
    var rows = [];
    var i = 0;
    var p = 0;
    while (i < count) {
      var pat = tpl.pattern[p % tpl.pattern.length];
      var take = Math.min(pat.length, count - i);
      var idxs = [];
      for (var k = 0; k < take; k++) idxs.push(i + k);
      rows.push({ pat: pat, idxs: idxs });
      i += take;
      p++;
    }
    return rows;
  };
})();

/**
 * 公众号排版模板库
 *
 * 共 33 套布局模板。每套模板是纯 inline-style 的 <section> 嵌套结构，
 * 图片位由 data-maque="1" + data-maque-box-index="n" 标记，渲染时按顺序填入用户图片。
 *
 * 数据来源：整理自公开可访问的公众号排版模板布局（仅收录免费模板）。
 * 本文件仅包含布局结构，不含任何第三方图片素材与品牌元素。
 */
window.PB_TEMPLATES = [
  {
    "id": 22,
    "title": "单图填满",
    "imgs": 1,
    "html": "<section style=\"display: flex; flex-flow: row; text-align: center; justify-content: center; margin-bottom: 15px;box-shadow: rgb(212 212 212) 1px 3px 5px 3px;border-radius: 4px;overflow: hidden;\"><section style=\"width: 100%; height: auto;overflow: hidden;\"><img style=\"height: auto !important;visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"0\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 0,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 38,
    "title": "文案带序号单图",
    "imgs": 1,
    "html": "<section class=\"mq_layout_box insert_insert_box\" data-mq-box-parent=\"1\"><section style=\"margin: 0px 0px -23px 38px;padding:0px;outline:0px;max-width:100%;font-style:normal;font-weight:400;text-indent:0px;text-transform:none;word-spacing:0px;white-space:normal;font-size:36px;letter-spacing:1.5px;color:#86A9A7;visibility:visible;transform: rotate(0deg);\"><strong style=\"margin:0px;padding:0px;outline:0px;max-width:100%;box-sizing:border-box !important;overflow-wrap:break-word !important;visibility:visible;\">#文案序号#</strong></section><section style=\"margin:0px 0px -4px 25px;padding:0px;outline:0px;max-width:100%;color:rgba(0, 0, 0, 0.9);text-indent:0px;word-spacing:0px;display:flex;align-items:center;visibility:visible;\"><section style=\"margin:0px;padding:0px;outline:0px;max-width:100%;box-sizing:border-box !important;overflow-wrap:break-word !important;width:7px;height:7px;background-color:#86A9A7;border-radius:50%;overflow:hidden;visibility:visible;\"><br></section><section style=\"margin:0px;padding:0px;outline:0px;max-width:100%;box-sizing:border-box !important;overflow-wrap:break-word !important;width:59px;height:1px;background-color:rgb(255,255,255);overflow:hidden;visibility:visible;\"><br></section></section><section style=\"margin:0px;padding:30px 25px;outline:0px;max-width:100%;box-sizing:border-box !important;font-size:17px;border-width:1px;border-style:solid;border-color:#86A9A7;border-radius:12px;\"><section style=\"max-width:100%;box-sizing:border-box !important;text-align:justify;line-height:1.75em;letter-spacing:1.5px;font-size:14px;color:rgb(51, 51, 51);\"><p style=\"margin:0px;padding:0px;outline:0px;max-width:100%;box-sizing:border-box !important;overflow-wrap:break-word !important;clear:both;min-height:1em;vertical-align:inherit;visibility:visible;\">#文案#</p><img src=\"https://img.toai.art/mqwx_permanent_img/pai_ban_su_cai/img/20250627/tx.webp\" alt=\"default_tx.png\" data-maque-box-index=\"0\" data-maque=\"1\" style=\"margin-top: 15px;width: 100%;border-radius: 10px;\" data-w=\"144\" data-ratio=\"1\"></section></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 1,
    "bfb": 1,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 48,
    "title": "3:2固定高度",
    "imgs": 1,
    "html": "<section style=\"display: flex; flex-flow: row; text-align: center; justify-content: center; margin-bottom: 5px;  \" data-mq-box-parent=\"1\" class=\"mq_auto_last_parent\"><section style=\"width: 45%;aspect-ratio: 3 / 2;margin: 10px;border-radius: 2px;overflow: hidden;\"><img style=\"object-fit: cover;min-height: 100%!important;visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"1\" data-w=\"300\" data-ratio=\"1.06\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 0,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 65,
    "title": "PC单图壁纸",
    "imgs": 1,
    "html": "<section style=\"display: flex;flex-flow: row;text-align: center;justify-content: center;margin-bottom: 12px;\" data-mq-box-parent=\"1\"><section style=\"width: 60%;border-radius: 2px;overflow: hidden;\"><img style=\"object-fit: cover;aspect-ratio: 2 / 1;width: 100%;min-height: 100% !important;visibility: visible !important;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"1\" data-w=\"1080\" data-ratio=\"2.172222222222222\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 1,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 83,
    "title": "电脑桌面无图标",
    "imgs": 1,
    "html": "<section style=\"width: 100%;aspect-ratio: 1.77049 / 1;overflow: hidden;margin-bottom: 10px;\" class=\"mq_auto_last_parent\" data-mq-box-parent=\"1\"><img src=\"https://img.toai.art/mqwx_permanent_img/2025/08/b5459fc77b90878fda385d00918c5145u1.webp/webp\" style=\"width:100%;min-width:100%;min-height:100%;max-height:100%;object-fit: cover;vertical-align:top;\" data-maque-box-index=\"0\" data-maque=\"1\" data-w=\"300\" data-ratio=\"1\" data-s=\"300,640\"></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 1,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 84,
    "title": "16:9单图（固定高度）",
    "imgs": 1,
    "html": "<section style=\"display: flex; flex-flow: row; text-align: center; justify-content: center; margin-bottom: 5px;  \" data-mq-box-parent=\"1\" class=\"mq_auto_last_parent\"><section style=\"width: 45%;aspect-ratio: 16 / 9;margin: 10px;border-radius: 2px;overflow: hidden;\"><img style=\"object-fit: cover;min-height: 100%!important;visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\" data-s=\"300,640\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 1,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 85,
    "title": "单图（自由高度）",
    "imgs": 1,
    "html": "<section style=\"display: flex; flex-flow: row; text-align: center; justify-content: center; margin-bottom: 5px;  \" data-mq-box-parent=\"1\" class=\"mq_auto_last_parent\"><section style=\"width: 45%;margin: 10px;border-radius: 2px;overflow: hidden;\"><img style=\"width: 100%;vertical-align: top;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\" data-s=\"300,640\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 1,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 94,
    "title": "无缝大图",
    "imgs": 1,
    "html": "<section style=\"display: flex;flex-flow: row;text-align: center;justify-content: center;overflow: hidden;\" data-mq-box-parent=\"1\"><section style=\"width: 100%; height: auto;overflow: hidden;\"><img style=\"height: auto !important;visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"0\" data-w=\"144\" data-ratio=\"1\" data-s=\"300,640\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 1,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 5,
    "title": "双图模板圆角无阴影",
    "imgs": 2,
    "html": "<section style=\"display: flex; flex-flow: row; text-align: center; justify-content: center; margin-bottom: 5px;align-items: flex-start;\"><section style=\"flex:1; height: auto; margin: 10px 10px 10px 20px;overflow: hidden;border-radius: 8px;\"><img style=\"height: auto !important;visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"1\"></section><section style=\"flex:1; height: auto; margin: 10px 20px 10px 10px;overflow: hidden;border-radius: 8px;\"><img style=\"height: auto !important;visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"1\" data-maque=\"1\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 0,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 9,
    "title": "双图点点边",
    "imgs": 2,
    "html": "<section style=\"display: flex; flex-flow: row; text-align: center; justify-content: center; margin-bottom: 5px;\"><section style=\"flex:1;margin: 10px 10px 10px 20px;vertical-align: middle;\"><img style=\"object-fit: cover;visibility: visible !important;width: 100%;border-style: dashed;border-width: 2px;border-color: rgb(211, 204, 197);\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"1\"></section><section style=\"flex:1;margin: 10px 20px 10px 10px;vertical-align: middle;\"><img style=\"object-fit: cover;visibility: visible !important;width: 100%;border-style: dashed;border-width: 2px;border-color: rgb(211, 204, 197);\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"1\" data-maque=\"1\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 0,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 21,
    "title": "双图无圆角无阴影",
    "imgs": 2,
    "html": "<section style=\"display: flex; flex-flow: row; text-align: center; justify-content: center; margin-bottom: 5px;  \"><section style=\"flex:1; height: auto; margin: 10px 10px 10px 20px;overflow: hidden; \"><img style=\"height: auto !important;visibility: visible !important;width: 100%;vertical-align: bottom\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"1\"></section><section style=\"flex:1; height: auto; margin: 10px 20px 10px 10px;overflow: hidden;\"><img style=\"height: auto !important;visibility: visible !important;width: 100%;vertical-align: bottom\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"1\" data-maque=\"1\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 0,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 23,
    "title": "双图模板带阴影(壁纸)",
    "imgs": 2,
    "html": "<section style=\"display: flex; flex-flow: row; text-align: center; justify-content: center; margin-bottom: 5px;  \"><section style=\"flex:1; aspect-ratio: 1 / 2; margin: 10px 10px 10px 20px; border-radius: 2px; overflow: hidden; box-shadow: rgb(160, 160, 160) 1px 3px 5px 3px; \"><img style=\"object-fit: cover;min-height: 100%!important;aspect-ratio: 1 / 2;visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"1\"></section><section style=\"flex:1;aspect-ratio: 1 / 2; margin: 10px 20px 10px 10px; border-radius: 3px; overflow: hidden; box-shadow: rgb(160, 160, 160) 1px 3px 5px 3px;  \"><img style=\"object-fit: cover;min-height: 100%!important;aspect-ratio: 1 / 2;visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"1\" data-maque=\"1\" alt=\"图��\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 0,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 27,
    "title": "电脑壁纸双图(固定高度)",
    "imgs": 2,
    "html": "<section style=\"display: flex; flex-flow: row; text-align: center; justify-content: center; margin-bottom: 5px;  \"><section style=\"flex:1;margin: 10px;border-radius: 2px;overflow: hidden;\"><img style=\"object-fit: cover;aspect-ratio: 2 / 1;width: 100%;min-height: 100% !important;visibility: visible !important;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"1\"></section><section style=\"flex:1;margin: 10px;border-radius: 3px;overflow: hidden;\"><img style=\"object-fit: cover;aspect-ratio: 2 / 1;width: 100%;min-height: 100% !important;visibility: visible !important;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"1\" data-maque=\"1\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 0,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 33,
    "title": "双图浅色背景",
    "imgs": 2,
    "html": "<section style=\"display: flex;flex-flow: row;text-align: center;justify-content: center;margin-bottom: 20px;padding: 8px;background-color: #f2f7ff;border-radius: 10px;\" data-mq-box-parent=\"1\"><section style=\"flex:1;aspect-ratio: 1 / 1;margin: 10px 10px 10px 20px;border-radius: 6px;overflow: hidden;\"><img style=\"object-fit: cover;min-height: 100%!important;aspect-ratio: 1 / 1;visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"1\"></section><section style=\"flex:1;aspect-ratio: 1 / 1;margin: 10px 20px 10px 10px;border-radius: 6px;overflow: hidden;\"><img style=\"object-fit: cover;min-height: 100%!important;aspect-ratio: 1 / 1;visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"1\" data-maque=\"1\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 1,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 39,
    "title": "双图头像单图带边框不对称(固定高度)",
    "imgs": 2,
    "html": "<section style=\"display: flex; flex-flow: row; text-align: center; justify-content: center; margin-bottom: 5px;  \" data-mq-box-parent=\"1\"><section style=\"flex:1;aspect-ratio: 1 / 1;margin: 10px 10px 10px 10px;border-radius: 16px;overflow: hidden;box-sizing: border-box;padding: 10px;background-color: #fff;box-shadow: rgb(237 237 237) 1px 3px 5px 3px;\"><img style=\"object-fit: cover;min-height: 100%!important;aspect-ratio: 1 / 1;visibility: visible !important;width: 100%;vertical-align: bottom;border-radius: 10px;\" src=\"https://img.toai.art/mqwx_permanent_img/pai_ban_su_cai/img/20250627/tx.webp\" data-maque-box-index=\"0\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\"></section><section style=\"flex:1;aspect-ratio: 1 / 1;margin: 10px 10px 10px 10px;border-radius: 16px;overflow: hidden;box-sizing: border-box;padding: 7px;\"><img style=\"object-fit: cover;min-height: 100%!important;aspect-ratio: 1 / 1;visibility: visible !important;width: 100%;vertical-align: bottom;border-radius: 13px;\" src=\"https://img.toai.art/mqwx_permanent_img/pai_ban_su_cai/img/20250627/tx.webp\" data-maque-box-index=\"1\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 1,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 43,
    "title": "无阴影无圆角头像模板",
    "imgs": 2,
    "html": "<section style=\"display: flex; flex-flow: row; text-align: center; justify-content: center; margin-bottom: 5px;  \" data-mq-box-parent=\"1\"><section style=\"flex:1;aspect-ratio: 1 / 1;margin: 10px 10px 10px 20px;border-radius: 2px;overflow: hidden;\"><img style=\"object-fit: cover;min-height: 100%!important;aspect-ratio: 1 / 1;visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\"></section><section style=\"flex:1;aspect-ratio: 1 / 1;margin: 10px 20px 10px 10px;border-radius: 3px;overflow: hidden;\"><img style=\"object-fit: cover;min-height: 100%!important;aspect-ratio: 1 / 1;visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"1\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 0,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 69,
    "title": "ipad壁纸双图3:2.2(固定高度)",
    "imgs": 2,
    "html": "<section style=\"display: flex; flex-flow: row; text-align: center; justify-content: center; margin-bottom: 5px;  \" data-mq-box-parent=\"1\"><section style=\"flex:1;margin: 10px;border-radius: 6px;overflow: hidden;box-shadow: rgb(231 231 231) 3px 3px 17px 0px;\"><img style=\"object-fit: cover;aspect-ratio: 3 / 2.2;width: 100%;min-height: 100% !important;visibility: visible !important;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\"></section><section style=\"flex:1;margin: 10px;border-radius: 6px;overflow: hidden;box-shadow: rgb(231 231 231) 3px 3px 17px 0px;\"><img style=\"object-fit: cover;aspect-ratio: 3 / 2.2;width: 100%;min-height: 100% !important;visibility: visible !important;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"1\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 1,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 74,
    "title": "双图居左对齐",
    "imgs": 2,
    "html": "<section style=\"display: flex;flex-flow: row;text-align: center;justify-content: center;align-items: flex-start;margin: 8px 0px;\" data-mq-box-parent=\"1\" class=\"\" contenteditable=\"false\"><section style=\"flex:1;border-radius: 10px;overflow: hidden;\"><img style=\"visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"1\" data-w=\"700\" data-ratio=\"1\"></section><section style=\"flex:1;margin: 0px 10px;border-radius: 10px;overflow: hidden;\"><img style=\"visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"1\" data-maque=\"1\" data-w=\"700\" data-ratio=\"1\"></section><section style=\"flex:1;border-radius: 10px;overflow: hidden;opacity: 0;\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 1,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 2,
    "title": "三图模板不带阴影",
    "imgs": 3,
    "html": "<section style=\"display: flex;flex-flow: row;text-align: center;justify-content: center;align-items: flex-start;margin: 8px 10px;\"><section style=\"flex:1;border-radius: 10px;overflow: hidden;\"><img style=\"visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"1\"></section><section style=\"flex:1;margin: 0px 10px;border-radius: 10px;overflow: hidden;\"><img style=\"visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"1\" data-maque=\"1\"></section><section style=\"flex:1;border-radius: 10px;overflow: hidden;\"><img style=\"visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"2\" data-maque=\"1\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 0,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 11,
    "title": "三图带点点装饰",
    "imgs": 3,
    "html": "<section style=\"display: flex; flex-flow: row; text-align: center; justify-content: center; margin-bottom: 5px;\"><section style=\"flex:1;margin: 10px 5px 10px 20px;vertical-align: bottom;\"><img style=\"visibility: visible !important;width: 100%;min-height: 100%;border-style: dashed;border-width: 2px;border-color: rgb(211, 204, 197);\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"1\"></section><section style=\"flex:1;margin: 10px 5px;vertical-align: bottom;\"><img style=\"visibility: visible !important;width: 100%;min-height: 100%;border-style: dashed;border-width: 2px;border-color: rgb(211, 204, 197);\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"1\" data-maque=\"1\"></section><section style=\"flex:1;margin: 10px 20px 10px 5px;vertical-align: bottom;\"><img style=\"visibility: visible !important;width: 100%;min-height: 100%;border-style: dashed;border-width: 2px;border-color: rgb(211, 204, 197);\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"2\" data-maque=\"1\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 0,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 12,
    "title": "三图模板没圆角",
    "imgs": 3,
    "html": "<section style=\"display: flex; justify-content: space-around; align-items: center; padding: 5px 10px ; visibility: visible;\"><section style=\"flex: 1 1 0%; visibility: visible;\"><section style=\"border-radius: 0px;overflow: hidden; visibility: visible;\"><img data-maque=\"1\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" style=\"box-sizing: border-box; vertical-align: bottom; display: block; width: 100%; height: auto !important; max-width: 100% !important; visibility: visible !important;\"></section></section><section style=\"flex: 1 1 0%; margin-left: 10px; visibility: visible;\"><section style=\"border-radius: 0px;overflow: hidden; visibility: visible;\"><img data-maque=\"1\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"1\" data-fail=\"0\" style=\"box-sizing: border-box; vertical-align: bottom; display: block; width: 100%; height: auto !important; max-width: 100% !important; visibility: visible !important;\"></section></section><section style=\"flex: 1 1 0%; margin-left: 10px; visibility: visible;\"><section style=\"border-radius: 0px;overflow: hidden; visibility: visible;\"><img data-maque=\"1\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"2\" data-fail=\"0\" style=\"box-sizing: border-box; vertical-align: bottom; display: block; width: 100%; height: auto !important; max-width: 100% !important; visibility: visible !important;\"></section></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 0,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 29,
    "title": "三图头像模板带浅色背景（固定高度）",
    "imgs": 3,
    "html": "<section style=\"display: flex;flex-flow: row;text-align: center;justify-content: center;margin-bottom: 20px;padding: 8px;background-color: #f2f7ff;border-radius: 10px;\" data-mq-box-parent=\"1\"><section style=\"flex:1;aspect-ratio: 1 / 1;margin: 10px 10px 10px 20px;border-radius: 6px;overflow: hidden;\"><img style=\"object-fit: cover;min-height: 100%!important;aspect-ratio: 1 / 1;visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"1\"></section><section style=\"flex:1;aspect-ratio: 1 / 1;margin: 10px 10px 10px 10px;border-radius: 6px;overflow: hidden;\"><img style=\"object-fit: cover;min-height: 100%!important;aspect-ratio: 1 / 1;visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"1\" data-maque=\"1\"></section><section style=\"flex:1;aspect-ratio: 1 / 1;margin: 10px 20px 10px 10px;border-radius: 6px;overflow: hidden;\"><img style=\"object-fit: cover;min-height: 100%!important;aspect-ratio: 1 / 1;visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"2\" data-maque=\"1\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 1,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 50,
    "title": "三图紧凑型",
    "imgs": 3,
    "html": "<section style=\"display: flex;flex-flow: row;text-align: center;justify-content: center;align-items: flex-start;margin-top: 1px;\" data-mq-box-parent=\"1\"><section style=\"flex:1;overflow: hidden;\"><img style=\"visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\"></section><section style=\"flex:1;margin: 0px 1px;overflow: hidden;\"><img style=\"visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"1\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\"></section><section style=\"flex:1;overflow: hidden;\"><img style=\"visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"2\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 0,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 56,
    "title": "三图头像(固定高度)",
    "imgs": 3,
    "html": "<section style=\"display: flex;flex-flow: row;text-align: center;justify-content: center;margin-bottom: 12px;\" data-mq-box-parent=\"1\"><section style=\"flex:1;aspect-ratio: 1 / 1;margin: 0px 3px 0px 0px;border-radius: 10px;overflow: hidden;box-shadow: rgb(217 217 217) 2px 5px 7px 1px;\"><img style=\"object-fit: cover;aspect-ratio: 1 / 1;width: 100%;vertical-align: bottom;min-height: 100% !important;visibility: visible !important;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\"></section><section style=\"flex:1;aspect-ratio: 1 / 1;margin: 0px 9px 0px 9px;border-radius: 10px;overflow: hidden;box-shadow: rgb(217 217 217) 2px 5px 7px 1px;\"><img style=\"object-fit: cover;aspect-ratio: 1 / 1;width: 100%;vertical-align: bottom;min-height: 100% !important;visibility: visible !important;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"1\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\"></section><section style=\"flex:1;aspect-ratio: 1 / 1;margin: 0px 0px 0px 3px;border-radius: 10px;overflow: hidden;box-shadow: rgb(217 217 217) 2px 5px 7px 1px;\"><img style=\"object-fit: cover;aspect-ratio: 1 / 1;width: 100%;vertical-align: bottom;min-height: 100% !important;visibility: visible !important;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"2\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 0,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 68,
    "title": "电脑壁纸三图(固定高度)",
    "imgs": 3,
    "html": "<section style=\"display: flex;flex-flow: row;text-align: center;justify-content: center;margin-bottom: 10px;\" data-mq-box-parent=\"1\"><section style=\"flex:1;margin: 0px 10px;border-radius: 2px;overflow: hidden;\"><img style=\"object-fit: cover;aspect-ratio: 3 / 2;width: 100%;visibility: visible !important;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\"></section><section style=\"flex:1;margin: 0px;border-radius: 3px;overflow: hidden;\"><img style=\"object-fit: cover;aspect-ratio: 3 / 2;width: 100%;visibility: visible !important;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"1\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\"></section><section style=\"flex:1;margin: 0px 10px;border-radius: 3px;overflow: hidden;\"><img style=\"object-fit: cover;aspect-ratio: 3 / 2;width: 100%;visibility: visible !important;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"2\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 1,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 79,
    "title": "三图头像模板带浅色背景",
    "imgs": 3,
    "html": "<section style=\"display: flex;flex-flow: row;text-align: center;justify-content: center;margin-bottom: 20px;padding: 8px;background-color: #f2f7ff;border-radius: 10px;\" data-mq-box-parent=\"1\"><section style=\"flex:1;margin: 10px 10px 10px 20px;border-radius: 6px;overflow: hidden;\"><img style=\"object-fit: cover;min-height: 100%!important;visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"1\" data-w=\"321\" data-ratio=\"1.0093457943925233\"></section><section style=\"flex:1;margin: 10px 10px 10px 10px;border-radius: 6px;overflow: hidden;\"><img style=\"object-fit: cover;min-height: 100%!important;visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"1\" data-maque=\"1\" data-w=\"321\" data-ratio=\"1.0093457943925233\"></section><section style=\"flex:1;margin: 10px 20px 10px 10px;border-radius: 6px;overflow: hidden;\"><img style=\"object-fit: cover;min-height: 100%!important;visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"2\" data-maque=\"1\" data-w=\"321\" data-ratio=\"1.0093457943925233\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 1,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 3,
    "title": "四图模板",
    "imgs": 4,
    "html": "<section style=\"margin:20px 0px\"><section style=\"display: flex;flex-flow: row;text-align: center;justify-content: center;flex-direction: row;align-items: flex-end;\"><section style=\"width: 47%;box-sizing: border-box;padding: 0px 14px 0px 0px;\"><section style=\"padding: 10px;padding-bottom: 0;width: 100%;display: flex;background-color: rgba(244, 98, 57, 0.17);box-sizing: border-box\"><img style=\"visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"1\"></section></section><section style=\"flex:1;\"><img style=\"visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"1\" data-maque=\"1\"></section></section><section style=\"display: flex;flex-flow: row;text-align: center;justify-content: center;margin-bottom: 5px;flex-direction: row;align-items: flex-start;\"><section style=\"width: 47%;box-sizing: border-box;padding: 0px 14px 0px 0px;\"><section style=\"padding: 10px;width: 100%;display: flex;background-color: rgba(244, 98, 57, 0.17);box-sizing: border-box\"><img style=\"visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"2\" data-maque=\"1\"></section></section><section style=\"flex:1;margin-top: 10px;\"><img style=\"visibility: visible !important;width: 100%;vertical-align: bottom;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"3\" data-maque=\"1\"></section></section></section>",
    "top": "<section style=\"text-align: center; justify-content: center; display: flex; flex-flow: row; margin: 10px 0px; box-sizing: border-box; visibility: visible;\"><section style=\"display: inline-block; width: auto; vertical-align: top; align-self: flex-start; flex: 0 0 auto; min-width: 5%; max-width: 100%; height: auto; padding: 5px 3px; border-style: solid; border-width: 1px; border-color: rgb(62, 62, 62); border-radius: 50px; overflow: hidden; background-color: rgb(255, 255, 255); box-sizing: border-box; visibility: visible;\"><section style=\"text-align: left; justify-content: flex-start; display: flex; flex-flow: row; box-sizing: border-box; visibility: visible;\"><section style=\"display: inline-block; vertical-align: top; width: auto; align-self: flex-start; flex: 0 0 0%; height: auto; padding: 0px 3px; line-height: 0; box-sizing: border-box; visibility: visible;\"><section style=\"text-align: center; box-sizing: border-box; visibility: visible;\"><section style=\"display: inline-block; width: 10px; height: 10px; vertical-align: top; overflow: hidden; border-width: 0px; border-radius: 100%; border-style: none; border-color: rgb(62, 62, 62); background-color: rgb(249, 136, 136); box-sizing: border-box; visibility: visible;\"><svg viewBox=\"0 0 1 1\" style=\"float: left; line-height: 0; width: 0px; vertical-align: top; visibility: visible;\"></svg></section></section></section><section style=\"display: inline-block; vertical-align: top; width: auto; align-self: flex-start; flex: 0 0 0%; height: auto; padding: 0px 3px; line-height: 0; box-sizing: border-box; visibility: visible;\"><section style=\"text-align: center; margin: 0px; box-sizing: border-box; visibility: visible;\"><section style=\"display: inline-block; width: 10px; height: 10px; vertical-align: top; overflow: hidden; border-width: 0px; border-radius: 100%; border-style: none; border-color: rgb(62, 62, 62); background-color: rgb(255, 222, 110); box-sizing: border-box; visibility: visible;\"><svg viewBox=\"0 0 1 1\" style=\"float: left; line-height: 0; width: 0px; vertical-align: top; visibility: visible;\"></svg></section></section></section><section style=\"display: inline-block; vertical-align: top; width: auto; align-self: flex-start; flex: 0 0 0%; height: auto; padding: 0px 3px; line-height: 0; box-sizing: border-box; visibility: visible;\"><section style=\"text-align: center; box-sizing: border-box; visibility: visible;\"><section style=\"display: inline-block; width: 10px; height: 10px; vertical-align: top; overflow: hidden; border-width: 0px; border-radius: 100%; border-style: none; border-color: rgb(62, 62, 62); background-color: rgb(179, 215, 177); box-sizing: border-box; visibility: visible;\"><svg viewBox=\"0 0 1 1\" style=\"float: left; line-height: 0; width: 0px; vertical-align: top; visibility: visible;\"></svg></section></section></section></section></section></section>",
    "bottom": "",
    "wenan": 0,
    "bfb": 0,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 10,
    "title": "四图带点点装饰",
    "imgs": 4,
    "html": "<section style=\"display: flex; flex-flow: row; text-align: center; justify-content: center;\"><section style=\"flex:1;margin: 4px 3px 4px 0px;vertical-align: middle;\"><img style=\"visibility: visible !important;width: 100%;border-style: dashed;border-width: 2px;border-color: rgb(211, 204, 197);\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"1\"></section><section style=\"flex:1;margin: 4px 3px;vertical-align: middle;\"><img style=\"visibility: visible !important;width: 100%;border-style: dashed;border-width: 2px;border-color: rgb(211, 204, 197);\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"1\" data-maque=\"1\"></section><section style=\"flex:1;margin: 4px 3px;vertical-align: middle;\"><img style=\"visibility: visible !important;width: 100%;border-style: dashed;border-width: 2px;border-color: rgb(211, 204, 197);\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"2\" data-maque=\"1\"></section><section style=\"flex:1;margin: 4px 0px 4px 3px;vertical-align: middle;\"><img style=\"visibility: visible !important;width: 100%;border-style: dashed;border-width: 2px;border-color: rgb(211, 204, 197);\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"3\" data-maque=\"1\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 0,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 26,
    "title": "优化排版",
    "imgs": 4,
    "html": "<section style=\"margin: 0px 4%;display: flex;flex-flow: row;box-sizing: border-box;visibility: visible;\"><section style=\"flex: 1;vertical-align: bottom;padding: 0px 10px;box-sizing: border-box;visibility: visible;\"><section style=\"transform: rotateZ(353.88deg);box-sizing: border-box;visibility: visible;\"><section style=\"margin: 0.5em 0px; box-sizing: border-box; visibility: visible; box-shadow: rgb(202, 202, 202) 0px 3px 10.5px 0px;\"><section style=\"box-sizing: border-box;width: 100%;border: 0.3em solid rgb(255, 255, 255);display: inline-block;line-height: 0;height: auto !important;visibility: visible;\"><img data-maque=\"1\" data-maque-box-index=\"0\" style=\"vertical-align: middle; max-width: 100%; box-sizing: border-box; width: 100% !important; height: auto !important; visibility: visible !important;\" src=\"/pai-ban/assets/ph.svg\"></section></section></section><section style=\"width: 100%; transform: rotateZ(7.25deg); box-sizing: border-box; visibility: visible;\"><section style=\"margin: 0.5em 0px; box-sizing: border-box; visibility: visible; box-shadow: rgb(202, 202, 202) 0px 3px 10.5px 0px;\"><section style=\"box-sizing: border-box;width: 100%;border: 0.3em solid rgb(255, 255, 255);display: inline-block;line-height: 0;height: auto !important;visibility: visible;\"><img data-maque=\"1\" data-maque-box-index=\"2\" style=\"vertical-align: middle; max-width: 100%; box-sizing: border-box; width: 100% !important; height: auto !important; visibility: visible !important; \" src=\"/pai-ban/assets/ph.svg\"></section></section></section></section><section style=\"flex: 1;vertical-align: bottom;padding: 0px 10px;box-sizing: border-box;visibility: visible;\"><section style=\"width: 100%; transform: rotateZ(4.45deg); box-sizing: border-box; visibility: visible;\"><section style=\"margin: 0.5em 0px; box-sizing: border-box; visibility: visible; box-shadow: rgb(202, 202, 202) 0px 3px 10.5px 0px;\"><section style=\"box-sizing: border-box;width: 100%;border: 0.3em solid rgb(255, 255, 255);display: inline-block;line-height: 0;height: auto !important;visibility: visible;\"><img data-maque=\"1\" data-maque-box-index=\"1\" style=\"vertical-align: middle; max-width: 100%; box-sizing: border-box; width: 100% !important; height: auto !important; visibility: visible !important; \" src=\"/pai-ban/assets/ph.svg\"></section></section></section><section style=\"width: 100%; transform: rotateZ(349.89deg); box-sizing: border-box; visibility: visible;\"><section style=\"margin: 0.5em 0px; box-sizing: border-box; visibility: visible; box-shadow: rgb(202, 202, 202) 0px 3px 10.5px 0px;\"><section style=\"box-sizing: border-box;width: 100%;border: 0.3em solid rgb(255, 255, 255);display: inline-block;line-height: 0;height: auto !important;visibility: visible;\"><img data-maque=\"1\" data-maque-box-index=\"3\" style=\"vertical-align: middle; max-width: 100%; box-sizing: border-box; width: 100% !important; height: auto !important; visibility: visible !important; \" src=\"/pai-ban/assets/ph.svg\"></section></section></section></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 0,
    "copy": {
      "ios": false,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 55,
    "title": "四图壁纸",
    "imgs": 4,
    "html": "<section style=\"display: flex;flex-flow: row;text-align: center;justify-content: center;margin-bottom: 6px;\" data-mq-box-parent=\"1\"><section style=\"flex:1;aspect-ratio: 1 / 2;margin: 0px 3px 0px 0px;border-radius: 2px;overflow: hidden;\"><img style=\"object-fit: cover; aspect-ratio: 1 / 2; width: 100%; vertical-align: bottom; min-height: 100% !important; visibility: visible !important;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\"></section><section style=\"flex:1;aspect-ratio: 1 / 2;margin: 0px 3px 0px 3px;border-radius: 3px;overflow: hidden;\"><img style=\"object-fit: cover; aspect-ratio: 1 / 2; width: 100%; vertical-align: bottom; min-height: 100% !important; visibility: visible !important;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"1\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\"></section><section style=\"flex:1;aspect-ratio: 1 / 2;margin: 0px 3px 0px 3px;border-radius: 3px;overflow: hidden;\"><img style=\"object-fit: cover; aspect-ratio: 1 / 2; width: 100%; vertical-align: bottom; min-height: 100% !important; visibility: visible !important;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"2\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\"></section><section style=\"flex:1;aspect-ratio: 1 / 2;margin: 0px 0px 0px 3px;border-radius: 3px;overflow: hidden;\"><img style=\"object-fit: cover; aspect-ratio: 1 / 2; width: 100%; vertical-align: bottom; min-height: 100% !important; visibility: visible !important;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"3\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 1,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 75,
    "title": "五图大边距(灵活高度)",
    "imgs": 5,
    "html": "<section style=\"display: flex; justify-content: space-around; align-items: center; margin-top: 0px;padding: 10px ; visibility: visible;\" data-mq-box-parent=\"1\"><section style=\"flex: 1 1 0%;overflow: hidden;visibility: visible;\"><img data-maque=\"1\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" style=\"box-sizing: border-box;vertical-align: bottom;width: 100%;height: auto !important;max-width: 100% !important;visibility: visible !important;\" data-w=\"144\" data-ratio=\"1\" data-s=\"300,640\"></section><section style=\"flex: 1 1 0%;margin-left: 45px;overflow: hidden;visibility: visible;\"><img data-maque=\"1\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"1\" data-fail=\"0\" style=\"box-sizing: border-box;vertical-align: bottom;width: 100%;height: auto !important;max-width: 100% !important;visibility: visible !important;\" data-w=\"144\" data-ratio=\"1\" data-s=\"300,640\"></section><section style=\"flex: 1 1 0%;margin-left: 45px;overflow: hidden;visibility: visible;\"><img data-maque=\"1\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"2\" data-fail=\"0\" style=\"box-sizing: border-box;vertical-align: bottom;width: 100%;height: auto !important;max-width: 100% !important;visibility: visible !important;\" data-w=\"144\" data-ratio=\"1\" data-s=\"300,640\"></section><section style=\"flex: 1 1 0%;margin-left: 45px;overflow: hidden;visibility: visible;\" class=\"\"><img data-maque=\"1\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"3\" data-fail=\"0\" style=\"box-sizing: border-box;vertical-align: bottom;width: 100%;height: auto !important;max-width: 100% !important;visibility: visible !important;\" data-w=\"144\" data-ratio=\"1\" data-s=\"300,640\"></section><section style=\"flex: 1 1 0%;margin-left: 45px;overflow: hidden;visibility: visible;\" class=\"\"><img data-maque=\"1\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"4\" data-fail=\"0\" style=\"box-sizing: border-box;vertical-align: bottom;width: 100%;height: auto !important;max-width: 100% !important;visibility: visible !important;\" data-w=\"144\" data-ratio=\"1\" data-s=\"300,640\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 1,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 60,
    "title": "6图小头像模板(固定高度)",
    "imgs": 6,
    "html": "<section style=\"display: flex;flex-flow: row;text-align: center;justify-content: center;margin-bottom: 8px;\" data-mq-box-parent=\"1\"><section style=\"flex:1;aspect-ratio: 1 / 1;margin: 0px 6px 0px 4px;border-radius: 7px;overflow: hidden;box-shadow: rgb(224 224 224) 1px 4px 9px 1px;\"><img style=\"object-fit: cover;aspect-ratio: 1 / 1;width: 100%;vertical-align: bottom;min-height: 100% !important;visibility: visible !important;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\"></section><section style=\"flex:1;aspect-ratio: 1 / 1;margin: 0px 6px 0px 6px;border-radius: 7px;overflow: hidden;box-shadow: rgb(224 224 224) 1px 4px 9px 1px;\"><img style=\"object-fit: cover;aspect-ratio: 1 / 1;width: 100%;vertical-align: bottom;min-height: 100% !important;visibility: visible !important;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"1\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\"></section><section style=\"flex:1;aspect-ratio: 1 / 1;margin: 0px 6px 0px 6px;border-radius: 7px;overflow: hidden;box-shadow: rgb(224 224 224) 1px 4px 9px 1px;\"><img style=\"object-fit: cover;aspect-ratio: 1 / 1;width: 100%;vertical-align: bottom;min-height: 100% !important;visibility: visible !important;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"2\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\"></section><section style=\"flex:1;aspect-ratio: 1 / 1;margin: 0px 6px 0px 6px;border-radius: 7px;overflow: hidden;box-shadow: rgb(224 224 224) 1px 4px 9px 1px;\"><img style=\"object-fit: cover;aspect-ratio: 1 / 1;width: 100%;vertical-align: bottom;min-height: 100% !important;visibility: visible !important;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"3\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\"></section><section style=\"flex:1;aspect-ratio: 1 / 1;margin: 0px 6px 0px 6px;border-radius: 7px;overflow: hidden;box-shadow: rgb(224 224 224) 1px 4px 9px 1px;\"><img style=\"object-fit: cover;aspect-ratio: 1 / 1;width: 100%;vertical-align: bottom;min-height: 100% !important;visibility: visible !important;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"4\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\"></section><section style=\"flex:1;aspect-ratio: 1 / 1;margin: 0px 4px 0px 6px;border-radius: 7px;overflow: hidden;box-shadow: rgb(224 224 224) 1px 4px 9px 1px;\"><img style=\"object-fit: cover;aspect-ratio: 1 / 1;width: 100%;vertical-align: bottom;min-height: 100% !important;visibility: visible !important;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"5\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 1,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  },
  {
    "id": 86,
    "title": "6图小头像模板(灵活高度)",
    "imgs": 6,
    "html": "<section style=\"display: flex;flex-flow: row;margin-bottom: 8px;align-items: flex-start;\" data-mq-box-parent=\"1\"><section style=\"flex:1;margin: 0px 6px 0px 4px;border-radius: 7px;overflow: hidden;box-shadow: rgb(224 224 224) 1px 4px 9px 1px;\"><img style=\"width: 100%;vertical-align: bottom;min-height: 100% !important;visibility: visible !important;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"0\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\" data-s=\"300,640\"></section><section style=\"flex:1;margin: 0px 6px 0px 6px;border-radius: 7px;overflow: hidden;box-shadow: rgb(224 224 224) 1px 4px 9px 1px;\"><img style=\"width: 100%;vertical-align: bottom;min-height: 100% !important;visibility: visible !important;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"1\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\" data-s=\"300,640\"></section><section style=\"flex:1;margin: 0px 6px 0px 6px;border-radius: 7px;overflow: hidden;box-shadow: rgb(224 224 224) 1px 4px 9px 1px;\"><img style=\"width: 100%;vertical-align: bottom;min-height: 100% !important;visibility: visible !important;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"2\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\" data-s=\"300,640\"></section><section style=\"flex:1;margin: 0px 6px 0px 6px;border-radius: 7px;overflow: hidden;box-shadow: rgb(224 224 224) 1px 4px 9px 1px;\"><img style=\"width: 100%;vertical-align: bottom;min-height: 100% !important;visibility: visible !important;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"3\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\" data-s=\"300,640\"></section><section style=\"flex:1;margin: 0px 6px 0px 6px;border-radius: 7px;overflow: hidden;box-shadow: rgb(224 224 224) 1px 4px 9px 1px;\"><img style=\"width: 100%;vertical-align: bottom;min-height: 100% !important;visibility: visible !important;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"4\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\" data-s=\"300,640\"></section><section style=\"flex:1;margin: 0px 4px 0px 6px;border-radius: 7px;overflow: hidden;box-shadow: rgb(224 224 224) 1px 4px 9px 1px;\"><img style=\"width: 100%;vertical-align: bottom;min-height: 100% !important;visibility: visible !important;\" src=\"/pai-ban/assets/ph.svg\" data-maque-box-index=\"5\" data-maque=\"1\" data-w=\"144\" data-ratio=\"1\" data-s=\"300,640\"></section></section>",
    "top": "",
    "bottom": "",
    "wenan": 0,
    "bfb": 1,
    "copy": {
      "ios": true,
      "android": true,
      "pc": true
    }
  }
];

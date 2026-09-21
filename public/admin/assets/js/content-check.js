/**
 * ADWire 後台內容檢查器 (content-check.js)
 * ─────────────────────────────────────────────────────────────────────
 * 為何需要：
 *   閘門（scripts/check-site-output.mjs）只在 **build 時** 檢查，而且只有
 *   CI 抓得到後台資料。結果是：在後台輸入禁字，本機 build 永遠測不到，
 *   要等到 CI build 失敗才發現（2026-09-21 實際發生過）。
 *   本檔案把檢查提前到「打字那一刻」。
 *
 * 三類檢查：
 *   1. 禁止字句（必須修正）— 與 build 閘門同一份清單，含否定語境放行
 *   2. 大陸用語（建議修正）— 香港繁體應改用香港講法
 *   3. 簡體字（必須修正）— 已排除繁體同樣通用的字（涌／晒／里／斗／划 等）
 *
 * 用法（在編輯頁加入）：
 *   <script src="/admin/assets/js/content-check.js"></script>
 *   <script>
 *     ADWireContentCheck.attach({ fields: ['title','excerpt','content','tags'] });
 *   </script>
 *
 * 只要欄位 name 存在就會檢查；`content` 若由 TinyMCE 接管亦會自動同步。
 */
(function () {
  "use strict";

  // ── 1. 禁止字句（與 build 閘門同一份清單）────────────────────────────
  var FORBIDDEN = [
    "保證排名", "保證第一頁", "確保優先引用", "被所有 AI 推薦", "被所有AI推薦",
    "銀行級", "香港首選", "市場唯一", "私有化部署零外洩", "24 小時內回覆",
    "無限頁面優化", "高達 500%", "3-6 個月 ROI", "被 AI 優先推薦", "確保真實 ROI",
    "3-6 個月回本", "投資回報期", "平均流程效率提升", "平均效率提升", "數據準確率",
    "荷里活級", "確保合規安全", "24小時回覆", "香港領先", "領先市場", "優先推薦",
    "霸佔", "秒回", "權威答案", "指數級", "所有 AI 引擎", "地圖首位", "無限擴展",
    "十年不過時", "無縫銜接", "絕對可以", "秒開", "領先對手", "最高 ROI",
    "投入過百萬", "電影級", "成效最大化", "GPT-4", "Llama 3.1", "出現在第一位",
    "328%+", "保證第一", "保證首頁"
  ];

  /**
   * 否定語境標記 —— 與 build 閘門同步。
   * 有這些詞在附近，代表作者是在「告誡讀者」或「引述官方」，屬正確內容。
   * 刻意只收多字詞：裸「不」「無」會令真違規漏檢。
   */
  var NEGATION = [
    "不保證", "不會保證", "無法保證", "不能保證", "不可保證", "不成立", "不可信",
    "不可能", "不會", "並非", "不是", "拒絕", "沒有", "沒有人", "沒法", "無需",
    "不用", "無人能保證", "沒人能保證", "冇人能保證", "無代理能保證",
    "避免", "切勿", "不要", "提防", "當心", "警惕", "戒心", "停手", "另請高明",
    "質疑", "可信嗎", "騙", "誤導", "誇大", "虛假",
    "原文", "引述", "官方文件", "官方指引", "點名", "這樣寫"
  ];

  // ── 2. 大陸用語 → 香港用語（建議修正）──────────────────────────────
  // 只收「香港標準寫法一定唔同」的詞。已經係香港標準的（軟件、文案、
  // 人工智能、硬件、大數據、機器學習、聯網、高清、插件）一律不收，
  // 避免製造假警報令人不再相信這個工具。
  var MAINLAND = [
    ["服務器", "伺服器"],
    ["信息", "資訊"],   // 註：「信息流廣告」為業界通用，編輯可自行判斷是否接受
    ["反饋", "回饋"],
    ["轉化率", "轉換率"],
    ["落地頁", "著陸頁"],
    ["郵件", "電郵"],
    ["默認", "預設"],
    ["界面", "介面"],
    ["硬盤", "硬碟"],
    ["內存", "記憶體"],
    ["屏幕", "螢幕"],
    ["快遞", "速遞"],
    ["方便麵", "即食麵"],
    ["土豆", "薯仔"],
    ["西紅柿", "番茄"],
    ["公交", "巴士"],
    ["小票", "收據"],
    ["鼠標", "滑鼠"],
    ["光標", "游標"],
    ["缺省", "預設"],
    ["字符", "字元"],
    ["點贊", "讚好"],
    ["短信", "短訊"],
    ["激活", "啟動"],
    ["優盤", "USB 記憶棒"],
    ["視頻會議", "視像會議"],
    ["視頻剪輯", "影片剪輯"],
    ["算法", "演算法"],
    ["代碼", "程式碼"],
    ["編程", "程式設計"],
    ["程序員", "程式員"],
    ["緩存", "快取"],
    ["您好", "你好"],
    ["請您", "請你"],
    ["您們", "你們"]
  ];

  // ── 3. 簡體字（必須修正）───────────────────────────────────────────
  // 已排除在香港繁體同樣正確的字：涌（葵涌）、晒（做唔晒）、里（里程碑）、
  // 斗（漏斗）、划（划算）、强（部分字型變體，但仍建議用強）等。
  var SIMPLIFIED = "专为业东丝两严个丰临丽举义乌乐乔习乡书买乱争亏云亚产亩亲亿仅从仓仪们价众优会伟传伤伦伪体余俭侠侧侨储儿兑兰关兴养兽内冈册写军农冯冲决况冻净凉减凑凤凭凯击刘则刚创删刮剂剑剥剧劝办务动劳势勋区医华协单卖卢卤卫却厅历厉压厌厕厢厦厨县参丛双发变叙叶号叹吓吕吗听启吴呐呕员呜咏咸响哑哗哟唤喷团园围图圆圣场坏块坚坛坝坟坠垄垒垦垫执堕墙壮声壳壶处备复够头夹夺奋奖妇妈娱娇娄婴婵孙学宁宝实宠审宪宫宽宾对寻导寿将尔尘尝尧尽层属屿岁岗岛岭岳峡峦崭币帅师帐帘帜带帧帮并广庄庆库应庙庞废开异弃张弥弯弹归当录彻径忆忧怀态总恋恒恳恶恺恻恼悦悬惊惧惨惩惫惭惮惯愤愿懒戏战户扑扩扫扬扰抚抛抠抢护报担拟拢拣拥拦拧拨择挂挚挟挠挡挣挤挥捞损捡换捣据掳掷掺揽搀搁搂搅携摄摆摇摊撑攒敌敛数斋斩断无旧时昼显晋晒晓晔晕暂术机杀杂权杆条来杨杰极构枢枣枪枫柜柠栅标栈栋栏树栖样档桥桦桨桩梦检楼榄榈槛槟横樱橱橹欢欧歼残殡殴毁毕毙毡气氢汇汉汤汹沟沣沥沦沧沪泞泪泷泸泻泼泽洁洒洼浅浆浇浊测济浏浑浓浔涂涌涤润涧涨涩淀渊渍渎渐渔渗温湾湿溃溅滚滞满滤滥滨滩潇潜澜濑濒灭灯灵灾灿炉炖点炼炽烁烂烛烟烦烧烨烩烫烬热焕爱爷牵牺犊状犹狈狞独狭狮狰狱猎猬献玛玮环现玺珑琐琼瑶璎瓯电画畅畴疗疟疡疮疯痈痉痒痨痪痫瘫瘾癞癣癫皱盏盐监盖盗盘睁睐睑瞒瞩瞪矫矶矾矿码砖砚砺砾础硕硖确碍碱礼祷离秃秆种积称秽税稳穷窃窍窑窜窝窥窦竖竞笃笋笔笺笼筛筹签简箩箫篑篓篮篱类粮紧纠红纤纫纪纬纯纱纲纳纵纷纸纹纺纽线练组绅细织终绍绎经绑绒结绕绘给络绝绞统绢绣继绩绪绫续绮绯绳维绵绷绸综绽绿缀缄缅缆缉缎缓缔缕编缘缚缝缠缤缩缪缭缮缴网罗罚罢羁羡翘耸耻聂聋职联聪肃肠肤肮肾肿胀胁胆胜胶脉脏脐脑脓脚脱脸腊腻腾舆舰舱艰艳艺节芜芦苇苍苏苹茎茧荆药莱莲获莹莺萝萤营萧萨葱蒋蓝蓟蔷蕴虏虑虚虫虽虾蚀蚁蚂蚕蛊蛮蛰蜕蜗蜡蝇蝉蝎蝼衔补衬袄袜袭装裤见观规觅视览觉觊觎觐觞触誉计订认讨让讪训议讯记讲讳讶许讹论讼讽设访诀证评识诈诉诊词译试诗诚话诞诠诡询该详诫诬语误诱说诵请诸诺读诽课谁调谅谈谊谋谍谎谐谒谓谕谗谙谚谜谢谣谤谦谨谬谭谱谴谷贝贞负贡财责贤败账货质贩贪贫贬购贮贯贰贱贴贵贷贸费贺贼贾贿赁赂赃资赈赊赋赌赎赏赐赔赖赘赚赛赞赠赡赢赣赤赵赶趋跃践跷跻踊踌踪蹒躯车轧轨轩转轮软轰轴轶轻载轿较辅辆辈辉辐辑输辕辖辗辙辞辩辫边辽达迁过迈运还这进远违连迟迹适选逊递逻遗遥邓邮邻郁郑酝酱酿释里鉴针钉钓钒钗钙钛钝钞钟钠钡钢钥钦钧钨钩钮钱钳钴钵钻钼钾铀铁铂铃铅铆铉铌铍铎铐铑铒铕铙铛铜铝铠铡铢铣铤铧铨铬铭铮铰铲银铸铺链铿销锁锂锄锅锈锉锋锌锐锑锒错锚锡锢锣锤锥锦锨锭键锯锰锲锵锶锷锹锻镀镁镂镇镉镊镌镍镐镑镓镖镗镜镝镣镭镯镰镶长门闩闪闭问闯闰闲间闵闷闸闹闺闻闽阀阁阂阅阉阎阐阑阔阕阖阙队阳阴阵阶际陆陇陈陕陨险随隐隶难雏雾霁霉靓韦韧韩页顶顷项顺须顽顾顿颁颂预颅领颇颈颊颌颐频颓颔颖颗题颚颜额颠颤颧风飒飓飕飘飙飞饥饨饪饭饮饯饰饱饲饴饵饶饷饺饼饿馅馆馈馋馍馏馐馒马驭驮驯驰驱驳驴驶驹驻驼驾驿骁骂骄骆骇骈骊骋验骏骐骑骗骚骛骜骞骟骠骡骤骥骨髅髋髌鬓魇魉鱼鲁鲂鲅鲆鲇鲈鲍鲎鲐鲑鲔鲛鲜鲟鲠鲡鲢鲣鲤鲦鲧鲨鲩鲫鲭鲮鲱鲲鲳鲵鲶鲷鲸鲻鲼鲽鳃鳄鳅鳆鳇鳊鳌鳍鳎鳏鳐鳓鳔鳕鳖鳗鳙鳜鳝鳞鳟鳢鸟鸠鸡鸢鸣鸥鸦鸨鸩鸪鸫鸬鸭鸯鸱鸲鸳鸵鸶鸷鸽鸾鸿鹁鹂鹃鹄鹅鹆鹇鹈鹉鹊鹋鹌鹎鹏鹑鹕鹗鹘鹚鹛鹜鹞鹤鹦鹧鹨鹩鹪鹫鹬鹭鹰鹳麦麸黄黉黩黾鼋鼍鼹齐齿龀龃龄龅龆龇龈龉龊龋龌龙龚龛龟";

  // 上述字串中含「香港地名/粵語助詞」實際會用到的字，逐一豁免
  // ⚠️ 只豁免「繁體同樣正確」的字。「柜」不是 —— 正確繁體是「櫃」，
  //    所以不列入豁免（2026-09-21 測試時發現原本錯誤地豁免了它）。
  var SIMP_ALLOW = { "涌": 1, "晒": 1, "里": 1, "斗": 1, "划": 1, "强": 1 };

  // ── 檢查邏輯 ──────────────────────────────────────────────────────

  function stripHtml(html) {
    var d = document.createElement("div");
    d.innerHTML = String(html || "");
    return d.textContent || d.innerText || "";
  }

  function isQuoted(text, idx) {
    var before = text.slice(0, idx);
    var open = (before.match(/[「『]/g) || []).length;
    var close = (before.match(/[」』]/g) || []).length;
    return open > close;
  }

  /** 禁止字句：否定語境與引號內放行（與 build 閘門同一套規則） */
  function checkForbidden(raw) {
    var text = stripHtml(raw);
    var out = [];
    FORBIDDEN.forEach(function (phrase) {
      var from = 0, i;
      while ((i = text.indexOf(phrase, from)) !== -1) {
        var win = text.slice(Math.max(0, i - 60), i + phrase.length + 60);
        var negated = isQuoted(text, i) || NEGATION.some(function (m) { return win.indexOf(m) !== -1; });
        if (!negated) out.push({ word: phrase, ctx: text.slice(Math.max(0, i - 30), i + phrase.length + 30) });
        from = i + phrase.length;
      }
    });
    return out;
  }

  function checkMainland(raw) {
    var text = stripHtml(raw);
    var out = [];
    MAINLAND.forEach(function (pair) {
      var n = text.split(pair[0]).length - 1;
      if (n > 0) {
        var i = text.indexOf(pair[0]);
        out.push({
          word: pair[0],
          fix: pair[1],
          count: n,
          ctx: text.slice(Math.max(0, i - 25), i + pair[0].length + 25)
        });
      }
    });
    return out;
  }

  function checkSimplified(raw) {
    var text = stripHtml(raw);
    var found = {};
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (SIMP_ALLOW[ch]) continue;
      if (SIMPLIFIED.indexOf(ch) !== -1) {
        if (!found[ch]) {
          found[ch] = { word: ch, count: 0, ctx: text.slice(Math.max(0, i - 20), i + 20) };
        }
        found[ch].count++;
      }
    }
    return Object.keys(found).map(function (k) { return found[k]; });
  }

  // ── 面板 ─────────────────────────────────────────────────────────

  var PANEL_ID = "adwire-content-check-panel";

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function buildPanel() {
    var old = document.getElementById(PANEL_ID);
    if (old) old.remove();

    var p = el("div", "aw-cc-panel");
    p.id = PANEL_ID;

    var head = el("div", "aw-cc-head");
    var title = el("div", "aw-cc-title", "內容檢查");
    var toggle = el("button", "aw-cc-toggle", "收起");
    toggle.type = "button";
    head.appendChild(title);
    head.appendChild(toggle);
    p.appendChild(head);

    var body = el("div", "aw-cc-body");
    p.appendChild(body);

    toggle.addEventListener("click", function () {
      var hidden = p.classList.toggle("aw-cc-collapsed");
      toggle.textContent = hidden ? "展開" : "收起";
    });

    document.body.appendChild(p);
    return { panel: p, body: body, title: title };
  }

  function section(body, label, color, items, render) {
    if (!items.length) return;
    var h = el("div", "aw-cc-section-title aw-cc-" + color,
      label + "（" + items.length + "）");
    body.appendChild(h);
    items.forEach(function (it) {
      var row = el("div", "aw-cc-item aw-cc-" + color);
      var w = el("span", "aw-cc-word", it.word);
      row.appendChild(w);
      if (it.fix) {
        row.appendChild(el("span", "aw-cc-fix", "→ " + it.fix + (it.count > 1 ? " ×" + it.count : "")));
      } else if (it.count > 1) {
        row.appendChild(el("span", "aw-cc-fix", "×" + it.count));
      }
      if (it.ctx) row.appendChild(el("div", "aw-cc-ctx", "…" + it.ctx.trim() + "…"));
      if (it.field) row.appendChild(el("div", "aw-cc-field", "欄位：" + it.field));
      body.appendChild(row);
    });
  }

  /**
   * 檢查所有欄位，回傳總結果。
   * @param {string[]} fieldNames
   */
  function runCheck(fieldNames) {
    var forbidden = [], mainland = [], simplified = [];

    fieldNames.forEach(function (name) {
      var nodes = document.querySelectorAll('[name="' + name + '"]');
      if (!nodes.length) return;

      // TinyMCE 會隱藏原始 textarea，需由 editor 取內容
      var raw = "";
      if (window.tinymce && tinymce.get) {
        var ed = tinymce.get(nodes[0].id || name);
        if (ed && !ed.isHidden()) raw = ed.getContent();
      }
      if (!raw) {
        raw = Array.prototype.map.call(nodes, function (n) { return n.value || ""; }).join(" ");
      }

      checkForbidden(raw).forEach(function (x) { x.field = name; forbidden.push(x); });
      checkMainland(raw).forEach(function (x) { x.field = name; mainland.push(x); });
      checkSimplified(raw).forEach(function (x) { x.field = name; simplified.push(x); });
    });

    return { forbidden: forbidden, mainland: mainland, simplified: simplified };
  }

  var current = null;

  function refresh(fieldNames) {
    var ui = buildPanel();
    var res = runCheck(fieldNames);
    current = res;

    var must = res.forbidden.length + res.simplified.length;

    ui.title.textContent = must
      ? "內容檢查：必須修正 " + must + " 項"
      : (res.mainland.length ? "內容檢查：" + res.mainland.length + " 項建議" : "內容檢查：全部通過");
    ui.title.className = "aw-cc-title " + (must ? "aw-cc-bad" : (res.mainland.length ? "aw-cc-warn" : "aw-cc-good"));

    if (!must && !res.mainland.length) {
      ui.body.appendChild(el("div", "aw-cc-ok", "✅ 未發現禁止字句、大陸用語或簡體字。"));
    } else {
      section(ui.body, "禁止字句（必須修正，否則 build 會失敗）", "bad", res.forbidden);
      section(ui.body, "簡體字（必須修正）", "bad", res.simplified);
      section(ui.body, "大陸用語（建議改成香港講法）", "warn", res.mainland);
    }

    return res;
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  function attach(opts) {
    opts = opts || {};
    var fieldNames = opts.fields || ["title", "excerpt", "content", "tags"];
    var form = document.querySelector("form[method='POST']");
    if (!form) return;

    var doRefresh = debounce(function () { refresh(fieldNames); }, 600);

    // 綁定輸入事件
    fieldNames.forEach(function (n) {
      document.querySelectorAll('[name="' + n + '"]').forEach(function (node) {
        node.addEventListener("input", doRefresh);
        node.addEventListener("change", doRefresh);
      });
    });

    // TinyMCE 同步
    if (window.tinymce && tinymce.on) {
      tinymce.on("AddEditor", function (e) {
        e.editor.on("input change undo redo", doRefresh);
      });
      tinymce.on("init", doRefresh);
      setTimeout(doRefresh, 800);
    }

    // 提交前攔截：有「必須修正」就阻止，並要求確認
    form.addEventListener("submit", function (ev) {
      var res = current || runCheck(fieldNames);
      var must = res.forbidden.length + res.simplified.length;
      if (must > 0) {
        ev.preventDefault();
        var msg = "發現 " + must + " 項必須修正的內容：\n\n";
        res.forbidden.slice(0, 5).forEach(function (x) { msg += "· 禁止字句「" + x.word + "」（" + x.field + "）\n"; });
        res.simplified.slice(0, 5).forEach(function (x) { msg += "· 簡體字「" + x.word + "」（" + x.field + "）\n"; });
        msg += "\n這些內容會令網站 build 失敗。\n\n仍要儲存嗎？（建議先修正）";
        if (!window.confirm(msg)) return;
        form.submit();
      } else if (res.mainland.length > 0) {
        var m = "有 " + res.mainland.length + " 項大陸用語建議修改：\n\n";
        res.mainland.slice(0, 6).forEach(function (x) { m += "· 「" + x.word + "」→「" + x.fix + "」\n"; });
        m += "\n仍要儲存嗎？";
        if (!window.confirm(m)) ev.preventDefault();
      }
    });

    refresh(fieldNames);
  }

  window.ADWireContentCheck = { attach: attach, check: runCheck, FORBIDDEN: FORBIDDEN, MAINLAND: MAINLAND };
})();
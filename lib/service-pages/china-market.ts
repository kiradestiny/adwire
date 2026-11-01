import {
  BookOpen, Video, MessageSquare, Store, Sparkles, Users, ShieldAlert, Languages, Compass, Wallet,
} from "lucide-react";
import { CHINA_MARKET_FAQS } from "@/lib/service-faqs";
import type { ServicePageData } from "./types";

/**
 * 中國市場推廣 /services/china-market/（2026-11-01 改用統一服務頁模板）
 *
 * 關鍵字依據（DataForSEO，Google HK，2026-11-01）：小紅書專業號 ~880／月、
 * 小紅書企業號 ~170、小紅書推廣 ~110、小紅書廣告 ~110、抖音企業號 ~110；
 * 「中國市場推廣」只有 ~10。所以 H1／title 用小紅書、抖音，頁面講客人關心的事
 * （先做邊個平台、點開專業號、幾時見效、點收費），平台細節及開通流程收入
 * lib/service-deep-dive.ts 的摺疊「深入了解」（仍在 HTML 內，供搜尋及 AI 讀取）。
 *
 * 負責人指示（2026-11-01）：小紅書認證費以官方為準，頁面不寫金額，
 * 客人 WhatsApp 查詢時再確認。合作夥伴公司名稱不出現。
 * 過往項目數字（1,000 萬曝光、約 300% 轉化提升、約 80% 百度索引）屬負責人已核准，
 * 一律寫成「過往項目」，不可寫成承諾。
 */
export const CHINA_MARKET_PAGE: ServicePageData = {
  key: "china-market",
  crumb: "中國市場推廣",
  eyebrow: "小紅書・抖音・微信・大眾點評",
  h1: ["小紅書・抖音推廣", "香港品牌進軍內地市場"],
  lead:
    "內地客買嘢之前，會先上小紅書搵筆記、上抖音睇片、上大眾點評睇評價。我們幫香港品牌開通專業號、用內地語境做內容、配合 KOC 種草及投放，並按你的產品決定先做哪個平台，不會一開始就推銷全套。",
  promises: [
    "免費評估：按產品、客群及預算，建議先做哪一至兩個平台",
    "小紅書專業號（藍 V）、抖音企業號開通及帳號基建",
    "內容按內地語境重寫，每月報告分開平台數據及查詢、成交",
  ],
  whatsappMessage: "Hello ADWire，我想了解小紅書／內地推廣，想先評估應該做哪個平台。",
  contactService: "中國市場推廣",
  heroImage: {
    src: "https://assets.adwire.com.hk/services/china-market/xiaohongshu-feed-hong-kong-product.jpg",
    alt: "內地用戶在小紅書瀏覽生活種草筆記，桌上放着香港品牌護膚品及港式奶茶",
  },

  fit: {
    title: "30 秒自我檢查：你應該由邊度開始？",
    intro: "揀一個最似你現在情況的描述，我們會直接講建議點做。",
    options: [
      {
        label: "想開小紅書專業號，但唔知要咩文件",
        verdict: "fit",
        answer:
          "香港公司可以用商業登記證申請企業專業號（藍 V）。我們會先檢查行業類別、帳號名稱及商標，減少被退回；認證費用以小紅書官方當時公布為準，WhatsApp 查詢時會同你確認。",
      },
      {
        label: "已經有小紅書帳號，但冇流量",
        verdict: "fit",
        answer:
          "通常係內容語氣、選題或封面唔啱內地用戶，或者觸碰禁詞被限流。先做帳號診斷，再調整內容方向，配合少量 KOC 種草及薯條加熱。",
      },
      {
        label: "有門店，想內地客嚟到搵到我",
        verdict: "fit",
        answer:
          "先開通美團／大眾點評及高德地圖商戶，整理門店資料、相片、團購；再用小紅書筆記帶人流。純線上業務一般唔需要這一步。",
      },
      {
        label: "新品想喺內地一次過打響",
        verdict: "maybe",
        answer:
          "可以做整合推廣（KOL／KOC、內容、投放），但要先確認產品在內地可以合法銷售、有履約及客服安排，否則曝光再多亦轉化不到。",
      },
      {
        label: "想下個月就有大量內地訂單",
        verdict: "maybe",
        answer:
          "內容平台一般要 3–6 個月才較穩定；短期可以用投放加速，但回報取決於產品、定價及競爭。我們會先講清楚可量度的指標，不會承諾銷量。",
      },
      {
        label: "其實目標客人係香港人",
        verdict: "other",
        answer: "香港客人主要用 Google、Instagram、Facebook 及 WhatsApp，應該先做香港本地渠道。",
        href: "/services/social/",
        hrefLabel: "看社交媒體代管",
      },
    ],
  },

  problems: {
    title: "香港品牌做內地推廣，最常撞到的四件事",
    intro: "以下是客人來找我們之前最常講的情況：",
    items: [
      { icon: ShieldAlert, problem: "「筆記一出就被限流，唔知犯咗咩規。」", answer: "發佈前先過禁詞及平台規則檢查，敏感品類（美容、保健）的用字會逐條改。" },
      { icon: Languages, problem: "「照搬香港文案，內地客一睇就知唔係自己人。」", answer: "按內地語境重寫：選題、標題、語氣、封面都跟內地用戶習慣，而不是繁轉簡。" },
      { icon: Compass, problem: "「小紅書、抖音、微信都想做，唔知先做邊個。」", answer: "按產品及客群揀一至兩個平台先做好，有數據之後先加第二個，避免資源分散。" },
      { icon: Wallet, problem: "「之前請人做，淨係見到曝光數字，唔知有冇生意。」", answer: "月報分開平台數據（曝光、互動）及業務數據（查詢、到店、成交），唔用曝光代替成效。" },
    ],
  },

  how: {
    title: "內地推廣點樣一步步做起",
    intro: "以單一平台（例如小紅書）起步為例，示意圖會跟住步驟變化：",
    steps: [
      { title: "平台評估：揀啱第一個平台", desc: "按產品、客群、目標城市及預算，決定先做小紅書、抖音定大眾點評。" },
      { title: "帳號基建：專業號及主頁", desc: "開通專業號／企業號，按內地用戶的搜尋字眼設定名稱、簡介及主頁。" },
      { title: "內容種草：筆記、短片、KOC", desc: "按內地語境出內容，配合 KOC 真實試用，令搜尋你品牌時有足夠筆記。" },
      { title: "轉化及數據：查詢、到店、成交", desc: "投放加熱有效內容，導去私信、微信或門店，每月檢討再決定加碼。" },
    ],
  },

  deliverables: {
    title: "我們實際幫你做什麼",
    intro: "每項都可以單獨委託，亦可以組合成月度代運營。",
    items: [
      { icon: BookOpen, title: "小紅書專業號及代運營", desc: "藍 V 開通、主頁裝修、種草筆記、評論區經營、薯條及聚光投放。" },
      { icon: Video, title: "抖音企業號及短片", desc: "企業號開通、短片策劃拍攝剪輯、投放；有門店可配合本地生活。" },
      { icon: Users, title: "內地 KOL／KOC 種草", desc: "篩選配對博主、內容監修、發佈追蹤，由素人口碑到頭部合作。" },
      { icon: Store, title: "大眾點評、美團、高德", desc: "商戶後台開通、門店資料及相片、團購方案、口碑管理。" },
      { icon: MessageSquare, title: "微信及百度", desc: "公眾號、朋友圈廣告、百度百科及品牌搜尋結果整理。" },
      { icon: Sparkles, title: "內地 AI 平台 GEO", desc: "整理品牌資料，令 DeepSeek、豆包、Kimi 回答時有正確資料可引用。" },
    ],
  },

  compare: {
    title: "你的產品應該先做邊個平台？",
    intro: "一般性對照，實際要按產品定位、客群及預算判斷。唔肯定的話，WhatsApp 講你的產品，我們直接建議。",
    columns: ["", "主要用途", "較適合"],
    rows: [
      { item: "小紅書", values: ["種草、口碑、搜尋曝光", "美容護膚、母嬰、食品、生活消費、旅遊"] },
      { item: "抖音", values: ["短片流量、直播、本地生活", "需要用片展示的產品、餐飲及美容門店"] },
      { item: "大眾點評／美團", values: ["到店消費、團購、評價", "有實體門店的餐飲、美容、零售"] },
      { item: "微信", values: ["私域、會員、復購、客服", "已有客人的品牌（通常係第二階段）"] },
      { item: "百度及 AI 平台", values: ["品牌查證、長期搜尋可見度", "高單價或需要客人先做功課的產品"] },
    ],
    footnote: "大部分香港品牌由小紅書起步；有門店的品牌通常同時開大眾點評。",
  },

  pricing: {
    title: "內地推廣收費點計？",
    intro:
      "內地推廣的費用取決於平台數目、每月內容量，以及是否包含 KOL 及廣告費，所以我們先免費評估，再按範圍報價。可以由小做起：",
    factors: [
      { title: "帳號基建（一次性）", desc: "只做專業號／企業號開通、主頁設定及內容規劃，之後由你團隊自己經營。" },
      { title: "月度代運營", desc: "按每月筆記及短片數量報價，包括拍攝、發佈、評論區經營及月報。" },
      { title: "平台數目", desc: "先做一個平台成本最低；每加一個平台，內容及管理工作都會增加。" },
      { title: "KOL／KOC 及廣告費", desc: "博主費用及薯條、聚光、騰訊廣告等廣告費實報實銷，與服務費分開列明。" },
      { title: "拍攝要求", desc: "用你現有素材、在香港拍攝，或需要到內地實地拍攝。" },
      { title: "平台認證費", desc: "小紅書等平台的認證費由平台收取，以官方當時公布為準，報價時會一併說明。" },
    ],
    note: "我們不承諾曝光量、粉絲數或銷量；會在開始前議定可量度的指標及檢討週期，每月報告進度。",
  },

  proof: {
    title: "過往內地推廣項目",
    intro: "以下為過往個別項目的結果，取決於當時的產品、預算及投放期，並非對新項目的成效承諾。",
    items: [
      { title: "香港品牌年度內地營銷", industry: "跨渠道整合推廣", stat: "1,000 萬+", statLabel: "全網曝光", scope: "統籌小紅書、抖音、微信及 KOL 資源，品牌曝光與銷售轉化一併規劃；轉化率提升約 300%。" },
      { title: "品牌搜尋可見度", industry: "百度收錄優化", stat: "約 80%", statLabel: "百度索引率", scope: "整理品牌資料、新聞稿及內容分發，令品牌資訊可以被百度長期搜尋到。" },
      { href: "/blog/hong-kong-brand-china-market-guide/", title: "香港品牌進入內地市場攻略", industry: "延伸閱讀", stat: "指南", statLabel: "平台選擇及常見錯誤", scope: "整理香港品牌最常問的問題：先做邊個平台、要唔要內地主體、預算點分配。" },
    ],
  },

  process: {
    title: "合作流程",
    intro: "首 3 個月打好基礎，之後按數據決定加碼定調整。",
    steps: [
      { title: "免費平台評估", desc: "了解產品、客群及預算，建議先做哪個平台。", duration: "約 1 星期" },
      { title: "診斷及策略", desc: "競品筆記分析、禁詞及合規檢查、內容方向。", duration: "第 1–2 週" },
      { title: "帳號基建", desc: "專業號／企業號認證、主頁、首批內容拍攝。", duration: "第 3–6 週" },
      { title: "發佈及種草", desc: "固定節奏發佈、KOC 種草、評論區經營。", duration: "第 7–12 週" },
      { title: "投放加熱", desc: "將表現好的內容用薯條／聚光小額測試。", duration: "每月" },
      { title: "報告及加碼", desc: "每月報告，按數據決定加 KOL、廣告或第二個平台。", duration: "每月／每季" },
    ],
  },

  faqs: CHINA_MARKET_FAQS,

  related: [
    { href: "/services/hong-kong-market/", title: "香港市場推廣（反方向）", desc: "內地及海外品牌進軍香港，用香港人的語言落地。" },
    { href: "/services/kol/", title: "KOL 網紅營銷（香港）", desc: "香港本地 KOL 合作，與內地 KOC 種草分開規劃。" },
    { href: "/services/production/", title: "商業攝影及影片製作", desc: "一次拍攝，同時出小紅書圖文及抖音直片。" },
    { href: "/services/seo/", title: "SEO 及 GEO（國際平台）", desc: "Google、ChatGPT 等國際平台的搜尋可見度。" },
    { href: "/blog/hong-kong-brand-china-market-guide/", title: "香港品牌進入內地市場攻略", desc: "平台選擇、預算分配及常見錯誤。" },
    { href: "/blog/china-market-strategy-hong-kong/", title: "內地市場策略", desc: "香港品牌進入內地前要先答的問題。" },
  ],

  finalCta: {
    title: "免費評估：你的產品應該先做邊個平台？",
    desc: "WhatsApp 話我們知你的產品、目標城市及預算範圍，我們會建議先做的平台、內容方向及報價方式。",
  },
};

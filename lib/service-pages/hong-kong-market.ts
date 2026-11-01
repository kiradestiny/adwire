import {
  Languages, MessageCircle, Search, Megaphone, Users, ShieldCheck, Wallet, FileWarning,
} from "lucide-react";
import { HONG_KONG_MARKET_FAQS } from "@/lib/service-faqs";
import type { ServicePageData } from "./types";

/**
 * 香港市場推廣 /services/hong-kong-market/（2026-11-01 改用統一服務頁模板）
 *
 * 方向：內地及海外品牌 → 進入香港（與 /services/china-market/ 相反）。
 * 頁面只放客人決策需要的內容；用語對照表、合規細節、简体／English 摘要
 * 收入 lib/service-deep-dive.ts 的摺疊「深入了解」（仍在 HTML 內供搜尋及 AI 讀取）。
 * 案例只用 lib/clientShowcase.ts 已公開的真實客戶：FineNutri（內地品牌）、
 * OneOne HK（新加坡集團香港站）、南田貿易（日本食品代理）。
 */
export const HONG_KONG_MARKET_PAGE: ServicePageData = {
  key: "hong-kong-market",
  crumb: "香港市場推廣",
  eyebrow: "內地及海外品牌來港",
  h1: ["內地及海外品牌進軍香港", "用香港人的語言同渠道落地"],
  lead:
    "香港客人用 Google 搵資料、喺 Instagram 同 Facebook 認識品牌、用 WhatsApp 查詢，同內地完全唔同。我們幫品牌把文案改寫成地道香港用語，建立 Google、社交媒體、廣告及 WhatsApp 客服，令香港客人第一眼就覺得你係「識香港」的品牌。",
  promises: [
    "免費品牌診斷：列出文案、價錢表達、渠道在香港要改的地方",
    "由香港團隊執行：繁體中文、廣東話語境、本地 KOL 及拍攝",
    "按月服務有公開價：廣告代操 HK$4,000／月起、SEO HK$6,000／月起",
  ],
  whatsappMessage: "Hello ADWire，我們是準備進入香港市場的品牌，想了解推廣方案。",
  contactService: "香港市場在地化推廣",
  heroImage: {
    src: "https://assets.adwire.com.hk/services/hong-kong-market/causeway-bay-crossing.jpg",
    alt: "香港銅鑼灣黃昏時段的行人過路處，人流、紅色的士及電車，代表品牌要打入的香港消費市場",
  },

  fit: {
    title: "30 秒自我檢查：你的品牌準備好來港未？",
    intro: "揀一個最似你現在情況的描述，我們會直接講建議點做。",
    options: [
      {
        label: "內地品牌，準備開香港市場",
        verdict: "fit",
        answer:
          "先做品牌診斷及文案本地化，再建立 Google 商家檔案、社交帳號及 WhatsApp 客服，最後先開始投放。次序反過來，廣告費好容易浪費。",
      },
      {
        label: "已經喺香港賣緊，但反應麻麻",
        verdict: "fit",
        answer:
          "通常係用語、價錢表達或渠道唔啱香港客。我們會檢查現有廣告、網站及社交內容，指出最影響轉化的幾點。",
      },
      {
        label: "海外品牌，香港冇本地團隊",
        verdict: "fit",
        answer:
          "我們可以做你在香港的執行團隊：內容、廣告、KOL、拍攝及報告；你只需要對接一個聯絡人，報告可提供中英文。",
      },
      {
        label: "只想把簡體內容轉做繁體",
        verdict: "maybe",
        answer:
          "繁轉簡只係字形，用語、語氣、價錢表達都唔同。可以只做文案本地化（一次性），但建議至少改寫主要頁面及廣告文案。",
      },
      {
        label: "未有香港公司或者送貨安排",
        verdict: "maybe",
        answer:
          "可以先做品牌曝光及收集查詢，但要盡早安排香港收款、物流及客服，否則客人問到價錢同送貨就流失。",
      },
      {
        label: "其實想做香港品牌進內地",
        verdict: "other",
        answer: "方向相反，平台亦完全不同（小紅書、抖音、大眾點評）。",
        href: "/services/china-market/",
        hrefLabel: "看中國市場推廣",
      },
    ],
  },

  problems: {
    title: "品牌來港，最常低估的四件事",
    intro: "香港市場細，但唔等於簡單。以下是最常見的情況：",
    items: [
      { icon: Languages, problem: "「文案一睇就知係大陸寫的。」", answer: "改寫用語及語氣：「視頻」寫「影片」、「質量」寫「質素」、「下單」寫「落單」，廣告用港式口語。" },
      { icon: MessageCircle, problem: "「客人唔加微信，查詢好少。」", answer: "香港客人習慣用 WhatsApp 問價，我們會設定 WhatsApp 客服、常用回覆及查詢追蹤。" },
      { icon: Wallet, problem: "「限時秒殺、爆款呢啲手法喺香港冇用。」", answer: "按香港消費習慣調整價錢及促銷表達，結帳要有 FPS、信用卡等香港常用付款方式。" },
      { icon: FileWarning, problem: "「唔知香港廣告有咩要注意。」", answer: "檢視廣告聲稱、產品標籤及個人資料收集安排，指出要改的地方，再建議諮詢專業顧問。" },
    ],
  },

  how: {
    title: "品牌點樣喺香港落地",
    intro: "同一套品牌，換成香港的語言同渠道。示意圖會跟住步驟變化：",
    steps: [
      { title: "品牌診斷：找出要改的地方", desc: "檢查文案、視覺、價錢表達及合規事項，列出香港版需要調整的部分。" },
      { title: "本地化：用香港人的講法", desc: "繁體中文改寫、廣東話語境、本地節日及檔期，唔係直接繁轉簡。" },
      { title: "渠道：Google、IG／FB、WhatsApp", desc: "Google 商家檔案及搜尋、社交帳號、WhatsApp 客服及追蹤設定。" },
      { title: "推廣及數據：廣告、KOL、月報", desc: "小額測試廣告及 KOL，有效先加碼，每月報告查詢及成交。" },
    ],
  },

  deliverables: {
    title: "我們實際幫你做什麼",
    intro: "每項都可以單獨委託；首次來港的品牌，多數由診斷及本地化開始。",
    items: [
      { icon: Languages, title: "文案及品牌本地化", desc: "品牌名稱、標語、網站及廣告文案改寫成地道香港用語。" },
      { icon: Search, title: "Google 及 AI 搜尋", desc: "Google 商家檔案、繁體中文 SEO，令客人及 AI 搜尋都搵到你。" },
      { icon: Megaphone, title: "Meta／Google 廣告", desc: "按香港受眾設定投放，素材及文案本地化，追蹤查詢及成交。" },
      { icon: Users, title: "香港 KOL 及拍攝", desc: "配對本地 KOL，拍攝符合香港審美的產品相及短片。" },
      { icon: MessageCircle, title: "WhatsApp 客服設定", desc: "WhatsApp Business、常用回覆、查詢流程及跟進提醒。" },
      { icon: ShieldCheck, title: "宣傳合規檢視", desc: "廣告聲稱、產品標籤及私隱安排的實務檢查清單。" },
    ],
  },

  compare: {
    title: "內地做法 vs 香港做法",
    intro: "同一件事，香港客人用的渠道同講法都唔同：",
    columns: ["", "內地常見", "香港要改成"],
    rows: [
      { item: "客人查詢", values: ["微信、私信", "WhatsApp"] },
      { item: "搜尋及查證", values: ["百度、小紅書", "Google、Google 地圖、AI 搜尋"] },
      { item: "社交平台", values: ["抖音、小紅書、微博", "Instagram、Facebook、Threads（小紅書在部分客群增長中）"] },
      { item: "付款", values: ["支付寶、微信支付", "FPS 轉數快、信用卡、八達通、支付寶 HK、WeChat Pay HK"] },
      { item: "文案用語", values: ["視頻、質量、下單、包郵", "影片、質素、落單、免運費"] },
    ],
    footnote: "完整用語對照及合規注意事項，見下面「深入了解」。",
  },

  pricing: {
    title: "香港市場推廣收費",
    intro: "診斷及文案本地化按項目報價；按月服務有公開起步價，廣告費另計。",
    tiers: [
      {
        name: "廣告代操",
        price: "HK$4,000",
        unit: "／月起",
        summary: "Meta 或 Google 單一平台",
        includes: ["受眾及投放設定", "廣告文案本地化", "轉換追蹤設定", "每月成效報告"],
        bestFor: "想盡快測試香港市場反應",
      },
      {
        name: "SEO 及 GEO",
        price: "HK$6,000",
        unit: "／月起",
        summary: "Google 及 AI 搜尋可見度",
        includes: ["繁體中文關鍵字規劃", "每月內容及頁面優化", "Google 商家檔案", "每月成效報告"],
        bestFor: "想長期被香港客人搜尋到",
        highlight: true,
      },
      {
        name: "社交媒體代管",
        price: "HK$8,000",
        unit: "／月起",
        summary: "Instagram／Facebook 內容",
        includes: ["每月內容規劃", "港式文案及設計", "社群互動", "每月數據報告"],
        bestFor: "需要有人持續經營香港帳號",
      },
    ],
    factors: [
      { title: "品牌診斷及本地化", desc: "一次性項目，按需要改寫的頁面及物料數量報價。" },
      { title: "渠道數目", desc: "先做一至兩個渠道成本最低，之後按數據再加。" },
      { title: "廣告及 KOL 費用", desc: "廣告費及 KOL 費用實報實銷，與服務費分開列明。" },
      { title: "拍攝需要", desc: "用你現有素材，或在香港重新拍攝本地風格的相片及短片。" },
    ],
    note: "我們不承諾銷量或粉絲數；會先議定可量度的指標，每月報告查詢、成交等業務數據。",
  },

  proof: {
    title: "已合作的來港品牌",
    intro: "以下是已公開的真實客戶，都是由香港以外來到香港市場的品牌。",
    items: [
      { href: "/portfolio/#clients", image: "/clients/finenutri-hk-health-supplements.webp", title: "FineNutri 斐萃", industry: "內地保健營養品牌", scope: "香港市場 Meta 廣告投放，以及廣告素材（圖片及短片）製作。" },
      { href: "/portfolio/#clients", image: "https://assets.adwire.com.hk/clients/oneone-hk-website-v2.jpg", title: "OneOne HK", industry: "新加坡集團香港站", scope: "遊戲點數儲值平台的 Google 搜尋及多媒體廣告。" },
      { href: "/portfolio/#clients", image: "https://assets.adwire.com.hk/clients/south-field-japanese-food.jpg", title: "南田貿易 South Field Trading", industry: "日本食品代理", scope: "日本食品在香港推廣：KOL 招募、產品影片拍攝及 Meta 廣告。" },
    ],
  },

  process: {
    title: "合作流程",
    intro: "先確認品牌在香港應該點樣呈現，再開始投放。",
    steps: [
      { title: "免費品牌診斷", desc: "檢查現有物料，列出香港版要改的地方。", duration: "約 1 星期" },
      { title: "本地化策略", desc: "名稱、標語、用語、價錢表達及優先渠道。", duration: "第 1–2 週" },
      { title: "內容及渠道建設", desc: "文案改寫、Google、社交帳號、WhatsApp 及追蹤。", duration: "第 3–5 週" },
      { title: "上線及測試", desc: "內容發佈、小額廣告、KOL 試合作。", duration: "第 6–12 週" },
      { title: "月報", desc: "分開列出平台數據及查詢、成交。", duration: "每月" },
      { title: "按數據擴展", desc: "有效的渠道先加碼，再考慮線下活動。", duration: "每季" },
    ],
  },

  faqs: HONG_KONG_MARKET_FAQS,

  related: [
    { href: "/services/china-market/", title: "中國市場推廣（反方向）", desc: "香港品牌進軍內地：小紅書、抖音、大眾點評。" },
    { href: "/services/social/", title: "社交媒體代管", desc: "Instagram、Facebook、Threads 內容及社群經營。" },
    { href: "/services/ads/", title: "成效廣告投放", desc: "Meta、Google、YouTube 廣告，追蹤查詢及成交。" },
    { href: "/services/seo/", title: "SEO 及 GEO", desc: "繁體中文 SEO 及 AI 搜尋可見度。" },
    { href: "/services/kol/", title: "KOL 網紅營銷", desc: "香港本地 KOL 配對及內容監修。" },
    { href: "/services/production/", title: "商業攝影及影片製作", desc: "拍攝符合香港審美的產品相及短片。" },
  ],

  finalCta: {
    title: "免費品牌診斷：你的品牌在香港要改什麼？",
    desc: "WhatsApp 傳你的網站或社交帳號給我們，我們會指出在香港最需要調整的幾點，以及建議的起步範圍。",
  },
};

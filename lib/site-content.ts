/**
 * Site Content Constants — 已核准對外聲稱及文案（Single Source of Truth）
 *
 * ⚠️ 所有對外數字及 CTA 必須由此檔案讀取，避免同一數字在不同頁面出現多個版本。
 *    修改前必須取得公司負責人書面確認。
 *
 * 核准記錄（2026-09-20，負責人確認）：500+ / 328% / 98% / 4.9 分
 *
 * ⚠️ 2026-10-24 更新（取代 9/20 版本）：
 *    經負責人指示，上述數字冇可出示嘅原始數據（無客戶清單、無 ROI 計算、
 *    無滿意度問卷、無評分平台來源），全站下架，改為「可公開驗證」數字：
 *      - 52 個品牌客戶（來源：官網客戶走馬燈，全部真實合作品牌）
 *      - 16 個公開案例（來源：/portfolio/ 逐個可點入）
 *      - 12 條服務線（來源：導航服務選單實際項目數）
 *      - 30+ 服務行業（來源：/services/ads/ 行業列表）
 *    若日後補回原始數據，先更新 lib/site-stats.ts 再改此檔。
 */

// ─── 已核准對外數字 ──────────────────────────────────────────────────────────
export const PROOF = {
  /** 品牌客戶數（來源：官網客戶走馬燈，全部真實合作品牌） */
  clientsServed: "52",
  clientsServedLabel: "品牌客戶",
  clientsServedSentence: "已服務 52 個香港品牌",

  /** 服務線數目（來源：導航服務選單實際項目） */
  avgRoi: "12",
  avgRoiLabel: "服務線",

  /** 服務行業廣度（來源：/services/ads/ 行業列表） */
  satisfaction: "30+",
  satisfactionLabel: "服務行業",

  /** Portfolio 公開精選案例數 */
  featuredCases: "16",
  featuredCasesLabel: "精選案例",

  /** 客戶評分：無評分平台來源，已停用（勿再顯示 4.9） */
  rating: "",
  ratingLabel: "",
} as const;

// ─── 共用 CTA ────────────────────────────────────────────────────────────────
/** 適用於軟件及營銷客戶的主 CTA */
export const PRIMARY_CTA = "討論你的項目";

/** 服務頁結尾 CTA 標題（取代「準備好令你的品牌引爆流量？」） */
export const CTA_HEADLINE = "準備好開始你的項目了嗎？";

/** 服務頁結尾 CTA 副標 */
export const CTA_SUBHEAD = "講清楚你的需求，我們會安排合適的同事回覆可行的做法、範圍及報價方式。";

/** 表單卡標題 */
export const FORM_HEADLINE = "告訴我們你的項目需求";
export const FORM_SUBHEAD = "填寫後我們會按服務類別安排合適同事跟進。";

// ─── 聯絡資料 ────────────────────────────────────────────────────────────────
/** 全站只使用此電郵；hr@adwire.com.hk 已停用，不可再對外顯示 */
export const PUBLIC_EMAIL = "info@adwire.com.hk";

// ─── 四大業務線 ──────────────────────────────────────────────────────────────
export interface ServiceLine {
  key: string;
  name: string;
  /** 適用對象／問題 */
  audience: string;
  /** 主要連結（保留現有 URL） */
  href: string;
  /** 子服務（全部保留現有 URL） */
  children: { name: string; href: string }[];
}

export const SERVICE_LINES: ServiceLine[] = [
  {
    key: "software",
    name: "Software Development",
    audience: "需要企業網站、內部系統、App 或 MVP 的企業",
    href: "/services/system/",
    children: [
      { name: "網頁設計及電商", href: "/services/web/" },
      { name: "Web App 及度身訂造系統", href: "/services/system/" },
      { name: "CRM / ERP 及內部工具", href: "/services/system/" },
      { name: "Mobile App / MVP / SaaS", href: "/services/system/" },
      { name: "API 及系統整合", href: "/services/system/" },
    ],
  },
  {
    key: "ai",
    name: "AI & Automation",
    audience: "重複人手工序、資料分散、回覆慢的營運團隊",
    href: "/services/ai/",
    children: [
      { name: "AI 應用開發", href: "/services/ai/" },
      { name: "AI 知識庫 / RAG", href: "/services/ai/" },
      { name: "企業流程自動化", href: "/services/automation/" },
      { name: "WhatsApp / CRM 自動化", href: "/services/automation/" },
    ],
  },
  {
    key: "seo",
    name: "SEO & GEO",
    audience: "自然搜尋流量下跌、AI 搜尋缺位的品牌",
    href: "/services/seo/",
    children: [
      { name: "SEO 及 GEO 方案", href: "/services/seo/" },
      { name: "技術 SEO", href: "/services/seo/" },
      { name: "內容及關鍵字規劃", href: "/services/seo/" },
    ],
  },
  {
    key: "crossborder",
    name: "Cross-border Marketing",
    audience: "想進入內地市場的香港品牌，或想進入香港市場的內地及海外品牌",
    href: "/services/china-market/",
    children: [
      { name: "中國市場推廣（香港品牌進內地）", href: "/services/china-market/" },
      { name: "香港市場在地化推廣（內地品牌來港）", href: "/services/hong-kong-market/" },
    ],
  },
  {
    key: "marketing",
    name: "Digital Marketing",
    audience: "需要內容、曝光及廣告成效的品牌",
    href: "/services/ads/",
    children: [
      { name: "成效廣告投放", href: "/services/ads/" },
      { name: "社交媒體代管", href: "/services/social/" },
      { name: "短視頻製作", href: "/services/video/" },
      { name: "KOL 網紅營銷", href: "/services/kol/" },
      { name: "商業攝影", href: "/services/production/" },
    ],
  },
];

// ─── 交付流程（適用於 Software / AI / SEO） ──────────────────────────────────
export const DELIVERY_PROCESS = [
  { step: "Discovery", desc: "了解業務問題、現有系統及限制" },
  { step: "Scope & SOW", desc: "確認範圍、交付物、時間及報價方式" },
  { step: "Architecture / UX", desc: "設計架構、資料流及用戶流程" },
  { step: "Build", desc: "開發、整合及階段性預覽" },
  { step: "QA / UAT", desc: "測試、驗收及修正" },
  { step: "Launch", desc: "部署、文件及交接" },
  { step: "Support", desc: "按需要安排維護及持續優化" },
] as const;

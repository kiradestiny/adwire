/**
 * Site Content Constants — 已核准對外聲稱及文案（Single Source of Truth）
 *
 * ⚠️ 所有對外數字及 CTA 必須由此檔案讀取，避免同一數字在不同頁面出現多個版本。
 *    修改前必須取得公司負責人書面確認。
 *
 * 核准記錄（2026-09-20，負責人確認）：
 *   - 統一使用「500+ 服務客戶」，Portfolio 另標「16 個精選案例」
 *   - ROI 一律用「328%」，停用「3.8x」表述
 *   - 客戶滿意度「98%」
 *   - 移除 hr@adwire.com.hk（已停用）
 *   - 負責人確認上述數字為真實數據
 */

// ─── 已核准對外數字 ──────────────────────────────────────────────────────────
export const PROOF = {
  /** 服務客戶數（全站統一，勿再用 150+/120+/100+ 等版本） */
  clientsServed: "500+",
  clientsServedLabel: "服務客戶",
  clientsServedSentence: "已服務超過 500 家香港企業及品牌",

  /** 平均 ROI 提升（全站統一，勿再用 3.8x） */
  avgRoi: "328%",
  avgRoiLabel: "平均 ROI 提升",

  /** 客戶滿意度 */
  satisfaction: "98%",
  satisfactionLabel: "客戶滿意度",

  /** Portfolio 公開精選案例數 */
  featuredCases: "16",
  featuredCasesLabel: "精選案例",

  /** 客戶評分（來源待補：需標明評分平台或回饋樣本） */
  rating: "4.9",
  ratingLabel: "客戶評分",
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
      { name: "Web App 及客製化系統", href: "/services/system/" },
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
    key: "marketing",
    name: "Digital Marketing",
    audience: "需要內容、曝光及廣告成效的品牌（原有服務，全部保留）",
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

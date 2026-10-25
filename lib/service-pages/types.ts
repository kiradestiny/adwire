/**
 * 服務頁統一模板的資料型別（2026-10-25）
 *
 * 為何存在：原本 5 個服務頁（system / web / seo / ai / ai-agency）各自手寫
 * 800–1,000 行，版面、節奏、CTA 都唔一致。改為「一套模板 + 每頁一份資料」，
 * 每頁都按同一條轉換路線排：
 *   Hero → 30 秒自我檢查 → 常見問題 → 做法圖解 → 交付 → 收費 → 真實案例 → 流程 → FAQ → CTA
 * 文案只改資料檔，版面改模板一次全部生效。
 */
import type { LucideIcon } from "lucide-react";
import type { ServiceFaq } from "@/lib/service-faqs";

export type ServicePageKey = "system" | "web" | "seo" | "ai" | "ai-agency";

/** 自我檢查的答案：fit = 我哋直接做；maybe = 可以做但要先釐清；other = 建議睇另一頁 */
export type FitVerdict = "fit" | "maybe" | "other";

export interface FitOption {
  /** 客人揀的處境（用客人自己會講的說話） */
  label: string;
  verdict: FitVerdict;
  /** 揀咗之後顯示：我哋會點做／點解建議睇另一頁 */
  answer: string;
  /** verdict 為 other 時指去的頁面 */
  href?: string;
  hrefLabel?: string;
}

export interface ProblemItem {
  icon: LucideIcon;
  /** 客人嘅問題（第一人稱） */
  problem: string;
  /** 我哋點處理（一兩句） */
  answer: string;
}

export interface StepItem {
  title: string;
  desc: string;
}

export interface DeliverableItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export interface PriceTier {
  name: string;
  price: string;
  unit?: string;
  summary: string;
  includes: string[];
  bestFor: string;
  highlight?: boolean;
}

export interface PricingBlock {
  title: string;
  intro: string;
  /** 有公開起步價的服務才填（web／seo） */
  tiers?: PriceTier[];
  /** 影響報價的因素（所有服務都有） */
  factors: { title: string; desc: string }[];
  note?: string;
}

export interface ProofItem {
  href: string;
  /** 真實客戶截圖（assets.adwire.com.hk）或留空用數字卡 */
  image?: string;
  title: string;
  industry: string;
  /** 成效數字，取自 /portfolio/ 已公開案例 */
  stat?: string;
  statLabel?: string;
  scope: string;
}

export interface CompareRow {
  item: string;
  values: string[];
}

export interface ServicePageData {
  key: ServicePageKey;
  /** 麵包屑最後一節 */
  crumb: string;
  eyebrow: string;
  /** H1 分兩行：第一行放主關鍵字，第二行（金色）講結果 */
  h1: [string, string];
  lead: string;
  /** Hero 下方三個「你會得到」 */
  promises: string[];
  /** 主 CTA 的 WhatsApp 預設訊息 */
  whatsappMessage: string;
  /** ContactSection 預選服務（必須在 public/config/services.json 白名單） */
  contactService: string;
  heroImage: { src: string; alt: string };

  fit: {
    title: string;
    intro: string;
    options: FitOption[];
  };

  problems: {
    title: string;
    intro: string;
    items: ProblemItem[];
  };

  how: {
    title: string;
    intro: string;
    steps: StepItem[];
  };

  deliverables: {
    title: string;
    intro: string;
    items: DeliverableItem[];
  };

  /** 可選：比較表（例如 SEO vs GEO、訂造 vs SaaS） */
  compare?: {
    title: string;
    intro: string;
    columns: string[];
    rows: CompareRow[];
    footnote?: string;
  };

  pricing: PricingBlock;

  proof: {
    title: string;
    intro: string;
    items: ProofItem[];
  };

  process: {
    title: string;
    intro: string;
    steps: (StepItem & { duration?: string })[];
  };

  faqs: ServiceFaq[];

  /** 相關服務（內部連結，SEO 用） */
  related: { href: string; title: string; desc: string }[];

  finalCta: {
    title: string;
    desc: string;
  };
}

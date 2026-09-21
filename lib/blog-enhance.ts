/**
 * Blog enhancements — 文章模板結構工具
 *
 * 目的：提升文章的搜尋收錄、AI 可引用性及內部連結效率。
 * 所有輸出都基於文章本身已有的可見內容，不新增未經核實的資料。
 */

import type { BlogPost } from "./blogData";

// ─── Emoji 清理 ──────────────────────────────────────────────────────────────
/** 標題（H2/H3/H4）不應使用 emoji 作圖示（最明顯的 AI 生成訊號） */
const HEADING_EMOJI_RE =
  /[\u{1F300}-\u{1FAFF}\u{1F900}-\u{1F9FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{2705}\u{274C}\u{26A0}\u{2B50}\u{2728}\u{23F0}\u{26A1}]/gu;

function stripLeadingEmoji(text: string): string {
  return text.replace(HEADING_EMOJI_RE, "").replace(/^\s+/, "").trim();
}

// ─── 目錄（TOC）＋ 標題 ID 注入 ──────────────────────────────────────────────
export interface TocItem {
  level: 2 | 3;
  text: string;
  id: string;
}

/** 由中文標題產生穩定、可讀的 anchor id */
function slugifyHeading(text: string, fallbackIndex: number): string {
  const cleaned = text
    .replace(/[「」『』【】（）()、，。！？：；“”"'’／/｜|·・+&%$#@!^*<>=~`\[\]{}]/g, "")
    .replace(/\s+/g, "-")
    .trim();
  return cleaned.length > 0 ? cleaned : `section-${fallbackIndex}`;
}

/**
 * 為文章內容的所有 H2/H3 加入 id，並同時輸出目錄。
 * 同時移除標題內的 emoji（heading 用純文字）。
 */
export function buildTocAndInjectIds(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const usedIds = new Set<string>();
  let index = 0;

  const nextHtml = html.replace(
    /<(h2|h3)([^>]*)>([\s\S]*?)<\/\1>/gi,
    (_match, tag: string, attrs: string, inner: string) => {
      index += 1;
      const plain = stripLeadingEmoji(inner.replace(/<[^>]*>/g, "")).trim();
      let id = slugifyHeading(plain, index);
      while (usedIds.has(id)) id = `${id}-${index}`;
      usedIds.add(id);

      const level = (tag.toLowerCase() === "h2" ? 2 : 3) as 2 | 3;
      if (plain) toc.push({ level, text: plain, id });

      const cleanedAttrs = attrs.replace(/\sid="[^"]*"/i, "");
      const cleanedInner = stripHeadingEmoji(inner);
      return `<${tag}${cleanedAttrs} id="${id}">${cleanedInner}</${tag}>`;
    }
  );

  return { html: nextHtml, toc };
}

/** 移除標題文字內的 emoji（包含行內標記中的 emoji） */
function stripHeadingEmoji(inner: string): string {
  return inner.replace(HEADING_EMOJI_RE, "").replace(/^\s+/, "");
}

// ─── FAQ 抽取（用於 FAQPage JSON-LD） ────────────────────────────────────────
export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * 由文章內容的 FAQ 區塊抽取問答。
 * 支援文章現時使用的 microdata 標記（itemprop="name" / itemprop="text"）。
 * 只抽取頁面上已經可見的內容，不新增任何未顯示的資料。
 */
export function extractFaqs(html: string): FaqItem[] {
  const faqs: FaqItem[] = [];

  const questionRe = /itemprop="name"[^>]*>([\s\S]*?)</gi;
  const answerRe = /itemprop="text"[^>]*>([\s\S]*?)</gi;

  const questions: string[] = [];
  const answers: string[] = [];

  let m: RegExpExecArray | null;
  while ((m = questionRe.exec(html)) !== null) questions.push(cleanText(m[1]));
  while ((m = answerRe.exec(html)) !== null) answers.push(cleanText(m[1]));

  const count = Math.min(questions.length, answers.length);
  for (let i = 0; i < count; i += 1) {
    if (questions[i].length > 0 && answers[i].length > 0) {
      faqs.push({ question: questions[i], answer: answers[i] });
    }
  }
  return faqs;
}

function cleanText(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── 文章內上下文 CTA 插入 ──────────────────────────────────────────────────
/**
 * 在第 N 個標題之前插入一個上下文中段 CTA。
 * 先以 H2 定位；若文章 H2 數量不足（純 H3 結構），改用 H3 定位。
 * 標題太少則不插入，避免在短文開頭就出現 CTA。
 */
export function injectMidArticleCta(html: string, ctaHtml: string, afterHeadings = 2): string {
  const findPositions = (tag: "h2" | "h3"): number[] => {
    const positions: number[] = [];
    const re = new RegExp(`<${tag}\\b`, "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) positions.push(m.index);
    return positions;
  };

  let positions = findPositions("h2");
  if (positions.length <= afterHeadings) {
    const h3 = findPositions("h3");
    if (h3.length > afterHeadings) positions = h3;
  }

  if (positions.length <= afterHeadings) return html;

  const insertAt = positions[afterHeadings];
  return `${html.slice(0, insertAt)}${ctaHtml}${html.slice(insertAt)}`;
}

// ─── 作者資料 ────────────────────────────────────────────────────────────────
export interface AuthorProfile {
  name: string;
  role: string;
  bio: string;
  expertise: string[];
}

/**
 * 作者資料 — 只描述 ADWire 團隊實際負責的工作範圍，
 * 不虛構個人資歷、認證或年資。
 */
export const ADWIRE_AUTHOR: AuthorProfile = {
  name: "ADWire 編輯團隊",
  role: "ADWire Agency Limited",
  bio: "文章由 ADWire 團隊撰寫及審閱。團隊負責軟件開發、AI 應用與工作流程自動化、SEO／GEO 及數碼營銷項目，內容取材自實際項目經驗及公開的官方資料。",
  expertise: [
    "軟件及系統開發",
    "AI 應用及流程自動化",
    "SEO 及 GEO 搜尋優化",
    "數碼營銷及成效量度",
  ],
};

// ─── 相關服務內部連結 ────────────────────────────────────────────────────────
export interface ServiceLink {
  name: string;
  href: string;
  reason: string;
}

const SERVICE_LINK_MAP: { match: RegExp; links: ServiceLink[] }[] = [
  {
    match: /SEO|GEO|搜尋|排名|關鍵字/i,
    links: [
      { name: "SEO 與 GEO 優化服務", href: "/services/seo/", reason: "本文討論的搜尋優化工作範圍及交付內容" },
      { name: "SEO／GEO 方案與價目", href: "/services/seo/", reason: "關鍵字數量、文章篇數及頁面優化數量的方案比較" },
      { name: "網頁設計及電商網站開發", href: "/services/web/", reason: "網站速度及轉換結構屬技術 SEO 的一部分" },
    ],
  },
  {
    match: /System Dev|系統|CRM|ERP|App|開發/i,
    links: [
      { name: "企業系統與 App 開發", href: "/services/system/", reason: "本文提到的系統開發範圍、流程及交付" },
      { name: "企業流程自動化", href: "/services/automation/", reason: "系統整合後可進一步自動化的重複工序" },
      { name: "網頁設計及電商網站開發", href: "/services/web/", reason: "網站與系統之間的資料連接方式" },
    ],
  },
  {
    match: /Automation|自動化|WhatsApp|流程/i,
    links: [
      { name: "企業流程自動化", href: "/services/automation/", reason: "本文提及的流程自動化場景與實作方式" },
      { name: "企業 AI 應用開發與系統整合", href: "/services/ai/", reason: "AI 在流程中的分類、草稿及資料查詢應用" },
      { name: "企業系統與 App 開發", href: "/services/system/", reason: "自動化流程需要連接的現有系統與 API" },
    ],
  },
  {
    match: /AI Technology|AI|人工智能|模型/i,
    links: [
      { name: "企業 AI 應用開發與系統整合", href: "/services/ai/", reason: "本文討論的 AI 應用類型及落地流程" },
      { name: "企業流程自動化", href: "/services/automation/", reason: "AI 之外仍需處理的規則式流程自動化" },
      { name: "企業系統與 App 開發", href: "/services/system/", reason: "AI 應用需要連接的內部系統及資料來源" },
    ],
  },
  {
    match: /Ads|廣告|ROAS|投/i,
    links: [
      { name: "成效廣告投放服務", href: "/services/ads/", reason: "本文提及的廣告策略、素材測試及成效量度" },
      { name: "SEO 與 GEO 優化服務", href: "/services/seo/", reason: "自然搜尋與廣告互相配合的分工" },
      { name: "網頁設計及電商網站開發", href: "/services/web/", reason: "廣告著陸頁的轉換結構優化" },
    ],
  },
  {
    match: /Social Media|社交|短視頻|影片|KOL/i,
    links: [
      { name: "社交媒體代管服務", href: "/services/social/", reason: "本文討論的內容企劃及社群經營工作" },
      { name: "短視頻製作", href: "/services/video/", reason: "短片由腳本到剪輯的實際交付內容" },
      { name: "成效廣告投放服務", href: "/services/ads/", reason: "付費曝光與自然內容的配合方式" },
    ],
  },
  {
    match: /China Market|內地|小紅書|抖音|百度|微信|美團|大眾點評/i,
    links: [
      { name: "中國市場推廣服務", href: "/services/china-market/", reason: "本文討論的內地平台推廣範圍、內容分工及量度方式" },
      { name: "社交媒體代管服務", href: "/services/social/", reason: "內地平台營運及內容企劃的實際工作" },
      { name: "成效廣告投放服務", href: "/services/ads/", reason: "內地平台的付費投放與量度方式" },
      { name: "KOL 網紅營銷", href: "/services/kol/", reason: "內地 KOC／KOL 合作的配對及內容監修" },
    ],
  },

  {
    match: /Hong Kong Market|香港市場|在地化|來港|進入香港|本地化/i,
    links: [
      { name: "香港市場在地化推廣服務", href: "/services/hong-kong-market/", reason: "本文討論的本地化範圍、用語差異及推廣組合" },
      { name: "社交媒體代管服務", href: "/services/social/", reason: "香港市場的社交平台內容企劃及日常營運" },
      { name: "KOL 網紅營銷", href: "/services/kol/", reason: "本地 KOL／KOC 的配對、報價及成效歸因" },
    ],
  },
  {
    match: /Web Design|網站|改版|轉換/i,
    links: [
      { name: "網頁設計及電商網站開發", href: "/services/web/", reason: "本文討論的網站開發及轉換優化範圍" },
      { name: "SEO 與 GEO 優化服務", href: "/services/seo/", reason: "網站改版時的 SEO 保護及技術處理" },
      { name: "企業系統與 App 開發", href: "/services/system/", reason: "網站背後需要的系統及 API 整合" },
    ],
  },
];

/** 依文章分類及標籤回傳 3 條相關服務內部連結（不重複） */
export function getServiceLinks(post: BlogPost): ServiceLink[] {
  const haystack = `${post.category} ${post.tags.join(" ")}`;
  const out: ServiceLink[] = [];
  const seen = new Set<string>();

  for (const entry of SERVICE_LINK_MAP) {
    if (!entry.match.test(haystack)) continue;
    for (const link of entry.links) {
      if (seen.has(link.href)) continue;
      seen.add(link.href);
      out.push(link);
    }
    if (out.length >= 3) break;
  }

  if (out.length === 0) {
    return SERVICE_LINK_MAP[0].links.slice(0, 3);
  }
  return out.slice(0, 3);
}

// ─── 日期格式化 ──────────────────────────────────────────────────────────────
/** 以香港常用格式顯示日期（YYYY年M月D日） */
export function formatHkDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00+08:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

/** 文章最後更新日：以後台 updatedAt 為準，否則用發佈日（不可用「今日」假裝更新） */
export function getLastUpdated(post: BlogPost): string {
  return post.updatedAt ? post.updatedAt.slice(0, 10) : post.date;
}

/** 是否屬已更新的文章（發佈日與更新日不同） */
export function isUpdated(post: BlogPost): boolean {
  return getLastUpdated(post) !== post.date;
}

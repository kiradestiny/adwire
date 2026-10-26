/**
 * Blog 主題分組（2026-10-26）
 *
 * 文章本身的 category 係英文、而且分得太散（System Dev／Software Development、
 * Web Design／Web Development 等 15 個），列表頁直接顯示會好亂。
 * 呢度只喺「顯示層」將佢哋歸入 6 個中文主題，唔改文章資料、唔改網址。
 * 後台日後新增未見過的 category，會自動歸入「其他」，唔會令頁面出錯。
 */

export type BlogTopicId = "ai" | "system" | "web" | "seo" | "marketing" | "china" | "other";

export interface BlogTopic {
  id: BlogTopicId;
  label: string;
  desc: string;
}

// 排序跟網站定位：AI 及自動化行先，SEO／GEO 係核心，其餘營銷做支援
export const BLOG_TOPICS: BlogTopic[] = [
  { id: "ai", label: "AI 與自動化", desc: "AI Agent、知識庫、流程自動化的做法與成本" },
  { id: "system", label: "系統及 App 開發", desc: "CRM、ERP、App 與 MVP 的規劃、報價及選型" },
  { id: "seo", label: "SEO／GEO", desc: "Google 排名與 AI 搜尋可見度的實際做法" },
  { id: "web", label: "網站及電商", desc: "網站設計、速度、改版搬遷及網店" },
  { id: "marketing", label: "廣告及社媒", desc: "廣告投放、社交媒體、影片及內容" },
  { id: "china", label: "內地市場", desc: "小紅書、抖音、百度及內地推廣" },
  { id: "other", label: "其他", desc: "其他主題" },
];

const CATEGORY_TOPIC: Record<string, BlogTopicId> = {
  "ai technology": "ai",
  "ai & automation": "ai",
  automation: "ai",
  "system dev": "system",
  "software development": "system",
  "web development": "web",
  "web design": "web",
  "e-commerce": "web",
  "seo & ai": "seo",
  seo: "seo",
  "ads strategy": "marketing",
  "digital marketing": "marketing",
  "social media": "marketing",
  production: "marketing",
  "china market": "china",
};

export function topicOf(category: string): BlogTopicId {
  return CATEGORY_TOPIC[category.trim().toLowerCase()] ?? "other";
}

export function topicLabel(id: BlogTopicId): string {
  return BLOG_TOPICS.find((t) => t.id === id)?.label ?? "其他";
}

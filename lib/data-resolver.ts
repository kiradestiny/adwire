/**
 * Data Resolver — API 增補 + 本地 Fallback（MERGE 模式）
 *
 * 此模組在 Next.js Build Time 運行：
 * 1. 嘗試從 Admin API 拉取最新數據
 * 2. 將 API 數據【合併】落本地硬編碼數據之上（而非取代）
 *
 * 合併規則（重要）：
 * - 同 slug → API（後台）版本覆蓋本地版本，並保留原本位置
 * - API 獨有（後台新增）→ blog 會置頂（新文章自然成為 featured），
 *   品牌／作品集附加於尾
 * - 本地獨有 → 一律保留
 *
 * 為何要合併而唔係取代：
 * 舊版邏輯係「API 有嘢就完全用 API」。一旦後台只有一篇新文章，
 * 其餘本地文章就會由網站消失。合併模式令後台內容永遠只會【增加】，
 * 唔會令現有內容「被消失」。
 */

import { fetchBrands, fetchBlogPosts, fetchPortfolioCases } from './api-client';
import { blogPosts as fallbackBlogPosts, type BlogPost } from './blogData';
import { portfolioCases as fallbackPortfolioCases, type PortfolioCase } from './portfolioData';
import { portfolioExtendedData as fallbackExtendedData, type CaseExtendedData } from './portfolioExtendedData';
import { ICON_MAP, DEFAULT_ICON } from './icon-map';
import { normalizeSeoTitle } from './seo-title';
import type { SerializablePortfolioCase } from './admin-types';

// ── 品牌列表 ─────────────────────────────────────────────────────────────
let cachedBrands: string[] | null = null;

const FALLBACK_BRANDS: string[] = [
  "AURA TRESS 髮研", "FineNutri 斐萃", "HON'S Chinese Medicine Centre",
  "彤肌研 Jasper Beauty", "康倫中醫診所", "Time Universe",
  "YOROKOBI 天之悅", "HEYAMI", "NovaLend 智本信貸",
  "Morning Global", "Wellness Service", "寵之花園",
  "雲峰信貸", "千輝財務", "東京財務",
  "HERFACE", "ToLove", "PEKO Beauty",
  "MEDSKIN PLUS+ 美學中心", "My Cash Credit", "AllAboutBeaut",
  "Rakuten", "The Ritz-Carlton", "Kirin Ichiban",
  "7-Eleven", "Mister Donut", "Matsuya",
  "Miki House", "Kerry Hotel", "Hotel ICON",
  "義務工作發展局（AVS）", "HKWS", "Organicmom",
  "隨傳隨借", "Nuva", "SurrFACE",
  "WISDOM", "Global32", "Envirosafe",
  "Skinpro", "Meta Beauty Lab", "Wonder Lens",
  "Barebooby", "永記渠務工程", "N Creative",
  "effect.", "Eco Pro", "H$ Credit",
  "Quantum Matrix", "KM. Fiber", "千葉願",
  "Sometimes lab",
];

export async function getBrands(): Promise<string[]> {
  if (cachedBrands) return cachedBrands;

  const apiBrands = await fetchBrands();

  if (!apiBrands || apiBrands.length === 0) {
    cachedBrands = FALLBACK_BRANDS;
    return cachedBrands;
  }

  // 合併：本地次序為底，後台新增嘅附加於尾（去除重複）
  const seen = new Set(FALLBACK_BRANDS.map((b) => b.trim().toLowerCase()));
  const merged = [...FALLBACK_BRANDS];
  for (const b of apiBrands) {
    const name = (b ?? '').trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(name);
  }
  cachedBrands = merged;
  return cachedBrands;
}

// ── Blog 文章 ────────────────────────────────────────────────────────────
let cachedBlogPosts: BlogPost[] | null = null;

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (cachedBlogPosts) return cachedBlogPosts;

  const apiPosts = await fetchBlogPosts();

  if (!apiPosts || apiPosts.length === 0) {
    cachedBlogPosts = fallbackBlogPosts;
    return cachedBlogPosts;
  }

  const mapped: BlogPost[] = apiPosts.map((post) => ({
    id: post.id,
    slug: post.slug,
    // 後台標題可能已含品牌尾綴，而 layout template 會再加一次 → 先移除
    title: normalizeSeoTitle(post.title),
    excerpt: post.excerpt,
    date: post.date,
    category: post.category,
    readTime: post.readTime,
    imageColor: post.imageColor,
    image: post.image || undefined,
    content: post.content,
    tags: post.tags,
    updatedAt: post.updatedAt || undefined,
  }));

  const apiBySlug = new Map(mapped.map((p) => [p.slug, p]));
  const repoSlugs = new Set(fallbackBlogPosts.map((p) => p.slug));

  // 1) 本地文章：保留原位置，後台有同 slug 就覆蓋
  const merged = fallbackBlogPosts.map((p) => apiBySlug.get(p.slug) ?? p);

  // 2) 後台獨有嘅新文章：置頂（新文章自然成為 featured），日期新→舊
  const added = mapped
    .filter((p) => !repoSlugs.has(p.slug))
    .sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')));

  cachedBlogPosts = [...added, ...merged];
  return cachedBlogPosts;
}

// ── Portfolio 案例（可序列化版本，用於 Server→Client Props 傳遞）──────────
let cachedSerializableCases: SerializablePortfolioCase[] | null = null;

export async function getSerializablePortfolioCases(): Promise<SerializablePortfolioCase[]> {
  if (cachedSerializableCases) return cachedSerializableCases;

  // 本地版本先轉換（icon → iconName）
  const fallbackSerializable: SerializablePortfolioCase[] = fallbackPortfolioCases.map((c) => {
    let iconName = 'Users';
    for (const [name, component] of Object.entries(ICON_MAP)) {
      if (component === c.icon) {
        iconName = name;
        break;
      }
    }
    const { icon, ...rest } = c;
    return {
      ...rest,
      iconName,
    };
  });

  const apiCases = await fetchPortfolioCases();

  if (!apiCases || apiCases.length === 0) {
    cachedSerializableCases = fallbackSerializable;
    return cachedSerializableCases;
  }

  const mapped: SerializablePortfolioCase[] = apiCases.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    category: c.category,
    displayCategory: c.displayCategory,
    industry: c.industry,
    duration: c.duration,
    services: c.services,
    shortDescription: c.shortDescription,
    fullDescription: c.fullDescription,
    challenge: c.challenge,
    solution: c.solution,
    outcome: c.outcome,
    stats: c.stats,
    statLabel: c.statLabel,
    resultMetrics: c.resultMetrics,
    processSteps: c.processSteps,
    testimonial: c.testimonial,
    iconName: c.iconName, // 字串，可序列化
    color: c.color,
    accentColor: c.accentColor,
    tags: c.tags,
    image: c.image,
    alt: c.alt,
    // 同上：後台 seoTitle 可能已含品牌尾綴（曾見 16 頁重複），先移除
    seoTitle: normalizeSeoTitle(c.seoTitle),
    seoDescription: c.seoDescription,
  }));

  const apiBySlug = new Map(mapped.map((c) => [c.slug, c]));
  const repoSlugs = new Set(fallbackSerializable.map((c) => c.slug));

  // 本地次序為底（後台同 slug 覆蓋），後台新增嘅附加於尾
  const merged = fallbackSerializable.map((c) => apiBySlug.get(c.slug) ?? c);
  const added = mapped.filter((c) => !repoSlugs.has(c.slug));

  cachedSerializableCases = [...merged, ...added];
  return cachedSerializableCases;
}

// ── Portfolio 案例（含 LucideIcon，僅供 Client Component 內部使用）────────
let cachedPortfolioCases: PortfolioCase[] | null = null;

export async function getPortfolioCases(): Promise<PortfolioCase[]> {
  if (cachedPortfolioCases) return cachedPortfolioCases;

  const serializableCases = await getSerializablePortfolioCases();
  cachedPortfolioCases = serializableCases.map((c) => ({
    ...c,
    icon: ICON_MAP[c.iconName] || DEFAULT_ICON,
  })) as PortfolioCase[];
  return cachedPortfolioCases;
}

// ── Portfolio 擴展數據（FAQ + Before/After）─────────────────────────────────
let cachedExtendedData: Record<string, CaseExtendedData> | null = null;

export async function getPortfolioExtendedData(): Promise<Record<string, CaseExtendedData>> {
  if (cachedExtendedData) return cachedExtendedData;

  const apiCases = await fetchPortfolioCases();

  if (!apiCases || apiCases.length === 0) {
    cachedExtendedData = fallbackExtendedData;
    return cachedExtendedData;
  }

  // 合併：本地擴展數據為底，後台有同 slug 就覆蓋，後台獨有嘅新增
  const merged: Record<string, CaseExtendedData> = { ...fallbackExtendedData };
  for (const c of apiCases) {
    if (c.faqs && c.faqs.length > 0) {
      merged[c.slug] = {
        geoSummary: c.geoSummary,
        faqs: c.faqs,
        beforeAfter: c.beforeAfter,
      };
    }
  }
  cachedExtendedData = merged;
  return cachedExtendedData;
}

// ── 清除快取（用於 Build Time 重新拉取）───────────────────────────────────
export function clearCache(): void {
  cachedBrands = null;
  cachedBlogPosts = null;
  cachedPortfolioCases = null;
  cachedSerializableCases = null;
  cachedExtendedData = null;
}

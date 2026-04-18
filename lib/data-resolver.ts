/**
 * Data Resolver — API 優先 + 本地 Fallback
 * 
 * 此模組在 Next.js Build Time 運行：
 * 1. 嘗試從 Admin API 拉取最新數據
 * 2. 如果 API 不可用，使用本地硬編碼數據作為 fallback
 * 
 * 這確保了：
 * - 有後台數據時，使用後台最新數據
 * - 沒有後台或 API 失敗時，網站仍然可以正常構建
 */

import { fetchBrands, fetchBlogPosts, fetchPortfolioCases } from './api-client';
import { blogPosts as fallbackBlogPosts, type BlogPost } from './blogData';
import { portfolioCases as fallbackPortfolioCases, type PortfolioCase } from './portfolioData';
import { portfolioExtendedData as fallbackExtendedData, type CaseExtendedData } from './portfolioExtendedData';
import { ICON_MAP, DEFAULT_ICON } from './icon-map';
import type { SerializablePortfolioCase } from './admin-types';

// ── 品牌列表 ─────────────────────────────────────────────────────────────
let cachedBrands: string[] | null = null;

export async function getBrands(): Promise<string[]> {
  if (cachedBrands) return cachedBrands;

  const apiBrands = await fetchBrands();
  if (apiBrands && apiBrands.length > 0) {
    cachedBrands = apiBrands;
    return cachedBrands;
  }

  // Fallback: 使用本地硬編碼數據
  cachedBrands = [
    "7-Eleven", "Rakuten", "The Ritz-Carlton", "Kirin Ichiban", "Mister Donut",
    "Matsuya", "Miki House", "Kerry Hotel", "Hotel ICON", "義務工作發展局（AVS）",
    "HKWS", "Organicmom", "隨傳隨借", "Nuva", "SurrFACE", "WISDOM", "Global32",
    "Envirosafe", "Skinpro", "Peko Beauty", "MEDSKIN PLUS+", "YOROKOBI Beauty",
    "Meta Beauty Lab", "All About Beaut", "Wonder Lens", "Barebooby", "永記渠務工程",
    "N Creative", "effect.", "Eco Pro", "H$ Credit", "Quantum Matrix", "KM. Fiber",
    "千葉願", "Sometimes lab",
  ];
  return cachedBrands;
}

// ── Blog 文章 ────────────────────────────────────────────────────────────
let cachedBlogPosts: BlogPost[] | null = null;

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (cachedBlogPosts) return cachedBlogPosts;

  const apiPosts = await fetchBlogPosts();
  if (apiPosts && apiPosts.length > 0) {
    cachedBlogPosts = apiPosts.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
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
    return cachedBlogPosts;
  }

  // Fallback: 使用本地硬編碼數據
  cachedBlogPosts = fallbackBlogPosts;
  return cachedBlogPosts;
}

// ── Portfolio 案例（可序列化版本，用於 Server→Client Props 傳遞）──────────
let cachedSerializableCases: SerializablePortfolioCase[] | null = null;

export async function getSerializablePortfolioCases(): Promise<SerializablePortfolioCase[]> {
  if (cachedSerializableCases) return cachedSerializableCases;

  const apiCases = await fetchPortfolioCases();
  if (apiCases && apiCases.length > 0) {
    cachedSerializableCases = apiCases.map((c) => ({
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
      seoTitle: c.seoTitle,
      seoDescription: c.seoDescription,
    }));
    return cachedSerializableCases;
  }

  // Fallback: 從本地硬編碼數據轉換（icon → iconName）
  cachedSerializableCases = fallbackPortfolioCases.map((c) => {
    // 反向查找 icon 名稱
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
  if (apiCases && apiCases.length > 0) {
    const extendedData: Record<string, CaseExtendedData> = {};
    for (const c of apiCases) {
      if (c.faqs && c.faqs.length > 0) {
        extendedData[c.slug] = {
          geoSummary: c.geoSummary,
          faqs: c.faqs,
          beforeAfter: c.beforeAfter,
        };
      }
    }
    cachedExtendedData = extendedData;
    return cachedExtendedData;
  }

  // Fallback
  cachedExtendedData = fallbackExtendedData;
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

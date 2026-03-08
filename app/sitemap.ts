import { MetadataRoute } from 'next'
import { blogPosts } from '@/lib/blogData'
import { portfolioCases } from '@/lib/portfolioData'

export const dynamic = 'force-static'

// [FIX #7] 提升至模組 scope，避免每次呼叫函數時重新定義
interface RouteConfig {
  url: string
  lastModified?: Date | string
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://adwire.com.hk'

  // ── 上次重大更新日期 ────────────────────────────────────────────
  const SITE_LAST_UPDATED     = '2026-02-28'  // 本次 SEO/GEO 優化、FAQ/對比表新增
  const BLOG_LAST_UPDATED     = '2026-02-28'  // 新增 4 篇深度文章
  const SERVICE_LAST_UPDATED  = '2026-02-28'  // 服務頁面 Schema 更新
  const LEGAL_LAST_UPDATED    = '2025-01-01'  // 法律條款未變更
  const PORTFOLIO_LAST_UPDATED = '2025-02-15' // 作品集未有新增

  // 1. 核心頁面 (Core Pages) — 最高優先級
  const coreRoutes: RouteConfig[] = [
    {
      // [FIX #6] 首頁改用 '/' → 生成 https://adwire.com.hk/（含 trailing slash）
      // 與 .htaccess 301 最終 canonical URL 一致，避免 GSC 將兩者視為不同頁面
      url: '/',                        // 首頁：新增 FAQ Section、ComparisonTable、Schema
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: '/services',
      lastModified: SERVICE_LAST_UPDATED,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: '/portfolio',
      lastModified: PORTFOLIO_LAST_UPDATED,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: '/blog',                    // Blog：新增 4 篇 2026 年深度文章
      lastModified: BLOG_LAST_UPDATED,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: '/about',
      lastModified: SERVICE_LAST_UPDATED,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: '/contact',
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  // 2. 服務子頁面 (Service Pages) — 高優先級
  const serviceRoutes: RouteConfig[] = [
    { url: '/services/kol',        lastModified: SERVICE_LAST_UPDATED },
    { url: '/services/video',      lastModified: SERVICE_LAST_UPDATED },
    { url: '/services/production', lastModified: SERVICE_LAST_UPDATED },
    { url: '/services/social',     lastModified: SERVICE_LAST_UPDATED },
    { url: '/services/ads',        lastModified: SERVICE_LAST_UPDATED },
    { url: '/services/seo',        lastModified: SERVICE_LAST_UPDATED },
    { url: '/services/web',        lastModified: SERVICE_LAST_UPDATED },
    { url: '/services/system',     lastModified: SERVICE_LAST_UPDATED },
    { url: '/services/automation', lastModified: SERVICE_LAST_UPDATED },
    { url: '/services/ai',         lastModified: SERVICE_LAST_UPDATED },
  ].map((route) => ({
    ...route,
    changeFrequency: 'monthly' as RouteConfig['changeFrequency'],
    priority: 0.8,
  }))

  // 3. 法律與其他頁面 (Legal & Misc Pages)
  const legalRoutes: RouteConfig[] = [
    { url: '/privacy',    lastModified: LEGAL_LAST_UPDATED },
    { url: '/terms',      lastModified: LEGAL_LAST_UPDATED },
    { url: '/disclaimer', lastModified: LEGAL_LAST_UPDATED },
  ].map((route) => ({
    ...route,
    changeFrequency: 'yearly' as RouteConfig['changeFrequency'],
    priority: 0.5,
  }))

  // 合併所有靜態路由並格式化 URL
  const staticSitemap = [...coreRoutes, ...serviceRoutes, ...legalRoutes].map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: route.lastModified ?? new Date().toISOString().split('T')[0],
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  // 4. Blog 文章動態頁面 — 自動從 blogData 生成
  //    新文章（2026年）優先級提升至 0.8，舊文章保持 0.7
  const blogSitemap = blogPosts.map((post) => {
    const postYear = new Date(post.date).getFullYear()
    const isRecent = postYear >= 2026
    return {
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: isRecent ? 0.8 : 0.7,
    }
  })

  // 5. Portfolio 案例內頁 (Case Study Pages)
  const portfolioSitemap = portfolioCases.map((caseItem) => ({
    url: `${baseUrl}/portfolio/${caseItem.slug}`,
    lastModified: PORTFOLIO_LAST_UPDATED,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  return [...staticSitemap, ...blogSitemap, ...portfolioSitemap]
}

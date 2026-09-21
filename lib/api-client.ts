/**
 * API Client — 從 PHP 後台拉取數據
 * 
 * 此模組在 Next.js Build Time 運行，從 Admin API 取得最新數據。
 * 如果 API 不可用，會自動 fallback 到本地硬編碼數據。
 * 
 * 環境變數：
 *   NEXT_PUBLIC_API_URL - API 基礎 URL（例如 https://adwire.com.hk/admin/api）
 *   ADMIN_API_KEY - API 認證 Key（僅在 Build Time 使用，不會暴露到前端）
 */

// ── 配置 ────────────────────────────────────────────────────────────────
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://adwire.com.hk/admin/api';
const API_KEY = process.env.ADMIN_API_KEY || '';

// ── 通用 Fetch 函數 ──────────────────────────────────────────────────────
async function fetchAPI<T>(endpoint: string, extraParams?: Record<string, string>): Promise<T | null> {
  const params = new URLSearchParams(extraParams);
  const queryString = params.toString();
  const url = `${API_BASE_URL}/${endpoint}${queryString ? `?${queryString}` : ''}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': API_KEY,  // ⚠️ 僅透過 Header 傳遞 API Key，不放入 URL（避免洩漏至 Log）
      },
      next: { revalidate: 300 }, // 5 分鐘快取
    });

    if (!response.ok) {
      console.warn(`[API] ${endpoint} returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data as T;
    }
    
    return null;
  } catch (error) {
    console.warn(`[API] Failed to fetch ${endpoint}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

// ── 品牌列表 ─────────────────────────────────────────────────────────────
export async function fetchBrands(): Promise<string[] | null> {
  return fetchAPI<string[]>('brands.php');
}

// ── Blog 文章 ────────────────────────────────────────────────────────────
export interface ApiBlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  imageColor: string;
  image: string | null;
  content: string;
  tags: string[];
  updatedAt: string;
}

export async function fetchBlogPosts(): Promise<ApiBlogPost[] | null> {
  return fetchAPI<ApiBlogPost[]>('blog.php');
}

export async function fetchBlogPost(slug: string): Promise<ApiBlogPost | null> {
  return fetchAPI<ApiBlogPost>('blog.php', { slug });
}

// ── Portfolio 案例 ────────────────────────────────────────────────────────
export interface ApiPortfolioCase {
  id: number;
  slug: string;
  title: string;
  category: string;
  displayCategory: string;
  industry: string;
  duration: string;
  services: string[];
  shortDescription: string;
  fullDescription: string;
  challenge: string;
  solution: string;
  outcome: string;
  stats: string;
  statLabel: string;
  resultMetrics: Array<{
    label: string;
    value: string;
    description: string;
    highlight: boolean;
  }>;
  processSteps: Array<{
    phase: string;
    title: string;
    description: string;
  }>;
  testimonial: {
    quote: string;
    author: string;
    role: string;
    company: string;
  };
  iconName: string;
  color: string;
  accentColor: string;
  tags: string[];
  image: string;
  alt: string;
  seoTitle: string;
  seoDescription: string;
  geoSummary: string;
  faqs: Array<{
    q: string;
    a: string;
  }>;
  beforeAfter: Array<{
    label: string;
    before: string;
    after: string;
  }>;
  updatedAt: string;
}

export async function fetchPortfolioCases(): Promise<ApiPortfolioCase[] | null> {
  return fetchAPI<ApiPortfolioCase[]>('portfolio.php');
}

export async function fetchPortfolioCase(slug: string): Promise<ApiPortfolioCase | null> {
  return fetchAPI<ApiPortfolioCase>('portfolio.php', { slug });
}
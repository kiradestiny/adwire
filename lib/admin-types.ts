/**
 * Admin API 共享型別定義
 * 
 * 這些型別可同時被 Server Component 和 Client Component 安全導入，
 * 不包含任何 server-only 或 client-only 的依賴。
 * 
 * 核心設計：SerializablePortfolioCase 將 LucideIcon 替換為 iconName 字串，
 * 解決 React Component 無法跨 Server→Client 邊界序列化的問題。
 */

import type { PortfolioCase } from './portfolioData';
import type { CaseExtendedData } from './portfolioExtendedData';
import type { BlogPost } from './blogData';

// ── Serializable Portfolio Case ──────────────────────────────────────────
// 將 icon: LucideIcon 替換為 iconName: string，使其可序列化傳遞
export interface SerializablePortfolioCase extends Omit<PortfolioCase, 'icon'> {
  iconName: string;
}

// ── Case Study Page Props ────────────────────────────────────────────────
// Portfolio 詳情頁需要傳遞給 Client Component 的完整數據
export interface CaseStudyProps {
  slug: string;
  caseData?: SerializablePortfolioCase;
  relatedCasesData?: SerializablePortfolioCase[];
  extendedData?: CaseExtendedData;
}

// ── Portfolio Listing Props ──────────────────────────────────────────────
export interface PortfolioListingProps {
  cases?: SerializablePortfolioCase[];
}

// ── Blog Listing Props ───────────────────────────────────────────────────
export interface BlogListingProps {
  posts?: BlogPost[];
}

// ── Blog Section Props (Homepage) ────────────────────────────────────────
export interface BlogSectionProps {
  posts?: BlogPost[];
}

// ── LogoWall Props ───────────────────────────────────────────────────────
export interface LogoWallProps {
  brands?: string[];
}

// ── Helper: 將 SerializablePortfolioCase 轉回 PortfolioCase ──────────────
// Client Component 中使用，將 iconName 映射回 LucideIcon Component
import { ICON_MAP, DEFAULT_ICON } from './icon-map';

export function toPortfolioCase(c: SerializablePortfolioCase): PortfolioCase {
  return {
    ...c,
    icon: ICON_MAP[c.iconName] || DEFAULT_ICON,
  } as PortfolioCase;
}

export function toPortfolioCases(cases: SerializablePortfolioCase[]): PortfolioCase[] {
  return cases.map(toPortfolioCase);
}

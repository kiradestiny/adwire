import type { Metadata } from "next";
import WebServiceContent from "./WebServiceContent";

const currentYear = new Date().getFullYear();

export const metadata: Metadata = {
  title: `【${currentYear}最新】網頁設計及系統開發 | Next.js 高轉換網站 | 香港 ADWire`,
  description: "香港專業網頁設計公司 ⭐ 提供 Next.js 高性能網站開發、企業官網、電商平台、Landing Page。結合 SEO 優化、極速加載與高轉換率 UI/UX 設計，助您提升 300% 轉化率。4-6週快速交付，免費諮詢報價！",
  keywords: ["網頁設計", "網站開發", "Next.js", "企業網站", "電商網站", "Landing Page", "網頁設計公司", "香港網頁設計", "SEO 優化", "響應式網站", "網頁制作", "網站建設", "UI/UX 設計", "轉換率優化", "CRO"],
  alternates: {
    canonical: "/services/web",
  },
  openGraph: {
    title: `【${currentYear}最新】網頁設計及系統開發 | Next.js 高轉換網站 | 香港 ADWire`,
    description: "香港專業網頁設計公司 ⭐ 提供 Next.js 高性能網站開發、企業官網、電商平台。SEO 優化 ✓ 極速加載 ✓ 高轉換率設計 ✓ 助您業務倍增，免費諮詢報價！",
    images: [
      {
        url: "/portfolio/corporate-website.webp",
        width: 1200,
        height: 630,
        alt: "香港網頁設計及系統開發 - ADWire Agency",
      },
    ],
    type: "website",
    locale: "zh_HK",
  },
  twitter: {
    card: "summary_large_image",
    title: `【${currentYear}最新】網頁設計及系統開發 | Next.js 高轉換網站`,
    description: "香港專業網頁設計公司 ⭐ Next.js 高性能網站開發、企業官網、電商平台。SEO 優化 ✓ 極速加載 ✓",
    images: ["/portfolio/corporate-website.webp"],
  },
};

export default function WebServicePage() {
  return <WebServiceContent />;
}

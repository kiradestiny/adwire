import type { Metadata } from "next";
import WebServiceContent from "./WebServiceContent";

const currentYear = new Date().getFullYear();

export const metadata: Metadata = {
  title: "網頁設計公司｜企業官網及電商開發",
  description: "企業官網、電商網站及高轉換 Landing Page 開發。按項目評估 CMS、WordPress／Shopify 或 Next.js／React，並兼顧載入速度、轉換結構及搜尋可見度。",
  keywords: ["網頁設計", "網站開發", "Next.js", "企業網站", "電商網站", "Landing Page", "網頁設計公司", "香港網頁設計", "SEO 優化", "響應式網站", "網頁制作", "網站建設", "UI/UX 設計", "轉換率優化", "CRO"],
  alternates: {
    canonical: "/services/web/",
  },
  openGraph: {
    title: "網頁設計及電商網站開發",
    description: "企業官網、電商網站及 Landing Page 開發。按項目評估 CMS、WordPress／Shopify 或 Next.js／React。",
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
    title: "網頁設計及電商網站開發",
    description: "企業官網、電商網站及 Landing Page 開發，兼顧速度、轉換及搜尋可見度。",
    images: ["/portfolio/corporate-website.webp"],
  },
};

export default function WebServicePage() {
  return <WebServiceContent />;
}

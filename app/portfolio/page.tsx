import type { Metadata } from "next";
import PortfolioContent from "./PortfolioContent";
import { getSerializablePortfolioCases } from "@/lib/data-resolver";

// ─── SEO Metadata ─────────────────────────────────────────────
export const metadata: Metadata = {
  title: "成功案例｜系統・AI・SEO 實戰項目",
  description:
    "精選案例涵蓋系統及 CRM 開發、AI 與工作流程自動化、SEO／GEO 及整合數碼增長項目。每個案例列明 ADWire 的實際工作範圍、時期及已核實的技術與成效。",
  keywords: [
    "香港數碼營銷案例",
    "KOL 營銷成功案例",
    "SEO 案例香港",
    "Facebook 廣告 ROAS",
    "WhatsApp 自動化",
    "網站開發案例",
    "App 開發 Hong Kong",
    "成功案例 Portfolio",
    "ADWire Agency",
    "數碼轉型案例",
  ],
  alternates: {
    canonical: "/portfolio/",
  },
  openGraph: {
    title: "成功案例｜系統・AI・SEO 實戰項目",
    description: "精選案例涵蓋系統及 CRM 開發、AI 與自動化、SEO／GEO 及整合數碼增長項目，列明實際工作範圍及成效。",
    url: "https://adwire.com.hk/portfolio/",
    type: "website",
    images: [
      {
        url: "/portfolio/beauty-ads.webp",
        width: 1200,
        height: 630,
        alt: "ADWire Agency 成功案例 Portfolio — 香港數碼營銷",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "成功案例 Portfolio | ADWire Agency",
    description: "120+ 個真實數位營銷成功案例，從 KOL 短片到 SEO 霸榜，用數據說話。",
    images: ["/portfolio/beauty-ads.webp"],
  },
};

// ─── JSON-LD 結構化數據 ───────────────────────────────────────
function PortfolioJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "成功案例 Portfolio — ADWire Agency",
    description:
      "ADWire Agency 的完整成功案例集。涵蓋 KOL 營銷、短視頻製作、SEO 優化、數碼廣告、自動化系統及 App 開發等多個行業的真實成效案例。",
    url: "https://adwire.com.hk/portfolio/",
    publisher: {
      "@type": "Organization",
      name: "ADWire Agency",
      url: "https://adwire.com.hk",
      logo: {
        "@type": "ImageObject",
        url: "https://adwire.com.hk/logo.png",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+852-XXXX-XXXX",
        contactType: "customer service",
        areaServed: "HK",
        availableLanguage: ["Chinese", "English"],
      },
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "首頁",
          item: "https://adwire.com.hk",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "成功案例",
          item: "https://adwire.com.hk/portfolio/",
        },
      ],
    },
    about: [
      { "@type": "Thing", name: "KOL 網紅營銷" },
      { "@type": "Thing", name: "短視頻製作" },
      { "@type": "Thing", name: "SEO 搜尋引擎優化" },
      { "@type": "Thing", name: "數碼廣告投放" },
      { "@type": "Thing", name: "營銷自動化" },
      { "@type": "Thing", name: "網站開發" },
      { "@type": "Thing", name: "手機 App 開發" },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ─── Page Component ───────────────────────────────────────────
export default async function PortfolioPage() {
  // Build Time 數據取得（API 優先 + 本地 Fallback）
  const cases = await getSerializablePortfolioCases();

  return (
    <>
      <PortfolioJsonLd />
      <PortfolioContent cases={cases} />
    </>
  );
}

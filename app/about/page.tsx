import type { Metadata } from "next";
import AboutContent from "./AboutContent";
import { WHATSAPP_E164 } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "關於 ADWire｜軟件、AI 與數碼增長團隊",
  description:
    "ADWire Agency Limited 以香港市場為主，提供企業網站及系統開發、AI 應用與工作流程自動化、SEO／GEO 及數碼營銷服務。團隊由精簡核心成員及按項目協作的專業人才組成，按項目需要安排合適的執行組合。",
  keywords: [
    "ADWire Agency",
    "香港數碼營銷代理",
    "MarTech 代理",
    "香港 SEO 公司",
    "KOL 網紅營銷",
    "AI 自動化營銷",
    "香港廣告代理",
    "全棧開發香港",
    "GEO 優化",
    "數碼營銷香港",
    "Marketing Agency Hong Kong",
    "SEO Agency HK",
  ],
  authors: [{ name: "ADWire Agency", url: "https://adwire.com.hk" }],
  alternates: {
    canonical: "/about/",
  },
  openGraph: {
    title: "關於 ADWire",
    description: "ADWire Agency Limited 以香港市場為主，提供軟件開發、AI 應用與自動化、SEO／GEO 及數碼營銷服務。",
    url: "https://adwire.com.hk/about/",
    siteName: "ADWire Agency",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "ADWire Agency — 香港 MarTech 數碼營銷代理",
      },
    ],
    locale: "zh_HK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "關於 ADWire Agency | 香港 MarTech 數碼營銷代理",
    description:
      "ADWire Agency 結合 SEO、AI 自動化與全棧開發，為香港品牌提供全方位數碼增長方案。",
    images: ["/logo.png"],
  },
};

// ─── JSON-LD Schemas（多層，GEO/SEO 雙效）───────────────────────────────────

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://adwire.com.hk/#organization",
  name: "ADWire Agency",
  alternateName: ["ADWire", "ADWire Hong Kong"],
  url: "https://adwire.com.hk",
  logo: {
    "@type": "ImageObject",
    url: "https://adwire.com.hk/logo.png",
    width: 200,
    height: 60,
  },
  description:
    "ADWire Agency Limited 以香港市場為主要業務背景，提供軟件開發、AI 應用與工作流程自動化、SEO／GEO 搜尋優化，以及成效廣告、社交媒體、短視頻、KOL 及商業攝影等數碼營銷服務。團隊由精簡核心成員及按項目協作的專業人才組成。",
  foundingLocation: "Hong Kong",
  areaServed: ["Hong Kong", "Greater Bay Area", "Taiwan", "Southeast Asia"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "葵芳新都會廣場 2 座 45 樓 4510 室",
    addressLocality: "Kwai Fong",
    addressRegion: "New Territories",
    addressCountry: "HK",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: WHATSAPP_E164,
      contactType: "customer service",
      areaServed: "HK",
      availableLanguage: ["zh-Hant", "zh-Yue", "en"],
    },
    {
      "@type": "ContactPoint",
      email: "info@adwire.com.hk",
      contactType: "sales",
    },
  ],
  sameAs: [
    "https://www.facebook.com/profile.php?id=61575126092859",
    "https://www.instagram.com/adwire_official/",
    "https://www.linkedin.com/company/106715005/",
  ],
  knowsAbout: [
    "SEO (Search Engine Optimization)",
    "GEO (Generative Engine Optimization)",
    "KOL Marketing",
    "Influencer Marketing",
    "AI Marketing Automation",
    "Meta Ads",
    "Google Ads",
    "Short Video Production",
    "Full Stack Web Development",
    "Marketing Technology (MarTech)",
    "Data-Driven Marketing",
    "Content Marketing",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "ADWire Agency 服務目錄",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "SEO / GEO 搜尋引擎優化" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "KOL 網紅營銷" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI 自動化系統" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Meta / Google 成效廣告" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "短視頻製作" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "網站開發" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "社交媒體管理" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "定制系統開發（CRM / ERP）" } },
    ],
  },
};

const aboutPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": "https://adwire.com.hk/about/#webpage",
  name: "關於 ADWire Agency",
  url: "https://adwire.com.hk/about/",
  description:
    "了解 ADWire Agency Limited 的服務範圍、交付流程、團隊組成及合作方式，以及我們如何處理軟件開發、AI 自動化、SEO／GEO 及數碼營銷項目。",
  inLanguage: ["zh-Hant", "en"],
  isPartOf: {
    "@type": "WebSite",
    "@id": "https://adwire.com.hk/#website",
    name: "ADWire Agency",
    url: "https://adwire.com.hk",
  },
  about: {
    "@id": "https://adwire.com.hk/#organization",
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
        name: "關於我們",
        item: "https://adwire.com.hk/about/",
      },
    ],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "ADWire Agency 係咩公司？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ADWire Agency Limited 以香港市場為主要業務背景，提供軟件開發（企業網站、Web App、CRM／ERP 相關系統、手機 App、MVP 及 API 整合）、AI 與自動化（AI 應用、企業知識庫、工作流程自動化）、SEO／GEO 搜尋優化，以及數碼營銷（成效廣告、社交媒體、短視頻、KOL 及攝影）。實際工作範圍會按項目需要確認。",
      },
    },
    {
      "@type": "Question",
      name: "ADWire 與其他香港 Marketing Agency 有什麼分別？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ADWire 的團隊同時具備營銷、創意與技術開發經驗，可以從業務問題出發，一路處理需求整理、方案設計、開發交付及成效量度。這種組合的好處是客戶不需要在廣告公司與開發商之間來回協調，項目範圍、技術選項、原始碼及帳戶歸屬、維護安排都可以在同一個團隊內一次講清楚。",
      },
    },
    {
      "@type": "Question",
      name: "ADWire 提供哪些數碼營銷服務？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ADWire Agency 提供 8 大核心服務：(1) SEO / GEO 搜尋引擎優化；(2) KOL 網紅營銷；(3) AI 自動化系統；(4) Meta & Google 成效廣告；(5) 短視頻及內容製作；(6) 網站及電商開發；(7) 社交媒體管理；(8) 定制系統開發（CRM/ERP）。",
      },
    },
    {
      "@type": "Question",
      name: "ADWire 主要服務哪些行業？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ADWire 服務廣泛行業，包括：零售電商、美容護膚、飲食餐廳、醫療健康、金融貸款、科技初創及中小企業。我們的客戶遍布香港及大灣區，並為部分品牌提供東南亞市場拓展支援。",
      },
    },
    {
      "@type": "Question",
      name: "如何與 ADWire 開始合作？",
      acceptedAnswer: {
        "@type": "Answer",
        text: `可透過以下方式聯絡 ADWire：(1) WhatsApp ${WHATSAPP_E164}；(2) 電郵 info@adwire.com.hk；(3) 填寫網站聯絡表單。我們提供免費初步諮詢，了解您的業務需求後，會提供針對性的服務方案建議。`,
      },
    },
    {
      "@type": "Question",
      name: "ADWire 的辦公室在哪裡？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ADWire Agency 辦公室位於香港新界葵芳新都會廣場 2 座 45 樓 4510 室。辦公時間為星期一至五 09:00–18:00。亦可透過 WhatsApp 或 Zoom 進行遙距會議。",
      },
    },
    {
      "@type": "Question",
      name: "ADWire 是否適合中小企業（SME）？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "係，ADWire 專門為香港中小企業提供高 ROI 的數碼營銷方案。我們理解 SME 預算有限，因此提供靈活的服務組合，由單一服務（如 SEO 優化或廣告投放）到全方位營銷管理都有方案可選。我們的自動化技術亦能有效降低 SME 的人手成本。",
      },
    },
    {
      "@type": "Question",
      name: "ADWire 廣告投放的平均 ROI 係幾多？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ADWire 管理的廣告項目平均 ROAS（廣告回報率）達 3–5 倍。具體成效視乎行業、產品定價及競爭程度而異。我們採用 A/B 測試及數據分析持續優化廣告表現，並提供透明的月度績效報告，確保每分預算都能追蹤回報。",
      },
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <AboutContent />
    </>
  );
}

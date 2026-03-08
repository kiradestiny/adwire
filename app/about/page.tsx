import type { Metadata } from "next";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "關於 ADWire Agency | 香港 MarTech 數碼營銷代理 | SEO + AI 全棧團隊",
  description:
    "ADWire Agency 是香港領先的 MarTech 代理商，結合 10 年 SEO 專業經驗與全棧開發技術。提供 KOL 網紅營銷、SEO/GEO 優化、AI 自動化、成效廣告及短視頻製作服務。辦公室位於葵芳新都會廣場。",
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
    canonical: "/about",
  },
  openGraph: {
    title: "關於 ADWire Agency | 香港 MarTech 數碼營銷代理",
    description:
      "ADWire Agency 是香港領先的 MarTech 代理商，結合 10 年 SEO 經驗與全棧開發技術，提供數據驅動的全方位數碼營銷解決方案。",
    url: "https://adwire.com.hk/about",
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
    "ADWire Agency 是香港一間科技驅動的 MarTech（Marketing Technology）代理商，成立於香港，專注於 SEO/GEO 優化、KOL 網紅營銷、AI 自動化、成效廣告（Meta / Google Ads）及短視頻製作。團隊擁有 10 年以上 SEO 實戰經驗及全棧開發能力。",
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
      telephone: "+852-9586-1027",
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
  "@id": "https://adwire.com.hk/about#webpage",
  name: "關於 ADWire Agency",
  url: "https://adwire.com.hk/about",
  description:
    "了解 ADWire Agency 的公司故事、核心使命、專業團隊及服務理念。ADWire 是香港少數同時擁有 10 年 SEO 專家與全棧開發者的 MarTech 代理商。",
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
        item: "https://adwire.com.hk/about",
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
        text: "ADWire Agency 是一間位於香港葵芳的 MarTech（Marketing Technology）數碼代理公司。我們結合 10 年以上 SEO 實戰經驗與全棧開發技術，為品牌提供數據驅動的全方位數碼營銷方案，包括 SEO/GEO 優化、KOL 網紅營銷、AI 自動化、Meta/Google 成效廣告及短視頻製作。",
      },
    },
    {
      "@type": "Question",
      name: "ADWire 與其他香港 Marketing Agency 有什麼分別？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ADWire 是香港市場少數同時擁有「10年製 SEO 專家」與「全棧開發者（Full-stack Developer）」的代理商。傳統 Marketing Agency 做創意但不懂技術，IT 公司懂技術但不懂市場心理。ADWire 填補了這個缺口——我們既能做廣告投放、SEO 排名，同時能開發自動化系統、定製 CRM，以技術提升每一個營銷環節的效率。",
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
        text: "可透過以下方式聯絡 ADWire：(1) WhatsApp +852-9586-1027；(2) 電郵 info@adwire.com.hk；(3) 填寫網站聯絡表單。我們提供免費初步諮詢，了解您的業務需求後，會提供針對性的服務方案建議。",
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

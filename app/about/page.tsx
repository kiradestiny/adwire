import type { Metadata } from "next";
import AboutContent from "./AboutContent";
import { WHATSAPP_E164, CONTACT_EMAIL, SITE_URL } from "@/lib/site-config";
import { SERVICE_LINES } from "@/lib/site-content";
import { ABOUT_FAQS, OFFICE_ADDRESS, OFFICE_HOURS } from "@/lib/about-faqs";

/**
 * 「關於我們」頁 metadata 與結構化資料
 *
 * 2026-09-23 修訂：
 *   - FAQ 結構化資料改由 lib/about-faqs.ts 讀取，與畫面內容逐字一致。
 *     （舊版畫面與結構化資料各自維護，結構化資料仍留有未經核准的
 *      「平均 ROAS 達 3–5 倍」及「係咩公司」等口語字句）
 *   - 移除本頁自行定義的 Organization。全站 Organization 節點
 *     （@id = https://adwire.com.hk/#organization）已由 components/JsonLd.tsx
 *     在 layout 統一輸出；同一 @id 在兩處各自定義會造成實體衝突。
 *     本頁改為以 AboutPage 引用該節點，並另加服務線 ItemList。
 *   - og:image 由 /logo.png（實際 533×173）改為 /og-image.png（實際 1200×630）。
 *     舊設定宣告 1200×630 但檔案尺寸不符，社群分享會顯示異常。
 */

const TITLE = "關於 ADWire｜香港軟件開發與 AI 自動化團隊";
const DESCRIPTION =
  "ADWire Agency Limited 是香港軟件開發及 AI 自動化團隊，提供企業網站、Web App、CRM／ERP 系統、AI 應用與工作流程自動化、SEO／GEO 搜尋優化，以及成效廣告、社交媒體、短視頻及 KOL 營銷服務。500+ 服務客戶，辦公室位於葵芳。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "ADWire Agency",
    "香港軟件開發公司",
    "香港 AI 自動化",
    "企業系統開發香港",
    "CRM ERP 定制開發",
    "Web App 開發香港",
    "工作流程自動化",
    "AI 應用開發",
    "香港 SEO 公司",
    "GEO 優化",
    "數碼增長方案",
    "Software Development Hong Kong",
    "AI Automation Hong Kong",
  ],
  authors: [{ name: "ADWire Agency", url: SITE_URL }],
  alternates: {
    canonical: "/about/",
  },
  openGraph: {
    title: "關於 ADWire｜香港軟件開發與 AI 自動化團隊",
    description:
      "ADWire Agency Limited 提供軟件開發、AI 與工作流程自動化、SEO／GEO 及數碼營銷服務，500+ 服務客戶。",
    url: `${SITE_URL}/about/`,
    siteName: "ADWire Agency",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ADWire Agency — 香港軟件開發、AI 自動化與數碼增長團隊",
      },
    ],
    locale: "zh_HK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "關於 ADWire｜香港軟件開發與 AI 自動化團隊",
    description:
      "ADWire Agency Limited 結合軟件開發、AI 自動化與 SEO／GEO，為香港企業提供可運作的數碼方案。",
    images: ["/og-image.png"],
  },
};

// ─── JSON-LD ────────────────────────────────────────────────────────────────

/**
 * AboutPage — 描述本頁。
 * 公司實體（Organization）不在本頁重複定義，只引用 layout 已輸出的
 * @id = https://adwire.com.hk/#organization，避免同一 @id 出現兩個版本。
 */
const aboutPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${SITE_URL}/about/#webpage`,
  name: "關於 ADWire Agency",
  url: `${SITE_URL}/about/`,
  description:
    "了解 ADWire Agency Limited 的公司資料、五條服務線、交付流程與合作模式、團隊組成及服務範圍。",
  inLanguage: ["zh-Hant", "en"],
  isPartOf: {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
  },
  about: {
    "@id": `${SITE_URL}/#organization`,
  },
  mainEntity: {
    "@id": `${SITE_URL}/#organization`,
    legalName: "ADWire Agency Limited",
    address: {
      "@type": "PostalAddress",
      streetAddress: OFFICE_ADDRESS,
      addressLocality: "Kwai Fong",
      addressRegion: "New Territories",
      addressCountry: "HK",
    },
    openingHours: OFFICE_HOURS,
    email: CONTACT_EMAIL,
    telephone: WHATSAPP_E164,
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首頁", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "關於我們",
        item: `${SITE_URL}/about/`,
      },
    ],
  },
};

/** 五條服務線 ItemList：讓搜尋引擎及 AI 引擎可直接抽取服務範圍 */
const serviceItemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "@id": `${SITE_URL}/about/#service-lines`,
  name: "ADWire Agency 五條服務線",
  description:
    "ADWire Agency 提供軟件開發、AI 與自動化、SEO／GEO 搜尋優化、跨境營銷及數碼營銷五條服務線。",
  numberOfItems: SERVICE_LINES.length,
  itemListElement: SERVICE_LINES.map((line, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: line.name,
    description: `${line.audience}：${line.children.map((c) => c.name).join("、")}`,
    url: `${SITE_URL}${line.href}`,
  })),
};

/** FAQ 結構化資料：直接由畫面使用的同一份資料生成，避免兩者內容不一致 */
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE_URL}/about/#faq`,
  mainEntity: ABOUT_FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceItemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <AboutContent />
    </>
  );
}
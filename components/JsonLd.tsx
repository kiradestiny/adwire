import { WHATSAPP_E164 } from "@/lib/site-config";

export default function JsonLd() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://adwire.com.hk/#organization",
    "name": "ADWire Agency",
    "legalName": "ADWire Agency Limited",
    "alternateName": ["ADWire", "ADWire Hong Kong"],
    "url": "https://adwire.com.hk",
    "logo": {
      "@type": "ImageObject",
      "url": "https://adwire.com.hk/logo.png",
      "width": 533,
      "height": 173
    },
    "description": "ADWire Agency Limited 提供企業網站及系統開發、AI 應用與工作流程自動化、SEO／GEO 搜尋優化，以及成效廣告、社交媒體、短視頻及 KOL 等數碼營銷服務，以香港市場為主。",
    // 實體消歧義（2026-10-10）：Google AI 曾把本公司與同名／近名機構撈亂，並虛構出中文名「愛德廣告代理有限公司」。
    // 客戶確認：本公司只有英文註冊名稱，並無中文名稱。以下欄位用於向搜尋引擎明確標示唯一實體。
    "disambiguatingDescription": "在香港註冊的軟件開發及數碼營銷公司，註冊英文名稱為 ADWire Agency Limited（並無中文註冊名稱），官方網站為 adwire.com.hk，服務對象為香港及大灣區企業。",
    "identifier": {
      "@type": "PropertyValue",
      "name": "Hong Kong Business Registration Number (BRN)",
      "value": "77898321"
    },
    "foundingDate": "2025-03-24",
    "sameAs": [
      "https://www.facebook.com/profile.php?id=61575126092859",
      "https://www.instagram.com/adwire_official/",
      "https://www.linkedin.com/company/adwirehk/"
    ],
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": WHATSAPP_E164,
        "contactType": "customer service",
        "contactOption": "TollFree",
        "areaServed": "HK",
        "availableLanguage": ["en", "zh-Hant", "zh-Yue"]
      },
      {
        "@type": "ContactPoint",
        "email": "info@adwire.com.hk",
        "contactType": "sales",
        "areaServed": "HK",
        "availableLanguage": ["en", "zh-Hant"]
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "葵芳新都會廣場 2 座 45 樓 4510 室",
      "addressLocality": "Kwai Fong",
      "addressRegion": "New Territories",
      "addressCountry": "HK"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Hong Kong"
    },
    // 註（2026-10-15）：已移除 numberOfEmployees（未經核准的團隊人數）。
    // aggregateRating（ratingValue 4.9 / ratingCount 128）亦已移除 —— 評分來源及
    // 評論數目從未核實，而 Google 的評論摘要政策不容許 LocalBusiness／Organization
    // 自行張貼「自利評論」取得星級，且評分必須來自真實用戶。本檔不會以任何未經
    // 核實的數字代替。如要恢復 aggregateRating，需先提供真實評論平台、
    // 評論數目及對應可驗證頁面。
    "knowsAbout": [
      "Software Development",
      "AI Application Development",
      "Business Workflow Automation",
      "Search Engine Optimization",
      "Generative Engine Optimization",
      "Digital Marketing"
    ]
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "MarketingAgency"],
    "@id": "https://adwire.com.hk/#localbusiness",
    "name": "ADWire Agency",
    "image": "https://adwire.com.hk/og-image.png",
    "url": "https://adwire.com.hk",
    "telephone": WHATSAPP_E164,
    "email": "info@adwire.com.hk",
    "priceRange": "$$",
    "currenciesAccepted": "HKD",
    "paymentAccepted": "Cash, Credit Card, Bank Transfer",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "葵芳新都會廣場 2 座 45 樓 4510 室",
      "addressLocality": "Kwai Fong",
      "addressRegion": "New Territories",
      "addressCountry": "HK"
    },
    "description": "ADWire Agency Limited 提供企業網站及系統開發、AI 應用與工作流程自動化、SEO／GEO 搜尋優化，以及成效廣告、社交媒體、短視頻及 KOL 等數碼營銷服務，以香港市場為主。",
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 22.3578,
      "longitude": 114.1275
    },
    "hasMap": "https://maps.google.com/?q=22.3578,114.1275",
    "knowsAbout": [
      "KOL Marketing",
      "Influencer Marketing",
      "Digital Marketing",
      "SEO",
      "GEO",
      "Generative Engine Optimization",
      "AI Marketing",
      "Video Production",
      "Short Video",
      "Reels",
      "TikTok Marketing",
      "Marketing Automation",
      "Performance Marketing",
      "WhatsApp Automation",
      "CRM Development",
      "Social Media Management"
    ],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    ]
  };

  // WebSite Schema — 描述網站實體
  // 已移除 potentialAction / SearchAction（2026-10-15）：Google 已於 2024 年 11 月
  // 移除 Sitelinks 搜尋框，且站內無任何頁面讀取 `q` 參數，原 target
  // urlTemplate 指向不存在的功能。
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://adwire.com.hk/#website",
    "name": "ADWire Agency",
    "alternateName": "ADWire 香港數碼營銷代理",
    "url": "https://adwire.com.hk",
    "description": "香港企業軟件開發、AI 應用與自動化、SEO／GEO 及數碼營銷方案",
    "inLanguage": ["zh-HK", "en-HK"],
    "publisher": {
      "@id": "https://adwire.com.hk/#organization"
    }
  };

  // ItemList Schema — 服務列表，助 AI 理解服務範疇
  const servicesItemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "ADWire Agency 香港數碼營銷服務",
    "description": "ADWire 提供香港全方位 AI 數碼營銷服務",
    "numberOfItems": 10,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "KOL 網紅營銷",
        "description": "精準配對香港及大灣區 KOL，打造真實口碑與病毒式傳播",
        "url": "https://adwire.com.hk/services/kol/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "短視頻製作",
        "description": "專業製作 Instagram Reels、TikTok 及 YouTube Shorts 爆款短片",
        "url": "https://adwire.com.hk/services/video/"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "SEO 與 GEO 優化",
        "description": "傳統 SEO + Generative Engine Optimization，讓品牌在 Google 及 ChatGPT 中都能被找到",
        "url": "https://adwire.com.hk/services/seo/"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "成效廣告投放",
        "description": "Facebook、Instagram、Google、YouTube 及小紅書精準廣告投放",
        "url": "https://adwire.com.hk/services/ads/"
      },
      {
        "@type": "ListItem",
        "position": 5,
        "name": "社交媒體管理",
        "description": "全平台社交帳號管理、內容創作及社群互動策略",
        "url": "https://adwire.com.hk/services/social/"
      },
      {
        "@type": "ListItem",
        "position": 6,
        "name": "企業流程自動化及 RPA",
        "description": "WhatsApp 自動化、CRM 整合及 AI 驅動的業務流程自動化",
        "url": "https://adwire.com.hk/services/automation/"
      },
      {
        "@type": "ListItem",
        "position": 7,
        "name": "AI 解決方案",
        "description": "度身訂造 AI Agent、企業級 LLM 應用及 AI 工作流自動化",
        "url": "https://adwire.com.hk/services/ai/"
      },
      {
        "@type": "ListItem",
        "position": 8,
        "name": "網頁設計與開發",
        "description": "品牌網站、電商網店設計，注重 RWD 及轉換率優化",
        "url": "https://adwire.com.hk/services/web/"
      },
      {
        "@type": "ListItem",
        "position": 9,
        "name": "企業系統開發",
        "description": "ERP、CRM、預訂系統等度身訂造企業管理系統開發",
        "url": "https://adwire.com.hk/services/system/"
      },
      {
        "@type": "ListItem",
        "position": 10,
        "name": "商業攝影與影片製作",
        "description": "專業產品攝影、企業形象片及宣傳影片製作",
        "url": "https://adwire.com.hk/services/production/"
      }
    ]
  };

  const schemas = [
    organizationSchema,
    localBusinessSchema,
    websiteSchema,
    servicesItemListSchema,
  ];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

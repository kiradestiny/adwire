export default function JsonLd() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://adwire.com.hk/#organization",
    "name": "ADWire Agency",
    "alternateName": ["ADWire", "ADWire Hong Kong", "ADWire Agency Limited"],
    "url": "https://adwire.com.hk",
    "logo": {
      "@type": "ImageObject",
      "url": "https://adwire.com.hk/logo.png",
      "width": 400,
      "height": 200
    },
    "description": "ADWire Agency 是香港領先的 AI 驅動 MarTech 代理商，專注於 KOL 網紅營銷、短視頻製作、SEO/GEO 優化及成效廣告投放。服務超過500家企業，平均ROI提升328%。",
    "foundingDate": "2023",
    "sameAs": [
      "https://www.facebook.com/profile.php?id=61575126092859",
      "https://www.instagram.com/adwire_official/",
      "https://www.linkedin.com/company/106715005/"
    ],
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+852-9586-1027",
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
    "numberOfEmployees": {
      "@type": "QuantitativeValue",
      "minValue": 10,
      "maxValue": 50
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "128",
      "reviewCount": "128"
    }
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "MarketingAgency"],
    "@id": "https://adwire.com.hk/#localbusiness",
    "name": "ADWire Agency",
    "image": "https://adwire.com.hk/logo.png",
    "url": "https://adwire.com.hk",
    "telephone": "+852-9586-1027",
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
    "description": "ADWire Agency 是香港領先的 AI 驅動 MarTech 代理商，專注於 KOL 網紅營銷、短視頻製作、SEO/GEO 優化及成效廣告投放。我們結合數據分析與自動化技術，助企業實現業績增長。",
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
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "128"
    }
  };

  // WebSite Schema — 觸發 Google Sitelinks 搜尋框
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://adwire.com.hk/#website",
    "name": "ADWire Agency",
    "alternateName": "ADWire 香港數碼營銷代理",
    "url": "https://adwire.com.hk",
    "description": "香港首選 AI 驅動 MarTech 代理——KOL 網紅營銷、短視頻製作、SEO/GEO 優化及成效廣告",
    "inLanguage": ["zh-HK", "en-HK"],
    "publisher": {
      "@id": "https://adwire.com.hk/#organization"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://adwire.com.hk/blog?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  // HowTo Schema — 合作流程，觸發 Google Rich Results
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "如何與 ADWire Agency 開始合作？",
    "description": "四個簡單步驟，讓 ADWire 為您量身打造 AI 驅動的數碼營銷方案，助香港企業業績增長。",
    "totalTime": "PT15M",
    "supply": [
      {
        "@type": "HowToSupply",
        "name": "業務資料"
      },
      {
        "@type": "HowToSupply",
        "name": "營銷目標與預算範圍"
      }
    ],
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "免費初步諮詢",
        "text": "通過 WhatsApp (+852 9586 1027) 或網站表格聯絡 ADWire，進行 15 分鐘免費業務診斷，了解您的痛點與目標。",
        "url": "https://adwire.com.hk/contact"
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "深度調研與分析",
        "text": "ADWire 專家團隊分析您的行業趨勢、競爭對手及目標受眾，找出品牌增長的關鍵切入點。"
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "量身定制方案",
        "text": "結合 AI 技術與創意內容，制定全方位的 KOL 網紅營銷、SEO/GEO 優化、廣告投放或自動化系統方案。"
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "執行、優化與增長",
        "text": "精準執行、實時數據監測，持續優化轉化路徑，確保每一分預算都產生最大回報。",
        "url": "https://adwire.com.hk/portfolio"
      }
    ]
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
        "url": "https://adwire.com.hk/services/kol"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "短視頻製作",
        "description": "專業製作 Instagram Reels、TikTok 及 YouTube Shorts 爆款短片",
        "url": "https://adwire.com.hk/services/video"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "SEO 與 GEO 優化",
        "description": "傳統 SEO + Generative Engine Optimization，讓品牌在 Google 及 ChatGPT 中都能被找到",
        "url": "https://adwire.com.hk/services/seo"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "成效廣告投放",
        "description": "Facebook、Instagram、Google、YouTube 及小紅書精準廣告投放",
        "url": "https://adwire.com.hk/services/ads"
      },
      {
        "@type": "ListItem",
        "position": 5,
        "name": "社交媒體管理",
        "description": "全平台社交帳號管理、內容創作及社群互動策略",
        "url": "https://adwire.com.hk/services/social"
      },
      {
        "@type": "ListItem",
        "position": 6,
        "name": "營銷自動化",
        "description": "WhatsApp 自動化、CRM 整合及 AI 驅動的業務流程自動化",
        "url": "https://adwire.com.hk/services/automation"
      },
      {
        "@type": "ListItem",
        "position": 7,
        "name": "AI 解決方案",
        "description": "定制化 AI Agent、企業級 LLM 應用及 AI 工作流自動化",
        "url": "https://adwire.com.hk/services/ai"
      },
      {
        "@type": "ListItem",
        "position": 8,
        "name": "網頁設計與開發",
        "description": "品牌網站、電商網店設計，注重 RWD 及轉化率優化",
        "url": "https://adwire.com.hk/services/web"
      },
      {
        "@type": "ListItem",
        "position": 9,
        "name": "企業系統開發",
        "description": "ERP、CRM、預訂系統等定制化企業管理系統開發",
        "url": "https://adwire.com.hk/services/system"
      },
      {
        "@type": "ListItem",
        "position": 10,
        "name": "商業攝影與視頻製作",
        "description": "專業產品攝影、企業形象片及宣傳視頻製作",
        "url": "https://adwire.com.hk/services/production"
      }
    ]
  };

  const schemas = [
    organizationSchema,
    localBusinessSchema,
    websiteSchema,
    howToSchema,
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

import type { Metadata } from "next";
import BlogContent from "./BlogContent";
import { blogPosts } from "@/lib/blogData";

export const metadata: Metadata = {
  title: "增長洞察 Blog | MarTech、SEO、KOL 及 AI 營銷策略",
  description:
    "ADWire Agency 分享最前沿的 MarTech 趨勢、AI 工具應用、SEO/GEO 策略、KOL 網紅營銷及廣告投放乾貨。助香港中小企掌握流量密碼，提升業務增長。",
  keywords: [
    "香港數碼營銷 blog",
    "MarTech 趨勢",
    "SEO 優化技巧",
    "GEO 生成式引擎優化",
    "KOL 網紅營銷",
    "AI 營銷策略",
    "短視頻行銷",
    "Facebook 廣告投放",
    "Google Ads 香港",
    "自動化營銷",
    "增長黑客",
    "轉換率優化",
    "香港中小企行銷",
  ],
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "增長洞察 Blog | ADWire Agency — MarTech、SEO、AI 營銷策略",
    description:
      "分享最前沿的 MarTech 趨勢、AI 工具應用、SEO 策略及數碼營銷乾貨。助你掌握流量密碼，提升業務增長。",
    url: "https://adwire.com.hk/blog",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "ADWire Agency 增長洞察 Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "增長洞察 Blog | ADWire Agency",
    description: "MarTech 趨勢、SEO 策略、KOL 及 AI 營銷乾貨",
  },
};

// Blog ItemList Schema — 讓 Google 及 AI 引擎理解 Blog 結構
function BlogListSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": "https://adwire.com.hk/blog",
    "name": "ADWire Agency 增長洞察 Blog",
    "description":
      "分享最前沿的 MarTech 趨勢、AI 工具應用、SEO/GEO 策略及數碼營銷乾貨",
    "url": "https://adwire.com.hk/blog",
    "inLanguage": "zh-HK",
    "publisher": {
      "@type": "Organization",
      "@id": "https://adwire.com.hk/#organization",
      "name": "ADWire Agency",
      "logo": {
        "@type": "ImageObject",
        "url": "https://adwire.com.hk/logo.png",
      },
    },
    "blogPost": blogPosts.map((post) => ({
      "@type": "BlogPosting",
      "@id": `https://adwire.com.hk/blog/${post.slug}`,
      "headline": post.title,
      "description": post.excerpt,
      "url": `https://adwire.com.hk/blog/${post.slug}`,
      "datePublished": `${post.date}T09:00:00+08:00`,
      "image": post.image
        ? `https://adwire.com.hk${post.image}`
        : "https://adwire.com.hk/logo.png",
      "keywords": post.tags.join(", "),
      "articleSection": post.category,
      "author": {
        "@type": "Organization",
        "name": "ADWire Agency",
        "url": "https://adwire.com.hk",
      },
    })),
  };

  // BreadcrumbList for blog listing
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "首頁",
        "item": "https://adwire.com.hk",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "增長洞察 Blog",
        "item": "https://adwire.com.hk/blog",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}

export default function BlogListingPage() {
  return (
    <>
      <BlogListSchema />
      <BlogContent />
    </>
  );
}

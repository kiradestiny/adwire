import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSerializablePortfolioCases, getPortfolioExtendedData } from "@/lib/data-resolver";
import type { SerializablePortfolioCase } from "@/lib/admin-types";
import type { PortfolioCase } from "@/lib/portfolioData";
import type { CaseExtendedData } from "@/lib/portfolioExtendedData";
import { ICON_MAP, DEFAULT_ICON } from "@/lib/icon-map";
import CaseStudyContent from "./CaseStudyContent";

// ─── 靜態路由生成（Static Site Generation）────────────────────
export async function generateStaticParams() {
  const cases = await getSerializablePortfolioCases();
  return cases.map((c) => ({ slug: c.slug }));
}

// ─── Helper: SerializablePortfolioCase → PortfolioCase（Server Component 用）───
function toCase(c: SerializablePortfolioCase): PortfolioCase {
  return {
    ...c,
    icon: ICON_MAP[c.iconName] || DEFAULT_ICON,
  } as PortfolioCase;
}

// ─── 動態 SEO Metadata ────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cases = await getSerializablePortfolioCases();
  const serializable = cases.find((c) => c.slug === slug);

  if (!serializable) {
    return {
      title: "案例不存在 | ADWire Agency",
    };
  }

  const caseItem = toCase(serializable);

  return {
    title: caseItem.seoTitle,
    description: caseItem.seoDescription,
    keywords: [
      caseItem.industry,
      caseItem.category,
      ...caseItem.tags,
      "ADWire Agency",
      "香港數碼營銷",
      "成功案例",
      caseItem.displayCategory,
    ],
    alternates: {
      canonical: `/portfolio/${caseItem.slug}/`,
    },
    openGraph: {
      title: caseItem.seoTitle,
      description: caseItem.seoDescription,
      url: `https://adwire.com.hk/portfolio/${caseItem.slug}/`,
      type: "article",
      images: [
        {
          url: caseItem.image,
          width: 1200,
          height: 630,
          alt: caseItem.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: caseItem.seoTitle,
      description: caseItem.seoDescription,
      images: [caseItem.image],
    },
  };
}

// ─── JSON-LD 結構化數據 ───────────────────────────────────────
function CaseStudyJsonLd({
  caseItem,
}: {
  caseItem: PortfolioCase;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: caseItem.seoTitle,
    description: caseItem.seoDescription,
    image: `https://adwire.com.hk${caseItem.image}`,
    url: `https://adwire.com.hk/portfolio/${caseItem.slug}/`,
    author: {
      "@type": "Organization",
      name: "ADWire Agency",
      url: "https://adwire.com.hk",
    },
    publisher: {
      "@type": "Organization",
      name: "ADWire Agency",
      url: "https://adwire.com.hk",
      logo: {
        "@type": "ImageObject",
        url: "https://adwire.com.hk/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://adwire.com.hk/portfolio/${caseItem.slug}/`,
    },
    about: {
      "@type": "Thing",
      name: caseItem.industry,
    },
    keywords: caseItem.tags.join(", "),
    inLanguage: "zh-HK",
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
        {
          "@type": "ListItem",
          position: 3,
          name: caseItem.title,
          item: `https://adwire.com.hk/portfolio/${caseItem.slug}/`,
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ─── FAQPage JSON-LD ──────────────────────────────────────────
function FaqPageJsonLd({
  extendedData,
}: {
  extendedData?: CaseExtendedData;
}) {
  if (!extendedData?.faqs?.length) return null;
  const extended = extendedData;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: extended.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ─── HowTo JSON-LD（執行流程 → 步驟富結果）──────────────────────
function HowToJsonLd({
  caseItem,
}: {
  caseItem: PortfolioCase;
}) {
  if (!caseItem.processSteps?.length) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `${caseItem.title} — ADWire Agency 執行流程`,
    description: caseItem.shortDescription,
    image: `https://adwire.com.hk${caseItem.image}`,
    totalTime: `P${caseItem.duration.replace(/[^0-9]/g, "")}W`,
    supply: caseItem.services.map((s) => ({
      "@type": "HowToSupply",
      name: s,
    })),
    step: caseItem.processSteps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.title,
      text: step.description,
      url: `https://adwire.com.hk/portfolio/${caseItem.slug}/#process`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ─── Service JSON-LD ──────────────────────────────────────────
function ServiceJsonLd({
  caseItem,
}: {
  caseItem: PortfolioCase;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: caseItem.displayCategory,
    description: caseItem.fullDescription,
    provider: {
      "@type": "Organization",
      name: "ADWire Agency",
      url: "https://adwire.com.hk",
      areaServed: {
        "@type": "Place",
        name: "Hong Kong",
      },
    },
    serviceType: caseItem.category,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      areaServed: "HK",
    },
    category: caseItem.industry,
    audience: {
      "@type": "BusinessAudience",
      audienceType: "Business",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ─── Page Component ───────────────────────────────────────────
export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Build Time 數據取得（API 優先 + 本地 Fallback）
  const [allCases, extendedDataMap] = await Promise.all([
    getSerializablePortfolioCases(),
    getPortfolioExtendedData(),
  ]);

  const serializable = allCases.find((c) => c.slug === slug);
  if (!serializable) {
    notFound();
  }

  const caseItem = toCase(serializable);
  const extendedData = extendedDataMap[slug];

  // 取得相關案例（同 category，排除自身，最多 3 個）
  const relatedSerializable = allCases
    .filter((c) => c.slug !== slug && c.category === serializable.category)
    .slice(0, 3);

  return (
    <>
      {/* Article + BreadcrumbList + Review */}
      <CaseStudyJsonLd caseItem={caseItem} />
      {/* FAQPage — Google FAQ Rich Snippets 摺疊問答 */}
      <FaqPageJsonLd extendedData={extendedData} />
      {/* HowTo — 執行流程步驟富結果 */}
      <HowToJsonLd caseItem={caseItem} />
      {/* Service — 強化服務類別語意信號 */}
      <ServiceJsonLd caseItem={caseItem} />
      {/*
        ✅ 傳遞可序列化數據（SerializablePortfolioCase），
        CaseStudyContent 內部將 iconName 映射回 LucideIcon Component。
        同時保留 slug 作為 fallback key。
      */}
      <CaseStudyContent
        slug={slug}
        caseData={serializable}
        relatedCasesData={relatedSerializable}
        extendedData={extendedData}
      />
    </>
  );
}

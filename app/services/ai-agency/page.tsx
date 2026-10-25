import type { Metadata } from "next";
import AiAgencyContent from "./AiAgencyContent";
import ServicePageJsonLd from "@/components/service-page/ServicePageJsonLd";
import { AI_AGENCY_FAQS } from "@/lib/service-faqs";
import { AI_AGENCY_PAGE } from "@/lib/service-pages/ai-agency";

const PATH = "/services/ai-agency/";
const TITLE = "AI Agency 香港｜AI 開發及數碼營銷同一隊";
const DESCRIPTION =
  "不肯定應該做 AI、自動化、SEO 還是廣告？ADWire 由業務問題出發，同一隊人負責 AI 開發及數碼營銷，並說明與傳統廣告公司、技術供應商的分別及收費模式。30 秒分流。";
const IMAGE = "https://assets.adwire.com.hk/services/ai-agency-choose-path.jpg";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["AI Agency", "AI Agency 香港", "AI 公司 香港", "AI 營銷公司", "AI 廣告公司", "AI marketing agency HK", "點揀 AI 公司", "AI Agency 收費"],
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `https://adwire.com.hk${PATH}`,
    siteName: "ADWire Agency",
    images: [{ url: IMAGE, alt: AI_AGENCY_PAGE.heroImage.alt }],
    type: "website",
    locale: "zh_HK",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [IMAGE],
  },
};

export default function AiAgencyPage() {
  return (
    <>
      <ServicePageJsonLd
        path={PATH}
        name="AI Agency 服務：AI 開發及數碼營銷"
        description={DESCRIPTION}
        serviceType="AI Consulting and Digital Marketing"
        image={IMAGE}
        crumb={AI_AGENCY_PAGE.crumb}
        faqs={AI_AGENCY_FAQS}
      />
      <AiAgencyContent />
    </>
  );
}

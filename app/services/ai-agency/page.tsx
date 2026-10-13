import type { Metadata } from "next";
import AiAgencyContent from "./AiAgencyContent";
import ServiceJsonLd from "@/components/ServiceJsonLd";
import FAQJsonLd from "@/components/FAQJsonLd";
import { AI_AGENCY_FAQS } from "@/lib/service-faqs";

export const metadata: Metadata = {
  title: "AI Agency 香港｜AI 應用開發 × 數碼營銷",
  description:
    "香港 AI Agency：把 AI 應用開發與數碼營銷放在同一隊。由使用場景、資料可用性、內容生產到廣告優化，說明交付範圍、收費方式、風險與人工覆核安排。",
  keywords: [
    "AI Agency",
    "AI Agency 香港",
    "AI 廣告公司",
    "AI 廣告公司 香港",
    "AI 營銷公司",
    "AI marketing agency HK",
    "AI 搜尋優化",
    "AI 內容生產",
    "AI 廣告優化",
    "企業 AI 導入",
    "香港 AI 公司",
    "AI 轉型 顧問",
  ],
  alternates: {
    canonical: "/services/ai-agency/",
  },
  openGraph: {
    title: "AI Agency 香港｜AI 應用開發 × 數碼營銷 | ADWire Agency",
    description:
      "香港少數同時具備 AI 應用開發與數碼營銷實作能力的團隊。由場景評估、資料整理、內容生產到廣告投放及量度，逐項說明可以做與不可以做。",
    url: "https://adwire.com.hk/services/ai-agency/",
    siteName: "ADWire Agency",
    type: "website",
    locale: "zh_HK",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Agency 香港 | ADWire Agency",
    description:
      "AI 應用開發 × 數碼營銷一站式。說明場景評估、交付範圍、收費方式、風險及人工覆核安排。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function AiAgencyPage() {
  return (
    <>
      <ServiceJsonLd
        name="AI Agency 服務（AI 應用開發 × 數碼營銷）"
        description="香港 AI Agency 服務：結合 AI 應用開發（AI Agent、RAG 知識庫、流程自動化）與數碼營銷（SEO／GEO、廣告投放、內容生產），由場景評估到上線後量度。"
        url="https://adwire.com.hk/services/ai-agency/"
      />
      <FAQJsonLd faqs={AI_AGENCY_FAQS} />
      <AiAgencyContent />
    </>
  );
}

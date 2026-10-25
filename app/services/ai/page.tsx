import type { Metadata } from "next";
import AiServiceContent from "./AiServiceContent";
import ServicePageJsonLd from "@/components/service-page/ServicePageJsonLd";
import { AI_FAQS } from "@/lib/service-faqs";
import { AI_PAGE } from "@/lib/service-pages/ai";

const PATH = "/services/ai/";
const TITLE = "企業 AI 應用開發｜AI Agent 及 RAG 知識庫";
const DESCRIPTION =
  "客服每日答同一批問題、同事花大量時間找文件和抄資料？ADWire 為香港企業開發 AI 客服輔助、RAG 知識庫及文件處理，接入現有系統並保留人工覆核。先做流程盤點，再試點。";
const IMAGE = "https://assets.adwire.com.hk/services/ai-knowledge-base-review.jpg";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["企業 AI", "AI 應用開發", "AI Agent", "RAG 知識庫", "企業知識庫", "AI 客服", "文件處理自動化", "香港 AI 公司", "AI 系統整合", "AI 轉型"],
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `https://adwire.com.hk${PATH}`,
    siteName: "ADWire Agency",
    images: [{ url: IMAGE, alt: AI_PAGE.heroImage.alt }],
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

export default function AiServicePage() {
  return (
    <>
      <ServicePageJsonLd
        path={PATH}
        name="企業 AI 應用開發及系統整合"
        description={DESCRIPTION}
        serviceType="AI Application Development"
        image={IMAGE}
        crumb={AI_PAGE.crumb}
        faqs={AI_FAQS}
      />
      <AiServiceContent />
    </>
  );
}

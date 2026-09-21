import type { Metadata } from "next";
import AiServiceContent from "./AiServiceContent";
import ServiceJsonLd from "@/components/ServiceJsonLd";
import FAQJsonLd from "@/components/FAQJsonLd";
import { AI_FAQS } from "@/lib/service-faqs";

export const metadata: Metadata = {
  title: "企業 AI 應用開發與系統整合",
  description: "企業 AI 應用、AI Agent、RAG 知識庫、文件處理及系統整合。由使用場景、資料可用性、權限設計到 Prototype、測試及上線後監控，同時說明風險與人工覆核安排。",
  keywords: [
    "AI 解決方案",
    "人工智能",
    "AI 客服",
    "企業 AI",
    "智能自動化",
    "流程自動化",
    "企業知識庫",
    "RAG",
    "私有化 AI",
    "LLM 部署",
    "香港 AI 公司",
    "B2B AI",
    "ChatGPT 企業版",
    "AI 轉型",
    "數碼轉型"
  ],
  alternates: {
    canonical: "/services/ai/",
  },
  openGraph: {
    title: "AI 解決方案 | 企業智能轉型專家 | ADWire Agency",
    description: "為香港企業開發 AI 應用與系統整合：AI Agent、RAG 知識庫、文件處理及工作流程自動化。按實際需要評估部署選項，並說明權限、資料保留及人工覆核安排。",
    url: "https://adwire.com.hk/services/ai/",
    siteName: "ADWire Agency",
    type: "website",
    locale: "zh_HK",
    images: [
      {
        url: "https://adwire.com.hk/og-ai-solutions.jpg",
        width: 1200,
        height: 630,
        alt: "ADWire AI 解決方案 - 企業智能轉型",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI 解決方案 | 企業智能轉型專家",
    description: "由使用場景、資料可用性及風險評估，到 Prototype、測試及上線後監控。說明 AI 模型費用、知識庫維護及人工覆核安排。",
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

export default function AiServicePage() {
  return (
    <>
      {/* 服務結構化數據 */}
      <ServiceJsonLd
        name="AI 解決方案"
        description="專為香港 B2B 企業打造的 AI 解決方案，包括 AI 客服系統、智能流程自動化、企業知識庫及私有化 AI 部署服務。"
        url="https://adwire.com.hk/services/ai/"
      />
      
      {/* FAQ 結構化數據 */}
      <FAQJsonLd faqs={AI_FAQS} />
      
      {/* 頁面內容 */}
      <AiServiceContent />
    </>
  );
}

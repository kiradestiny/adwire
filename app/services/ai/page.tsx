import type { Metadata } from "next";
import AiServiceContent from "./AiServiceContent";
import ServiceJsonLd from "@/components/ServiceJsonLd";
import FAQJsonLd from "@/components/FAQJsonLd";

// SEO 優化的 FAQ 數據
const aiFaqs = [
  {
    question: "AI 解決方案適合甚麼規模的企業？",
    answer: "我們的 AI 解決方案適合各種規模的 B2B 企業，從 10 人的中小企到數百人的大型企業都適用。我們會根據企業實際需求及預算，量身定制最合適的方案，由基礎的 AI 客服機器人到企業級私有化部署都可以提供。"
  },
  {
    question: "AI 導入需要多長時間？投資回報期是多久？",
    answer: "基礎的 AI 客服系統最快 4-6 週即可上線，較複雜的企業知識庫或流程自動化約需 2-3 個月。根據我們過往案例，大部分客戶在 3-6 個月內即可收回投資成本，部分企業更在首月便實現正 ROI。"
  },
  {
    question: "使用 AI 會否導致數據洩漏？",
    answer: "數據安全是我們的首要考量。我們提供私有化部署方案，所有 AI 模型及數據運行在企業內部網絡，不會上傳至任何第三方雲端。此外，我們亦嚴格遵守香港個人資料（私隱）條例及 GDPR 相關規定。"
  },
  {
    question: "員工是否需要接受培訓才能使用 AI 系統？",
    answer: "我們的 AI 系統設計以用戶友善為核心，大多數功能員工可在 1-2 小時內上手。同時，我們會提供完整的培訓課程、使用手冊及持續的技術支援，確保團隊能夠充分發揮 AI 的價值。"
  },
  {
    question: "AI 可以取代全部人手嗎？",
    answer: "AI 的定位是協助而非完全取代人手。AI 能處理 80% 以上的重複性工作，讓員工專注於需要創意、判斷力及人際互動的高價值任務。我們的目標是人機協作，提升整體生產力而非裁員。"
  },
  {
    question: "ADWire 的 AI 服務與其他供應商有何不同？",
    answer: "ADWire 專注於香港 B2B 市場，我們的優勢包括：1) 深入了解本地商業環境及廣東話語境；2) 提供從諮詢到落地的一站式服務；3) 具備多個行業的成功案例及實戰經驗；4) 重視數據安全，提供私有化部署選項。"
  }
];

export const metadata: Metadata = {
  title: "AI 解決方案 | 企業智能轉型專家 | ADWire Agency 香港",
  description: "香港領先的 B2B 企業 AI 解決方案。專業提供 AI 客服機器人、智能流程自動化 (IPA)、企業知識庫 (RAG)、商業智能分析及私有化 AI 部署。3-6 個月投資回報，成本節省高達 70%。立即預約免費 AI 諮詢。",
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
    canonical: "https://adwire.com.hk/services/ai",
  },
  openGraph: {
    title: "AI 解決方案 | 企業智能轉型專家 | ADWire Agency",
    description: "為香港 B2B 企業打造專屬 AI 解決方案。AI 客服、流程自動化、知識庫建設、私有化部署。助你解決人手短缺，提升效率高達 500%。",
    url: "https://adwire.com.hk/services/ai",
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
    description: "香港 B2B 企業 AI 轉型首選。AI 客服、流程自動化、私有化部署，3-6 個月 ROI。",
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
        url="https://adwire.com.hk/services/ai"
      />
      
      {/* FAQ 結構化數據 */}
      <FAQJsonLd faqs={aiFaqs} />
      
      {/* 頁面內容 */}
      <AiServiceContent />
    </>
  );
}

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HomepageProof from "@/components/HomepageProof";

const Services = dynamic(() => import("@/components/Services"));
const LogoWall = dynamic(() => import("@/components/LogoWall"));
const Testimonials = dynamic(() => import("@/components/Testimonials"));
const ProcessSection = dynamic(() => import("@/components/ProcessSection"));
const ContactSection = dynamic(() => import("@/components/ContactSection"));
const Footer = dynamic(() => import("@/components/Footer"));
const FAQSection = dynamic(() => import("@/components/FAQSection"));

import FAQJsonLd from "@/components/FAQJsonLd";
import type { Metadata } from "next";
import { getBrands } from "@/lib/data-resolver";
import { SITE_STATS } from "@/lib/site-stats";

export const metadata: Metadata = {
  title: { absolute: "ADWire Agency｜香港 AI 應用・流程自動化・SEO／GEO" },
  description:
    "ADWire 為香港企業度身開發 AI 工具、內部系統及自動化流程，減少人手處理與出錯；同時提供 SEO 及 GEO 搜尋優化。由需求分析、開發上線到持續改善，一個團隊負責。",
  keywords: [
    "AI 應用開發",
    "企業流程自動化",
    "AI 自動化香港",
    "系統開發",
    "SEO 優化",
    "GEO 優化",
    "Generative Engine Optimization",
    "WhatsApp 自動化",
    "CRM 系統",
    "網頁設計香港",
  ],
  alternates: {
    canonical: "/",
  },
};

// ─── 首頁 FAQ（6 條）────────────────────────────────────────────────────────
// 2026-10-25：由 15 條減至 6 條。刪除原因：
//   · 「為甚麼說服務超過 500 家客戶…」「合作夥伴代表正式認證嗎」等自辯題，反而令人起疑；
//   · 「1,000 位 KOL 資源庫」「超過 500 家客戶」屬 lib/site-stats.ts 已下架嘅無憑據數字；
//   · KOL／短視頻／廣告預算等營銷細節題，已在對應服務頁 FAQ 覆蓋。
// 數字一律由 SITE_STATS 輸出，唔再手寫。
const faqs = [
  {
    question: "ADWire Agency 主要提供甚麼服務？",
    answer:
      `ADWire 主力為香港企業開發 AI 應用及工作流程自動化，包括度身訂造的 AI 工具、內部系統及與 CRM／ERP、WhatsApp 等現有系統的整合，目的是加快流程、減少人手處理；同時提供 SEO 及 GEO（AI 搜尋優化）。企業網站、Web App 及手機 App 開發亦由同一團隊負責。成效廣告、社交媒體、短視頻、KOL 及攝影等營銷服務作為配套。至今已直接服務 ${SITE_STATS.brandClients} 個香港品牌，公開案例 ${SITE_STATS.publicCases} 個。`,
  },
  {
    question: "AI 自動化實際可以幫公司做甚麼？",
    answer:
      "常見做法包括：自動分類及回覆 WhatsApp／電郵查詢、從發票或表格擷取資料並寫入系統、自動跟進潛在客戶、整合分散在不同平台的數據，以及建立讓同事查詢內部資料的 AI 知識庫。我們會先了解現有流程，判斷哪些步驟適合自動化、哪些需要保留人工覆核，並說明出錯時的通知及處理方式。",
  },
  {
    question: "甚麼是 GEO（Generative Engine Optimization）？與 SEO 有何分別？",
    answer:
      "SEO 的目標是讓網站在 Google／Bing 自然搜尋取得曝光；GEO 則針對 ChatGPT、Perplexity、Google AI 搜尋等 AI 問答環境，做法包括內容結構清晰、事實可被引用、結構化資料標記，以及品牌資訊在不同渠道保持一致。兩者互補，GEO 不會取代 SEO。AI 平台的輸出由平台決定，任何供應商都無法保證品牌一定會被提及。",
  },
  {
    question: "收費模式是怎樣的？會不會有隱藏費用？",
    answer:
      "軟件開發、AI 及網站項目一般按項目報價；SEO／GEO、社交媒體代管及廣告代操則按月收費，而廣告代操的管理費與付給平台的媒體費分開計算。報價會列明包含與不包含的項目及付款安排。系統、App 及 AI 項目範圍差異較大，需先確認功能範圍才會提供報價。",
  },
  {
    question: "系統或網站開發需要多長時間？",
    answer:
      "品牌形象網站一般 2–4 週；電商網站（整合支付）約 4–8 週；度身訂造的 CRM、預約或內部系統約 6–16 週，視功能複雜度而定。開發期間會提供階段性預覽，完成後交付文件並安排交接；程式碼、網域及帳戶歸客戶所有。",
  },
  {
    question: "如何開始合作？第一次了解需求要收費嗎？",
    answer:
      "可以在網站填寫查詢表格或 WhatsApp 聯絡我們，1 個工作天內會有同事回覆。了解需求與討論範圍的對話不收費，亦沒有銷售壓力；確認範圍後我們會提供書面報價，你再決定是否開始。未確定方向的話，可以先做網站上的需求評估。",
  },
];

export default async function Home() {
  // ── Build Time 數據取得（API 優先 + 本地 Fallback）──
  const brands = await getBrands();

  // 2026-10-25 首頁由 13 個 section 減至 8 個（依第二輪內容審查）：
  //   移除「數據成就」（同 Hero 重複）、「ADWire vs 競爭者」對比表、匿名「成功案例」格、
  //   Blog 區、「合作夥伴／AI 技術生態系統」（內容保留於 /tech-stack/、/portfolio/、/blog/）。
  return (
    <div className="min-h-screen bg-white">
      <FAQJsonLd faqs={faqs} />
      <Navbar />
      <HeroSection />
      <LogoWall brands={brands} />
      <HomepageProof />
      <Services />
      <ProcessSection />
      <Testimonials />
      <FAQSection faqs={faqs} />
      <ContactSection />
      <Footer />
    </div>
  );
}

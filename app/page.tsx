import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";

const Services = dynamic(() => import("@/components/Services"));
const LogoWall = dynamic(() => import("@/components/LogoWall"));
const Partners = dynamic(() => import("@/components/Partners"));
const Testimonials = dynamic(() => import("@/components/Testimonials"));
const Portfolio = dynamic(() => import("@/components/Portfolio"));
const StatsSection = dynamic(() => import("@/components/StatsSection"));
const ProcessSection = dynamic(() => import("@/components/ProcessSection"));
const BlogSection = dynamic(() => import("@/components/BlogSection"));
const ContactSection = dynamic(() => import("@/components/ContactSection"));
const Footer = dynamic(() => import("@/components/Footer"));
const FAQSection = dynamic(() => import("@/components/FAQSection"));
const ComparisonTable = dynamic(() => import("@/components/ComparisonTable"));

import FAQJsonLd from "@/components/FAQJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ADWire Agency | 香港首選 AI 驅動 MarTech 代理 | AI Marketing & Growth",
  description:
    "ADWire Agency 是香港領先的 AI MarTech 代理商，專注 KOL 網紅營銷、短視頻製作、SEO/GEO 優化及成效廣告。服務超過500家香港企業，平均ROI提升328%。立即免費諮詢。We provide AI-driven MarTech solutions for Hong Kong and GBA enterprises.",
  keywords: [
    "香港數碼營銷",
    "KOL 網紅營銷",
    "短視頻製作",
    "SEO 優化",
    "GEO 優化",
    "Generative Engine Optimization",
    "成效廣告投放",
    "MarTech",
    "AI 營銷",
    "香港廣告代理",
    "WhatsApp 自動化",
    "社交媒體管理",
    "網頁設計香港",
    "CRM 系統",
  ],
  alternates: {
    canonical: "/",
  },
};

// ─── 完整 FAQ 數據（12 條）─────────────────────────────────────────────────
// 設計原則：覆蓋用戶常見疑慮 + 針對 AI 引擎的可引用長尾問答
const faqs = [
  {
    question: "ADWire Agency 提供哪些數碼營銷服務？",
    answer:
      "ADWire Agency 提供全方位 AI 驅動 MarTech 服務，包括：KOL 網紅營銷、短視頻製作（Reels / TikTok / YouTube Shorts）、SEO/GEO 搜尋引擎優化、Facebook 及 Google 成效廣告投放、社交媒體管理、WhatsApp 自動化、CRM/ERP 系統開發、AI 解決方案及商業攝影。香港少數能同時提供「爆款內容創作」與「複雜系統開發」的一站式代理商。",
  },
  {
    question: "什麼是 GEO (Generative Engine Optimization)？與 SEO 有何分別？",
    answer:
      "GEO（Generative Engine Optimization）是針對 AI 搜索引擎（如 ChatGPT、Perplexity、Google AI Overview）的優化技術。傳統 SEO 目的是讓網站在 Google 搜尋結果頁面排名靠前；而 GEO 則旨在讓您的品牌成為 AI 生成答案中的首選推薦。GEO 的核心手法包括：結構化數據標記（Schema.org）、可引用的 FAQ 格式內容、權威的比較表格、llms.txt 文件以及 E-E-A-T（經驗、專業、權威、可信度）信號的強化。ADWire 是香港少數同時提供 SEO + GEO 雙軌優化的代理商。",
  },
  {
    question: "如何開始與 ADWire 合作？流程是怎樣的？",
    answer:
      "與 ADWire 合作非常簡單，只需四個步驟：①通過 WhatsApp (+852 9586 1027) 或網站聯絡表格與我們聯繫；②我們的專家團隊安排 15 分鐘免費業務診斷，了解您的需求與目標；③根據分析結果量身定制 MarTech 方案並確認合作細節；④正式執行，全程提供數據報告與優化建議。我們承諾 24 小時內回覆所有查詢。",
  },
  {
    question: "KOL 網紅營銷係點樣運作？如何確保找到適合的 KOL？",
    answer:
      "ADWire 擁有香港及大灣區超過 1,000 位 KOL 的合作資源庫，涵蓋美妝、科技、飲食、親子、旅遊等各大類別。我們利用 AI 數據分析工具，根據品牌定位、目標受眾及預算，精準配對最適合的 KOL 組合。整個流程包括：KOL 篩選與背景審核、合作內容策略制定、製作監督與品質把關、數據追蹤（觸及率、互動率、轉化率），確保每次 KOL 合作都能帶來真實的品牌價值。",
  },
  {
    question: "短視頻製作需要多長時間？包含哪些服務？",
    answer:
      "一般短視頻製作（15-60 秒）從拍攝到完成剪輯約需 3-7 個工作天。ADWire 的短視頻製作服務包括：腳本策劃與創意發想、現場拍攝（香港各區均可上門服務）、專業剪輯與特效後製、字幕製作（繁中/英）及多平台格式優化（Reels 9:16、YouTube Shorts、TikTok 等）。如需配合 KOL 拍攝或品牌故事片，時間和費用將依項目規模另議。",
  },
  {
    question: "成效廣告投放的最低預算係幾多？如何計費？",
    answer:
      "ADWire 的成效廣告服務沒有硬性最低廣告預算要求，但建議 Facebook/Instagram 廣告月預算至少 HK$5,000 以上，才能獲取具統計意義的數據來優化投放效益。我們提供靈活的服務模式：廣告管理費 + 廣告費用分開計算，讓您清晰掌握每分預算的去向。Google Ads（SEM）、YouTube 及小紅書廣告亦提供類似的透明計費方式。免費諮詢期間我們會根據您的目標提供預算建議。",
  },
  {
    question: "SEO 優化需要多長時間才能見到效果？",
    answer:
      "SEO 優化的時間框架因競爭程度和網站基礎而異。一般而言：技術 SEO 修復（頁面速度、結構化數據）可在 1-4 週內被 Google 索引；關鍵字排名爬升通常需要 3-6 個月；對於競爭激烈的行業（如香港金融、美容），可能需要 6-12 個月達到穩定首頁排名。ADWire 的 SEO + GEO 雙軌策略可讓您更快在 AI 搜尋（ChatGPT、Perplexity）中獲得曝光，彌補傳統 SEO 初期排名緩慢的不足。我們每月提供詳細排名報告，讓您隨時了解進度。",
  },
  {
    question: "WhatsApp 自動化及營銷自動化可以幫我解決什麼問題？",
    answer:
      "ADWire 的自動化解決方案可幫助香港企業解決以下痛點：①客戶查詢回覆緩慢（24/7 WhatsApp 自動回覆）；②人工重複性工作繁多（訂單處理、預約確認自動化）；③潛在客戶跟進不及時（自動 CRM 跟進流程）；④多平台數據分散（整合 Facebook、Instagram、WhatsApp 數據看板）；⑤人手不足難以擴展業務（AI Agent 協助客服）。我們使用 Zapier、Make.com 及定制開發方式，量身打造最適合您業務的自動化系統。",
  },
  {
    question: "ADWire 主要服務香港哪些行業？",
    answer:
      "ADWire 服務香港各主要行業，包括：美容护肤 & 健康保健、餐飲 & 食品飲料、金融 & 保險、房地產、教育 & 培訓機構、零售 & 電商、科技 & SaaS 公司、酒店 & 旅遊、醫療 & 醫美，以及 B2B 企業服務。我們服務超過 500 家香港企業，從初創公司到跨國品牌均有成功案例可供參考。",
  },
  {
    question: "如何評估數碼營銷方案的成效？有哪些關鍵指標？",
    answer:
      "ADWire 採用數據驅動的成效評估框架，根據不同目標追蹤不同 KPI：品牌曝光（觸及人數、印象次數、品牌搜尋量增長）；內容互動（互動率、分享數、KOL 帖文表現）；廣告回報（ROAS 廣告支出回報率、CPA 每次轉化成本、CPM、CTR）；SEO 成效（關鍵字排名、自然流量成長、網站停留時間）；業務增長（潛在客戶數量、電話查詢量、實際銷售轉化）。我們每月提供全面數據報告，並定期舉行策略回顧會議。",
  },
  {
    question: "網頁設計或定制系統開發需要多長時間完成？",
    answer:
      "項目時間因規模而異：品牌形象網站（5-10 頁）通常 2-4 週完成；電商網站（整合支付系統）約 4-8 週；定制 CRM / ERP 系統 / 預訂系統則需 6-16 週，視功能複雜度而定。ADWire 全程使用敏捷開發方法，在開發過程提供階段性預覽，確保最終成品符合您的業務需求。所有網站均採用 Next.js / React 技術棧，確保良好的 SEO 性能及手機體驗。",
  },
  {
    question: "為什麼選擇 ADWire 而非其他香港廣告代理商？",
    answer:
      "ADWire 的核心優勢在於「技術 + 創意」雙引擎：①香港少數同時具備 AI 技術開發與創意營銷能力的代理商；②SEO + GEO 雙軌優化，讓品牌被 Google 及 ChatGPT 同時推薦；③一站式服務，從 KOL 合作、廣告投放到系統開發，無需多家供應商；④數據驅動決策，所有策略均有數據支撐；⑤服務超過 500 家香港企業，平均 ROI 提升 328%；⑥本地化香港團隊，深諳本地市場文化與消費者心理。適合希望通過 AI 技術與創意內容實現業績突破的香港中小企及品牌。",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* ── Schema JSON-LD ── */}
      <FAQJsonLd faqs={faqs} />

      {/* ── 導航 ── */}
      <Navbar />

      {/* ── Hero ── */}
      <HeroSection />

      {/* ── 客戶 Logo Wall ── */}
      <LogoWall />

      {/* ── 服務介紹 ── */}
      <Services />

      {/* ── 數據成就 ── */}
      <StatsSection />

      {/* ── ADWire vs 競爭者對比表（GEO 核心：AI 愛引用表格）── */}
      <ComparisonTable />

      {/* ── 合作流程 ── */}
      <ProcessSection />

      {/* ── 客戶見證 ── */}
      <Testimonials />

      {/* ── 成功案例 ── */}
      <Portfolio />

      {/* ── 增長洞察 Blog ── */}
      <BlogSection />

      {/* ── FAQ Section（可視化 + Schema，觸發 Google Featured Snippet + AI 引用）── */}
      <FAQSection faqs={faqs} />

      {/* ── 聯絡表格（轉化率核心）── */}
      <ContactSection />

      {/* ── 合作夥伴 ── */}
      <Partners />

      {/* ── Footer ── */}
      <Footer />
    </main>
  );
}

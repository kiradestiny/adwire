import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import { WHATSAPP_E164 } from "@/lib/site-config";

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
import { getBrands, getBlogPosts, getSerializablePortfolioCases } from "@/lib/data-resolver";

export const metadata: Metadata = {
  title: { absolute: "ADWire Agency｜軟件開發・AI 應用・SEO 增長方案" },
  description:
    "ADWire 提供企業網站及系統開發、AI 應用與工作流程自動化，以及 SEO／GEO 搜尋優化。由需求分析、開發部署到持續改善，協助香港企業處理實際營運與增長問題。",
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
      "ADWire 提供四條主要服務線：Software Development（企業網站、Web App、CRM／ERP 相關系統、手機 App、MVP 及 API 整合）、AI & Automation（AI 應用、企業知識庫、工作流程自動化、系統整合）、SEO & GEO（技術 SEO、內容與關鍵字規劃、AI 搜尋能見度及成效量度），以及 Digital Marketing（Google／Meta 廣告、社交媒體代管、短視頻製作、KOL 網紅營銷及商業攝影）。可先到服務範疇頁按需求查看對應服務。",
  },
  {
    question: "什麼是 GEO (Generative Engine Optimization)？與 SEO 有何分別？",
    answer:
      "GEO（Generative Engine Optimization，生成式引擎優化）針對 ChatGPT、Perplexity、Google AI 搜尋等 AI 問答環境優化品牌能見度，做法包括內容結構清晰、事實可被引用、結構化資料標記、品牌資訊在不同渠道保持一致，以及強化 E-E-A-T 訊號。傳統 SEO 目標是讓網站在 Google／Bing 自然搜尋結果取得曝光；GEO 是將同一批優質內容延伸到 AI 問答搜尋。兩者互補，GEO 不會取代 SEO。需要注意：AI 平台的輸出由平台決定，任何供應商都無法保證品牌一定會被提及或推薦。",
  },
  {
    question: "如何開始與 ADWire 合作？流程是怎樣的？",
    answer:
      `與 ADWire 合作非常簡單，只需四個步驟：①通過 WhatsApp (${WHATSAPP_E164}) 或網站聯絡表格與我們聯繫；②我們的專家團隊安排 15 分鐘免費業務診斷，了解你的需求與目標；③根據分析結果量身定制 MarTech 方案並確認合作細節；④正式執行，全程提供數據報告與優化建議。我們會由專人跟進，並盡快回覆你的查詢。`,
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
      "ADWire 的成效廣告服務沒有硬性最低廣告預算要求，但建議 Facebook/Instagram 廣告月預算至少 HK$5,000 以上，才能取得具統計意義的數據來優化投放效益。我們提供靈活的服務模式：廣告管理費 + 廣告費用分開計算，讓你清晰掌握每分預算的去向。Google Ads（SEM）、YouTube 及小紅書廣告亦提供類似的透明計費方式。免費諮詢期間我們會根據你的目標提供預算建議。",
  },
  {
    question: "SEO 優化需要多長時間才能見到效果？",
    answer:
      "SEO 優化的時間框架因競爭程度和網站基礎而異。一般而言：技術 SEO 修復（頁面速度、結構化數據）可在 1-4 週內被 Google 索引；關鍵字排名爬升通常需要 3-6 個月；對於競爭激烈的行業（如香港金融、美容），可能需要 6-12 個月達到穩定首頁排名。ADWire 的 SEO + GEO 雙軌策略可讓你更快在 AI 搜尋（ChatGPT、Perplexity）中獲得曝光，彌補傳統 SEO 初期排名緩慢的不足。我們每月提供詳細排名報告，讓你隨時了解進度。",
  },
  {
    question: "WhatsApp 自動化及營銷自動化可以幫我解決什麼問題？",
    answer:
      "ADWire 的自動化解決方案可幫助香港企業解決以下痛點：①客戶查詢回覆緩慢（24/7 WhatsApp 自動回覆）；②人工重複性工作繁多（訂單處理、預約確認自動化）；③潛在客戶跟進不及時（自動 CRM 跟進流程）；④多平台數據分散（整合 Facebook、Instagram、WhatsApp 數據看板）；⑤人手不足難以擴展業務（AI Agent 協助客服）。我們使用 Zapier、Make.com 及定制開發方式，量身打造最適合你業務的自動化系統。",
  },
  {
    question: "ADWire 主要服務香港哪些行業？",
    answer:
      "ADWire 以香港市場為主，曾服務的行業包括美容及健康、餐飲、金融及保險、地產、教育、零售及電商、科技及 SaaS、酒店及旅遊、醫療及醫美，以及 B2B 企業服務。至今已服務超過 500 家客戶及品牌，公開精選案例 16 個，可在成功案例頁查看每個項目的實際工作範圍。",
  },
  {
    question: "如何評估數碼營銷方案的成效？有哪些關鍵指標？",
    answer:
      "ADWire 採用數據驅動的成效評估框架，根據不同目標追蹤不同 KPI：品牌曝光（觸及人數、印象次數、品牌搜尋量增長）；內容互動（互動率、分享數、KOL 帖文表現）；廣告回報（ROAS 廣告支出回報率、CPA 每次轉化成本、CPM、CTR）；SEO 成效（關鍵字排名、自然流量成長、網站停留時間）；業務增長（潛在客戶數量、電話查詢量、實際銷售轉化）。我們每月提供全面數據報告，並定期舉行策略回顧會議。",
  },
  {
    question: "網頁設計或定制系統開發需要多長時間完成？",
    answer:
      "項目時間因規模而異：品牌形象網站一般 2-4 週；電商網站（整合支付系統）約 4-8 週；度身訂造 CRM／ERP 或預約系統則需 6-16 週，視功能複雜度而定。開發過程會提供階段性預覽，並在完成後交付文件及安排交接。技術選項按項目評估，可包括 CMS、WordPress／Shopify、Next.js／React 或其他合適方案，並非所有網站都必須使用同一技術。",
  },
  {
    question: "為什麼選擇 ADWire 而非其他香港廣告代理商？",
    answer:
      "ADWire 的特點是把業務理解、創意與技術放在同一個團隊處理：①可按需求由需求整理一路做到開發、上線及維護；②提供軟件開發、AI 與自動化、SEO／GEO 及數碼營銷四條服務線，減少客戶要在多間供應商之間協調；③交付範圍、技術選項及維護安排會事先講清楚，包括原始碼及帳戶歸屬；④所有成效以可量度的數據交代，不以無法核實的排名或成效作承諾；⑤至今已服務超過 500 家客戶及品牌。",
  },
];

export default async function Home() {
  // ── Build Time 數據取得（API 優先 + 本地 Fallback）──
  const [brands, blogPostsData, portfolioCasesData] = await Promise.all([
    getBrands(),
    getBlogPosts(),
    getSerializablePortfolioCases(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Schema JSON-LD ── */}
      <FAQJsonLd faqs={faqs} />

      {/* ── 導航 ── */}
      <Navbar />

      {/* ── Hero ── */}
      <HeroSection />

      {/* ── 客戶 Logo Wall ── */}
      <LogoWall brands={brands} />

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
      <Portfolio cases={portfolioCasesData} />

      {/* ── 增長洞察 Blog ── */}
      <BlogSection posts={blogPostsData} />

      {/* ── FAQ Section（可視化 + Schema，觸發 Google Featured Snippet + AI 引用）── */}
      <FAQSection faqs={faqs} />

      {/* ── 聯絡表格（轉化率核心）── */}
      <ContactSection />

      {/* ── 合作夥伴 ── */}
      <Partners />

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}

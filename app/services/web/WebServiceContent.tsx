"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import ServiceJsonLd from "@/components/ServiceJsonLd";
import FAQJsonLd from "@/components/FAQJsonLd";
import { motion } from "framer-motion";
import { 
  Globe, Zap, Search, Layout, Code2, Lock, Smartphone, Monitor, 
  ChevronRight, BarChart3, MousePointerClick, Settings, Users, 
  CheckCircle2, ArrowRight, HelpCircle, Database, Server, Layers,
  Rocket, ShieldCheck, Gauge
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function WebServiceContent() {
  const faqs = [
    {
      question: "你們的網站開發費用是多少？",
      answer: "網站開發費用取決於功能的複雜程度、設計要求及頁面數量。由於每個項目都是量身訂造，我們建議先預約免費諮詢，讓我們深入了解你的業務需求後，提供一份準確且詳細的報價單。"
    },
    {
      question: "開發一個網站通常需要多久？",
      answer: "一般企業形象網站 (5-10 頁) 的開發週期約為 4-6 星期。這包括設計確認、前端開發、內容填充及測試。如果是功能複雜的系統或大型電商平台，可能需要 8-12 星期或更長。我們會在項目開始前提供詳細的時間表。"
    },
    {
      question: "網站上線後，我能自己修改內容嗎？",
      answer: "絕對可以。我們會為你配置易用的 Headless CMS (如 Strapi 或 WordPress)，你會擁有獨立的管理員帳號，可以隨時登入修改文字、更換圖片、發佈文章或管理產品，完全無需懂得寫程式。"
    },
    {
      question: "你們會負責網站的 SEO 嗎？",
      answer: "是的，我們的標準開發服務已包含基礎的技術性 SEO (Technical SEO)。這包括優化網站架構、生成 Sitemap、設置 Meta Tags、優化 Core Web Vitals 速度及配置結構化數據 (Schema Markup)。這能確保網站上線後能被 Google 順利抓取和索引。"
    },
    {
      question: "網站需要每年的維護費用嗎？",
      answer: "網站就像汽車一樣，需要定期保養以確保安全和穩定。我們提供可選的年度維護計劃，包括伺服器託管、SSL 證書續期、系統安全更新、定期備份及技術支援。你也可以選擇自行維護，我們會在交付時提供相關指引。"
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <ServiceJsonLd 
        name="網頁設計及系統開發 (Web Design & Development)"
        description="香港專業網頁設計公司，專注於 Next.js 高性能網站開發。結合 SEO 優化架構、極速加載與高轉換 UI/UX 設計，為您打造 24/7 自動獲客的企業官網、電商平台及 Landing Page。"
        url="https://adwire.com.hk/services/web"
        image="https://adwire.com.hk/portfolio/corporate-website.webp"
      />
      
      <FAQJsonLd faqs={faqs} />

      {/* 1. Hero Banner: 強調商業價值與技術實力 */}
      <section className="pt-32 pb-20 bg-[#0B1120] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[#0B1120]/80 to-[#0B1120]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-sm mb-6">
                <Code2 size={14} />
                <span>Next.js 企業級開發架構</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                不只是網頁設計，<br/>
                更是打造 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">高轉換率</span> 的獲客機器
              </h1>
              
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                在競爭激烈的數碼時代，漂亮的網站只是基本。我們結合 <span className="text-white font-semibold">Next.js 極速技術</span>、<span className="text-white font-semibold">原生 SEO 架構</span> 與 <span className="text-white font-semibold">數據驅動的 UI/UX</span>，助您的網站從「展示工具」進化為「24/7 自動成交引擎」。
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#contact" className="bg-cyan-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-900/50 flex items-center justify-center gap-2">
                  免費諮詢方案 <ArrowRight size={18} />
                </a>
                <a href="#solutions" className="px-8 py-4 rounded-lg font-bold border border-white/20 hover:bg-white/10 transition-all text-center">
                  查看開發方案
                </a>
              </div>
              
              <div className="mt-10 flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span>Google Core Web Vitals 優化</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span>99.9% Uptime 穩定性</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 bg-gray-900 rounded-xl border border-gray-800 shadow-2xl p-6">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div className="ml-4 text-xs text-gray-500 font-mono">server.tsx — Next.js App Router</div>
                </div>
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex">
                    <span className="text-purple-400 w-8">1</span>
                    <span className="text-blue-400">export default</span> <span className="text-purple-400">async function</span> <span className="text-yellow-300">Page</span>() {'{'}
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-8">2</span>
                    <span className="pl-4 text-gray-400">// Server-Side Rendering for SEO</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-8">3</span>
                    <span className="pl-4"><span className="text-purple-400">const</span> data = <span className="text-purple-400">await</span> <span className="text-blue-400">getData</span>();</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-8">4</span>
                    <span className="pl-4 text-blue-400">return</span> (
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-8">5</span>
                    <span className="pl-8 text-gray-300">{'<'}<span className="text-green-400">SEOHead</span> title=<span className="text-orange-300">"High Conversion"</span> {'/>'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-8">6</span>
                    <span className="pl-8 text-gray-300">{'<'}<span className="text-green-400">Performance</span> metric=<span className="text-orange-300">"100"</span> {'/>'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-8">7</span>
                    <span className="pl-4">);</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-8">8</span>
                    <span>{'}'}</span>
                  </div>
                </div>
                
                <div className="absolute -right-10 -bottom-10 bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-green-400 font-bold text-2xl">98</div>
                    <div className="text-xs text-gray-400 uppercase">Performance</div>
                  </div>
                  <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className="w-[98%] h-full bg-green-500" />
                  </div>
                </div>
              </div>
              
              {/* Background Glow */}
              <div className="absolute -inset-10 bg-cyan-500/20 blur-3xl -z-10 rounded-full" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Stats Section: 數據展示增加信任感 */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem number="300%" label="平均轉換率提升" />
            <StatItem number="90+" label="Google PageSpeed 分數" />
            <StatItem number="150+" label="成功交付項目" />
            <StatItem number="< 2s" label="平均首屏加載" />
          </div>
        </div>
      </section>

      {/* 2.5 Conversion Philosophy: 轉換率為大前提 */}
      <section className="py-20 bg-gray-900 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">為什麼您的網站不轉換？</h2>
            <p className="text-gray-400 max-w-3xl mx-auto text-lg">
              大多數網站失敗的原因不在於設計不夠美，而在於忽視了用戶心理學與技術性能的結合。
              我們以 <span className="text-cyan-400 font-bold">轉換率優化 (CRO)</span> 為核心，解決三大痛點：
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
              <div className="text-cyan-400 mb-4 font-bold text-xl">01. 加載太慢</div>
              <h3 className="text-xl font-bold mb-4">每延遲 1 秒，轉換率下降 7%</h3>
              <p className="text-gray-400 text-sm">我們使用 Next.js 靜態生成技術，確保您的網站在任何設備上都能秒開，留住每一位潛在客戶。</p>
            </div>
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
              <div className="text-cyan-400 mb-4 font-bold text-xl">02. 信任感不足</div>
              <h3 className="text-xl font-bold mb-4">缺乏專業感與社交證明</h3>
              <p className="text-gray-400 text-sm">透過精心設計的 UI 佈局與結構化數據，建立品牌權威感，讓訪客在 3 秒內對您產生信任。</p>
            </div>
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
              <div className="text-cyan-400 mb-4 font-bold text-xl">03. 導向不明確</div>
              <h3 className="text-xl font-bold mb-4">訪客不知道下一步該做什麼</h3>
              <p className="text-gray-400 text-sm">運用熱點分析與 AIDA 模型，設計強而有力的 Call-to-Action (CTA)，引導訪客完成諮詢或購買。</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Technical Advantage: 為什麼選擇我們的技術棧 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">技術決定勝負</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              在 2025 年，網站速度與架構直接影響 Google 排名與廣告成本。我們採用最前沿的技術棧，確保你的網站在起跑線就領先對手。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TechCard 
              icon={Rocket}
              title="Next.js 極速架構"
              desc="使用 React 框架 Next.js 進行開發，配合 Server-Side Rendering (SSR) 技術，實現秒級頁面加載，大幅降低跳出率，提升 Google 排名。"
              tags={["React", "SSR", "Edge Computing"]}
            />
            <TechCard 
              icon={Search}
              title="全方位 SEO 優化"
              desc="從代碼層面優化結構化數據 (Schema Markup)、Meta Tags 及語意化標籤，並自動生成 Sitemap 與 Robots.txt，讓 Google 爬蟲更易收錄。"
              tags={["Schema.org", "JSON-LD", "Semantic HTML"]}
            />
            <TechCard 
              icon={MousePointerClick}
              title="高轉換 UI/UX 設計"
              desc="基於用戶行為數據設計界面，優化導航路徑與 CTA 佈局，確保訪客能以最短路徑轉化為您的客戶。"
              tags={["CRO", "User Journey", "A/B Testing"]}
            />
          </div>
        </div>
      </section>

      {/* 3. Solutions: 多元化開發方案 */}
      <section className="py-24 bg-white" id="solutions">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-cyan-600 font-bold tracking-wider uppercase text-sm">Our Solutions</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">全方位網站開發方案</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              針對不同商業目標，我們提供量身訂造的開發策略。不論是提升品牌形象、增加銷售還是優化內部流程，我們都有專業解決方案。
            </p>
          </div>

          <div className="space-y-20">
            {/* Solution 1: Corporate Website */}
            <SolutionRow 
              image="/portfolio/corporate-website.webp"
              title="企業形象官網 (Corporate Website)"
              subtitle="建立專業信賴感，展示品牌價值"
              desc="適合 B2B 企業、專業服務機構 (律師、會計、顧問) 及上市公司。我們著重於品牌故事的視覺呈現與資訊架構的清晰度，讓潛在客戶在瀏覽的第一刻就建立信任。"
              features={[
                "響應式設計 (RWD)，完美適配手機/平板/電腦",
                "動態視覺效果與微交互 (Micro-interactions)",
                "多語言切換功能",
                "企業博客與新聞發佈系統",
                "聯絡表單與 CRM 整合"
              ]}
              align="left"
            />

            {/* Solution 2: Landing Page */}
            <SolutionRow 
              image="/blog/high-converting-landing-page.webp"
              title="高轉換著陸頁 (Landing Page)"
              subtitle="專為廣告投放設計，最大化 ROI"
              desc="適合推廣單一產品、服務或活動。我們運用 AIDA 行銷模型與消費者心理學設計頁面佈局，移除所有干擾元素，引導訪客完成單一目標 (填表或購買)。"
              features={[
                "極致加載速度優化 (LCP < 1.5s)",
                "A/B Testing 架構支援",
                "轉換追蹤代碼 (Pixel/GTM) 完整埋設",
                "強效 CTA (Call-to-Action) 設計",
                "社交證明與信任標章整合"
              ]}
              align="right"
            />

            {/* Solution 3: E-commerce */}
            <SolutionRow 
              image="/portfolio/ecommerce-automation.webp"
              title="電商網店系統 (E-commerce)"
              subtitle="打造流暢購物體驗，提升客單價"
              desc="從 Shopify 建置到 WooCommerce 客製化開發，我們助你建立功能強大的網上商店。整合本地支付 (PayMe/FPS/Credit Card) 與物流系統，讓生意 24 小時不打烊。"
              features={[
                "購物車與結帳流程優化",
                "會員系統與積分獎賞",
                "庫存管理與訂單自動化",
                "相關產品推薦 (Cross-sell/Up-sell)",
                "數據分析儀表板"
              ]}
              align="left"
            />

            {/* Solution 4: Custom Web App */}
            <SolutionRow 
              image="/system/CRM.webp"
              title="客製化系統開發 (Web Application)"
              subtitle="解決複雜業務需求，提升營運效率"
              desc="當現成軟件無法滿足你的需求時，我們為你開發專屬的 Web 應用程式。包括客戶管理系統 (CRM)、預約系統、內部管理 Dashboard 或 SaaS 產品 MVP 開發。"
              features={[
                "複雜數據庫架構設計",
                "角色權限管理 (RBAC)",
                "API 串接與第三方整合",
                "實時數據更新 (WebSocket)",
                "高安全性資料加密"
              ]}
              align="right"
            />
          </div>
        </div>
      </section>

      {/* 4. Client Testimonials: 客戶評價增加信任 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">客戶真實評價</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              我們的客戶遍佈各行各業，從初創公司到上市企業，都對我們的專業服務給予高度評價。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              name="陳先生"
              company="高端珠寶品牌創辦人"
              quote="ADWire 為我們打造的電商網站不僅美觀，轉換率更比舊網站提升了 3 倍！每月網上訂單持續增長，投資絕對值得。"
              rating={5}
            />
            <TestimonialCard 
              name="李小姐"
              company="律師事務所合夥人"
              quote="我們需要一個能展現專業形象的官網，ADWire 團隊深入了解我們的需求，設計出來的網站完全符合預期，客戶查詢量顯著提升。"
              rating={5}
            />
            <TestimonialCard 
              name="張總"
              company="貿易公司總經理"
              quote="從諮詢、設計到開發，整個過程非常順暢。技術團隊很專業，網站速度超快，Google 排名也逐步上升。強烈推薦!"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* 5. Comparison Table: 技術比較 */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">為什麼選擇 Next.js 而非 WordPress？</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              我們專注於 Next.js 現代化架構，在速度、安全性與擴展性上遠勝傳統 CMS。
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="py-4 px-6 text-left font-bold">比較項目</th>
                    <th className="py-4 px-6 text-center font-bold">Next.js (我們使用)</th>
                    <th className="py-4 px-6 text-center font-bold">WordPress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <ComparisonRow item="加載速度" nextjs="極快 (< 1.5s)" wordpress="較慢 (3-5s)" nextjsBetter={true} />
                  <ComparisonRow item="SEO 表現" nextjs="原生優化，SSR 支援" wordpress="需額外插件" nextjsBetter={true} />
                  <ComparisonRow item="安全性" nextjs="極高，無資料庫漏洞" wordpress="經常需要更新防範攻擊" nextjsBetter={true} />
                  <ComparisonRow item="擴展性" nextjs="輕鬆擴展，API 整合靈活" wordpress="受限於插件生態" nextjsBetter={true} />
                  <ComparisonRow item="維護成本" nextjs="低 (無需頻繁更新)" wordpress="高 (插件衝突、定期更新)" nextjsBetter={true} />
                  <ComparisonRow item="內容管理" nextjs="Headless CMS (直觀)" wordpress="內建後台 (熟悉)" nextjsBetter={false} />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Trust Badges: 信任標章 */}
      <section className="py-16 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            <TrustBadge icon={Globe} title="原生 SEO 架構" desc="提升搜尋排名" />
            <TrustBadge icon={Gauge} title="PageSpeed 保證" desc="90+ 分數承諾" />
            <TrustBadge icon={CheckCircle2} title="源代碼交付" desc="完整擁有權" />
            <TrustBadge icon={Users} title="150+ 成功案例" desc="各行業信賴" />
          </div>
        </div>
      </section>

      {/* 8. Process: 專業開發流程 */}
      <section className="py-24 bg-[#0f4c81] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">透明、標準化的開發流程</h2>
              <p className="text-gray-300 mb-8 text-lg">
                我們深知項目管理的重要性。透過敏捷開發 (Agile) 方法，我們確保項目按時交付，並在每個階段保持緊密溝通。
              </p>
              
              <div className="space-y-8">
                <ProcessItem 
                  number="01" 
                  title="商業目標與 SEO 策略" 
                  desc="深入分析競爭對手與關鍵字潛力，制定以轉換為導向的網站架構 (Sitemap) 與內容策略。"
                />
                <ProcessItem 
                  number="02" 
                  title="高轉換 UI/UX 原型" 
                  desc="製作 Wireframe 與 Figma 高保真設計，專注於用戶路徑優化與 CTA 佈局，確保設計符合品牌形象且具備銷售力。"
                />
                <ProcessItem 
                  number="03" 
                  title="Next.js 高性能開發" 
                  desc="使用 Next.js 進行開發，確保極速加載與原生 SEO。整合 CMS 系統，讓您輕鬆管理內容，同時保持技術領先。"
                />
                <ProcessItem 
                  number="04" 
                  title="全方位測試與上線" 
                  desc="進行嚴格的性能測試、SEO 審核與轉換追蹤埋設 (GTM/Pixel)。上線後提交 Google 收錄，確保即時曝光。"
                />
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl transform rotate-3 opacity-20" />
              <div className="bg-white text-gray-900 p-8 rounded-2xl shadow-xl relative">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <ShieldCheck className="text-green-500" />
                  交付標準 Checklist
                </h3>
                <ul className="space-y-4">
                  {[
                    "Google PageSpeed 分數 > 90 (Desktop)",
                    "全站 HTTPS SSL 安全加密",
                    "符合 WCAG 無障礙網頁標準",
                    "完整的 SEO Meta Tags 配置",
                    "設置 Google Analytics 4 & Search Console",
                    "自動化備份機制",
                    "源代碼交付 (Source Code Ownership)"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-700 border-b border-gray-100 pb-3 last:border-0">
                      <CheckCircle2 size={18} className="text-cyan-600 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Related Services: 相關服務推薦 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">延伸服務，全方位數碼轉型</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              網站只是起點。結合我們的其他服務，打造完整的數碼營銷生態系統。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/services/seo" className="group bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-cyan-500 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <Search className="text-cyan-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">SEO 搜尋引擎優化</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                讓你的新網站在 Google 首頁曝光,帶來源源不絕的自然流量。
              </p>
              <div className="flex items-center gap-2 text-cyan-600 font-medium text-sm group-hover:gap-3 transition-all">
                了解更多 <ArrowRight size={16} />
              </div>
            </Link>

            <Link href="/services/ads" className="group bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-cyan-500 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="text-cyan-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Google / Meta 廣告</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                精準投放廣告，將訪客導流至你的高轉換網站，快速獲取潛在客戶。
              </p>
              <div className="flex items-center gap-2 text-cyan-600 font-medium text-sm group-hover:gap-3 transition-all">
                了解更多 <ArrowRight size={16} />
              </div>
            </Link>

            <Link href="/services/automation" className="group bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-cyan-500 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="text-cyan-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">營銷自動化</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                自動化跟進潛在客戶，提升轉換率並節省人力成本。
              </p>
              <div className="flex items-center gap-2 text-cyan-600 font-medium text-sm group-hover:gap-3 transition-all">
                了解更多 <ArrowRight size={16} />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 10. FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">常見問題</h2>
            <p className="text-gray-500 mt-4">解答你對網站開發的疑問</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={index} q={faq.question} a={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA Section */}
      <ContactSection defaultService="網頁設計及優化" />
      <Footer />
    </main>
  );
}

// --- Components ---

function StatItem({ number, label }: { number: string, label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{number}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function TechCard({ icon: Icon, title, desc, tags }: { icon: any, title: string, desc: string, tags: string[] }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-6 text-cyan-600">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed mb-6">{desc}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function SolutionRow({ image, title, subtitle, desc, features, align }: { 
  image: string, title: string, subtitle: string, desc: string, features: string[], align: 'left' | 'right' 
}) {
  return (
    <div className={`flex flex-col lg:flex-row gap-12 items-center ${align === 'right' ? 'lg:flex-row-reverse' : ''}`}>
      <div className="flex-1 w-full">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
          <div className="absolute inset-0 bg-gray-900/10 group-hover:bg-transparent transition-colors duration-500" />
          <img src={image} alt={title} className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700" />
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-cyan-600 font-medium mb-4">{subtitle}</p>
        <p className="text-gray-600 leading-relaxed mb-8">{desc}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map((feature, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}

function ProcessItem({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-bold text-xl text-cyan-300 border border-white/10">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string, a: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-bold text-gray-900 flex items-center gap-3">
          <HelpCircle size={20} className="text-cyan-600 flex-shrink-0" />
          {q}
        </span>
        <ChevronRight size={20} className={`text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4 ml-9">
          {a}
        </div>
      )}
    </div>
  );
}

function TestimonialCard({ name, company, quote, rating }: { name: string, company: string, quote: string, rating: number }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all">
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <span key={i} className="text-yellow-400">★</span>
        ))}
      </div>
      <p className="text-gray-700 italic mb-6 leading-relaxed">"{quote}"</p>
      <div className="border-t pt-4">
        <div className="font-bold text-gray-900">{name}</div>
        <div className="text-sm text-gray-500">{company}</div>
      </div>
    </div>
  );
}

function PricingCard({ title, subtitle, price, features, popular }: { 
  title: string, subtitle: string, price: string, features: string[], popular: boolean 
}) {
  return (
    <div className={`relative bg-white rounded-2xl p-8 ${popular ? 'ring-2 ring-cyan-500 shadow-xl' : 'border border-gray-200 shadow-sm'}`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-cyan-600 text-white px-4 py-1 rounded-full text-sm font-bold">
          最受歡迎
        </div>
      )}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6">{subtitle}</p>
      <div className="text-3xl font-bold text-gray-900 mb-8">{price}</div>
      <ul className="space-y-4 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
            <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <a href="#contact" className={`block w-full text-center py-3 rounded-lg font-bold transition-all ${
        popular 
          ? 'bg-cyan-600 text-white hover:bg-cyan-500' 
          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
      }`}>
        選擇方案
      </a>
    </div>
  );
}

function ComparisonRow({ item, nextjs, wordpress, nextjsBetter }: { 
  item: string, nextjs: string, wordpress: string, nextjsBetter: boolean 
}) {
  return (
    <tr className="bg-white">
      <td className="py-4 px-6 font-medium text-gray-900">{item}</td>
      <td className="py-4 px-6 text-center">
        <div className="flex items-center justify-center gap-2">
          {nextjsBetter && <CheckCircle2 size={18} className="text-green-500" />}
          <span className={nextjsBetter ? 'text-green-600 font-medium' : 'text-gray-600'}>{nextjs}</span>
        </div>
      </td>
      <td className="py-4 px-6 text-center">
        <div className="flex items-center justify-center gap-2">
          {!nextjsBetter && <CheckCircle2 size={18} className="text-green-500" />}
          <span className={!nextjsBetter ? 'text-green-600 font-medium' : 'text-gray-600'}>{wordpress}</span>
        </div>
      </td>
    </tr>
  );
}

function TrustBadge({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600">
        <Icon size={28} />
      </div>
      <div className="font-bold text-gray-900 mb-1">{title}</div>
      <div className="text-sm text-gray-600">{desc}</div>
    </div>
  );
}

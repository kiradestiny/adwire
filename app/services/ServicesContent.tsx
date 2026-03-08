"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { motion } from "framer-motion";
import { 
  Megaphone, Smartphone, BarChart3, Bot, Search, Globe, 
  CheckCircle2, ArrowRight, AlertCircle, TrendingUp, Users, Zap, Target,
  Cpu
} from "lucide-react";
import Link from "next/link";

// 痛點數據
const painPoints = [
  {
    icon: AlertCircle,
    title: "廣告費越來越貴，回報卻越來越低？",
    desc: "盲目投放廣告，缺乏精準的受眾設定與素材測試，導致獲客成本 (CPA) 不斷上升，利潤被蠶食。"
  },
  {
    icon: Users,
    title: "有流量但沒轉化，旺丁不旺財？",
    desc: "網站或社交媒體有人看，但沒人買單？這通常是 Landing Page 設計或銷售漏斗 (Funnel) 出現了斷層。"
  },
  {
    icon: Megaphone,
    title: "不懂做內容，社交媒體沒人看？",
    desc: "在這個「內容為王」的時代，缺乏吸引眼球的短視頻或貼文，品牌聲音很容易被淹沒在資訊海中。"
  },
  {
    icon: Zap,
    title: "依賴人手操作，錯失黃金成交期？",
    desc: "客戶查詢未能即時回覆，導致流失？缺乏自動化系統，讓你的團隊將時間浪費在重複性工作上。"
  }
];

// 服務數據
const services = [
  {
    category: "引爆流量 (Traffic & Awareness)",
    description: "讓品牌被看見。我們利用內容力量，為你帶來海量潛在客戶。",
    color: "bg-orange-50",
    borderColor: "border-orange-100",
    titleColor: "text-orange-600",
    items: [
      {
        id: "kol",
        title: "KOL 與網紅營銷",
        icon: Megaphone,
        content: "連結全港強大 KOL 網絡。我們不只是「找人拍照」，更提供策略配對、內容共創 (Content Co-creation)。無論是微網紅 (Micro-Influencers) 的口碑滲透，還是頭部網紅的品牌背書，我們都能精準對接。",
        features: ["KOL 篩選與配對", "Briefing 與內容監修", "數據追蹤報告", "產品植入策略"],
        link: "/services/kol"
      },
      {
        id: "video",
        title: "短視頻製作 (Short Video)",
        icon: Smartphone,
        content: "抓住「短片年代」流量紅利。專精於 60-90 秒直倒短片 (Reels / TikTok / YouTube Shorts)。由劇本策劃、專業拍攝到後期剪接，我們幫你製作出「頭 3 秒就能抓住眼球」的爆款內容。",
        features: ["劇本 Storyboard 設計", "專業拍攝團隊", "動態字幕與特效", "帳戶代營運"],
        link: "/services/video"
      },
      {
        id: "social",
        title: "社交媒體管理",
        icon: Users,
        content: "一站式代營運 IG、Facebook 及 LinkedIn。從內容日曆規劃、貼文設計到粉絲互動，我們助你建立忠實的品牌社群，持續提升品牌聲量。",
        features: ["內容策略規劃", "視覺設計與文案", "社群互動管理", "月度成效報告"],
        link: "/services/social"
      }
    ]
  },
  {
    category: "精準轉化 (Conversion & ROI)",
    description: "將流量變現。數據驅動的廣告與自動化系統，讓生意自動運轉。",
    color: "bg-blue-50",
    borderColor: "border-blue-100",
    titleColor: "text-blue-600",
    items: [
      {
        id: "ads",
        title: "成效廣告投放",
        icon: BarChart3,
        content: "拒絕盲目燒錢。我們是 Google Partner 及 Meta 廣告專家。透過精細的 A/B Testing 測試受眾與素材，不斷優化 ROAS (廣告回報率)，確保每一分預算都用得其所。",
        features: ["Facebook / IG Ads", "Google SEM / Display", "再營銷 (Retargeting)", "Pixel 數據分析"],
        link: "/services/ads"
      },
      {
        id: "automation",
        title: "營銷自動化 (Marketing Automation)",
        icon: Bot,
        content: "這是 ADWire 的核心技術優勢。我們幫你串接 WhatsApp API、CRM 及 Email 系統。當廣告帶來查詢時，AI Chatbot 立即秒回、自動追單，大幅節省客服人手成本，提升成交率。",
        features: ["WhatsApp Chatbot", "自動追單系統", "CRM 客戶管理", "Zapier / Make 流程自動化"],
        link: "/services/automation"
      },
      {
        id: "ai",
        title: "AI 解決方案 (AI Solutions)",
        icon: Cpu,
        content: "領先市場的 AI 應用方案。我們為企業定制 AI Agent、自動化工作流及 LLM 整合，將 AI 技術轉化為實際生產力，助你在 AI 時代保持競爭優勢。",
        features: ["定制化 AI Agent", "企業級 LLM 應用", "AI 工作流自動化", "AI 內容生成系統"],
        link: "/services/ai"
      }
    ]
  },
  {
    category: "技術基建 (Tech Foundation)",
    description: "鞏固品牌地基。SEO 與高轉化網站，是長遠增長的關鍵。",
    color: "bg-indigo-50",
    borderColor: "border-indigo-100",
    titleColor: "text-indigo-600",
    items: [
      {
        id: "seo",
        title: "SEO 與 GEO 優化",
        icon: Search,
        content: "唔再靠估。我們幫你霸佔 Google 搜尋結果首頁。更引入前瞻性的 GEO (Generative Engine Optimization)，確保你的品牌能被 ChatGPT、Perplexity 等 AI 搜尋引擎優先推薦。",
        features: ["關鍵字策略研究", "On-page / Off-page SEO", "AI 搜尋推薦優化", "技術結構調整"],
        link: "/services/seo"
      },
      {
        id: "web",
        title: "網頁設計及系統開發",
        icon: Globe,
        content: "不只追求靚，更追求快與轉化。我們使用現代化 Tech Stack (Next.js, React) 開發高性能網站。從 Landing Page 到複雜的 B2B 報價系統，我們都能一手包辦。",
        features: ["UI/UX 設計", "CMS 後台開發", "電商系統整合", "極速載入優化"],
        link: "/services/web"
      },
      {
        id: "production",
        title: "商業攝影與製作",
        icon: Target,
        content: "用影像說好品牌故事。無論是產品攝影、企業宣傳片還是活動花絮，我們的高質素製作團隊都能為你的品牌形象加分。",
        features: ["產品攝影", "企業宣傳片", "活動攝錄", "後期製作"],
        link: "/services/production"
      }
    ]
  }
];

// 流程數據
const process = [
  {
    step: "01",
    title: "診斷與策略 (Audit & Strategy)",
    desc: "深入了解你的業務模式、目標客群與現有痛點。我們會進行全面的數碼資產審計，制定量身定制的增長策略。"
  },
  {
    step: "02",
    title: "執行與優化 (Execution & Optimization)",
    desc: "快速部署營銷活動與技術系統。透過實時數據監測，我們不斷進行 A/B 測試與優化，確保成效最大化。"
  },
  {
    step: "03",
    title: "擴張與自動化 (Scale & Automate)",
    desc: "當找到致勝方程式後，我們會協助你擴大投放規模，並引入自動化系統，讓業務在不增加人手的情況下倍增。"
  }
];

export default function ServicesContent() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Banner - 增強版 */}
      <section className="pt-32 pb-20 bg-[#0f4c81] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        {/* 裝飾光暈 */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block mb-6 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-sm font-medium text-blue-100"
          >
            🚀 突破增長瓶頸，打造自動化獲客系統
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
          >
            數碼營銷不只是一場燒錢遊戲<br/>
            <span className="text-[#f5a623]">而是一套精密的獲利系統</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto mb-10"
          >
            從流量獲取、內容轉化到自動化成交。
            我們結合創意內容與數據科技，為你構建全自動的業務增長引擎。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              href="#contact" 
              className="px-8 py-4 bg-[#f5a623] text-white font-bold rounded-full hover:bg-[#e09612] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              預約免費諮詢 <ArrowRight size={20} />
            </Link>
            <Link 
              href="#services-list" 
              className="px-8 py-4 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20"
            >
              探索我們的服務
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 痛點分析 - 新增區塊 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">你是否也遇到這些營銷難題？</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              在數碼轉型的過程中，許多企業都面臨著同樣的挑戰。如果這些情況聽起來很熟悉，那麼你來對地方了。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {painPoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 mb-6">
                  <point.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">{point.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{point.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 服務列表內容 - 優化版 */}
      <div id="services-list" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-20">
          <span className="text-[#f5a623] font-bold tracking-wider uppercase text-sm">Our Services</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0f4c81] mt-2 mb-6">全面覆蓋你的增長需求</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            我們不只提供單一服務，而是提供整合性的解決方案。
          </p>
        </div>

        <div className="space-y-24">
          {services.map((section, sIndex) => (
            <div key={sIndex} className="scroll-mt-24">
              
              {/* 分類標題 */}
              <div className="flex items-start gap-4 mb-10">
                <div className={`p-3 rounded-xl ${section.color} ${section.titleColor}`}>
                  {sIndex === 0 ? <TrendingUp size={32} /> : sIndex === 1 ? <Target size={32} /> : <Zap size={32} />}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-[#0f4c81] mb-2">{section.category}</h2>
                  <p className="text-gray-500 text-lg">{section.description}</p>
                </div>
              </div>

              {/* 服務項目 Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {section.items.map((item, iIndex) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: iIndex * 0.1 }}
                    className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
                  >
                    <div className="h-14 w-14 bg-gray-50 rounded-xl flex items-center justify-center text-[#0f4c81] mb-6 group-hover:bg-[#0f4c81] group-hover:text-white transition-colors">
                      <item.icon size={28} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-[#0f4c81] mb-4">{item.title}</h3>
                    <p className="text-gray-600 mb-8 leading-relaxed text-sm flex-grow">
                      {item.content}
                    </p>

                    <ul className="space-y-3 mb-8">
                      {item.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center gap-3 text-gray-700 text-sm font-medium">
                          <CheckCircle2 size={16} className="text-[#f5a623] shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link 
                      href={item.link}
                      className="inline-flex items-center justify-center w-full py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-[#0f4c81] hover:text-white hover:border-[#0f4c81] transition-all group-hover:shadow-md"
                    >
                      了解更多
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 合作流程 - 新增區塊 */}
      <section className="py-24 bg-[#0f4c81] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#f5a623] font-bold tracking-wider uppercase text-sm">How We Work</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">簡單三步，開啟增長引擎</h2>
              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                我們深知每個企業的情況都不同。因此，我們不會套用千篇一律的模板，而是為你量身定制最適合的增長策略。
              </p>
              
              <div className="space-y-8">
                {process.map((step, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className="flex gap-6"
                  >
                    <div className="text-5xl font-bold text-white/10 font-mono">{step.step}</div>
                    <div>
                      <h3 className="text-xl font-bold text-[#f5a623] mb-2">{step.title}</h3>
                      <p className="text-blue-100 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              {/* 抽象圖形裝飾 */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#f5a623] to-purple-500 rounded-full opacity-20 blur-3xl animate-pulse" />
              <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 h-32 animate-pulse"></div>
                  <div className="bg-white/5 rounded-xl p-4 h-32 animate-pulse delay-75"></div>
                  <div className="bg-white/5 rounded-xl p-4 h-32 animate-pulse delay-150"></div>
                  <div className="bg-white/5 rounded-xl p-4 h-32 animate-pulse delay-300"></div>
                </div>
                <div className="mt-8 text-center">
                  <div className="inline-block px-6 py-2 bg-[#f5a623] rounded-full text-white font-bold text-sm">
                    ROI Driven Strategy
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 底部 CTA：重用 Contact Section */}
      <ContactSection />
      
      <Footer />
    </main>
  );
}

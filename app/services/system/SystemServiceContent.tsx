"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import ServiceJsonLd from "@/components/ServiceJsonLd";
import FAQJsonLd from "@/components/FAQJsonLd";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Database, Server, Smartphone, Lock, Code2, Cloud, Briefcase, Users, 
  LayoutDashboard, Check, AlertCircle, TrendingUp, Zap, ShieldCheck, 
  ArrowRight, HelpCircle, ChevronDown, ChevronUp, Star, Gauge, FileCode,
  BarChart3, Settings, Rocket, CheckCircle2, Globe, Shield
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function SystemServiceContent() {
  const currentYear = new Date().getFullYear();
  const faqs = [
    {
      question: "開發一個系統需要多長時間？",
      answer: "視乎系統複雜度。一般簡單的內部工具約需 4-8 週，而複雜的 ERP 或大型電商平台可能需要 3-6 個月。我們會在報價階段提供詳細的時間表 (Timeline)。"
    },
    {
      question: "開發完成後，你們會提供維護嗎？",
      answer: "會的。我們提供不同等級的 SLA 維護計劃，包括伺服器監控、Bug Fix、定期備份及安全更新，確保系統長期穩定運行。"
    },
    {
      question: "我可以將現有的舊數據遷移到新系統嗎？",
      answer: "可以。我們的數據工程師會協助你清洗、整理並遷移舊系統或 Excel 中的數據，並在遷移前後核對紀錄。"
    },
    {
      question: "系統支持多語言和多貨幣嗎？",
      answer: "支持。我們的架構設計預設支持 i18n (國際化)，可以輕鬆擴展至全球市場。"
    },
    {
      question: "開發費用如何計算？",
      answer: "費用取決於功能複雜度、所需時間及技術難度。由於每個企業的需求都不同，我們建議先進行免費諮詢，深入了解你的業務流程後，提供準確的報價方案。"
    },
    {
      question: "系統會提供培訓嗎？",
      answer: "會的。交付時會提供操作說明文件及培訓安排，確保負責同事能自行處理日常操作。實際培訓方式（現場、網上或錄影）會在方案階段確認。"
    },
    {
      question: "交付範圍包括什麼？",
      answer: "報價會列明功能清單、頁面或模組數量、整合的第三方系統、測試範圍、上線安排及交付文件。範圍以外的功能屬於變更請求，會另行報價，不會在開發中途才追加收費。"
    },
    {
      question: "原始碼、帳戶及資料歸誰所有？",
      answer: "訂造開發的原始碼及你付費購買的帳戶歸客戶所有，交付時會一併移交。第三方平台（例如雲端主機、短訊或電郵服務）的帳戶建議由客戶名義開立，避免日後更換供應商時出現交接困難。相關安排會在合約中明確列明。"
    },
    {
      question: "第三方或雲端服務費用由誰支付？",
      answer: "主機、資料庫、短訊、電郵、AI 模型 API 等第三方費用一般由客戶直接支付給該供應商，我們會在方案中列出預估項目及金額範圍。ADWire 的報價只包含開發及服務費用。"
    },
    {
      question: "怎樣驗收？如果驗收時發現問題怎辦？",
      answer: "驗收會依據報價時確認的功能清單逐項測試，並提供 UAT 環境供你的同事實際操作。屬於範圍內的偏差會修正至符合驗收標準；如屬範圍變更，會先報價再進行。"
    },
    {
      question: "上線後想加新功能，程序是怎樣的？",
      answer: "新功能會視為獨立項目處理：先確認需求、提供報價及時間，再安排開發。已上線的系統會先做影響評估，重要改動會在測試環境驗證後才部署。"
    },
    {
      question: "系統需要用到某一種技術嗎？",
      answer: "不一定。技術選項會按項目評估，例如 CMS、WordPress／Shopify、Next.js／React 或其他方案，各有適用場景。我們會說明建議方案的取捨，而不是聲稱所有項目都必須使用同一種技術。"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <ServiceJsonLd 
        name="企業系統開發 (Enterprise System Development)"
        description="企業網站、Web App、CRM／ERP 相關系統、手機 App 及 MVP 開發。由需求整理、Prototype、開發、API 整合到 QA／UAT、部署、文件及上線後維護，範圍與交付清晰列明。"
        url="https://adwire.com.hk/services/system/"
        image="https://adwire.com.hk/system/CRM.webp"
      />
      
      <FAQJsonLd faqs={faqs} />

      {/* 1. Hero Banner */}
      <section className="pt-32 pb-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm mb-6">
                <Server size={14} />
                <span>Enterprise System Development</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                企業數碼轉型<br/>
                由 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">系統化</span> 開始
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                還在用 Excel 處理複雜業務？<br/>
                我們為你量身訂造企業級系統 (ERP/CRM/App)，<br/>
                自動化繁瑣流程，讓數據成為你的決策資產。
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#contact" className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2">
                  免費系統諮詢 <ArrowRight size={18} />
                </a>
                <a href="#pain-points" className="px-8 py-4 rounded-full font-bold border border-white/20 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  了解更多
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative bg-slate-800 rounded-xl border border-slate-700 shadow-2xl p-4 transform rotate-[-2deg] hover:rotate-0 transition-all duration-500">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div className="h-2 w-32 bg-slate-700 rounded-full ml-4" />
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-slate-700/50 p-4 rounded-lg h-24 animate-pulse" />
                  <div className="bg-slate-700/50 p-4 rounded-lg h-24 animate-pulse delay-75" />
                  <div className="bg-slate-700/50 p-4 rounded-lg h-24 animate-pulse delay-150" />
                </div>
                <div className="bg-slate-700/30 p-4 rounded-lg h-48 w-full" />
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-white text-slate-900 p-4 rounded-lg shadow-xl border border-gray-100 flex items-center gap-3 animate-bounce-slow">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-bold">交付內容</div>
                  <div className="text-xl font-bold">原始碼</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Stats Section */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem number="原始碼" label="交付及完整擁有權" />
            <StatItem number="按範圍" label="分階段交付及驗收" />
            <StatItem number="監控" label="上線後監控及告警設定" />
            <StatItem number="UAT" label="上線前逐項驗收" />
          </div>
        </div>
      </section>

      {/* 3. Pain Points */}
      <section id="pain-points" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">你的企業是否面臨這些挑戰？</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              隨著業務擴張，傳統的人手操作模式已成為發展瓶頸。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PainPointCard icon={LayoutDashboard} title="數據散亂" desc="資料分散在不同 Excel 或紙本，難以整合分析，老闆無法實時掌握業務狀況。" />
            <PainPointCard icon={Users} title="人手錯誤" desc="重複輸入資料容易出錯，導致訂單遺漏、庫存不準，影響客戶體驗。" />
            <PainPointCard icon={Briefcase} title="流程低效" desc="審批流程繁瑣，文件傳遞需時，員工將大量時間花在行政工作而非業務上。" />
            <PainPointCard icon={Lock} title="資料安全" desc="缺乏權限管理，敏感資料容易外洩，且沒有備份機制，風險極高。" />
          </div>
        </div>
      </section>

      {/* 4. Solutions */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">一站式系統開發解決方案</h2>
            <p className="text-gray-500">針對不同業務場景，提供最合適的數碼化工具。</p>
          </div>

          <div className="space-y-24">
            {/* Solution 1: CRM */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                  <Users size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">CRM 客戶關係管理系統</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  將客戶資料轉化為業績。建立完善的會員制度，追蹤客戶行為，實現精準營銷。
                </p>
                <ul className="space-y-3 mb-8">
                  <FeatureItem text="會員積分與分級制度 (Loyalty Program)" />
                  <FeatureItem text="自動化營銷 (Email/SMS/WhatsApp Automation)" />
                  <FeatureItem text="360度客戶畫像與行為分析" />
                  <FeatureItem text="Omni-channel 數據整合" />
                </ul>
              </div>
              <div className="order-1 lg:order-2 bg-gray-100 rounded-2xl p-8 h-[400px] flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                <img src="/system/CRM.webp" alt="CRM System" className="w-3/4 shadow-2xl rounded-lg transform group-hover:scale-105 transition-transform duration-500" />
              </div>
            </div>

            {/* Solution 2: ERP */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="bg-gray-100 rounded-2xl p-8 h-[400px] flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10" />
                <img src="/system/ERP.webp" alt="ERP System" className="w-3/4 shadow-2xl rounded-lg transform group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div>
                <div className="bg-green-50 w-16 h-16 rounded-2xl flex items-center justify-center text-green-600 mb-6">
                  <Database size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">ERP 企業資源規劃系統</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  打通銷售、庫存、採購、財務，消除數據孤島，提升營運效率。
                </p>
                <ul className="space-y-3 mb-8">
                  <FeatureItem text="進銷存管理 (Inventory Management)" />
                  <FeatureItem text="採購與供應鏈管理" />
                  <FeatureItem text="財務報表與會計對接" />
                  <FeatureItem text="多倉庫/多門店實時同步" />
                </ul>
              </div>
            </div>

            {/* Solution 3: Mobile App */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-purple-50 w-16 h-16 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                  <Smartphone size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Mobile App & 定制開發</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  無論是面向消費者的電商 App，還是內部使用的工具 App，我們都能提供原生級體驗。
                </p>
                <ul className="space-y-3 mb-8">
                  <FeatureItem text="iOS & Android 雙平台開發 (React Native / Flutter)" />
                  <FeatureItem text="B2B 銷售工具與報價系統" />
                  <FeatureItem text="預約與排程系統" />
                  <FeatureItem text="物聯網 (IoT) 設備對接" />
                </ul>
              </div>
              <div className="order-1 lg:order-2 bg-gray-100 rounded-2xl p-8 h-[400px] flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
                <div className="flex gap-6 relative z-10">
                  <div className="w-[140px] h-[280px] bg-gray-900 rounded-[30px] p-2 shadow-2xl transform translate-y-8 group-hover:translate-y-2 transition-transform duration-700 ease-out">
                    <div className="relative w-full h-full bg-white rounded-[24px] overflow-hidden border border-gray-800">
                      <Image src="/system/book_app.webp" alt="Booking APP" fill className="object-cover" />
                    </div>
                  </div>
                  <div className="w-[140px] h-[280px] bg-gray-900 rounded-[30px] p-2 shadow-2xl transform -translate-y-8 group-hover:-translate-y-2 transition-transform duration-700 ease-out">
                    <div className="relative w-full h-full bg-white rounded-[24px] overflow-hidden border border-gray-800">
                      <Image src="/system/tools.webp" alt="Tools APP" fill className="object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Solution 4: AI Integration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-1 lg:order-1 bg-slate-900 rounded-2xl p-8 h-[400px] flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
                <div className="relative z-10 text-center">
                  <div className="w-24 h-24 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Rocket className="text-cyan-400" size={48} />
                  </div>
                  <div className="text-cyan-400 font-mono text-sm mb-2">AI Model Processing...</div>
                  <div className="w-48 h-2 bg-slate-800 rounded-full mx-auto overflow-hidden">
                    <div className="w-2/3 h-full bg-cyan-500 animate-shimmer" />
                  </div>
                </div>
              </div>
              <div className="order-2 lg:order-2">
                <div className="bg-cyan-50 w-16 h-16 rounded-2xl flex items-center justify-center text-cyan-600 mb-6">
                  <Zap size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">AI 智能系統整合</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  將 AI 應用融入企業流程。由客服輔助到資料查詢及分析，並保留人工覆核環節。
                </p>
                <ul className="space-y-3 mb-8">
                  <FeatureItem text="企業專屬 AI 知識庫 (RAG 技術)" />
                  <FeatureItem text="智能客服機器人 (WhatsApp/Web AI Agent)" />
                  <FeatureItem text="自動化文案生成與數據摘要" />
                  <FeatureItem text="AI 預測分析與決策支援" />
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Integration Ecosystem: 系統整合生態圈 */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">打破數據孤島，實現全自動化整合</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              我們的系統能與你現有的工具及第三方平台完美對接，打造無縫的自動化業務流程。
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <IntegrationCard name="WhatsApp Business" desc="自動發送通知與客服" />
            <IntegrationCard name="Stripe / PayMe" desc="本地及全球支付對接" />
            <IntegrationCard name="SF Express" desc="物流追蹤與自動下單" />
            <IntegrationCard name="Xero / QuickBooks" desc="財務數據自動同步" />
            <IntegrationCard name="Shopify / WooCommerce" desc="電商訂單與庫存整合" />
            <IntegrationCard name="Google / Meta Ads" desc="廣告轉換數據回傳" />
          </div>
        </div>
      </section>

      {/* 6. Comparison Table */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">為什麼選擇訂造開發？</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              現成軟件雖然便宜，但往往難以完全契合你的業務流程。度身訂造系統能為你創造長期的競爭優勢。
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="py-4 px-6 text-left font-bold">比較項目</th>
                    <th className="py-4 px-6 text-center font-bold">ADWire 度身訂造系統</th>
                    <th className="py-4 px-6 text-center font-bold">現成套版軟件 (SaaS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <ComparisonRow item="業務契合度" custom="100% 根據流程量身訂造" saas="需修改業務流程去適應軟件" customBetter={true} />
                  <ComparisonRow item="數據擁有權" custom="完全擁有源代碼與數據" saas="數據存放在第三方平台" customBetter={true} />
                  <ComparisonRow item="功能擴展性" custom="可按業務增長分階段擴展" saas="受限於平台功能模組" customBetter={true} />
                  <ComparisonRow item="長期成本" custom="一次性開發，無月費負擔" saas="按用戶數或功能收費，長期昂貴" customBetter={true} />
                  <ComparisonRow item="系統整合" custom="輕鬆對接現有 API 與硬體" saas="整合難度高或需額外付費" customBetter={true} />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Client Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">客戶真實反饋</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              從傳統模式到數碼化轉型，我們的客戶見證了系統帶來的實際效益。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard name="王先生" company="連鎖零售集團 CEO" quote="實施 ERP 系統後，庫存準確率從 75% 提升至 98%，每月減少 HK$50,000 的損耗。數據實時同步讓我們能快速反應市場變化。" rating={5} />
            <TestimonialCard name="林小姐" company="美容連鎖店創辦人" quote="CRM 會員系統讓我們的客戶回購率提升了 40%！自動化生日優惠和積分提醒大大提高了顧客黏性，營業額持續增長。" rating={5} />
            <TestimonialCard name="陳總" company="進出口貿易公司" quote="定制的 B2B 報價系統讓銷售團隊效率提升 3 倍，客戶滿意度大幅提高。ADWire 團隊很專業，交付準時，強烈推薦！" rating={5} />
          </div>
        </div>
      </section>

      {/* 8. ROI Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">系統化的實際效益</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              投資企業系統是長期基建。以下是導入系統後通常會處理到的營運問題。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <BenefitCard icon={TrendingUp} percentage="流程自動化" title="取代重複人手工序" desc="把重複工序交由系統處理，員工專注高價值任務" />
            <BenefitCard icon={Users} percentage="會員系統" title="客戶資料集中管理" desc="記錄互動與購買紀錄，支援回購跟進" />
            <BenefitCard icon={Database} percentage="單一來源" title="消除重複與版本混亂" desc="所有部門讀取同一份即時數據" />
            <BenefitCard icon={Briefcase} percentage="權限管理" title="按角色分配存取權" desc="誰可以看、可以改，清楚可追溯" />
          </div>
        </div>
      </section>

      {/* 9. Industry Applications */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">各行業成功案例</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              不同行業有不同的數碼化需求，我們為各類企業提供專業系統解決方案。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <IndustryCard title="零售與電商" desc="進銷存系統、會員積分、多渠道訂單整合" example="連鎖零售店實施 ERP 後，庫存週轉率提升 60%" />
            <IndustryCard title="美容與健身" desc="預約管理、會員制度、課程套餐系統" example="美容中心使用 CRM 後，客戶回購率從 25% 升至 65%" />
            <IndustryCard title="餐飲與酒店" desc="訂座系統、庫存管理、POS 整合" example="餐廳集團通過系統整合，減少 30% 食材浪費" />
            <IndustryCard title="製造與物流" desc="生產排程、供應鏈管理、質素追蹤" example="製造商實施 MES 系統後，生產效率提升 45%" />
          </div>
        </div>
      </section>


      {/* 11. Trust Badges */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            <TrustBadge icon={ShieldCheck} title="資料加密" desc="SSL/TLS 及加密存儲" />
            <TrustBadge icon={Gauge} title="監控及告警" desc="異常情況通知負責同事" />
            <TrustBadge icon={FileCode} title="源碼交付" desc="合約列明擁有權" />
            <TrustBadge icon={Star} title="500+ 服務客戶" desc="項目涵蓋多個行業" />
          </div>
        </div>
      </section>

      {/* 11b. 交付清單 (What We Deliver) */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">實際交付什麼</h2>
            <p className="text-gray-500 max-w-3xl mx-auto">
              報價時會列明以下項目，避免開發中途才發現範圍不一致。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "需求及功能清單", desc: "按業務流程整理功能、角色及使用場景，作為報價及驗收的依據。" },
              { title: "介面及 Prototype", desc: "先確認畫面結構及操作流程，減少開發後期大幅修改。" },
              { title: "系統開發", desc: "按確認範圍開發，分段交付並提供階段性預覽。" },
              { title: "API 及系統整合", desc: "連接現有 CRM、ERP、會計、預約或網店系統；可行性會在方案階段實測確認。" },
              { title: "測試及 UAT", desc: "提供測試環境供你的同事實際操作，逐項核對功能清單。" },
              { title: "部署及設定", desc: "設定網域、SSL、權限及備份等上線所需項目。" },
              { title: "文件及交接", desc: "交付操作說明、系統設定紀錄及必要技術文件，方便日後維護或更換供應商。" },
              { title: "培訓安排", desc: "按需要安排操作培訓，讓負責同事能自行處理日常運作。" },
              { title: "維護（選購）", desc: "可按月安排維護及支援；亦可由你的團隊接手，兩者都會在合約中講清楚。" },
            ].map((d) => (
              <div key={d.title} className="bg-white border border-gray-100 rounded-2xl p-6">
                <h3 className="font-bold text-[#0f4c81] mb-2">{d.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white border border-gray-100 rounded-2xl p-8">
            <h3 className="font-bold text-[#0f4c81] mb-4">技術選項按項目評估</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              {[
                { name: "CMS／WordPress／Shopify", desc: "適合內容為主、需要同事自行更新，或希望盡快上線的網站及網店。" },
                { name: "Next.js／React 客製開發", desc: "適合需要特定功能、複雜互動或與現有系統整合的網站及 Web App。" },
                { name: "其他方案", desc: "按現有系統、團隊能力及預算評估，必要時會建議沿用你已投資的平台。" },
              ].map((t) => (
                <div key={t.name}>
                  <p className="font-semibold text-[#0f4c81] mb-1.5">{t.name}</p>
                  <p className="text-gray-600 leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 12. Process */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">嚴謹的系統開發流程</h2>
            <p className="text-slate-400">確保項目準時、高質素交付的標準化路徑。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <ProcessStep number="01" title="需求調研" desc="深入一線了解業務流程，定義功能清單與技術架構。" />
            <ProcessStep number="02" title="原型設計" desc="製作系統 UI/UX 原型，確認交互邏輯與用戶體驗。" />
            <ProcessStep number="03" title="敏捷開發" desc="分階段編寫代碼，定期演示進度，確保方向正確。" />
            <ProcessStep number="04" title="測試上線" desc="壓力測試、安全掃描、員工培訓及正式部署。" />
          </div>
        </div>
      </section>

      {/* 13. Security & Reliability: 安全與穩定性深度解析 */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#0f4c81] mb-6">安全與可靠性安排，保護企業核心資料</h2>
              <p className="text-gray-600 mb-8 text-lg">
                系統穩定性與資料安全會按實際需要設計。我們會說明採用的加密方式、權限設定、備份策略及監控安排，並講清楚第三方服務的依賴及限制。任何系統運作都取決於架構、維運及外部環境，因此我們不會作「無懼任何威脅」一類的絕對保證。
              </p>
              
              <div className="space-y-6">
                <SecurityFeature 
                  title="多重數據加密" 
                  desc="傳輸過程採用 SSL/TLS 加密；敏感資料可按需要加密存儲，實際加密方式會按系統環境及要求確認。" 
                />
                <SecurityFeature 
                  title="自動化異地備份" 
                  desc="按需要設定自動備份頻率及備份位置，並定期測試還原流程。備份策略會按資料量及復原目標確認。" 
                />
                <SecurityFeature 
                  title="高可用性架構 (High Availability)" 
                  desc="架構選項按項目需要評估，可包括負載均衡及橫向擴展設計，並配合監控及告警。" 
                />
                <SecurityFeature 
                  title="嚴格權限控管 (RBAC)" 
                  desc="按角色設定功能及資料層級的存取權限，並記錄操作日誌，方便稽核及追查。" 
                />
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 rounded-3xl rotate-3 opacity-5" />
              <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <div className="text-white font-bold text-xl">安全及合規安排</div>
                    <div className="text-blue-400 text-sm">按項目實際要求確認</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <ComplianceItem text="可配合客戶的個人資料處理及保留要求（例如香港個人資料（私隱）條例）" />
                  <ComplianceItem text="權限控管：按角色設定功能及資料層級的存取權，並記錄操作日誌" />
                  <ComplianceItem text="傳輸加密（SSL/TLS），敏感資料可按需要加密存儲" />
                  <ComplianceItem text="如項目涉及支付、醫療或受監管資料，會按實際情況與客戶及合資格顧問確認合規要求" />
                </div>

                <div className="mt-8 pt-8 border-t border-slate-800">
                  <p className="text-sm text-slate-400 leading-relaxed">
                    ADWire 不會聲稱已取得 ISO 27001、PCI DSS 等認證，除非該項目確實已完成相關認證程序。
                    如你的採購流程需要特定合規文件或第三者評估，我們會在方案階段確認是否能夠配合，
                    並將相關責任及範圍寫入合約。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 14. Why Us */}
      <section className="py-24 bg-[#0f4c81] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">為什麼選擇 ADWire？</h2>
            <p className="text-blue-200">我們不只是寫 Code，更是你的業務增長夥伴。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <WhyUsCard icon={Zap} title="懂生意的技術團隊" desc="我們結合 Marketing 思維與技術實力，確保系統不僅功能強大，更能真正解決業務問題，提升轉換率。" />
            <WhyUsCard icon={ShieldCheck} title="安全與權限安排" desc="按需求設定加密、權限、備份及日誌；私隱及合規要求會按實際情況與客戶確認。" />
            <WhyUsCard icon={Code2} title="全源碼交付" desc="拒絕被綁架。我們提供完整的源代碼 (Source Code) 與文檔，讓你擁有系統的完全控制權。" />
          </div>
        </div>
      </section>

      {/* 15. Tech Stack */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">現代化技術架構</h2>
            <p className="text-gray-500">使用主流、可擴展的技術棧，並在交付時說明日後的升級及維護安排。</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              <TechLogo name="React" />
              <TechLogo name="Next.js" />
              <TechLogo name="Node.js" />
              <TechLogo name="Python" />
              <TechLogo name="Flutter" />
              <TechLogo name="AWS" />
              <TechLogo name="Google Cloud" />
              <TechLogo name="PostgreSQL" />
              <TechLogo name="MongoDB" />
              <TechLogo name="Redis" />
              <TechLogo name="Docker" />
              <TechLogo name="Kubernetes" />
            </div>
          </div>
        </div>
      </section>

      {/* 16. Related Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">延伸服務，全方位數碼轉型</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              系統是核心。結合我們的其他服務，打造完整的自動化商業生態。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/services/web" className="group bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-blue-500 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <Code2 className="text-blue-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">網頁設計及開發</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">打造高性能、高轉換的企業官網，與後台系統完美對接。</p>
              <div className="flex items-center gap-2 text-blue-600 font-medium text-sm group-hover:gap-3 transition-all">
                了解更多 <ArrowRight size={16} />
              </div>
            </Link>

            <Link href="/services/automation" className="group bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-blue-500 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-blue-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">營銷自動化</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">自動化跟進潛在客戶，將系統數據轉化為實際銷售額。</p>
              <div className="flex items-center gap-2 text-blue-600 font-medium text-sm group-hover:gap-3 transition-all">
                了解更多 <ArrowRight size={16} />
              </div>
            </Link>

            <Link href="/services/seo" className="group bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-blue-500 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="text-blue-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">SEO 搜尋引擎優化</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">提升系統門戶或官網的搜尋排名，取得更多高質素的 B2B 詢盤。</p>
              <div className="flex items-center gap-2 text-blue-600 font-medium text-sm group-hover:gap-3 transition-all">
                了解更多 <ArrowRight size={16} />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 17. FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">常見問題</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={index} q={faq.question} a={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* 18. CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">準備好開始你的項目了嗎？</h2>
          <p className="text-xl text-blue-100 mb-10">講清楚你的需求，我們會回覆可行的做法、範圍、時間及報價方式。</p>
          <a href="/contact" className="bg-white text-blue-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-all shadow-xl inline-flex items-center gap-2">
            提交項目需求 <ArrowRight size={20} />
          </a>
        </div>
      </section>

      <ContactSection defaultService="系統/APP開發" />
      <Footer />
    </div>
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

function PainPointCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
      <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-500 mb-4">
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 text-gray-700">
      <div className="mt-1 min-w-[20px] text-blue-500">
        <Check size={20} />
      </div>
      <span>{text}</span>
    </li>
  );
}

function WhyUsCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/20 transition-all">
      <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-300 mb-6">
        <Icon size={28} />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-blue-100 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}

function TestimonialCard({ name, company, quote, rating }: { name: string, company: string, quote: string, rating: number }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all">
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
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

function BenefitCard({ icon: Icon, percentage, title, desc }: { icon: any, percentage: string, title: string, desc: string }) {
  return (
    <div className="bg-gray-50 p-8 rounded-2xl text-center hover:bg-blue-50 transition-colors group">
      <div className="w-12 h-12 mx-auto mb-4 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
        <Icon size={24} />
      </div>
      <div className="text-3xl font-bold text-blue-600 mb-2">{percentage}</div>
      <div className="font-bold text-gray-900 mb-2">{title}</div>
      <p className="text-gray-500 text-sm">{desc}</p>
    </div>
  );
}

function IndustryCard({ title, desc, example }: { title: string, desc: string, example: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-blue-600 text-sm font-medium mb-4">{desc}</p>
      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
        <p className="text-gray-700 text-sm leading-relaxed">
          <span className="font-bold">效益：</span>{example}
        </p>
      </div>
    </div>
  );
}

function TrustBadge({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
        <Icon size={28} />
      </div>
      <div className="font-bold text-gray-900 mb-1">{title}</div>
      <div className="text-sm text-gray-600">{desc}</div>
    </div>
  );
}

function TechLogo({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100 group">
      <div className="font-bold text-lg text-gray-400 group-hover:text-blue-600 transition-colors mb-1">
        {name.charAt(0)}
      </div>
      <span className="text-xs text-gray-500 font-medium">{name}</span>
    </div>
  );
}

function FAQItem({ q, a }: { q: string, a: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <span className="font-bold text-gray-900">{q}</span>
        {isOpen ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
      </button>
      {isOpen && (
        <div className="p-6 pt-0 bg-white text-gray-600 leading-relaxed border-t border-gray-100">
          {a}
        </div>
      )}
    </div>
  );
}

function ComparisonRow({ item, custom, saas, customBetter }: { 
  item: string, custom: string, saas: string, customBetter: boolean 
}) {
  return (
    <tr className="bg-white">
      <td className="py-4 px-6 font-medium text-gray-900">{item}</td>
      <td className="py-4 px-6 text-center">
        <div className="flex items-center justify-center gap-2">
          {customBetter && <CheckCircle2 size={18} className="text-green-500" />}
          <span className={customBetter ? 'text-green-600 font-medium' : 'text-gray-600'}>{custom}</span>
        </div>
      </td>
      <td className="py-4 px-6 text-center">
        <div className="flex items-center justify-center gap-2">
          {!customBetter && <CheckCircle2 size={18} className="text-green-500" />}
          <span className={!customBetter ? 'text-green-600 font-medium' : 'text-gray-600'}>{saas}</span>
        </div>
      </td>
    </tr>
  );
}

function ProcessStep({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="relative p-8 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
      <div className="text-4xl font-bold text-blue-500/20 mb-4 group-hover:text-blue-500/40 transition-colors">{number}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function IntegrationCard({ name, desc }: { name: string, desc: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center group">
      <div className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{name}</div>
      <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
    </div>
  );
}

function SecurityFeature({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1">
        <CheckCircle2 className="text-green-500" size={20} />
      </div>
      <div>
        <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function ComplianceItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-slate-300 text-sm">
      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
      {text}
    </div>
  );
}

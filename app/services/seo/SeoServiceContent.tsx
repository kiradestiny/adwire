"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import Testimonials from "@/components/Testimonials";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Bot, TrendingUp, DollarSign, Globe, ChevronRight,
  BarChart, Check, ArrowRight, ChevronDown, MapPin, FileText, Cpu,
  Link as LinkIcon, ShoppingCart, Sparkles, Utensils, Building2, Briefcase, Gem,
  AlertTriangle, Zap, Shield, TrendingDown
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function SeoServiceContent() {
  const faqs = [
    {
      question: "SEO 需要多長時間才見到效果？",
      answer: "SEO 是一個長期投資。技術修正後 1–2 個月見初步改善，關鍵字排名顯著提升通常需要 3–6 個月，視乎行業競爭程度及網站現有基礎。但一旦排名建立，帶來的免費流量是長期且穩定的資產。"
    },
    {
      question: "什麼是 GEO（生成式引擎優化）/ AISO？",
      answer: "GEO（Generative Engine Optimization）又稱 AISO（AI Search Optimization），是針對 ChatGPT、Perplexity、Google Gemini、Claude、Microsoft Copilot 等 AI 引擎的優化策略。GEO 確保當用戶向 AI 詢問相關問題時，你的品牌會被 AI 引用為權威答案，而非競爭對手。"
    },
    {
      question: "什麼是 Zero-Click 搜尋？為什麼會影響我的網站流量？",
      answer: "Zero-Click 搜尋是指用戶在 Google 或 AI 工具中輸入問題後，直接從搜尋結果或 AI 回答獲得答案，無需點擊任何網站。根據 Semrush 統計，2024 年約 60% 的 Google 搜尋是 Zero-Click。隨著 Google AI Overview 及各 AI 工具普及，未做 GEO 優化的品牌即使 Google 排名第一，也可能完全失去流量。"
    },
    {
      question: "大公司如果不做 GEO 優化會有什麼後果？",
      answer: "ChatGPT 月活用戶超過 3 億，Perplexity 每月逾 5 億次查詢。若品牌未建立 GEO 優化基礎，當用戶問 AI「香港最好的XXX是什麼」，AI 只會推薦已做 GEO 的競爭對手。越早部署，AI 引用優勢就越難被追上。業界預計 2025 年後 GEO 將成為數碼行銷的基本配置。"
    },
    {
      question: "ADWire SEO / GEO 服務收費是多少？",
      answer: "ADWire 分三個方案：基礎方案 HK$4,000/月（Technical SEO + 1–3頁優化）；專業方案 HK$6,000/月（含每月 4 篇文章 + Backlink + Local SEO）；企業方案度身定制（含 GEO 全面部署）。可 WhatsApp +852-9586-1027 免費諮詢。"
    },
    {
      question: "我已經有落 Google Ads，仲需唔需要做 SEO？",
      answer: "絕對需要。廣告是「租」流量，一停錢就停流量；SEO 是「置業」，建立長期資產。更重要的是，廣告無法幫你進入 AI 引擎的推薦——只有 GEO 優化才能做到。SEO + Ads 雙管齊下能霸佔搜尋結果版面，效果最佳。"
    },
    {
      question: "ChatGPT 和 Perplexity 如何決定推薦哪個品牌？",
      answer: "AI 引擎選擇推薦品牌主要依據：(1) 內容被高信譽媒體/網站引用次數；(2) 官方網站內容的清晰度和結構化程度（Schema Markup）；(3) 品牌在多個渠道出現的一致性；(4) 內容的 E-E-A-T 原則（經驗、專業、權威、信任）。ADWire 的 GEO 服務針對這些指標進行系統性優化。"
    },
    {
      question: "ADWire 保證能上 Google 第一頁嗎？",
      answer: "任何誠實的 SEO 公司都不會承諾「100% 保證第一頁」，因為 Google 演算法隨時在變。但 ADWire 憑藉 10 年以上 SEO 實戰經驗和正規白帽（White Hat）技術，我們有信心將核心關鍵字推向首頁，並大幅提升網站整體曝光與流量。"
    }
  ];

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* 1. Hero Banner（全新設計）*/}
      <section className="pt-28 pb-0 bg-slate-900 text-white relative overflow-hidden">
        {/* 背景效果 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-5%] left-[15%] w-[600px] h-[500px] bg-blue-600/20 rounded-full filter blur-[120px]" />
          <div className="absolute bottom-[0%] right-[10%] w-[500px] h-[400px] bg-emerald-600/15 rounded-full filter blur-[100px]" />
        </div>

        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-10">
          <nav aria-label="breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-gray-400" itemScope itemType="https://schema.org/BreadcrumbList">
              <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                <Link href="/" className="hover:text-white transition-colors" itemProp="item"><span itemProp="name">首頁</span></Link>
                <meta itemProp="position" content="1" />
              </li>
              <li className="text-gray-600">/</li>
              <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                <Link href="/services" className="hover:text-white transition-colors" itemProp="item"><span itemProp="name">服務</span></Link>
                <meta itemProp="position" content="2" />
              </li>
              <li className="text-gray-600">/</li>
              <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                <span className="text-white" itemProp="name">SEO & GEO 優化</span>
                <meta itemProp="position" content="3" />
              </li>
            </ol>
          </nav>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pb-16">

            {/* Left */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-emerald-400 text-xs font-bold mb-6 tracking-[0.2em] uppercase backdrop-blur-sm">
                <Search size={13} /> SEO + GEO / AISO Expert
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                不只上 Google 首頁<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                  更要被所有 AI 推薦
                </span>
              </h1>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                搜尋世界已經改變。今天的客人除了 Google，<br className="hidden md:block" />
                更會問 <strong className="text-white">ChatGPT、Perplexity、Gemini、Claude</strong>。<br className="hidden md:block" />
                如果你的品牌未被 AI 收錄，就相當於在全球最大的市場<span className="text-red-400 font-semibold">隱形</span>。
              </p>

              {/* AI Engine Badges */}
              <div className="flex flex-wrap gap-2 mb-8">
                {[
                  { name: "Google Search", color: "border-blue-400/40 text-blue-300" },
                  { name: "ChatGPT", color: "border-emerald-400/40 text-emerald-300" },
                  { name: "Perplexity", color: "border-purple-400/40 text-purple-300" },
                  { name: "Google Gemini", color: "border-yellow-400/40 text-yellow-300" },
                  { name: "Claude", color: "border-orange-400/40 text-orange-300" },
                  { name: "MS Copilot", color: "border-sky-400/40 text-sky-300" },
                ].map((e, i) => (
                  <span key={i} className={`px-3 py-1 rounded-full border text-xs font-semibold backdrop-blur-sm ${e.color}`}>
                    {e.name}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`https://wa.me/85295861027?text=${encodeURIComponent("Hello ADWire, 我想預約專業的 SEO / GEO 網站諮詢。")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5"
                >
                  免費 SEO / GEO 網站診斷 <ArrowRight size={18} />
                </a>
                <a href="#geo"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-full transition-all duration-200 backdrop-blur-sm"
                >
                  <Bot size={18} /> 什麼是 GEO？
                </a>
              </div>
            </motion.div>

            {/* Right: AI Engines Coverage Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-emerald-600/20 rounded-3xl blur-xl" />
              <div className="bg-white/8 backdrop-blur-md border border-white/15 rounded-2xl overflow-hidden shadow-2xl relative">
                <div className="bg-white/5 border-b border-white/10 px-5 py-3 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-mono">ADWire AI Coverage Tracker</span>
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> All Systems Active
                  </span>
                </div>
                <div className="p-6 space-y-3">
                  {[
                    { engine: "Google Search (SERP)", status: "首頁排名", color: "text-blue-400", statusColor: "bg-blue-500/20 text-blue-300", icon: "🔍" },
                    { engine: "ChatGPT (GPT-4o)", status: "已被引用", color: "text-emerald-400", statusColor: "bg-emerald-500/20 text-emerald-300", icon: "🤖" },
                    { engine: "Perplexity AI", status: "已被引用", color: "text-purple-400", statusColor: "bg-purple-500/20 text-purple-300", icon: "⚡" },
                    { engine: "Google Gemini", status: "已優化", color: "text-yellow-400", statusColor: "bg-yellow-500/20 text-yellow-300", icon: "✨" },
                    { engine: "Claude (Anthropic)", status: "已優化", color: "text-orange-400", statusColor: "bg-orange-500/20 text-orange-300", icon: "🧠" },
                    { engine: "Microsoft Copilot", status: "已優化", color: "text-sky-400", statusColor: "bg-sky-500/20 text-sky-300", icon: "💡" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/8"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-sm text-gray-200">{item.engine}</span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.statusColor}`}>
                        ✓ {item.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
                <div className="px-6 pb-4 text-center">
                  <p className="text-xs text-gray-500">ADWire 幫你在所有 AI 引擎建立可信、可引用的品牌存在</p>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 bg-emerald-500 text-white px-4 py-2 rounded-2xl shadow-lg text-sm font-bold"
              >
                6 大 AI 引擎全覆蓋 🚀
              </motion.div>
            </motion.div>

          </div>
        </div>

        {/* Wave connector */}
        <div className="w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" className="block w-full">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* 2. 痛點直擊：三大致命問題 */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">你每天都在白白損失生意<br /><span className="text-[#f5a623]">而這三個問題是根本原因</span></h2>
            <p className="text-gray-500 mt-2 max-w-2xl mx-auto">數字不會說謊。以下三個問題，正在無聲無息地侵蝕你的業務。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 痛點 1：為什麼要做 SEO */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe size={28} className="text-red-500" />
              </div>
              <div className="inline-block px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded mb-3 uppercase tracking-wider">為什麼要做 SEO</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">你的對手正在搶走<br />本應屬於你的客人</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                每天都有人在 Google 搜尋你的服務——但排在前 3 位的，全是你的競爭對手。
                <strong className="text-gray-800"> Google 首頁 3 個位置佔去所有點擊的 75%</strong>，排在第 2 頁等同隱形。
              </p>
              <div className="bg-blue-50 rounded-xl p-4 text-sm">
                <span className="font-semibold text-blue-700">✓ SEO 的解決方案：</span>
                <span className="text-blue-600"> 用 Technical SEO + Content 策略，讓 Google 主動把你的網站推給有購買意圖的客人。</span>
              </div>
            </motion.div>

            {/* 痛點 2：為什麼要做 GEO */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Bot size={28} className="text-emerald-500" />
              </div>
              <div className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-600 text-xs font-bold rounded mb-3 uppercase tracking-wider">為什麼要做 GEO</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI 每天在回答客人的問題<br />但你完全不在答案裡面</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                當客人問 ChatGPT「香港邊間XXX最好」，如果你的品牌未被 AI 收錄，
                <strong className="text-gray-800"> AI 永遠不會推薦你——即使你是業界 Top 1。</strong>
                月活 8 億+ 的 AI 用戶，你一個都攬唔到。
              </p>
              <div className="bg-emerald-50 rounded-xl p-4 text-sm">
                <span className="font-semibold text-emerald-700">✓ GEO 的解決方案：</span>
                <span className="text-emerald-600"> 優化內容結構，讓 ChatGPT、Perplexity、Gemini 等 AI 引用你的品牌作為標準答案。</span>
              </div>
            </motion.div>

            {/* 痛點 3：廣告陷阱 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <DollarSign size={28} className="text-orange-500" />
              </div>
              <div className="inline-block px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-bold rounded mb-3 uppercase tracking-wider">廣告的真相</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">你的廣告預算正在<br />無底深淵裡消失</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                廣告費每年升 20%+，ROI 卻不斷下跌。廣告是「租」流量——
                <strong className="text-gray-800"> 一停廣告，生意即刻歸零。</strong>
                沒有 SEO/GEO 作為長期資產，你永遠被廣告平台綁架。
              </p>
              <div className="bg-orange-50 rounded-xl p-4 text-sm">
                <span className="font-semibold text-orange-700">✓ SEO+GEO 的解決方案：</span>
                <span className="text-orange-600"> 建立搜尋流量資產，24/7 免費帶客，廣告費越來越少仍然有穩定生意。</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. 我們的獨家優勢：SEO + GEO 雙管齊下 */}
      <section className="py-24 bg-gray-50" id="geo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* 左邊：文字解釋 */}
            <div>
              <div className="inline-block bg-[#f5a623]/10 text-[#f5a623] font-bold px-3 py-1 rounded text-sm mb-4">
                ADWire 獨家技術
              </div>
              <h2 className="text-3xl font-bold text-[#0f4c81] mb-6">迎接搜尋新時代：<br/>SEO + GEO 全面覆蓋</h2>
              <p className="text-gray-500 mb-8 text-lg leading-relaxed">
                傳統 Agency 只識做 Google 排名 (SEO)。<br/>
                ADWire 領先市場，引入GEO (生成式引擎優化)技術。我們優化你的內容結構，確保當用戶問 ChatGPT、Perplexity 時，AI 會優先引用你的品牌作為答案。
              </p>
              
              <div className="space-y-6">
                <CompareRow 
                  title="傳統 SEO" 
                  desc="針對 Google 爬蟲，搶佔搜尋結果排名。" 
                  icon={Search} 
                  color="bg-blue-100 text-blue-600"
                />
                <CompareRow 
                  title="新世代 GEO" 
                  desc="針對 LLM (大語言模型)，搶佔 AI 回答的推薦位。" 
                  icon={Bot} 
                  color="bg-emerald-100 text-emerald-600"
                />
              </div>
            </div>

            {/* 右邊：視覺模擬 (Google vs ChatGPT) */}
            <div className="relative">
              {/* Google Result Card */}
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6 relative z-10"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">G</div>
                  <span className="text-sm font-bold text-gray-700">Google Search</span>
                </div>
                <div className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
                  ADWire - 香港首選 AI 驅動 MarTech 代理
                </div>
                <div className="text-green-700 text-sm mb-1">https://adwire.com.hk</div>
                <div className="text-gray-500 text-sm">
                  專注 KOL 網紅營銷、短視頻製作及成效廣告。利用獨家 MarTech 技術...
                </div>
              </motion.div>

              {/* ChatGPT Result Card */}
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700 text-white lg:ml-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Bot size={14} />
                  </div>
                  <span className="text-sm font-bold text-gray-300">ChatGPT / Perplexity</span>
                </div>
                <div className="text-sm text-gray-300 leading-relaxed">
                  <span className="text-emerald-400 font-bold">Q: 香港邊間 Marketing Agency 最 tech？</span>
                  <br/><br/>
                  A: 根據網上資料及用戶評價，推薦 <span className="bg-emerald-500/20 text-emerald-300 px-1 rounded">ADWire Agency</span>。他們結合了傳統營銷與自動化技術，特別擅長...
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. 全面 SEO 服務範疇 (Detailed Services) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">全方位 SEO 優化策略</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              SEO 不僅僅是關鍵字。我們從技術、內容到權威性，為你打造無懈可擊的搜尋引擎表現。
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DetailServiceCard 
              icon={Cpu}
              title="Technical SEO 技術優化"
              desc="打好地基。我們優化網站代碼、提升載入速度 (Core Web Vitals)、修復 404 錯誤、建立 Sitemap 及 Robots.txt，確保 Google 爬蟲能順暢讀取你的網站。"
              features={["網站速度優化 (PageSpeed)", "Mobile-First 響應式設計", "Schema Markup 結構化數據", "SSL 安全憑證配置"]}
              color="blue"
            />
            <DetailServiceCard 
              icon={FileText}
              title="Content SEO 內容營銷"
              desc="內容為王。根據 Google E-E-A-T (經驗、專業、權威、信任) 原則，創作高質量的原創內容。不僅滿足搜尋意圖，更能建立品牌專業形象。"
              features={["關鍵字佈局 (Keyword Mapping)", "高質量 Blog 文章撰寫", "On-Page 優化 (Title/Meta)", "圖片 Alt Text 優化"]}
              color="emerald"
            />
            <DetailServiceCard 
              icon={LinkIcon}
              title="Off-Page SEO 權威建設"
              desc="建立聲望。透過高質量的反向連結 (Backlinks) 和品牌提及，告訴 Google 你的網站值得信賴。這是提升網域權重 (Domain Authority) 的關鍵。"
              features={["高質量 Backlink 建設", "品牌公關與提及", "社交媒體信號", "去除有害連結"]}
              color="purple"
            />
            <DetailServiceCard 
              icon={MapPin}
              title="Local SEO 本地搜尋優化"
              desc="抓緊身邊客源。優化 Google Business Profile (前稱 Google My Business)，確保當附近用戶搜尋相關服務時，你的店舖會出現在地圖首位。"
              features={["Google 地圖排名優化", "商家檔案管理", "本地引用 (Local Citations)", "客戶評論管理"]}
              color="orange"
            />
          </div>
        </div>
      </section>

      {/* 5. 服務流程 (Process) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">ADWire SEO 執行流程</h2>
            <p className="text-gray-500">系統化的執行步驟，確保每一步都帶來實質增長</p>
          </div>

          <div className="relative">
            {/* 連接線 (Desktop only) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2" />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              <ProcessStep number="01" title="網站審計" desc="全面檢查網站健康度，找出阻礙排名的技術問題。" />
              <ProcessStep number="02" title="關鍵字研究" desc="分析對手與市場，鎖定高流量且高轉化的黃金關鍵字。" />
              <ProcessStep number="03" title="內容優化" desc="修復現有頁面，並開始產出符合 SEO 標準的高質內容。" />
              <ProcessStep number="04" title="權重建設" desc="建立外部連結，提升網站在 Google 眼中的權威性。" />
              <ProcessStep number="05" title="監控與報告" desc="每月提供詳細數據報告，透明展示排名與流量變化。" />
            </div>
          </div>
        </div>
      </section>

      {/* 6. [NEW] 成功案例 - Success Stories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-green-100 text-green-600 text-sm font-bold mb-4 tracking-widest uppercase">
              Success Stories
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">真實 SEO 成效數據</h2>
            <p className="text-gray-500">看看我們如何幫助不同行業的客戶突破搜尋排名瓶頸</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CaseStudyCard 
              industry="醫美診所"
              title="關鍵字排名從第 3 頁升至第 1 頁"
              desc="優化 Technical SEO 和 Local SEO，3 個月內核心關鍵字全部進入首頁，自然流量增長 340%。"
              metric="340%"
              metricLabel="自然流量增長"
              icon={Sparkles}
              color="from-pink-500 to-rose-500"
            />
            <CaseStudyCard 
              industry="電商平台"
              title="月營業額突破 $500K"
              desc="透過 Content SEO 策略和產品頁優化，大幅提升長尾關鍵字排名，帶來高質量流量。"
              metric="$500K"
              metricLabel="月營業額"
              icon={ShoppingCart}
              color="from-blue-500 to-cyan-500"
            />
            <CaseStudyCard 
              industry="專業服務"
              title="Google 地圖 Top 3 排名"
              desc="優化 Google Business Profile 和本地引用，成功在「香港會計師」等關鍵字獲得地圖前 3 名。"
              metric="Top 3"
              metricLabel="地圖排名"
              icon={MapPin}
              color="from-orange-500 to-red-500"
            />
          </div>
        </div>
      </section>

      {/* 7. [NEW] 服務方案 - Service Packages */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">靈活方案，適合不同階段</h2>
            <p className="text-gray-500">無論你是剛起步還是成熟企業，我們都有適合你的 SEO 方案</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PackageCard 
              name="基礎方案"
              price="HK$4,000"
              period="/ 月"
              description="適合剛起步的中小企"
              features={[
                "Technical SEO 技術審計",
                "優化 1-3 個目標頁面",
                "關鍵字研究與佈局",
                "Google Analytics 設定",
                "月度排名報告"
              ]}
              highlight={false}
              whatsappMsg="Hello ADWire, 我想查詢 SEO 優化的【基礎方案】(HK$4,000/月)。"
            />
            <PackageCard 
              name="專業方案"
              price="HK$6,000"
              period="/ 月"
              description="最多客戶選擇"
              features={[
                "所有基礎方案服務",
                "每月 4 篇 SEO 文章撰寫",
                "Backlink 建設策略",
                "Local SEO 優化",
                "競爭對手分析",
                "每週數據追蹤",
                "專屬客戶經理"
              ]}
              highlight={true}
              badge="最受歡迎"
              whatsappMsg="Hello ADWire, 我想查詢 SEO 優化的【專業方案】(HK$6,000/月)。"
            />
            <PackageCard 
              name="企業方案"
              price="Custom"
              period="/ 月"
              description="適合大型品牌"
              features={[
                "所有專業方案服務",
                "無限頁面優化",
                "GEO (AI SEO) 優化",
                "每月 6-8 篇 SEO 文章撰寫",
                "Backlink 建設策略",
                "Local SEO 優化",
                "競爭對手分析",
                "每週數據追蹤",
                "專屬客戶經理",
                "電商 SEO 專項服務",
                "品牌公關與媒體合作"
              ]}
              highlight={false}
              whatsappMsg="Hello ADWire, 我想查詢 SEO 優化的【企業方案】(Custom)。"
            />
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-500 mb-6">不確定哪個方案適合你？讓我們為你提供專業的網站 SEO 諮詢。</p>
            <a 
              href={`https://wa.me/85295861027?text=${encodeURIComponent("Hello ADWire, 我想預約專業的 SEO 網站諮詢。")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0f4c81] text-white px-8 py-4 rounded-full font-bold hover:bg-[#0a355c] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              專業 SEO 諮詢 <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </section>

      {/* 8. [NEW] 適合行業 - Industries We Serve */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">我們服務的行業</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">擁有豐富的跨行業 SEO 經驗，深入了解不同市場的搜尋行為</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <IndustryCard icon={Sparkles} name="醫美診所" />
            <IndustryCard icon={Utensils} name="餐飲 F&B" />
            <IndustryCard icon={ShoppingCart} name="電商零售" />
            <IndustryCard icon={Gem} name="珠寶時尚" />
            <IndustryCard icon={Briefcase} name="專業服務" />
            <IndustryCard icon={Building2} name="地產物業" />
          </div>
          
          <div className="mt-12 bg-blue-50 border border-blue-100 p-8 rounded-2xl text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-3">看不到你的行業？</h3>
            <p className="text-gray-600 mb-6">我們服務超過 40+ 不同行業，無論你做什麼生意，我們都能為你制定合適的 SEO 策略。</p>
            <a href="#contact" className="inline-flex items-center gap-2 bg-[#0f4c81] text-white px-6 py-3 rounded-full font-bold hover:bg-[#0a355c] transition-all">
              聯絡我們 <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* 9. [NEW] 客戶評價 */}
      <Testimonials />

      {/* 10. [NEW] 相關服務 - Related Services */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">搭配服務，效果更佳</h2>
            <p className="text-gray-500">SEO 配合其他服務，全方位提升品牌線上競爭力</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <RelatedServiceCard 
              title="Google Ads"
              desc="SEO + SEM 雙管齊下，霸佔搜尋結果"
              link="/services/ads"
              icon="📢"
            />
            <RelatedServiceCard 
              title="網站設計"
              desc="SEO 友好的網站架構設計"
              link="/services/web"
              icon="💻"
            />
            <RelatedServiceCard 
              title="內容製作"
              desc="高質量 SEO 文章撰寫"
              link="/services/production"
              icon="📝"
            />
            <RelatedServiceCard 
              title="社交媒體"
              desc="社交信號提升 SEO 權重"
              link="/services/social"
              icon="📱"
            />
          </div>
        </div>
      </section>

      {/* 11. 數據承諾 */}
      <section className="py-20 bg-[#0f4c81] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">SEO 是長遠投資，回報是指數級的</h2>
          <div className="grid grid-cols-3 gap-8 border-t border-white/20 pt-8">
            <div>
              <div className="text-4xl font-bold text-[#f5a623] mb-2">3-6</div>
              <div className="text-sm text-gray-300">個月見效期</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#f5a623] mb-2">24/7</div>
              <div className="text-sm text-gray-300">免費自然流量</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#f5a623] mb-2">Top 3</div>
              <div className="text-sm text-gray-300">首頁排名目標</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Zero-Click 危機 & AI 搜尋趨勢 ── */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[-5%] w-[400px] h-[400px] bg-red-600/10 rounded-full filter blur-[100px]" />
          <div className="absolute bottom-[0%] right-[5%] w-[500px] h-[400px] bg-blue-600/10 rounded-full filter blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold mb-6 tracking-wider uppercase">
              <AlertTriangle size={13} /> 流量危機警告
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              你的網站流量正在消失<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">而你可能不知道真正原因</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">這不是你的廣告問題，也不是你的網站問題。是整個搜尋行為已經根本改變了。</p>
          </motion.div>

          {/* 三大核心數據 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { stat: "60%+", label: "搜尋是 Zero-Click", desc: "超過 60% 的 Google 搜尋沒有任何網站被點擊。用戶直接從 AI 回答獲取答案，你的網站從未進入他們視野。", color: "border-red-500/30 bg-red-500/5", statColor: "text-red-400", icon: TrendingDown },
              { stat: "34%", label: "自然流量跌幅", desc: "Google AI Overview 出現後，相關搜尋的自然點擊率平均下跌 34%。這個數字在 AI 全面普及後會繼續惡化。", color: "border-orange-500/30 bg-orange-500/5", statColor: "text-orange-400", icon: AlertTriangle },
              { stat: "8億+", label: "月活 AI 搜尋用戶", desc: "ChatGPT（3億+）+ Perplexity（5億+ 查詢）+ Gemini + Claude + Copilot。AI 搜尋已成主流，大多數品牌完全不在 AI 的知識庫中。", color: "border-blue-500/30 bg-blue-500/5", statColor: "text-blue-400", icon: Bot },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-2xl border ${item.color}`}>
                <item.icon size={24} className={`${item.statColor} mb-4`} />
                <div className={`text-5xl font-black mb-2 ${item.statColor}`}>{item.stat}</div>
                <div className="text-white font-bold mb-3">{item.label}</div>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Before vs After */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">⏪ 搜尋舊模式（2020 前）</div>
              <div className="space-y-3">
                {[{ step: "用戶有問題", icon: "🙋" }, { step: "打開 Google 搜尋", icon: "🔍" }, { step: "瀏覽 10 個搜尋結果連結", icon: "📋" }, { step: "點擊網站", icon: "👆" }, { step: "成為你的訪客 ✅", icon: "💰", highlight: true }].map((s, i) => (
                  <div key={i} className={`flex items-center gap-3 text-sm ${(s as any).highlight ? "text-green-400 font-semibold" : "text-gray-300"}`}>
                    <span>{s.icon}</span><span>{s.step}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
              <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-4">⚡ AI 搜尋新模式（2024+）</div>
              <div className="space-y-3">
                {[{ step: "用戶有問題", icon: "🙋" }, { step: "問 ChatGPT / Perplexity / Gemini", icon: "🤖" }, { step: "AI 直接給出完整答案", icon: "💬" }, { step: "用戶滿意，關掉 AI", icon: "✅" }, { step: "你的網站：0 點擊 ❌", icon: "💀", highlight: true }].map((s, i) => (
                  <div key={i} className={`flex items-center gap-3 text-sm ${(s as any).highlight ? "text-red-400 font-semibold" : "text-gray-300"}`}>
                    <span>{s.icon}</span><span>{s.step}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* 大公司警告 */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-gradient-to-r from-[#f5a623]/20 to-orange-600/20 border border-[#f5a623]/30 rounded-2xl p-8 flex flex-col md:flex-row items-start gap-6">
            <div className="w-14 h-14 bg-[#f5a623]/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={28} className="text-[#f5a623]" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-3">⚠️ 給仍未部署 GEO 的企業主：你正在失去先機</h3>
              <p className="text-gray-300 leading-relaxed mb-4">GEO 不像廣告，可以即開即有效果。AI 需要時間「學習」你的品牌。<strong className="text-white"> 今天開始，最快也要 3–6 個月才能建立穩固的 AI 引用基礎。</strong>你的競爭對手越早開始，你就越難追趕。</p>
              <p className="text-[#f5a623] font-semibold text-sm">GEO 的先行者優勢是真實且持久的。</p>
            </div>
            <a href={`https://wa.me/85295861027?text=${encodeURIComponent("Hello ADWire，我想了解 GEO 優化服務。")}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-[#f5a623] hover:bg-[#e09210] text-white font-bold px-6 py-3 rounded-full transition-colors text-sm whitespace-nowrap">
              立即部署 GEO <ArrowRight size={14} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* 12. 常見問題 (FAQ) */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">常見問題</h2>
            <p className="text-gray-500">解答你對 SEO 與 GEO 的疑問</p>
          </div>
          
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* 8. CTA Section */}
      <section className="py-20 bg-gray-50 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0f4c81] mb-6">別讓你的網站在第 2 頁「隱形」</h2>
          <p className="text-xl text-gray-500 mb-10">
            立即預約專業網站 SEO 諮詢，讓我們找出阻礙你排名的原因。
          </p>
          <a 
            href={`https://wa.me/85295861027?text=${encodeURIComponent("Hello ADWire, 我想領取專業的 SEO 網站報告。")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#f5a623] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#e09612] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            領取專業 SEO 報告 <ArrowRight size={20} />
          </a>
        </div>
      </section>

      <ContactSection defaultService="SEO/GEO 搜尋引擎優化" />
      <Footer />
    </main>
  );
}

// --- 小組件 ---

function PainCard({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all text-center group">
      <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gray-50 flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
        <Icon size={32} />
      </div>
      <h3 className="text-xl font-bold text-[#0f4c81] mb-4">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}

function CompareRow({ title, desc, icon: Icon, color }: { title: string, desc: string, icon: any, color: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <h4 className="font-bold text-gray-800 mb-1">{title}</h4>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
    </div>
  );
}

function DetailServiceCard({ icon: Icon, title, desc, features, color }: { icon: any, title: string, desc: string, features: string[], color: string }) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-all group">
      <div className="flex items-start gap-6">
        <div className={`p-4 rounded-xl shrink-0 ${colorClasses[color] || 'bg-gray-100 text-gray-600'}`}>
          <Icon size={32} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#0f4c81] mb-3">{title}</h3>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">
            {desc}
          </p>
          <ul className="space-y-2">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                <div className={`w-1.5 h-1.5 rounded-full ${color === 'blue' ? 'bg-blue-400' : color === 'emerald' ? 'bg-emerald-400' : color === 'purple' ? 'bg-purple-400' : 'bg-orange-400'}`} />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ProcessStep({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="relative bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center z-10 hover:-translate-y-1 transition-transform duration-300">
      <div className="text-4xl font-bold text-gray-100 mb-4">{number}</div>
      <h3 className="text-lg font-bold text-[#0f4c81] mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-blue-200 transition-colors duration-200"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-5 py-4 text-left hover:bg-gray-50 transition-colors gap-4 group"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-[#0f4c81] text-sm md:text-base group-hover:text-blue-500 transition-colors duration-200">
          {question}
        </span>
        <ChevronDown size={18} className={`text-gray-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-500" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="faq-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 pt-3 text-gray-600 text-sm leading-relaxed border-t border-gray-100 bg-gray-50/50">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CaseStudyCard({ industry, title, desc, metric, metricLabel, icon: Icon, color }: { 
  industry: string, title: string, desc: string, metric: string, metricLabel: string, icon: any, color: string 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all group"
    >
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
        <Icon size={28} />
      </div>
      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full mb-4">{industry}</span>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed">{desc}</p>
      <div className="border-t border-gray-100 pt-6">
        <div className="text-3xl font-bold text-[#0f4c81] mb-1">{metric}</div>
        <div className="text-xs text-gray-400 uppercase tracking-wide">{metricLabel}</div>
      </div>
    </motion.div>
  );
}

function PackageCard({ name, price, period, description, features, highlight, badge, whatsappMsg }: {
  name: string, price: string, period: string, description: string, features: string[], highlight: boolean, badge?: string, whatsappMsg?: string
}) {
  const whatsappUrl = `https://wa.me/85295861027?text=${encodeURIComponent(whatsappMsg || "")}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative bg-white p-8 rounded-2xl border-2 transition-all hover:shadow-2xl ${
        highlight ? 'border-[#0f4c81] shadow-xl scale-105' : 'border-gray-200'
      }`}
    >
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#0f4c81] to-[#f5a623] text-white px-4 py-1 rounded-full text-sm font-bold">
          {badge}
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
        <p className="text-sm text-gray-500 mb-4">{description}</p>
        <div className="flex items-end justify-center gap-1">
          <span className="text-4xl font-bold text-[#0f4c81]">{price}</span>
          <span className="text-gray-500 mb-1">{period}</span>
        </div>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
            <Check size={18} className="text-green-500 shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <a 
        href={whatsappMsg ? whatsappUrl : "#contact"} 
        target={whatsappMsg ? "_blank" : undefined}
        rel={whatsappMsg ? "noopener noreferrer" : undefined}
        className={`block text-center px-6 py-3 rounded-full font-bold transition-all ${
          highlight 
            ? 'bg-[#0f4c81] text-white hover:bg-[#0a355c]' 
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        立即查詢
      </a>
    </motion.div>
  );
}

function IndustryCard({ icon: Icon, name }: { icon: any, name: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-xl border border-gray-200 hover:border-[#0f4c81] hover:shadow-lg transition-all text-center group cursor-default"
    >
      <div className="w-12 h-12 mx-auto mb-3 bg-blue-50 rounded-xl flex items-center justify-center text-[#0f4c81] group-hover:bg-[#0f4c81] group-hover:text-white transition-colors">
        <Icon size={24} />
      </div>
      <h4 className="font-bold text-gray-900 text-sm">{name}</h4>
    </motion.div>
  );
}

function RelatedServiceCard({ title, desc, link, icon }: { title: string, desc: string, link: string, icon: string }) {
  return (
    <Link href={link}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -5 }}
        className="bg-white p-6 rounded-xl border border-gray-200 hover:border-[#0f4c81] hover:shadow-lg transition-all group cursor-pointer"
      >
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#0f4c81] transition-colors">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">{desc}</p>
        <div className="flex items-center gap-2 text-[#0f4c81] font-semibold text-sm group-hover:gap-3 transition-all">
          了解更多 <ArrowRight size={16} />
        </div>
      </motion.div>
    </Link>
  );
}

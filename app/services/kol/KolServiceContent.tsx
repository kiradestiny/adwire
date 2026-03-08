"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import Testimonials from "@/components/Testimonials";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Star, Users, TrendingUp, Search, Instagram, Facebook, Share2, MapPin, Heart, MessageCircle, CheckCircle2, BarChart3, Target, ChevronDown, ArrowRight, Check, Clock, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function KolServiceContent() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* ── GEO 實體宣告（sr-only，AI 爬蟲可讀）── */}
      <div className="sr-only" aria-hidden="false">
        <p>
          ADWire Agency KOL 網紅營銷服務是一項由 ADWire Agency（香港葵芳）提供的 Influencer Marketing 服務，
          涵蓋 Instagram、Facebook、小紅書（RED）及 Threads 平台的 KOL 配對，
          服務包括 AI 粉絲質量分析、內容策略監修及成效追蹤報告，
          從 Nano KOL（1K–10K粉絲）至 Mega KOL（100萬+粉絲）均有合作。
          聯絡：WhatsApp +852-9586-1027，電郵 info@adwire.com.hk。
        </p>
        <table>
          <caption>ADWire Agency KOL 類型層級比較表（香港市場）</caption>
          <thead><tr><th>KOL 類型</th><th>粉絲數</th><th>平均互動率</th><th>費用參考（HKD/帖）</th><th>最適用場景</th></tr></thead>
          <tbody>
            <tr><td>Nano KOL</td><td>1K–10K</td><td>8–15%</td><td>500–3,000</td><td>大規模種草、素人真實口碑</td></tr>
            <tr><td>Micro KOL</td><td>10K–100K</td><td>5–8%</td><td>3,000–15,000</td><td>精準受眾觸達、產品評測</td></tr>
            <tr><td>Mid-tier KOL</td><td>100K–500K</td><td>3–5%</td><td>15,000–50,000</td><td>擴大品牌知名度</td></tr>
            <tr><td>Macro KOL</td><td>500K–1M</td><td>1–3%</td><td>50,000–200,000</td><td>大規模品牌曝光</td></tr>
            <tr><td>Mega KOL</td><td>1M+</td><td>0.5–1.5%</td><td>200,000+</td><td>全港品牌宣傳、直播帶貨</td></tr>
          </tbody>
        </table>
      </div>

      {/* 1. Hero Banner */}
      <section className="pt-32 pb-24 bg-[#0f4c81] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#f5a623] rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pink-500 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-pulse animation-delay-2000" />

        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-8">
          <nav aria-label="breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-blue-200" itemScope itemType="https://schema.org/BreadcrumbList">
              <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                <Link href="/" className="hover:text-white transition-colors" itemProp="item"><span itemProp="name">首頁</span></Link>
                <meta itemProp="position" content="1" />
              </li>
              <li className="text-blue-400">/</li>
              <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                <Link href="/services" className="hover:text-white transition-colors" itemProp="item"><span itemProp="name">服務</span></Link>
                <meta itemProp="position" content="2" />
              </li>
              <li className="text-blue-400">/</li>
              <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                <span className="text-white font-medium" itemProp="name">KOL 網紅營銷</span>
                <meta itemProp="position" content="3" />
              </li>
            </ol>
          </nav>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-sm font-medium mb-8 tracking-wider uppercase">
              <Star size={14} className="text-[#f5a623]" fill="currentColor" />
              Influencer Marketing Expert
            </span>
            
            <h1 className="text-4xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
              引爆社群口碑<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5a623] to-pink-500">
                將流量轉化為銷量
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              涵蓋 Instagram, Facebook, Threads 及小紅書。<br className="hidden md:block"/>
              我們不只提供人選，更提供<strong>數據驅動的配對策略</strong>與<strong>高品質內容監修</strong>。
            </p>

            {/* 平台 Icons */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12">
              <PlatformBadge icon={Instagram} label="Instagram" color="hover:text-pink-500" />
              <PlatformBadge icon={Facebook} label="Facebook" color="hover:text-blue-500" />
              <span className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all cursor-default backdrop-blur-sm">
                <span className="font-bold text-lg md:text-xl">@</span> <span className="font-medium text-sm md:text-base">Threads</span>
              </span>
              <span className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all cursor-default backdrop-blur-sm">
                <span className="font-bold text-red-400 text-sm md:text-base">小紅書</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="#contact" className="inline-block bg-[#f5a623] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#e09210] transition-all shadow-lg hover:shadow-[#f5a623]/50 hover:-translate-y-1">
                立即索取 KOL 名單
              </a>
              <a href="#cases" className="inline-block bg-white/10 text-white border border-white/20 px-10 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all backdrop-blur-sm">
                查看成功案例
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Pain Points & Solutions (新增：痛點分析) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f4c81] mb-4">為什麼你的 KOL 廣告無效？</h2>
            <p className="text-gray-500 text-lg">別再浪費預算在「假粉」和「無效曝光」上。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PainPointCard 
              title="粉絲多 ≠ 購買力"
              desc="許多 KOL 擁有數萬粉絲，但互動率極低，甚至充斥著「殭屍粉」。投放這類帳號，只會換來無效的 Like。"
              solution="我們使用 AI 工具分析粉絲真偽與互動質量，確保每一分錢都花在真實受眾上。"
            />
            <PainPointCard 
              title="內容生硬像廣告"
              desc="KOL 只是照稿讀，內容缺乏誠意與個人風格，粉絲一眼識破是廣告，導致反感甚至取關。"
              solution="我們的 Content Team 會與 KOL 共創內容，將品牌訊息自然融入其生活風格，提升說服力。"
            />
            <PainPointCard 
              title="缺乏數據追蹤"
              desc="廣告出街後，只知道 Like 數，卻不知道帶來了多少點擊、查詢或實際訂單，無法計算 ROI。"
              solution="我們提供完整的數據報告，包括 Reach, Engagement, Clicks 甚至 Conversion，讓成效一目了然。"
            />
          </div>
        </div>
      </section>

      {/* 2.5 KOL 層級介紹（GEO 高價值表格 Section）*/}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block py-1 px-4 rounded-full bg-[#f5a623]/10 text-[#f5a623] text-sm font-bold mb-4 tracking-wider uppercase">KOL Tier Guide</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f4c81] mb-4">如何選擇正確的 KOL 層級？</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              粉絲數越多不代表效果越好。ADWire 根據你的目標、預算及行業特性，為你配對最具性價比的 KOL 組合。
            </p>
          </motion.div>

          {/* 視覺化層級卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
            {[
              { tier: "Nano", range: "1K–10K", rate: "8–15%", icon: "🌱", color: "bg-green-50 border-green-200", accent: "text-green-600", badge: "bg-green-100 text-green-700", best: "種草口碑", cost: "HK$500起/帖" },
              { tier: "Micro", range: "10K–100K", rate: "5–8%", icon: "📱", color: "bg-blue-50 border-blue-200", accent: "text-blue-600", badge: "bg-blue-100 text-blue-700", best: "精準觸達", cost: "HK$3,000起/帖" },
              { tier: "Mid-tier", range: "100K–500K", rate: "3–5%", icon: "⭐", color: "bg-purple-50 border-purple-200", accent: "text-purple-600", badge: "bg-purple-100 text-purple-700", best: "品牌知名度", cost: "HK$15,000起/帖" },
              { tier: "Macro", range: "500K–1M", rate: "1–3%", icon: "🏆", color: "bg-orange-50 border-orange-200", accent: "text-orange-600", badge: "bg-orange-100 text-orange-700", best: "大規模曝光", cost: "HK$50,000起/帖" },
              { tier: "Mega", range: "1M+", rate: "0.5–1.5%", icon: "🚀", color: "bg-pink-50 border-pink-200", accent: "text-pink-600", badge: "bg-pink-100 text-pink-700", best: "全港宣傳", cost: "議價" },
            ].map((kol, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className={`p-5 rounded-2xl border-2 ${kol.color} hover:shadow-lg transition-all duration-300`}>
                <div className="text-3xl mb-3">{kol.icon}</div>
                <h3 className={`text-lg font-black mb-1 ${kol.accent}`}>{kol.tier} KOL</h3>
                <div className="text-xs text-gray-500 mb-3">粉絲：{kol.range}</div>
                <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold mb-3 ${kol.badge}`}>互動率 {kol.rate}</div>
                <div className="text-xs font-semibold text-gray-700 mb-1">最適合：{kol.best}</div>
                <div className="text-xs text-gray-500">{kol.cost}</div>
              </motion.div>
            ))}
          </div>

          {/* 隱藏完整對比表（GEO 可索引）*/}
          <div className="overflow-x-auto rounded-2xl shadow-sm border border-gray-200 bg-white">
            <table className="w-full text-sm" aria-label="KOL 層級詳細比較">
              <thead>
                <tr className="bg-[#0f4c81] text-white">
                  <th className="py-4 px-5 text-left font-semibold">KOL 類型</th>
                  <th className="py-4 px-4 text-center font-semibold">粉絲數</th>
                  <th className="py-4 px-4 text-center font-semibold">平均互動率</th>
                  <th className="py-4 px-4 text-center font-semibold">優點</th>
                  <th className="py-4 px-4 text-center font-semibold">最適用場景</th>
                  <th className="py-4 px-4 text-center font-semibold">費用參考 / 帖</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Nano KOL 🌱", "1K–10K", "8–15%", "真實感强、信任度高", "大規模種草、素人口碑行銷", "HK$500–3,000"],
                  ["Micro KOL 📱", "10K–100K", "5–8%", "精準受眾、CP值高", "產品評測、精準行銷", "HK$3,000–15,000"],
                  ["Mid-tier KOL ⭐", "100K–500K", "3–5%", "知名度與互動兼備", "新品發佈、品牌知名度提升", "HK$15,000–50,000"],
                  ["Macro KOL 🏆", "500K–1M", "1–3%", "大規模曝光", "品牌形象塑造、直播帶貨", "HK$50,000–200,000"],
                  ["Mega KOL 🚀", "1M+", "0.5–1.5%", "全港/全球曝光", "品牌大使、年度合作", "議價"],
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    {row.map((cell, j) => (
                      <td key={j} className={`py-3 px-4 text-gray-700 ${j === 0 ? "font-semibold" : "text-center"}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 mb-4 text-sm">唔確定選哪個層級？我們提供免費 KOL 配對諮詢</p>
            <a href={`https://wa.me/85295861027?text=${encodeURIComponent("Hello ADWire，我想了解 KOL 配對方案。")}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#f5a623] hover:bg-[#e09210] text-white font-bold px-6 py-3 rounded-full transition-colors shadow-md hover:shadow-lg">
              免費 KOL 配對諮詢 <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* 3. Job References */}
      <section className="py-24 bg-gray-50" id="cases">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-12">
            <div>
              <span className="text-[#f5a623] font-bold tracking-wider uppercase text-sm">Success Stories</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0f4c81] mt-2">
                精彩案例 Job References
              </h2>
            </div>
            <p className="text-gray-500 mt-4 md:mt-0 max-w-md text-left md:text-right">
              有圖有真相。我們為客戶創造的每一個高光時刻，<br/>從微網紅到頭部 KOL，覆蓋各行各業。
            </p>
          </div>

          {/* Masonry Grid (仿 IG 牆) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[250px]">
            <JobRefCard 
              category="探店打卡" 
              likes="2.4k" 
              comments="128"
              color="from-orange-400 to-red-500" 
              title="Cafe 新店開幕"
              imageSrc="/services/kol/cafe.webp"
              altText="Cafe 新店開幕 - 探店打卡 KOL 案例"
              className="row-span-1"
            />
            <JobRefCard 
              category="美妝試用" 
              likes="1.8k" 
              comments="86"
              color="from-pink-400 to-rose-500" 
              title="Skin Care 開箱"
              imageSrc="/services/kol/skincare.webp"
              altText="Skin Care 開箱 - 美妝試用 KOL 案例"
              className="row-span-1"
            />
            <JobRefCard 
              category="活動出席" 
              likes="5.2k" 
              comments="342"
              color="from-purple-500 to-indigo-500" 
              title="年度發佈會 Event"
              imageSrc="/services/kol/event.webp"
              altText="年度發佈會 Event - 活動出席 KOL 案例"
              className="md:col-span-2 md:row-span-2" // 大格
            />
            <JobRefCard 
              category="小紅書種草" 
              likes="890" 
              comments="45"
              color="from-red-500 to-red-700" 
              title="爆款好物分享"
              imageSrc="/services/kol/product.webp"
              altText="爆款好物分享 - 小紅書種草 KOL 案例"
              className="row-span-1"
            />
            <JobRefCard 
              category="Threads 話題" 
              likes="450" 
              comments="112"
              color="from-gray-700 to-black" 
              title="城中熱話討論"
              imageSrc="/services/kol/threads.webp"
              altText="城中熱話討論 - Threads 話題 KOL 案例"
              className="row-span-1"
            />
            <JobRefCard 
              category="親子育兒" 
              likes="3.1k" 
              comments="203"
              color="from-green-400 to-teal-500" 
              title="親子好去處"
              imageSrc="/services/kol/family.webp"
              altText="親子好去處 - 親子育兒 KOL 案例"
              className="row-span-1"
            />
            <JobRefCard 
              category="科技開箱" 
              likes="1.2k" 
              comments="67"
              color="from-blue-500 to-cyan-500" 
              title="最新 Gadget 評測"
              imageSrc="/services/kol/tech.webp"
              altText="最新 Gadget 評測 - 科技開箱 KOL 案例"
              className="row-span-1"
            />
          </div>
        </div>
      </section>

      {/* 4. 服務場景 (Scenarios) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f4c81] mb-4">
              全方位網紅營銷策略
            </h2>
            <p className="text-gray-500 text-lg">針對不同營銷目標，我們提供量身訂造的 KOL 組合。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ServiceCard 
              title="微網紅種草 (Seeding)"
              desc="利用數十至上百位 Micro-Influencers (粉絲 2k-10k) 進行大規模試用與分享。以真實口碑洗版，建立品牌信任度，性價比極高。"
              tags={["產品試用", "素人真實評價", "量大取勝"]}
              icon={Share2}
              color="bg-green-50 text-green-600"
            />
            <ServiceCard 
              title="大型品牌宣傳 (Branding)"
              desc="與頭部 KOL (Top-tier) 合作，拍攝高質感的形象大片或短視頻。利用其強大號召力，瞬間提升品牌知名度與形象。"
              tags={["形象大片", "直播帶貨", "品牌大使"]}
              icon={Star}
              color="bg-orange-50 text-orange-600"
            />
            <ServiceCard 
              title="線下活動出席 (Events)"
              desc="新店開張、發佈會或 Pop-up Store。邀請 KOL 到場打卡、剪綵，製造現場熱鬧氣氛，吸引粉絲朝聖。"
              tags={["新店探店", "PR Event", "限時動態"]}
              icon={MapPin}
              color="bg-purple-50 text-purple-600"
            />
          </div>
        </div>
      </section>

      {/* 5. Why ADWire? (數據與技術) */}
      <section className="py-24 bg-[#0f4c81] text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#f5a623] font-bold tracking-wider uppercase text-sm mb-2 block">Why Choose Us</span>
              <h2 className="text-4xl font-bold mb-8 leading-tight">拒絕盲目投放。<br/>我們用<span className="text-[#f5a623]">數據</span>選人。</h2>
              <div className="space-y-8">
                <TechPoint 
                  icon={Search}
                  title="AI 受眾分析"
                  desc="KOL 粉絲多唔代表有用。我們分析其粉絲的年齡、性別及真假粉比例，確保你的廣告是給「潛在買家」看。"
                />
                <TechPoint 
                  icon={TrendingUp}
                  title="過往表現追蹤"
                  desc="我們擁有自家數據庫，記錄 KOL 過往合作的 Engagement Rate 及轉化成效，避開「有量無效」的雷區。"
                />
                <TechPoint 
                  icon={Megaphone}
                  title="內容策略監修"
                  desc="我們不只是 Middleman。我們的 Content Team 會協助審稿，確保 KOL 的產出既有個人風格，又符合品牌訊息。"
                />
              </div>
            </div>
            
            {/* 右邊裝飾圖 (模擬數據報表) */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#f5a623] to-pink-500 rounded-2xl blur-lg opacity-30" />
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl relative">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-400" />
                    <div>
                      <div className="w-32 h-4 bg-white/20 rounded mb-2" />
                      <div className="w-20 h-3 bg-white/10 rounded" />
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">
                    High Quality
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>粉絲真實度</span>
                    <span>92%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-[92%] h-full bg-green-500 rounded-full" />
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>受眾重疊率</span>
                    <span>Low</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-[30%] h-full bg-blue-500 rounded-full" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#f5a623]/10 rounded-xl p-4 flex flex-col items-center justify-center border border-[#f5a623]/20">
                    <span className="text-3xl font-bold text-[#f5a623] mb-1">5.8%</span>
                    <span className="text-xs text-gray-300 uppercase tracking-wider">互動率</span>
                  </div>
                  <div className="bg-pink-500/10 rounded-xl p-4 flex flex-col items-center justify-center border border-pink-500/20">
                    <span className="text-3xl font-bold text-pink-400 mb-1">12K</span>
                    <span className="text-xs text-gray-300 uppercase tracking-wider">預估觸及</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 服務流程 */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block py-1 px-4 rounded-full bg-[#0f4c81]/10 text-[#0f4c81] text-sm font-bold mb-4 tracking-wider uppercase">Our Process</span>
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">KOL 合作五步驟</h2>
            <p className="text-gray-500">由策略規劃到成效報告，ADWire 全程跟進。</p>
          </motion.div>
          <div className="relative">
            {/* 連線 */}
            <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-0.5 bg-gray-200 z-0" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
              {[
                { step: "01", icon: "💬", title: "需求簡介", desc: "了解品牌目標、預算、目標受眾及合作形式" },
                { step: "02", icon: "🔍", title: "AI 篩選", desc: "AI 數據分析粉絲真偽、互動率及受眾匹配度" },
                { step: "03", icon: "📋", title: "提案確認", desc: "提交 KOL 名單及內容策略，客戶確認方向" },
                { step: "04", icon: "✅", title: "內容監修", desc: "Content Team 審稿，確保與品牌訊息一致" },
                { step: "05", icon: "📊", title: "成效追蹤", desc: "發佈後提供完整數據報告及優化建議" },
              ].map((p, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-[#0f4c81] text-white flex flex-col items-center justify-center mb-4 shadow-lg border-4 border-white">
                    <span className="text-2xl">{p.icon}</span>
                  </div>
                  <span className="text-xs font-bold text-[#f5a623] mb-1 tracking-wider">STEP {p.step}</span>
                  <h3 className="font-bold text-[#0f4c81] mb-2">{p.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 客戶評價 */}
      <Testimonials />

      {/* 相關服務 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">搭配服務，效果倍增</h2>
            <p className="text-gray-500">KOL 行銷與其他服務配合，全方位提升品牌影響力</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "社交媒體代管", desc: "IG / FB / 小紅書代營運，維持長期品牌熱度", link: "/services/social", icon: "📱" },
              { title: "短片製作", desc: "專業 Reels / 廣告視頻拍攝及剪輯", link: "/services/video", icon: "🎬" },
              { title: "廣告投放", desc: "Meta / Google Ads 精準定向放大 KOL 效果", link: "/services/ads", icon: "📢" },
              { title: "SEO / GEO 優化", desc: "搜尋引擎 + AI 引擎同步提升品牌能見度", link: "/services/seo", icon: "🔍" },
            ].map((s, i) => (
              <Link key={i} href={s.link}>
                <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-xl border border-gray-200 hover:border-[#0f4c81] hover:shadow-lg transition-all group cursor-pointer">
                  <div className="text-4xl mb-4">{s.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#0f4c81] transition-colors">{s.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{s.desc}</p>
                  <div className="flex items-center gap-2 text-[#0f4c81] font-semibold text-sm group-hover:gap-3 transition-all">
                    了解更多 <ArrowRight size={16} />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white" itemScope itemType="https://schema.org/FAQPage" aria-label="KOL 網紅營銷常見問題">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block py-1 px-4 rounded-full bg-[#f5a623]/10 text-[#f5a623] text-sm font-bold mb-4 tracking-wider uppercase">FAQ</span>
            <h2 className="text-3xl font-bold text-[#0f4c81]">KOL 網紅營銷常見問題</h2>
          </div>
          <div className="space-y-3">
            {[
              { q: "香港 KOL 合作費用是多少？", a: "香港 KOL 費用因層級差異甚大：Nano KOL（1K–10K粉絲）約 HK$500–3,000/帖；Micro KOL（10K–100K）約 HK$3,000–15,000；Mid-tier KOL 約 HK$15,000–50,000；Macro / Mega KOL 則按個別議價。ADWire 根據預算制定最高 ROI 的 KOL 組合方案。" },
              { q: "如何選擇適合品牌的 KOL？", a: "選擇 KOL 不能只看粉絲數。重要指標包括：(1) 受眾人口統計與品牌目標客群匹配度；(2) 互動率（Engagement Rate）；(3) 粉絲真偽比例；(4) 過往商業合作的轉化表現。ADWire 使用 AI 工具分析所有指標，為品牌配對最合適的 KOL。" },
              { q: "ADWire 提供哪些 KOL 合作形式？", a: "三大合作形式：(1) Nano KOL 大規模種草 —— 10–100位素人同步發佈，建立有機口碑；(2) 大型品牌宣傳 —— 頭部 KOL 高質感內容，瞬間提升知名度；(3) 線下活動出席 —— KOL 探店、剪綵，製造熱鬧現場氣氛。" },
              { q: "小紅書 KOL 與 Instagram KOL 有什麼分別？", a: "小紅書 KOL 主要觸達中國內地及海外華人（月活 3 億，以內地年輕女性為主），適合香港品牌進入大灣區市場。IG KOL 主要觸達香港本地及全球受眾，視覺化內容吸引力強。兩者組合使用效果最佳。" },
              { q: "KOL 廣告的效果如何衡量？", a: "ADWire 提供完整成效追蹤報告，涵蓋：觸及率（Reach）、觀看次數（Views）、互動率（Engagement Rate）、點擊率（CTR）、網站流量增長及查詢轉換率。透明可追蹤，讓你清楚每分預算的真實 ROI。" },
              { q: "合作一個 KOL 項目需要多長時間？", a: "一般 KOL 項目由 Briefing 到發佈約需 2–4 週：第1週 KOL 篩選，第2週提案確認及接洽，第3週內容創作及審稿，第4週發佈及追蹤。大型品牌活動建議提前 6–8 週規劃。" },
              { q: "什麼行業最適合 KOL 網紅營銷？", a: "KOL 行銷適合幾乎所有 B2C 行業，尤其是：美容護膚（開箱評測）、餐飲 F&B（探店打卡）、時尚服飾（穿搭 Look）、電商零售（好物種草）、旅遊（打卡地點）、母嬰育兒（親子體驗）。" },
            ].map((item, i) => (
              <FAQItem key={i} question={item.q} answer={item.a} index={i} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <p className="text-gray-500 mb-4 text-sm">仲有其他問題？</p>
            <a href={`https://wa.me/85295861027?text=${encodeURIComponent("Hello ADWire，我想查詢 KOL 網紅營銷服務。")}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0f4c81] hover:bg-[#0a355c] text-white font-semibold px-6 py-3 rounded-full transition-colors">
              WhatsApp 直接問我們 <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      <ContactSection defaultService="KOL 網紅營銷" />

      <Footer />
    </main>
  );
}

// --- 小組件 ---

function PlatformBadge({ icon: Icon, label, color }: { icon: any, label: string, color?: string }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all cursor-default backdrop-blur-sm group`}>
      <Icon size={20} className={`transition-colors ${color} md:w-6 md:h-6`} />
      <span className="font-medium text-sm md:text-lg">{label}</span>
    </div>
  );
}

function PainPointCard({ title, desc, solution }: { title: string, desc: string, solution: string }) {
  return (
    <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-all group">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500 shrink-0">
          <Target size={20} />
        </div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-500 mb-6 leading-relaxed border-b border-gray-200 pb-6">
        {desc}
      </p>
      <div className="flex gap-3">
        <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-1" />
        <p className="text-sm text-gray-700 font-medium">{solution}</p>
      </div>
    </div>
  );
}

// 仿 IG Post 卡片
function JobRefCard({ category, likes, comments, color, title, imageSrc, altText, className = "" }: { category: string, likes: string, comments: string, color: string, title: string, imageSrc?: string, altText?: string, className?: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`group relative rounded-2xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 ${className}`}
    >
      {/* 圖片位置 */}
      {imageSrc ? (
        <>
          <Image 
            src={imageSrc} 
            alt={altText || title}
            title={title}
            fill 
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-30 mix-blend-overlay`} />
        </>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${color} group-hover:scale-110 transition-transform duration-700`} />
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
      
      {/* 內容 */}
      <div className="absolute bottom-0 left-0 w-full p-5 text-white z-10">
        <div className="text-[10px] font-bold bg-white/20 backdrop-blur-md px-2 py-1 rounded w-fit mb-2 border border-white/10">
          {category}
        </div>
        <div className="font-bold text-lg mb-2 leading-tight">{title}</div>
        <div className="flex items-center gap-4 text-xs opacity-80 font-medium">
          <span className="flex items-center gap-1.5"><Heart size={14} fill="currentColor" /> {likes}</span>
          <span className="flex items-center gap-1.5"><MessageCircle size={14} fill="currentColor" /> {comments}</span>
        </div>
      </div>
    </motion.div>
  );
}

function ServiceCard({ title, desc, tags, icon: Icon, color }: { title: string, desc: string, tags: string[], icon: any, color: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group hover:-translate-y-1">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${color}`}>
        <Icon size={32} />
      </div>
      <h3 className="text-2xl font-bold text-[#0f4c81] mb-4">{title}</h3>
      <p className="text-gray-500 leading-relaxed mb-8 text-base">{desc}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span key={i} className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg group-hover:bg-[#0f4c81] group-hover:text-white transition-colors">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function TechPoint({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex gap-5 group">
      <div className="flex-shrink-0 w-14 h-14 bg-[#f5a623]/10 rounded-2xl flex items-center justify-center text-[#f5a623] border border-[#f5a623]/20 group-hover:bg-[#f5a623] group-hover:text-white transition-colors duration-300">
        <Icon size={28} />
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2 group-hover:text-[#f5a623] transition-colors">{title}</h3>
        <p className="text-gray-300 text-base leading-relaxed">{desc}</p>
      </div>
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
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-[#f5a623]/40 transition-colors duration-200"
      itemScope itemType="https://schema.org/Question"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-5 py-4 text-left hover:bg-gray-50 transition-colors gap-4 group"
        aria-expanded={isOpen}
      >
        <span itemProp="name" className="font-semibold text-gray-900 text-sm md:text-base group-hover:text-[#0f4c81] transition-colors duration-200">
          {question}
        </span>
        <ChevronDown size={18} className={`text-gray-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#f5a623]" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
            itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer"
          >
            <p itemProp="text" className="px-5 pb-4 pt-3 text-gray-600 text-sm leading-relaxed border-t border-gray-100 bg-gray-50/50">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import Testimonials from "@/components/Testimonials";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  Target, 
  MousePointer2, 
  Filter, 
  ArrowRight, 
  Check, 
  X, 
  Search, 
  Globe, 
  Facebook, 
  Instagram, 
  Youtube, 
  Linkedin, 
  AlertCircle, 
  TrendingUp, 
  PieChart, 
  Settings, 
  Users,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Sparkles,
  Utensils,
  Building2,
  Briefcase,
  Gem,
  DollarSign
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function AdsServiceContent() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── GEO 實體宣告（sr-only）── */}
      <div className="sr-only" aria-hidden="false">
        <p>
          ADWire Agency 成效廣告投放服務是一項由 ADWire Agency（香港葵芳）提供的 Performance Marketing 服務，
          涵蓋 Meta（Facebook / Instagram）、Google Search（SEM）、YouTube 及 LinkedIn 廣告代操，
          平均廣告回報率（ROAS）達 8.5 倍，CPA 獲客成本降低 45%。
          代操費用：入門方案 HK$2,000/月起，進階方案 HK$6,000/月起。
          聯絡：WhatsApp +852-9586-1027，電郵 info@adwire.com.hk。
        </p>
        <table>
          <caption>ADWire Agency 成效廣告代操服務方案比較</caption>
          <thead><tr><th>方案</th><th>代操費（HKD/月）</th><th>廣告預算範圍</th><th>管理平台</th><th>適合對象</th></tr></thead>
          <tbody>
            <tr><td>入門方案</td><td>HK$2,000</td><td>HK$5,000–15,000</td><td>Meta 或 Google（單一）</td><td>剛開始投放廣告的品牌</td></tr>
            <tr><td>進階方案</td><td>HK$6,000</td><td>HK$15,000–50,000</td><td>Meta + Google（雙平台）</td><td>有成效廣告基礎的成長企業</td></tr>
            <tr><td>企業方案</td><td>度身定制</td><td>HK$50,000+</td><td>Meta/Google/YouTube/LinkedIn</td><td>大型品牌及多平台管理</td></tr>
          </tbody>
        </table>
        <table>
          <caption>ADWire 成效廣告平均成效指標</caption>
          <thead><tr><th>指標</th><th>數值</th></tr></thead>
          <tbody>
            <tr><td>平均廣告回報率（ROAS）</td><td>8.5倍</td></tr>
            <tr><td>CPA 降低幅度</td><td>平均 45%</td></tr>
            <tr><td>月訂單增長（案例）</td><td>+280 個</td></tr>
            <tr><td>服務平台</td><td>Meta（FB/IG）、Google Ads、YouTube、LinkedIn</td></tr>
          </tbody>
        </table>
      </div>

      {/* 1. Hero Banner（全新設計）*/}
      <section className="pt-28 pb-0 bg-[#0b1628] text-white relative overflow-hidden">
        {/* 背景光暈 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[5%] w-[500px] h-[500px] bg-blue-600/20 rounded-full filter blur-[130px]" />
          <div className="absolute bottom-[0%] left-[10%] w-[400px] h-[400px] bg-[#f5a623]/10 rounded-full filter blur-[100px]" />
          <div className="absolute top-[30%] left-[-5%] w-[300px] h-[300px] bg-green-500/10 rounded-full filter blur-[100px]" />
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
                <span className="text-white" itemProp="name">成效廣告投放</span>
                <meta itemProp="position" content="3" />
              </li>
            </ol>
          </nav>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pb-16">

            {/* Left: Text Content */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-[#f5a623] text-xs font-bold mb-6 tracking-[0.2em] uppercase backdrop-blur-sm">
                <BarChart3 size={14} /> Performance Marketing Expert
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                每投 $1 廣告費<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5a623] to-orange-300">
                  讓它帶回 $8.5
                </span>
              </h1>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                涵蓋 <strong className="text-white">Meta（FB/IG）、Google Ads、YouTube 及 LinkedIn</strong>。<br className="hidden md:block" />
                我們不只幫你買廣告，更利用 A/B Testing 與 Pixel 追蹤，<br className="hidden md:block" />
                將每一分預算轉化為<span className="text-[#f5a623] font-semibold">可量化的真實生意</span>。
              </p>

              {/* Key Metrics Pills */}
              <div className="flex flex-wrap gap-3 mb-8">
                {[
                  { icon: TrendingUp, value: "8.5×", label: "平均 ROAS" },
                  { icon: PieChart, value: "-45%", label: "CPA 降低" },
                  { icon: Users, value: "100+", label: "服務客戶" },
                ].map((m, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <m.icon size={14} className="text-[#f5a623]" />
                    <span className="text-white font-bold text-sm">{m.value}</span>
                    <span className="text-gray-400 text-xs">{m.label}</span>
                  </div>
                ))}
              </div>

              {/* Platform Badges */}
              <div className="flex flex-wrap gap-2 mb-8">
                {[
                  { label: "Meta Ads", color: "border-blue-400/40 text-blue-300" },
                  { label: "Google Ads", color: "border-yellow-400/40 text-yellow-300" },
                  { label: "YouTube", color: "border-red-400/40 text-red-300" },
                  { label: "LinkedIn", color: "border-sky-400/40 text-sky-300" },
                ].map((p, i) => (
                  <span key={i} className={`px-3 py-1 rounded-full border text-xs font-semibold backdrop-blur-sm ${p.color}`}>
                    {p.label}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`https://wa.me/85295861027?text=${encodeURIComponent("Hello ADWire, 我想預約專業的廣告帳戶諮詢。")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#f5a623] hover:bg-[#e09210] text-white font-bold px-8 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-[#f5a623]/30 hover:-translate-y-0.5"
                >
                  免費廣告帳戶診斷 <ArrowRight size={18} />
                </a>
                <Link
                  href="/portfolio/beauty-ads-roas"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-full transition-all duration-200 backdrop-blur-sm"
                >
                  查看真實成效案例 <BarChart3 size={18} />
                </Link>
              </div>
            </motion.div>

            {/* Right: Performance Dashboard */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-[#f5a623]/20 rounded-3xl blur-xl" />

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-2xl relative">
                {/* Dashboard Header */}
                <div className="bg-white/5 border-b border-white/10 px-5 py-3 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs text-gray-400 font-mono">ADWire Performance Dashboard</span>
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Live
                  </span>
                </div>

                <div className="p-6">
                  {/* ROAS Hero Number */}
                  <div className="text-center mb-6 pb-6 border-b border-white/10">
                    <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">本月廣告回報率（ROAS）</div>
                    <div className="text-6xl font-black text-green-400 mb-1">8.5<span className="text-3xl">×</span></div>
                    <div className="flex items-center justify-center gap-1 text-green-400 text-sm">
                      <TrendingUp size={14} /> <span>較上月 +23%</span>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { label: "廣告花費", val: "$12,450", col: "text-gray-200" },
                      { label: "轉換次數", val: "385", col: "text-gray-200" },
                      { label: "獲客成本", val: "$32.3", col: "text-blue-300" },
                    ].map((s, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-3 text-center">
                        <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">{s.label}</div>
                        <div className={`text-base font-bold ${s.col}`}>{s.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Platform Performance Bars */}
                  <div className="space-y-3">
                    {[
                      { name: "Meta Ads (FB/IG)", pct: 92, color: "bg-blue-500", roas: "9.2×" },
                      { name: "Google Search", pct: 85, color: "bg-yellow-500", roas: "8.1×" },
                      { name: "YouTube Ads", pct: 68, color: "bg-red-500", roas: "6.5×" },
                      { name: "LinkedIn Ads", pct: 55, color: "bg-sky-500", roas: "5.2×" },
                    ].map((p, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{p.name}</span>
                          <span className="text-green-400 font-semibold">{p.roas}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${p.pct}%` }}
                            transition={{ delay: 0.8 + i * 0.1, duration: 0.8 }}
                            className={`h-full rounded-full ${p.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-4 bg-green-500 text-white px-4 py-2 rounded-2xl shadow-lg text-sm font-bold"
              >
                ✓ ROAS 8.5× 實證
              </motion.div>
            </motion.div>

          </div>
        </div>

        {/* Wave connector */}
        <div className="w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" className="block w-full">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* 2. Pain Points: 為什麼你的廣告效果不好？ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">為什麼你的廣告總是「只燒錢，沒生意」？</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              很多企業投放廣告後發現效果不似預期，通常是因為跌入了以下這三個常見陷阱。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PainPointCard 
              icon={Target}
              title="受眾設定太廣泛"
              desc="沒有精準鎖定目標客群，將預算浪費在對你產品完全沒興趣的人身上，導致點擊率低，獲客成本高。"
            />
            <PainPointCard 
              icon={MousePointer2}
              title="素材缺乏吸引力"
              desc="廣告圖或影片無法在 3 秒內抓住眼球，內容過於平淡或 Hard Sell，導致用戶直接滑過，沒有互動。"
            />
            <PainPointCard 
              icon={BarChart3}
              title="缺乏數據追蹤"
              desc="沒有正確安裝 Pixel 或 Conversion API，無法追蹤用戶在網站的行為，導致無法進行再營銷 (Retargeting) 和優化。"
            />
          </div>
        </div>
      </section>

      {/* 3. 模擬廣告後台 (The "Wow" Section) */}
      <section className="py-20 bg-[#0f4c81] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* 左邊：文字賣點 */}
            <div className="text-white">
              <h2 className="text-3xl font-bold mb-6">我們看重的是<br/>ROAS (廣告投資回報)</h2>
              <p className="text-gray-300 mb-8 text-lg">
                很多 Agency 只會報告「曝光數 (Reach)」，但曝光不能當飯吃。ADWire 專注於你看得見的業績：
              </p>
              <div className="space-y-6">
                <MetricRow label="CPA" subLabel="(獲客成本)" desc="持續優化，以最低成本獲取一個客。" />
                <MetricRow label="CVR" subLabel="(轉化率)" desc="優化 Landing Page，提升訪客購買意欲。" />
                <MetricRow label="ROAS" subLabel="(回報率)" desc="確保每投放 $1，能帶回 $3-$10 的生意。" />
              </div>
            </div>

            {/* 右邊：模擬 Dashboard UI */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-xl shadow-2xl border border-white/10 overflow-hidden"
            >
              {/* Dashboard Header */}
              <div className="bg-gray-50 border-b border-gray-100 p-4 flex justify-between items-center">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="text-xs text-gray-400 font-mono">ADWire Ads Manager</div>
              </div>
              
              {/* Dashboard Content */}
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <StatBox label="花費金額" val="$12,450" color="text-gray-800" />
                  <StatBox label="轉換次數" val="385" color="text-gray-800" />
                  <StatBox label="ROAS" val="8.5x" color="text-green-500" isHighlight />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-gray-400 px-2">
                    <span>Campaign Name</span>
                    <span>Status</span>
                  </div>
                  <CampaignRow name="🔥 Q1 春季新品推廣 - Set A" status="Active" roas="4.2" trend="up" />
                  <CampaignRow name="🎯 再營銷 (Retargeting) - Cart" status="Active" roas="8.5" trend="up" />
                  <CampaignRow name="❌ 舊客回購 (測試版)" status="Paused" roas="1.1" trend="down" />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 4. 我們的廣告策略 (Funnel & AB Test) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81]">不只是「落廣告」，更是「做策略」</h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
              盲目投放只會浪費預算。我們運用系統化的策略，確保廣告預算花在刀口上。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Strategy 1: Funnel */}
            <StrategyCard 
              icon={Filter}
              title="銷售漏斗 (Sales Funnel)"
              desc="我們不會對陌生人直接 Hard Sell。我們設計分層廣告：先用短片吸客 (Awareness)，再用優惠券轉化 (Conversion)，最後用電郵再營銷 (Retention)。"
            />
            {/* Strategy 2: Targeting */}
            <StrategyCard 
              icon={Target}
              title="精準受眾鎖定"
              desc="除了年齡性別，我們利用 Lookalike Audience (類似受眾) 功能，幫你找出「跟現有客人最似」的潛在新客，命中率極高。"
            />
            {/* Strategy 3: A/B Testing */}
            <StrategyCard 
              icon={MousePointer2}
              title="A/B Testing 測試"
              desc="圖片定影片好？長文定短文好？唔使估。我們會同時投放多組廣告素材，讓數據告訴我們哪一組最賺錢，然後集中預算。"
            />
          </div>
        </div>
      </section>

      {/* 5. 全方位平台覆蓋 (Platforms) */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">全方位平台覆蓋</h2>
            <p className="text-gray-500">針對不同行業與目標，選擇最合適的廣告渠道</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Meta Ads */}
            <PlatformCard 
              icon={Facebook}
              color="blue"
              title="Meta Ads (FB/IG)"
              desc="主動出擊。適合講求視覺效果、需要激發購買慾的產品 (如美妝、飲食、時尚)。利用大數據主動將產品推到潛在客眼前。"
              features={["精準興趣標籤 targeting", "Instagram Reels 短片廣告", "Lead Form 收集名單"]}
            />

            {/* Google Ads */}
            <PlatformCard 
              icon={Search}
              color="orange"
              title="Google Search (SEM)"
              desc="被動攔截。當客戶主動搜尋你的服務時 (如「通渠」、「會計」)，確保你的網站出現在第一位。轉化意欲最高。"
              features={["關鍵字競價策略", "Google Shopping 購物廣告", "高意向客戶攔截"]}
            />

            {/* YouTube Ads */}
            <PlatformCard 
              icon={Youtube}
              color="red"
              title="YouTube Video Ads"
              desc="品牌曝光。利用影片廣告在 YouTube 影片播放前或中間展示，適合需要詳細解說或建立品牌形象的產品。"
              features={["TrueView 插播廣告", "影片再營銷", "品牌知名度提升"]}
            />

            {/* LinkedIn Ads */}
            <PlatformCard 
              icon={Linkedin}
              color="sky"
              title="LinkedIn Ads (B2B)"
              desc="專業人脈。專攻 B2B 市場，精準鎖定特定職位、公司規模或行業的決策者，是尋找商業合作夥伴的最佳渠道。"
              features={["職位/公司鎖定", "InMail 訊息廣告", "高質素 B2B Leads"]}
            />

          </div>
        </div>
      </section>

      {/* 6. 服務流程 (Process) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">ADWire 廣告優化 5 步曲</h2>
            <p className="text-gray-500">從診斷到擴量，我們為你處理所有繁瑣細節</p>
          </div>

          <div className="relative">
            {/* 連接線 (Desktop only) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10 -translate-y-1/2" />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              <ProcessStep number="01" title="帳戶診斷" desc="分析過往數據，找出成效不佳的原因與漏洞。" />
              <ProcessStep number="02" title="策略制定" desc="確定目標受眾、預算分配及選擇合適平台。" />
              <ProcessStep number="03" title="設定與製作" desc="安裝 Pixel 追蹤，製作吸睛圖片/影片素材。" />
              <ProcessStep number="04" title="持續優化" desc="每日監察數據，進行 A/B Test，剔除蝕錢廣告。" />
              <ProcessStep number="05" title="報告與擴量" desc="定期匯報成效，將盈利模式複製擴大 (Scaling)。" />
            </div>
          </div>
        </div>
      </section>

      {/* 7. [NEW] 成功案例 - Success Stories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-green-100 text-green-600 text-sm font-bold mb-4 tracking-widest uppercase">
              Success Stories
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">真實廣告成效數據</h2>
            <p className="text-gray-500">看看我們如何幫助不同行業的客戶突破廣告瓶頸，提升 ROAS</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CaseStudyCard 
              industry="美容護膚品牌"
              title="ROAS 從 2.1 提升至 8.5"
              desc="透過受眾優化和 Lookalike Audience，成功降低 CPA 60%，同時提升轉換率。"
              metric="8.5x"
              metricLabel="廣告回報率"
              icon={Sparkles}
              color="from-pink-500 to-rose-500"
            />
            <CaseStudyCard 
              industry="電商零售"
              title="獲客成本下降 45%"
              desc="運用 A/B Testing 找出最佳素材組合，搭配再營銷策略，大幅降低 CPA。"
              metric="-45%"
              metricLabel="CPA 降低"
              icon={ShoppingCart}
              color="from-blue-500 to-cyan-500"
            />
            <CaseStudyCard 
              industry="餐飲連鎖"
              title="每月新增 280+ 訂單"
              desc="利用 Google Search + Meta Ads 雙管齊下，成功將網上流量轉化為實體訂單。"
              metric="+280"
              metricLabel="月訂單增長"
              icon={Utensils}
              color="from-orange-500 to-red-500"
            />
          </div>
        </div>
      </section>

      {/* 8. [NEW] 服務方案 - Service Packages */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">靈活方案，適合不同預算</h2>
            <p className="text-gray-500">根據你的廣告預算和目標，選擇最合適的服務方案</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PackageCard 
              name="入門方案"
              price="HK$2,000"
              period="/ 月"
              description="適合剛開始投放廣告的品牌"
              features={[
                "單一平台 (Meta 或 Google)",
                "每月廣告預算 $5K-$15K",
                "基本素材製作",
                "月度成效報告",
                "Email 支援"
              ]}
              highlight={false}
              whatsappMsg="Hello ADWire, 我想查詢成效廣告投放的【入門方案】(HK$2,000/月)。"
            />
            <PackageCard 
              name="進階方案"
              price="HK$6,000"
              period="/ 月"
              description="最多客戶選擇"
              features={[
                "雙平台 (Meta + Google)",
                "每月廣告預算 $15K-$50K",
                "A/B Testing 優化",
                "Pixel 安裝與追蹤",
                "Landing Page 建議",
                "每週數據報告",
                "WhatsApp 支援"
              ]}
              highlight={true}
              badge="最受歡迎"
              whatsappMsg="Hello ADWire, 我想查詢成效廣告投放的【進階方案】(HK$6,000/月)。"
            />
            <PackageCard 
              name="企業方案"
              price="Custom"
              period="/ 月"
              description="適合大型品牌"
              features={[
                "多平台管理 (Meta/Google/YouTube/LinkedIn)",
                "每月廣告預算 $50K+",
                "進階受眾策略",
                "專業影片素材製作",
                "專屬客戶經理",
                "即時優化與擴量 (Scaling)",
                "整合 CRM 與數據分析"
              ]}
              highlight={false}
              whatsappMsg="Hello ADWire, 我想查詢成效廣告投放的【企業方案】(Custom)。"
            />
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-500 mb-6">不確定哪個方案適合你？讓我們為你提供專業的廣告帳戶諮詢。</p>
            <a 
              href={`https://wa.me/85295861027?text=${encodeURIComponent("Hello ADWire, 我想預約專業的廣告帳戶諮詢。")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0f4c81] text-white px-8 py-4 rounded-full font-bold hover:bg-[#0a355c] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              專業帳戶諮詢 <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </section>

      {/* 9. [NEW] 適合行業 - Industries We Serve */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">我們服務的行業</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">擁有豐富的跨行業廣告投放經驗，深入了解不同市場的轉換策略</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <IndustryCard icon={Sparkles} name="美容護膚" />
            <IndustryCard icon={Utensils} name="餐飲 F&B" />
            <IndustryCard icon={ShoppingCart} name="電商零售" />
            <IndustryCard icon={Gem} name="珠寶時尚" />
            <IndustryCard icon={Briefcase} name="專業服務" />
            <IndustryCard icon={Building2} name="地產物業" />
          </div>
          
          <div className="mt-12 bg-blue-50 border border-blue-100 p-8 rounded-2xl text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-3">看不到你的行業？</h3>
            <p className="text-gray-600 mb-6">我們服務超過 30+ 不同行業，無論你做什麼生意，我們都能為你制定合適的廣告策略。</p>
            <a href="#contact" className="inline-flex items-center gap-2 bg-[#0f4c81] text-white px-6 py-3 rounded-full font-bold hover:bg-[#0a355c] transition-all">
              聯絡我們 <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* 10. [NEW] 客戶評價 */}
      <Testimonials />

      {/* 11. [NEW] 相關服務 - Related Services */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">搭配服務，效果更佳</h2>
            <p className="text-gray-500">廣告投放只是開始，配合其他服務，全方位提升轉換率</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <RelatedServiceCard 
              title="SEO 優化"
              desc="自然搜尋排名，長期穩定流量"
              link="/services/seo"
              icon="🔍"
            />
            <RelatedServiceCard 
              title="網站設計"
              desc="高轉換 Landing Page 設計"
              link="/services/web"
              icon="💻"
            />
            <RelatedServiceCard 
              title="短片製作"
              desc="專業廣告素材製作"
              link="/services/video"
              icon="🎬"
            />
            <RelatedServiceCard 
              title="社交媒體"
              desc="IG/FB 內容經營與廣告配合"
              link="/services/social"
              icon="📱"
            />
          </div>
        </div>
      </section>

      {/* 12. 常見問題 FAQ */}
      <section
        className="py-20 bg-white"
        aria-label="成效廣告投放常見問題"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block py-1 px-4 rounded-full bg-blue-100 text-blue-600 text-sm font-bold mb-4 tracking-wider uppercase">FAQ</span>
            <h2 className="text-3xl font-bold text-[#0f4c81]">廣告投放常見問題</h2>
          </div>
          <div className="space-y-3">
            <FAQItem question="香港廣告代操費用是多少？" answer="ADWire 廣告代操分三方案：入門方案 HK$2,000/月（單一平台，廣告預算 HK$5K–15K）；進階方案 HK$6,000/月（Meta + Google 雙平台，廣告預算 HK$15K–50K）；企業方案度身定制（多平台，廣告預算 HK$50K+）。代操費不含廣告媒體費用（Media Buy）。" />
            <FAQItem question="廣告代投需要最低多少廣告預算？" answer="一般建議每月最少 HK$5,000–8,000 媒體預算（Media Buy），確保有足夠數據進行機器學習和優化。預算越充足，優化速度越快。ADWire 入門方案支援 HK$5,000–15,000/月廣告預算。" />
            <FAQItem question="什麼是 ROAS？ROAS 多少才算好？" answer="ROAS（廣告投資回報率）= 廣告帶來收入 ÷ 廣告費用。行業均值 2–4x，ADWire 管理的帳戶平均 ROAS 達 8.5x，部分電商客戶高達 12x。ROAS 高低受行業、產品定價及受眾設定影響。" />
            <FAQItem question="投放廣告後多久會見效？" answer="Google Search 廣告通常 1–2 週見初步成效。Meta（FB/IG）需約 2–4 週「學習期（Learning Phase）」讓系統尋找最佳受眾。ADWire 持續優化以縮短學習期，一般 1 個月後可達穩定成效。" />
            <FAQItem question="Facebook 和 Google 廣告，我應該選哪個？" answer="「剛需」服務（如維修、急用）選 Google Search，因為客戶主動搜尋你。「衝動消費」或「新奇產品」（如服飾、美妝）選 Facebook/IG 主動推播效果更佳。ADWire 通常建議兩者配合，形成完整銷售漏斗。" />
            <FAQItem question="ADWire 如何追蹤廣告轉換效果？" answer="ADWire 提供完整轉換追蹤設置：Meta Pixel 安裝、Conversions API 設定（提高 iOS 隱私限制下的追蹤準確度）、Google Analytics 4 整合、Google Tag Manager 設置及電商購買事件追蹤。確保每分廣告費都能對應真實銷售成效。" />
            <FAQItem question="你們會幫忙製作廣告圖片或影片嗎？" answer="會。ADWire 服務包含廣告素材建議和基本製作。如需專業影片拍攝或進階動態素材，我們的 Production 團隊可提供獨立影片製作服務（需另外報價）。高質素素材是提升 CTR 及降低 CPM 的關鍵。" />
            <FAQItem question="ADWire 廣告代操與其他 Agency 有什麼分別？" answer="ADWire 不只執行廣告，更重視數據分析與策略優化。每日監察廣告表現，即時剔除蝕錢廣告，持續 A/B Testing 找最佳素材組合。以透明 ROAS 及 CPA 指標衡量所有成效，月度報告清晰展示每分廣告費回報。" />
          </div>
          <div className="mt-10 text-center">
            <p className="text-gray-500 mb-4 text-sm">仲有其他問題？</p>
            <a
              href={`https://wa.me/85295861027?text=${encodeURIComponent("Hello ADWire，我想查詢成效廣告投放服務。")}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0f4c81] hover:bg-[#0a355c] text-white font-semibold px-6 py-3 rounded-full transition-colors"
            >
              WhatsApp 直接問我們 <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0f4c81] text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">準備好提升你的廣告回報率了嗎？</h2>
          <p className="text-xl text-blue-100 mb-10">
            立即預約專業諮詢，讓我們為你診斷現有廣告帳戶，找出流失的生意。
          </p>
          <a 
            href={`https://wa.me/85295861027?text=${encodeURIComponent("Hello ADWire, 我想預約專業的廣告帳戶諮詢。")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#f5a623] text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-[#e09612] transition-all shadow-lg"
          >
            立即開始專業諮詢
          </a>
        </div>
      </section>

      <ContactSection defaultService="成效廣告投放" />
      <Footer />
    </main>
  );
}

// --- 小組件 ---

function MetricRow({ label, subLabel, desc }: { label: string, subLabel: string, desc: string }) {
  return (
    <div className="flex gap-4 items-start border-l-2 border-white/20 pl-4">
      <div className="shrink-0 w-24">
        <div className="text-[#f5a623] font-bold text-xl">{label}</div>
        <div className="text-xs text-gray-400">{subLabel}</div>
      </div>
      <div className="text-gray-300 text-sm pt-1">{desc}</div>
    </div>
  );
}

function StatBox({ label, val, color, isHighlight = false }: { label: string, val: string, color: string, isHighlight?: boolean }) {
  return (
    <div className={`p-4 rounded-lg text-center ${isHighlight ? 'bg-green-50 border border-green-100' : 'bg-gray-50'}`}>
      <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{val}</div>
    </div>
  );
}

function CampaignRow({ name, status, roas, trend }: { name: string, status: string, roas: string, trend: "up" | "down" }) {
  const isActive = status === "Active";
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
        <div>
          <div className={`text-sm font-medium ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>{name}</div>
          <div className="text-xs text-gray-400">ROAS: {roas}</div>
        </div>
      </div>
      <div className={`text-xs font-bold px-2 py-1 rounded ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
        {status}
      </div>
    </div>
  );
}

function StrategyCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-xl transition-all group">
      <div className="w-16 h-16 bg-[#0f4c81]/5 rounded-full flex items-center justify-center mx-auto mb-6 text-[#0f4c81] group-hover:bg-[#0f4c81] group-hover:text-white transition-colors">
        <Icon size={32} />
      </div>
      <h3 className="text-xl font-bold text-[#0f4c81] mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}

function PainPointCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:border-red-100 transition-colors">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-red-50 text-red-500 rounded-lg">
          <Icon size={24} />
        </div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function PlatformCard({ icon: Icon, color, title, desc, features }: { icon: any, color: string, title: string, desc: string, features: string[] }) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
    sky: "bg-sky-50 text-sky-600",
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 items-start hover:shadow-md transition-shadow">
      <div className={`p-4 rounded-xl ${colorClasses[color] || 'bg-gray-100 text-gray-600'}`}>
        <Icon size={32} />
      </div>
      <div>
        <h3 className="text-xl font-bold text-[#0f4c81] mb-3">{title}</h3>
        <p className="text-gray-500 mb-4 text-sm leading-relaxed">
          {desc}
        </p>
        <ul className="text-sm text-gray-600 space-y-2">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <Check size={14} className="text-green-500 shrink-0" /> 
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ProcessStep({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="relative bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center z-10">
      <div className="text-4xl font-bold text-gray-100 mb-4">{number}</div>
      <h3 className="text-lg font-bold text-[#0f4c81] mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-blue-200 transition-colors duration-200"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors gap-4 group"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-[#0f4c81] text-sm md:text-base group-hover:text-[#f5a623] transition-colors duration-200">
          {question}
        </span>
        <ChevronDown size={18} className={`text-gray-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#f5a623]" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="faq-ans"
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
    </div>
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

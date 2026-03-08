"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import Testimonials from "@/components/Testimonials";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Heart, Calendar, PenTool,
  BarChart2, Users, CheckCircle2, XCircle,
  TrendingUp, Zap, Target, HelpCircle, ChevronDown,
  Search, MousePointerClick, Sparkles, Building2, ShoppingCart,
  Utensils, Briefcase, Gem, Check, ArrowRight, Globe2,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

// ─── 平台資料 ────────────────────────────────────────────────────────────────
const PLATFORMS = [
  {
    id: "instagram",
    name: "Instagram",
    tag: "IG",
    tagline: "視覺主導 · 年輕市場首選",
    gradientClass: "from-pink-500 via-purple-500 to-orange-400",
    lightBg: "bg-pink-50",
    border: "border-pink-200",
    accent: "text-pink-600",
    badgeClass: "bg-pink-100 text-pink-700",
    users: "20億+",
    region: "全球",
    audience: "18–35 歲年輕族群，女性偏多，偏好美容、時尚、生活方式及旅遊",
    strengths: [
      "Reels 自然觸及是普通 Feed Post 的 3–5 倍，爆紅機率更高",
      "IG Shop 功能直接將瀏覽者轉化為買家，縮短購買路徑",
      "統一的視覺 Feed 風格建立強烈的品牌辨識度",
      "Story 24 小時限時策略：製造稀缺感刺激即時訂單",
    ],
    contentTypes: ["Feed Post", "Reels 短視頻", "Stories 動態", "Carousel 圖集", "IG Live 直播"],
    bestFor: "美容護膚、時尚服飾、餐飲、旅遊體驗、電商零售",
    approach: "透過統一視覺系統（Color Palette + Typography）建立品牌一致性，以 Reels 為核心突破演算法觸及限制，並用 IG Shop 商品標籤功能直接帶動銷售。每月 Insight Report 追蹤最佳發布時間及互動率，持續優化內容策略。",
  },
  {
    id: "facebook",
    name: "Facebook",
    tag: "FB",
    tagline: "深度互動 · 成熟市場必備",
    gradientClass: "from-blue-600 to-blue-400",
    lightBg: "bg-blue-50",
    border: "border-blue-200",
    accent: "text-blue-600",
    badgeClass: "bg-blue-100 text-blue-700",
    users: "30億+",
    region: "香港、大灣區、東南亞",
    audience: "25–55 歲廣泛人群，涵蓋企業主、家庭主婦、中產專業人士",
    strengths: [
      "香港 Facebook 活躍用戶滲透率超 90%，幾乎人人有帳號",
      "社團 (Groups) 功能建立深度品牌社群，提升忠誠度",
      "廣告系統最成熟，支援最精準的受眾定向",
      "活動 (Events) 功能輕鬆推廣線下及線上活動",
    ],
    contentTypes: ["圖文貼文", "影片及直播 Live", "Groups 社群帖子", "Events 活動推廣", "Reels 短視頻"],
    bestFor: "專業服務、醫療健康、地產、餐飲、金融貸款、B2B 企業",
    approach: "針對 Facebook 演算法優化貼文格式（問答、投票、分享型內容互動率更高），同步建立 Facebook Group 作為品牌忠實用戶社群。Organic 內容與廣告系統整合，用自然貼文測試受眾反應後，再放大至付費廣告投放。",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    tag: "LI",
    tagline: "B2B 品牌建立 · 攻高端客戶",
    gradientClass: "from-blue-900 to-blue-700",
    lightBg: "bg-indigo-50",
    border: "border-indigo-200",
    accent: "text-indigo-700",
    badgeClass: "bg-indigo-100 text-indigo-700",
    users: "10億+",
    region: "全球企業市場",
    audience: "企業決策者、CEO / CFO、採購主任、HR 及各行業專業人士",
    strengths: [
      "精準觸及 B2B 決策者，潛在客戶質素遠高於其他平台",
      "Thought Leadership 內容建立行業專家形象及公信力",
      "提升公司品牌及個人品牌（個人 LinkedIn 頁面）雙軌發展",
      "招聘及雇主品牌（Employer Branding）效果顯著",
    ],
    contentTypes: ["行業洞察文章", "企業動態及里程碑", "Thought Leadership 帖子", "招聘 / 職位分享", "LinkedIn Live"],
    bestFor: "B2B 服務、科技公司、金融機構、教育培訓、顧問諮詢、人力資源",
    approach: "定期撰寫有深度的行業洞察及成功案例內容，建立「行業專家」定位。同時優化公司頁面 SEO，確保潛在合作夥伴搜尋相關關鍵字時能找到你。長期而言是 B2B 大客戶開發的最高性價比渠道。",
  },
  {
    id: "xiaohongshu",
    name: "小紅書",
    englishName: "RED / Xiaohongshu",
    tag: "RED",
    tagline: "進軍內地市場的黃金入口",
    gradientClass: "from-red-600 to-rose-400",
    lightBg: "bg-red-50",
    border: "border-red-200",
    accent: "text-red-600",
    badgeClass: "bg-red-100 text-red-700",
    users: "3億+",
    region: "中國內地 + 海外華人",
    audience: "18–35 歲女性為主，內地一二線城市用戶，港澳台及海外華人為輔",
    strengths: [
      "月活 3 億，「種草文化」帶來強烈的主動購買意圖",
      "香港品牌在內地享有「港貨品質」天然信任光環",
      "內容電商閉環：發現→種草→收藏→購買一站完成",
      "搜尋驅動平台：用戶主動搜尋產品評測，非被動消費廣告",
    ],
    contentTypes: ["種草筆記（圖文）", "短視頻 Vlog", "打卡帖子", "產品測評 / 開箱", "直播帶貨"],
    bestFor: "美容護膚、時尚、旅遊、美食、母嬰、香港本地品牌（進軍內地市場）",
    approach: "撰寫符合小紅書「種草」語境的筆記（非廣告腔調），配合精準標籤策略提升搜尋曝光，建立真實品牌口碑。確保內容合規，協助香港品牌安全、有效地進入大灣區及內地市場。",
    isRedBook: true,
  },
  {
    id: "threads",
    name: "Threads",
    tag: "TH",
    tagline: "新世代對話平台 · 搶灘先機",
    gradientClass: "from-gray-900 to-gray-700",
    lightBg: "bg-gray-50",
    border: "border-gray-200",
    accent: "text-gray-700",
    badgeClass: "bg-gray-100 text-gray-700",
    users: "2億+",
    region: "全球，亞太區增長迅速",
    audience: "25–40 歲，以 IG 用戶為主要族群，科技友好型消費者及意見領袖",
    strengths: [
      "與 IG 帳號直連，零成本遷移，粉絲自動導入",
      "平台仍處增長早期，現在入場有競爭先發優勢",
      "演算法較 IG/FB 開放，新帳號更易獲得自然觸及",
      "文字主導格式，適合展現品牌個性及聲音",
    ],
    contentTypes: ["短文字帖子（500字）", "互動討論串", "品牌故事及心聲", "意見領袖分享", "時事評論"],
    bestFor: "媒體、科技、時尚消費品牌，適合想建立品牌聲音及個性的企業",
    approach: "以 IG + Threads 雙軌策略運作，以最低額外成本擴大品牌覆蓋面。Threads 的輕鬆、真誠語氣與 IG 的精緻視覺形成互補，在平台新用戶大量湧入的窗口期搶佔品牌位置。",
  },
];

// ─── Main Component ──────────────────────────────────────────────────────────
export default function SocialServiceContent() {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentDate(new Date());
  }, []);

  const displayDate = mounted
    ? currentDate.toLocaleString("en-US", { month: "long", year: "numeric" })
    : "October 2025";

  const firstDayOfMonth = mounted
    ? new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
    : 3;

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* ── GEO 實體宣告（純 screen-reader，AI 爬蟲可讀，用戶不可見）── */}
      <div className="sr-only" aria-hidden="false">
        <p>
          ADWire Agency 社交媒體代管服務是一項由 ADWire Agency（香港葵芳）提供的 Social Media Management 服務，
          管理平台包括 Instagram、Facebook、LinkedIn、小紅書及 Threads。服務內容涵蓋每月內容企劃、視覺設計、
          Reels 製作、社群互動管理及數據分析報告。基礎方案 HK$8,000/月起。
          聯絡：WhatsApp +852-9586-1027，電郵 info@adwire.com.hk。
        </p>
        <table>
          <caption>ADWire Agency 社交媒體代管服務方案比較</caption>
          <thead><tr><th>方案</th><th>月費</th><th>Feed Post 數</th><th>Reels</th><th>適合對象</th></tr></thead>
          <tbody>
            <tr><td>基礎方案</td><td>HK$8,000</td><td>8–10 個</td><td>不包含</td><td>剛起步品牌</td></tr>
            <tr><td>進階方案</td><td>HK$15,000</td><td>12–15 個</td><td>2 條</td><td>成長期品牌（最受歡迎）</td></tr>
            <tr><td>全方位方案</td><td>度身定制</td><td>20+ 個</td><td>4 條</td><td>大型品牌 / 多平台管理</td></tr>
          </tbody>
        </table>
        <table>
          <caption>ADWire 五大社交媒體平台覆蓋比較</caption>
          <thead><tr><th>平台</th><th>月活用戶</th><th>主要受眾</th><th>適合行業</th></tr></thead>
          <tbody>
            <tr><td>Instagram (IG)</td><td>20億+</td><td>18–35 歲年輕族群</td><td>美容、時尚、餐飲、電商</td></tr>
            <tr><td>Facebook (FB)</td><td>30億+</td><td>25–55 歲廣泛人群</td><td>專業服務、醫療、地產、B2B</td></tr>
            <tr><td>LinkedIn</td><td>10億+</td><td>企業決策者、高管</td><td>B2B、科技、金融、諮詢</td></tr>
            <tr><td>小紅書 (RED)</td><td>3億+</td><td>18–35 歲女性，內地用戶</td><td>美容、時尚、旅遊、香港品牌進內地</td></tr>
            <tr><td>Threads</td><td>2億+</td><td>25–40 歲 IG 延伸用戶</td><td>媒體、科技、消費品牌</td></tr>
          </tbody>
        </table>
      </div>

      {/* ── 1. Hero Banner（全新設計）── */}
      <section className="pt-28 pb-0 bg-[#0b1628] text-white relative overflow-hidden">
        {/* 背景光暈 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/20 rounded-full filter blur-[120px]" />
          <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-pink-600/15 rounded-full filter blur-[100px]" />
          <div className="absolute bottom-[0%] left-[5%] w-[350px] h-[350px] bg-purple-600/15 rounded-full filter blur-[100px]" />
        </div>

        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-10">
          <nav aria-label="breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-gray-400" itemScope itemType="https://schema.org/BreadcrumbList">
              <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                <Link href="/" className="hover:text-white transition-colors" itemProp="item">
                  <span itemProp="name">首頁</span>
                </Link>
                <meta itemProp="position" content="1" />
              </li>
              <li className="text-gray-600">/</li>
              <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                <Link href="/services" className="hover:text-white transition-colors" itemProp="item">
                  <span itemProp="name">服務</span>
                </Link>
                <meta itemProp="position" content="2" />
              </li>
              <li className="text-gray-600">/</li>
              <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                <span className="text-white" itemProp="name">社交媒體代管</span>
                <meta itemProp="position" content="3" />
              </li>
            </ol>
          </nav>
        </div>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pb-16">

            {/* Left */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-pink-400 text-xs font-bold mb-6 tracking-[0.2em] uppercase backdrop-blur-sm">
                Social Media Management
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                讓每一個 Post<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-[#f5a623]">
                  都成為你的銷售員
                </span>
              </h1>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                管理<strong className="text-white">五大平台</strong>——Instagram、Facebook、LinkedIn、小紅書及 Threads。<br className="hidden md:block" />
                由內容企劃、視覺設計到社群互動，讓品牌全網稱霸，<br className="hidden md:block" />
                <span className="text-pink-300 font-semibold">將流量轉化為真實生意。</span>
              </p>
              {/* Platform Badges */}
              <div className="flex flex-wrap gap-2 mb-8">
                {["Instagram", "Facebook", "LinkedIn", "小紅書", "Threads"].map((p, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs font-semibold text-gray-200 backdrop-blur-sm">
                    {p}
                  </span>
                ))}
              </div>
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`https://wa.me/85295861027?text=${encodeURIComponent("Hello ADWire, 我想預約社交媒體代管服務諮詢。")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold px-8 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-pink-500/30 hover:-translate-y-0.5"
                >
                  免費諮詢 <MessageCircle size={18} />
                </a>
                <a
                  href="#platforms"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-full transition-all duration-200 backdrop-blur-sm"
                >
                  查看平台詳情 <ChevronDown size={18} />
                </a>
              </div>
            </motion.div>

            {/* Right: Metrics Dashboard */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">客戶平均成效</h3>
                  <span className="text-xs text-green-400 bg-green-400/20 px-2 py-1 rounded-full">▲ 持續增長</span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "粉絲增長", value: "+500%", sub: "3個月平均", color: "text-pink-400" },
                    { label: "互動率", value: "8.2%", sub: "行業均值 1.4%", color: "text-purple-400" },
                    { label: "業績轉化", value: "+3×", sub: "社媒帶動訂單", color: "text-[#f5a623]" },
                  ].map((m, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }} className="bg-white/10 rounded-2xl p-4 text-center">
                      <div className={`text-2xl font-black mb-1 ${m.color}`}>{m.value}</div>
                      <div className="text-xs text-white font-semibold mb-0.5">{m.label}</div>
                      <div className="text-[10px] text-gray-400">{m.sub}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Instagram", pct: 92, color: "bg-gradient-to-r from-pink-500 to-purple-500" },
                    { name: "Facebook", pct: 85, color: "bg-blue-500" },
                    { name: "小紅書", pct: 78, color: "bg-red-500" },
                    { name: "LinkedIn", pct: 70, color: "bg-indigo-600" },
                    { name: "Threads", pct: 62, color: "bg-gray-500" },
                  ].map((p, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{p.name}</span><span>{p.pct}%</span>
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
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 bg-gradient-to-br from-[#f5a623] to-orange-500 text-white px-4 py-2 rounded-2xl shadow-lg text-sm font-bold"
              >
                100+ 品牌信賴 ⭐
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

      {/* ── 2. 痛點分析 ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">你是否面臨這些社群經營困境？</h2>
            <p className="text-gray-500">很多老闆都想做 Social Media，但往往力不從心...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PainPointCard icon={XCircle} title="有 Like 冇單？" desc="Post 好多人 Like，但網站無人買嘢？因為缺乏轉換策略，未能將流量變現。" />
            <PainPointCard icon={HelpCircle} title="唔知寫咩好？" desc="每日都要諗出咩 Post，諗到頭都爆？缺乏靈感，內容千篇一律，粉絲睇到悶。" />
            <PainPointCard icon={Search} title="觸及率極低？" desc="辛辛苦苦整圖寫文，結果得幾十個人睇到？唔識演算法規則，做死都無用。" />
            <PainPointCard icon={Users} title="無時間管理？" desc="又要覆 Inbox，又要搞設計，又要諗橋？一個人做唔晒，請人又難教。" />
          </div>
        </div>
      </section>

      {/* ── 3. 核心服務四大支柱 ── */}
      <section id="process" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">一站式社群代管服務</h2>
            <p className="text-gray-500">我們不只是小編，更是你的品牌行銷顧問。</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon={PenTool} title="內容企劃 (Content)" desc="拒絕流水帳。我們撰寫有共鳴的文案，結合時事熱話 (Trend Jacking)，讓你的 Post 更有話題性。" />
            <FeatureCard icon={Users} title="視覺設計 (Design)" desc="美感是基本。製作統一風格的 Feed 圖、Reels 封面及 Story 素材，提升品牌質感。" />
            <FeatureCard icon={MessageCircle} title="社群管理 (Community)" desc="秒回是關鍵。代你回覆 Inbox 及留言，解決客人疑問，將查詢轉化為訂單。" />
            <FeatureCard icon={BarChart2} title="數據分析 (Analytics)" desc="每月提供 Insight Report，分析最佳內容，持續優化策略，確保預算花得其所。" />
          </div>
        </div>
      </section>

      {/* ── 4. 五大平台深度介紹 ── */}
      <section id="platforms" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="inline-block py-1 px-4 rounded-full bg-[#0f4c81]/10 text-[#0f4c81] text-sm font-bold mb-4 tracking-wider uppercase">
              Platform Expertise
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f4c81] mb-4">五大平台 · 全方位覆蓋</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              不同平台有不同受眾、算法及內容策略。ADWire 針對每個平台制定專屬方案，確保你的品牌在每個渠道都能發揮最大效益。
            </p>
          </motion.div>

          {/* Platform Accordion Cards */}
          <div className="space-y-4">
            {PLATFORMS.map((platform, idx) => (
              <PlatformAccordion
                key={platform.id}
                platform={platform}
                index={idx}
                isExpanded={expandedPlatform === platform.id}
                onToggle={() => setExpandedPlatform(expandedPlatform === platform.id ? null : platform.id)}
              />
            ))}
          </div>

          {/* 小紅書 特別強調：內地市場攻略 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mt-16 bg-gradient-to-br from-red-600 to-rose-700 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 text-xs font-bold mb-6 tracking-wider">
                  📕 小紅書 × 內地市場策略
                </div>
                <h3 className="text-2xl md:text-3xl font-black mb-4 leading-tight">
                  想打入中國內地市場？<br />
                  <span className="text-yellow-300">小紅書是香港品牌不可忽視的入口</span>
                </h3>
                <p className="text-red-100 text-base leading-relaxed mb-6">
                  小紅書（RED）月活用戶超過 <strong className="text-white">3 億</strong>，以年輕女性消費者為主，
                  「種草文化」讓用戶主動搜尋商品推薦並購買，消費意圖遠高於其他平台。
                  對於香港品牌而言，<strong className="text-white">「港貨」在內地擁有天然的品質信任光環</strong>，
                  是進入大灣區市場的絕佳跳板。
                </p>
                <a
                  href={`https://wa.me/85295861027?text=${encodeURIComponent("Hello ADWire，我想了解小紅書代管及進內地市場的策略。")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-red-600 font-bold px-6 py-3 rounded-full hover:bg-red-50 transition-colors"
                >
                  了解小紅書代管方案 <ArrowRight size={16} />
                </a>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: "平台規則複雜，需要專業導航",
                    desc: "小紅書內容審核嚴格，廣告與有機內容需符合平台語境，一旦違規帳號將被限流甚至封禁。ADWire 熟悉平台規則，確保每篇筆記都能安全通過審核。",
                  },
                  {
                    title: "語言文化差異，港內溝通有別",
                    desc: "廣東話文案對內地用戶效果有限。我們撰寫符合內地用戶語境的普通話文案，同時保留香港品牌的獨特魅力，精準打動目標受眾。",
                  },
                  {
                    title: "合規操作，助香港品牌安全進入",
                    desc: "內地平台涉及廣告法規、產品認證等合規要求，香港公司自行操作風險極高。ADWire 作為你的在港代理，以合規方式幫你有效進入這片巨大市場。",
                  },
                ].map((item, i) => (
                  <div key={i} className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                    <h4 className="font-bold text-white mb-1.5 text-sm flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-yellow-300 flex-shrink-0" />
                      {item.title}
                    </h4>
                    <p className="text-red-100 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 5. 內容日曆 ── */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold mb-4">
                <Calendar size={14} /> 更有條理
              </div>
              <h2 className="text-3xl font-bold text-[#0f4c81] mb-6">有計劃，才有效率。<br />專屬 Content Calendar。</h2>
              <p className="text-gray-500 mb-8 text-lg leading-relaxed">
                我們不會等到最後一刻才諗出咩 Post。我們提前一個月規劃好整月內容排程，確保：
              </p>
              <ul className="space-y-4">
                <CheckItem text="配合節日與推廣活動 (e.g. 雙11, 聖誕)" />
                <CheckItem text="內容多樣化 (產品 / 知識 / 軟性分享)" />
                <CheckItem text="固定發布頻率，維持演算法熱度" />
                <CheckItem text="預留彈性空間，隨時加入突發熱話 (Trend Jacking)" />
              </ul>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
            >
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2 text-[#0f4c81] font-bold text-lg">
                  <Calendar size={24} /> {displayDate}
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-4 text-center text-xs text-gray-400 font-bold uppercase">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`e-${i}`} className="aspect-square bg-gray-50 rounded-lg" />
                ))}
                <CalendarDay day="01" color="bg-purple-100 text-purple-600" label="新品預告" />
                <div className="aspect-square bg-gray-50 rounded-lg" />
                <CalendarDay day="03" color="bg-blue-100 text-blue-600" label="知識分享" />
                <div className="aspect-square bg-gray-50 rounded-lg" />
                <CalendarDay day="05" color="bg-orange-100 text-orange-600" label="限時優惠" />
                <CalendarDay day="06" color="bg-pink-100 text-pink-600" label="好評合集" />
                <div className="aspect-square bg-gray-50 rounded-lg" />
                <div className="aspect-square bg-gray-50 rounded-lg" />
                <CalendarDay day="09" color="bg-purple-100 text-purple-600" label="日常 Vlog" />
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={`f-${i}`} className="aspect-square bg-gray-50 rounded-lg" />
                ))}
              </div>
              <div className="mt-6 flex gap-4 text-xs text-gray-500 justify-center">
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-purple-400 rounded-full" /> Reels</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-400 rounded-full" /> Feed Post</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-400 rounded-full" /> Story</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 6. 社群管理 ── */}
      <section className="py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-50" />
              <div className="relative space-y-4">
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white p-4 rounded-2xl rounded-tl-none max-w-sm mr-auto shadow-sm border border-gray-100">
                  <p className="text-gray-700 text-sm">請問呢個產品敏感肌用唔用得？同埋送貨要幾耐？🤔</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="bg-[#0f4c81] text-white p-4 rounded-2xl rounded-tr-none max-w-sm ml-auto shadow-lg">
                  <p className="text-sm">Hello! 👋 絕對可以呀，我哋成分好溫和～<br />現貨大約 2-3 日就會送到上門 🚚。而家仲有 9 折優惠添，要唔要 send 條 link 俾你？</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 1.5 }} className="bg-white p-4 rounded-2xl rounded-tl-none max-w-sm mr-auto flex items-center gap-2 shadow-sm border border-gray-100">
                  <Heart size={16} className="text-red-500 fill-current" />
                  <p className="text-gray-700 text-sm">好呀！唔該晒小編！😍</p>
                </motion.div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-bold mb-4">
                <MessageCircle size={14} /> 提升轉換
              </div>
              <h2 className="text-3xl font-bold text-[#0f4c81] mb-6">用心回覆，<br />是最高性價比的行銷。</h2>
              <p className="text-gray-500 mb-8 text-lg leading-relaxed">
                每一個留言、每一個 Inbox 都是生意的機會。我們的小編團隊用最貼地、親切的語氣與粉絲互動，建立像朋友一樣的關係。
              </p>
              <div className="bg-orange-50 border border-orange-100 p-6 rounded-xl">
                <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2"><Zap size={18} /> 為什麼這很重要？</h4>
                <p className="text-orange-700 text-sm">
                  回覆速度越快，Facebook/IG 演算法會判定你的專頁越活躍，從而給予更多自然曝光。及時的客服能大幅提升下單率。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. 為什麼選擇 ADWire ── */}
      <section className="py-20 bg-[#0f4c81] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">為什麼選擇 ADWire？</h2>
            <p className="text-blue-200">我們不只懂做圖，更懂做生意。</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <WhyUsCard icon={Target} title="結果導向" desc="我們關注的不只是 Like 數，更是轉換率。所有內容策略都以「幫助客戶達成商業目標」為核心。" />
            <WhyUsCard icon={MousePointerClick} title="全方位支援" desc="由文案、設計、影片剪輯到廣告投放，完整的 In-house 團隊，無需外判，溝通更順暢。" />
            <WhyUsCard icon={TrendingUp} title="數據驅動" desc="拒絕憑感覺做事。依賴數據分析優化每一個 Post，確保每一分預算都花在刀口上。" />
          </div>
        </div>
      </section>

      {/* ── 8. 成功案例 ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-green-100 text-green-600 text-sm font-bold mb-4 tracking-widest uppercase">Success Stories</span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">真實案例分享</h2>
            <p className="text-gray-500">看看我們如何幫助不同行業的品牌在社交媒體上取得成功</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CaseStudyCard industry="美容護膚" title="IG 追蹤者 3 個月增長 500%" desc="透過精心策劃的 Reels 內容和 KOL 合作，成功將小眾品牌推向大眾市場。" metric="+2.5萬" metricLabel="新增粉絲" icon={Sparkles} color="from-pink-500 to-rose-500" />
            <CaseStudyCard industry="餐飲 F&B" title="每月訂座量提升 80%" desc="運用 Story 互動遊戲與限時優惠，成功將線上流量轉化為實際訂座。" metric="80%" metricLabel="訂座增長" icon={Utensils} color="from-orange-500 to-red-500" />
            <CaseStudyCard industry="電商零售" title="IG Shop 月營業額破百萬" desc="優化產品目錄展示，配合 UGC 內容策略，大幅提升購買轉換率。" metric="HK$1.2M" metricLabel="月營業額" icon={ShoppingCart} color="from-blue-500 to-cyan-500" />
          </div>
        </div>
      </section>

      {/* ── 9. 服務方案 ── */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">靈活方案，適合不同需求</h2>
            <p className="text-gray-500">無論你是初創還是成熟企業，我們都有適合你的方案</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PackageCard name="基礎方案" price="HK$8,000" period="/ 月" description="適合剛起步的品牌" features={["每月 8-10 個 Feed Post", "基本文案撰寫", "視覺設計 (靜態圖)", "月度數據報告"]} highlight={false} whatsappMsg="Hello ADWire, 我想查詢社交媒體管理的【基礎方案】(HK$8,000/月)。" />
            <PackageCard name="進階方案" price="HK$15,000" period="/ 月" description="最多客戶選擇" features={["每月 12-15 個 Feed Post", "2 條 Reels 短片", "專業文案 + 視覺設計", "Story 內容企劃", "詳細數據分析 + 策略優化"]} highlight={true} badge="最受歡迎" whatsappMsg="Hello ADWire, 我想查詢社交媒體管理的【進階方案】(HK$15,000/月)。" />
            <PackageCard name="全方位方案" price="Custom" period="/ 月" description="適合大型品牌" features={["20+ Feed Post + 4 Reels", "包含 KOL 合作策劃", "多平台管理 (IG/FB/小紅書)", "專屬客戶經理", "進階數據分析 + A/B Testing", "整合廣告投放服務"]} highlight={false} whatsappMsg="Hello ADWire, 我想查詢社交媒體管理的【全方位方案】(Custom)。" />
          </div>
          <div className="mt-12 text-center">
            <p className="text-gray-500 mb-6">不確定哪個方案適合你？讓我們的團隊為你度身訂造。</p>
            <a href={`https://wa.me/85295861027?text=${encodeURIComponent("Hello ADWire, 我想預約社交媒體管理諮詢。")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#0f4c81] text-white px-8 py-4 rounded-full font-bold hover:bg-[#0a355c] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              專業諮詢 <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </section>

      {/* ── 10. 適合行業 ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">我們服務的行業</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">擁有豐富的跨行業經驗，深入了解不同市場的社群經營策略</p>
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
            <p className="text-gray-600 mb-6">我們服務超過 50+ 不同行業，無論你做什麼生意，我們都能為你制定合適的社群策略。</p>
            <a href="#contact" className="inline-flex items-center gap-2 bg-[#0f4c81] text-white px-6 py-3 rounded-full font-bold hover:bg-[#0a355c] transition-all">
              聯絡我們 <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* ── 11. 客戶評價 ── */}
      <Testimonials />

      {/* ── 12. 相關服務 ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">搭配服務，效果更佳</h2>
            <p className="text-gray-500">Social Media 只是開始，配合其他服務，全方位提升品牌競爭力</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <RelatedServiceCard title="KOL 行銷" desc="與網紅合作，擴大品牌曝光" link="/services/kol" icon="👥" />
            <RelatedServiceCard title="短片製作" desc="專業 Reels/TikTok 影片拍攝" link="/services/video" icon="🎬" />
            <RelatedServiceCard title="廣告投放" desc="Facebook/IG Ads 精準投放" link="/services/ads" icon="📢" />
            <RelatedServiceCard title="SEO / GEO" desc="搜尋引擎 + AI 引擎優化排名" link="/services/seo" icon="🔍" />
          </div>
        </div>
      </section>

      {/* ── 13. FAQ ── */}
      <section
        className="py-20 bg-white"
        itemScope
        itemType="https://schema.org/FAQPage"
        aria-label="社交媒體代管常見問題"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block py-1 px-4 rounded-full bg-pink-100 text-pink-600 text-sm font-bold mb-4 tracking-wider uppercase">FAQ</span>
            <h2 className="text-3xl font-bold text-gray-900">社交媒體代管常見問題</h2>
          </div>
          <div className="space-y-4">
            <FAQItem question="香港社交媒體代管服務收費是多少？" answer="ADWire 提供三個方案：基礎方案 HK$8,000/月（8–10 個 Feed Post）、進階方案 HK$15,000/月（12–15 個 Feed Post + 2 條 Reels）、及全方位方案（Custom 定制）。可 WhatsApp 聯絡索取詳細報價。" />
            <FAQItem question="ADWire 社交媒體代管包含哪些服務？" answer="涵蓋四大範疇：(1) 內容企劃 —— 每月制定 Content Calendar，撰寫有共鳴的文案；(2) 視覺設計 —— Feed 圖、Reels 封面及 Story 素材；(3) 社群管理 —— 代回覆 Inbox 及留言，將查詢轉化為訂單；(4) 數據分析 —— 每月 Insight Report 持續優化策略。" />
            <FAQItem question="ADWire 管理哪些社交媒體平台？" answer="主要管理五大平台：Instagram（IG）、Facebook 專頁、LinkedIn、小紅書（RED）及 Threads。我們會根據你的目標客群及行業，建議最適合的平台組合。" />
            <FAQItem question="社交媒體代管需要簽長約嗎？" answer="一般建議至少合作 3–6 個月，因為社群經營需要時間累積效果。ADWire 亦提供試用方案，讓客戶先體驗服務質素。無強制長期合約。" />
            <FAQItem question="我需要提供什麼素材給 ADWire？" answer="ADWire 可安排攝影師上門拍攝產品或場地（視乎方案）。你只需提供基本產品資訊和品牌指引（Brand Guidelines）。若有現成素材，我們亦可加工使用。" />
            <FAQItem question="社交媒體代管服務包含廣告投放嗎？" answer="社交媒體代管主要負責自然觸及（Organic）的內容經營。如需廣告投放（Paid Ads），ADWire 提供獨立的 Meta / Google Ads 代操服務，兩者配合效果最佳。" />
            <FAQItem question="如何評估社交媒體代管的效果？" answer="ADWire 每月提供詳細 Insight Report，追蹤觸及率（Reach）、互動率（Engagement Rate）、粉絲增長及查詢轉換率。我們以商業目標（訂單數、查詢量）而非單純 Like 數衡量成效。" />
            <FAQItem question="為什麼要找代理公司管理社交媒體，而不是自己做？" answer="自行管理需投入大量時間：每日構思內容、製作圖片、回覆留言及分析數據，中小企業往往力不從心。ADWire 擁有專業的內容策略師、設計師及社群管理員，配合 AI 工具，能以更低成本達到更專業效果，讓你的團隊專注於核心業務。" />
          </div>
          <div className="mt-10 text-center">
            <p className="text-gray-500 mb-4 text-sm">仲有其他問題？</p>
            <a
              href={`https://wa.me/85295861027?text=${encodeURIComponent("Hello ADWire，我想查詢社交媒體代管服務。")}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0f4c81] hover:bg-[#0a355c] text-white font-semibold px-6 py-3 rounded-full transition-colors duration-200"
            >
              WhatsApp 直接問我們 <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      <ContactSection defaultService="社交媒體管理" />
      <Footer />
    </main>
  );
}

// ─── 子組件 ──────────────────────────────────────────────────────────────────

function PlatformAccordion({
  platform, index, isExpanded, onToggle,
}: {
  platform: typeof PLATFORMS[0];
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className={`rounded-2xl border-2 overflow-hidden bg-white transition-colors duration-300 ${isExpanded ? platform.border : "border-gray-200"}`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left group"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.gradientClass} flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm`}>
            {platform.tag}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#0f4c81] transition-colors">
                {platform.name}
              </h3>
              {"englishName" in platform && (
                <span className="text-xs text-gray-400 font-normal hidden sm:inline">{(platform as any).englishName}</span>
              )}
              {"isRedBook" in platform && (platform as any).isRedBook && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">🔥 內地市場</span>
              )}
            </div>
            <p className={`text-sm font-medium ${platform.accent}`}>{platform.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          <div className="hidden md:flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${platform.badgeClass}`}>
              {platform.users}
            </span>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="platform-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className={`${platform.lightBg} border-t ${platform.border} p-6 md:p-8`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${platform.accent} mb-2`}>目標受眾</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{platform.audience}</p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                    <Globe2 size={12} /> 覆蓋地區：{platform.region}
                  </div>
                </div>
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${platform.accent} mb-2`}>內容類型</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {platform.contentTypes.map((ct, i) => (
                      <span key={i} className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 shadow-sm">{ct}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${platform.accent} mb-2`}>最適合行業</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{platform.bestFor}</p>
                </div>
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${platform.accent} mb-2`}>平台核心優勢</h4>
                  <ul className="space-y-1.5">
                    {platform.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 size={13} className="text-green-500 flex-shrink-0 mt-0.5" />{s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:col-span-2">
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${platform.accent} mb-2`}>ADWire 代管策略</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{platform.approach}</p>
                  <a
                    href={`https://wa.me/85295861027?text=${encodeURIComponent(`Hello ADWire，我想了解 ${platform.name} 代管服務。`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 mt-4 bg-gradient-to-r ${platform.gradientClass} text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity shadow-sm`}
                  >
                    查詢 {platform.name} 代管方案 <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="bg-gray-50 p-8 rounded-2xl hover:bg-white hover:shadow-xl transition-all border border-gray-100 group">
      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#0f4c81] mb-6 group-hover:bg-[#0f4c81] group-hover:text-white transition-colors">
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-bold text-[#0f4c81] mb-3">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function PainPointCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-center gap-3 mb-4">
        <Icon size={24} className="text-red-500" />
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function WhyUsCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="bg-[#0a355c] p-8 rounded-2xl border border-blue-800/30">
      <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-300 mb-6">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-blue-200 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-gray-700 font-medium">
      <CheckCircle2 size={20} className="text-green-500 shrink-0" />{text}
    </li>
  );
}

function CalendarDay({ day, color, label }: { day: string; color: string; label: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      className={`aspect-square rounded-lg p-2 flex flex-col justify-between cursor-default transition-shadow hover:shadow-md ${color}`}
    >
      <span className="text-xs font-bold opacity-50">{day}</span>
      <div className="text-[10px] font-bold leading-tight line-clamp-2">{label}</div>
    </motion.div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-pink-200 transition-colors duration-200"
      itemScope itemType="https://schema.org/Question"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-5 py-4 text-left hover:bg-gray-50 transition-colors gap-4 group"
        aria-expanded={isOpen}
      >
        <span itemProp="name" className="font-semibold text-gray-900 text-sm md:text-base group-hover:text-pink-600 transition-colors duration-200">
          {question}
        </span>
        <ChevronDown size={18} className={`text-gray-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-pink-500" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="faq-answer"
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
    </div>
  );
}

function CaseStudyCard({ industry, title, desc, metric, metricLabel, icon: Icon, color }: {
  industry: string; title: string; desc: string; metric: string; metricLabel: string; icon: any; color: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all group">
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
  name: string; price: string; period: string; description: string; features: string[]; highlight: boolean; badge?: string; whatsappMsg?: string;
}) {
  const whatsappUrl = `https://wa.me/85295861027?text=${encodeURIComponent(whatsappMsg || "")}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative bg-white p-8 rounded-2xl border-2 transition-all hover:shadow-2xl ${highlight ? "border-[#0f4c81] shadow-xl scale-105" : "border-gray-200"}`}
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
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
            <Check size={18} className="text-green-500 shrink-0 mt-0.5" /><span>{feature}</span>
          </li>
        ))}
      </ul>
      <a
        href={whatsappMsg ? whatsappUrl : "#contact"}
        target={whatsappMsg ? "_blank" : undefined}
        rel={whatsappMsg ? "noopener noreferrer" : undefined}
        className={`block text-center px-6 py-3 rounded-full font-bold transition-all ${highlight ? "bg-[#0f4c81] text-white hover:bg-[#0a355c]" : "bg-gray-100 text-gray-900 hover:bg-gray-200"}`}
      >
        立即查詢
      </a>
    </motion.div>
  );
}

function IndustryCard({ icon: Icon, name }: { icon: any; name: string }) {
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

function RelatedServiceCard({ title, desc, link, icon }: { title: string; desc: string; link: string; icon: string }) {
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

"use client";

import { motion } from "framer-motion";
import { 
  Cloud, 
  Cpu, 
  Globe, 
  CreditCard, 
  Server, 
  Bot, 
  ShoppingBag, 
  Wrench,
  Database,
  Zap,
  Share2,
  Code,
  Users,
  ArrowRight
} from "lucide-react";

// 定義合作夥伴數據結構
const partnerCategories = [
  {
    title: "AI 核心技術與模型",
    outcome: "AI 客服輔助、文件處理、內容草稿：同一件事，人手時間更短。",
    description: "整合全球頂尖 LLM 模型，驅動智能內容生成與決策分析",
    icon: Cpu,
    color: "text-purple-600",
    bg: "bg-purple-100",
    border: "group-hover:border-purple-200",
    partners: [
      "OpenAI ChatGPT",
      "Anthropic Claude",
      "Google Gemini",
      "Meta Llama",
      "Midjourney",
      "Stable Diffusion"
    ]
  },
  {
    title: "智能自動化營銷",
    outcome: "查詢、跟進、提醒自動按流程執行，唔使靠人記。",
    description: "透過 MarTech 工具實現 24/7 自動化營銷流程與客戶跟進",
    icon: Bot,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    border: "group-hover:border-indigo-200",
    partners: [
      "n8n Workflow",
      "Make (Integromat)",
      "Zapier AI",
      "Wati WhatsApp API",
      "HubSpot CRM",
      "Klaviyo AI"
    ]
  },
  {
    title: "數據分析與雲端基建",
    outcome: "網站同系統快、穩、安全，每個數據都追蹤得到。",
    description: "穩固的企業級架構，確保數據安全與極速訪問體驗",
    icon: Cloud,
    color: "text-blue-600",
    bg: "bg-blue-100",
    border: "group-hover:border-blue-200",
    partners: [
      "Google Cloud Platform",
      "AWS Infrastructure",
      "Cloudflare Security",
      "Vercel Edge",
      "Google Analytics 4",
      "Microsoft Azure"
    ]
  },
  {
    title: "全渠道營銷生態",
    outcome: "廣告、社交媒體同網店數據打通，預算用得其所。",
    description: "覆蓋主流社交與電商平台，精準觸達目標客群",
    icon: Globe,
    color: "text-pink-600",
    bg: "bg-pink-100",
    border: "group-hover:border-pink-200",
    partners: [
      "Meta Business Suite",
      "Google Ads Expert",
      "TikTok for Business",
      "Shopify Plus",
      "Stripe Payments",
      "Salesforce"
    ]
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const TEAM_ROLES = ["策略顧問", "工程師", "內容及設計", "數據分析"];

function CategoryCard({ category, side }: { category: (typeof partnerCategories)[number]; side: "left" | "right" }) {
  return (
    <motion.div
      variants={item} data-mobile-visible="true"
      whileHover={{ y: -5 }}
      className={`relative group bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 ${category.border}`}
    >
      {/* 連去中間團隊嘅數據流（桌面） */}
      <div aria-hidden="true" className={`hidden lg:block absolute top-1/2 ${side === "left" ? "-right-12" : "-left-12"} w-12 h-px bg-gradient-to-r from-[#0f4c81]/10 via-[#f5a623]/60 to-[#0f4c81]/10 overflow-visible`}>
        <span className={`absolute -top-[3px] w-1.5 h-1.5 rounded-full bg-[#f5a623] shadow-[0_0_8px_#f5a623] motion-safe:animate-[adw-flow_1.8s_linear_infinite] ${side === "left" ? "" : "[animation-direction:reverse]"}`} />
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${category.bg} ${category.color} group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
          <category.icon size={22} />
        </div>
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-[#0f4c81] transition-colors">
          {category.title}
        </h3>
      </div>
      <p className="text-[15px] font-semibold text-gray-800 leading-relaxed mb-1">
        <span className="text-[#f5a623]">幫你做到：</span>{category.outcome}
      </p>
      <p className="text-gray-500 text-sm mb-4 leading-relaxed">
        {category.description}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {category.partners.map((partner, pIdx) => (
          <span
            key={pIdx}
            className="px-2.5 py-1 bg-gray-50 rounded-md text-xs font-medium text-gray-600 border border-gray-100 group-hover:border-gray-200 transition-colors cursor-default flex items-center gap-1.5"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${category.bg.replace('100', '400')}`}></span>
            {partner}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default function Partners() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div data-mobile-glow="true" aria-hidden="true" className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>
      <div data-mobile-glow="true" aria-hidden="true" className="absolute right-0 bottom-0 -z-10 h-[310px] w-[310px] rounded-full bg-purple-400 opacity-20 blur-[100px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }} data-mobile-visible="true"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#0f4c81] text-xs font-bold mb-4">
              <Zap size={12} className="fill-current" />
              <span>FUTURE-READY TECH STACK</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-5xl mb-6 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0f4c81] via-blue-600 to-purple-600">
                AI 驅動的全球技術生態系統
              </span>
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
              你唔需要識技術。你面對的是 ADWire 專業團隊；團隊背後有一整套 AI 模型與 MarTech 工具，
              為你的品牌構建自動化、數據化、智能化的增長引擎，更快、更穩陣咁做到結果。
            </p>
          </motion.div>
        </div>

        {/* 你 → 團隊 → 工具 */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-12 text-sm font-semibold">
          <span className="rounded-full bg-gray-100 text-gray-700 px-4 py-2">你：講清楚業務目標</span>
          <ArrowRight size={16} className="text-[#f5a623]" />
          <span className="rounded-full bg-[#0f4c81] text-white px-4 py-2">ADWire 團隊：策略、開發、把關</span>
          <ArrowRight size={16} className="text-[#f5a623]" />
          <span className="rounded-full bg-[#f5a623] text-white px-4 py-2">AI 及技術工具：加快執行</span>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-[1fr_17rem_1fr] gap-6 lg:gap-12 items-center" data-mobile-visible="true"
        >
          <div className="flex flex-col gap-6 order-2 lg:order-1">
            {partnerCategories.slice(0, 2).map((c) => <CategoryCard key={c.title} category={c} side="left" />)}
          </div>

          {/* 中間：專業團隊（唔出真名、唔出相） */}
          <motion.div variants={item} data-mobile-visible="true" className="order-1 lg:order-2 relative">
            <div aria-hidden="true" className="absolute inset-0 rounded-[2rem] bg-[#f5a623]/30 blur-2xl motion-safe:animate-pulse" />
            <div className="relative rounded-[2rem] bg-gradient-to-br from-[#0f4c81] to-[#0a2f55] text-white p-7 text-center shadow-2xl border border-white/10">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4">
                <Users size={30} className="text-[#f5a623]" />
              </div>
              <p className="text-xs tracking-[0.2em] text-blue-200 font-bold mb-1">YOUR TEAM</p>
              <h3 className="text-2xl font-bold mb-3">ADWire 專業團隊</h3>
              <ul className="flex flex-wrap justify-center gap-1.5 mb-5">
                {TEAM_ROLES.map((r) => (
                  <li key={r} className="text-xs rounded-full bg-white/10 border border-white/15 px-2.5 py-1">{r}</li>
                ))}
              </ul>
              <p className="text-sm text-blue-100 leading-relaxed">
                由團隊決定用邊個工具、點樣用；
                <span className="text-white font-semibold">每個 AI 輸出都有人把關</span>，對你負責嘅係人，唔係工具。
              </p>
              <a href="#contact" className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[#f5a623] text-white text-sm font-bold px-5 py-2.5 hover:bg-[#e0951a] transition-colors">
                同團隊傾下 <ArrowRight size={14} />
              </a>
            </div>
          </motion.div>

          <div className="flex flex-col gap-6 order-3">
            {partnerCategories.slice(2).map((c) => <CategoryCard key={c.title} category={c} side="right" />)}
          </div>
        </motion.div>
                <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-20 pt-16 border-t border-gray-100" data-mobile-visible="true"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                  <Zap size={24} />
                </div>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">極致營運效率</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                透過 AI 自動化流程，將傳統需數天的任務縮短至數小時，大幅降低人力成本。
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-purple-50 text-purple-600">
                  <Database size={24} />
                </div>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">數據驅動增長</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                整合全渠道數據分析，精準洞察用戶行為，讓每一分廣告預算都花在刀口上。
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
                  <Server size={24} />
                </div>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">企業級安全穩定</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                採用全球頂尖雲端架構與安全防護，確保你的業務系統 24/7 穩定運行。
              </p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
              <Code size={14} className="text-blue-500" />
              我們持續評估並引入最新的技術合作夥伴，確保客戶始終保持競爭優勢
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

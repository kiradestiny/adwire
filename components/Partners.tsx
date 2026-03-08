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
  Code
} from "lucide-react";

// 定義合作夥伴數據結構
const partnerCategories = [
  {
    title: "AI 核心技術與模型",
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

export default function Partners() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Tech Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>
      <div className="absolute right-0 bottom-0 -z-10 h-[310px] w-[310px] rounded-full bg-purple-400 opacity-20 blur-[100px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
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
              ADWire 不僅是一家代理商，更是您的技術夥伴。我們深度整合全球領先的 AI 模型與 MarTech 工具，
              為您的品牌構建自動化、數據化、智能化的增長引擎。
            </p>
          </motion.div>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {partnerCategories.map((category, idx) => (
            <motion.div 
              key={idx}
              variants={item}
              whileHover={{ y: -5 }}
              className={`group bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 ${category.border}`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${category.bg} ${category.color} group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                  <category.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#0f4c81] transition-colors">
                  {category.title}
                </h3>
              </div>
              
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                {category.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {category.partners.map((partner, pIdx) => (
                  <motion.span 
                    key={pIdx}
                    whileHover={{ scale: 1.05 }}
                    className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm font-medium text-gray-600 border border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-md hover:text-[#0f4c81] transition-all cursor-default flex items-center gap-1.5"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${category.bg.replace('bg-', 'bg-').replace('100', '400')}`}></span>
                    {partner}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-20 pt-16 border-t border-gray-100"
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
                採用全球頂尖雲端架構與安全防護，確保您的業務系統 24/7 穩定運行。
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

"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  Brain,
  Building2,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Code2,
  Cpu,
  Database,
  FileText,
  Gauge,
  Handshake,
  Headset,
  LineChart,
  Lock,
  MessageSquareCode,
  Network,
  Rocket,
  Server,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Workflow,
  Zap,
  X,
} from "lucide-react";

const aiModels = [
  {
    name: "ChatGPT",
    provider: "OpenAI",
    strength: "文字生成、複雜推理",
    useCase: "客服對話、內容創作",
    icon: Brain,
  },
  {
    name: "Claude",
    provider: "Anthropic",
    strength: "長文本理解、精準分析",
    useCase: "文檔分析、法律審查",
    icon: FileText,
  },
  {
    name: "Llama 3.1",
    provider: "Meta",
    strength: "私有化部署、成本效益",
    useCase: "內部知識庫、敏感數據處理",
    icon: Server,
  },
  {
    name: "Gemini Pro",
    provider: "Google",
    strength: "多模態處理",
    useCase: "圖文混合分析、數據視覺化",
    icon: Network,
  },
];

const technicalTerms = [
  {
    term: "LLM (Large Language Model)",
    definition: "大型語言模型，如 ChatGPT、Claude、Gemini Pro，能理解和生成人類語言。",
    icon: Brain,
  },
  {
    term: "RAG (Retrieval-Augmented Generation)",
    definition: "檢索增強生成，結合企業知識庫讓 AI 回答更準確。",
    icon: Database,
  },
  {
    term: "Fine-tuning",
    definition: "模型微調，根據企業特定數據訓練 AI，提升準確度。",
    icon: Settings,
  },
  {
    term: "Prompt Engineering",
    definition: "提示工程，設計最佳指令讓 AI 產出期望結果。",
    icon: Code2,
  },
  {
    term: "API Integration",
    definition: "系統整合，將 AI 與現有 CRM/ERP 無縫對接。",
    icon: Workflow,
  },
  {
    term: "Vector Database",
    definition: "向量資料庫，高效儲存和檢索企業知識。",
    icon: Database,
  },
];

const faqItems = [
  {
    question: "AI 解決方案適合甚麼規模的企業？",
    answer:
      "我們的 AI 解決方案適合各種規模的 B2B 企業，從 10 人的中小企到數百人的大型企業都適用。我們會根據企業實際需求及預算，量身定制最合適的方案。",
  },
  {
    question: "AI 導入需要多長時間？投資回報期是多久？",
    answer:
      "基礎 AI 客服系統最快 4-6 週即可上線；較複雜的企業知識庫或流程自動化約需 1-3 個月。大部分客戶 3-6 個月內可回本。",
  },
  {
    question: "數據安全如何保障？",
    answer:
      "我們提供私有化部署及內部網絡運行方案，確保敏感資料不外流，同時遵守香港個人資料（私隱）條例及 GDPR。",
  },
  {
    question: "員工需要接受培訓嗎？",
    answer:
      "系統介面設計簡單易用，一般 1-2 小時即可上手。我們亦提供完整培訓、使用手冊及持續支援。",
  },
  {
    question: "AI 會否取代人手？",
    answer:
      "AI 主要處理重複性工作，釋放人力專注在高價值任務。我們推動人機協作，而非取代。",
  },
  {
    question: "ADWire 與其他供應商有何不同？",
    answer:
      "ADWire 深耕香港 B2B 市場，擁有多行業成功案例，提供諮詢到落地的一站式方案，並可私有化部署確保安全。",
  },
];

const caseStudies = [
  {
    industry: "金融服務",
    title: "AI 客服 + RAG 知識庫",
    metric: "客服工單減少 62%",
    highlight:
      "導入粵語 AI 客服與內部政策知識庫，平均回應時間從 3 小時縮短至 4 分鐘。",
  },
  {
    industry: "物流與供應鏈",
    title: "智能流程自動化",
    metric: "營運效率提升 4.8 倍",
    highlight:
      "自動處理運單、對帳與報關文件，減少人手錯誤率 70%。",
  },
  {
    industry: "專業服務",
    title: "AI 銷售賦能系統",
    metric: "成交率提升 35%",
    highlight:
      "自動評分潛在客戶並提供話術建議，縮短成交週期 28%。",
  },
];

const testimonials = [
  {
    name: "陳小姐",
    role: "營運總監｜貿易公司",
    quote: "AI 客服讓我們放假時間也能即時回應客戶，令到轉換率提升非常明顯。",
  },
  {
    name: "李先生",
    role: "IT Manager｜專業服務集團",
    quote: "ADWire 的私有化部署方案讓我們的機密資料完全留在內部網絡。",
  },
  {
    name: "黃小姐",
    role: "市場主管｜製造業",
    quote: "流程自動化後，每月節省了大量工時，團隊終於可以專注在開發新市場。",
  },
];

export default function AiServiceContent() {
  const [monthlyCost, setMonthlyCost] = useState(180000);
  const [automationRate, setAutomationRate] = useState(45);
  const [investment, setInvestment] = useState(280000);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState(0);

  const roiData = useMemo(() => {
    const savings = Math.round((monthlyCost * automationRate) / 100);
    const yearlySavings = savings * 12;
    const paybackMonths = savings > 0 ? Math.ceil(investment / savings) : 0;
    const roiPercent = investment > 0 ? Math.round((yearlySavings / investment) * 100) : 0;

    return { savings, yearlySavings, paybackMonths, roiPercent };
  }, [monthlyCost, automationRate, investment]);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-24 bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#1e1b4b] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-[560px] h-[560px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-purple-600/20 rounded-full blur-[110px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/50 bg-blue-500/10 text-blue-300 text-sm mb-6">
              <Brain size={14} /> 企業 AI 轉型方案｜本月只限 6 個免費分析名額
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              為香港 B2B 企業注入 <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400">AI 智能大腦</span>
            </h1>

            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              AI 不只是工具，而是企業的新生產力引擎。ADWire 提供從策略、開發到落地的 AI 解決方案，
              協助你解決人手短缺、流程低效、數據孤島與客戶回應慢的問題，<span className="text-blue-200 font-semibold">平均 3-6 個月回本</span>。
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="#roi"
                className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2"
              >
                <Calculator size={18} /> 立即計算 ROI
              </a>
              <a
                href="#contact"
                className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                預約免費諮詢 <ArrowRight size={18} />
              </a>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-blue-100/90">
              <span className="flex items-center gap-2"><ShieldCheck size={16} /> 私有化部署 | 數據安全</span>
              <span className="flex items-center gap-2"><Zap size={16} /> 最快 3 個月上線</span>
              <span className="flex items-center gap-2"><Target size={16} /> 量身定制 ROI 方案</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <StatCard icon={TrendingUp} value="500%" label="平均流程效率提升" />
          <StatCard icon={Clock} value="3-6 個月" label="投資回報期" />
          <StatCard icon={Handshake} value="45+" label="香港 B2B 案例" />
        </div>
      </section>

      {/* Pain Points vs Solutions */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81]">企業痛點 vs AI 解決方案</h2>
            <p className="text-gray-500 mt-4">清晰對比，讓你一眼看到 AI 如何直接解決現實問題</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center"><X size={18} /></span>
                傳統企業痛點
              </h3>
              <ul className="space-y-6">
                <PainPointItem title="人手成本高昂，招聘困難" desc="人才流失嚴重，薪酬成本不斷上升。" />
                <PainPointItem title="重複性工作耗時" desc="客服回覆、資料輸入消耗 60% 以上工時。" />
                <PainPointItem title="數據分散，決策憑感覺" desc="資料散落 Excel 或多個系統，無法整合分析。" />
                <PainPointItem title="客戶回應慢，錯失商機" desc="未能即時回覆查詢，導致成交流失。" />
                <PainPointItem title="合規與安全風險" desc="缺乏自動審查與權限控制，易引發錯誤。" />
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-md border border-blue-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl" />
              <h3 className="text-xl font-bold text-[#0f4c81] mb-6 flex items-center gap-2 relative z-10">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Check size={18} /></span>
                ADWire AI 解決方案
              </h3>
              <ul className="space-y-6 relative z-10">
                <SolutionItem title="AI 數碼員工 (Digital Workers)" desc="24/7 處理客服、文書及行政工作，成本僅人手 1/10。" />
                <SolutionItem title="智能流程自動化 (IPA)" desc="自動處理單據、審批與跨系統同步，效率提升 500%。" />
                <SolutionItem title="AI 商業智能分析" desc="整合 CRM/ERP 數據，提供即時預測與決策建議。" />
                <SolutionItem title="AI 銷售技能" desc="Lead Scoring + 話術建議，提升成交率與回覆速度。" />
                <SolutionItem title="私有化 AI 部署" desc="敏感數據只在內部網絡運行，合規安全零外洩。" />
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AI Models Showcase */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81]">支援多種 AI 模型</h2>
            <p className="text-gray-500 mt-4">根據業務場景選擇最合適的 AI 模型</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiModels.map((model, index) => (
              <motion.div
                key={model.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setSelectedModel(index)}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                  selectedModel === index
                    ? "border-blue-500 bg-blue-50 shadow-lg scale-105"
                    : "border-slate-200 bg-white hover:border-blue-300"
                }`}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-600 mb-4">
                  <model.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{model.name}</h3>
                <div className="text-xs text-blue-600 mb-3">{model.provider}</div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-semibold text-gray-700">優勢：</span>
                    <span className="text-gray-600">{model.strength}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-gray-700">應用：</span>
                    <span className="text-gray-600">{model.useCase}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Terms */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81]">AI 專業術語解析</h2>
            <p className="text-gray-500 mt-4">深入了解企業 AI 的核心技術</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technicalTerms.map((item, index) => (
              <motion.div
                key={item.term}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">{item.term}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.definition}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core AI Services */}
      <section className="py-24 bg-white" id="solutions">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81]">核心 AI 服務模組</h2>
            <p className="text-gray-500 mt-4">專為 B2B 業務場景設計的智能化模組</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ServiceCard icon={MessageSquareCode} title="AI 智能客服系統" desc="理解廣東話口語，準確回答產品查詢、報價及售後問題，並自動轉介 Sales 跟進。" />
            <ServiceCard icon={FileText} title="AI 文書與內容生成" desc="自動生成 SEO 文章、社交媒體帖文、EDM，提升內容產出效率。" />
            <ServiceCard icon={Cpu} title="企業專屬知識庫 (RAG)" desc="將內部文檔與資料轉化為 AI 知識庫，員工可即時查詢。" />
            <ServiceCard icon={Users} title="AI 銷售賦能 (Lead Scoring)" desc="自動評分 Lead，提供即時話術建議及下一步行動指引。" />
            <ServiceCard icon={BarChart3} title="AI 數據預測與分析" desc="整合 CRM/ERP 數據，預測庫存需求、客戶流失風險及銷售趨勢。" />
            <ServiceCard icon={ShieldCheck} title="私有化 LLM 部署" desc="所有敏感數據只在內部網絡運行，提供最高級別數據安全。" />
          </div>
        </div>
      </section>

      {/* Technical Advantages */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">ADWire 技術優勢</h2>
            <p className="text-gray-400">你不只是買一個工具，而是建立可持續的 AI 能力</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AdvantageCard icon={Brain} title="多模型策略" desc="支援 GPT-4、Claude、Llama 及私有模型，根據場景選擇最佳方案。" />
            <AdvantageCard icon={Database} title="資料治理與 RAG" desc="建立高品質知識庫，確保 AI 回答準確、可追溯。" />
            <AdvantageCard icon={Lock} title="企業級安全" desc="私有化部署、權限控制、審計日誌，確保合規安全。" />
            <AdvantageCard icon={Gauge} title="效能優化" desc="針對回應速度與成本進行模型壓縮與調優。" />
            <AdvantageCard icon={Headset} title="本地支援" desc="香港團隊提供本地化培訓、維護與持續優化。" />
            <AdvantageCard icon={LineChart} title="AI 成效追蹤" desc="提供 KPI Dashboard 追蹤 ROI、工時節省與銷售成效。" />
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81]">案例研究：AI 如何帶來真實成果</h2>
            <p className="text-gray-500 mt-4">真實的業務場景、可量化的成果</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {caseStudies.map((study) => (
              <div key={study.title} className="border border-slate-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all">
                <div className="text-sm text-blue-600 font-semibold mb-2 flex items-center gap-2">
                  <Building2 size={16} /> {study.industry}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{study.title}</h3>
                <div className="text-3xl font-bold text-blue-600 mb-4">{study.metric}</div>
                <p className="text-gray-500 leading-relaxed">{study.highlight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-24 bg-slate-50" id="roi">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81]">ROI 計算器：估算你的 AI 回報</h2>
            <p className="text-gray-500 mt-4">輸入你的現況成本，預估 AI 導入後的收益</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Calculator size={18} /> ROI 參數輸入
              </h3>

              <div className="space-y-6">
                <InputField
                  label="目前每月人手成本 (HK$)"
                  value={monthlyCost}
                  onChange={(value) => setMonthlyCost(value)}
                />
                <InputField
                  label="可自動化比例 (%)"
                  value={automationRate}
                  onChange={(value) => setAutomationRate(value)}
                />
                <InputField
                  label="預計 AI 專案投資 (HK$)"
                  value={investment}
                  onChange={(value) => setInvestment(value)}
                />

                <div className="p-4 rounded-xl bg-blue-50 text-sm text-blue-700 border border-blue-100">
                  <span className="font-semibold">提示：</span> 如果你不確定數字，使用預設值即可。ADWire 會在免費諮詢中為你提供詳細評估。
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Rocket size={18} /> 預估回報
              </h3>
              <div className="space-y-6">
                <RoiMetric label="每月可節省成本" value={`HK$ ${roiData.savings.toLocaleString()}`} />
                <RoiMetric label="每年可節省成本" value={`HK$ ${roiData.yearlySavings.toLocaleString()}`} />
                <RoiMetric label="回本月份" value={`${roiData.paybackMonths || "-"} 個月`} />
                <RoiMetric label="預估 ROI" value={`${roiData.roiPercent}%`} />
              </div>

              <div className="mt-8">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-full font-bold hover:bg-blue-50 transition"
                >
                  預約免費 AI 診斷 <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Process */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81]">AI 落地四部曲</h2>
            <p className="text-gray-500">從策略到落地，每一步都確保成果可衡量</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-200 via-blue-500 to-blue-200 z-0" />

            <ProcessStep number="01" title="諮詢與診斷" desc="識別高價值場景與 KPI，建立 AI 路線圖。" />
            <ProcessStep number="02" title="方案設計" desc="選擇最佳模型與架構，設計自動化流程。" />
            <ProcessStep number="03" title="開發與整合" desc="開發 AI 模組並與 ERP/CRM 系統對接。" />
            <ProcessStep number="04" title="培訓與優化" desc="培訓團隊並持續優化模型表現與 ROI。" />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81]">客戶見證與社會證明</h2>
            <p className="text-gray-500 mt-4">來自真實客戶的成果分享</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-blue-600 mb-4">
                  <CheckCircle2 size={18} /> 已驗證客戶
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">“{testimonial.quote}”</p>
                <div className="font-semibold text-gray-800">{testimonial.name}</div>
                <div className="text-sm text-gray-500">{testimonial.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ - Interactive */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81]">常見問題</h2>
            <p className="text-gray-500 mt-4">你關心的問題，我們都為你解答</p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={item.question}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                >
                  <h3 className="text-lg font-bold text-gray-800 pr-8">{item.question}</h3>
                  <motion.div
                    animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={24} className="text-blue-600 flex-shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-slate-100 pt-4">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Urgency CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm text-blue-50 mb-6">
            <AlertTriangle size={14} /> 只限本月 6 個免費 AI 診斷名額
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">準備好為企業升級轉型？</h2>
          <p className="text-xl text-blue-100 mb-10">
            立即預約免費 AI 諮詢，獲取專屬 ROI 報告與落地路線圖。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#contact" className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition-all shadow-lg">
              預約免費諮詢
            </a>
            <a
              href="https://wa.me/85295861027?text=Hello%20ADWire,%20我想了解%20AI%20Solution"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all"
            >
              WhatsApp 即時查詢
            </a>
          </div>
        </div>
      </section>

      <ContactSection defaultService="AI 企業轉型方案" />
      <Footer />
    </main>
  );
}

// --- Components ---

function PainPointItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-red-400" />
      <div>
        <h4 className="font-bold text-gray-800 mb-1">{title}</h4>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function SolutionItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-blue-500" />
      <div>
        <h4 className="font-bold text-[#0f4c81] mb-1">{title}</h4>
        <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function ServiceCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
      <div className="relative z-10">
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
          className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors"
        >
          <Icon size={28} />
        </motion.div>
        <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

function ProcessStep({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="relative z-10 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-colors text-center md:text-left">
      <div className="text-4xl font-bold text-blue-200 mb-4">{number}</div>
      <h3 className="text-xl font-bold mb-3 text-gray-800">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function AdvantageCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/80 hover:border-blue-400 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center mb-4">
        <Icon size={22} />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-300 leading-relaxed">{desc}</p>
    </div>
  );
}

function StatCard({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center justify-center gap-2 text-blue-600 mb-3">
        <Icon size={18} />
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input
        type="number"
        min={0}
        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

function RoiMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/20 rounded-xl p-4">
      <div className="text-sm text-blue-100">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

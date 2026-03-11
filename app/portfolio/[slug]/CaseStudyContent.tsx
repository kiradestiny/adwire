"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  Tag,
  Building2,
  CheckCircle2,
  TrendingUp,
  Quote,
  ArrowUpRight,
  Layers,
  Target,
  Lightbulb,
  BarChart3,
} from "lucide-react";
import {
  type PortfolioCase,
  getCaseBySlug,
  getRelatedCases,
} from "@/lib/portfolioData";
import { getExtendedData } from "@/lib/portfolioExtendedData";
import { notFound } from "next/navigation";

// ─── 數字滾動元件（修復版）────────────────────────────────────
// 問題根源：numMatch 在每次 render 都建立新陣列 → useEffect dep 變化 → 動畫不斷重啟
// 修復：① numMatch 在 effect 內部計算（不作 dep）② useRef 確保只跑一次
function AnimatedNumber({
  value,
  isInView,
}: {
  value: string;
  isInView: boolean;
}) {
  // 初始值直接顯示靜態值，避免 "0" 閃爍
  const [displayed, setDisplayed] = useState(value);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // ✅ 只執行一次：已動畫過就不再觸發
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    // 在 effect 內部解析，避免外部引用不穩定
    const numMatch = value.match(/^([+\-]?)(\d+(?:\.\d+)?)(.*)/);
    if (!numMatch) return;

    const [, prefix, numStr, suffix] = numMatch;
    const target = parseFloat(numStr);
    if (isNaN(target)) return;

    const duration = 1400;
    const startTime = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      const rounded = Number.isInteger(target)
        ? Math.round(current)
        : current.toFixed(1);
      setDisplayed(`${prefix}${rounded}${suffix}`);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    // ✅ cleanup：頁面離開時取消 RAF
    return () => cancelAnimationFrame(rafId);
  }, [isInView, value]); // value 是靜態 prop，dep 穩定安全

  return <span>{displayed}</span>;
}

// ─── 結果指標卡 ───────────────────────────────────────────────
function MetricCard({
  metric,
  index,
  accentColor,
}: {
  metric: PortfolioCase["resultMetrics"][0];
  index: number;
  accentColor: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
        metric.highlight
          ? "bg-gradient-to-br from-[#0f4c81] to-[#1a2a6c] text-white shadow-xl"
          : "bg-white border border-gray-100 shadow-md hover:shadow-lg"
      }`}
    >
      {metric.highlight && (
        <>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -mr-10 -mt-10 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 -ml-5 -mb-5 blur-xl" />
        </>
      )}
      {/* ✅ RWD：padding 手機縮小，桌面保持 p-6 */}
      <div className="relative z-10 p-4 sm:p-6">
        {/* ✅ RWD：字型由 text-xl 漸增至 text-4xl，避免在窄格中溢出 */}
        <p
          className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black mb-1 stat-number tracking-tight leading-none break-words ${
            metric.highlight ? "text-white" : ""
          }`}
          style={metric.highlight ? {} : { color: accentColor }}
        >
          <AnimatedNumber value={metric.value} isInView={isInView} />
        </p>
        <p
          className={`font-bold text-sm sm:text-base mb-1 leading-tight ${
            metric.highlight ? "text-white/90" : "text-gray-800"
          }`}
        >
          {metric.label}
        </p>
        <p
          className={`text-xs leading-relaxed ${
            metric.highlight ? "text-white/60" : "text-gray-400"
          }`}
        >
          {metric.description}
        </p>
      </div>
    </motion.div>
  );
}

// ─── 流程步驟卡 ───────────────────────────────────────────────
function ProcessStep({
  step,
  index,
  total,
  accentColor,
}: {
  step: PortfolioCase["processSteps"][0];
  index: number;
  total: number;
  accentColor: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="flex gap-5"
    >
      {/* 時間軸線 */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg z-10"
          style={{ backgroundColor: accentColor }}
        >
          {index + 1}
        </div>
        {index < total - 1 && (
          <div
            className="w-0.5 flex-1 mt-2"
            style={{
              background: `linear-gradient(to bottom, ${accentColor}60, ${accentColor}15)`,
            }}
          />
        )}
      </div>

      {/* 內容 */}
      <div className={`pb-10 ${index === total - 1 ? "pb-0" : ""}`}>
        <span
          className="inline-block text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg mb-2"
          style={{
            backgroundColor: `${accentColor}15`,
            color: accentColor,
          }}
        >
          {step.phase}
        </span>
        <h4 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h4>
        <p className="text-gray-500 leading-relaxed text-sm">{step.description}</p>
      </div>
    </motion.div>
  );
}

// ─── 相關案例卡 ───────────────────────────────────────────────
function RelatedCard({ item }: { item: PortfolioCase }) {
  return (
    <Link href={`/portfolio/${item.slug}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className={`h-40 bg-gradient-to-br ${item.color} relative overflow-hidden`}>
          {item.image && (
            <>
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/30" />
            </>
          )}
          <div className="absolute top-3 left-3">
            <span className="liquid-glass px-2.5 py-1 rounded-full text-white text-[11px] font-bold">
              {item.displayCategory}
            </span>
          </div>
        </div>
        <div className="p-5">
          <h4 className="font-bold text-gray-900 mb-1 group-hover:text-[#0f4c81] transition-colors text-base">
            {item.title}
          </h4>
          <p className="text-gray-400 text-xs line-clamp-2 mb-3">{item.shortDescription}</p>
          <div className="flex items-center justify-between">
            <span className="font-black text-lg" style={{ color: item.accentColor }}>
              {item.stats}
            </span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">
              {item.statLabel}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── GEO 快速答案卡 ─────────────────────────────────────────────
// 設計目標：讓 ChatGPT、Perplexity、Gemini 在回答相關問題時直接引用此段
function GeoSnapshotBox({
  summary,
  accentColor,
}: {
  summary: string;
  accentColor: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div
        className="rounded-2xl p-5 sm:p-6 border flex gap-4 items-start"
        style={{
          backgroundColor: `${accentColor}08`,
          borderColor: `${accentColor}30`,
        }}
      >
        {/* AI 圖示 */}
        <div
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5 text-white font-black text-xs"
          style={{ backgroundColor: accentColor }}
        >
          AI
        </div>
        <div className="min-w-0">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: accentColor }}
          >
            AI 快速答案 · 案例精要
          </p>
          {/* 此段落為 GEO 優化核心：明確、可獨立閱讀的一句話總結 */}
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            {summary}
          </p>
          <p className="text-gray-400 text-xs mt-3">
            來源：ADWire Agency 成功案例庫 ·{" "}
            <a
              href="https://adwire.com.hk/portfolio"
              className="underline hover:text-gray-600 transition-colors"
            >
              adwire.com.hk/portfolio
            </a>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Before/After 比較表 ─────────────────────────────────────────
// 結構化表格：易被 Google 收錄為 Featured Snippet，亦供 AI 引用數據
function BeforeAfterTable({
  rows,
  accentColor,
}: {
  rows: { label: string; before: string; after: string }[];
  accentColor: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
        >
          <TrendingUp size={20} />
        </div>
        <h2 className="text-2xl font-black text-gray-900">執行前後對比</h2>
      </div>
      {/* 可被 Google 解析為表格型富結果 */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr style={{ backgroundColor: `${accentColor}12` }}>
              <th className="text-left py-3 px-4 font-bold text-gray-700 w-1/3">指標</th>
              <th className="text-left py-3 px-4 font-bold text-red-600 w-1/3">
                合作前 ❌
              </th>
              <th className="text-left py-3 px-4 font-bold text-emerald-600 w-1/3">
                合作後 ✅
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, i) => (
              <tr
                key={i}
                className="transition-colors hover:bg-gray-50"
              >
                <td className="py-3 px-4 font-semibold text-gray-700">{row.label}</td>
                <td className="py-3 px-4 text-gray-500">{row.before}</td>
                <td className="py-3 px-4 font-semibold" style={{ color: accentColor }}>
                  {row.after}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ─── FAQ Accordion ───────────────────────────────────────────────
// FAQPage Schema 的前端呈現：Framer Motion 展開動畫 + 搜尋引擎友好結構
function FaqAccordion({
  faqs,
  accentColor,
}: {
  faqs: { q: string; a: string }[];
  accentColor: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="py-16 bg-gray-50"
      aria-label="常見問題"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-black text-[#0f4c81] mb-2">
            常見問題 FAQ
          </h2>
          <p className="text-gray-400 text-sm">
            針對此類型服務的真實疑問與專業解答
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
            >
              {/* 問題 */}
              <button
                className="w-full text-left flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                <span
                  className="font-bold text-sm sm:text-base text-gray-900 leading-snug"
                >
                  {faq.q}
                </span>
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-lg font-bold transition-transform duration-300"
                  style={{
                    backgroundColor: accentColor,
                    transform: openIndex === i ? "rotate(45deg)" : "rotate(0deg)",
                  }}
                >
                  +
                </span>
              </button>

              {/* 答案 */}
              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div
                      className="px-5 sm:px-6 pb-5 pt-2 border-t text-sm sm:text-base text-gray-600 leading-relaxed"
                      style={{ borderColor: `${accentColor}20` }}
                    >
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 主元件 ─────────────────────────────────────────────────────
// ✅ 只接收 slug（字串），避免 Server→Client 邊界傳遞不可序列化的 LucideIcon 函數
export default function CaseStudyContent({ slug }: { slug: string }) {
  // 在 Client Component 內部解析資料（portfolioData 是純 JS 模組，可在任何環境使用）
  const caseItem = getCaseBySlug(slug);
  if (!caseItem) {
    notFound();
  }
  const relatedCases = getRelatedCases(caseItem.slug, 3);
  const extended = getExtendedData(caseItem.slug); // SEO/GEO 擴展資料
  const heroRef = useRef<HTMLElement>(null);

  // 視差效果
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 40, damping: 20 });
  const parallaxX = useTransform(smoothX, [0, 1], [-15, 15]);
  const parallaxY = useTransform(smoothY, [0, 1], [-10, 10]);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    };
    const el = heroRef.current;
    el?.addEventListener("mousemove", handleMouse);
    return () => el?.removeEventListener("mousemove", handleMouse);
  }, [mouseX, mouseY]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════
          HERO — 沉浸式案例封面
          ═══════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[80vh] flex flex-col justify-end overflow-hidden"
        aria-label={`${caseItem.title} 案例封面`}
      >
        {/* 背景圖片 */}
        <div className="absolute inset-0">
          <Image
            src={caseItem.image}
            alt={caseItem.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* 深色漸層遮罩 */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, rgba(4,12,30,0.97) 0%, rgba(4,12,30,0.75) 40%, rgba(4,12,30,0.30) 70%, rgba(4,12,30,0.15) 100%)`,
            }}
          />
          {/* 品牌色調漸層 */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(ellipse at 80% 20%, ${caseItem.accentColor}30 0%, transparent 60%)`,
            }}
          />
        </div>

        {/* 視差浮動光球 */}
        <motion.div
          className="absolute top-[20%] right-[15%] w-72 h-72 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${caseItem.accentColor}20 0%, transparent 70%)`,
            filter: "blur(40px)",
            x: parallaxX,
            y: parallaxY,
          }}
        />

        {/* 主要文字內容 */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-16">
          {/* 麵包屑 */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            aria-label="breadcrumb"
            className="mb-8"
          >
            <ol className="flex items-center gap-2 text-sm text-white/50">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  首頁
                </Link>
              </li>
              <ChevronRight size={14} />
              <li>
                <Link href="/portfolio" className="hover:text-white transition-colors">
                  成功案例
                </Link>
              </li>
              <ChevronRight size={14} />
              <li className="text-white/80 truncate max-w-[200px]">{caseItem.title}</li>
            </ol>
          </motion.nav>

          {/* 分類標籤 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap gap-2 mb-5"
          >
            <span
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full text-white"
              style={{ backgroundColor: `${caseItem.accentColor}CC` }}
            >
              <caseItem.icon size={12} />
              {caseItem.displayCategory}
            </span>
            <span className="liquid-glass inline-flex items-center gap-1.5 text-xs text-white/80 px-3 py-1.5 rounded-full">
              <Building2 size={11} />
              {caseItem.industry}
            </span>
            <span className="liquid-glass inline-flex items-center gap-1.5 text-xs text-white/80 px-3 py-1.5 rounded-full">
              <Clock size={11} />
              {caseItem.duration}
            </span>
          </motion.div>

          {/* 標題 */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 max-w-3xl"
          >
            {caseItem.title}
          </motion.h1>

          {/* 簡介 */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/65 text-lg max-w-2xl leading-relaxed mb-10"
          >
            {caseItem.shortDescription}
          </motion.p>

          {/* 主要成效指標（Hero 底部）*/}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap gap-4"
          >
            {caseItem.resultMetrics
              .filter((m) => m.highlight)
              .map((m, i) => (
                <div
                  key={i}
                  className="liquid-glass rounded-2xl px-4 sm:px-6 py-3 sm:py-4 min-w-0"
                >
                  {/* ✅ RWD：手機縮至 text-2xl 避免長字串溢出 */}
                  <p
                    className="text-2xl sm:text-3xl font-black text-white stat-number leading-none break-words"
                    style={{ textShadow: `0 0 30px ${caseItem.accentColor}80` }}
                  >
                    {m.value}
                  </p>
                  <p className="text-white/50 text-xs mt-1 uppercase tracking-wide">
                    {m.label}
                  </p>
                </div>
              ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          服務標籤列
          ═══════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-gray-100 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold uppercase tracking-widest">
              <Tag size={12} />
              服務範疇
            </span>
            {caseItem.services.map((service, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="text-sm font-medium px-3 py-1.5 rounded-full border"
                style={{
                  color: caseItem.accentColor,
                  borderColor: `${caseItem.accentColor}40`,
                  backgroundColor: `${caseItem.accentColor}0D`,
                }}
              >
                {service}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ GEO 快速答案卡（AI 引用友好型摘要）*/}
      {extended?.geoSummary && (
        <GeoSnapshotBox
          summary={extended.geoSummary}
          accentColor={caseItem.accentColor}
        />
      )}

      {/* ═══════════════════════════════════════════════════════
          主要內容區域
          ═══════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* ── 左側主要內容 ── */}
          <div className="lg:col-span-2 space-y-16 min-w-0">

            {/* 完整描述 */}
            <ContentSection
              icon={Lightbulb}
              title="案例背景"
              accentColor={caseItem.accentColor}
              delay={0}
            >
              <p className="text-gray-600 leading-relaxed text-lg">
                {caseItem.fullDescription}
              </p>
            </ContentSection>

            {/* 挑戰 */}
            <ContentSection
              icon={Target}
              title="客戶面臨的挑戰"
              accentColor={caseItem.accentColor}
              delay={0.05}
            >
              <div className="bg-red-50 border-l-4 border-red-400 rounded-r-2xl p-6">
                <p className="text-gray-700 leading-relaxed">{caseItem.challenge}</p>
              </div>
            </ContentSection>

            {/* 策略方案 */}
            <ContentSection
              icon={Layers}
              title="ADWire 的策略與方案"
              accentColor={caseItem.accentColor}
              delay={0.1}
            >
              <div
                className="rounded-2xl p-6 border"
                style={{
                  backgroundColor: `${caseItem.accentColor}08`,
                  borderColor: `${caseItem.accentColor}25`,
                }}
              >
                <p className="text-gray-700 leading-relaxed">{caseItem.solution}</p>
              </div>
            </ContentSection>

            {/* 執行成效 */}
            <ContentSection
              icon={TrendingUp}
              title="執行成效摘要"
              accentColor={caseItem.accentColor}
              delay={0.15}
            >
              <p className="text-gray-600 leading-relaxed">{caseItem.outcome}</p>
            </ContentSection>

            {/* ✅ Before/After 比較表（結構化數據，高 Google 收錄率）*/}
            {extended?.beforeAfter && extended.beforeAfter.length > 0 && (
              <BeforeAfterTable
                rows={extended.beforeAfter}
                accentColor={caseItem.accentColor}
              />
            )}

            {/* 執行流程 */}
            <ContentSection
              icon={BarChart3}
              title="執行流程"
              accentColor={caseItem.accentColor}
              delay={0.2}
            >
              <div className="space-y-0">
                {caseItem.processSteps.map((step, i) => (
                  <ProcessStep
                    key={i}
                    step={step}
                    index={i}
                    total={caseItem.processSteps.length}
                    accentColor={caseItem.accentColor}
                  />
                ))}
              </div>
            </ContentSection>
          </div>

          {/* ── 右側 Sidebar ── */}
          <div className="space-y-8 min-w-0">
            {/* 案例資訊卡 */}
            <SidebarInfoCard caseItem={caseItem} />

            {/* 客戶見證 */}
            <TestimonialCard caseItem={caseItem} />

            {/* 返回按鈕 */}
            <Link
              href="/portfolio"
              className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0f4c81] transition-colors group"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
              返回全部案例
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          成效數字 — 全寬展示
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-black text-[#0f4c81] mb-3">
              量化成效數據
            </h2>
            <p className="text-gray-400">每個數字都有真實業務背書</p>
          </motion.div>

          {/* ✅ RWD：gap 手機縮小，不強制 2 欄，讓長字串數值有足夠空間 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {caseItem.resultMetrics.map((metric, i) => (
              <MetricCard
                key={i}
                metric={metric}
                index={i}
                accentColor={caseItem.accentColor}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ✅ FAQ Accordion（FAQPage Schema + AI 問答引用友好）*/}
      {extended?.faqs && extended.faqs.length > 0 && (
        <FaqAccordion
          faqs={extended.faqs}
          accentColor={caseItem.accentColor}
        />
      )}

      {/* ═══════════════════════════════════════════════════════
          相關案例
          ═══════════════════════════════════════════════════════ */}
      {relatedCases.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-between mb-10"
            >
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-[#0f4c81]">
                  相關成功案例
                </h2>
                <p className="text-gray-400 text-sm mt-1">同類型行業的更多成效</p>
              </div>
              <Link
                href="/portfolio"
                className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-[#0f4c81] hover:gap-2.5 transition-all"
              >
                查看全部
                <ArrowUpRight size={16} />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedCases.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <RelatedCard item={item} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          CTA 橫幅
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="animated-gradient-hero absolute inset-0" />
        <div className="hero-mesh-gradient absolute inset-0" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[#f5a623] text-sm font-semibold tracking-widest uppercase mb-4">
              獲取同等成果
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              你的品牌
              <br />
              也能做到
            </h2>
            <p className="text-white/60 text-lg mb-10 leading-relaxed">
              這個案例只是我們眾多成功故事之一。
              <br />
              立即與我們討論，了解如何為你的業務創造相似的成果。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* ✅ scroll 至頁內表單，不跳頁 */}
              <a
                href="#contact-form"
                className="inline-flex items-center justify-center gap-2 bg-[#f5a623] hover:bg-[#e8951a] text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 hover:shadow-[0_8px_30px_rgba(245,166,35,0.4)] hover:-translate-y-0.5 text-base"
              >
                免費策略諮詢
                <ArrowUpRight size={18} />
              </a>
              <Link
                href="/portfolio"
                className="inline-flex items-center justify-center gap-2 liquid-glass text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:liquid-glass-hover text-base"
              >
                <ArrowLeft size={16} />
                更多成功案例
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ✅ id 錨點：供 #contact-form 定位 */}
      <div id="contact-form">
        <ContactSection />
      </div>
      <Footer />
    </main>
  );
}

// ─── 內容區塊包裝元件 ─────────────────────────────────────────
function ContentSection({
  icon: Icon,
  title,
  children,
  accentColor,
  delay = 0,
}: {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  children: React.ReactNode;
  accentColor: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: `${accentColor}15`,
            color: accentColor,
          }}
        >
          <Icon size={20} />
        </div>
        <h2 className="text-2xl font-black text-gray-900">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Sidebar 資訊卡 ────────────────────────────────────────────
function SidebarInfoCard({ caseItem }: { caseItem: PortfolioCase }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const infoRows = [
    { icon: Building2, label: "行業", value: caseItem.industry },
    { icon: Clock, label: "項目週期", value: caseItem.duration },
    { icon: Tag, label: "分類", value: caseItem.displayCategory },
    {
      icon: CheckCircle2,
      label: "主要成效",
      value: `${caseItem.stats} ${caseItem.statLabel}`,
    },
    { icon: Clock, label: "最後更新", value: new Date().toLocaleDateString() },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-100"
    >
      {/* 頂部色條 */}
      <div
        className={`h-2 bg-gradient-to-r ${caseItem.color}`}
      />

      <div className="p-6">
        <h3 className="font-black text-gray-900 text-lg mb-5 flex items-center gap-2">
          <caseItem.icon size={20} style={{ color: caseItem.accentColor }} />
          案例資訊
        </h3>
        <div className="mb-5 flex items-center gap-3 border-t border-gray-100 pt-5">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: caseItem.accentColor }}
          >
            A
          </div>
          <div>
            <p className="text-gray-900 font-bold text-sm">ADWire Team</p>
            <p className="text-gray-400 text-xs">Growth Marketing Experts</p>
          </div>
        </div>

        <div className="space-y-4">
          {infoRows.map(({ icon: Icon, label, value }, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  backgroundColor: `${caseItem.accentColor}12`,
                  color: caseItem.accentColor,
                }}
              >
                <Icon size={14} />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                  {label}
                </p>
                <p className="text-gray-800 font-semibold text-sm mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">
            關鍵詞
          </p>
          <div className="flex flex-wrap gap-1.5">
            {caseItem.tags.map((tag, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-lg font-medium"
                style={{
                  color: caseItem.accentColor,
                  backgroundColor: `${caseItem.accentColor}10`,
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── 客戶見證卡 ───────────────────────────────────────────────
function TestimonialCard({ caseItem }: { caseItem: PortfolioCase }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative bg-[#0f1e3d] rounded-3xl p-6 overflow-hidden"
    >
      {/* 背景裝飾 */}
      <div
        className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20 -mr-10 -mt-10 blur-2xl"
        style={{ backgroundColor: caseItem.accentColor }}
      />

      <Quote
        size={32}
        className="mb-4 opacity-30"
        style={{ color: caseItem.accentColor }}
      />

      <blockquote className="text-white/75 text-sm leading-relaxed mb-5 italic">
        &ldquo;{caseItem.testimonial.quote}&rdquo;
      </blockquote>

      <div className="flex items-center gap-3 border-t border-white/10 pt-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: caseItem.accentColor }}
        >
          {caseItem.testimonial.author.charAt(0)}
        </div>
        <div>
          <p className="text-white font-bold text-sm">
            {caseItem.testimonial.author}
          </p>
          <p className="text-white/40 text-xs">
            {caseItem.testimonial.role} · {caseItem.testimonial.company}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

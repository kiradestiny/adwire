"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import ClientShowcase from "@/components/ClientShowcase";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
  useInView,
  animate,
} from "framer-motion";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Filter,
  ChevronRight,
  ChevronUp,
  Search,
  X,
} from "lucide-react";
import {
  portfolioCases as fallbackCases,
  portfolioCategories,
  type PortfolioCase,
} from "@/lib/portfolioData";
import type { SerializablePortfolioCase } from "@/lib/admin-types";
import { toPortfolioCases } from "@/lib/admin-types";
import { SITE_STATS } from "@/lib/site-stats";
import { clientShowcase, showcaseCategoriesOf } from "@/lib/clientShowcase";

interface PortfolioContentProps {
  cases?: SerializablePortfolioCase[];
}

// ─── Hero 統計數字（來源：lib/site-stats.ts，不可自行加數）────────
const heroStats = [
  { value: SITE_STATS.brandClients, suffix: "+", label: "品牌客戶" },
  { value: SITE_STATS.publicCases, suffix: "", label: "公開案例" },
  { value: SITE_STATS.serviceLines, suffix: "", label: "服務線" },
  { value: SITE_STATS.industries, suffix: "+", label: "行業" },
];

// ─── 快速搵案例：常見需求 → 搜尋字詞 ─────────────────────────────
const QUICK_INTENTS = [
  { label: "AI／自動化", terms: ["ai", "自動化", "whatsapp", "chatbot", "系統"] },
  { label: "SEO／GEO", terms: ["seo", "geo", "搜尋"] },
  { label: "網站／Shopify", terms: ["網站", "shopify", "網店", "landing", "web"] },
  { label: "廣告投放", terms: ["廣告", "ads", "roas"] },
  { label: "社交媒體", terms: ["社交", "專頁", "instagram", "facebook", "reels"] },
  { label: "KOL／短片", terms: ["kol", "短視頻", "影片", "reels", "拍攝", "攝影"] },
] as const;

const SEARCH_EXAMPLES = ["Shopify", "醫美", "SEO", "WhatsApp", "貸款", "KOL"];

/** 文字搜尋：每個以空格分隔嘅字都要出現；快速需求則任何一個字詞出現即可 */
function matches(haystack: string, query: string, intentTerms: readonly string[] | null) {
  const text = haystack.toLowerCase();
  if (intentTerms && !intentTerms.some((t) => text.includes(t))) return false;
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return words.every((w) => text.includes(w));
}

// ─── 數字滾動 ─────────────────────────────────────────────────
function CountUp({ to, suffix, delay = 0 }: { to: number; suffix: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, to, {
      duration: 1.4,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, to, delay]);

  return (
    <span ref={ref} className="tabular-nums">
      {n}
      {suffix}
    </span>
  );
}

// ─── 背景光球配置 ────────────────────────────────────────────
const orbConfigs = [
  { size: 600, x: "10%", y: "20%", color: "rgba(96, 165, 250, 0.12)", duration: 22, delay: 0 },
  { size: 500, x: "75%", y: "10%", color: "rgba(167, 139, 250, 0.10)", duration: 28, delay: 4 },
  { size: 400, x: "50%", y: "70%", color: "rgba(245, 166, 35, 0.08)", duration: 18, delay: 8 },
  { size: 350, x: "85%", y: "60%", color: "rgba(52, 211, 153, 0.08)", duration: 25, delay: 2 },
  { size: 300, x: "5%", y: "75%", color: "rgba(251, 113, 133, 0.07)", duration: 20, delay: 6 },
];

// ─── 3D Card Hook ────────────────────────────────────────────
function use3DCard() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-6, 6]);
  const springRotateX = useSpring(rotateX, { stiffness: 250, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 250, damping: 30 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      x.set((e.clientX - rect.left) / rect.width - 0.5);
      y.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return { ref, springRotateX, springRotateY, handleMouseMove, handleMouseLeave };
}

// ─── 3D Portfolio Card（修復版）────────────────────────────────
function PortfolioCard({
  item,
  index,
}: {
  item: PortfolioCase;
  index: number;
}) {
  const { ref, springRotateX, springRotateY, handleMouseMove, handleMouseLeave } = use3DCard();
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-80px" });

  return (
    <motion.div
      data-mobile-visible="true"
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{
        duration: 0.5,
        delay: (index % 3) * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="card-3d-wrapper"
    >
      {/* ✅ 整張卡片用 Link 包裹 — 圖片、標題、按鈕均可點擊 */}
      <Link href={`/portfolio/${item.slug}`} className="block h-full">
        <motion.div
          ref={ref}
          style={{
            rotateX: springRotateX,
            rotateY: springRotateY,
            // ✅ 修復圓角閃爍：移除 preserve-3d，加 backfaceVisibility 防止 GPU 重排
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden" as const,
            willChange: "transform",
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] transition-shadow duration-500 flex flex-col h-full"
        >
          {/* ── 圖片區域 ── */}
          {/* ✅ 修復圓角閃爍：translateZ(0) 強制 GPU 合成層，WebkitMask 修正 Safari 圓角裁切 */}
          <div
            className={`h-56 bg-gradient-to-br ${item.color} relative overflow-hidden flex-shrink-0`}
            style={{
              transform: "translateZ(0)",
              WebkitMaskImage: "-webkit-radial-gradient(white, black)",
            }}
          >
            {item.image && (
              <>
                <Image
                  src={item.image}
                  alt={item.alt}
                  title={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* 底部深色遮罩 — 保護 tag 可讀性 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-black/10" />
              </>
            )}

            {/* ✅ 修復：分類 Tag — 使用深色半透明背景確保可讀性 */}
            <div className="absolute top-4 left-4 z-10">
              <span className="inline-flex items-center gap-1.5 bg-black/55 backdrop-blur-sm border border-white/25 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-sm">
                {item.displayCategory}
              </span>
            </div>

            {/* 右上角箭頭 hover 顯示 */}
            <div className="absolute top-4 right-4 z-10">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                <ArrowUpRight size={16} />
              </div>
            </div>

            {/* 底部 Tag 列表 */}
            <div className="absolute bottom-4 left-4 z-10 flex gap-1.5 flex-wrap">
              {item.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] text-white/85 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/15"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* hover 時的品牌色調光暈（pointer-events-none 確保不阻擋點擊）*/}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `linear-gradient(135deg, ${item.accentColor}25 0%, transparent 60%)`,
              }}
            />
          </div>

          {/* ── 內容區域 ── */}
          {/* ✅ 修復：圖示移至內容區的 inline 位置，不再 -top-8 跨邊界 */}
          <div className="p-7 flex-1 flex flex-col">

            {/* 圖示 + 行業 (inline，不浮出邊界) */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: `${item.accentColor}18`,
                  color: item.accentColor,
                }}
              >
                <item.icon size={20} />
              </div>
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: item.accentColor }}
              >
                {item.industry}
              </p>
            </div>

            {/* 標題 */}
            <h3 className="text-xl font-bold text-[#0f4c81] mb-3 group-hover:text-[#f5a623] transition-colors duration-300 leading-tight">
              {item.title}
            </h3>

            {/* 簡介 */}
            <p className="text-gray-500 text-sm mb-6 flex-1 leading-relaxed line-clamp-3">
              {item.shortDescription}
            </p>

            {/* 底部：數據 + CTA 按鈕 */}
            <div className="border-t border-gray-100 pt-5 mt-auto flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p
                  className="text-3xl font-black leading-none stat-number"
                  style={{ color: item.accentColor }}
                >
                  {item.stats}
                </p>
                <p className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wide truncate">
                  {item.statLabel}
                </p>
              </div>

              {/* ✅ 修復：視覺按鈕（div，不再巢套 Link），點擊整張卡會 navigate */}
              <div
                className="flex-shrink-0 flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2.5 rounded-xl transition-all duration-300 group-hover:gap-2 group-hover:shadow-lg"
                style={{
                  backgroundColor: item.accentColor,
                  boxShadow: `0 4px 15px ${item.accentColor}40`,
                }}
              >
                查看案例
                <ChevronRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ─── 主元件 ─────────────────────────────────────────────────────
export default function PortfolioContent({ cases }: PortfolioContentProps) {
  // 使用傳入的 cases 或本地 fallback，並將 SerializablePortfolioCase 轉回 PortfolioCase
  const resolvedCases = useMemo<PortfolioCase[]>(() => {
    if (cases && cases.length > 0) return toPortfolioCases(cases);
    return fallbackCases;
  }, [cases]);

  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [intent, setIntent] = useState<string | null>(null);
  const intentTerms = useMemo(
    () => QUICK_INTENTS.find((i) => i.label === intent)?.terms ?? null,
    [intent]
  );
  const isSearching = query.trim() !== "" || intent !== null;

  // 搜尋（文字 + 快速需求）先做，類別再收窄
  const searchedCases = useMemo(
    () =>
      resolvedCases.filter((c) =>
        matches(
          [c.title, c.industry, c.displayCategory, c.shortDescription, ...c.tags, ...c.services].join(" "),
          query,
          intentTerms
        )
      ),
    [resolvedCases, query, intentTerms]
  );
  const filteredCases = useMemo(() => {
    if (activeCategory === "All") return searchedCases;
    return searchedCases.filter((c) => c.category === activeCategory);
  }, [activeCategory, searchedCases]);

  const clientMatchCount = useMemo(
    () =>
      clientShowcase.filter((c) =>
        matches(
          [c.name, c.industry, c.intro, ...showcaseCategoriesOf(c), ...c.service.items].join(" "),
          query,
          intentTerms
        )
      ).length,
    [query, intentTerms]
  );

  const clearSearch = useCallback(() => {
    setQuery("");
    setIntent(null);
  }, []);

  // 搜尋框 placeholder 輪播
  const [exampleIdx, setExampleIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setExampleIdx((i) => (i + 1) % SEARCH_EXAMPLES.length), 2200);
    return () => clearInterval(t);
  }, []);

  // 目前睇緊邊個區塊（sticky bar 高亮用）
  const [activeSection, setActiveSection] = useState<"cases" | "clients">("clients");
  useEffect(() => {
    const ids = ["clients", "cases"] as const;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id as "cases" | "clients");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const heroRef = useRef<HTMLElement>(null);

  // 滑鼠視差追蹤
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const orb1X = useTransform(smoothMouseX, [0, 1], [-30, 30]);
  const orb1Y = useTransform(smoothMouseY, [0, 1], [-20, 20]);
  const orb2X = useTransform(smoothMouseX, [0, 1], [20, -20]);
  const orb2Y = useTransform(smoothMouseY, [0, 1], [15, -15]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    };
    const hero = heroRef.current;
    hero?.addEventListener("mousemove", handleMouseMove);
    return () => hero?.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const searchInput = (size: "lg" | "sm") => (
    <div className={`relative ${size === "lg" ? "w-full max-w-2xl mx-auto" : "w-full md:w-72"}`}>
      <Search
        size={size === "lg" ? 20 : 16}
        className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${
          size === "lg" ? "left-5 text-white/50" : "left-3.5 text-gray-400"
        }`}
        aria-hidden="true"
      />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="搜尋案例"
        placeholder={
          size === "lg"
            ? `搜尋行業或服務，例如：${SEARCH_EXAMPLES[exampleIdx]}`
            : `搜尋案例，例如：${SEARCH_EXAMPLES[exampleIdx]}`
        }
        className={
          size === "lg"
            ? "w-full liquid-glass rounded-2xl pl-14 pr-12 py-4 text-base text-white placeholder:text-white/45 outline-none focus:ring-2 focus:ring-[#f5a623]/60 transition"
            : "w-full rounded-full bg-gray-100 pl-10 pr-9 py-2 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#0f4c81]/30 focus:bg-white transition"
        }
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          aria-label="清除搜尋"
          className={`absolute top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors ${
            size === "lg" ? "right-4 text-white/60 hover:text-white" : "right-2.5 text-gray-400 hover:text-gray-700"
          }`}
        >
          <X size={size === "lg" ? 18 : 14} />
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════
          HERO — 精簡版：標題 + 搜尋 + 快速需求
          ═══════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden portfolio-hero-bg"
        aria-label="Portfolio Hero"
      >
        {/* 動態光球 */}
        {orbConfigs.map((orb, i) => (
          <motion.div data-mobile-glow="true" aria-hidden="true"
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              filter: "blur(60px)",
              x: i === 0 ? orb1X : i === 1 ? orb2X : 0,
              y: i === 0 ? orb1Y : i === 1 ? orb2Y : 0,
            }}
            animate={{
              scale: [1, 1.15, 0.95, 1],
              opacity: [0.6, 0.9, 0.6],
            }}
            transition={{
              duration: orb.duration,
              delay: orb.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-36 pb-12 md:pb-14">
          {/* Badge */}
          <motion.div
            data-mobile-visible="true"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center mb-6"
          >
            <div className="liquid-glass inline-flex items-center gap-2 px-4 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#f5a623] animate-pulse" />
              <span className="text-white/80 text-xs md:text-sm font-medium tracking-wide">實戰成果 · 真實客戶</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse animation-delay-2000" />
            </div>
          </motion.div>

          {/* 主標題 */}
          <div className="text-center mb-8">
            <motion.h1
              data-mobile-visible="true"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tight mb-4"
            >
              每個數字<br className="md:hidden" /> <span className="gradient-text-gold">都是真實成果</span>
            </motion.h1>

            <motion.p
              data-mobile-visible="true"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-base md:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed"
            >
              輸入你的行業或想做的項目，即刻搵到相關案例。
            </motion.p>
          </div>

          {/* 搜尋 */}
          <motion.div
            data-mobile-visible="true"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {searchInput("lg")}
          </motion.div>

          {/* 快速需求 */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {QUICK_INTENTS.map((it, i) => {
              const on = intent === it.label;
              return (
                <motion.button
                  data-mobile-visible="true"
                  key={it.label}
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.05 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIntent(on ? null : it.label)}
                  aria-pressed={on}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors duration-200 ${
                    on
                      ? "bg-[#f5a623] border-[#f5a623] text-[#0f4c81] shadow-[0_6px_20px_rgba(245,166,35,0.35)]"
                      : "bg-white/5 border-white/15 text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {it.label}
                </motion.button>
              );
            })}
          </div>

          {/* 統計數字（精簡一行） */}
          <motion.dl
            data-mobile-visible="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10 flex flex-wrap justify-center gap-x-6 md:gap-x-10 gap-y-3"
          >
            {heroStats.map((stat, i) => (
              <div key={stat.label} className="flex items-baseline gap-2">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-2xl md:text-3xl font-black gradient-text-gold stat-number">
                  <CountUp to={stat.value} suffix={stat.suffix} delay={0.6 + i * 0.1} />
                </dd>
                <span aria-hidden="true" className="text-xs md:text-sm text-white/50 font-medium">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.dl>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STICKY 導航：兩個區塊 + 搜尋
          ═══════════════════════════════════════════════════════ */}
      <nav
        aria-label="案例分區"
        className="sticky top-[72px] md:top-[80px] z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200/80 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-full w-full md:w-auto">
            {([
              { id: "clients", label: "真實客戶項目", n: clientMatchCount },
              { id: "cases", label: "精選成功案例", n: searchedCases.length },
            ] as const).map((tab) => {
              const on = activeSection === tab.id;
              return (
                <a
                  key={tab.id}
                  href={`#${tab.id}`}
                  className={`relative flex-1 md:flex-none text-center px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    on ? "text-white" : "text-gray-600 hover:text-[#0f4c81]"
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="sectionTab"
                      className="absolute inset-0 rounded-full"
                      style={{ background: "linear-gradient(135deg, #0f4c81 0%, #1a3a8f 100%)" }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10">
                    {tab.label}
                    <span className={`ml-1.5 text-xs ${on ? "text-white/70" : "text-gray-400"}`}>{tab.n}</span>
                  </span>
                </a>
              );
            })}
          </div>

          {/* 手機：未搜尋時收起，慳返 sticky 位 */}
          <div className={`${isSearching ? "flex" : "hidden md:flex"} items-center gap-2 md:ml-auto`}>
            {searchInput("sm")}
            <AnimatePresence>
              {isSearching && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={clearSearch}
                  aria-label="清除搜尋及篩選"
                  className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-[#f5a623]/15 text-[#b8730f] px-3 py-2 text-xs font-bold hover:bg-[#f5a623]/25 transition-colors"
                >
                  {intent ?? "清除"}
                  <X size={12} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════
          CLIENT SHOWCASE（真實客戶項目）
          ═══════════════════════════════════════════════════════ */}
      <ClientShowcase query={query} intentTerms={intentTerms} onClear={clearSearch} />

      {/* ═══════════════════════════════════════════════════════
          精選成功案例
          ═══════════════════════════════════════════════════════ */}
      <section id="cases" className="scroll-mt-[150px] md:scroll-mt-[150px] pt-14 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[400px]">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <span className="inline-block text-[#f5a623] font-bold tracking-[0.18em] uppercase text-xs mb-2">
              Case Studies
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-[#0f4c81]">
              {activeCategory === "All"
                ? "精選成功案例"
                : portfolioCategories.find((c) => c.id === activeCategory)?.label}
            </h2>
            <AnimatePresence mode="wait">
              <motion.p
                key={`${filteredCases.length}-${activeCategory}`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2 }}
                className="text-gray-400 text-sm mt-1"
              >
                共 {filteredCases.length} 個案例 · 點入可睇完整流程及成效
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            持續更新中
          </div>
        </div>

        {/* 類別（橫向滾動，手機唔會變到好多行） */}
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 mb-10 overflow-x-auto portfolio-scroll">
          <div className="flex gap-2 w-max sm:w-auto sm:flex-wrap">
            {portfolioCategories.map((cat) => {
              const isActive = activeCategory === cat.id;
              const n = searchedCases.filter((c) => cat.id === "All" || c.category === cat.id).length;
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 whitespace-nowrap ${
                    isActive
                      ? "text-white"
                      : n === 0
                        ? "bg-gray-100 text-gray-300"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-[#0f4c81]"
                  }`}
                  aria-pressed={isActive}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeFilter"
                      className="absolute inset-0 rounded-full shadow-md"
                      style={{ background: "linear-gradient(135deg, #0f4c81 0%, #1a3a8f 100%)" }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {cat.label}
                    <span className={`text-xs ${isActive ? "text-white/70" : "text-gray-400"}`}>{n}</span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 卡片網格 */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredCases.map((item, index) => (
              <PortfolioCard key={item.id} item={item} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* 空狀態 */}
        {filteredCases.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 text-gray-400"
          >
            <Filter size={44} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-gray-500">呢個組合暫時未有精選案例</p>
            <p className="text-sm mt-1">
              {clientMatchCount > 0 ? `不過喺「真實客戶項目」有 ${clientMatchCount} 個相關項目。` : "試下換個關鍵字。"}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {clientMatchCount > 0 && (
                <a
                  href="#clients"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#0f4c81] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#0d4373] transition-colors"
                >
                  睇相關客戶項目 <ChevronUp size={15} />
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  clearSearch();
                  setActiveCategory("All");
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 text-gray-600 px-5 py-2.5 text-sm font-semibold hover:border-[#0f4c81] hover:text-[#0f4c81] transition-colors"
              >
                顯示全部案例
              </button>
            </div>
          </motion.div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA 橫幅
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="animated-gradient-hero absolute inset-0" />
        <div className="hero-mesh-gradient absolute inset-0" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <motion.div
            data-mobile-visible="true"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[#f5a623] text-sm font-semibold tracking-widest uppercase mb-4">
              下一個成功故事
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              可以是你的品牌
            </h2>
            <p className="text-white/60 text-lg mb-10 leading-relaxed">
              每一個我們服務過的客戶，都曾在某個節點下定決心改變。
              <br />
              現在，換你了。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* ✅ 滾動至頁內表單，不跳頁 */}
              <a
                href="#contact-form"
                className="inline-flex items-center justify-center gap-2 bg-[#f5a623] hover:bg-[#e8951a] text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 hover:shadow-[0_8px_30px_rgba(245,166,35,0.4)] hover:-translate-y-0.5 text-base"
              >
                免費策略諮詢
                <ArrowUpRight size={18} />
              </a>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 liquid-glass text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:liquid-glass-hover text-base"
              >
                探索服務方案
                <ChevronRight size={18} />
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
    </div>
  );
}

"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
  useInView,
} from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Filter,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
} from "lucide-react";
import {
  portfolioCases,
  portfolioCategories,
  getCasesByCategory,
} from "@/lib/portfolioData";

// ─── Hero 統計數字 ───────────────────────────────────────────
const heroStats = [
  { value: "150+", label: "成功案例", icon: Award },
  { value: "98%", label: "客戶滿意度", icon: Sparkles },
  { value: "3.8x", label: "平均 ROAS", icon: TrendingUp },
  { value: "10年+", label: "行業經驗", icon: Zap },
];

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

// ─── CountUp 統計元件 ────────────────────────────────────────
function CountUpStat({
  value,
  label,
  icon: Icon,
  delay = 0,
}: {
  value: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="liquid-glass rounded-2xl p-5 text-center group hover:scale-105 transition-transform duration-300"
    >
      <div className="flex items-center justify-center mb-2">
        <div className="w-9 h-9 rounded-xl bg-[#f5a623]/20 flex items-center justify-center group-hover:bg-[#f5a623]/30 transition-colors">
          <Icon size={18} className="text-[#f5a623]" />
        </div>
      </div>
      <p className="text-3xl font-bold text-white mb-1 stat-number gradient-text-gold">{value}</p>
      <p className="text-xs text-white/50 font-medium tracking-wider uppercase">{label}</p>
    </motion.div>
  );
}

// ─── 3D Portfolio Card（修復版）────────────────────────────────
function PortfolioCard({
  item,
  index,
}: {
  item: (typeof portfolioCases)[0];
  index: number;
}) {
  const { ref, springRotateX, springRotateY, handleMouseMove, handleMouseLeave } = use3DCard();
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-80px" });

  return (
    <motion.div
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
            WebkitBackfaceVisibility: "hidden" as "hidden",
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
export default function PortfolioContent() {
  const [activeCategory, setActiveCategory] = useState("All");
  const filteredCases = getCasesByCategory(activeCategory);
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

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════
          HERO — 沉浸式 3D 視覺
          ═══════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[88vh] flex flex-col justify-center overflow-hidden portfolio-hero-bg"
        aria-label="Portfolio Hero"
      >
        {/* 動態光球 */}
        {orbConfigs.map((orb, i) => (
          <motion.div
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

        {/* 網格背景 */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* 主要內容 */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-20">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center mb-8"
          >
            <div className="liquid-glass inline-flex items-center gap-2 px-5 py-2.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#f5a623] animate-pulse" />
              <span className="text-white/80 text-sm font-medium tracking-wide">實戰成果 · 真實數據</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse animation-delay-2000" />
            </div>
          </motion.div>

          {/* 主標題 */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight mb-6"
            >
              每個數字
              <br />
              <span className="gradient-text-gold">都是真實</span>
              <br />
              <span className="text-white/70">成果</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg md:text-xl text-white/55 max-w-2xl mx-auto leading-relaxed"
            >
              我們拒絕紙上談兵。探索 ADWire 如何為不同行業的客戶
              <br className="hidden md:block" />
              創造可量化、可持續的業務增長。
            </motion.p>
          </div>

          {/* 統計數字 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-14"
          >
            {heroStats.map((stat, i) => (
              <CountUpStat key={i} {...stat} delay={0.4 + i * 0.08} />
            ))}
          </motion.div>

          {/* 向下滾動指示 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col items-center gap-2 mt-16"
          >
            <p className="text-white/30 text-xs tracking-widest uppercase">滾動探索</p>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent"
            />
          </motion.div>
        </div>

        {/* 底部過渡 */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
      </section>

      {/* ═══════════════════════════════════════════════════════
          FILTER BAR
          ═══════════════════════════════════════════════════════ */}
      <section className="sticky top-[72px] md:top-[80px] z-40 py-4 bg-white/85 backdrop-blur-xl border-b border-gray-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            {portfolioCategories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap overflow-hidden ${
                    isActive
                      ? "text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-[#0f4c81]"
                  }`}
                  style={
                    isActive
                      ? {
                          background: "linear-gradient(135deg, #0f4c81 0%, #1a3a8f 100%)",
                          boxShadow: "0 4px 20px rgba(15,76,129,0.30)",
                        }
                      : {}
                  }
                  aria-pressed={isActive}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeFilter"
                      className="absolute inset-0 rounded-full"
                      style={{ background: "linear-gradient(135deg, #0f4c81 0%, #1a3a8f 100%)" }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {cat.label}
                    {isActive && (
                      <span className="w-5 h-5 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-bold">
                        {getCasesByCategory(cat.id).length}
                      </span>
                    )}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CASE GRID
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[600px]">
        {/* 結果標題 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between mb-10"
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#0f4c81]">
                {activeCategory === "All"
                  ? "全部成功案例"
                  : portfolioCategories.find((c) => c.id === activeCategory)?.label}
              </h2>
              <p className="text-gray-400 text-sm mt-1">共 {filteredCases.length} 個案例</p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              持續更新中
            </div>
          </motion.div>
        </AnimatePresence>

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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 text-gray-400"
          >
            <Filter size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">暫時沒有相關案例</p>
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
    </main>
  );
}

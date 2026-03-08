"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Users,
  Zap,
  Star,
  ChevronDown,
  Award,
  Globe,
  Cpu,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  colorIdx: number;
}

// ─── Animated Counter Hook ─────────────────────────────────────────────────────
function useCounter(target: number, duration = 1800, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let frame = 0;
    const totalFrames = Math.round((duration / 1000) * 60);
    const tick = () => {
      frame++;
      const progress = frame / totalFrames;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.min(Math.round(eased * target), target));
      if (frame < totalFrames) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, started]);
  return count;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  value,
  suffix,
  label,
  gradient,
  started,
}: {
  value: number;
  suffix: string;
  label: string;
  gradient: string;
  started: boolean;
}) {
  const count = useCounter(value, 1800, started);
  return (
    <div className="liquid-glass border border-white/10 rounded-2xl p-3 text-center hover:border-white/25 transition-all duration-300 group">
      <div
        className={`text-xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-200 inline-block tabular-nums`}
      >
        {count}{suffix}
      </div>
      <div className="text-[11px] text-gray-400 mt-0.5 leading-tight">{label}</div>
    </div>
  );
}

// ─── Orb ─────────────────────────────────────────────────────────────────────
function Orb({ color, className, style }: {
  color: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`absolute rounded-full pointer-events-none will-change-transform ${className ?? ""}`}
      style={{
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: "blur(80px)",
        ...style,
      }}
    />
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PAIN_POINTS = ["流量太貴？", "轉化太低？", "人手不足？", "生意難做？"];
const PARTICLE_COLORS = ["#60a5fa", "#f5a623", "#a78bfa", "#34d399"];

const STATS = [
  { value: 500,  suffix: "+",  label: "服務企業",  gradient: "from-blue-400 to-cyan-400"   },
  { value: 328,  suffix: "%",  label: "平均 ROI",  gradient: "from-amber-400 to-orange-400" },
  { value: 1000, suffix: "+",  label: "KOL 資源", gradient: "from-purple-400 to-pink-400"  },
];

// ── ADWire 三大能力 Pillars（「能力展示」取代「認證牌」策略）
// 針對上市公司/大企業/政府：用具體能力 + 市場覆蓋 + 技術層面表達專業，
// 避免虛假 Partner badge，以真實團隊優勢建立信任。
const ADVANTAGES = [
  {
    Icon: Award,
    title: "10+ 年",
    desc: "核心團隊數碼營銷實戰",
    color:  "text-amber-400",
    bg:     "bg-amber-500/10",
    border: "border-amber-500/25",
    glow:   "hover:shadow-[0_0_16px_rgba(245,166,35,0.2)]",
  },
  {
    Icon: Globe,
    title: "香港+內地",
    desc: "香港・內地雙市場專家",
    color:  "text-blue-400",
    bg:     "bg-blue-500/10",
    border: "border-blue-500/25",
    glow:   "hover:shadow-[0_0_16px_rgba(96,165,250,0.2)]",
  },
  {
    Icon: Cpu,
    title: "AI 認可",
    desc: "多項 AI 工具認證技術",
    color:  "text-purple-400",
    bg:     "bg-purple-500/10",
    border: "border-purple-500/25",
    glow:   "hover:shadow-[0_0_16px_rgba(167,139,250,0.2)]",
  },
];

// ── SVG Sparkline 路徑（表達業績切線上升感）
const SPARK_LINE =
  "M0,88 C25,85 35,78 55,74 C75,70 85,76 108,65 C130,54 140,58 162,46 C184,34 194,42 215,32 C236,22 248,15 268,10 C282,7 292,5 300,4";
const SPARK_FILL = `${SPARK_LINE} L300,100 L0,100 Z`;
const SPARK_DOTS: [number, number][] = [
  [55, 74], [108, 65], [162, 46], [215, 32], [268, 10], [300, 4],
];

// ─── HeroSection ─────────────────────────────────────────────────────────────
export default function HeroSection() {
  const [textIndex,    setTextIndex]    = useState(0);
  const [mounted,      setMounted]      = useState(false);
  const [statsStarted, setStatsStarted] = useState(false);
  const [particles,    setParticles]    = useState<Particle[]>([]);
  const [isMobile,     setIsMobile]     = useState(false);

  // 3D card refs — direct DOM mutation, zero React re-renders on mousemove
  const wrapperRef     = useRef<HTMLDivElement>(null);
  const innerRef       = useRef<HTMLDivElement>(null);
  const sparklineRef   = useRef<SVGPathElement>(null);
  const isHoveringCard = useRef(false);

  // ── Mount ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);

    // 手機版效能優化：偵測裝置寬度，手機版略過高消耗的粒子特效
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);

    // Particles — client only (SSR hydration safe)
    // 手機版：略過粒子渲染，減少 DOM 節點數量 & 避免 22 個 CSS animation
    if (!mobile) {
      setParticles(
        Array.from({ length: 22 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2.5 + 1,
          opacity: Math.random() * 0.45 + 0.08,
          duration: Math.random() * 10 + 6,
          delay: Math.random() * 5,
          colorIdx: i % PARTICLE_COLORS.length,
        }))
      );
    }

    const statsTimer = setTimeout(() => setStatsStarted(true), 900);
    const interval   = setInterval(
      () => setTextIndex((p) => (p + 1) % PAIN_POINTS.length),
      2800
    );

    return () => {
      clearTimeout(statsTimer);
      clearInterval(interval);
    };
  }, []);

  // ── Sparkline draw-in (SVG stroke-dashoffset trick) ───────────────────────
  useEffect(() => {
    if (!mounted || !sparklineRef.current) return;
    // Slight delay so entrance animation completes first
    const t = setTimeout(() => {
      if (sparklineRef.current) {
        sparklineRef.current.style.transition = "stroke-dashoffset 2.2s cubic-bezier(0.16,1,0.3,1)";
        sparklineRef.current.style.strokeDashoffset = "0";
      }
    }, 700);
    return () => clearTimeout(t);
  }, [mounted]);

  // ── 3D Tilt (RAF + direct DOM — no re-render) ─────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!wrapperRef.current || !innerRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const rotX = ((e.clientY - cy) / (rect.height / 2)) * -10;
    const rotY = ((e.clientX - cx) / (rect.width  / 2)) * 10;
    const mx   = ((e.clientX - rect.left) / rect.width)  * 100;
    const my   = ((e.clientY - rect.top)  / rect.height) * 100;

    requestAnimationFrame(() => {
      if (!innerRef.current) return;
      innerRef.current.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(0)`;
      innerRef.current.style.setProperty("--mouse-x", `${mx}%`);
      innerRef.current.style.setProperty("--mouse-y", `${my}%`);
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    isHoveringCard.current = true;
    if (innerRef.current)
      innerRef.current.style.transition = "transform 0.12s ease-out";
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHoveringCard.current = false;
    requestAnimationFrame(() => {
      if (!innerRef.current) return;
      innerRef.current.style.transition = "transform 0.7s cubic-bezier(0.16,1,0.3,1)";
      innerRef.current.style.transform  = "rotateX(0deg) rotateY(0deg) translateZ(0)";
    });
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden animated-gradient-hero pt-20">

      {/* Fine grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_50%_40%,transparent_30%,rgba(4,12,30,0.75)_100%)] pointer-events-none" />

      {/* Animated Orbs — 手機版略過，避免 filter:blur 觸發大量合成層 */}
      {!isMobile && (
        <>
          <Orb color="rgba(15,76,129,0.55)"  className="top-[-8%] left-[-8%] w-[700px] h-[700px] animate-orb-drift"                   style={{ animationDuration: "22s" }} />
          <Orb color="rgba(139,92,246,0.40)" className="top-[25%] right-[-12%] w-[550px] h-[550px] animate-orb-drift animation-delay-3000" style={{ animationDuration: "28s" }} />
          <Orb color="rgba(245,166,35,0.22)" className="bottom-[-12%] left-[15%] w-[650px] h-[650px] animate-orb-drift animation-delay-5000" style={{ filter: "blur(100px)", animationDuration: "20s" }} />
          <Orb color="rgba(6,182,212,0.28)"  className="top-[45%] left-[38%] w-[350px] h-[350px] animate-orb-drift animation-delay-2000"   style={{ filter: "blur(60px)",  animationDuration: "25s" }} />
        </>
      )}

      {/* Particle field */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left:             `${p.x}%`,
            top:              `${p.y}%`,
            width:            `${p.size}px`,
            height:           `${p.size}px`,
            opacity:          p.opacity,
            background:       PARTICLE_COLORS[p.colorIdx],
            animation:        `cardFloat ${p.duration}s ease-in-out infinite`,
            animationDelay:   `${p.delay}s`,
            willChange:       "transform",
          }}
        />
      ))}

      {/* ── Main content grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ================================================================
              LEFT ─ Text + Advantages
          ================================================================ */}
          <div className="text-left">

            {/* Live badge */}
            <div
              className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full liquid-glass border border-white/20 text-blue-300 text-sm font-semibold mb-6 animate-fade-in-up"
              style={{ animationDelay: "0.1s", opacity: 0 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
              </span>
              香港首選 AI 驅動 MarTech 代理
            </div>

            {/* H1 — LCP 元素：不設 opacity:0 初始狀態，確保瀏覽器立即渲染計量
                LCP 修復：移除 animationDelay + opacity:0 inline style，
                讓 Google 爬蟲/PageSpeed 在首次 Paint 時即可測量此元素 */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.08]">
              <span className="block gradient-text-blue">
                AI 驅動營銷
              </span>
              <span className="block text-white">
                精準引爆業績增長
              </span>
            </h1>

            {/* Pain-point rotator */}
            <div className="h-12 mb-6 flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: "0.4s", opacity: 0 }}>
              <span className="text-2xl md:text-3xl text-gray-400">解決您的</span>
              <span key={textIndex} className="text-2xl md:text-3xl font-bold gradient-text-gold animate-fade-in">
                {PAIN_POINTS[textIndex]}
              </span>
            </div>

            {/* Description */}
            <p className="text-lg text-gray-300 mb-8 max-w-xl leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.5s", opacity: 0 }}>
              ADWire 是香港領先的 MarTech 代理商，專注於{" "}
              <strong className="text-white">KOL 網紅營銷</strong>、
              <strong className="text-white">短視頻製作</strong>、
              <strong className="text-white">SEO/GEO 優化</strong>及
              <strong className="text-white">成效廣告</strong>。
              結合 AI 技術與數據分析，助您以最低成本實現業績最大化。
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: "0.6s", opacity: 0 }}>
              <Link
                href="https://wa.me/85295861027?text=Hello%20ADWire,%20我想查詢Marketing服務"
                aria-label="免費咨詢專家"
                className="group relative px-8 py-4 bg-[#f5a623] text-white font-bold rounded-full overflow-hidden transition-all duration-300 flex items-center justify-center gap-2
                  hover:shadow-[0_0_32px_rgba(245,166,35,0.65),0_0_60px_rgba(245,166,35,0.25)]
                  hover:scale-[1.04] active:scale-[0.97]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  免費咨詢專家
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
                <span className="absolute inset-0 shimmer-bg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>

              <Link
                href="/portfolio"
                aria-label="查看成功案例"
                prefetch={false}
                className="group px-8 py-4 liquid-glass text-white font-bold rounded-full
                  border border-white/20 hover:border-white/40
                  transition-all duration-300 flex items-center justify-center gap-2
                  hover:shadow-[0_0_24px_rgba(255,255,255,0.08)]
                  hover:scale-[1.04] active:scale-[0.97]"
              >
                查看成功案例
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6 animate-fade-in-up" style={{ animationDelay: "0.7s", opacity: 0 }}>
              {["數據透明", "ROI 導向", "AI 技術支援"].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="text-sm text-gray-300">{t}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5 animate-fade-in-up" style={{ animationDelay: "0.8s", opacity: 0 }}>
              {STATS.map((s) => (
                <StatCard key={s.label} {...s} started={statsStarted} />
              ))}
            </div>

            {/* ── Capability Pillars（三大優勢 — 專業定位核心）
                  策略：以「團隊能力 + 市場覆蓋 + 技術深度」為切入點，
                  適合對標上市公司 / 大企業 / 政府，
                  無需依賴 Partner badge，靠具體能力建立信任。 */}
            <div className="grid grid-cols-3 gap-3 animate-fade-in-up" style={{ animationDelay: "0.95s", opacity: 0 }}>
              {ADVANTAGES.map(({ Icon, title, desc, color, bg, border, glow }) => (
                <div
                  key={title}
                  className={`liquid-glass border ${border} rounded-2xl p-3.5 flex flex-col items-center text-center
                    transition-all duration-300 group cursor-default ${glow}`}
                >
                  <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-2
                    group-hover:scale-110 transition-transform duration-200`}>
                    <Icon size={17} className={color} />
                  </div>
                  <div className={`text-sm font-bold ${color} leading-tight`}>{title}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ================================================================
              RIGHT ─ 3D Interactive Dashboard
          ================================================================ */}
          <div
            className="relative hidden lg:flex items-center justify-center animate-fade-in-up"
            style={{ animationDelay: "0.25s", opacity: 0 }}
          >
            {/* 3D perspective wrapper */}
            <div
              ref={wrapperRef}
              className="relative w-full max-w-[520px] cursor-pointer"
              style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* Inner tilt card */}
              <div
                ref={innerRef}
                className="card-3d relative"
                style={{
                  transformStyle: "preserve-3d",
                  transition:     "transform 0.7s cubic-bezier(0.16,1,0.3,1)",
                  willChange:     "transform",
                }}
              >
                {/* ── Main dashboard panel ── */}
                <div className="relative liquid-glass rounded-3xl p-6 border border-white/15 overflow-hidden">

                  {/* Shine follow-cursor overlay */}
                  <div className="card-3d-shine rounded-3xl" />

                  {/* Window chrome */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400/70" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                      <div className="w-3 h-3 rounded-full bg-green-400/70" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs text-gray-400 font-mono">ADWire Dashboard</span>
                    </div>
                  </div>

                  {/* Metric tiles */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl hover:bg-blue-500/18 transition-colors duration-200">
                      <div className="flex items-center gap-2 mb-2 text-blue-400">
                        <TrendingUp size={17} />
                        <span className="text-xs font-semibold uppercase tracking-wide">流量增長</span>
                      </div>
                      <div className="text-3xl font-bold text-white">+128%</div>
                      <div className="text-[11px] text-green-400 mt-1">↑ 較上月</div>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl hover:bg-amber-500/18 transition-colors duration-200">
                      <div className="flex items-center gap-2 mb-2 text-amber-400">
                        <Zap size={17} />
                        <span className="text-xs font-semibold uppercase tracking-wide">轉化率</span>
                      </div>
                      <div className="text-3xl font-bold text-white">4.8%</div>
                      <div className="text-[11px] text-green-400 mt-1">↑ 行業均值 2x</div>
                    </div>
                  </div>

                  {/* ── SVG Sparkline（切線圖 — 業績上升趨勢）
                        - stroke-dashoffset 動畫：mounted 後 700ms 開始「自左向右畫線」
                        - 漸層填充（fill）+ 多色線條（stroke linearGradient）
                        - 數據點在 transition 後依次 fade-in
                        - 全部走 transform/opacity，不觸發 layout reflow ✅ */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-4 relative" style={{ height: "160px" }}>

                    {/* Growth badge overlay */}
                    <div className="absolute top-2.5 right-3 z-10 flex items-center gap-1.5 bg-green-500/15 border border-green-500/30 rounded-full px-2.5 py-1">
                      <TrendingUp size={10} className="text-green-400" />
                      <span className="text-[9px] text-green-400 font-bold tracking-wide">ROI +328%</span>
                    </div>

                    {/* Y-axis labels */}
                    <div className="absolute left-2 inset-y-0 flex flex-col justify-between py-2.5 z-10 pointer-events-none">
                      <span className="text-[8px] text-gray-600 font-mono">High</span>
                      <span className="text-[8px] text-gray-600 font-mono">Mid</span>
                      <span className="text-[8px] text-gray-600 font-mono">Low</span>
                    </div>

                    {/* Horizontal grid lines */}
                    <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden="true">
                      {[25, 50, 75].map((y) => (
                        <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      ))}
                    </svg>

                    {/* Main sparkline SVG */}
                    <svg
                      viewBox="0 0 300 100"
                      preserveAspectRatio="none"
                      className="absolute inset-0 w-full h-full"
                      aria-label="業績增長趨勢圖"
                    >
                      <defs>
                        {/* Fill gradient — blue fade to transparent */}
                        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#60a5fa" stopOpacity="0.30" />
                          <stop offset="70%"  stopColor="#60a5fa" stopOpacity="0.05" />
                          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0"    />
                        </linearGradient>
                        {/* Line gradient — indigo → blue → emerald */}
                        <linearGradient id="sparkLine" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%"   stopColor="#818cf8" />
                          <stop offset="50%"  stopColor="#60a5fa" />
                          <stop offset="100%" stopColor="#34d399" />
                        </linearGradient>
                      </defs>

                      {/* Area fill */}
                      <path d={SPARK_FILL} fill="url(#sparkFill)" />

                      {/* Animated line — draw-in effect */}
                      <path
                        ref={sparklineRef}
                        d={SPARK_LINE}
                        fill="none"
                        stroke="url(#sparkLine)"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          strokeDasharray:  "620",
                          strokeDashoffset: "620", // starts invisible, JS sets to 0
                        }}
                      />

                      {/* Data point dots — fade in after line draws */}
                      {SPARK_DOTS.map(([x, y], i) => (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="3"
                          fill={i === SPARK_DOTS.length - 1 ? "#34d399" : "#60a5fa"}
                          stroke="rgba(4,12,30,0.8)"
                          strokeWidth="1.5"
                          style={{
                            opacity:    mounted ? 1 : 0,
                            transition: `opacity 0.4s ease ${1.8 + i * 0.12}s`,
                          }}
                        />
                      ))}

                      {/* Final point pulse ring */}
                      <circle
                        cx={300}
                        cy={4}
                        r="6"
                        fill="none"
                        stroke="#34d399"
                        strokeWidth="1"
                        style={{
                          opacity:   mounted ? 0.4 : 0,
                          animation: "pulse 2s ease-in-out infinite",
                          transition: "opacity 0.4s ease 2.8s",
                        }}
                      />
                    </svg>

                    {/* X-axis quarter labels */}
                    <div className="absolute bottom-2 left-8 right-3 flex justify-between pointer-events-none">
                      {["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"].map((q) => (
                        <span key={q} className="text-[8px] text-gray-600 font-mono">{q}</span>
                      ))}
                    </div>
                  </div>

                  {/* AI status bar */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_12px_rgba(139,92,246,0.5)]">
                        <Zap size={13} className="text-white" />
                      </div>
                      <span className="text-[11px] text-gray-300">AI 自動優化運行中</span>
                    </div>
                    <div className="flex gap-1 items-end">
                      {[3, 5, 4, 6, 4].map((h, i) => (
                        <div
                          key={i}
                          className="w-1 rounded-full bg-green-400/60 animate-pulse"
                          style={{ height: `${h * 3}px`, animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Floating cards ── */}

                {/* Card 1: Active users */}
                <div
                  className="absolute -right-10 top-16 liquid-glass border border-white/20 p-3.5 rounded-2xl flex items-center gap-3 animate-card-float shadow-xl"
                  style={{ animationDuration: "3.8s" }}
                >
                  <div className="w-9 h-9 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 shrink-0">
                    <Users size={17} />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400">活躍用戶</div>
                    <div className="font-bold text-white text-sm leading-tight">24.5k</div>
                  </div>
                </div>

                {/* Card 2: Star rating */}
                <div
                  className="absolute -left-11 top-1/3 liquid-glass border border-white/20 p-3.5 rounded-2xl animate-card-float shadow-xl"
                  style={{ animationDuration: "4.6s", animationDelay: "0.9s" }}
                >
                  <div className="text-[10px] text-gray-400 mb-1.5">客戶滿意度</div>
                  <div className="flex gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={13} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <div className="text-xs text-white font-bold">4.9 / 5.0</div>
                </div>

                {/* Card 3: 24/7 automation */}
                <div
                  className="absolute -left-8 bottom-16 liquid-glass border border-white/20 p-3.5 rounded-2xl flex items-center gap-3 animate-card-float shadow-xl"
                  style={{ animationDuration: "5.2s", animationDelay: "1.6s" }}
                >
                  <div className="w-9 h-9 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 shrink-0">
                    <Zap size={17} />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400">自動化運行中</div>
                    <div className="font-bold text-white text-sm leading-tight">24 / 7</div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Scroll cue ── */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-gray-500 animate-bounce pointer-events-none select-none">
        <span className="text-[10px] tracking-[0.2em] uppercase font-medium">Scroll</span>
        <ChevronDown size={15} />
      </div>
    </section>
  );
}

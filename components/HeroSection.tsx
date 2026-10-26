"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Award,
  Globe,
  Cpu,
} from "lucide-react";
import HeroAiEngine from "@/components/HeroAiEngine";

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
  // 初始值用 target（唔係 0）：令 SSR 同首帧就輸出真實數字，
  // AI crawler 同無 JS 環境讀到嘅係真實數字（52+／16／12）而唔係 0。
  const [count, setCount] = useState(target);
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
    setCount(0);
    requestAnimationFrame(tick);
    // 保底：requestAnimationFrame 喺背景分頁／部分 headless 環境會被 throttle
    // 甚至完全唔觸發（2026-09-24 實測：hidden tab 下 rAF 一帧都唔行），
    // 屆時計數器會永遠停喺 0。用 setTimeout 保證最終值一定顯示。
    const settle = setTimeout(() => setCount(target), duration + 400);
    return () => clearTimeout(settle);
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
  // 未開始動畫前直接輸出最終數字：令原始 HTML（無 JS 環境、AI crawler）讀到
  // 真實數字（52+ / 16 / 12）而唔係初始值 0。動畫行為完全不變。
  const display = started ? count : value;
  return (
    <div className="liquid-glass border border-white/10 rounded-2xl p-3 text-center hover:border-white/25 transition-all duration-300 group">
      <div
        className={`text-xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-200 inline-block tabular-nums`}
      >
        {display}{suffix}
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
    <div data-mobile-glow="true" aria-hidden="true"
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
const PAIN_POINTS = ["系統太散？", "重複工序太多？", "搜尋曝光不足？", "回覆跟唔上？"];
const PARTICLE_COLORS = ["#60a5fa", "#f5a623", "#a78bfa", "#34d399"];

const STATS = [
  { value: 52,   suffix: "+",  label: "品牌客戶",  gradient: "from-blue-400 to-cyan-400"   },
  { value: 16,   suffix: "",   label: "公開案例",  gradient: "from-amber-400 to-orange-400" },
  { value: 12,   suffix: "",   label: "服務線",    gradient: "from-purple-400 to-pink-400"  },
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
    title: "AI 自動化",
    desc: "度身開發 AI 工具及流程",
    color:  "text-purple-400",
    bg:     "bg-purple-500/10",
    border: "border-purple-500/25",
    glow:   "hover:shadow-[0_0_16px_rgba(167,139,250,0.2)]",
  },
];

// ─── HeroSection ─────────────────────────────────────────────────────────────
export default function HeroSection() {
  const [textIndex,    setTextIndex]    = useState(0);
  const [statsStarted, setStatsStarted] = useState(false);
  const [particles,    setParticles]    = useState<Particle[]>([]);
  const [isMobile,     setIsMobile]     = useState(false);

  // ── Mount ──────────────────────────────────────────────────────────────────
  useEffect(() => {

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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden animated-gradient-hero pt-20">

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
              className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full liquid-glass border border-white/20 text-blue-300 text-sm font-semibold mb-6 animate-fade-in-up" data-mobile-visible="true"
              style={{ animationDelay: "0.1s", opacity: 0 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
              </span>
              SOFTWARE · AI · DIGITAL GROWTH
            </div>

            {/* H1 — LCP 元素：不設 opacity:0 初始狀態，確保瀏覽器立即渲染計量
                LCP 修復：移除 animationDelay + opacity:0 inline style，
                讓 Google 爬蟲/PageSpeed 在首次 Paint 時即可測量此元素 */}
            <h1 className="text-4xl md:text-6xl lg:text-[3.25rem] xl:text-[3.75rem] font-bold tracking-tight mb-6 leading-[1.12]">
              <span className="block gradient-text-blue">
                將商業構思，
              </span>
              <span className="block text-white">
                轉化為真正可運作的
              </span>
              <span className="block text-white">
                數碼方案。
              </span>
            </h1>

            {/* Pain-point rotator */}
            <div className="h-12 mb-6 flex items-center gap-3 animate-fade-in-up" data-mobile-visible="true" style={{ animationDelay: "0.4s", opacity: 0 }}>
              <span className="text-2xl md:text-3xl text-gray-400">常見問題：</span>
              <span key={textIndex} className="text-2xl md:text-3xl font-bold gradient-text-gold animate-fade-in">
                {PAIN_POINTS[textIndex]}
              </span>
            </div>

            {/* Description */}
            <p className="text-lg text-gray-300 mb-8 max-w-xl leading-relaxed animate-fade-in-up" data-mobile-visible="true" style={{ animationDelay: "0.5s", opacity: 0 }}>
              ADWire 提供{" "}
              <strong className="text-white">企業網站及系統開發</strong>、
              <strong className="text-white">AI 應用與工作流程自動化</strong>，以及{" "}
              <strong className="text-white">SEO／GEO 搜尋優化</strong>。
              從需求分析、開發部署到持續改善，協助企業處理實際營運與增長問題。
            </p>

            {/* CTAs
                主要入口：帶不懂選服務的訪客去做短問卷（/start）。
                保留原有「討論你的項目」直接查詢入口，不強迫所有人答問卷。 */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4 animate-fade-in-up" data-mobile-visible="true" style={{ animationDelay: "0.6s", opacity: 0 }}>
              <Link
                href="/start"
                prefetch={false}
                aria-label="找出適合你的方案與預算"
                className="group relative px-8 py-4 bg-[#f5a623] text-white font-bold rounded-full overflow-hidden transition-all duration-300 flex items-center justify-center gap-2
                  hover:shadow-[0_0_32px_rgba(245,166,35,0.65),0_0_60px_rgba(245,166,35,0.25)]
                  hover:scale-[1.04] active:scale-[0.97] motion-reduce:transform-none"
              >
                <span className="relative z-10 flex items-center gap-2">
                  找出適合你的方案與預算
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
                <span className="absolute inset-0 shimmer-bg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>

              <Link
                href="/contact"
                prefetch={false}
                aria-label="討論你的項目"
                className="group px-8 py-4 liquid-glass text-white font-bold rounded-full
                  border border-white/20 hover:border-white/40
                  transition-all duration-300 flex items-center justify-center gap-2
                  hover:shadow-[0_0_24px_rgba(255,255,255,0.08)]
                  hover:scale-[1.04] active:scale-[0.97] motion-reduce:transform-none"
              >
                討論你的項目
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </Link>
            </div>

            {/* 次入口（文字連結）：保留原有「探索服務方案」，另加案例入口 */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-8 animate-fade-in-up" data-mobile-visible="true" style={{ animationDelay: "0.65s", opacity: 0 }}>
              <Link
                href="/services"
                prefetch={false}
                aria-label="探索服務方案"
                className="group inline-flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
              >
                探索服務方案
                <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
              </Link>
              <Link
                href="/portfolio/"
                prefetch={false}
                aria-label="查看相關案例"
                className="group inline-flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
              >
                查看相關案例
                <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6 animate-fade-in-up" data-mobile-visible="true" style={{ animationDelay: "0.7s", opacity: 0 }}>
              {["需求先講清楚", "交付範圍明確", "上線後可維護"].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="text-sm text-gray-300">{t}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5 animate-fade-in-up" data-mobile-visible="true" style={{ animationDelay: "0.8s", opacity: 0 }}>
              {STATS.map((s) => (
                <StatCard key={s.label} {...s} started={statsStarted} />
              ))}
            </div>

            {/* ── Capability Pillars（三大優勢 — 專業定位核心）
                  策略：以「團隊能力 + 市場覆蓋 + 技術深度」為切入點，
                  適合對標上市公司 / 大企業 / 政府，
                  無需依賴 Partner badge，靠具體能力建立信任。 */}
            <div className="grid grid-cols-3 gap-3 animate-fade-in-up" data-mobile-visible="true" style={{ animationDelay: "0.95s", opacity: 0 }}>
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

          {/* RIGHT ─ AI 引擎動畫（2026-10-26 取代舊 Dashboard 示意圖，見 HeroAiEngine） */}
          <div
            className="relative hidden lg:flex items-center justify-center animate-fade-in-up" data-mobile-visible="true"
            style={{ animationDelay: "0.25s", opacity: 0 }}
          >
            <HeroAiEngine />
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

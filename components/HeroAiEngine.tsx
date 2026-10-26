"use client";

/**
 * 首頁 Hero 右邊動畫（2026-10-26 取代舊「Dashboard」示意圖）
 *
 * 用一個畫面講清楚 ADWire 做咩：左邊係企業日常散落嘅資料／查詢，
 * 中間 ADWire AI 引擎（AI 自動化、系統開發、SEO／GEO 三個模組環繞運行），
 * 右邊係交付結果。每 2.6 秒輪一個場景，對應路徑、模組同結果會亮起。
 *
 * 刻意唔放任何數字：舊版 +128%／4.8%／24.5k／4.9 分全部係示範數據，
 * 容易被當成真實成效。底部標明「示意」。
 *
 * 效能：軌道用 useAnimationFrame 直接改 style（零 re-render）；
 * 數據粒子用 SVG <animateMotion>（GPU 合成，不觸發 layout）。
 * prefers-reduced-motion：停止軌道、粒子及自動輪播。
 */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationFrame, useReducedMotion } from "framer-motion";
import {
  MessageCircle, FileSpreadsheet, Globe, FileText,
  Bot, Database, Search, BarChart3, Cpu, Code2, Sparkles, Check,
} from "lucide-react";

const W = 560;
const H = 392;
const CX = 280;
const CY = 196;

const SCENES = [
  {
    input: { label: "WhatsApp 查詢", Icon: MessageCircle },
    output: { label: "AI 起草回覆", Icon: Bot },
    module: 0,
    log: ["收到客人查詢", "AI 由知識庫搵答案", "同事確認後即時回覆"],
  },
  {
    input: { label: "Excel／訂單", Icon: FileSpreadsheet },
    output: { label: "CRM 一客一紀錄", Icon: Database },
    module: 1,
    log: ["匯入散落資料", "自動合併重複客戶", "跟進提醒已派發"],
  },
  {
    input: { label: "網站內容", Icon: Globe },
    output: { label: "Google＋AI 搜尋", Icon: Search },
    module: 2,
    log: ["檢查收錄及速度", "按搜尋意圖重整內容", "提交索引，追蹤 AI 引用"],
  },
  {
    input: { label: "PDF 單據", Icon: FileText },
    output: { label: "即時管理報表", Icon: BarChart3 },
    module: 0,
    log: ["AI 擷取文件欄位", "有疑問嘅標示俾人核對", "報表自動更新"],
  },
] as const;

const MODULES = [
  { label: "AI 自動化", Icon: Cpu, color: "#a78bfa" },
  { label: "系統開發", Icon: Code2, color: "#60a5fa" },
  { label: "SEO／GEO", Icon: Search, color: "#34d399" },
] as const;

// chip 用固定闊度（佔容器 %），令唔同屏幕闊度都唔會凸出界
const IN_W = 0.235;
const OUT_W = 0.265;
const IN_X = W * IN_W;          // 輸入 chip 右邊錨點
const OUT_X = W * (1 - OUT_W); // 輸出 chip 左邊錨點
// 刻意避開中線：軌道左右兩端喺 y=CY，唔好同 chip 重疊
const ROW_Y = [44, 124, 268, 348];

const inPath = (y: number) => `M${IN_X},${y} C${IN_X + 90},${y} ${CX - 120},${CY} ${CX - 58},${CY}`;
const outPath = (y: number) => `M${CX + 58},${CY} C${CX + 120},${CY} ${OUT_X - 90},${y} ${OUT_X},${y}`;
const pct = (v: number, total: number) => `${(v / total) * 100}%`;

function Orbit({ active, reduced }: { active: number; reduced: boolean }) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const angle = useRef(0);

  const place = (a: number) => {
    MODULES.forEach((_, i) => {
      const el = refs.current[i];
      if (!el) return;
      const t = a + (i * Math.PI * 2) / MODULES.length;
      const x = CX + Math.cos(t) * 124;
      const y = CY + Math.sin(t) * 58;
      const depth = (Math.sin(t) + 1) / 2; // 0 = 後面, 1 = 前面
      el.style.left = pct(x, W);
      el.style.top = pct(y, H);
      el.style.transform = `translate(-50%, -50%) scale(${0.72 + depth * 0.4})`;
      el.style.zIndex = depth > 0.5 ? "30" : "5";
      el.style.opacity = String(0.3 + depth * 0.7);
    });
  };

  useEffect(() => place(0.6), []); // eslint-disable-line react-hooks/exhaustive-deps
  useAnimationFrame((_, delta) => {
    if (reduced) return;
    angle.current += delta * 0.00035;
    place(angle.current);
  });

  return (
    <>
      {MODULES.map(({ label, Icon, color }, i) => (
        <div
          key={label}
          ref={(el) => { refs.current[i] = el; }}
          className="absolute"
          style={{ left: pct(CX, W), top: pct(CY, H) }}
        >
          <div
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs xl:text-[13px] font-bold whitespace-nowrap backdrop-blur-md transition-all duration-500 ${
              active === i ? "bg-white text-[#0f4c81] border-white shadow-[0_0_24px_rgba(255,255,255,0.45)]" : "bg-white/10 text-white border-white/20"
            }`}
          >
            <Icon size={13} style={{ color: active === i ? "#0f4c81" : color }} />
            {label}
          </div>
        </div>
      ))}
    </>
  );
}

export default function HeroAiEngine() {
  const reduced = useReducedMotion() ?? false;
  const [scene, setScene] = useState(0);
  const [hover, setHover] = useState(false);
  const tiltRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !tiltRef.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -10;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 12;
    tiltRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  };
  const onLeave = () => {
    setHover(false);
    if (tiltRef.current) tiltRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
  };

  useEffect(() => {
    if (reduced || hover) return;
    const id = setInterval(() => setScene((s) => (s + 1) % SCENES.length), 2600);
    return () => clearInterval(id);
  }, [reduced, hover]);

  const current = SCENES[scene];

  return (
    <div
      className="relative w-full max-w-[600px] select-none"
      style={{ aspectRatio: `${W} / ${H + 96}` }}
      onMouseEnter={() => setHover(true)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      aria-label="示意：ADWire 用 AI、系統及 SEO 把企業日常資料變成成果"
      role="img"
    >
      <div className="absolute inset-0" style={{ perspective: "1100px" }}>
      <div ref={tiltRef} className="absolute inset-x-0 top-0 transition-transform duration-300 ease-out" style={{ aspectRatio: `${W} / ${H}`, transformStyle: "preserve-3d" }}>
        {/* 旋轉光環 */}
        <div
          aria-hidden="true"
          className="absolute rounded-full motion-safe:animate-[spin_12s_linear_infinite]"
          style={{
            left: pct(CX - 112, W), top: pct(CY - 112, H), width: pct(224, W), height: pct(224, H),
            background: "conic-gradient(from 0deg, transparent 0deg, rgba(245,166,35,0.0) 200deg, rgba(245,166,35,0.75) 300deg, rgba(96,165,250,0.6) 345deg, transparent 360deg)",
            WebkitMask: "radial-gradient(circle, transparent 60%, #000 61%, #000 66%, transparent 67%)",
            mask: "radial-gradient(circle, transparent 60%, #000 61%, #000 66%, transparent 67%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute rounded-full motion-safe:animate-[spin_22s_linear_infinite_reverse] border border-dashed border-white/15"
          style={{ left: pct(CX - 96, W), top: pct(CY - 96, H), width: pct(192, W), height: pct(192, H) }}
        />

        {/* 連線及數據粒子 */}
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id="heroIn" x1="0" x2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="heroOut" x1="0" x2="1">
              <stop offset="0%" stopColor="#f5a623" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f5a623" stopOpacity="0.15" />
            </linearGradient>
            <filter id="heroGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <ellipse cx={CX} cy={CY} rx="124" ry="58" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

          {ROW_Y.map((y, i) => {
            const on = i === scene;
            return (
              <g key={i}>
                <path id={`hin${i}`} d={inPath(y)} fill="none" stroke="url(#heroIn)" strokeWidth={on ? 2.2 : 1} strokeOpacity={on ? 1 : 0.35} style={{ transition: "all .5s" }} />
                <path id={`hout${i}`} d={outPath(y)} fill="none" stroke="url(#heroOut)" strokeWidth={on ? 2.2 : 1} strokeOpacity={on ? 1 : 0.35} style={{ transition: "all .5s" }} />
                {!reduced && [0, 1].map((k) => (
                  <g key={k}>
                    <circle r={on ? 4 : 2.2} fill="#93c5fd" filter="url(#heroGlow)" opacity={on ? 1 : 0.5}>
                      <animateMotion dur={on ? "1.3s" : "3.2s"} repeatCount="indefinite" begin={`${k * (on ? 0.65 : 1.6) + i * 0.3}s`}>
                        <mpath href={`#hin${i}`} />
                      </animateMotion>
                    </circle>
                    <circle r={on ? 4 : 2.2} fill="#fcd34d" filter="url(#heroGlow)" opacity={on ? 1 : 0.5}>
                      <animateMotion dur={on ? "1.3s" : "3.2s"} repeatCount="indefinite" begin={`${k * (on ? 0.65 : 1.6) + i * 0.3 + 0.4}s`}>
                        <mpath href={`#hout${i}`} />
                      </animateMotion>
                    </circle>
                  </g>
                ))}
              </g>
            );
          })}
        </svg>

        {/* 輸入 */}
        {SCENES.map(({ input: { label, Icon } }, i) => (
          <div
            key={label}
            className={`absolute -translate-y-1/2 flex items-center gap-2 rounded-xl border px-2.5 py-2.5 text-xs xl:text-[13px] font-semibold whitespace-nowrap overflow-hidden transition-all duration-500 ${
              i === scene ? "bg-blue-500/25 border-blue-300/60 text-white shadow-[0_0_20px_rgba(96,165,250,0.45)] scale-105" : "bg-white/[0.06] border-white/15 text-gray-300"
            }`}
            style={{ left: 0, width: `${IN_W * 100}%`, top: pct(ROW_Y[i], H) }}
          >
            <Icon size={14} className="text-blue-300 shrink-0" />
            {label}
          </div>
        ))}

        {/* 輸出 */}
        {SCENES.map(({ output: { label, Icon } }, i) => (
          <div
            key={label}
            className={`absolute -translate-y-1/2 flex items-center gap-2 rounded-xl border px-2.5 py-2.5 text-xs xl:text-[13px] font-semibold whitespace-nowrap overflow-hidden transition-all duration-500 ${
              i === scene ? "bg-[#f5a623]/25 border-[#f5a623]/70 text-white shadow-[0_0_20px_rgba(245,166,35,0.5)] scale-105" : "bg-white/[0.06] border-white/15 text-gray-300"
            }`}
            style={{ left: pct(OUT_X, W), width: `${OUT_W * 100}%`, top: pct(ROW_Y[i], H) }}
          >
            <Icon size={14} className="text-[#f5a623] shrink-0" />
            {label}
            {i === scene && <Check size={12} className="text-green-300 shrink-0 ml-auto" />}
          </div>
        ))}

        {/* 核心 */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
          style={{ left: pct(CX, W), top: pct(CY, H), width: pct(132, W), aspectRatio: "1" }}
        >
          <div className="absolute inset-0 rounded-full bg-[#f5a623]/30 blur-2xl motion-safe:animate-pulse" aria-hidden="true" />
          {!reduced && (
            <motion.div
              key={`burst${scene}`}
              aria-hidden="true"
              className="absolute inset-0 rounded-full border-2 border-[#f5a623]"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 2.6, opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          )}
          <div className="relative w-full h-full rounded-full border border-white/30 bg-[radial-gradient(circle_at_35%_30%,#3b82f6_0%,#0f4c81_45%,#0a1d3d_100%)] shadow-[0_0_40px_rgba(59,130,246,0.55),inset_0_0_24px_rgba(255,255,255,0.15)] flex flex-col items-center justify-center text-center">
            <Sparkles size={26} className="text-[#f5a623] mb-1" />
            <span className="text-[10px] tracking-[0.18em] text-blue-200 font-bold">ADWIRE</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={MODULES[current.module].label + scene}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="text-sm font-bold text-white"
              >
                {MODULES[current.module].label}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <Orbit active={current.module} reduced={reduced} />
      </div>
      </div>

      {/* 底部流程紀錄 */}
      <div className="absolute inset-x-6 bottom-0 rounded-2xl border border-white/15 bg-[#071226]/70 backdrop-blur-md px-4 py-3 font-mono">
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 motion-safe:animate-pulse" />
            {current.input.label} → {current.output.label}
          </span>
          <span className="text-[10px] text-gray-500">示意流程・實際按項目設計</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.ol
            key={scene}
            initial="hide"
            animate="show"
            exit={{ opacity: 0 }}
            variants={{ show: { transition: { staggerChildren: 0.35 } } }}
            className="grid grid-cols-3 gap-2"
          >
            {current.log.map((line, i) => (
              <motion.li
                key={line}
                variants={{ hide: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
                className="flex items-start gap-1.5 text-xs leading-snug text-gray-200"
              >
                <span className="mt-[1px] text-[#f5a623]">{String(i + 1).padStart(2, "0")}</span>
                {line}
              </motion.li>
            ))}
          </motion.ol>
        </AnimatePresence>
      </div>
    </div>
  );
}

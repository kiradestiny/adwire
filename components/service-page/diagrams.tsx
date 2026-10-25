"use client";

/**
 * 服務頁「做法圖解」動畫（2026-10-25）
 *
 * 每個圖都接收 active（目前步驟 0–3），同左邊步驟清單同步高亮，
 * 令客人一路睇步驟、一路睇到概念點樣運作。全部係 HTML／SVG，
 * 唔靠圖片，所以清晰、快、文字可以被搜尋引擎讀到。
 */
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  FileSpreadsheet, MessageCircle, Receipt, ShoppingCart, Database, Bell, Users,
  BarChart3, Package, FileText, BookOpen, Bot, Quote, UserCheck, Send, HelpCircle,
  Workflow, Search, Megaphone, ClipboardCheck, Rocket, TrendingUp, Star, Wrench,
  Sparkles, CheckCircle2,
} from "lucide-react";
import type { ServicePageKey } from "@/lib/service-pages/types";

const NAVY = "#0f4c81";
const GOLD = "#f5a623";

// ─── 通用流程圖：幾欄節點 + 流動中嘅連接線 ─────────────────────────────

interface FlowNode {
  icon: LucideIcon;
  label: string;
  sub?: string;
}
interface FlowColumn {
  title: string;
  nodes: FlowNode[];
}

function Connector({ live }: { live: boolean }) {
  return (
    <div className="relative flex-shrink-0 self-center md:w-8 md:h-0.5 w-0.5 h-6 bg-gray-200 rounded-full overflow-visible">
      {live && (
        <>
          <motion.span
            className="hidden md:block absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
            style={{ background: GOLD }}
            initial={{ left: "0%" }}
            animate={{ left: ["0%", "100%"] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.span
            className="md:hidden absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
            style={{ background: GOLD }}
            initial={{ top: "0%" }}
            animate={{ top: ["0%", "100%"] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}
    </div>
  );
}

function FlowDiagram({ columns, active }: { columns: FlowColumn[]; active: number }) {
  return (
    <div className="flex flex-col md:flex-row items-stretch gap-2 md:gap-1">
      {columns.map((col, ci) => {
        const isActive = ci === active;
        const isDone = ci < active;
        return (
          <div key={col.title} className="flex flex-col md:flex-row items-center gap-2 md:gap-1 flex-1 min-w-0">
            {ci > 0 && <Connector live={ci === active} />}
            <motion.div
              animate={{ scale: isActive ? 1.03 : 1, opacity: isActive || isDone ? 1 : 0.55 }}
              transition={{ duration: 0.35 }}
              className="w-full rounded-2xl border-2 bg-white p-3 md:p-2.5 lg:p-3"
              style={{
                borderColor: isActive ? GOLD : isDone ? "#cfe0ef" : "#eef2f6",
                boxShadow: isActive ? "0 10px 30px -12px rgba(245,166,35,.55)" : "none",
              }}
            >
              <p
                className="text-[11px] font-bold tracking-wide mb-2 text-center"
                style={{ color: isActive ? GOLD : NAVY }}
              >
                {col.title}
              </p>
              <div className="flex md:flex-col flex-wrap justify-center gap-1.5">
                {col.nodes.map((n, ni) => (
                  <motion.div
                    key={n.label}
                    initial={false}
                    animate={isActive ? { y: [0, -3, 0] } : { y: 0 }}
                    transition={{ duration: 1.2, delay: ni * 0.15, repeat: isActive ? Infinity : 0 }}
                    className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2 py-1.5 min-w-0"
                  >
                    <n.icon size={14} style={{ color: isActive ? GOLD : NAVY }} className="flex-shrink-0" />
                    <span className="text-xs text-gray-700 leading-tight">
                      {n.label}
                      {n.sub && <span className="block text-[10px] text-gray-400">{n.sub}</span>}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

const SYSTEM_COLUMNS: FlowColumn[] = [
  { title: "散落資料", nodes: [
    { icon: FileSpreadsheet, label: "Excel" },
    { icon: MessageCircle, label: "WhatsApp" },
    { icon: Receipt, label: "紙本單據" },
    { icon: ShoppingCart, label: "網店訂單" },
  ]},
  { title: "一套系統", nodes: [
    { icon: Database, label: "單一資料庫" },
    { icon: Users, label: "一客一紀錄" },
  ]},
  { title: "自動跟進", nodes: [
    { icon: Bell, label: "到期提醒" },
    { icon: UserCheck, label: "分派同事" },
  ]},
  { title: "即時報表", nodes: [
    { icon: BarChart3, label: "銷售" },
    { icon: Package, label: "庫存" },
  ]},
];

const AI_COLUMNS: FlowColumn[] = [
  { title: "你的資料", nodes: [
    { icon: FileText, label: "FAQ" },
    { icon: BookOpen, label: "SOP" },
    { icon: Package, label: "產品資料" },
  ]},
  { title: "知識庫", nodes: [
    { icon: Database, label: "RAG 知識庫", sub: "按權限存取" },
  ]},
  { title: "AI 起草", nodes: [
    { icon: Bot, label: "答案草稿" },
    { icon: Quote, label: "附引用來源" },
  ]},
  { title: "人工覆核", nodes: [
    { icon: UserCheck, label: "同事確認" },
    { icon: Send, label: "回覆客人" },
  ]},
];

const AGENCY_COLUMNS: FlowColumn[] = [
  { title: "業務問題", nodes: [
    { icon: HelpCircle, label: "最想改善咩？" },
  ]},
  { title: "判斷方向", nodes: [
    { icon: Workflow, label: "流程問題", sub: "→ AI／自動化" },
    { icon: Search, label: "冇人搵到", sub: "→ SEO／GEO" },
    { icon: Megaphone, label: "查詢不足", sub: "→ 廣告／內容" },
  ]},
  { title: "可行性", nodes: [
    { icon: ClipboardCheck, label: "資料、權限", sub: "第三方限制" },
  ]},
  { title: "試點擴大", nodes: [
    { icon: Rocket, label: "小範圍試點" },
    { icon: TrendingUp, label: "有效先擴大" },
  ]},
];

// ─── 網頁設計：手機版網站逐段高亮 ─────────────────────────────────────

function WebDiagram({ active }: { active: number }) {
  const blocks = [
    { label: "首屏：一句講清你做咩", h: "h-20" },
    { label: "信任：案例、客戶、評價", h: "h-14" },
    { label: "疑慮：收費、流程、FAQ", h: "h-14" },
  ];
  return (
    <div className="flex items-center justify-center gap-6 py-2">
      <div className="relative w-[200px] rounded-[28px] bg-gray-900 p-2 shadow-2xl">
        <div className="rounded-[22px] bg-white overflow-hidden">
          <div className="h-5 bg-gray-100 flex items-center justify-center">
            <div className="w-12 h-1.5 rounded-full bg-gray-300" />
          </div>
          <div className="p-2.5 space-y-2">
            {blocks.map((b, i) => (
              <motion.div
                key={b.label}
                animate={{
                  borderColor: active === i ? GOLD : "rgba(0,0,0,0)",
                  backgroundColor: active === i ? "#fff8eb" : "#f3f6fa",
                }}
                className={`${b.h} rounded-lg border-2 p-2 flex flex-col justify-between`}
              >
                <div className="space-y-1">
                  <div className="h-1.5 w-3/4 rounded bg-[#0f4c81]/70" />
                  <div className="h-1.5 w-1/2 rounded bg-gray-300" />
                </div>
                <p className="text-[9px] leading-tight text-gray-500">{b.label}</p>
              </motion.div>
            ))}
            <motion.div
              animate={active === 3 ? { scale: [1, 1.06, 1] } : { scale: 1 }}
              transition={{ duration: 0.9, repeat: active === 3 ? Infinity : 0 }}
              className="h-9 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: active === 3 ? "#25D366" : NAVY }}
            >
              WhatsApp 查詢
            </motion.div>
          </div>
        </div>
        <AnimatePresence>
          {active === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: 20 }}
              animate={{ opacity: 1, y: -6, x: 40 }}
              exit={{ opacity: 0 }}
              className="absolute -top-2 right-0 translate-x-full rounded-xl bg-white shadow-lg border border-gray-100 px-3 py-2 text-xs font-semibold text-gray-800 flex items-center gap-1.5 whitespace-nowrap"
            >
              <CheckCircle2 size={14} className="text-green-600" /> 新查詢
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="hidden sm:flex flex-col gap-2 text-xs">
        {["3 秒內知道你做咩", "相信你做得到", "冇疑問", "一按就聯絡"].map((t, i) => (
          <motion.div
            key={t}
            animate={{ opacity: active === i ? 1 : 0.4, x: active === i ? 4 : 0 }}
            className="flex items-center gap-2 font-medium"
            style={{ color: active === i ? NAVY : "#6b7280" }}
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: active === i ? GOLD : "#cbd5e1" }}
            >
              {i + 1}
            </span>
            {t}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── SEO + GEO：搜尋結果排名上升 + AI 回答引用 ───────────────────────

function SeoDiagram({ active }: { active: number }) {
  // 「你的網站」喺唔同步驟嘅位置（示意）
  const positions = [4, 3, 1, 0];
  const pos = positions[active] ?? 4;
  const others = ["對手 A", "對手 B", "對手 C", "對手 D"];
  const list: { id: string; mine: boolean }[] = others.map((o) => ({ id: o, mine: false }));
  list.splice(pos, 0, { id: "你的網站", mine: true });

  return (
    <div className="grid gap-4 sm:grid-cols-[1.15fr_1fr] items-start">
      <div className="rounded-2xl border border-gray-200 bg-white p-3">
        <div className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 mb-3">
          <Search size={13} className="text-gray-400" />
          <span className="text-xs text-gray-500">香港 + 你的服務</span>
        </div>
        <ul className="space-y-1.5">
          {list.map((r) => (
            <motion.li
              layout
              key={r.id}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="rounded-lg px-2.5 py-2 border"
              style={{
                borderColor: r.mine ? GOLD : "#eef2f6",
                background: r.mine ? "#fff8eb" : "#fff",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs ${r.mine ? "font-bold text-[#0f4c81]" : "text-gray-500"}`}>{r.id}</span>
                {r.mine && active === 0 && <Wrench size={12} className="text-[#f5a623]" />}
                {r.mine && active >= 2 && <TrendingUp size={12} className="text-green-600" />}
              </div>
              <div className="mt-1 h-1 rounded bg-gray-100 w-4/5" />
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-3">
        <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-gray-700">
          <Sparkles size={13} style={{ color: GOLD }} /> AI 搜尋回答
        </div>
        <div className="rounded-xl bg-gray-50 p-2.5 text-[11px] leading-relaxed text-gray-600 min-h-[92px]">
          {active < 3 ? (
            <div className="space-y-1.5">
              <div className="h-1.5 rounded bg-gray-200 w-full" />
              <div className="h-1.5 rounded bg-gray-200 w-11/12" />
              <div className="h-1.5 rounded bg-gray-200 w-2/3" />
            </div>
          ) : (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              香港有幾間提供呢類服務的公司，例如……
              <span className="inline-flex items-center gap-1 ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ background: NAVY }}>
                <Star size={9} /> 來源：你的網站
              </span>
            </motion.p>
          )}
        </div>
        <p className="mt-2 text-[10px] text-gray-400 leading-snug">
          示意圖，非實際搜尋結果。排名及 AI 引用由平台決定，任何供應商都無法保證。
        </p>
      </div>
    </div>
  );
}

export default function ServiceDiagram({ kind, active }: { kind: ServicePageKey; active: number }) {
  switch (kind) {
    case "system":
      return <FlowDiagram columns={SYSTEM_COLUMNS} active={active} />;
    case "ai":
      return <FlowDiagram columns={AI_COLUMNS} active={active} />;
    case "ai-agency":
      return <FlowDiagram columns={AGENCY_COLUMNS} active={active} />;
    case "web":
      return <WebDiagram active={active} />;
    case "seo":
      return <SeoDiagram active={active} />;
    default:
      return null;
  }
}

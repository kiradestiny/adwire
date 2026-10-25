"use client";

/**
 * 服務頁統一模板（2026-10-25）
 *
 * 轉換路線：Hero（講清做咩、幫邊類客）→ 30 秒自我檢查（即刻知道適唔適合）
 * → 客人常見問題 → 做法圖解 → 交付 → 收費 → 真實案例 → 流程 → FAQ → CTA。
 * 視覺沿用全站舊風格：深藍 #0f4c81 + 金色 #f5a623。
 */
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Check, X, ChevronDown, MessageCircle, Sparkles, CheckCircle2,
  AlertCircle, Compass, ExternalLink,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import ServiceDiagram from "@/components/service-page/diagrams";
import { getWhatsAppUrl } from "@/lib/site-config";
import { SERVICE_FIT } from "@/lib/service-fit";
import { SERVICE_DEEP_DIVE } from "@/lib/service-deep-dive";
import { SERVICE_TECH } from "@/lib/service-tech-stack";
import type { FitOption, ServicePageData } from "@/lib/service-pages/types";

const NAVY = "#0f4c81";
const GOLD = "#f5a623";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

function SectionHead({ eyebrow, title, intro, light }: { eyebrow?: string; title: string; intro?: string; light?: boolean }) {
  return (
    <motion.div {...fadeUp} data-mobile-visible="true" className="max-w-3xl mb-10 md:mb-12">
      {eyebrow && (
        <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3" style={{ color: GOLD }}>
          {eyebrow}
        </p>
      )}
      <h2 className={`text-2xl md:text-4xl font-bold leading-tight mb-4 ${light ? "text-white" : "text-[#0f4c81]"}`}>{title}</h2>
      {intro && <p className={`leading-relaxed md:text-lg ${light ? "text-blue-100" : "text-gray-600"}`}>{intro}</p>}
    </motion.div>
  );
}

// ─── 1. Hero ──────────────────────────────────────────────────────────

function Hero({ d }: { d: ServicePageData }) {
  return (
    <section className="pt-28 md:pt-32 pb-16 md:pb-20 bg-[#0f4c81] text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div data-mobile-glow="true" aria-hidden="true" className="absolute top-[-20%] right-[-10%] w-[560px] h-[560px] bg-[#f5a623]/10 rounded-full filter blur-[110px]" />
        <div data-mobile-glow="true" aria-hidden="true" className="absolute bottom-[-25%] left-[-10%] w-[480px] h-[480px] bg-blue-400/15 rounded-full filter blur-[110px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <nav aria-label="breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-blue-200">
            <li><Link href="/" className="hover:text-white transition-colors">首頁</Link></li>
            <li className="text-blue-400">/</li>
            <li><Link href="/services/" className="hover:text-white transition-colors">服務</Link></li>
            <li className="text-blue-400">/</li>
            <li className="text-white font-medium">{d.crumb}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center">
          <motion.div data-mobile-visible="true" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#f5a623] text-xs md:text-sm font-bold mb-6 tracking-[0.12em]">
              {d.eyebrow}
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-[3.25rem] font-bold leading-[1.2] tracking-tight mb-6">
              {d.h1[0]}
              <span className="block text-[#f5a623] text-2xl md:text-4xl lg:text-[2.6rem] mt-2">{d.h1[1]}</span>
            </h1>
            <p className="text-base md:text-lg text-blue-100 leading-relaxed mb-7">{d.lead}</p>

            <ul className="space-y-2.5 mb-8">
              {d.promises.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm md:text-base text-white/90">
                  <CheckCircle2 size={18} className="text-[#f5a623] mt-0.5 flex-shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={getWhatsAppUrl(d.whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#f5a623] text-[#0f4c81] px-7 py-3.5 rounded-full font-bold hover:bg-[#ffb940] transition-colors shadow-lg shadow-black/20"
              >
                <MessageCircle size={18} /> WhatsApp 免費諮詢
              </a>
              <a
                href="#fit"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold border border-white/30 hover:bg-white/10 transition-colors"
              >
                30 秒睇下適唔適合你 <ChevronDown size={18} />
              </a>
            </div>
          </motion.div>

          <motion.div
            data-mobile-visible="true"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-3xl overflow-hidden border border-white/15 shadow-2xl shadow-black/30 bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={d.heroImage.src}
                alt={d.heroImage.alt}
                width={1600}
                height={900}
                className="w-full h-auto block"
                fetchPriority="high"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── 2. 區內導覽 ──────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "fit", label: "適合你嗎" },
  { id: "how", label: "做法" },
  { id: "deliverables", label: "交付" },
  { id: "pricing", label: "收費" },
  { id: "proof", label: "案例" },
  { id: "process", label: "流程" },
  { id: "faq", label: "常見問題" },
];

function SubNav({ whatsapp }: { whatsapp: string }) {
  const [current, setCurrent] = useState("fit");
  useEffect(() => {
    const els = NAV_ITEMS.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setCurrent(vis[0].target.id);
      },
      { rootMargin: "-130px 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav aria-label="本頁內容" className="sticky top-[72px] md:top-[80px] z-40 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">
        <div className="flex-1 flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-2.5 -mx-1 px-1">
          {NAV_ITEMS.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className={`relative whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                current === n.id ? "text-white" : "text-gray-600 hover:text-[#0f4c81]"
              }`}
            >
              {current === n.id && (
                <motion.span layoutId="svcNavPill" className="absolute inset-0 rounded-full bg-[#0f4c81]" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
              )}
              <span className="relative">{n.label}</span>
            </a>
          ))}
        </div>
        <a
          href={getWhatsAppUrl(whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 bg-[#f5a623] text-[#0f4c81] px-4 py-1.5 rounded-full text-sm font-bold hover:bg-[#ffb940] transition-colors flex-shrink-0"
        >
          <MessageCircle size={15} /> 免費諮詢
        </a>
      </div>
    </nav>
  );
}

// ─── 3. 30 秒自我檢查 ────────────────────────────────────────────────

const VERDICT_STYLE: Record<FitOption["verdict"], { label: string; icon: typeof Check; cls: string }> = {
  fit: { label: "我們可以直接幫到你", icon: CheckCircle2, cls: "bg-green-50 text-green-800 border-green-200" },
  maybe: { label: "可以做，但要先釐清幾點", icon: AlertCircle, cls: "bg-amber-50 text-amber-800 border-amber-200" },
  other: { label: "建議你先看另一個服務", icon: Compass, cls: "bg-blue-50 text-[#0f4c81] border-blue-200" },
};

function FitCheck({ d }: { d: ServicePageData }) {
  const [picked, setPicked] = useState<number | null>(null);
  const opt = picked === null ? null : d.fit.options[picked];
  const fitList = SERVICE_FIT[d.key];

  return (
    <section id="fit" className="scroll-mt-32 py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow="30-second check" title={d.fit.title} intro={d.fit.intro} />

        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6 lg:gap-10 items-start">
          <div role="radiogroup" aria-label={d.fit.title} className="grid gap-2.5">
            {d.fit.options.map((o, i) => {
              const on = picked === i;
              return (
                <button
                  key={o.label}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setPicked(i)}
                  className={`text-left flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 transition-all ${
                    on ? "border-[#f5a623] bg-white shadow-lg shadow-[#f5a623]/10" : "border-transparent bg-white hover:border-[#0f4c81]/20"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      on ? "border-[#f5a623] bg-[#f5a623]" : "border-gray-300"
                    }`}
                  >
                    {on && <Check size={14} className="text-white" />}
                  </span>
                  <span className={`text-sm md:text-base ${on ? "text-[#0f4c81] font-semibold" : "text-gray-700"}`}>{o.label}</span>
                </button>
              );
            })}
          </div>

          <div className="lg:sticky lg:top-40">
            <AnimatePresence mode="wait">
              {opt ? (
                <motion.div
                  key={picked}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-3xl bg-white border border-gray-100 shadow-xl p-6 md:p-8"
                  aria-live="polite"
                >
                  {(() => {
                    const v = VERDICT_STYLE[opt.verdict];
                    return (
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold mb-4 ${v.cls}`}>
                        <v.icon size={16} /> {v.label}
                      </span>
                    );
                  })()}
                  <p className="text-gray-700 leading-relaxed md:text-lg mb-6">{opt.answer}</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {opt.href && (
                      <Link
                        href={opt.href}
                        className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-bold transition-colors ${
                          opt.verdict === "other" ? "bg-[#0f4c81] text-white hover:bg-[#0d3f6b]" : "border border-[#0f4c81]/30 text-[#0f4c81] hover:bg-blue-50"
                        }`}
                      >
                        {opt.hrefLabel ?? "了解更多"} <ArrowRight size={16} />
                      </Link>
                    )}
                    <a
                      href={getWhatsAppUrl(`${d.whatsappMessage}\n我的情況：${opt.label}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-bold transition-colors ${
                        opt.verdict === "other" ? "border border-gray-200 text-gray-700 hover:bg-gray-50" : "bg-[#f5a623] text-[#0f4c81] hover:bg-[#ffb940]"
                      }`}
                    >
                      <MessageCircle size={16} /> 將我的情況 WhatsApp 給你們
                    </a>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-3xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-500"
                >
                  <Sparkles className="mx-auto mb-3 text-[#f5a623]" />
                  揀左邊最似你嘅情況，呢度會即刻顯示我們會點做。
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {fitList && (
          <motion.div {...fadeUp} data-mobile-visible="true" className="mt-12 grid md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-green-200 p-6">
              <p className="font-bold text-green-800 mb-4 flex items-center gap-2"><Check size={18} /> 較適合</p>
              <ul className="space-y-2.5">
                {fitList.suitable.map((s) => (
                  <li key={s} className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed">
                    <Check size={15} className="text-green-600 mt-0.5 flex-shrink-0" /> <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <p className="font-bold text-gray-700 mb-4 flex items-center gap-2"><X size={18} /> 未必適合</p>
              <ul className="space-y-2.5">
                {fitList.notSuitable.map((s) => (
                  <li key={s} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
                    <X size={15} className="text-gray-400 mt-0.5 flex-shrink-0" /> <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ─── 4. 客人常見問題 ─────────────────────────────────────────────────

function Problems({ d }: { d: ServicePageData }) {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow="Sound familiar?" title={d.problems.title} intro={d.problems.intro} />
        <div className="grid md:grid-cols-2 gap-5">
          {d.problems.items.map((p, i) => (
            <motion.div
              key={p.problem}
              {...fadeUp}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              data-mobile-visible="true"
              className="group rounded-2xl border border-gray-100 bg-white p-6 md:p-7 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0f4c81]/5 text-[#0f4c81] flex items-center justify-center flex-shrink-0 group-hover:bg-[#f5a623] group-hover:text-white transition-colors">
                  <p.icon size={22} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg leading-snug mb-3">{p.problem}</p>
                  <p className="text-gray-600 leading-relaxed flex items-start gap-2">
                    <ArrowRight size={16} className="text-[#f5a623] mt-1 flex-shrink-0" />
                    <span>{p.answer}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 5. 做法圖解（步驟同動畫同步）────────────────────────────────────

function HowItWorks({ d }: { d: ServicePageData }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = d.how.steps.length;

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((a) => (a + 1) % n), 2800);
    return () => clearInterval(t);
  }, [paused, n]);

  return (
    <section id="how" className="scroll-mt-32 py-16 md:py-24 bg-gradient-to-b from-white to-[#f4f8fc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow="How it works" title={d.how.title} intro={d.how.intro} />
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-12 items-center">
          <ol className="space-y-3" onMouseLeave={() => setPaused(false)}>
            {d.how.steps.map((s, i) => {
              const on = i === active;
              return (
                <li key={s.title}>
                  <button
                    type="button"
                    onMouseEnter={() => { setPaused(true); setActive(i); }}
                    onFocus={() => { setPaused(true); setActive(i); }}
                    onClick={() => { setPaused(true); setActive(i); }}
                    className={`w-full text-left rounded-2xl border-2 p-4 md:p-5 transition-all ${
                      on ? "border-[#f5a623] bg-white shadow-lg" : "border-transparent bg-white/60 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors"
                        style={{ background: on ? GOLD : "#e5edf5", color: on ? "#fff" : NAVY }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <h3 className={`font-bold md:text-lg ${on ? "text-[#0f4c81]" : "text-gray-800"}`}>{s.title}</h3>
                        <p className="text-sm md:text-base text-gray-600 leading-relaxed mt-1">{s.desc}</p>
                      </div>
                    </div>
                    {on && !paused && (
                      <motion.div
                        key={`bar-${active}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 2.8, ease: "linear" }}
                        className="mt-3 h-0.5 origin-left rounded-full bg-[#f5a623]/60"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
          <motion.div {...fadeUp} data-mobile-visible="true" className="rounded-3xl bg-white border border-gray-100 shadow-xl p-4 md:p-6">
            <ServiceDiagram kind={d.key} active={active} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── 6. 交付 ─────────────────────────────────────────────────────────

function Deliverables({ d }: { d: ServicePageData }) {
  return (
    <section id="deliverables" className="scroll-mt-32 py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow="What you get" title={d.deliverables.title} intro={d.deliverables.intro} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {d.deliverables.items.map((it, i) => (
            <motion.div
              key={it.title}
              {...fadeUp}
              transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
              data-mobile-visible="true"
              className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6 hover:bg-white hover:shadow-lg transition-all"
            >
              <it.icon size={26} className="text-[#f5a623] mb-4" />
              <h3 className="font-bold text-[#0f4c81] text-lg mb-2">{it.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{it.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 7. 比較表 ───────────────────────────────────────────────────────

function Compare({ d }: { d: ServicePageData }) {
  if (!d.compare) return null;
  const c = d.compare;
  const last = c.columns.length - 1;
  return (
    <section className="py-16 md:py-24 bg-[#f4f8fc]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow="Compare" title={c.title} intro={c.intro} />
        <motion.div {...fadeUp} data-mobile-visible="true" className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full min-w-[640px] text-sm md:text-base">
            <thead>
              <tr className="bg-[#0f4c81] text-white">
                {c.columns.map((col, i) => (
                  <th key={i} className={`px-4 md:px-6 py-4 text-left font-bold ${i === last ? "text-[#f5a623]" : ""}`}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {c.rows.map((r) => (
                <tr key={r.item}>
                  <th scope="row" className="px-4 md:px-6 py-4 text-left font-semibold text-gray-900 bg-gray-50/60 whitespace-nowrap">{r.item}</th>
                  {r.values.map((v, i) => (
                    <td key={i} className={`px-4 md:px-6 py-4 leading-relaxed ${i === r.values.length - 1 ? "text-[#0f4c81] font-medium bg-[#fff8eb]/60" : "text-gray-600"}`}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
        {c.footnote && <p className="mt-4 text-sm text-gray-500">{c.footnote}</p>}
      </div>
    </section>
  );
}

// ─── 8. 收費 ─────────────────────────────────────────────────────────

function Pricing({ d, whatsapp }: { d: ServicePageData; whatsapp: string }) {
  const p = d.pricing;
  return (
    <section id="pricing" className="scroll-mt-32 py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow="Pricing" title={p.title} intro={p.intro} />

        {p.tiers && (
          <div className="grid md:grid-cols-3 gap-5 mb-12">
            {p.tiers.map((t, i) => (
              <motion.div
                key={t.name}
                {...fadeUp}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                data-mobile-visible="true"
                className={`relative rounded-3xl p-7 flex flex-col ${
                  t.highlight ? "bg-[#0f4c81] text-white shadow-2xl md:-translate-y-2" : "bg-white border border-gray-200"
                }`}
              >
                {t.highlight && (
                  <span className="absolute -top-3 left-7 bg-[#f5a623] text-[#0f4c81] text-xs font-bold px-3 py-1 rounded-full">最多客人選擇</span>
                )}
                <h3 className={`font-bold text-lg ${t.highlight ? "text-white" : "text-[#0f4c81]"}`}>{t.name}</h3>
                <p className={`text-sm mb-4 ${t.highlight ? "text-blue-100" : "text-gray-500"}`}>{t.summary}</p>
                <p className="mb-5">
                  <span className={`text-3xl font-bold ${t.highlight ? "text-[#f5a623]" : "text-gray-900"}`}>{t.price}</span>
                  {t.unit && <span className={`text-sm ml-1 ${t.highlight ? "text-blue-100" : "text-gray-500"}`}>{t.unit}</span>}
                </p>
                <ul className="space-y-2 mb-6 flex-1">
                  {t.includes.map((x) => (
                    <li key={x} className={`flex items-start gap-2 text-sm ${t.highlight ? "text-white/90" : "text-gray-700"}`}>
                      <Check size={15} className="text-[#f5a623] mt-0.5 flex-shrink-0" /> <span>{x}</span>
                    </li>
                  ))}
                </ul>
                <p className={`text-xs mb-5 ${t.highlight ? "text-blue-100" : "text-gray-500"}`}>適合：{t.bestFor}</p>
                <a
                  href={getWhatsAppUrl(`${whatsapp}\n想查詢：${t.name}（${t.price}${t.unit ?? ""}）`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-bold transition-colors ${
                    t.highlight ? "bg-[#f5a623] text-[#0f4c81] hover:bg-[#ffb940]" : "border border-[#0f4c81]/30 text-[#0f4c81] hover:bg-blue-50"
                  }`}
                >
                  查詢此方案 <ArrowRight size={16} />
                </a>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div {...fadeUp} data-mobile-visible="true" className="rounded-3xl bg-gray-50 border border-gray-100 p-6 md:p-8">
          <h3 className="font-bold text-[#0f4c81] text-lg mb-5">{p.tiers ? "影響最終報價的因素" : "決定價錢的主要因素"}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
            {p.factors.map((f, i) => (
              <div key={f.title} className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-white border border-gray-200 text-[#0f4c81] text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <div>
                  <p className="font-semibold text-gray-900">{f.title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          {p.note && <p className="mt-6 pt-5 border-t border-gray-200 text-sm text-gray-600 leading-relaxed">{p.note}</p>}
        </motion.div>
      </div>
    </section>
  );
}

// ─── 9. 真實案例 ─────────────────────────────────────────────────────

function Proof({ d }: { d: ServicePageData }) {
  return (
    <section id="proof" className="scroll-mt-32 py-16 md:py-24 bg-[#0f4c81] relative overflow-hidden">
      <div aria-hidden="true" data-mobile-glow="true" className="absolute top-[-30%] left-[30%] w-[600px] h-[600px] bg-[#f5a623]/10 rounded-full blur-[120px]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHead eyebrow="Real projects" title={d.proof.title} intro={d.proof.intro} light />
        <div className="grid md:grid-cols-3 gap-5">
          {d.proof.items.map((p, i) => (
            <motion.div key={p.title} {...fadeUp} transition={{ duration: 0.45, delay: i * 0.08 }} data-mobile-visible="true">
              <Link
                href={p.href}
                className="group block h-full rounded-3xl bg-white overflow-hidden hover:-translate-y-1.5 hover:shadow-2xl transition-all"
              >
                {p.image ? (
                  <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={`${p.title} 網站截圖`} loading="lazy" width={1200} height={750} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : (
                  <div className="aspect-[16/10] bg-gradient-to-br from-[#f4f8fc] to-[#e3edf7] flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-[#0f4c81]">{p.stat}</span>
                    <span className="text-sm text-gray-600 mt-2">{p.statLabel}</span>
                  </div>
                )}
                <div className="p-6">
                  <p className="text-xs font-bold tracking-wide text-[#f5a623] mb-1.5">{p.industry}</p>
                  <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#0f4c81] transition-colors">{p.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{p.scope}</p>
                  {p.image && p.stat && (
                    <p className="text-sm"><span className="font-bold text-[#0f4c81]">{p.stat}</span> <span className="text-gray-500">{p.statLabel}</span></p>
                  )}
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#0f4c81] mt-2 group-hover:gap-2 transition-all">
                    查看項目 <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/portfolio/" className="inline-flex items-center gap-2 text-white font-semibold border-b border-[#f5a623] pb-0.5 hover:text-[#f5a623] transition-colors">
            查看全部客戶項目及成功案例 <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── 10. 流程 ────────────────────────────────────────────────────────

function Process({ d }: { d: ServicePageData }) {
  return (
    <section id="process" className="scroll-mt-32 py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow="Process" title={d.process.title} intro={d.process.intro} />
        <ol className="relative grid md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-4">
          <motion.div
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="hidden lg:block absolute top-5 left-[5%] right-[5%] h-0.5 bg-gradient-to-r from-[#0f4c81] to-[#f5a623] origin-left"
          />
          {d.process.steps.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 * i }}
              data-mobile-visible="true"
              className="relative"
            >
              <span className="relative z-10 w-10 h-10 rounded-full bg-[#0f4c81] text-white font-bold flex items-center justify-center mb-4 ring-4 ring-white">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-bold text-gray-900 mb-1.5">{s.title}</h3>
              {s.duration && <p className="text-xs font-semibold text-[#f5a623] mb-1.5">{s.duration}</p>}
              <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ─── 11. 深入了解（深度內容 + 技術規格，摺疊）──────────────────────────

function DeepDive({ d, extra }: { d: ServicePageData; extra?: ReactNode }) {
  const deep = SERVICE_DEEP_DIVE[d.key];
  const tech = SERVICE_TECH[d.key];
  if (!deep && !tech && !extra) return null;
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow="Go deeper" title={deep?.title ?? "深入了解"} intro={deep?.intro ?? "想了解更多細節，可以展開以下內容。"} />
        {extra}
        <div className="space-y-3">
          {deep?.sections.map((s) => (
            <details key={s.heading} className="group rounded-2xl bg-white border border-gray-100 open:shadow-md transition-shadow">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 md:px-6 py-4 md:py-5 font-bold text-gray-900">
                <span>{s.heading}</span>
                <ChevronDown size={18} className="text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" />
              </summary>
              <div className="px-5 md:px-6 pb-6 text-gray-600 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:mt-2 [&_a]:text-[#0f4c81] [&_a]:font-medium [&_p+p]:mt-2">
                <div dangerouslySetInnerHTML={{ __html: s.body }} />
                {s.link && (
                  <Link href={s.link.href} className="inline-flex items-center gap-1 text-[#0f4c81] text-sm font-semibold mt-3 hover:gap-2 transition-all">
                    延伸閱讀：{s.link.label} <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </details>
          ))}
          {tech && (
            <details className="group rounded-2xl bg-white border border-gray-100 open:shadow-md transition-shadow">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 md:px-6 py-4 md:py-5 font-bold text-gray-900">
                <span>{tech.title}（供 IT 同事參考）</span>
                <ChevronDown size={18} className="text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" />
              </summary>
              <div className="px-5 md:px-6 pb-6">
                <p className="text-gray-600 leading-relaxed mb-4">{tech.intro}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {tech.stack.map((t) => (
                    <span key={t} className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#0f4c81]/5 text-[#0f4c81]">{t}</span>
                  ))}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-100">
                        <th className="py-2 pr-4 font-semibold">層級</th>
                        <th className="py-2 pr-4 font-semibold">使用技術</th>
                        <th className="py-2 pr-4 font-semibold">原因</th>
                        <th className="py-2 font-semibold">與現有系統</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {tech.rows.map((r) => (
                        <tr key={r.layer} className="align-top">
                          <td className="py-3 pr-4 font-semibold text-gray-900 whitespace-nowrap">{r.layer}</td>
                          <td className="py-3 pr-4 text-gray-700">{r.use}</td>
                          <td className="py-3 pr-4 text-gray-600">{r.why}</td>
                          <td className="py-3 text-gray-600">{r.integrate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </details>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── 12. FAQ ─────────────────────────────────────────────────────────

const FAQ_VISIBLE = 8;

function Faq({ d }: { d: ServicePageData }) {
  const [open, setOpen] = useState<number | null>(0);
  const [showAll, setShowAll] = useState(false);
  return (
    <section id="faq" className="scroll-mt-32 py-16 md:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow="FAQ" title="常見問題" intro="以下問題來自客人實際查詢，答案先講結論，再講限制。" />
        <div className="space-y-3">
          {d.faqs.map((f, i) => {
            const isOpen = open === i;
            // 全部 FAQ 都喺 DOM（同 FAQPage schema 一致），只係摺埋第 9 條之後嘅
            const hidden = !showAll && i >= FAQ_VISIBLE;
            return (
              <div key={f.question} className={`rounded-2xl border transition-colors ${isOpen ? "border-[#0f4c81]/20 bg-[#f4f8fc]" : "border-gray-100 bg-white"} ${hidden ? "hidden" : ""}`}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-5 md:px-6 py-4 md:py-5"
                >
                  <h3 className="font-bold text-gray-900 md:text-lg">{f.question}</h3>
                  <ChevronDown size={18} className={`text-gray-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 md:px-6 pb-5 text-gray-600 leading-relaxed">{f.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {d.faqs.length > FAQ_VISIBLE && !showAll && (
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 text-sm font-semibold text-[#0f4c81] hover:bg-gray-50"
            >
              顯示全部 {d.faqs.length} 條問題 <ChevronDown size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── 13. 相關服務 + 最後 CTA ──────────────────────────────────────────

function Related({ d }: { d: ServicePageData }) {
  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow="Related" title="相關服務及延伸閱讀" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {d.related.map((r) => (
            <Link key={r.href} href={r.href} className="group rounded-2xl bg-white border border-gray-100 p-6 hover:border-[#0f4c81]/30 hover:shadow-lg transition-all">
              <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[#0f4c81] transition-colors">{r.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">{r.desc}</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#0f4c81] group-hover:gap-2 transition-all">
                了解更多 <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta({ d }: { d: ServicePageData }) {
  return (
    <section className="py-16 md:py-24 bg-[#0f4c81] text-white relative overflow-hidden">
      <div aria-hidden="true" data-mobile-glow="true" className="absolute bottom-[-40%] right-[-10%] w-[600px] h-[600px] bg-[#f5a623]/15 rounded-full blur-[120px]" />
      <motion.div {...fadeUp} data-mobile-visible="true" className="max-w-3xl mx-auto px-4 text-center relative">
        <h2 className="text-2xl md:text-4xl font-bold mb-5 leading-tight">{d.finalCta.title}</h2>
        <p className="text-blue-100 md:text-lg leading-relaxed mb-8">{d.finalCta.desc}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={getWhatsAppUrl(d.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#f5a623] text-[#0f4c81] px-8 py-4 rounded-full font-bold hover:bg-[#ffb940] transition-colors"
          >
            <MessageCircle size={18} /> WhatsApp 免費諮詢
          </a>
          <a href="#contact" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold border border-white/30 hover:bg-white/10 transition-colors">
            填表提交需求 <ExternalLink size={16} />
          </a>
        </div>
      </motion.div>
    </section>
  );
}

// ─── 組合 ────────────────────────────────────────────────────────────

export default function ServicePage({ data, afterPricing, deepDiveExtra }: { data: ServicePageData; afterPricing?: ReactNode; deepDiveExtra?: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero d={data} />
      <SubNav whatsapp={data.whatsappMessage} />
      <FitCheck d={data} />
      <Problems d={data} />
      <HowItWorks d={data} />
      <Deliverables d={data} />
      <Compare d={data} />
      <Pricing d={data} whatsapp={data.whatsappMessage} />
      {afterPricing}
      <Proof d={data} />
      <Process d={data} />
      <Faq d={data} />
      <DeepDive d={data} extra={deepDiveExtra} />
      <Related d={data} />
      <FinalCta d={data} />
      <ContactSection defaultService={data.contactService} />
      <Footer />
    </div>
  );
}

"use client";

/**
 * app/start/StartContent.tsx — 「找出適合你的方案與預算」短問卷（前端互動部分）
 *
 * 產品規格：deliverables/frontend-audit-2026-10-15/questionnaire-spec.md
 * 規則邏輯全部在 lib/assessment.ts（純函式、已測試）；此檔只負責 UI、動畫、焦點、無障礙與交接。
 *
 * 2026-10-26 改版：
 *   - 題目之間有滑動過場、選項揀完自動前進，進度用步驟點顯示。
 *   - 桌面版右邊即時顯示「你的需求摘要」及聯絡方式；任何一步都可以直接 WhatsApp／致電。
 *   - 結果頁可直接留低聯絡（AssessmentLeadForm），電郵附內部評級；仍保留去 /contact 的交接。
 *
 * 重要保證：
 *   - 答案永不寫入 URL query string。
 *   - 查看結果無需留資料；表單只在訪客自己按提交時先送出。
 *   - 交接只寫 sessionStorage key（無個人資料），並導向 /contact/#contact。
 *   - 不把姓名／電話／電郵／完整答案送入 analytics；內部評級唔會顯示俾訪客。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Mail,
  MessageCircle,
  Phone,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Workflow,
} from "lucide-react";
import {
  PREFILL_STORAGE_KEY,
  analyticsPayload,
  applyAnswer,
  buildPrefill,
  classify,
  getQuestions,
  leadScore,
  summaryText,
  type Answers,
  type Question,
  type QuestionId,
} from "@/lib/assessment";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY, WHATSAPP_E164, getWhatsAppUrl } from "@/lib/site-config";
import AssessmentLeadForm from "./AssessmentLeadForm";

const STEP_LABEL: Record<QuestionId, string> = {
  goal: "目標",
  problem: "情況",
  base: "現況",
  budget: "預算",
  timing: "時間",
  role: "角色",
};

const GOAL_ICON: Record<string, typeof TrendingUp> = {
  growth: TrendingUp,
  ops: Workflow,
  project: Briefcase,
  selfhelp: BookOpen,
};

/** 揀選後停留一陣先轉題，讓訪客見到「已選」動畫 */
const ADVANCE_DELAY_MS = 380;

function selectedValue(answers: Answers, id: QuestionId): string | undefined {
  if (id === "budget") return answers.budget?.band;
  return answers[id] as string | undefined;
}

function answeredChips(steps: Question[], answers: Answers) {
  return steps
    .map((q) => {
      const v = selectedValue(answers, q.id);
      const opt = v ? q.options.find((o) => o.id === v) : undefined;
      return opt ? { id: q.id, step: STEP_LABEL[q.id], label: opt.label } : null;
    })
    .filter((x): x is { id: QuestionId; step: string; label: string } => x !== null);
}

export default function StartContent() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [answers, setAnswers] = useState<Answers>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [copied, setCopied] = useState(false);
  const advanceTimer = useRef<number | null>(null);
  const focusNext = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 依答案即時計算題目（分支長度會變：技術自助 = 2 題，一般 = 6 題）
  const steps = useMemo(() => getQuestions(answers), [answers]);
  const total = steps.length;
  const current = steps[Math.min(stepIndex, total - 1)];
  const showResult = stepIndex >= total;
  const result = useMemo(() => (showResult ? classify(answers) : null), [showResult, answers]);
  const chips = useMemo(() => answeredChips(steps, answers), [steps, answers]);
  // 未揀目標前未知分支長度：先按一般路線（6 題）顯示，避免出現「共 1 題」
  const DEFAULT_PATH: QuestionId[] = ["goal", "problem", "base", "budget", "timing", "role"];
  const dotIds: QuestionId[] = answers.goal ? steps.map((q) => q.id) : DEFAULT_PATH;

  useEffect(() => () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
  }, []);

  // 換題／出結果後：焦點移去新標題；手機版如果卡片頂部唔喺畫面，捲返去
  const focusOnMount = useCallback((el: HTMLElement | null) => {
    if (!el || !focusNext.current) return;
    focusNext.current = false;
    el.focus({ preventScroll: true });
    const top = cardRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 72) {
      window.scrollBy({ top: top - 96, behavior: reduce ? "auto" : "smooth" });
    }
  }, [reduce]);

  // 匿名 analytics：只記分支／結果識別碼，不含個資
  useEffect(() => {
    if (!result) return;
    try {
      const w = window as unknown as { dataLayer?: unknown[] };
      if (Array.isArray(w.dataLayer)) w.dataLayer.push(analyticsPayload(result));
    } catch {
      /* analytics 失敗不影響使用 */
    }
  }, [result]);

  const go = (nextIndex: number, direction: number) => {
    focusNext.current = true;
    setDir(direction);
    setStepIndex(nextIndex);
  };

  const handleSelect = (id: QuestionId, value: string) => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    const next = applyAnswer(answers, id, value);
    setAnswers(next);
    const nextTotal = getQuestions(next).length;
    const from = stepIndex;
    advanceTimer.current = window.setTimeout(
      () => go(Math.min(from + 1, nextTotal), 1),
      reduce ? 0 : ADVANCE_DELAY_MS,
    );
  };

  const goBack = () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    go(Math.max(0, stepIndex - 1), -1);
  };
  const jumpTo = (i: number) => {
    if (i >= stepIndex) return;
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    go(i, -1);
  };
  const restart = () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    setAnswers({});
    setCopied(false);
    go(0, -1);
  };

  const prefill = result ? buildPrefill(result, answers) : null;
  const summary = result ? summaryText(result, answers) : "";
  const lead = useMemo(() => leadScore(answers), [answers]);

  const waMessage = result
    ? `Hello ADWire，我啱啱做完網站需求評估：\n${summary}\n想同你們傾傾。`
    : chips.length
      ? `Hello ADWire，我做緊網站需求評估，想直接傾：\n${chips.map((c) => `${c.step}：${c.label}`).join("\n")}`
      : "Hello ADWire，我想了解你們的服務，想直接傾傾。";

  const handoff = () => {
    if (prefill) {
      try {
        window.sessionStorage.setItem(PREFILL_STORAGE_KEY, JSON.stringify(prefill));
      } catch {
        /* sessionStorage 不可用時，仍可導向；下面亦提供可複製摘要 */
      }
    }
    router.push("/contact/#contact");
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const slide = {
    enter: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: d * 48 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: d * -48 }),
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <div ref={cardRef} className="min-w-0">
        {/* ── 進度：步驟點（已答的可按返去改）── */}
        {!showResult && (
          <div className="mb-5">
            <div className="flex items-center justify-between text-sm">
              <p className="font-semibold text-[#0f4c81]" aria-live="polite">
                第 {Math.min(stepIndex + 1, total)} 題／共 {dotIds.length} 題
              </p>
              <p className="inline-flex items-center gap-1 text-slate-400">
                <Clock size={14} /> 約 2 分鐘
              </p>
            </div>
            <ol className="mt-3 flex items-center gap-1.5" aria-label="問卷進度">
              {dotIds.map((id, i) => {
                const done = i < stepIndex;
                const active = i === stepIndex;
                return (
                  <li key={id} className="flex-1">
                    <button
                      type="button"
                      onClick={() => jumpTo(i)}
                      disabled={!done}
                      aria-label={`${STEP_LABEL[id]}${done ? "（已答，按此修改）" : active ? "（目前）" : ""}`}
                      className="group block w-full disabled:cursor-default"
                    >
                      <span className="relative block h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <motion.span
                          className="absolute inset-y-0 left-0 rounded-full bg-[#f5a623]"
                          initial={false}
                          animate={{ width: done ? "100%" : active ? "45%" : "0%" }}
                          transition={{ duration: reduce ? 0 : 0.45, ease: "easeOut" }}
                        />
                      </span>
                      <span
                        className={`mt-1.5 hidden text-[11px] font-medium sm:block ${
                          active ? "text-[#0f4c81]" : done ? "text-slate-500 group-hover:text-[#0f4c81]" : "text-slate-300"
                        }`}
                      >
                        {STEP_LABEL[id]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        <AnimatePresence mode="wait" custom={dir} initial={false}>
          {!showResult && current ? (
            <motion.div
              key={`q-${current.id}-${stepIndex}`}
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduce ? 0.12 : 0.28, ease: "easeOut" }}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-30px_rgba(15,76,129,0.35)] sm:p-8"
            >
              <h2
                ref={focusOnMount}
                tabIndex={-1}
                className="text-xl font-bold text-slate-900 outline-none sm:text-2xl"
              >
                {current.title}
              </h2>
              {current.help && <p className="mt-2 text-sm text-slate-500">{current.help}</p>}

              <div
                role="radiogroup"
                aria-label={current.title}
                className={`mt-6 grid gap-3 ${current.id === "goal" ? "sm:grid-cols-2" : ""}`}
              >
                {current.options.map((opt, i) => {
                  const selected = selectedValue(answers, current.id) === opt.id;
                  const Icon = current.id === "goal" ? GOAL_ICON[opt.id] : undefined;
                  return (
                    <motion.label
                      key={opt.id}
                      initial={reduce ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: reduce ? 0 : 0.05 + i * 0.045, duration: 0.25 }}
                      whileTap={reduce ? undefined : { scale: 0.98 }}
                      className={`group relative flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition-all duration-200 focus-within:ring-4 focus-within:ring-[#0f4c81]/15 motion-reduce:transition-none ${
                        selected
                          ? "border-[#0f4c81] bg-[#0f4c81]/[0.04] shadow-md"
                          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-[#0f4c81]/40 hover:shadow-md"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${current.id}`}
                        value={opt.id}
                        checked={selected}
                        onChange={() => handleSelect(current.id, opt.id)}
                        className="sr-only"
                      />
                      {Icon ? (
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                            selected ? "bg-[#0f4c81] text-white" : "bg-[#0f4c81]/10 text-[#0f4c81] group-hover:bg-[#0f4c81]/15"
                          }`}
                        >
                          <Icon size={20} />
                        </span>
                      ) : (
                        <span
                          aria-hidden="true"
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            selected ? "border-[#0f4c81] bg-[#0f4c81]" : "border-slate-300 group-hover:border-[#0f4c81]/60"
                          }`}
                        >
                          {selected && (
                            <motion.span initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }}>
                              <Check size={12} strokeWidth={3} className="text-white" />
                            </motion.span>
                          )}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-slate-800">{opt.label}</span>
                        {opt.hint && <span className="mt-0.5 block text-sm text-slate-500">{opt.hint}</span>}
                      </span>
                      {Icon && selected && (
                        <motion.span
                          initial={reduce ? false : { scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#f5a623] text-white"
                        >
                          <Check size={14} strokeWidth={3} />
                        </motion.span>
                      )}
                    </motion.label>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={stepIndex === 0}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-[#0f4c81] disabled:opacity-40"
                >
                  <ArrowLeft size={16} /> 上一題
                </button>
                <button
                  type="button"
                  onClick={restart}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-600"
                >
                  <RotateCcw size={14} /> 重新開始
                </button>
              </div>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduce ? 0.12 : 0.35, ease: "easeOut" }}
            >
              <div
                ref={focusOnMount}
                tabIndex={-1}
                aria-live="polite"
                className="relative overflow-hidden rounded-3xl bg-[#0f4c81] p-6 text-white outline-none sm:p-8"
              >
                <div aria-hidden="true" data-mobile-glow="true" className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#f5a623]/25 blur-3xl" />
                <motion.p
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-wide text-[#f5a623]"
                >
                  <Sparkles size={13} /> 你的評估結果
                </motion.p>
                <motion.h2
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                  className="relative mt-3 text-2xl font-bold sm:text-3xl"
                >
                  {result.headline}
                </motion.h2>
                <motion.p
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.28 }}
                  className="relative mt-3 text-blue-100"
                >
                  {result.reason}
                </motion.p>
              </div>

              <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">已包含</h3>
                    <ul className="mt-2 space-y-1.5">
                      {result.included.map((item, i) => (
                        <motion.li
                          key={item}
                          initial={reduce ? false : { opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.35 + i * 0.06 }}
                          className="flex gap-2 text-sm text-slate-600"
                        >
                          <Check size={16} className="mt-0.5 shrink-0 text-green-600" />
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">不包含</h3>
                    <ul className="mt-2 space-y-1.5">
                      {result.notIncluded.map((item) => (
                        <li key={item} className="flex gap-2 text-sm text-slate-500">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {result.pricing && (
                  <div className="mt-6 rounded-2xl border border-[#f5a623]/30 bg-[#f5a623]/[0.06] p-4">
                    <h3 className="text-sm font-bold text-[#0f4c81]">{result.pricing.label}</h3>
                    <ul className="mt-2 space-y-1.5">
                      {result.pricing.lines.map((line) => (
                        <li key={line} className="text-sm text-slate-600">
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="mt-4 text-xs text-slate-400">
                  以上為根據你答案的參考方向，並非正式報價；正式費用及交付以書面報價為準。
                </p>
              </div>

              {/* ── 交接：直接留資料／WhatsApp／去詳細表格 ── */}
              {(result.contactCta || result.allowSummarySubmit) && prefill && (
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="mt-5 rounded-3xl border-2 border-[#0f4c81]/15 bg-gradient-to-b from-[#0f4c81]/[0.04] to-white p-6 sm:p-8"
                >
                  <h3 className="text-xl font-bold text-[#0f4c81]">
                    {result.contactCta ? "想 ADWire 跟進？留低聯絡就得" : "想聽聽 ADWire 的意見？"}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    你剛才的答案會自動附上，同事唔使由頭問過。
                    {result.classification === "needs-confirmation"
                      ? "我們會先釐清範圍，不會即時安排銷售會議。"
                      : "一般 1 個工作天內回覆。"}
                  </p>

                  <a
                    href={getWhatsAppUrl(waMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 font-bold text-white shadow-lg shadow-[#25D366]/25 transition-transform hover:scale-[1.01] active:scale-[0.98]"
                  >
                    <MessageCircle size={18} /> 用 WhatsApp 傳送結果（最快）
                  </a>

                  <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
                    <span className="h-px flex-1 bg-slate-200" /> 或者留低聯絡，我們打返俾你 <span className="h-px flex-1 bg-slate-200" />
                  </div>

                  <AssessmentLeadForm prefill={prefill} lead={lead} />

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
                    <button type="button" onClick={handoff} className="font-semibold text-[#0f4c81] underline-offset-4 hover:underline">
                      改用詳細聯絡表格
                    </button>
                    <button
                      type="button"
                      onClick={copySummary}
                      className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-[#0f4c81]"
                    >
                      <Copy size={14} /> {copied ? "已複製摘要" : "複製答案摘要"}
                    </button>
                  </div>
                </motion.div>
              )}

              {result.resources.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-slate-900">相關內容</h3>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {result.resources.map((r) => (
                      <Link
                        key={r.href + r.label}
                        href={r.href}
                        prefetch={false}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-[#0f4c81] transition-colors hover:border-[#0f4c81]"
                      >
                        {r.label}
                        <ExternalLink size={13} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {prefill && (
                <details className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <summary className="cursor-pointer text-sm font-medium text-slate-600">查看答案摘要</summary>
                  <pre className="mt-2 whitespace-pre-wrap font-sans text-xs text-slate-600">{summary}</pre>
                </details>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-[#0f4c81]"
                >
                  <ArrowLeft size={16} /> 返回修改答案
                </button>
                <button
                  type="button"
                  onClick={restart}
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-600"
                >
                  <RotateCcw size={14} /> 重新開始
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* 手機版：唔想答題可以即刻搵我們（桌面版喺右邊欄） */}
        {!showResult && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-3 lg:hidden">
            <p className="flex-1 text-sm text-slate-600">趕時間？直接同我們傾</p>
            <a
              href={getWhatsAppUrl(waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-sm font-bold text-white"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            <a
              href={`tel:${WHATSAPP_E164}`}
              aria-label={`致電 ${WHATSAPP_DISPLAY}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-[#0f4c81]"
            >
              <Phone size={16} />
            </a>
          </div>
        )}
      </div>

      {/* ── 桌面版側欄：即時摘要＋聯絡 ── */}
      <aside className="hidden lg:sticky lg:top-28 lg:block" aria-label="你的需求摘要及聯絡方式">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f5a623]">你的需求摘要</p>
          {chips.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">揀選答案後，會即時喺呢度整理好。</p>
          ) : (
            <ul className="mt-3 space-y-2">
              <AnimatePresence initial={false}>
                {chips.map((c) => (
                  <motion.li
                    key={`${c.id}-${c.label}`}
                    layout={!reduce}
                    initial={reduce ? false : { opacity: 0, x: 16, scale: 0.96 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
                    className="rounded-xl bg-slate-50 px-3 py-2"
                  >
                    <span className="block text-[11px] font-semibold text-slate-400">{c.step}</span>
                    <span className="block text-sm font-medium leading-snug text-slate-700">{c.label}</span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        <div className="mt-4 rounded-3xl bg-[#0f4c81] p-5 text-white">
          <p className="font-bold">唔想答題？直接搵我們</p>
          <p className="mt-1 text-xs text-blue-100">星期一至五 11:00–18:00，由真人同事回覆</p>
          <a
            href={getWhatsAppUrl(waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
          >
            <MessageCircle size={16} /> WhatsApp 傾傾
          </a>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <a
              href={`tel:${WHATSAPP_E164}`}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/25 py-2 text-xs font-semibold transition-colors hover:bg-white/10"
            >
              <Phone size={14} /> 致電
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/25 py-2 text-xs font-semibold transition-colors hover:bg-white/10"
            >
              <Mail size={14} /> 電郵
            </a>
          </div>
          <p className="mt-3 text-center text-xs text-blue-200">{WHATSAPP_DISPLAY}</p>
        </div>

        {!showResult && (
          <Link
            href="/contact/"
            prefetch={false}
            className="mt-4 flex items-center justify-center gap-1 text-sm font-semibold text-[#0f4c81] hover:underline"
          >
            已清楚需求？直接填表 <ArrowRight size={14} />
          </Link>
        )}
      </aside>
    </div>
  );
}

"use client";

/**
 * app/start/StartContent.tsx — 「找出適合你的方案與預算」短問卷（前端互動部分）
 *
 * 產品規格：deliverables/frontend-audit-2026-10-15/questionnaire-spec.md
 * 規則邏輯全部在 lib/assessment.ts（純函式、已測試）；此檔只負責 UI、焦點、無障礙與交接。
 *
 * 重要保證：
 *   - 答案永不寫入 URL query string。
 *   - 不會自動提交、不會觸發廣告 lead conversion。
 *   - 交接只寫 sessionStorage key（無個人資料），並導向 /contact/#contact。
 *   - 不把姓名／電話／電郵／完整答案送入 analytics。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Copy, RotateCcw, ExternalLink } from "lucide-react";
import {
  PREFILL_STORAGE_KEY,
  analyticsPayload,
  applyAnswer,
  buildPrefill,
  classify,
  getQuestions,
  summaryText,
  type Answers,
  type QuestionId,
} from "@/lib/assessment";

export default function StartContent() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // 依答案即時計算題目（分支長度會變：技術自助 = 2 題，一般 = 5 題）
  const steps = useMemo(() => getQuestions(answers), [answers]);
  const total = steps.length;
  const current = steps[Math.min(stepIndex, total - 1)];

  // 結果狀態直接由 stepIndex 推導（不靠 effect 同步 state），前進到最後一題之後即顯示結果
  const showResult = stepIndex >= total;
  const result = useMemo(() => (showResult ? classify(answers) : null), [showResult, answers]);

  // 焦點移到題目標題（每次換題或顯示結果）
  useEffect(() => {
    if (showResult) {
      resultRef.current?.focus();
      return;
    }
    headingRef.current?.focus();
  }, [stepIndex, showResult, current?.id]);

  // 匿名 analytics：只記分支／結果識別碼，不含個資
  useEffect(() => {
    if (!result) return;
    try {
      const w = window as unknown as { dataLayer?: unknown[] };
      if (Array.isArray(w.dataLayer)) {
        w.dataLayer.push(analyticsPayload(result));
      }
    } catch {
      /* analytics 失敗不影響使用 */
    }
  }, [result]);

  const handleSelect = useCallback(
    (id: QuestionId, value: string) => {
      const next = applyAnswer(answers, id, value);
      setAnswers(next);
      const nextSteps = getQuestions(next);
      // 前進一格；若已是最後一題，stepIndex 會達到題數，觸發結果顯示
      setStepIndex((i) => Math.min(i + 1, nextSteps.length));
    },
    [answers],
  );

  const goBack = () => {
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const restart = () => {
    setAnswers({});
    setStepIndex(0);
    setCopied(false);
  };

  const prefill = result ? buildPrefill(result, answers) : null;
  const summary = result ? summaryText(result, answers) : "";

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

  return (
    <div className="mx-auto max-w-2xl">
      {/* 進度：分支長度不同時會更新，不寫死題數 */}
      {!showResult && (
        <div className="mb-4">
          {/* 未答第一題前，分支未定，getQuestions 只回傳 1 題；
              原本會顯示「第 1 題／共 1 題」+ 滿格進度條，答完先發現仲有題目。
              分支未定時改為顯示預計題數（2–5 題），進度按最長分支計。 */}
          <p className="text-sm font-medium text-[#0f4c81]" aria-live="polite">
            {answers.goal
              ? `第 ${Math.min(stepIndex + 1, total)} 題／共 ${total} 題`
              : "第 1 題（全部約 2–5 題）"}
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#0f4c81] transition-[width] duration-300 motion-reduce:transition-none"
              style={{
                width: `${(Math.min(stepIndex + 1, total) / (answers.goal ? total : 5)) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* ── 題目 ── */}
      {!showResult && current && (
        <div>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-xl font-bold text-slate-900 outline-none sm:text-2xl"
          >
            {current.title}
          </h2>
          {current.help && <p className="mt-2 text-sm text-slate-500">{current.help}</p>}
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">單選</p>

          <div role="radiogroup" aria-label={current.title} className="mt-5 flex flex-col gap-3">
            {current.options.map((opt) => {
              const selected = answers[current.id] === opt.id;
              return (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors motion-reduce:transition-none
                    ${selected ? "border-[#0f4c81] bg-[#0f4c81]/5" : "border-slate-200 bg-white hover:border-[#0f4c81]/40"}`}
                >
                  <input
                    type="radio"
                    name={`q-${current.id}`}
                    value={opt.id}
                    checked={selected}
                    onChange={() => handleSelect(current.id, opt.id)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[#0f4c81]"
                  />
                  <span>
                    <span className="block font-medium text-slate-800">{opt.label}</span>
                    {opt.hint && <span className="mt-0.5 block text-sm text-slate-500">{opt.hint}</span>}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={stepIndex === 0}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-[#0f4c81] disabled:opacity-40 motion-reduce:transition-none"
            >
              <ArrowLeft size={16} /> 上一題
            </button>
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-600 motion-reduce:transition-none"
            >
              <RotateCcw size={14} /> 重新開始
            </button>
          </div>
        </div>
      )}

      {/* ── 結果（先顯示，之後才邀請聯絡）── */}
      {showResult && result && (
        <div ref={resultRef} tabIndex={-1} aria-live="polite" className="outline-none">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#f5a623]">評估結果</p>
            <h2 className="mt-2 text-2xl font-bold text-[#0f4c81]">{result.headline}</h2>
            <p className="mt-3 text-slate-600">{result.reason}</p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">已包含</h3>
                <ul className="mt-2 space-y-1.5">
                  {result.included.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-slate-600">
                      <Check size={16} className="mt-0.5 shrink-0 text-green-600" />
                      <span>{item}</span>
                    </li>
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
              <div className="mt-6 rounded-2xl border border-[#0f4c81]/15 bg-[#0f4c81]/5 p-4">
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

          {/* 相關資源 */}
          {result.resources.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-slate-900">相關內容</h3>
              <div className="mt-2 flex flex-wrap gap-3">
                {result.resources.map((r) => (
                  <Link
                    key={r.href + r.label}
                    href={r.href}
                    prefetch={false}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-[#0f4c81] transition-colors hover:border-[#0f4c81] motion-reduce:transition-none"
                  >
                    {r.label}
                    <ExternalLink size={13} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 交接 CTA：只在有商業意向時出現 */}
          {(result.contactCta || result.allowSummarySubmit) && prefill && (
            <div className="mt-8 rounded-3xl bg-[#0f4c81] p-6 text-white">
              <h3 className="text-lg font-bold">
                {result.contactCta ? "交給 ADWire 跟進" : "想看 ADWire 的意見？"}
              </h3>
              <p className="mt-2 text-sm text-blue-100">
                我們只會把你剛才揀選的摘要（服務方向、預算及時間）帶到聯絡頁。
                {result.classification === "needs-confirmation"
                  ? "同事會先釐清範圍，不會承諾即時安排銷售會議。"
                  : "你可自行按提交，我們不會自動送出。"}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handoff}
                  className="inline-flex items-center gap-2 rounded-full bg-[#f5a623] px-6 py-3 font-bold text-white transition-transform hover:scale-[1.03] active:scale-[0.98] motion-reduce:transform-none"
                >
                  交給 ADWire 跟進 <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={copySummary}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-white motion-reduce:transition-none"
                >
                  <Copy size={15} /> {copied ? "已複製" : "複製摘要"}
                </button>
              </div>
              <p className="mt-3 text-xs text-blue-200">
                摘要不含你的姓名、電話或電郵；我們不會把答案寫入網址，亦不會自動觸發任何廣告轉換。
              </p>
            </div>
          )}

          {/* 可複製摘要（sessionStorage 不可用時的後備） */}
          {prefill && (
            <details className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <summary className="cursor-pointer text-sm font-medium text-slate-600">
                查看可複製的答案摘要
              </summary>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-600">{summary}</pre>
            </details>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-[#0f4c81] motion-reduce:transition-none"
            >
              <ArrowLeft size={16} /> 返回修改答案
            </button>
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-600 motion-reduce:transition-none"
            >
              <RotateCcw size={14} /> 重新開始
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

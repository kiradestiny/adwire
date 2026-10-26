"use client";

/**
 * app/start/AssessmentLeadForm.tsx — 問卷結果頁內嵌的「留低聯絡」表單（2026-10-26）
 *
 * - 只在訪客睇完結果、而且自己決定要跟進時先出現；查看結果仍然唔需要留資料。
 * - 送去同一個 /send-mail.php（Cloudflare Pages Function），附 source=assessment
 *   及內部評級（leadGrade／leadNotes），等同事收件時一眼知道優先次序。
 * - 評級只喺電郵入面出現，畫面上唔會顯示俾訪客。
 * - Turnstile 只在表單出現時先載入（同 ContactSection 一樣用 explicit render）。
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { isConfirmedSubmission, markFormSubmitted } from "@/lib/form-submission";
import { formatSubmitFailure } from "@/lib/mail-error";
import type { LeadScore, PrefillPayload } from "@/lib/assessment";

const FORM_ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT || "/send-mail.php";
const TURNSTILE_SITE_KEY = "0x4AAAAAAFFvSQ_aR523_Eeq";
const MIN_FORM_FILL_MS = 3_000;

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
};
const turnstileApi = () => (window as unknown as { turnstile?: TurnstileApi }).turnstile;

type Field = "name" | "phone" | "email";

export default function AssessmentLeadForm({
  prefill,
  lead,
}: {
  prefill: PrefillPayload;
  lead: LeadScore;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [values, setValues] = useState({ name: "", phone: "", email: "", company: "", note: "", website: "" });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const startedAt = useRef(0);

  const boxRef = useRef<HTMLDivElement | null>(null);
  const tokenRef = useRef("");
  const failedRef = useRef(false);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // ── Turnstile（表單出現先載入）──
  useEffect(() => {
    const render = () => {
      const api = turnstileApi();
      if (!boxRef.current || !api) return;
      try {
        api.render(boxRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (t: string) => { tokenRef.current = t; },
          "expired-callback": () => { tokenRef.current = ""; },
          "error-callback": () => { failedRef.current = true; },
        });
      } catch {
        failedRef.current = true;
      }
    };
    if (turnstileApi()) { render(); return; }
    const existing = document.querySelector<HTMLScriptElement>("script[data-adwire-turnstile]");
    if (existing) { existing.addEventListener("load", render); return () => existing.removeEventListener("load", render); }
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.defer = true;
    s.setAttribute("data-adwire-turnstile", "1");
    s.addEventListener("load", render);
    s.addEventListener("error", () => { failedRef.current = true; });
    document.head.appendChild(s);
  }, []);

  const waitForToken = useCallback(async (maxMs = 5000) => {
    const t0 = Date.now();
    while (!tokenRef.current && !failedRef.current && Date.now() - t0 < maxMs) {
      await new Promise((r) => setTimeout(r, 150));
    }
    return tokenRef.current;
  }, []);

  const set = (k: keyof typeof values, v: string) => {
    setValues((p) => ({ ...p, [k]: v }));
    if (k in errors) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e: Partial<Record<Field, string>> = {};
    if (!values.name.trim()) e.name = "請填寫稱呼";
    if (values.phone.replace(/\D/g, "").length < 8) e.phone = "請填寫有效電話（最少 8 位數字）";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) e.email = "請填寫有效電郵";
    return e;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (submitting) return;
    const e = validate();
    setErrors(e);
    const first = (["name", "phone", "email"] as Field[]).find((f) => e[f]);
    if (first) {
      document.getElementById(`lead-${first}`)?.focus();
      setShake((n) => n + 1);
      return;
    }
    if (Date.now() - startedAt.current < MIN_FORM_FILL_MS) {
      setSubmitError("提交過快，請檢查資料後稍候幾秒再試。");
      setShake((n) => n + 1);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const turnstileToken = await waitForToken();
      const note = values.note.trim();
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
          company: values.company.trim(),
          service: prefill.service,
          budget: prefill.budget,
          timeline: prefill.timeline,
          message: note ? `${prefill.message}\n\n客人補充：${note}` : prefill.message,
          website: values.website,
          formStartedAt: startedAt.current,
          source: "assessment",
          leadGrade: lead.grade,
          leadNotes: `${lead.score} 分${lead.notes.length ? `｜${lead.notes.join("、")}` : ""}`,
          turnstileToken,
        }),
      });
      let result: { success: boolean; message?: string; code?: string; requestId?: string };
      try {
        result = JSON.parse(await response.text());
      } catch {
        throw new Error("伺服器回應格式錯誤，請稍後再試，或直接 WhatsApp 我們。");
      }
      if (isConfirmedSubmission({ httpOk: response.ok, success: result.success })) {
        markFormSubmitted();
        router.push("/thank-you/");
        return;
      }
      // 失敗：保留後端 message；只有 allowlist code ＋ 合法 UUID requestId 才附參考編號。
      throw new Error(formatSubmitFailure(result, "發送失敗，請稍後再試。"));
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "發送失敗，請直接電郵至 info@adwire.com.hk");
      setShake((n) => n + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const input =
    "w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#0f4c81] focus:ring-4 focus:ring-[#0f4c81]/10";

  return (
    <form onSubmit={onSubmit} noValidate className="relative">
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        value={values.website}
        onChange={(e) => set("website", e.target.value)}
        className="pointer-events-none absolute left-[-9999px] top-auto h-px w-px overflow-hidden opacity-0"
      />
      <motion.div
        key={shake}
        animate={shake && !reduce ? { x: [0, -7, 7, -5, 5, -2, 2, 0] } : { x: 0 }}
        transition={{ duration: 0.45 }}
        className="grid gap-3 sm:grid-cols-2"
      >
        {([
          ["name", "稱呼 *", "text", "name", "例如：陳先生"],
          ["phone", "電話／WhatsApp *", "tel", "tel", "例如：9123 4567"],
          ["email", "電郵 *", "email", "email", "you@company.com"],
          ["company", "公司名稱（可選）", "text", "organization", ""],
        ] as const).map(([k, label, type, ac, ph]) => {
          const err = k !== "company" ? errors[k] : undefined;
          return (
            <div key={k}>
              <label htmlFor={`lead-${k}`} className="mb-1 block text-sm font-semibold text-slate-700">
                {label}
              </label>
              <input
                id={`lead-${k}`}
                type={type}
                autoComplete={ac}
                placeholder={ph}
                value={values[k]}
                onChange={(e) => set(k, e.target.value)}
                aria-invalid={err ? true : undefined}
                aria-describedby={err ? `lead-${k}-err` : undefined}
                className={`${input} ${err ? "border-red-400" : "border-slate-200"}`}
              />
              {err && (
                <p id={`lead-${k}-err`} className="mt-1 text-xs text-red-600">
                  {err}
                </p>
              )}
            </div>
          );
        })}
        <div className="sm:col-span-2">
          <label htmlFor="lead-note" className="mb-1 block text-sm font-semibold text-slate-700">
            想補充甚麼？（可選）
          </label>
          <textarea
            id="lead-note"
            rows={3}
            maxLength={800}
            placeholder="例如現有系統、想幾時上線、最想先解決的一件事"
            value={values.note}
            onChange={(e) => set("note", e.target.value)}
            className={`${input} border-slate-200 resize-y`}
          />
        </div>
      </motion.div>

      <div ref={boxRef} className="mt-3 flex justify-center" />

      {submitError && (
        <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f5a623] py-4 font-bold text-white shadow-lg shadow-[#f5a623]/30 transition-all hover:bg-[#e09210] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Loader2 size={18} className="animate-spin" /> 發送中…
          </>
        ) : (
          <>
            連同評估結果交給 ADWire <ArrowRight size={18} />
          </>
        )}
      </button>
      <p className="mt-3 flex items-start justify-center gap-1.5 text-center text-xs leading-relaxed text-slate-500">
        <ShieldCheck size={14} className="mt-0.5 shrink-0 text-green-600" />
        1 個工作天內由真人同事回覆 · 資料只用於回覆這次查詢，不會加入推銷名單
      </p>
    </form>
  );
}

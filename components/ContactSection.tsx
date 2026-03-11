"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, MapPin, Phone, AlertCircle, Loader2,
  CheckCircle2, MessageCircle, Shield, Zap, Gift, Star,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── Service Options ──────────────────────────────────────────────────────────
// ⚠️ 修改此陣列時，必須同步更新 public/send-mail.php 的 $allowedServices 白名單
export const SERVICE_OPTIONS = [
  "AI 企業轉型方案",
  "KOL 網紅營銷",
  "短視頻製作",
  "成效廣告投放",
  "社交媒體管理",
  "SEO/GEO 搜尋引擎優化",
  "商業攝影與錄影",
  "營銷自動化系統",
  "網頁設計及優化",
  "系統/APP開發",
  "其他合作",
] as const;

const PHONE_DIGITS_REGEX = /^\d{8,15}$/;
const CLIENT_SUBMIT_COOLDOWN_MS = 60_000;
const MIN_FORM_FILL_MS = 4_000;
const SUBMIT_COOLDOWN_STORAGE_KEY = "adwire_contact_submit_cooldown_until";

const sanitizePhoneInput = (value: string) => value.replace(/\D/g, "").slice(0, 15);

// ─── Per-field validators ─────────────────────────────────────────────────────
const VALIDATORS: Record<string, (v: string) => string> = {
  name:  v => v.trim().length >= 2  ? "" : "請輸入姓名（最少 2 字）",
  phone: v => PHONE_DIGITS_REGEX.test(v.trim()) ? "" : "請輸入 8 至 15 位數字，不能包含空格或符號",
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "請輸入有效電郵地址",
};

type FormValues = {
  name: string; phone: string; email: string;
  service: string; message: string;
  website: string; formStartedAt: string;
};

type VisibleFormField = "name" | "phone" | "email" | "service" | "message";

const INITIAL_TOUCHED_STATE: Record<VisibleFormField, boolean> = {
  name: false,
  phone: false,
  email: false,
  service: false,
  message: false,
};

const SUBMITTED_TOUCHED_STATE: Record<VisibleFormField, boolean> = {
  name: true,
  phone: true,
  email: true,
  service: true,
  message: true,
};

const isVisibleField = (name: keyof FormValues): name is VisibleFormField => (
  name === "name" ||
  name === "phone" ||
  name === "email" ||
  name === "service" ||
  name === "message"
);

// ─── FloatingInput ─────────────────────────────────────────────────────────────
// Animated floating label + real-time validation feedback per field
function FloatingInput({
  id, name, type = "text", label, required, maxLength, autoComplete, inputMode, pattern,
  value, onChange, onBlur, touched, error,
}: {
  id: string; name: keyof FormValues; type?: string; label: string;
  required?: boolean; maxLength?: number; autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]; pattern?: string;
  value: string; touched: boolean; error: string;
  onChange: (name: keyof FormValues, value: string) => void;
  onBlur:   (name: keyof FormValues, value: string) => void;
}) {
  const hasValue = value.length > 0;
  const isValid  = touched && !error && hasValue;
  const isError  = touched && !!error;

  const ringCls = isError
    ? "border-red-400 ring-2 ring-red-100"
    : isValid
    ? "border-green-400 ring-2 ring-green-50"
    : "border-gray-200 focus-within:border-[#f5a623] focus-within:ring-2 focus-within:ring-[#f5a623]/20";

  return (
    <div className="space-y-1">
      <div className={`relative rounded-lg border bg-gray-50 transition-all duration-200 ${ringCls}`}>
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          maxLength={maxLength}
          autoComplete={autoComplete}
          inputMode={inputMode}
          pattern={pattern}
          value={value}
          placeholder=" "
          aria-required={required}
          aria-invalid={isError || undefined}
          aria-describedby={isError ? `${id}-error` : undefined}
          onChange={e => onChange(name, e.target.value)}
          onBlur={e  => onBlur(name, e.target.value)}
          className="peer w-full px-4 pb-2 pt-6 bg-transparent outline-none text-sm text-gray-800"
        />

        {/* Floating label — CSS peer handles focus; React handles "has value" */}
        <label
          htmlFor={id}
          className={[
            "pointer-events-none absolute left-4 transition-all duration-200 select-none",
            hasValue
              ? "top-1.5 text-[10px] font-semibold text-gray-400"
              : "top-1/2 -translate-y-1/2 text-sm text-gray-400",
            "peer-focus:!top-1.5 peer-focus:!translate-y-0",
            "peer-focus:!text-[10px] peer-focus:!font-semibold peer-focus:!text-[#f5a623]",
          ].join(" ")}
        >
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>

        {/* Success checkmark */}
        {isValid && (
          <CheckCircle2
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none"
          />
        )}
      </div>

      {/* Animated error message */}
      <AnimatePresence>
        {isError && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 4 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-red-500 flex items-center gap-1 pl-1"
          >
            <AlertCircle size={12} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}


// ─── ContactSection ────────────────────────────────────────────────────────────
export default function ContactSection({ defaultService }: { defaultService?: string }) {
  const router = useRouter();
  const [mounted, setMounted]           = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);
  const [shake, setShake]               = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const [values, setValues] = useState<FormValues>({
    name: "", phone: "", email: "",
    service: defaultService ?? SERVICE_OPTIONS[0],
    message: "",
    website: "",
    formStartedAt: "",
  });
  const [touched, setTouched] = useState<Record<VisibleFormField, boolean>>(INITIAL_TOUCHED_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
    setValues(prev => ({ ...prev, formStartedAt: new Date().toISOString() }));

    const storedCooldownUntil = Number(window.localStorage.getItem(SUBMIT_COOLDOWN_STORAGE_KEY) ?? "0");
    if (Number.isFinite(storedCooldownUntil) && storedCooldownUntil > Date.now()) {
      setCooldownUntil(storedCooldownUntil);
    }
  }, []);

  useEffect(() => {
    if (!cooldownUntil) {
      setCooldownRemaining(0);
      return;
    }

    const syncCooldown = () => {
      const remainingMs = Math.max(0, cooldownUntil - Date.now());

      if (remainingMs <= 0) {
        setCooldownUntil(null);
        setCooldownRemaining(0);
        window.localStorage.removeItem(SUBMIT_COOLDOWN_STORAGE_KEY);
        return;
      }

      setCooldownRemaining(Math.ceil(remainingMs / 1000));
    };

    syncCooldown();
    const intervalId = window.setInterval(syncCooldown, 1000);

    return () => window.clearInterval(intervalId);
  }, [cooldownUntil]);

  const startClientCooldown = useCallback((durationMs = CLIENT_SUBMIT_COOLDOWN_MS) => {
    const nextCooldownUntil = Date.now() + durationMs;
    setCooldownUntil(nextCooldownUntil);
    window.localStorage.setItem(SUBMIT_COOLDOWN_STORAGE_KEY, String(nextCooldownUntil));
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleChange = useCallback((name: keyof FormValues, value: string) => {
    const nextValue = name === "phone" ? sanitizePhoneInput(value) : value;

    setValues(prev => ({ ...prev, [name]: nextValue }));

    if (submitError) {
      setSubmitError(null);
    }

    if (isVisibleField(name) && touched[name]) {
      const validate = VALIDATORS[name];
      if (validate) setErrors(prev => ({ ...prev, [name]: validate(nextValue) }));
    }
  }, [submitError, touched]);

  const handleBlur = useCallback((name: keyof FormValues, value: string) => {
    const nextValue = name === "phone" ? sanitizePhoneInput(value) : value;

    if (isVisibleField(name)) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }

    if (nextValue !== value) {
      setValues(prev => ({ ...prev, [name]: nextValue }));
    }

    const validate = VALIDATORS[name];
    if (validate) setErrors(prev => ({ ...prev, [name]: validate(nextValue) }));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (cooldownRemaining > 0) {
      setSubmitError(`提交過於頻繁，請於 ${cooldownRemaining} 秒後再試。`);
      triggerShake();
      return;
    }

    if (values.website.trim()) {
      setSubmitError("提交驗證失敗，請稍後再試。");
      triggerShake();
      return;
    }

    const formStartedTimestamp = Date.parse(values.formStartedAt);
    if (!Number.isFinite(formStartedTimestamp) || Date.now() - formStartedTimestamp < MIN_FORM_FILL_MS) {
      setSubmitError("提交過快，請檢查資料後稍候幾秒再試。");
      triggerShake();
      return;
    }

    // Validate all required fields upfront
    const newErrors: Record<string, string> = {};
    (["name", "phone", "email"] as const).forEach(field => {
      const err = VALIDATORS[field]?.(values[field]) ?? "";
      if (err) newErrors[field] = err;
    });
    setTouched(SUBMITTED_TOUCHED_STATE);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/send-mail.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const text = await response.text();
      let result: { success: boolean; message: string };
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error("伺服器回應格式錯誤，請稍後再試。");
      }

      if (response.ok && result.success) {
        startClientCooldown();
        sessionStorage.setItem("adwire_form_submitted", "1");
        router.push("/thank-you/");
      } else {
        if (response.status === 429) {
          startClientCooldown();
        }

        throw new Error(result.message || "發送失敗，請稍後再試。");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "發生未知錯誤，請直接電郵至 info@adwire.com.hk";
      setSubmitError(message);
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  const msgLen = values.message.length;

  return (
    <section className="py-24 bg-[#0f4c81] text-white relative overflow-hidden" id="contact">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#f5a623] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* ── Left: CTA + Contact Info ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center"
          >
            <span className="text-[#f5a623] font-bold tracking-wider uppercase mb-4">
              Ready to Grow?
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              準備好令你的品牌<br />
              <span className="text-[#f5a623]">引爆流量？</span>
            </h2>
            <p className="text-gray-300 text-lg mb-6">
              唔好再浪費預算係無效嘅廣告上面。立即預約 15 分鐘免費諮詢，讓我們為你診斷痛點，量身訂造增長方案。
            </p>

            {/* Social proof badge */}
            <div className="flex items-center gap-2.5 mb-8 bg-white/10 border border-white/20 rounded-xl px-4 py-3 w-fit backdrop-blur-sm">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} className="fill-[#f5a623] text-[#f5a623]" />
                ))}
              </div>
              <span className="text-sm text-white font-medium">
                4.9 分 · 已服務{" "}
                <span className="text-[#f5a623] font-bold">150+</span> 香港品牌
              </span>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 bg-white/10 rounded-full flex items-center justify-center text-[#f5a623] flex-shrink-0">
                  <Phone size={20} />
                </div>
                <a
                  href="https://wa.me/85295861027"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#f5a623] transition-colors"
                >
                  <p className="text-xs text-gray-400 uppercase tracking-wider">WhatsApp / Phone</p>
                  <p className="font-semibold text-lg">+852 9586 1027</p>
                </a>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-11 w-11 bg-white/10 rounded-full flex items-center justify-center text-[#f5a623] flex-shrink-0">
                  <Mail size={20} />
                </div>
                <a
                  href="mailto:info@adwire.com.hk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#f5a623] transition-colors"
                >
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Email</p>
                  <p className="font-semibold text-lg">info@adwire.com.hk</p>
                </a>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-11 w-11 bg-white/10 rounded-full flex items-center justify-center text-[#f5a623] flex-shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Office</p>
                  <p className="font-medium">葵芳新都會廣場 2 座 45 樓 4510 室</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Right: Form Card ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white text-gray-900 rounded-3xl p-8 md:p-10 shadow-2xl relative"
          >
            {/* Corner badge */}
            <div className="absolute -top-4 -right-4 bg-[#f5a623] text-white px-4 py-2 rounded-lg font-bold shadow-lg transform rotate-3 hidden md:block text-sm">
              限時免費諮詢
            </div>

            <h3 className="text-2xl font-bold text-[#0f4c81] mb-1">
              化繁為簡，定制最適合你的推廣策略
            </h3>
            <p className="text-gray-500 text-sm mb-5">
              填寫表格，我們的專家將在{" "}
              <span className="font-semibold text-[#0f4c81]">24 小時</span>內與您聯繫
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 mb-5 pb-5 border-b border-gray-100">
              {[
                { Icon: Shield, label: "資料絕對保密",   cls: "text-green-500" },
                { Icon: Zap,    label: "24 小時內回覆", cls: "text-amber-500" },
                { Icon: Gift,   label: "首次諮詢免費",  cls: "text-blue-500"  },
              ].map(({ Icon, label, cls }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full hover:border-gray-200 transition-colors"
                >
                  <Icon size={12} className={cls} />
                  {label}
                </span>
              ))}
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              suppressHydrationWarning
              noValidate
            >
              {!mounted ? (
                /* Skeleton — prevents SSR hydration mismatch */
                <div className="space-y-4" aria-hidden="true">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-[58px] w-full bg-gray-100 rounded-lg animate-pulse" />
                    <div className="h-[58px] w-full bg-gray-100 rounded-lg animate-pulse" />
                  </div>
                  <div className="h-[58px] w-full bg-gray-100 rounded-lg animate-pulse" />
                  <div className="h-[58px] w-full bg-gray-100 rounded-lg animate-pulse" />
                  <div className="h-[130px] w-full bg-gray-100 rounded-lg animate-pulse" />
                  <div className="h-[56px] w-full bg-gray-200 rounded-lg animate-pulse" />
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    name="website"
                    autoComplete="off"
                    tabIndex={-1}
                    aria-hidden="true"
                    value={values.website}
                    onChange={e => handleChange("website", e.target.value)}
                    className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden opacity-0 pointer-events-none"
                  />
                  <input type="hidden" name="formStartedAt" value={values.formStartedAt} />

                  {/* Shake container — triggers on validation error or submit failure */}
                  <motion.div
                    animate={shake ? { x: [0, -7, 7, -5, 5, -3, 3, 0] } : { x: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FloatingInput
                        id="contact-name" name="name" label="姓名 Name"
                        required maxLength={100} autoComplete="name"
                        value={values.name} touched={touched.name} error={errors.name ?? ""}
                        onChange={handleChange} onBlur={handleBlur}
                      />
                      <div className="space-y-1">
                        <FloatingInput
                          id="contact-phone" name="phone" type="tel" label="電話 Phone"
                          required maxLength={15} autoComplete="tel-national" inputMode="numeric" pattern="[0-9]{8,15}"
                          value={values.phone} touched={touched.phone} error={errors.phone ?? ""}
                          onChange={handleChange} onBlur={handleBlur}
                        />
                        <p className="text-xs text-gray-400 pl-1">請只輸入數字，不要加入空格、hyphen 或其他符號</p>
                      </div>
                    </div>

                    <FloatingInput
                      id="contact-email" name="email" type="email" label="電郵 Email"
                      required autoComplete="email"
                      value={values.email} touched={touched.email} error={errors.email ?? ""}
                      onChange={handleChange} onBlur={handleBlur}
                    />

                    {/* Service select */}
                    <div className="space-y-1">
                      <label
                        htmlFor="contact-service"
                        className="block text-[10px] font-semibold text-gray-400 pl-1"
                      >
                        感興趣的服務
                      </label>
                      <select
                        id="contact-service"
                        name="service"
                        value={values.service}
                        onChange={e => handleChange("service", e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#f5a623] focus:ring-2 focus:ring-[#f5a623]/20 outline-none transition-all bg-gray-50 text-sm text-gray-700"
                      >
                        {SERVICE_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    {/* Message textarea + character counter */}
                    <div className="space-y-1">
                      <label
                        htmlFor="contact-message"
                        className="block text-[10px] font-semibold text-gray-400 pl-1"
                      >
                        訊息 Message
                        <span className="text-gray-300 font-normal ml-1">（選填）</span>
                      </label>
                      <div className="relative">
                        <textarea
                          id="contact-message"
                          name="message"
                          rows={4}
                          maxLength={2000}
                          value={values.message}
                          onChange={e => handleChange("message", e.target.value)}
                          className="w-full px-4 py-3 pb-7 rounded-lg border border-gray-200 focus:border-[#f5a623] focus:ring-2 focus:ring-[#f5a623]/20 outline-none transition-all bg-gray-50 text-sm resize-none"
                          placeholder="請簡單描述你的需求（如：推廣預算、目標市場、期望效果...）"
                        />
                        {/* Colour-coded character counter */}
                        <span
                          className={[
                            "absolute bottom-2.5 right-3 text-xs tabular-nums transition-colors pointer-events-none",
                            msgLen > 1800 ? "text-red-400 font-semibold" :
                            msgLen > 1200 ? "text-amber-400" :
                            "text-gray-300",
                          ].join(" ")}
                        >
                          {msgLen} / 2000
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Inline submit error */}
                  <AnimatePresence>
                    {submitError && (
                      <motion.div
                        role="alert"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                      >
                        <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                        <span>{submitError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* CTA Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || cooldownRemaining > 0}
                    className="w-full bg-[#f5a623] text-white font-bold py-4 rounded-xl
                      hover:bg-[#e09210] active:scale-[0.98] transition-all duration-200
                      flex items-center justify-center gap-2
                      shadow-lg shadow-[#f5a623]/30
                      disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        發送中...
                      </>
                    ) : cooldownRemaining > 0 ? (
                      <>
                        <Loader2 size={18} />
                        請稍候 {cooldownRemaining} 秒
                      </>
                    ) : (
                      <>
                        <MessageCircle size={18} />
                        立即預約免費諮詢 →
                      </>
                    )}
                  </button>

                  {/* Privacy micro-copy */}
                  <p className="text-center text-xs text-gray-400 pt-1">
                    🔒 你的資料受到嚴格保密，我們絕不轉發或出售個人資訊
                  </p>
                </>
              )}
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

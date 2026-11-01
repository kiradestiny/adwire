/**
 * lib/mail-error.ts — 表單送出失敗的「安全顯示」純函式（無 DOM、無 React）。
 *
 * 背景：表單（components/ContactSection.tsx、app/start/AssessmentLeadForm.tsx）
 * 送出失敗時會顯示後端 message。後端 functions/send-mail.php.ts 的失敗回應除
 * message 外，仲會帶：
 *   · code：allowlist 失敗碼（missing_config / provider_error / network_error）
 *   · requestId：crypto.randomUUID()
 *
 * 前端規則（本檔係單一來源）：
 *   1) 保留後端 message —— 客人見到嘅原因不變。
 *   2) 只有當 code 屬 allowlist **而且** requestId 係合法 UUID，才附上可見
 *      「參考編號：<uuid>（<code>）」，方便客服對照後端 log。
 *   3) 任何超大／非字串／唔可信嘅 message 一律拒收 → 用 fallback。
 *   4) 永不顯示 provider 原始細節（Resend 錯誤、API key、stack 等）：
 *      output 只可能由「清理後嘅 message」＋「白名單 code token」組成。
 *
 * 呢個係 pure function，可直接以 node --experimental-strip-types 測試。
 */

/** 允許喺前端顯示嘅失敗碼白名單（與後端 code 對齊）。 */
export const MAIL_FAILURE_CODES = ["missing_config", "provider_error", "network_error"] as const;
export type MailFailureCode = (typeof MAIL_FAILURE_CODES)[number];

/** 客人可見嘅參考編號標籤（單一來源，方便測試同調整）。 */
export const SUPPORT_REF_LABEL = "參考編號";

/** 後端失敗回應（全部欄位當 untrusted）。 */
export interface MailFailureResponse {
  success?: boolean;
  message?: unknown;
  code?: unknown;
  requestId?: unknown;
  /** 其他未預期欄位（untrusted JSON）；helper 一律忽略、唔會顯示。 */
  [key: string]: unknown;
}

/** 客人可見 message 長度上限；超過即視為唔可信，改用 fallback。 */
const MAX_MESSAGE_LENGTH = 400;

/** 標準 UUID（後端用 crypto.randomUUID()，36 字、8-4-4-4-12）。 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** code 必須恰好等於 allowlist 之一（唔接受大小寫／前後空白變體）。 */
export function isAllowlistedFailureCode(code: unknown): code is MailFailureCode {
  return typeof code === "string" && (MAIL_FAILURE_CODES as readonly string[]).includes(code);
}

/** requestId 必須係合法 UUID（長度與格式皆要符合）。 */
export function isValidRequestId(requestId: unknown): requestId is string {
  return typeof requestId === "string" && requestId.length === 36 && UUID_RE.test(requestId);
}

/**
 * 清理 message：只接受字串；移除控制字元、trim；空或超長一律當唔可信（回 null）。
 * 正常中文／英文內容不受影響（唔會改寫客人見到嘅字）。
 */
function sanitizeMessage(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  // eslint-disable-next-line no-control-regex
  const cleaned = raw.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  if (!cleaned || cleaned.length > MAX_MESSAGE_LENGTH) return null;
  return cleaned;
}

/**
 * 由後端失敗回應砌出客人可見字串。
 *
 * @param result   已解析嘅後端 JSON（untrusted）
 * @param fallback message 缺失／唔可信時使用嘅安全預設字串
 */
export function formatSubmitFailure(
  result: MailFailureResponse | null | undefined,
  fallback: string,
): string {
  const message = sanitizeMessage(result?.message) ?? fallback;

  const hasRef =
    isAllowlistedFailureCode(result?.code) && isValidRequestId(result?.requestId);
  const ref = hasRef
    ? `（${SUPPORT_REF_LABEL}：${result!.requestId}（${result!.code}））`
    : "";

  return `${message}${ref}`;
}

/**
 * Cloudflare Pages Function — POST /send-mail.php
 *
 * 背景：原本表單由 SiteGround 上的 PHP 處理（public/send-mail.php，1,613 行）。
 * 切換 DNS 去 Cloudflare 之後，SiteGround 的 anti-bot 會攔截 Worker 的出口 IP
 * （實測 202 + sgcaptcha），所以表單必須搬離 PHP，否則切換即失去 lead。
 *
 * 本檔是「行為對齊」而非「逐行移植」。刻意保留的核心保護：
 *   1. Honeypot（website 欄位）——填了就當機械人，回 success 但唔寄信。
 *   2. 最短填表時間（formStartedAt）——少於 2.5 秒視為機械人。
 *   3. Cloudflare Turnstile 伺服器端驗證（與現有 widget 同一個 sitekey）。
 *   4. 每 IP 速率限制（KV，60 秒 3 次）。
 *   5. 相同內容 10 分鐘內指紋去重。
 *   6. 輸入長度／格式驗證。
 *
 * 刻意「唔移植」的部分（會在 README 註明）：
 *   - IP 信譽／ASN／isp 查詢、垃圾評分模型：需要外部 API，維護成本高於效益。
 *   - MySQL enquiries 表：改用 KV 存副本（30 日），後台 enquiries.php 暫時唔會見到新 lead。
 *     → 這點必須讓客戶知道，直至後台搬到 D1 或恢復 PHP。
 */

interface Env {
  /** Resend API key（Secret） */
  RESEND_API_KEY?: string;
  /** 收件人，預設 info@adwire.com.hk */
  MAIL_TO?: string;
  /** 寄件人，必須是已在 Resend 驗證的網域 */
  MAIL_FROM?: string;
  /** Turnstile secret（Secret） */
  TURNSTILE_SECRET?: string;
  /** KV：速率限制、去重、lead 副本 */
  ENQUIRIES?: KVNamespace;
}

// 專案冇裝 @cloudflare/workers-types，用結構性型別代替
interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
}

interface PagesContext {
  request: Request;
  env: Env;
}

const MAX = { name: 100, phone: 20, email: 200, service: 100, message: 2000, extra: 200 };
const MIN_DWELL_MS = 2500;
const RATE_WINDOW_S = 60;
const RATE_MAX = 3;
const DEDUPE_TTL_S = 600;
/** 郵件診斷紀錄保留 7 日 */
const DIAG_TTL_S = 60 * 60 * 24 * 7;

const ALLOWED_ORIGINS = new Set([
  "https://adwire.com.hk",
  "https://www.adwire.com.hk",
  "https://adwire-site.pages.dev",
]);

function cors(origin: string | null): Record<string, string> {
  const ok = origin && (ALLOWED_ORIGINS.has(origin) || origin.endsWith(".adwire-site.pages.dev"));
  return {
    "Access-Control-Allow-Origin": ok ? origin! : "https://adwire.com.hk",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function json(
  body: Record<string, unknown>,
  status = 200,
  origin: string | null = null,
  extra: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...cors(origin), ...extra },
  });
}

/** 移除控制字元，避免 header／HTML 注入 */
function clean(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function parseBody(request: Request): Promise<Record<string, unknown>> {
  const ct = (request.headers.get("content-type") || "").toLowerCase();
  if (ct.includes("application/json")) {
    try {
      return (await request.json()) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (ct.includes("form-urlencoded") || ct.includes("multipart/form-data")) {
    const fd = await request.formData();
    const out: Record<string, unknown> = {};
    fd.forEach((v, k) => {
      out[k] = typeof v === "string" ? v : "";
    });
    return out;
  }
  return {};
}

async function verifyTurnstile(token: string, secret: string, ip: string): Promise<"ok" | "fail" | "unknown"> {
  try {
    const form = new FormData();
    form.append("secret", secret);
    form.append("response", token);
    if (ip) form.append("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    if (!res.ok) return "unknown";
    const data = (await res.json()) as { success?: boolean };
    return data.success ? "ok" : "fail";
  } catch {
    // 驗證服務不可用時，唔可以靜默放行，但亦唔應該令真客完全交唔到表。
    // 交由 Turnstile 前端 widget 本身的把關 + honeypot + 速率限制補位。
    return "unknown";
  }
}

/** 60 秒內每 IP 最多 3 次 */
async function rateLimited(kv: KVNamespace | undefined, ip: string): Promise<boolean> {
  if (!kv) return false;
  const key = `rl:${ip}`;
  const cur = Number((await kv.get(key)) || "0");
  if (cur >= RATE_MAX) return true;
  await kv.put(key, String(cur + 1), { expirationTtl: RATE_WINDOW_S });
  return false;
}

/**
 * 去重查詢 —— 唯讀，唔會寫入任何狀態。
 * 只有 Resend 真正接受咗封郵件之後，才由 markSent() 寫入去重標記；
 * 否則「寄信失敗（缺 key／非 2xx／網絡錯誤）之後重試」會被錯誤當成重複而回報假成功。
 */
async function isDuplicate(kv: KVNamespace | undefined, fingerprint: string): Promise<boolean> {
  if (!kv) return false;
  try {
    return Boolean(await kv.get(`dup:${fingerprint}`));
  } catch (e) {
    // KV 查詢失敗唔應該阻止真客提交（fail-open，交由其他防護補位）
    console.error("[send-mail] dedupe lookup failed", stringifyError(e));
    return false;
  }
}

/** 寄信被接受之後才寫入去重標記；呼叫端必須自行包 try/catch（標記失敗唔可以當寄信失敗）。 */
async function markSent(kv: KVNamespace | undefined, fingerprint: string): Promise<void> {
  if (!kv) return;
  await kv.put(`dup:${fingerprint}`, "1", { expirationTtl: DEDUPE_TTL_S });
}

/** 將已知秘密（API key 等）從任何字串中移除，避免寫入日誌時洩漏。 */
function maskSecrets(input: string, secrets: Array<string | undefined>): string {
  let out = input;
  for (const s of secrets) {
    if (s && s.length >= 6) out = out.split(s).join("[redacted]");
  }
  return out;
}

/** 將未知 thrown 值安全轉成字串（避免 [object Object]）。 */
function stringifyError(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

// ── 安全持久化郵件診斷 ────────────────────────────────────────────────────────
//
// 目的：當寄信失敗（缺設定／供應商非 2xx／網絡），管理員可憑 requestId 追查根因。
// 安全原則：
//   - 診斷只包含「階段／結果／安全碼／供應商狀態／已遮罩嘅供應商訊息」，
//     絕對唔會寫入提交表單內容（姓名／電話／IP／UA／訊息）或任何秘密。
//   - 供應商回覆可能回顯 from/reply_to（即提交者電郵）或 API key；
//     寫入前會用 email/Bearer/re_ 規則及「已知提交字串」一併遮罩。
//   - 秘密（API key、Turnstile secret）亦會被移除。
//
// KV 限制：同一 key 每秒最多 1 次寫入。整個請求只會喺「終端結果」寫一次
// `maildiag:<uuid>`（中間階段只留喺記憶體），唔會先 put 再更新同一 key（否則 429）。

interface MailDiagnosticEvent {
  at: string;
  stage: string;
  outcome: string;
  code: string;
}

interface MailDiagnostic {
  requestId: string;
  createdAt: string;
  updatedAt: string;
  stage: string;
  outcome: "pending" | "accepted" | "failed";
  code: string;
  source: "assessment" | "contact";
  providerStatus: number | null;
  providerErrorName?: string;
  providerErrorMessage?: string;
  providerEmailId?: string;
  events: MailDiagnosticEvent[];
}

/** 以「已知字串」清單遮蔽（適用於秘密及提交者 PII；minLen 避免過度遮蔽短字串）。 */
function maskStrings(input: string, values: Array<string | undefined>, minLen = 3): string {
  let out = input;
  for (const v of values) {
    if (v && v.length >= minLen) out = out.split(v).join("[redacted]");
  }
  return out;
}

/** 診斷用文字清洗：移除秘密／已知提交字串、Bearer 及 re_ token、電郵、電話。 */
function redactDiagnostic(input: string, values: Array<string | undefined>): string {
  let out = maskStrings(input, values, 2);
  out = out.replace(/\bBearer\s+\S+/gi, "Bearer [redacted]");
  out = out.replace(/\bre_[A-Za-z0-9_\-]{6,}\b/g, "[redacted]");
  out = out.replace(/[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g, "[email]");
  out = out.replace(/\b(?:\+?852[\s\-]?)?[2-9]\d{3}[\s\-]?\d{4}\b/g, "[phone]");
  return out;
}

/** 從供應商錯誤 body 安全解析 name／message（非 JSON 時用原文），並遮罩敏感內容。 */
function parseProviderError(
  detail: string,
  values: Array<string | undefined>,
): { name: string; message: string } {
  let name = "provider_error";
  let message = detail;
  try {
    const j = JSON.parse(detail) as Record<string, unknown>;
    if (typeof j.name === "string" && j.name) name = j.name;
    else if (typeof j.error === "string" && j.error) name = j.error;
    if (typeof j.message === "string" && j.message) message = j.message;
    else if (typeof j.error_description === "string" && j.error_description) message = j.error_description;
    else if (typeof j.error === "string" && j.error) message = j.error;
  } catch {
    /* 非 JSON：保留原文（稍後遮罩） */
  }
  return {
    name: redactDiagnostic(name, values).slice(0, 120),
    message: redactDiagnostic(message, values).slice(0, 500),
  };
}

/**
 * 寫入「終端」診斷紀錄（每次請求恰一次）。
 * best-effort：寫入失敗只記 console，唔可以影響寄信結果（唔可以 throw）。
 */
async function finalizeDiagnostic(
  kv: KVNamespace | undefined,
  diag: MailDiagnostic,
  patch: Partial<MailDiagnostic>,
): Promise<void> {
  Object.assign(diag, patch);
  diag.updatedAt = new Date().toISOString();
  diag.events.push({ at: diag.updatedAt, stage: diag.stage, outcome: diag.outcome, code: diag.code });
  if (!kv) return;
  try {
    await kv.put(`maildiag:${diag.requestId}`, JSON.stringify(diag), { expirationTtl: DIAG_TTL_S });
  } catch (e) {
    // 診斷係輔助性副作用：寫入失敗唔可以令已寄出／已處理變成失敗。
    console.error("[send-mail] diag write failed (best-effort)", stringifyError(e));
  }
}

function buildEmail(f: {
  name: string; phone: string; email: string; service: string; company: string;
  companySite: string; budget: string; timeline: string; systemInfo: string;
  message: string; ip: string; ua: string; country: string;
  source: string; leadGrade: string; leadNotes: string;
}): { subject: string; html: string } {
  // 需求評估（/start/）嚟嘅 lead 喺標題標明評級，方便收件箱一眼排優先次序
  const tag = f.source === "assessment"
    ? `【需求評估${f.leadGrade ? `・${f.leadGrade} 級` : ""}】`
    : "【新客戶查詢】";
  const subject = `${tag}${f.name} - ${f.service}${f.budget && f.budget !== "未指定" ? ` - ${f.budget}` : ""}`;

  const rows: Array<[string, string]> = [
    ...(f.source === "assessment"
      ? ([["來源", "網站需求評估問卷（/start/）"], ["潛在客戶評級", f.leadGrade ? `${f.leadGrade} 級${f.leadNotes ? `（${f.leadNotes}）` : ""}` : ""]] as Array<[string, string]>)
      : []),
    ["姓名", f.name],
    ["電話", f.phone],
    ["電郵", f.email],
    ["公司／品牌", f.company],
    ["公司網站", f.companySite],
    ["感興趣服務", f.service],
    ["預算區間", f.budget],
    ["預計開始", f.timeline],
    ["現有系統／技術", f.systemInfo],
  ].filter(([, v]) => v && v !== "未指定") as Array<[string, string]>;

  const rowsHtml = rows
    .map(
      ([k, v]) => `<tr>
      <td style="padding:10px 14px;background:#f7f9fc;border-bottom:1px solid #e8edf5;color:#5b6b84;width:150px;vertical-align:top;font-size:13px">${escapeHtml(k)}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e8edf5;color:#1a1f36;font-size:14px">${escapeHtml(v).replace(/\n/g, "<br>")}</td>
    </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html><html lang="zh-Hant"><body style="margin:0;padding:0;background:#f4f6fa;font-family:'Helvetica Neue',Helvetica,Arial,'PingFang TC','Microsoft JhengHei',sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(15,76,129,.08)">
        <tr><td style="background:#0f4c81;padding:20px 24px;color:#fff">
          <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#f5a623;font-weight:700">ADWire Agency</div>
          <div style="font-size:19px;font-weight:700;margin-top:6px">${f.source === "assessment" ? "需求評估查詢" : "新客戶查詢"}</div>
        </td></tr>
        <tr><td style="padding:20px 24px 8px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${rowsHtml}</table>
        </td></tr>
        ${
          f.message
            ? `<tr><td style="padding:16px 24px 4px">
                <div style="font-size:12px;color:#5b6b84;margin-bottom:6px">訊息</div>
                <div style="background:#f7f9fc;border-left:3px solid #f5a623;padding:12px 14px;border-radius:0 8px 8px 0;font-size:14px;color:#1a1f36;line-height:1.7">${escapeHtml(f.message).replace(/\n/g, "<br>")}</div>
              </td></tr>`
            : ""
        }
        <tr><td style="padding:16px 24px 24px">
          <div style="font-size:11px;color:#8b98ad;line-height:1.7;border-top:1px solid #e8edf5;padding-top:12px">
            來源：${escapeHtml(f.ip)}${f.country ? " · " + escapeHtml(f.country) : ""}<br>
            User Agent：${escapeHtml(f.ua)}<br>
            由 Cloudflare Worker 接收（PHP 版已停用）
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;

  return { subject, html };
}

export const onRequest = async (context: PagesContext): Promise<Response> => {
  const { request, env } = context;
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(origin) });
  }
  if (request.method !== "POST") {
    return json({ success: false, message: "Method not allowed" }, 405, origin);
  }

  const ip = request.headers.get("cf-connecting-ip") || "";
  const country = request.headers.get("cf-ipcountry") || "";
  const ua = clean(request.headers.get("user-agent") || "", 300);

  const body = await parseBody(request);

  // ── Honeypot：填了就當機械人，回 success 但唔寄信（唔好提示機械人）──
  if (clean(body.website, 100) !== "") {
    return json({ success: true, message: "已收到，我們會盡快回覆。" }, 200, origin);
  }

  // ── 最短填表時間 ──
  const startedAt = Number(body.formStartedAt || 0);
  if (startedAt > 0 && Date.now() - startedAt < MIN_DWELL_MS) {
    return json({ success: false, message: "提交太快，請稍後再試。" }, 400, origin);
  }

  const name = clean(body.name, MAX.name);
  const phone = clean(body.phone, MAX.phone);
  const email = clean(body.email, MAX.email);
  const service = clean(body.service, MAX.service) || "未指定";
  const company = clean(body.company, MAX.extra);
  const companySite = clean(body.companySite, MAX.extra);
  const budget = clean(body.budget, MAX.extra);
  const timeline = clean(body.timeline, MAX.extra);
  const systemInfo = clean(body.systemInfo, MAX.extra);
  const message = clean(body.message, MAX.message);
  // 需求評估問卷附帶的內部評級：只接受白名單值，其餘當冇
  const source = clean(body.source, 30) === "assessment" ? "assessment" : "";
  const gradeRaw = clean(body.leadGrade, 2).toUpperCase();
  const leadGrade = source && ["A", "B", "C"].includes(gradeRaw) ? gradeRaw : "";
  const leadNotes = source ? clean(body.leadNotes, MAX.extra) : "";

  const phoneDigits = phone.replace(/[^0-9]/g, "");
  const errors: string[] = [];
  if (!name) errors.push("請填寫姓名。");
  if (phoneDigits.length < 8) errors.push("請填寫有效電話號碼。");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.push("請填寫有效電郵地址。");
  if (errors.length) {
    return json({ success: false, message: errors[0] }, 400, origin);
  }

  // ── Turnstile ──
  const tsToken = clean(body.turnstileToken, 4096);
  if (env.TURNSTILE_SECRET) {
    if (!tsToken) {
      return json({ success: false, message: "請完成人機驗證後再提交。" }, 400, origin);
    }
    const verdict = await verifyTurnstile(tsToken, env.TURNSTILE_SECRET, ip);
    if (verdict === "fail") {
      return json({ success: false, message: "人機驗證失敗，請重新整理頁面再試。" }, 400, origin);
    }
  }

  // ── 速率限制 + 去重 ──
  if (await rateLimited(env.ENQUIRIES, ip)) {
    return json({ success: false, message: "提交太頻繁，請稍後再試。" }, 429, origin);
  }
  const fingerprint = await sha256(`${name}|${email}|${message}`.toLowerCase());
  if (await isDuplicate(env.ENQUIRIES, fingerprint)) {
    return json({ success: true, message: "已收到，我們會盡快回覆。" }, 200, origin);
  }

  // ── 郵件診斷：通過所有防護後、config/寄信檢查前，先產生 requestId ──
  // 診斷只喺記憶體組裝；KV 同一 key 每秒最多 1 次寫入，故整個請求只在終端結果
  // 寫一次 `maildiag:<uuid>`（避免先 put 再 update 同一 key 造成 429）。
  const requestId = crypto.randomUUID();
  const diagSource: "assessment" | "contact" = source === "assessment" ? "assessment" : "contact";
  const diagNow = new Date().toISOString();
  const diag: MailDiagnostic = {
    requestId,
    createdAt: diagNow,
    updatedAt: diagNow,
    stage: "received",
    outcome: "pending",
    code: "pending",
    source: diagSource,
    providerStatus: null,
    events: [{ at: diagNow, stage: "received", outcome: "pending", code: "guards_passed" }],
  };
  const requestHeaders = { "X-Request-ID": requestId };

  const { subject, html } = buildEmail({
    name, phone, email, service, company, companySite, budget, timeline,
    systemInfo, message, ip, ua, country, source, leadGrade, leadNotes,
  });

  const record = {
    receivedAt: new Date().toISOString(),
    requestId,
    name, phone, email, service, company, companySite, budget, timeline,
    systemInfo, message, ip, country, ua, source, leadGrade, leadNotes,
  };

  // 先寫 KV（lead 不能只靠 email；寄信失敗時仍然有紀錄）
  if (env.ENQUIRIES) {
    try {
      await env.ENQUIRIES.put(`enq:${record.receivedAt}:${crypto.randomUUID()}`, JSON.stringify(record), {
        expirationTtl: 60 * 60 * 24 * 30,
      });
    } catch (e) {
      console.error("[send-mail] KV write failed", e);
    }
  }

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[send-mail] RESEND_API_KEY 未設定，無法寄信");
    await finalizeDiagnostic(env.ENQUIRIES, diag, {
      stage: "config",
      outcome: "failed",
      code: "missing_config",
      providerStatus: null,
    });
    return json(
      { success: false, code: "missing_config", requestId, message: "系統暫時未能發送，請直接 WhatsApp 或電郵 info@adwire.com.hk。" },
      503,
      origin,
      requestHeaders,
    );
  }

  const secrets = [apiKey, env.TURNSTILE_SECRET];
  // 供應商錯誤／例外可能回顯提交內容（from/reply_to 電郵、公司、IP 等）或秘密；
  // 將所有已知提交字串一併納入診斷遮罩，避免診斷紀錄洩漏 PII。
  const redactValues: Array<string | undefined> = [
    ...secrets, email, name, phoneDigits, company, companySite, systemInfo, message, ip, ua,
  ];

  let providerStatus: number | null = null;
  let providerEmailId: string | undefined;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // 刻意唔用 Resend Idempotency-Key：指紋只涵蓋 name|email|message，
        // 但 payload 仲有 service／budget／timeline／UA／IP／評級等；同一個 key
        // 配唔同 payload 會被 Resend 當 409 Conflict，將「合法重試或稍後嘅新提交」
        // 變成假失敗。重複提交已由 KV 內容去重處理，唔需要再加一層帶風險嘅 header。
      },
      body: JSON.stringify({
        from: env.MAIL_FROM || "ADWire Website <website@adwire.com.hk>",
        to: [env.MAIL_TO || "info@adwire.com.hk"],
        reply_to: email,
        subject,
        html,
      }),
    });
    providerStatus = res.status;
    if (!res.ok) {
      const detail = await res.text();
      console.error("[send-mail] Resend error", res.status, maskSecrets(detail, secrets).slice(0, 300));
      const parsed = parseProviderError(detail, redactValues);
      await finalizeDiagnostic(env.ENQUIRIES, diag, {
        stage: "provider",
        outcome: "failed",
        code: "provider_error",
        providerStatus,
        providerErrorName: parsed.name,
        providerErrorMessage: parsed.message,
      });
      return json(
        { success: false, code: "provider_error", requestId, message: "系統暫時未能發送，請直接 WhatsApp 或電郵 info@adwire.com.hk。" },
        502,
        origin,
        requestHeaders,
      );
    }

    // 供應商 2xx：已接受。安全解析供應商 email id（如 body 為 JSON）。
    // 注意：這只代表供應商「已接受」，唔等於「已送達」，所以唔會標示 Delivered。
    try {
      const data = (await res.json()) as { id?: unknown };
      if (data && typeof data.id === "string") providerEmailId = data.id.slice(0, 200);
    } catch {
      /* body 唔係 JSON：安全忽略，唔影響已接受狀態 */
    }
    await finalizeDiagnostic(env.ENQUIRIES, diag, {
      stage: "sent",
      outcome: "accepted",
      code: "ok",
      providerStatus,
      providerEmailId,
    });
  } catch (e) {
    console.error("[send-mail] Resend fetch failed", maskSecrets(stringifyError(e), secrets));
    // 保留真正失敗原因（已遮罩秘密／PII、唔含 stack）供管理員診斷。
    const errName = e instanceof Error ? e.name : "Error";
    await finalizeDiagnostic(env.ENQUIRIES, diag, {
      stage: "network",
      outcome: "failed",
      code: "network_error",
      providerStatus: null,
      providerErrorName: redactDiagnostic(errName, redactValues).slice(0, 120),
      providerErrorMessage: redactDiagnostic(stringifyError(e), redactValues).slice(0, 500),
    });
    return json(
      { success: false, code: "network_error", requestId, message: "系統暫時未能發送，請直接 WhatsApp 或電郵 info@adwire.com.hk。" },
      502,
      origin,
      requestHeaders,
    );
  }

  // 只有 Resend 真正接受咗封郵件，才寫入去重標記。
  // 寫入失敗唔可以將「已寄出」變成「失敗」—— 寄信係權威副作用，KV 只係輔助。
  try {
    await markSent(env.ENQUIRIES, fingerprint);
  } catch (e) {
    console.error("[send-mail] dedupe mark failed", maskSecrets(stringifyError(e), secrets));
  }

  return json({ success: true, requestId, message: "已收到，我們會盡快回覆。" }, 200, origin, requestHeaders);
};

/**
 * ops/mail-watchdog/src/index.ts — ADWire 郵件保護獨立監察 Worker
 *
 * 目的：當 ADWire 網站嘅主流寄信管道（Resend）出現故障、設定遺失或需要人手處理時，
 * 自動、獨立地發出告警。本 Worker **完全獨立**於 Resend：
 *   - 只透過 AgentMail 發告警（一個同 Resend 無關嘅第二管道）。
 *   - AgentMail 不可用時只記錄，**絕對唔會**改用／退回其他供應商（避免連鎖失效）。
 *
 * 執行契約（由 Cron Trigger 每 5 分鐘觸發 scheduled）：
 *   1. 讀取受保護嘅後端健康端點：GET  {SITE_URL}/inbox?mailops=health
 *      （帶 `Authorization: Bearer <MAIL_OPS_TOKEN>`）
 *   2. 健康時，呼叫有界重試端點：POST {SITE_URL}/inbox?mailops=retry
 *      （帶同一個 Bearer；由後端決定邊啲項目到期，Worker 唔會自行膨脹佢）
 *   3. 觸發告警嘅情況：缺設定 / 不健康 / 認證失敗 / 網絡失敗 / 重試錯誤 / 有待人手覆核
 *
 * 告警去重（避免洗版）：
 *   - 同一 fingerprint 首次出現即刻告警。
 *   - 之後同一 fingerprint 每個鐘最多一次。
 *   - 復原（incident 消失）只告警一次。
 *
 * 狀態：只用 WATCH_STATE KV 存「運維 metadata」（fingerprint／最後告警時間／次數／是否活躍）。
 *   - 唔存任何客戶紀錄、表單內容或秘密。
 *   - 只讀寫，永不刪除（復原時標記 active=false，唔會 delete key）。
 *
 * 安全：
 *   - `/` 只回公開版本同狀態，零副作用。
 *   - `POST /run` 需 Bearer MAIL_OPS_TOKEN（固定長度比較、fail-closed）。
 *   - 只 fetch 固定嘅站點端點同固定嘅 AgentMail 端點，唔會 fetch 請求帶入嘅任意 URL（無 SSRF）。
 *   - 所有 fetch 設逾時。
 *   - 日誌／回應永不包含秘密或 PII。
 */

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number; metadata?: unknown }): Promise<void>;
  list?(options?: { prefix?: string; limit?: number }): Promise<{ keys: Array<{ name: string }> }>;
}

export interface Env {
  /** 運維狀態 KV（metadata only）。父層稍後注入新 namespace id。 */
  WATCH_STATE?: KVNamespace;
  /** AgentMail API key（Secret，父層注入）。 */
  AGENTMAIL_API_KEY?: string;
  /** 後端 mail-ops 存取權杖（Secret，父層注入）。 */
  MAIL_OPS_TOKEN?: string;
  /** 站點來源；預設 https://adwire.com.hk。僅運維可調，唔由請求帶入。 */
  SITE_URL?: string;
  /**
   * @deprecated 為安全起見已 **忽略**：寄件 inbox 一律固定為 adwire-hermes3099@agentmail.to。
   * 保留欄位只為兼容舊 var 綁定，任何值都唔會改變實際寄件地址。
   */
  AGENTMAIL_INBOX_ID?: string;
  /**
   * @deprecated 為安全起見已 **忽略**：收件人一律固定為 info@adwire.com.hk。
   * 保留欄位只為兼容舊 var 綁定，任何值都唔會改變實際收件人。
   */
  ALERT_TO?: string;
  /** 逾時毫秒（字串）；預設 8000。 */
  FETCH_TIMEOUT_MS?: string;
}

export const WATCHDOG_VERSION = "mail-watchdog-v1";
export const PROTECTION_VERSION = "mail-protection-v1";

const DEFAULT_SITE_URL = "https://adwire.com.hk";
const AGENTMAIL_ENDPOINT = "https://api.agentmail.to/v0/inboxes";
const FIXED_ALERT_FROM = "adwire-hermes3099@agentmail.to";
const FIXED_ALERT_TO = "info@adwire.com.hk";
const DEFAULT_TIMEOUT_MS = 8000;
const ALERT_WINDOW_MS = 60 * 60 * 1000;

/**
 * 允許嘅監察目標主機（Bearer 憑證只可以送去呢啲固定主機，避免洩漏）：
 *   - adwire.com.hk —— 正式站
 *   - adwire-site.pages.dev —— Cloudflare Pages 專案預設域名
 *   - <deployment-alias>.adwire-site.pages.dev —— 單一標籤嘅部署別名
 */
const ALLOWED_SITE_HOSTS = new Set(["adwire.com.hk", "adwire-site.pages.dev"]);
const ALLOWED_PREVIEW_SUFFIX = ".adwire-site.pages.dev";

/** 後端健康合約要求嘅五個必要檢查；必須全部明確為 true。 */
export const REQUIRED_HEALTH_CHECKS = [
  "resendKey",
  "turnstileSecret",
  "inboxPassword",
  "outboxStorage",
  "opsToken",
] as const;

const INCIDENT_KINDS = [
  "missing_config",
  "unhealthy",
  "authfail",
  "networkfail",
  "retry_errors",
  "manual_review",
] as const;
export type IncidentKind = (typeof INCIDENT_KINDS)[number];

const KIND_LABEL: Record<IncidentKind, string> = {
  missing_config: "設定缺失（Missing config）",
  unhealthy: "後端不健康（Unhealthy）",
  authfail: "認證失敗（Auth failure）",
  networkfail: "網絡失敗（Network failure）",
  retry_errors: "重試錯誤（Retry errors）",
  manual_review: "有待人手覆核（Manual review pending）",
};

export const TEST_ALERT_SUBJECT = "【系統測試】獨立告警驗收";

interface HealthChecks {
  resendKey?: boolean;
  turnstileSecret?: boolean;
  inboxPassword?: boolean;
  outboxStorage?: boolean;
  opsToken?: boolean;
  [k: string]: boolean | undefined;
}

export interface HealthJSON {
  ok?: boolean;
  version?: string;
  checks?: HealthChecks;
  outbox?: { pending?: number; manualReview?: number };
}

interface RetryError {
  requestId?: string;
  code?: string;
  providerStatus?: number | null;
}

export interface RetryJSON {
  ok?: boolean;
  processed?: number;
  accepted?: number;
  pending?: number;
  manualReview?: number;
  errors?: RetryError[];
}

interface AlertState {
  active: boolean;
  lastAt: string;
  count: number;
}

interface Incident {
  kind: IncidentKind;
  detail: string;
}

export interface WatchRunResult {
  ok: boolean;
  version: string;
  checkedAt: string;
  healthStatus: number | null;
  health: HealthJSON | null;
  retry: RetryJSON | null;
  incidents: IncidentKind[];
  alertsSent: IncidentKind[];
  alertsSuppressed: IncidentKind[];
  alertsFailed: IncidentKind[];
  recovered: IncidentKind[];
}

// ── 純工具 ───────────────────────────────────────────────────────────────────

function stringifyError(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/** 將已知秘密從任何字串移除，避免日誌洩漏。 */
function maskSecrets(input: string, secrets: Array<string | undefined>): string {
  let out = input;
  for (const s of secrets) {
    if (s && s.length >= 6) out = out.split(s).join("[redacted]");
  }
  return out.replace(/\bBearer\s+\S+/gi, "Bearer [redacted]");
}

/** 固定長度、逐字元比較（避免時序側通道）。 */
function constantTimeEqual(a: unknown, b: unknown): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (b.length === 0) return false; // fail-closed：未設定權杖 = 永不放行
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function isAllowedPreviewHost(host: string): boolean {
  if (!host.endsWith(ALLOWED_PREVIEW_SUFFIX)) return false;
  const label = host.slice(0, host.length - ALLOWED_PREVIEW_SUFFIX.length);
  // 單一、合法嘅 DNS 標籤（唔可以再多一層 "."、唔可以為空）。
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label);
}

/**
 * SITE_URL 白名單驗證：只接受
 *   - https 協定
 *   - 無使用者憑證（user:pass@）
 *   - 預設 443 埠（或無埠）
 *   - 無 path／query／hash
 *   - 主機屬於 adwire.com.hk / adwire-site.pages.dev / <alias>.adwire-site.pages.dev
 * 任何其他值一律拒絕。
 */
export function isAllowedSiteUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  if (url.username !== "" || url.password !== "") return false;
  if (url.port !== "" && url.port !== "443") return false;
  if (url.pathname !== "/" || url.search !== "" || url.hash !== "") return false;
  const host = url.hostname.toLowerCase();
  if (ALLOWED_SITE_HOSTS.has(host)) return true;
  return isAllowedPreviewHost(host);
}

/**
 * Fail-closed：只有通過白名單嘅 SITE_URL 先會用。任何無效值都唔會將 Bearer
 * 送去該主機 —— 一律回退到固定正式站（canonical），維持監察同時零憑證洩漏。
 * （回退行為由測試明確覆蓋。）
 */
export function resolveSiteUrl(env: Env): string {
  const raw = (env.SITE_URL || "").trim();
  if (raw === "") return DEFAULT_SITE_URL;
  if (isAllowedSiteUrl(raw)) return new URL(raw).origin;
  console.error("[mail-watchdog] SITE_URL rejected (not an allowed host); falling back to canonical site");
  return DEFAULT_SITE_URL;
}

function timeoutMs(env: Env): number {
  const n = Number(env.FETCH_TIMEOUT_MS || "");
  if (Number.isFinite(n) && n > 0 && n <= 30000) return n;
  return DEFAULT_TIMEOUT_MS;
}

function jsonResponse(body: Record<string, unknown>, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
      ...extra,
    },
  });
}

/** 帶逾時的 fetch；逾時會以 AbortError 拒絕並由呼叫端轉成 networkfail。
 *  `redirect: "manual"` 確保唔會被 3xx 重定向帶走憑證，亦避免把重定向頁當成 200。 */
async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { redirect: "manual", ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ── 認證 ─────────────────────────────────────────────────────────────────────

export function isAuthorized(request: Request, env: Env): boolean {
  const token = env.MAIL_OPS_TOKEN;
  if (!token) return false; // fail-closed
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return false;
  const provided = header.slice(7).trim();
  return constantTimeEqual(provided, token);
}

// ── AgentMail（唯一，獨立告警管道）───────────────────────────────────────────

interface SendResult {
  ok: boolean;
  status: number;
  messageId?: string;
  error?: string;
}

export async function sendAgentMail(env: Env, subject: string, text: string): Promise<SendResult> {
  const key = env.AGENTMAIL_API_KEY;
  if (!key) {
    // 冇 key 就冇得獨立告警：只記錄，唔會退回其他供應商。
    console.error("[mail-watchdog] AGENTMAIL_API_KEY missing; cannot send independent alert");
    return { ok: false, status: 0, error: "missing_agentmail_key" };
  }
  // 收件人同寄件 inbox 一律固定，忽略任何 env 覆寫：防止改成送去其他收件人。
  const inboxId = FIXED_ALERT_FROM;
  const to = FIXED_ALERT_TO;
  const url = `${AGENTMAIL_ENDPOINT}/${encodeURIComponent(inboxId)}/messages/send`;
  try {
    const res = await fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to: [to], subject, text }),
      },
      timeoutMs(env),
    );
    if (!res.ok) {
      let detail = "";
      try {
        detail = (await res.text()).slice(0, 200);
      } catch {
        /* ignore */
      }
      console.error("[mail-watchdog] AgentMail rejected", res.status, maskSecrets(detail, [key]));
      return { ok: false, status: res.status, error: "provider_rejected" };
    }
    let messageId: string | undefined;
    try {
      const data = (await res.json()) as { message_id?: unknown };
      if (data && typeof data.message_id === "string") messageId = data.message_id;
    } catch {
      /* 非 JSON：已接受即可，唔影響結果 */
    }
    return { ok: true, status: res.status, messageId };
  } catch (e) {
    console.error(
      "[mail-watchdog] AgentMail fetch failed",
      maskSecrets(stringifyError(e), [key, env.MAIL_OPS_TOKEN]),
    );
    return { ok: false, status: 0, error: "network_error" };
  }
}

// ── 後端探測 ─────────────────────────────────────────────────────────────────

type Probe =
  | { outcome: "healthy"; status: number; health: HealthJSON }
  | { outcome: "missing_config"; status: number; detail: string; health: HealthJSON | null }
  | { outcome: "unhealthy"; status: number; detail: string; health: HealthJSON | null }
  | { outcome: "authfail"; status: number; detail: string }
  | { outcome: "networkfail"; status: null; detail: string };

async function fetchHealth(env: Env, siteUrl: string): Promise<Probe> {
  const url = `${siteUrl}/inbox?mailops=health`;
  let res: Response;
  try {
    res = await fetchWithTimeout(
      url,
      { method: "GET", headers: { Authorization: `Bearer ${env.MAIL_OPS_TOKEN}`, Accept: "application/json" }, redirect: "manual" },
      timeoutMs(env),
    );
  } catch {
    return { outcome: "networkfail", status: null, detail: "health_fetch_error" };
  }
  if (res.status === 401 || res.status === 403) {
    return { outcome: "authfail", status: res.status, detail: `http_${res.status}` };
  }

  // 先解析 body（連 5xx 都要解析）：後端會用 503 直接講出「缺設定」，
  // 唔可以因為狀態碼非 2xx 就一律當 generic unhealthy。
  let health: HealthJSON | null = null;
  let parsed = false;
  try {
    const data = (await res.json()) as unknown;
    if (data !== null && typeof data === "object" && !Array.isArray(data)) {
      health = data as HealthJSON;
      parsed = true;
    }
  } catch {
    parsed = false;
  }
  if (!parsed || !health) {
    return { outcome: "unhealthy", status: res.status, detail: res.ok ? "invalid_json" : `http_${res.status}`, health: null };
  }

  // 驗證健康合約：精確版本 mail-protection-v1 ＋ 五個必要檢查全部 true。
  const checks = health.checks && typeof health.checks === "object" ? health.checks : null;
  const checksOff = REQUIRED_HEALTH_CHECKS.filter((k) => !checks || checks[k] !== true);
  const versionOk = health.version === PROTECTION_VERSION;

  // 正面證據顯示保護設定唔完整 → missing_config（連 503 都算，唔可以當 generic unhealthy）。
  if (checks && checksOff.length > 0) {
    return { outcome: "missing_config", status: res.status, detail: `checks_off:${checksOff.join(",")}`, health };
  }
  if (typeof health.version === "string" && !versionOk) {
    return { outcome: "missing_config", status: res.status, detail: `version_mismatch:${health.version}`, health };
  }

  // 只有「完整確認」先算健康：2xx ＋ 版本正確 ＋ 五個檢查全 true ＋ ok:true。
  // 任何 {ok:true} 但缺 checks／版本不符嘅回應，一律唔可以當健康。
  if (res.ok && versionOk && checks !== null && checksOff.length === 0 && health.ok === true) {
    return { outcome: "healthy", status: res.status, health };
  }

  const detail = !res.ok ? `http_${res.status}` : !versionOk ? "version_not_confirmed" : "health_not_ok";
  return { outcome: "unhealthy", status: res.status, detail, health };
}

type RetryOutcome =
  | { outcome: "ok"; status: number; report: RetryJSON | null }
  | { outcome: "networkfail"; status: null; detail: string }
  | { outcome: "bad_status"; status: number; detail: string };

async function fetchRetry(env: Env, siteUrl: string): Promise<RetryOutcome> {
  const url = `${siteUrl}/inbox?mailops=retry`;
  let res: Response;
  try {
    res = await fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${env.MAIL_OPS_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ source: "mail-watchdog" }),
      },
      timeoutMs(env),
    );
  } catch {
    return { outcome: "networkfail", status: null, detail: "retry_fetch_error" };
  }
  if (!res.ok) {
    return { outcome: "bad_status", status: res.status, detail: `http_${res.status}` };
  }
  let report: RetryJSON | null = null;
  try {
    report = (await res.json()) as RetryJSON;
  } catch {
    report = null;
  }
  return { outcome: "ok", status: res.status, report };
}

// ── 狀態存取（metadata only，永不刪除）──────────────────────────────────────

async function loadState(kv: KVNamespace | undefined, kind: IncidentKind): Promise<AlertState | null> {
  if (!kv) return null;
  try {
    const raw = await kv.get(`alert:${kind}`);
    if (!raw) return null;
    const s = JSON.parse(raw) as Partial<AlertState>;
    if (!s || typeof s !== "object") return null;
    return {
      active: Boolean(s.active),
      lastAt: typeof s.lastAt === "string" ? s.lastAt : "",
      count: Number.isFinite(Number(s.count)) ? Number(s.count) : 0,
    };
  } catch (e) {
    console.error("[mail-watchdog] state read failed", maskSecrets(stringifyError(e), []));
    return null;
  }
}

async function saveState(kv: KVNamespace | undefined, kind: IncidentKind, state: AlertState): Promise<void> {
  if (!kv) return;
  try {
    // 只寫運維 metadata；冇客戶資料、冇秘密。永不 delete。
    await kv.put(`alert:${kind}`, JSON.stringify(state), { metadata: { kind } });
  } catch (e) {
    console.error("[mail-watchdog] state write failed", maskSecrets(stringifyError(e), []));
  }
}

// ── 告警內文（安全：只含狀態碼／安全計數／技術 id，無 PII）──────────────────

function buildAlertText(
  kind: IncidentKind,
  detail: string,
  ctx: { siteUrl: string; checkedAt: string; probe: Probe | null; retry: RetryJSON | null },
): string {
  const lines: string[] = [
    "ADWire 郵件保護監察 — 獨立告警（經 AgentMail 發出，與 Resend 無關）",
    `事件類型：${kind}`,
    `時間：${ctx.checkedAt}`,
    `站點：${ctx.siteUrl}`,
    `詳情：${detail}`,
  ];
  const p = ctx.probe;
  if (p && p.outcome === "healthy" && p.health.outbox) {
    lines.push(
      `待處理佇列：pending=${Number(p.health.outbox.pending ?? 0)} manualReview=${Number(p.health.outbox.manualReview ?? 0)}`,
    );
  }
  if (p && (p.outcome === "missing_config" || p.outcome === "unhealthy") && p.health && p.health.checks) {
    const on = Object.keys(p.health.checks).filter((k) => p.health!.checks![k] === true);
    lines.push(`通過檢查：${on.length ? on.join(",") : "(無)"}`);
  }
  if (ctx.retry) {
    lines.push(
      `重試結果：processed=${Number(ctx.retry.processed ?? 0)} accepted=${Number(ctx.retry.accepted ?? 0)} ` +
        `pending=${Number(ctx.retry.pending ?? 0)} manualReview=${Number(ctx.retry.manualReview ?? 0)}`,
    );
    const errs = Array.isArray(ctx.retry.errors) ? ctx.retry.errors : [];
    if (errs.length > 0) {
      const ids = errs
        .slice(0, 10)
        .map((e) => `${String(e.requestId ?? "?")}:${String(e.code ?? "?")}:${String(e.providerStatus ?? "null")}`)
        .join(" | ");
      lines.push(`重試錯誤：${ids}`);
    }
  }
  lines.push("此為自動化訊息；請勿回覆。");
  return lines.join("\n");
}

async function raiseAlert(
  env: Env,
  kind: IncidentKind,
  text: string,
  recoveredItem = false,
): Promise<SendResult> {
  const subject = recoveredItem
    ? `【獨立告警・已恢復】ADWire 郵件保護 — ${KIND_LABEL[kind]}`
    : `【獨立告警】ADWire 郵件保護 — ${KIND_LABEL[kind]}`;
  return sendAgentMail(env, subject, text);
}

// ── 單次監察執行 ─────────────────────────────────────────────────────────────

export async function runWatch(env: Env, now: number = Date.now()): Promise<WatchRunResult> {
  const siteUrl = resolveSiteUrl(env);
  const checkedAt = new Date(now).toISOString();
  const incidents: Incident[] = [];
  let healthStatus: number | null = null;
  let health: HealthJSON | null = null;
  let retry: RetryJSON | null = null;
  let probe: Probe | null = null;

  // 1. Worker 自身必要設定
  const missingLocal: string[] = [];
  if (!env.MAIL_OPS_TOKEN) missingLocal.push("MAIL_OPS_TOKEN");
  if (!env.WATCH_STATE) missingLocal.push("WATCH_STATE");
  if (!env.AGENTMAIL_API_KEY) missingLocal.push("AGENTMAIL_API_KEY");

  if (!env.MAIL_OPS_TOKEN) {
    // 冇權杖連健康端點都問唔到：缺設定，直接告警（AgentMail 可用時）。
    incidents.push({ kind: "missing_config", detail: `worker_config_missing:${missingLocal.join(",")}` });
  } else {
    probe = await fetchHealth(env, siteUrl);
    healthStatus = probe.status ?? null;
    if (probe.outcome === "healthy") {
      health = probe.health;
      const r = await fetchRetry(env, siteUrl);
      if (r.outcome === "networkfail") {
        incidents.push({ kind: "networkfail", detail: `retry:${r.detail}` });
      } else if (r.outcome === "bad_status") {
        incidents.push({ kind: "retry_errors", detail: `retry:${r.detail}` });
      } else {
        retry = r.report;
        const errs = Array.isArray(r.report?.errors) ? r.report!.errors! : [];
        if (errs.length > 0) {
          incidents.push({ kind: "retry_errors", detail: `retry_errors:${errs.length}` });
        }
        if (Number(r.report?.manualReview ?? 0) > 0) {
          incidents.push({ kind: "manual_review", detail: `manual_review:${Number(r.report?.manualReview)}` });
        }
      }
    } else if (probe.outcome === "missing_config") {
      health = probe.health;
      incidents.push({ kind: "missing_config", detail: probe.detail });
    } else if (probe.outcome === "unhealthy") {
      health = probe.health;
      incidents.push({ kind: "unhealthy", detail: probe.detail });
    } else if (probe.outcome === "authfail") {
      incidents.push({ kind: "authfail", detail: probe.detail });
    } else {
      incidents.push({ kind: "networkfail", detail: probe.detail });
    }
  }

  if (missingLocal.length > 0) {
    console.error("[mail-watchdog] local config missing:", missingLocal.join(","));
  }

  // 2. 告警去重 ＋ 復原
  const alertsSent: IncidentKind[] = [];
  const alertsSuppressed: IncidentKind[] = [];
  const alertsFailed: IncidentKind[] = [];
  const recovered: IncidentKind[] = [];
  const nowIso = checkedAt;

  for (const kind of INCIDENT_KINDS) {
    const current = incidents.find((i) => i.kind === kind) ?? null;
    const state = await loadState(env.WATCH_STATE, kind);

    if (current) {
      const withinWindow =
        state?.active && state.lastAt !== "" && now - Date.parse(state.lastAt) < ALERT_WINDOW_MS;
      if (withinWindow) {
        alertsSuppressed.push(kind);
        continue;
      }
      const ctx = { siteUrl, checkedAt, probe, retry };
      const sent = await raiseAlert(env, kind, buildAlertText(kind, current.detail, ctx), false);
      await saveState(env.WATCH_STATE, kind, {
        active: true,
        lastAt: nowIso,
        count: (state?.count ?? 0) + 1,
      });
      if (sent.ok) alertsSent.push(kind);
      else alertsFailed.push(kind);
    } else if (state?.active) {
      // 復原：只告警一次，之後標記為非活躍（唔刪）。
      const ctx = { siteUrl, checkedAt, probe, retry };
      const sent = await raiseAlert(env, kind, buildAlertText(kind, "已恢復（incident cleared）", ctx), true);
      await saveState(env.WATCH_STATE, kind, { active: false, lastAt: nowIso, count: state.count });
      if (sent.ok) recovered.push(kind);
    }
  }

  return {
    ok: true,
    version: WATCHDOG_VERSION,
    checkedAt,
    healthStatus,
    health,
    retry,
    incidents: incidents.map((i) => i.kind),
    alertsSent,
    alertsSuppressed,
    alertsFailed,
    recovered,
  };
}

// ── HTTP 外觀 ────────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (path === "/") {
      if (request.method !== "GET") {
        return jsonResponse({ ok: false, error: "method_not_allowed" }, 405, { Allow: "GET" });
      }
      // 公開：只有版本同狀態，零副作用、零洩漏。
      return jsonResponse({
        ok: true,
        worker: "adwire-mail-watchdog",
        version: WATCHDOG_VERSION,
        status: "ready",
        protectionVersion: PROTECTION_VERSION,
      });
    }

    if (path === "/run") {
      if (request.method !== "POST") {
        // 唔安全嘅 GET 唔可以有副作用。
        return jsonResponse({ ok: false, error: "method_not_allowed" }, 405, { Allow: "POST" });
      }
      if (!isAuthorized(request, env)) {
        return jsonResponse({ ok: false, error: "unauthorized" }, 401);
      }
      if (url.searchParams.get("testAlert") === "1") {
        // 明確測試告警：唔會捏造 incident、唔會寫 KV 狀態。
        const text = [
          TEST_ALERT_SUBJECT,
          "此為 ADWire 郵件保護監察嘅獨立告警測試。",
          `時間：${new Date().toISOString()}`,
          "如收到此訊息，代表獨立告警管道（AgentMail）運作正常。",
          "此為自動化訊息；請勿回覆。",
        ].join("\n");
        const sent = await sendAgentMail(env, TEST_ALERT_SUBJECT, text);
        if (!sent.ok) {
          // 供應商拒絕：唔可以報假成功。
          return jsonResponse(
            { ok: false, alertSent: false, error: sent.error ?? "provider_rejected", status: sent.status },
            502,
          );
        }
        return jsonResponse({ ok: true, alertSent: true, messageId: sent.messageId ?? null }, 200);
      }
      const result = await runWatch(env);
      return jsonResponse({ ...result }, result.ok ? 200 : 503);
    }

    return jsonResponse({ ok: false, error: "not_found" }, 404);
  },

  async scheduled(_event: unknown, env: Env): Promise<void> {
    try {
      await runWatch(env);
    } catch (e) {
      // 永不讓例外帶秘密出街；scheduled 失敗只記錄。
      console.error(
        "[mail-watchdog] scheduled run failed",
        maskSecrets(stringifyError(e), [env.AGENTMAIL_API_KEY, env.MAIL_OPS_TOKEN]),
      );
    }
  },
};

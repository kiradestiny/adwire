/**
 * scripts/mail-readiness.mjs — 部署後郵件保護 readiness 檢查（CLI）
 *
 * 用途：喺 Pages 部署之後，以一個只讀（read-only）嘅方式驗證 /inbox 嘅郵件保護
 * 設定是否齊全，而唔會洩漏任何秘密值，亦唔會預設真實寄信。
 *
 *   GET  {target}/inbox?mailops=health   （必須 200，body ok:true、version mail-protection-v1、所有 checks 為 true）
 *   POST {target}/inbox?mailops=probe    （可選，--probe；必須 provider 200/201 accepted 且 ok:true）
 *
 * 安全：
 *   - target 主機嚴格白名單（adwire.com.hk 或 adwire-site.pages.dev 部署主機）＋ 只准 https、禁憑證／非預設埠 → 防 SSRF。
 *   - token 來自 MAIL_OPS_TOKEN 環境變數或 --ops-token-file，只放喺 Bearer 標頭。
 *   - 逾時（預設 10s）／非 2xx／body 壞 JSON 一律非零退出，且永不印出回應 body 或 token。
 *   - 只輸出安全摘要欄位（version / checks / outbox / providerStatus / providerEmailId / errorCode）。
 *   - probe 成功亦只聲稱 provider 接受（accepted）；永不聲稱 inbox 已投遞（inboxDelivered）。
 *
 * 使用：
 *   MAIL_OPS_TOKEN=… node scripts/mail-readiness.mjs --target https://adwire.com.hk
 *   MAIL_OPS_TOKEN=… node scripts/mail-readiness.mjs --target https://adwire-site.pages.dev --probe
 *   node scripts/mail-readiness.mjs --target https://adwire.com.hk --ops-token-file ./ops.token
 */

import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const HEALTH_VERSION = "mail-protection-v1";
export const REQUIRED_CHECKS = ["resendKey", "turnstileSecret", "inboxPassword", "outboxStorage", "opsToken"];

/** 精確允許嘅主機。 */
export const ALLOWED_EXACT_HOSTS = ["adwire.com.hk", "adwire-site.pages.dev"];
/** 允許嘅主機後綴（Pages 專案主機）。 */
export const ALLOWED_HOST_SUFFIXES = [".adwire-site.pages.dev"];

export const DEFAULT_TIMEOUT_MS = 10000;

/**
 * 驗證並正規化 target。嚴格白名單，回傳 { ok:true, base } 或 { ok:false, code:"TARGET_NOT_ALLOWED" }。
 * base 為 origin（不含尾斜線）。
 */
export function resolveTargetBase(raw) {
  if (typeof raw !== "string" || raw.trim() === "") return { ok: false, code: "TARGET_NOT_ALLOWED" };
  let u;
  try {
    u = new URL(raw.trim());
  } catch {
    return { ok: false, code: "TARGET_NOT_ALLOWED" };
  }
  if (u.protocol !== "https:") return { ok: false, code: "TARGET_NOT_ALLOWED" };
  if (u.username || u.password) return { ok: false, code: "TARGET_NOT_ALLOWED" };
  if (u.port !== "") return { ok: false, code: "TARGET_NOT_ALLOWED" };
  const host = u.hostname.toLowerCase();
  const exact = ALLOWED_EXACT_HOSTS.includes(host);
  const suffix = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.adwire-site\.pages\.dev$/.test(host);
  if (u.pathname !== "/" || u.search || u.hash) return { ok: false, code: "TARGET_NOT_ALLOWED" };
  if (!exact && !suffix) return { ok: false, code: "TARGET_NOT_ALLOWED" };
  return { ok: true, base: u.origin };
}

export function buildHealthUrl(base) {
  return `${base}/inbox?mailops=health`;
}
export function buildProbeUrl(base) {
  return `${base}/inbox?mailops=probe`;
}

/**
 * 讀取 ops token：環境變數優先，其次 --ops-token-file。
 * 回傳 { ok:true, token } 或 { ok:false, code }。永不回傳／印出檔案內容以外嘅資訊。
 */
export function readOpsToken({ env = {}, opsTokenFile, readFile = readFileSync } = {}) {
  const fromEnv = env.MAIL_OPS_TOKEN;
  if (typeof fromEnv === "string" && fromEnv.trim() !== "") return { ok: true, token: fromEnv.trim() };
  if (opsTokenFile) {
    let raw;
    try {
      raw = readFile(opsTokenFile, "utf8");
    } catch {
      return { ok: false, code: "TOKEN_FILE_UNREADABLE" };
    }
    const tok = String(raw).trim();
    if (tok === "") return { ok: false, code: "TOKEN_MISSING" };
    return { ok: true, token: tok };
  }
  return { ok: false, code: "TOKEN_MISSING" };
}

function safeNum(v) {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/**
 * 驗證 health 回應。
 * 合約：{ ok:true, version:"mail-protection-v1", checks:{resendKey,turnstileSecret,inboxPassword,outboxStorage,opsToken 全 true}, outbox:{pending,manualReview} }
 * 回傳 { ok, code, summary }；summary 只含安全欄位。
 */
export function validateHealth(status, body) {
  if (status !== 200) return { ok: false, code: "HTTP_STATUS", summary: { status } };
  if (body === null || typeof body !== "object" || Array.isArray(body)) return { ok: false, code: "BAD_BODY", summary: { status } };
  if (body.ok !== true) return { ok: false, code: "NOT_OK", summary: { status } };
  if (body.version !== HEALTH_VERSION) {
    return { ok: false, code: "VERSION_MISMATCH", summary: { status, version: typeof body.version === "string" ? body.version : null } };
  }
  const checks = body.checks;
  if (checks === null || typeof checks !== "object" || Array.isArray(checks)) {
    return { ok: false, code: "CHECKS_MISSING", summary: { status } };
  }
  const safeChecks = {};
  for (const k of REQUIRED_CHECKS) {
    if (checks[k] !== true) return { ok: false, code: "CHECK_FAILED", summary: { status, failedCheck: k } };
    safeChecks[k] = true;
  }
  const summary = { status, version: HEALTH_VERSION, checks: safeChecks };
  if (body.outbox && typeof body.outbox === "object" && !Array.isArray(body.outbox)) {
    summary.outbox = { pending: safeNum(body.outbox.pending), manualReview: safeNum(body.outbox.manualReview) };
  }
  return { ok: true, code: "OK", summary };
}

/**
 * 驗證 probe 回應。
 * 合約：{ ok:true, providerStatus, providerEmailId, errorCode? }
 * 只聲稱 provider 接受；永不聲稱 inbox 已投遞。
 */
export function validateProbe(status, body) {
  const acceptedHttp = status === 200 || status === 201;
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, code: "BAD_BODY", summary: { status } };
  }
  const summary = { status };
  if (typeof body.providerStatus === "number") summary.providerStatus = body.providerStatus;
  if (typeof body.providerEmailId === "string") summary.providerEmailId = body.providerEmailId;
  if (typeof body.errorCode === "string") summary.errorCode = body.errorCode;
  if (!acceptedHttp) return { ok: false, code: "HTTP_STATUS", summary };
  if (body.ok !== true) return { ok: false, code: "NOT_OK", summary };
  if (body.providerStatus !== 200 && body.providerStatus !== 201) return { ok: false, code: "PROVIDER_NOT_ACCEPTED", summary };
  return { ok: true, code: "OK", summary };
}

async function fetchWithTimeout(fetchImpl, url, opts, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { ...opts, redirect: "error", signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

const authHeaders = (token) => ({ Authorization: `Bearer ${token}`, Accept: "application/json" });

/**
 * 執行 readiness 檢查。回傳 { ok, code, summary?, detail? }。永不擲出。
 * probe=false（預設）只做 read-only GET，永不寄信。
 */
export async function runReadiness({ target, token, probe = false, fetchImpl = globalThis.fetch, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const r = resolveTargetBase(target);
  if (!r.ok) return { ok: false, code: "TARGET_NOT_ALLOWED" };
  if (typeof token !== "string" || token.trim() === "") return { ok: false, code: "TOKEN_MISSING" };

  let res;
  try {
    res = await fetchWithTimeout(fetchImpl, buildHealthUrl(r.base), { method: "GET", headers: authHeaders(token) }, timeoutMs);
  } catch (e) {
    return { ok: false, code: e && e.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR" };
  }

  let body;
  try {
    body = await res.json();
  } catch {
    return { ok: false, code: "BAD_JSON", status: res.status };
  }

  const health = validateHealth(res.status, body);
  if (!health.ok) return { ok: false, code: "READINESS_FAILED", detail: health.code, summary: health.summary };
  if (!probe) return { ok: true, code: "OK", summary: { health: health.summary } };

  let pres;
  try {
    pres = await fetchWithTimeout(fetchImpl, buildProbeUrl(r.base), { method: "POST", headers: authHeaders(token) }, timeoutMs);
  } catch (e) {
    return { ok: false, code: e && e.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR" };
  }

  let pbody;
  try {
    pbody = await pres.json();
  } catch {
    return { ok: false, code: "BAD_JSON", status: pres.status };
  }

  const pr = validateProbe(pres.status, pbody);
  if (!pr.ok) return { ok: false, code: "PROBE_FAILED", detail: pr.code, summary: pr.summary };
  return { ok: true, code: "OK", summary: { health: health.summary, probe: pr.summary } };
}

// ────────────────────────── CLI ──────────────────────────
const HELP = `用法：
  node scripts/mail-readiness.mjs --target <https://adwire.com.hk | https://adwire-site.pages.dev> [--probe] [--ops-token-file <path>] [--timeout <ms>]

  --target <url>          必填；只接受 https://adwire.com.hk 或 adwire-site.pages.dev 部署主機
  --probe                 額外 POST ?mailops=probe（會令供應商嘗試；預設只做只讀 health）
  --ops-token-file <path> token 檔案（否則讀 MAIL_OPS_TOKEN 環境變數）
  --timeout <ms>          每次請求逾時（預設 10000）
  --help                  顯示本說明

退出碼：0 成功；1 檢查失敗／逾時／網絡錯誤；2 用法或 token 問題。`;

function parseArgs(argv) {
  const out = { help: false, probe: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--probe") out.probe = true;
    else if (a === "--target" || a.startsWith("--target=")) out.target = a.includes("=") ? a.slice("--target=".length) : argv[++i];
    else if (a === "--ops-token-file" || a.startsWith("--ops-token-file=")) out.opsTokenFile = a.includes("=") ? a.slice("--ops-token-file=".length) : argv[++i];
    else if (a === "--timeout" || a.startsWith("--timeout=")) out.timeoutMs = Number(a.includes("=") ? a.slice("--timeout=".length) : argv[++i]);
  }
  return out;
}

export async function main(argv, deps = {}) {
  const env = deps.env ?? process.env;
  const log = deps.log ?? console.log;
  const error = deps.error ?? console.error;
  const fetchImpl = deps.fetchImpl ?? globalThis.fetch;
  const readFile = deps.readFile ?? readFileSync;

  const args = parseArgs(argv);
  if (args.help) {
    log(HELP);
    return 0;
  }
  if (!args.target) {
    error("需要 --target <https://adwire.com.hk 或 Pages 專案主機>");
    return 2;
  }
  const tok = readOpsToken({ env, opsTokenFile: args.opsTokenFile, readFile });
  if (!tok.ok) {
    error("缺少 MAIL_OPS_TOKEN（或 --ops-token-file）");
    return 2;
  }
  const timeoutMs = Number.isFinite(args.timeoutMs) && args.timeoutMs > 0 ? args.timeoutMs : DEFAULT_TIMEOUT_MS;

  const r = await runReadiness({ target: args.target, token: tok.token, probe: args.probe, fetchImpl, timeoutMs });
  if (!r.ok) {
    error(`mail readiness 檢查失敗（${r.code}${r.detail ? "/" + r.detail : ""}${r.status ? "/http" + r.status : ""}）`);
    return 1;
  }
  log(JSON.stringify({ ok: true, mode: args.probe ? "readiness+probe" : "readiness", ...r.summary }, null, 2));
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2))
    .then((code) => process.exit(code))
    .catch(() => {
      console.error("mail-readiness：未預期錯誤");
      process.exit(1);
    });
}

/**
 * scripts/mail-safe-config.mjs — 極小秘密補丁（Cloudflare Pages 專案 env_vars）
 *
 * 背景（2026-10-26 郵件事故）：先前嘅操作腳本用 GET project → deepcopy 整個
 * deployment_configs → 改一個 key → PATCH 整個 config。因為 GET 回傳嘅秘密已遮罩，
 * 呢個「來回」把空／遮罩值寫返去，覆蓋咗 RESEND_API_KEY，令寄信靜默壞掉。
 *
 * 本工具刻意只做「單向寫入」：由外部秘密檔案讀取實際值，只建立「只含指定、
 * 白名單名稱嘅 env_vars」補丁，直接 PATCH，永不 GET、永不回傳整個 config、
 * 永不記錄任何值。
 *
 * 使用：
 *   node scripts/mail-safe-config.mjs --secret-file ./mail-secrets.json --target production            # dry-run（預設）
 *   CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=… CLOUDFLARE_PROJECT_NAME=adwire-site \
 *     node scripts/mail-safe-config.mjs --secret-file ./mail-secrets.json --target production --apply
 *
 * 秘密檔案格式（外部、不入 repo）：
 *   { "RESEND_API_KEY": "re_…", "MAIL_OPS_TOKEN": "…", "MAIL_TO": "info@adwire.com.hk" }
 *
 * 安全不變式：
 *   - 只有四個秘密名稱（secret_text）＋兩個非秘密名稱（plain_text）准許寫入。
 *   - 拒絕 null／空／純空白／前後空白／控制字元／遮罩值（***、REDACTED…）／
 *     物件／陣列（Cloudflare GET 嘅遮罩 Secret 物件、整個回傳 config）。
 *   - 永不出現在日誌、錯誤或摘要中；token 只放喺 Authorization 標頭。
 *
 * 注意：本工具只降低誤覆蓋風險。它不能阻止任何人有 Cloudflare API token 之後
 * 直接呼叫 API；真正的防線是最小權限 token（Account > Cloudflare Pages > Edit）
 * ＋只用本核准腳本。
 */

import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

// ────────────────────────── 白名單 ──────────────────────────
/** 秘密（secret_text）。 */
export const ALLOWED_SECRET_BINDINGS = ["RESEND_API_KEY", "TURNSTILE_SECRET", "INBOX_PASSWORD", "MAIL_OPS_TOKEN"];
/** 非秘密（plain_text）——只在有需要時使用。 */
export const ALLOWED_PLAIN_BINDINGS = ["MAIL_TO", "MAIL_FROM"];
export const ALLOWED_BINDINGS = [...ALLOWED_SECRET_BINDINGS, ...ALLOWED_PLAIN_BINDINGS];
const SECRET_SET = new Set(ALLOWED_SECRET_BINDINGS);
const PLAIN_SET = new Set(ALLOWED_PLAIN_BINDINGS);

export const SECRET_TYPE = "secret_text";
export const PLAIN_TYPE = "plain_text";
export const VALID_TARGETS = new Set(["production", "preview"]);

/** 認得出係回傳 envelope（整個 config）嘅頂層 key。 */
const ENVELOPE_KEYS = ["result", "success", "errors", "deployment_configs", "env_vars", "secrets", "messages"];

/** 全遮罩字元樣式（例如 ********、••••）。 */
const MASK_CHARS_RE = /^[*\u2022\u00b7]+$/;
/** 常見遮罩佔位字串（小寫比對）。 */
const MASK_PLACEHOLDERS = new Set([
  "redacted", "[redacted]", "(redacted)", "<redacted>",
  "masked", "[masked]", "(masked)", "<masked>",
  "secret", "[secret]", "(secret)", "<secret>",
  "hidden", "[hidden]", "unchanged", "[unchanged]",
]);
const CONTROL_RE = /[\u0000-\u001f\u007f]/;

/** 該名稱屬哪一類？非白名單回 null。 */
export function classifyBinding(name) {
  if (typeof name !== "string") return null;
  if (SECRET_SET.has(name)) return SECRET_TYPE;
  if (PLAIN_SET.has(name)) return PLAIN_TYPE;
  return null;
}

/** 是否係遮罩／佔位值（非字串一律視為物件 → 由呼叫端處理）。 */
export function isMaskedValue(value) {
  if (typeof value !== "string") return false;
  const v = value.trim();
  if (v === "") return false;
  if (MASK_CHARS_RE.test(v)) return true;
  if (MASK_PLACEHOLDERS.has(v.toLowerCase())) return true;
  return false;
}

/**
 * 驗證單一綁定。回傳 { ok:true, name, value, type } 或 { ok:false, code, name }。
 * code ∈ NOT_ALLOWED | MASKED_OR_OBJECT | MASKED_VALUE | EMPTY_VALUE | CONTROL_CHARS | WHITESPACE_VALUE
 */
export function validateBindingValue(name, value) {
  if (classifyBinding(name) === null) return { ok: false, code: "NOT_ALLOWED", name };
  if (typeof value !== "string") return { ok: false, code: "MASKED_OR_OBJECT", name };
  if (isMaskedValue(value)) return { ok: false, code: "MASKED_VALUE", name };
  if (value.trim().length === 0) return { ok: false, code: "EMPTY_VALUE", name };
  if (CONTROL_RE.test(value)) return { ok: false, code: "CONTROL_CHARS", name };
  if (value !== value.trim()) return { ok: false, code: "WHITESPACE_VALUE", name };
  return { ok: true, name, value, type: classifyBinding(name) };
}

/**
 * 由 { NAME: value } 建立 env_vars entries。只保留白名單名稱。
 * 回傳 { ok, entries, names } 或 { ok:false, errors }（errors 只含 name/code，絕不含值）。
 */
export function buildEnvVarEntries(secretMap) {
  if (secretMap === null || typeof secretMap !== "object" || Array.isArray(secretMap)) {
    return { ok: false, errors: [{ name: "(map)", code: "CONFIG_OBJECT" }], entries: {}, names: [] };
  }
  const keys = Object.keys(secretMap);
  if (keys.some((k) => ENVELOPE_KEYS.includes(k))) {
    return { ok: false, errors: [{ name: "(map)", code: "CONFIG_OBJECT" }], entries: {}, names: [] };
  }
  const entries = {};
  const names = [];
  const errors = [];
  for (const name of keys) {
    const v = validateBindingValue(name, secretMap[name]);
    if (!v.ok) {
      errors.push({ name, code: v.code });
      continue;
    }
    entries[name] = { type: v.type, value: v.value };
    names.push(name);
  }
  if (errors.length) return { ok: false, errors, entries: {}, names: [] };
  return { ok: true, entries, names, errors: [] };
}

/** 建立只針對單一 target 嘅補丁 body。 */
export function buildPatchBody(target, entries) {
  return { deployment_configs: { [target]: { env_vars: entries } } };
}

/**
 * 建立完整計畫。回傳 { ok, target, names, entries, patch, errors }。
 * 非法名稱／值／target → ok:false。
 */
export function buildPlan({ target, secretMap } = {}) {
  if (!VALID_TARGETS.has(target)) {
    return { ok: false, target, names: [], entries: {}, patch: null, errors: [{ name: "(target)", code: "BAD_TARGET" }] };
  }
  const r = buildEnvVarEntries(secretMap);
  if (!r.ok) return { ok: false, target, names: [], entries: {}, patch: null, errors: r.errors };
  return { ok: true, target, names: r.names, entries: r.entries, patch: buildPatchBody(target, r.entries), errors: [] };
}

/** 安全摘要（只有名稱／target／數量／mode，零值）。 */
export function safeSummary(plan, { mode = "dry-run" } = {}) {
  const bindings = Array.isArray(plan.names) ? [...plan.names] : [];
  return { mode, target: plan.target, bindings, count: bindings.length };
}

/** Cloudflare Pages 專案 update URL。 */
export function cloudflarePatchUrl(accountId, projectName) {
  return `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/pages/projects/${encodeURIComponent(projectName)}`;
}

/**
 * 直接 PATCH（永不 GET）。回傳 { ok, status }；錯誤只帶狀態碼，永不帶 body/token。
 */
export async function applyPatch({ accountId, projectName, apiToken, patch, fetchImpl = globalThis.fetch, timeoutMs = 20000 }) {
  if (!apiToken) return { ok: false, status: 0, code: "NO_TOKEN" };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetchImpl(cloudflarePatchUrl(accountId, projectName), {
      method: "PATCH",
      headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(patch),
      signal: controller.signal,
    });
  } catch (e) {
    const code = e && e.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR";
    return { ok: false, status: 0, code };
  } finally {
    clearTimeout(timer);
  }
  if (!res || !res.ok) return { ok: false, status: res ? res.status : 0, code: "HTTP_STATUS" };
  return { ok: true, status: res.status };
}

// ────────────────────────── CLI ──────────────────────────
const HELP = `用法：
  node scripts/mail-safe-config.mjs --secret-file <path> --target production|preview [--apply]

  --secret-file <path>   外部 JSON，內容為 { NAME: value } 秘密對應表
  --target <env>         必須明確指定 production 或 preview
  --apply                實際送出 PATCH（預設為 dry-run，只列名稱）
  --help                 顯示本說明

環境（只喺 --apply 時需要）：
  CLOUDFLARE_API_TOKEN   Account > Cloudflare Pages > Edit（最小權限）
  CLOUDFLARE_ACCOUNT_ID
  CLOUDFLARE_PROJECT_NAME`;

function parseArgs(argv) {
  const out = { help: false, apply: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--apply") out.apply = true;
    else if (a === "--secret-file" || a.startsWith("--secret-file=")) out.secretFile = a.includes("=") ? a.slice("--secret-file=".length) : argv[++i];
    else if (a === "--target" || a.startsWith("--target=")) out.target = a.includes("=") ? a.slice("--target=".length) : argv[++i];
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
  if (!args.secretFile) {
    error("缺少 --secret-file <path>");
    return 2;
  }
  if (!args.target || !VALID_TARGETS.has(args.target)) {
    error("需要明確 --target production|preview");
    return 2;
  }

  let raw;
  try {
    raw = readFile(args.secretFile, "utf8");
  } catch {
    error(`無法讀取秘密檔案：${args.secretFile}`);
    return 2;
  }
  let map;
  try {
    map = JSON.parse(raw);
  } catch {
    error("秘密檔案 JSON 無法解析");
    return 2;
  }

  const plan = buildPlan({ target: args.target, secretMap: map });
  if (!plan.ok) {
    error("配置驗證失敗（只列名稱，值已省略）：" + plan.errors.map((e) => `${e.name}:${e.code}`).join(", "));
    return 2;
  }

  const mode = args.apply ? "apply" : "dry-run";
  const summary = safeSummary(plan, { mode });

  if (!args.apply) {
    log(JSON.stringify(summary));
    log("dry-run：未作任何更改、未呼叫任何 API。確認無誤後加 --apply 才實際套用。");
    return 0;
  }

  const apiToken = env.CLOUDFLARE_API_TOKEN;
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const projectName = env.CLOUDFLARE_PROJECT_NAME;
  if (!apiToken || !accountId || !projectName) {
    error("--apply 需要 CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_PROJECT_NAME");
    return 2;
  }

  const res = await applyPatch({ accountId, projectName, apiToken, patch: plan.patch, fetchImpl });
  if (!res.ok) {
    error(`套用失敗（HTTP ${res.status}${res.code ? "/" + res.code : ""}）`);
    return 1;
  }
  log(JSON.stringify({ ...summary, mode: "apply", status: res.status }));
  return 0;
}

// 直接執行時才啟動 CLI（被 import 測試時不執行）。
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2))
    .then((code) => process.exit(code))
    .catch(() => {
      console.error("mail-safe-config：未預期錯誤");
      process.exit(1);
    });
}

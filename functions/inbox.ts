/**
 * Cloudflare Pages Function — 新查詢收件匣（/inbox）
 *
 * 背景：表單已由 Cloudflare Worker 接收，lead 寫入 KV（保留 30 日）＋ 即時 email。
 * 但 SiteGround 後台 enquiries.php 讀 MySQL，所以新 lead 唔會出現在該清單。
 * 這個頁面直接讀 KV，補回「集中查看」的能力，同時唔需要改動 SiteGround 任何檔案。
 *
 * 安全：
 *   - HTTP Basic Auth，密碼來自 Pages secret `INBOX_PASSWORD`（未設定則整個頁面 503，不會裸露資料）
 *   - 用戶名隨意，只驗密碼
 *   - 回應加 noindex + no-store，避免被搜尋引擎或被 CDN 快取
 *
 * 用法：https://adwire.com.hk/inbox
 */

import {
  checkBearer,
  hasText,
  runHealth,
  runProbe,
  runRetryBatch,
} from "../lib/mail-runtime.ts";

interface KVNamespace {
  list(opts?: {
    prefix?: string;
    limit?: number;
    cursor?: string;
  }): Promise<{ keys: Array<{ name: string }>; list_complete?: boolean; cursor?: string }>;
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
}

interface Env {
  ENQUIRIES?: KVNamespace;
  INBOX_PASSWORD?: string;
  /** Ops API（/inbox?mailops=…）Bearer token；未設定即 fail-closed。 */
  MAIL_OPS_TOKEN?: string;
  RESEND_API_KEY?: string;
  MAIL_TO?: string;
  MAIL_FROM?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

/** 只接受 RFC 4122 格式 UUID，避免以 requestId 參數探測任意 KV key。 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function safeParse(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * 診斷 JSON 端點（只喺 Basic Auth 之後呼叫）。
 * 只讀 `maildiag:` 紀錄（寄信時已遮罩 PII／秘密），回應 no-store + noindex。
 * KV list 為 eventually consistent，以 prefix 列出時可能短暫滯後；
 * 以 requestId 直接 get 則即時準確，故 requestId 查詢為準。
 * 每個 UUID key 每秒最多 1 寫，admin 列表上限 200 已足夠事件規模。
 */
async function diagnosticsResponse(requestIdParam: string | null, kv: KVNamespace): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0",
    "X-Robots-Tag": "noindex, nofollow",
    "X-Frame-Options": "DENY",
  };

  if (requestIdParam) {
    if (!UUID_RE.test(requestIdParam)) {
      return new Response(JSON.stringify({ success: false, error: "invalid_request_id" }), { status: 400, headers });
    }
    const raw = await kv.get(`maildiag:${requestIdParam}`);
    const one = raw ? safeParse(raw) : null;
    const diagnostics = one ? [one] : [];
    return new Response(JSON.stringify({ success: true, count: diagnostics.length, diagnostics }), { headers });
  }

  const listing = await kv.list({ prefix: "maildiag:", limit: 200 });
  const keys = listing.keys.map((k) => k.name);
  const diagnostics: Array<Record<string, unknown>> = [];
  for (const key of keys.slice(0, 200)) {
    const raw = await kv.get(key);
    const d = raw ? safeParse(raw) : null;
    if (d) diagnostics.push(d);
  }
  diagnostics.sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")));
  return new Response(JSON.stringify({ success: true, count: diagnostics.length, diagnostics }), { headers });
}

interface Lead {
  receivedAt: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  company?: string;
  companySite?: string;
  budget?: string;
  timeline?: string;
  systemInfo?: string;
  message?: string;
  ip?: string;
  country?: string;
  ua?: string;
}

function unauthorized(): Response {
  return new Response("需要登入", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="ADWire Inbox", charset="UTF-8"',
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function hkTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("zh-HK", {
      timeZone: "Asia/Hong_Kong",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ── Ops API（/inbox?mailops=…）────────────────────────────────────────────────
// 只認 `Authorization: Bearer <MAIL_OPS_TOKEN>`（固定時間比較）。未設定 token
// 即 503 fail-closed。方法逐一強制，無 CORS（唔加 Access-Control-*）。回應一律
// no-store + noindex，只回布林／計數／安全碼，絕不回傳秘密或 hash。
const opsJson = (body: Record<string, unknown>, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Frame-Options": "DENY",
    },
  });

async function handleMailOps(request: Request, env: Env, url: URL): Promise<Response> {
  const token = env.MAIL_OPS_TOKEN;
  if (!hasText(token)) return opsJson({ ok: false, error: "ops_disabled" }, 503);
  if (!checkBearer(request.headers.get("authorization"), token.trim())) {
    return opsJson({ ok: false, error: "unauthorized" }, 401);
  }

  const op = url.searchParams.get("mailops");

  if (op === "health") {
    if (request.method !== "GET") return opsJson({ ok: false, error: "method_not_allowed" }, 405);
    const health = await runHealth(env);
    return opsJson(health as unknown as Record<string, unknown>, health.ok ? 200 : 503);
  }

  if (op === "retry") {
    if (request.method !== "POST") return opsJson({ ok: false, error: "method_not_allowed" }, 405);
    if (!hasText(env.RESEND_API_KEY) || !env.ENQUIRIES) {
      return opsJson({ ok: false, error: "not_ready" }, 503);
    }
    // 刻意唔讀 request body：只重播已排隊嘅 frozen payload，
    // 唔接受任何由請求指定嘅收件人／內容（原始表單已通過 CAPTCHA／驗證）。
    const out = await runRetryBatch(env.ENQUIRIES, { apiKey: env.RESEND_API_KEY });
    return opsJson({ ok: true, ...out }, 200);
  }

  if (op === "probe") {
    if (request.method !== "POST") return opsJson({ ok: false, error: "method_not_allowed" }, 405);
    // 受控測試信：只有固定收件人／固定標題，唔入 queue、唔寫 enquiry。
    const probe = await runProbe({ apiKey: env.RESEND_API_KEY, mailTo: env.MAIL_TO, mailFrom: env.MAIL_FROM });
    return opsJson(probe as unknown as Record<string, unknown>, probe.ok ? 200 : 502);
  }

  return opsJson({ ok: false, error: "unknown_operation" }, 400);
}

export const onRequest = async (context: PagesContext): Promise<Response> => {
  const { request, env } = context;
  const url = new URL(request.url);

  // ops API 分支：必須喺既有 Basic Auth 之前，但只認 Bearer MAIL_OPS_TOKEN。
  // 未設定 token 即 fail-closed；無 CORS；方法逐一強制；只重播已排隊 payload。
  if (url.searchParams.has("mailops")) {
    return handleMailOps(request, env, url);
  }

  const PASS = env.INBOX_PASSWORD;
  if (!PASS) {
    return new Response("INBOX_PASSWORD 未設定，頁面已停用。", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const auth = request.headers.get("authorization") || "";
  if (!auth.startsWith("Basic ")) return unauthorized();
  let decoded = "";
  try {
    decoded = atob(auth.slice(6));
  } catch {
    return unauthorized();
  }
  const supplied = decoded.slice(decoded.indexOf(":") + 1);
  // 固定長度比較，避免時序側通道
  if (supplied.length !== PASS.length) return unauthorized();
  let diff = 0;
  for (let i = 0; i < PASS.length; i++) diff |= supplied.charCodeAt(i) ^ PASS.charCodeAt(i);
  if (diff !== 0) return unauthorized();

  if (!env.ENQUIRIES) {
    return new Response("KV 未綁定", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  // 診斷 JSON：只喺 Basic Auth 之後提供，支援可選 requestId UUID 過濾。
  if (url.searchParams.get("diagnostics") === "1") {
    return diagnosticsResponse(url.searchParams.get("requestId"), env.ENQUIRIES);
  }

  const listing = await env.ENQUIRIES.list({ prefix: "enq:", limit: 200 });
  const keys = listing.keys.map((k) => k.name).sort().reverse(); // ISO 時間戳遞減

  const leads: Lead[] = [];
  for (const key of keys.slice(0, 100)) {
    const raw = await env.ENQUIRIES.get(key);
    if (!raw) continue;
    try {
      leads.push(JSON.parse(raw) as Lead);
    } catch {
      /* 忽略壞資料 */
    }
  }

  const rows = leads
    .map((l) => {
      const extras = [
        l.company && `公司：${l.company}`,
        l.companySite && `網站：${l.companySite}`,
        l.budget && `預算：${l.budget}`,
        l.timeline && `時間：${l.timeline}`,
        l.systemInfo && `現況：${l.systemInfo}`,
      ].filter(Boolean) as string[];

      return `<tr>
        <td class="time">${esc(hkTime(l.receivedAt))}</td>
        <td>
          <div class="name">${esc(l.name)}</div>
          <div class="contact">
            <a href="tel:${esc(l.phone)}">${esc(l.phone)}</a> ·
            <a href="mailto:${esc(l.email)}">${esc(l.email)}</a>
          </div>
          ${extras.length ? `<div class="extras">${extras.map(esc).join("<br>")}</div>` : ""}
        </td>
        <td><span class="svc">${esc(l.service)}</span></td>
        <td class="msg">${esc(l.message || "").replace(/\n/g, "<br>")}</td>
        <td class="meta">${esc(l.ip || "")}<br>${esc(l.country || "")}</td>
      </tr>`;
    })
    .join("");

  const html = `<!doctype html><html lang="zh-Hant"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>新查詢收件匣 | ADWire</title>
<style>
  :root{--ink:#0f172a;--muted:#64748b;--line:#e2e8f0;--brand:#0f4c81;--accent:#f5a623}
  *{box-sizing:border-box}
  body{margin:0;padding:24px;font-family:-apple-system,"Segoe UI","PingFang TC","Microsoft JhengHei",sans-serif;color:var(--ink);background:#f8fafc}
  h1{font-size:20px;margin:0 0 4px;color:var(--brand)}
  .sub{color:var(--muted);font-size:13px;margin-bottom:20px}
  .sub b{color:var(--brand)}
  table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,.08)}
  th{background:var(--brand);color:#fff;font-size:12px;text-align:left;padding:10px 12px;font-weight:600}
  td{padding:12px;border-top:1px solid var(--line);font-size:13px;vertical-align:top}
  tr:hover td{background:#fbfdff}
  .time{white-space:nowrap;color:var(--muted);font-variant-numeric:tabular-nums}
  .name{font-weight:700}
  .contact a{color:var(--brand);text-decoration:none}
  .extras{color:var(--muted);font-size:12px;margin-top:4px;line-height:1.5}
  .svc{display:inline-block;background:#fef3c7;color:#92400e;border-radius:999px;padding:2px 8px;font-size:12px;white-space:nowrap}
  .msg{max-width:420px;line-height:1.6}
  .meta{color:#94a3b8;font-size:11px;white-space:nowrap}
  .empty{padding:40px;text-align:center;color:var(--muted)}
</style></head><body>
<h1>新查詢收件匣</h1>
<div class="sub">資料來源：Cloudflare KV（保留 30 日）· 共 <b>${leads.length}</b> 筆 · 最新 ${leads[0] ? esc(hkTime(leads[0].receivedAt)) : "—"}</div>
${
  leads.length
    ? `<table><thead><tr><th>時間</th><th>聯絡人</th><th>服務</th><th>訊息</th><th>來源</th></tr></thead><tbody>${rows}</tbody></table>`
    : `<div class="empty">暫時沒有新查詢。</div>`
}
</body></html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Frame-Options": "DENY",
    },
  });
};


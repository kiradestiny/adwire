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

interface KVNamespace {
  list(opts?: { prefix?: string; limit?: number }): Promise<{ keys: Array<{ name: string }> }>;
  get(key: string): Promise<string | null>;
}

interface Env {
  ENQUIRIES?: KVNamespace;
  INBOX_PASSWORD?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
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

export const onRequest = async (context: PagesContext): Promise<Response> => {
  const { request, env } = context;

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


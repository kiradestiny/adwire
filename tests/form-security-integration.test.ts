/**
 * tests/form-security-integration.test.ts — 信封 / 人機驗證 / 可信 metadata 整合測試
 *
 * 執行方式（Node 原生 type stripping，repo 未安裝測試框架）：
 *   node --experimental-strip-types tests/form-security-integration.test.ts
 *
 * 目的：以「真正 repo 程式碼」（functions/send-mail.php.ts handler 及
 * lib/form-security.ts、lib/mail-email.ts、lib/mail-runtime.ts 真helper）走完整條
 * 提交管線；只偽造「外部網絡」（Turnstile siteverify、Resend /emails）同 in-memory KV。
 * 絕不 import 任何替身模組、絕不建立 scratch copy。
 *
 * 契約（與 handler 對齊）：
 *   · 信封驗證（來源 origin／formStartedAt）最先行；失敗唔會打網絡。
 *   · 缺 ENQUIRIES → 503 storage_unavailable（fail-closed，唔寄、零網絡）。
 *   · 人機驗證 fail-closed：缺 secret／非 2xx／逾時／壞 JSON → 503；token 無效／
 *     缺 token／hostname 不符 → 400；兩者皆「永不」到 Resend／enq:／mailoutbox。
 *   · expectedHostname 由「已驗證嘅實際 Origin URL」導出（www 與非 www 各自為準）。
 *   · 可信網絡 metadata 只讀 request.cf / CF-IPCountry，body 冒充值一律忽略。
 *   · 風險 review 只加「[待確認]」一次；銷售 A/B/C 級本身唔會觸發 review。
 */

import assert from "node:assert/strict";
const runtimeSpecifier = "../lib/mail-runtime.ts";
const {
  deriveIdempotencyKey,
  outboxKey,
  outboxStateKey,
  runRetryBatch,
} = await import(runtimeSpecifier) as typeof import("../lib/mail-runtime");

type PagesFunctionModule = {
  onRequest: (context: { request: Request; env: Record<string, unknown> }) => Promise<Response>;
};

let counter = 0;
const loadSend = (): Promise<PagesFunctionModule> =>
  import(`../functions/send-mail.php.ts?case=fsi${counter++}`) as Promise<PagesFunctionModule>;

// ── 迷你測試框架 ──────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failures: string[] = [];

async function t(name: string, fn: () => Promise<void> | void): Promise<void> {
  try {
    await fn();
    passed++;
    console.log(`  \u2705 ${name}`);
  } catch (e) {
    failed++;
    const msg = e instanceof Error ? e.message : String(e);
    failures.push(`${name} → ${msg}`);
    console.log(`  \u274c ${name}\n     ${msg}`);
  }
}

// ── 測試替身（只偽造外部網絡 + KV）─────────────────────────────────────────────
interface MockKV {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
  list(opts?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ keys: Array<{ name: string }> }>;
  _map: Map<string, string>;
}

function mockKV(): MockKV {
  const map = new Map<string, string>();
  return {
    _map: map,
    async get(key: string) {
      return map.has(key) ? (map.get(key) as string) : null;
    },
    async put(key: string, value: string) {
      map.set(key, value);
    },
    async delete(key: string) {
      map.delete(key);
    },
    async list({ prefix = "", limit = 1000 }: { prefix?: string; limit?: number; cursor?: string } = {}) {
      const keys = [...map.keys()].filter((k) => k.startsWith(prefix)).sort();
      return { keys: keys.slice(0, limit).map((name) => ({ name })) };
    },
  };
}

interface FetchCall {
  url: string;
  headers: Record<string, string>;
  body: string;
}
type FetchHandler = (url: string, init: unknown, callIndex: number) => Response | Promise<Response>;

function mockFetch(handler: FetchHandler) {
  const calls: FetchCall[] = [];
  const fn = async (url: unknown, init: unknown): Promise<Response> => {
    const u = String(url);
    const i = (init ?? {}) as { headers?: Record<string, string>; body?: unknown };
    calls.push({
      url: u,
      headers: (i.headers ?? {}) as Record<string, string>,
      body: typeof i.body === "string" ? i.body : String(i.body ?? ""),
    });
    return handler(u, init, calls.length - 1);
  };
  return { fn, calls };
}

const jsonResp = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const TS_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const RESEND_URL = "https://api.resend.com/emails";
const KEY = "re_fsi_key_ABC123";
const TS_SECRET = "ts_fsi_secret_DEF456";

const resendCalls = (calls: FetchCall[]): FetchCall[] => calls.filter((c) => c.url === RESEND_URL);
const tsCalls = (calls: FetchCall[]): FetchCall[] => calls.filter((c) => c.url.includes("siteverify"));
const tsOk = (hostname: string): Response =>
  jsonResp({ success: true, hostname, "error-codes": [] as string[] });
const enqKeys = (kv: MockKV): string[] => [...kv._map.keys()].filter((k) => k.startsWith("enq:"));
const outboxKeys = (kv: MockKV): string[] => [...kv._map.keys()].filter((k) => k.startsWith("mailoutbox"));

/** 防護失敗嘅共同斷言：唔可以到達 Resend、唔可以寫 enq:／mailoutbox。 */
function assertNoArtifacts(kv: MockKV, calls: FetchCall[], label: string): void {
  assert.equal(resendCalls(calls).length, 0, `${label}：唔應該呼叫 Resend`);
  assert.equal(enqKeys(kv).length, 0, `${label}：唔應該寫 enq: lead 副本`);
  assert.equal(outboxKeys(kv).length, 0, `${label}：唔應該寫 mailoutbox`);
}

function withFetch(fn: unknown): () => void {
  const real = globalThis.fetch;
  (globalThis as { fetch: unknown }).fetch = fn;
  return () => {
    (globalThis as { fetch: unknown }).fetch = real;
  };
}

interface ReqOpts {
  /** undefined → 用預設 official origin；null → 完全唔帶 Origin header。 */
  origin?: string | null;
  body?: Record<string, unknown>;
  cf?: Record<string, unknown>;
  headers?: Record<string, string>;
}

function mkRequest(opts: ReqOpts = {}): Request {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "cf-connecting-ip": "203.0.113.7",
    "cf-ipcountry": "HK",
    "user-agent": "form-security-integration-test",
    ...opts.headers,
  };
  if (opts.origin !== null) headers["origin"] = opts.origin ?? "https://adwire.com.hk";
  const req = new Request("https://adwire.com.hk/send-mail.php", {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: "陳大文",
      phone: "91234567",
      email: "test@example.com",
      service: "SEO",
      message: "我想了解 SEO 服務",
      formStartedAt: Date.now() - 10_000,
      turnstileToken: "good-token",
      ...opts.body,
    }),
  });
  // 模擬 Cloudflare 邊緣注入嘅「可信」request.cf（客戶端無法偽造）。
  if (opts.cf) (req as unknown as { cf?: unknown }).cf = opts.cf;
  return req;
}

function baseEnv(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    RESEND_API_KEY: KEY,
    MAIL_TO: "info@adwire.com.hk",
    MAIL_FROM: "ADWire Website <website@adwire.com.hk>",
    TURNSTILE_SECRET: TS_SECRET,
    ENQUIRIES: mockKV(),
    ...over,
  };
}

async function main(): Promise<void> {
  console.log("form-security-integration — 信封／人機驗證／可信 metadata（供應商 mock）\n");

  // ══ 1. 信封驗證：來源／填表時間 ══════════════════════════════════════════
  console.log("1) 信封驗證：Origin／formStartedAt 不合格即 400/403，零網絡");

  await t("缺 Origin → 403 ORIGIN_MISSING，零網絡、零 KV 產物", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn, calls } = mockFetch(() => jsonResp({ id: "x" }));
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest({ origin: null }), env: baseEnv({ ENQUIRIES: kv }) });
      assert.equal(r.status, 403);
      const j = (await r.json()) as { success: boolean; code?: string };
      assert.equal(j.success, false);
      assert.equal(j.code, "ORIGIN_MISSING");
      assert.equal(calls.length, 0, "信封不合格唔應該有任何網絡呼叫");
      assertNoArtifacts(kv, calls, "ORIGIN_MISSING");
    } finally {
      restore();
    }
  });

  await t("非法 Origin → 403 ORIGIN_INVALID", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn, calls } = mockFetch(() => jsonResp({ id: "x" }));
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest({ origin: "https://evil.example" }), env: baseEnv({ ENQUIRIES: kv }) });
      assert.equal(r.status, 403);
      assert.equal(((await r.json()) as { code?: string }).code, "ORIGIN_INVALID");
      assert.equal(calls.length, 0);
      assertNoArtifacts(kv, calls, "ORIGIN_INVALID");
    } finally {
      restore();
    }
  });

  await t("缺 formStartedAt → 400 FORM_STARTED_MISSING，零網絡", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn, calls } = mockFetch(() => jsonResp({ id: "x" }));
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({
        request: mkRequest({ body: { formStartedAt: "" } }),
        env: baseEnv({ ENQUIRIES: kv }),
      });
      assert.equal(r.status, 400);
      assert.equal(((await r.json()) as { code?: string }).code, "FORM_STARTED_MISSING");
      assert.equal(calls.length, 0);
      assertNoArtifacts(kv, calls, "FORM_STARTED_MISSING");
    } finally {
      restore();
    }
  });

  // ══ 2. formStartedAt 格式：ISO 字串與數值毫秒皆接受 ═════════════════════
  console.log("\n2) formStartedAt：ISO 字串（聯絡表單）與數值毫秒（問卷）皆接受");

  const okFetch = () => mockFetch((u) => (u.includes("siteverify") ? tsOk("adwire.com.hk") : jsonResp({ id: "email_ok" })));

  await t("ISO 時間字串 → 200 / Resend×1", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn, calls } = okFetch();
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({
        request: mkRequest({ body: { formStartedAt: new Date(Date.now() - 10_000).toISOString() } }),
        env: baseEnv({ ENQUIRIES: kv }),
      });
      assert.equal(r.status, 200);
      assert.equal(((await r.json()) as { success: boolean }).success, true);
      assert.equal(resendCalls(calls).length, 1);
    } finally {
      restore();
    }
  });

  await t("數值毫秒 → 200 / Resend×1", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn, calls } = okFetch();
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({
        request: mkRequest({ body: { formStartedAt: Date.now() - 10_000 } }),
        env: baseEnv({ ENQUIRIES: kv }),
      });
      assert.equal(r.status, 200);
      assert.equal(resendCalls(calls).length, 1);
    } finally {
      restore();
    }
  });

  // ══ 3. 人機驗證 fail-closed：永不 reach Resend/enq/outbox ════════════════
  console.log("\n3) 人機驗證失敗（缺 secret／缺 token／無效／hostname／非 2xx／逾時／壞 JSON）：零寄信");

  await t("缺 TURNSTILE_SECRET → 503 verification_unavailable；完全唔打網絡", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn, calls } = okFetch();
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({
        request: mkRequest(),
        env: { ENQUIRIES: kv, RESEND_API_KEY: KEY }, // 冇 TURNSTILE_SECRET
      });
      assert.equal(r.status, 503);
      assert.equal(((await r.json()) as { code?: string }).code, "verification_unavailable");
      assert.equal(calls.length, 0, "缺 secret 唔應該發任何網絡請求");
      assertNoArtifacts(kv, calls, "SECRET_MISSING");
    } finally {
      restore();
    }
  });

  await t("空 token → 400 verification_failed；唔打網絡", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn, calls } = okFetch();
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({
        request: mkRequest({ body: { turnstileToken: "" } }),
        env: baseEnv({ ENQUIRIES: kv }),
      });
      assert.equal(r.status, 400);
      assert.equal(((await r.json()) as { code?: string }).code, "verification_failed");
      assert.equal(calls.length, 0, "缺 token 應在發出網絡請求前就失敗");
      assertNoArtifacts(kv, calls, "TOKEN_MISSING");
    } finally {
      restore();
    }
  });

  await t("siteverify success:false → 400 verification_failed；零寄信", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn, calls } = mockFetch((u) =>
      u.includes("siteverify") ? jsonResp({ success: false, "error-codes": ["invalid-input-response"] }) : jsonResp({ id: "x" }),
    );
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest(), env: baseEnv({ ENQUIRIES: kv }) });
      assert.equal(r.status, 400);
      assert.equal(((await r.json()) as { code?: string }).code, "verification_failed");
      assertNoArtifacts(kv, calls, "NOT_SUCCESS");
    } finally {
      restore();
    }
  });

  await t("hostname 不符 → 400 verification_failed；零寄信", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn, calls } = mockFetch((u) => (u.includes("siteverify") ? tsOk("evil.example") : jsonResp({ id: "x" })));
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest(), env: baseEnv({ ENQUIRIES: kv }) });
      assert.equal(r.status, 400);
      assert.equal(((await r.json()) as { code?: string }).code, "verification_failed");
      assertNoArtifacts(kv, calls, "HOSTNAME_MISMATCH");
    } finally {
      restore();
    }
  });

  await t("siteverify 非 2xx → 503 verification_unavailable；零寄信", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn, calls } = mockFetch((u) => (u.includes("siteverify") ? jsonResp({ error: "boom" }, 500) : jsonResp({ id: "x" })));
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest(), env: baseEnv({ ENQUIRIES: kv }) });
      assert.equal(r.status, 503);
      assert.equal(((await r.json()) as { code?: string }).code, "verification_unavailable");
      assertNoArtifacts(kv, calls, "HTTP_ERROR");
    } finally {
      restore();
    }
  });

  await t("siteverify 逾時（AbortError）→ 503 verification_unavailable；零寄信", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn, calls } = mockFetch((u) => {
      if (u.includes("siteverify")) {
        const err = new Error("aborted") as Error & { name: string };
        err.name = "AbortError";
        throw err;
      }
      return jsonResp({ id: "x" });
    });
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest(), env: baseEnv({ ENQUIRIES: kv }) });
      assert.equal(r.status, 503);
      assert.equal(((await r.json()) as { code?: string }).code, "verification_unavailable");
      assertNoArtifacts(kv, calls, "TIMEOUT");
    } finally {
      restore();
    }
  });

  await t("siteverify 壞 JSON → 503 verification_unavailable；零寄信", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn, calls } = mockFetch((u) =>
      u.includes("siteverify") ? new Response("not-json{", { status: 200 }) : jsonResp({ id: "x" }),
    );
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest(), env: baseEnv({ ENQUIRIES: kv }) });
      assert.equal(r.status, 503);
      assert.equal(((await r.json()) as { code?: string }).code, "verification_unavailable");
      assertNoArtifacts(kv, calls, "BAD_JSON");
    } finally {
      restore();
    }
  });

  // ══ 4. 有效 token 放行；www origin 各自導出 hostname ═════════════════════
  console.log("\n4) 有效 token：放行；expectedHostname 由已驗證 Origin 導出");

  await t("有效 token（adwire.com.hk）→ 200 / Resend×1 / enq×1", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn, calls } = okFetch();
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest(), env: baseEnv({ ENQUIRIES: kv }) });
      assert.equal(r.status, 200);
      assert.equal(((await r.json()) as { success: boolean }).success, true);
      assert.equal(resendCalls(calls).length, 1);
      assert.equal(tsCalls(calls).length, 1, "應恰好打一次 siteverify");
      assert.equal(enqKeys(kv).length, 1);
    } finally {
      restore();
    }
  });

  await t("www origin + www hostname → 200（hostname 由 origin 導出）", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn, calls } = mockFetch((u) =>
      u.includes("siteverify") ? tsOk("www.adwire.com.hk") : jsonResp({ id: "email_www" }),
    );
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({
        request: mkRequest({ origin: "https://www.adwire.com.hk" }),
        env: baseEnv({ ENQUIRIES: kv }),
      });
      assert.equal(r.status, 200, "www origin 嘅 hostname 應對應 www 驗證結果");
      assert.equal(resendCalls(calls).length, 1);
    } finally {
      restore();
    }
  });

  await t("www origin 但 hostname=adwire.com.hk → 400（證明 hostname 源自 origin）", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn, calls } = mockFetch((u) => (u.includes("siteverify") ? tsOk("adwire.com.hk") : jsonResp({ id: "x" })));
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({
        request: mkRequest({ origin: "https://www.adwire.com.hk" }),
        env: baseEnv({ ENQUIRIES: kv }),
      });
      assert.equal(r.status, 400);
      assert.equal(((await r.json()) as { code?: string }).code, "verification_failed");
      assertNoArtifacts(kv, calls, "WWW_MISMATCH");
    } finally {
      restore();
    }
  });

  // ══ 5. 缺 ENQUIRIES → 503 storage_unavailable，零寄信 ════════════════════
  console.log("\n5) 缺 ENQUIRIES binding：fail-closed 503 storage_unavailable");

  await t("冇 ENQUIRIES → 503 storage_unavailable；完全唔打網絡、唔寄信", async () => {
    const mod = await loadSend();
    const { fn, calls } = okFetch();
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({
        request: mkRequest(),
        env: { RESEND_API_KEY: KEY, TURNSTILE_SECRET: TS_SECRET },
      });
      assert.equal(r.status, 503);
      assert.equal(((await r.json()) as { code?: string }).code, "storage_unavailable");
      assert.equal(calls.length, 0, "缺儲存 binding 唔應該有任何網絡呼叫（連 siteverify 都唔應該打）");
    } finally {
      restore();
    }
  });

  // ══ 6. 多行內容保留 ═══════════════════════════════════════════════════════
  console.log("\n6) 多行訊息：enq.message 保留換行、郵件逐行 <br> 呈現");

  await t("多行訊息（CRLF/LF 混合）→ enq.message 正規化多行；html 逐行保留", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn, calls } = okFetch();
    const restore = withFetch(fn);
    try {
      const raw = "第一行\r\n第二行\n第三行";
      const expected = "第一行\n第二行\n第三行"; // normalizeMultiline: CRLF/CR → LF
      const r = await mod.onRequest({
        request: mkRequest({ body: { message: raw } }),
        env: baseEnv({ ENQUIRIES: kv }),
      });
      assert.equal(r.status, 200);
      const enqKey = enqKeys(kv)[0];
      const enq = JSON.parse(kv._map.get(enqKey) as string) as { message?: string };
      assert.equal(enq.message, expected, "enq.message 必須保留換行（唔可以壓成單行）");

      const html = String((JSON.parse(resendCalls(calls)[0].body) as { html: string }).html);
      assert.ok(html.includes("第一行<br>第二行<br>第三行"), "每行應以 <br> 分隔保留");
      assert.ok(!html.includes("第一行 第二行"), "唔可以被扁平化成單段");
    } finally {
      restore();
    }
  });

  // ══ 7. 可信 request.cf metadata vs body 冒充 ═════════════════════════════
  console.log("\n7) 可信網絡 metadata 只讀 request.cf，忽略 body 冒充值");

  await t("request.cf ASN/機構/國家 呈現；body 冒充值被忽略", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn, calls } = okFetch();
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({
        request: mkRequest({
          cf: { asn: 12345, asOrganization: "TrustedOrg HK", country: "HK" },
          body: {
            cfOrganization: "SPOOF-ORG-XYZ",
            cfAsn: 99999,
            asOrganization: "SPOOF-ORG-XYZ",
            organization: "SPOOF-ORG-XYZ",
          },
        }),
        env: baseEnv({ ENQUIRIES: kv }),
      });
      assert.equal(r.status, 200);
      const enqKey = enqKeys(kv)[0];
      const enq = JSON.parse(kv._map.get(enqKey) as string) as {
        security?: { network?: { asn?: number; organization?: string; country?: string } };
      };
      assert.equal(enq.security?.network?.asn, 12345, "ASN 應來自 request.cf");
      assert.equal(enq.security?.network?.organization, "TrustedOrg HK", "機構應來自 request.cf");
      assert.equal(enq.security?.network?.country, "HK", "國家應來自 request.cf");

      const html = String((JSON.parse(resendCalls(calls)[0].body) as { html: string }).html);
      assert.ok(html.includes("TrustedOrg HK"), "郵件應呈現可信機構名");
      assert.ok(html.includes("12345"), "郵件應呈現可信 ASN");
      assert.ok(!html.includes("SPOOF-ORG-XYZ"), "body 冒充機構值必須被忽略");
    } finally {
      restore();
    }
  });

  // ══ 8. 風險 review：保留、通知、標籤恰一次 ═══════════════════════════════
  console.log("\n8) 可疑但有效 token：保留並通知，[待確認] 恰一次");

  await t("一次性電郵（review）→ 仍 200 寄出、enq×1、subject 只有一個 [待確認]", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn, calls } = okFetch();
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({
        request: mkRequest({ body: { email: "spammer@mailinator.com", message: "大量優惠" } }),
        env: baseEnv({ ENQUIRIES: kv }),
      });
      assert.equal(r.status, 200, "review 只作標記，唔可以攔截／刪除 lead");
      assert.equal(((await r.json()) as { success: boolean }).success, true);
      assert.equal(resendCalls(calls).length, 1, "review lead 仍需通知");
      assert.equal(enqKeys(kv).length, 1, "review lead 仍需備份");

      const payload = JSON.parse(resendCalls(calls)[0].body) as { subject: string; html: string };
      const tagCount = payload.subject.split("[待確認]").length - 1;
      assert.equal(tagCount, 1, `[待確認] 只可出現一次：${payload.subject}`);
      assert.ok(payload.subject.includes("[待確認]"), "review 應在 subject 標示");
      assert.ok(payload.html.includes("需要人工確認"), "郵件應顯示需要人工確認");
    } finally {
      restore();
    }
  });

  // ══ 9. 銷售 C 級本身唔會觸發 review ══════════════════════════════════════
  console.log("\n9) 銷售評級 C 本身唔等於安全 review");

  await t("assessment C 級 + 內容無風險 → 有 C 級、無 [待確認]", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn, calls } = okFetch();
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({
        request: mkRequest({
          body: {
            source: "assessment",
            leadGrade: "C",
            leadNotes: "10 分",
            company: "一般公司",
            email: "client@example.com",
            message: "【ADWire 需求評估摘要】\n想處理：網站\n主要情況：現有網站過時\n評估結果：C 級（非正式報價）",
          },
        }),
        env: baseEnv({ ENQUIRIES: kv }),
      });
      assert.equal(r.status, 200);
      const payload = JSON.parse(resendCalls(calls)[0].body) as { subject: string };
      assert.ok(payload.subject.includes("C 級"), `sales grade 應反映：${payload.subject}`);
      assert.ok(!payload.subject.includes("[待確認]"), "C 級本身唔可以觸發 [待確認]");
    } finally {
      restore();
    }
  });

  // ══ 10. 供應商失敗：凍結 payload + 重試 idempotency 一致 ══════════════════
  console.log("\n10) 供應商失敗 → 凍結 payload／idempotency；重試用一模一樣內容");

  await t("初次 500 → 502 queued；mailoutbox frozen payload + idempotency=derive(requestId)", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    let n = 0;
    const { fn, calls } = mockFetch((u) => {
      if (u.includes("siteverify")) return tsOk("adwire.com.hk");
      n++;
      return n === 1 ? new Response("boom", { status: 500 }) : jsonResp({ id: "email_retry_ok" });
    });
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest({ body: { message: "重試情境" } }), env: baseEnv({ ENQUIRIES: kv }) });
      assert.equal(r.status, 502);
      const j = (await r.json()) as { success: boolean; code?: string; requestId?: string; queued?: boolean };
      assert.equal(j.success, false);
      assert.equal(j.code, "provider_error");
      assert.equal(j.queued, true);

      const rid = j.requestId as string;
      const rec = JSON.parse(kv._map.get(outboxKey(rid)) as string) as { payload: string; idempotencyKey: string };
      assert.equal(rec.idempotencyKey, deriveIdempotencyKey(rid), "idempotency key 應由 requestId 導出");
      const firstBody = JSON.parse(rec.payload) as { to?: string[] };
      assert.deepEqual(firstBody.to, ["info@adwire.com.hk"]);

      // 模擬退避窗口已過，再經真 runRetryBatch 重播。
      const stKey = outboxStateKey(rid);
      const st = JSON.parse(kv._map.get(stKey) as string) as Record<string, unknown>;
      st.nextRetryAt = new Date(Date.now() - 1000).toISOString();
      kv._map.set(stKey, JSON.stringify(st));

      const out = await runRetryBatch(kv, { apiKey: KEY });
      assert.equal(out.accepted, 1, "重試應被接受");
      const second = resendCalls(calls)[1];
      assert.equal(second.body, rec.payload, "重試必須用完全一樣嘅凍結 payload");
      assert.equal(second.headers["Idempotency-Key"], deriveIdempotencyKey(rid), "重試必須用同一 idempotency key");
      const st2 = JSON.parse(kv._map.get(stKey) as string) as { status?: string };
      assert.equal(st2.status, "accepted");
    } finally {
      restore();
    }
  });

  // ── 總結 ──────────────────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(64));
  console.log(`通過 ${passed} 項，失敗 ${failed} 項。`);
  if (failed > 0) {
    console.log("失敗項目：\n - " + failures.join("\n - "));
    process.exit(1);
  }
  console.log("\u2705 全部通過。");
}

void main();

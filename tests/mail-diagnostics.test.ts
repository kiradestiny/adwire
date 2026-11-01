/**
 * tests/mail-diagnostics.test.ts — 安全持久化郵件診斷（send-mail.php.ts + inbox.ts）
 *
 * 執行方式（Node 原生 type stripping，repo 未安裝測試框架）：
 *   node --experimental-strip-types tests/mail-diagnostics.test.ts
 *
 * 目標：為每個通過防護的提交產生 crypto UUID requestId，並以 `maildiag:<uuid>`
 * （7 日 TTL）持久化「唔含 PII／秘密」嘅診斷紀錄；失敗 JSON 只帶安全碼同 requestId，
 * 唔可以洩漏供應商原始錯誤。診斷寫入係 best-effort，唔可以令已寄出嘅信變成失敗。
 *
 * /inbox 加 ?diagnostics=1（既有 Basic Auth 之後）可讀取診斷，支援 requestId UUID 過濾。
 *
 * KV 限制：同一 key 每秒最多寫入一次。故此整個請求只會喺「終端結果」寫一次
 * `maildiag:<uuid>`（中間階段只留喺記憶體），唔會先 put 再 update 同一 key（會 429）。
 * 另：KV list 為 eventually consistent，admin 端以 prefix 列出時可能短暫滯後；
 * requestId 直接 get 則即時準確，因此以 requestId 查詢為準。
 *
 * 本測試零真實網絡、零真實寄信、零部署（全部 mock fetch ＋ in-memory KV）。
 */

import assert from "node:assert/strict";

type PagesFunctionModule = {
  onRequest: (context: { request: Request; env: Record<string, unknown> }) => Promise<Response>;
};

let counter = 0;
const loadSend = (): Promise<PagesFunctionModule> =>
  import(`../functions/send-mail.php.ts?case=md${counter++}`) as Promise<PagesFunctionModule>;
const loadInbox = (): Promise<PagesFunctionModule> =>
  import(`../functions/inbox.ts?case=mdi${counter++}`) as Promise<PagesFunctionModule>;

// ── 迷你測試框架（與 tests/send-mail.test.ts 一致嘅手寫 runner）────────────────
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

// ── 測試替身 ──────────────────────────────────────────────────────────────────
interface MockKV {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
  list(opts?: { prefix?: string; limit?: number }): Promise<{ keys: Array<{ name: string }> }>;
  _map: Map<string, string>;
  _puts: Array<{ key: string; value: string }>;
}

function mockKV(opts: { failPut?: (key: string) => boolean } = {}): MockKV {
  const map = new Map<string, string>();
  const puts: Array<{ key: string; value: string }> = [];
  return {
    _map: map,
    _puts: puts,
    async get(key: string) {
      return map.has(key) ? (map.get(key) as string) : null;
    },
    async put(key: string, value: string) {
      puts.push({ key, value });
      if (opts.failPut?.(key)) throw new Error("KV put failed (simulated)");
      map.set(key, value);
    },
    async list({ prefix = "", limit = 1000 }: { prefix?: string; limit?: number } = {}) {
      const keys = [...map.keys()].filter((k) => k.startsWith(prefix)).sort();
      return { keys: keys.slice(0, limit).map((name) => ({ name })) };
    },
  };
}

interface FetchCall {
  url: string;
}
type FetchHandler = (url: string, init: unknown, callIndex: number) => Response | Promise<Response>;

function mockFetch(handler: FetchHandler) {
  const calls: FetchCall[] = [];
  const fn = async (url: unknown, init: unknown): Promise<Response> => {
    const u = String(url);
    calls.push({ url: u });
    // Turnstile siteverify 一律回固定成功（帶正確 hostname）；供應商 mock 只負責 Resend。
    if (u.includes(TURNSTILE_URL)) return jsonResp(TS_OK);
    return handler(u, init, calls.length - 1);
  };
  return { fn, calls };
}

const jsonResp = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const RESEND_URL = "https://api.resend.com/emails";
const TURNSTILE_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
/** Turnstile siteverify 成功回應（必須帶正確 hostname，否則 fail-closed 會拒絕）。 */
const TS_OK = { success: true, hostname: "adwire.com.hk", "error-codes": [] as string[] };
/** 只計「供應商」呼叫（Turnstile siteverify 唔算）。 */
const resendCalls = (calls: FetchCall[]): FetchCall[] => calls.filter((c) => c.url === RESEND_URL);
const KEY = "re_test_key_ABC123";
const TS_SECRET = "ts_test_secret_MD_002";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function mkRequest(body: Record<string, unknown> = {}): Request {
  return new Request("https://adwire.com.hk/send-mail.php", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "origin": "https://adwire.com.hk",
      "cf-connecting-ip": "203.0.113.9",
      "cf-ipcountry": "HK",
      "user-agent": "mail-diagnostics-test",
    },
    body: JSON.stringify({
      name: "陳大文",
      phone: "91234567",
      email: "test@example.com",
      service: "SEO",
      message: "我想了解 SEO 服務",
      formStartedAt: Date.now() - 10_000,
      turnstileToken: "turnstile-ok-token",
      ...body,
    }),
  });
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

function withFetch(fn: unknown): () => void {
  const real = globalThis.fetch;
  (globalThis as { fetch: unknown }).fetch = fn;
  return () => {
    (globalThis as { fetch: unknown }).fetch = real;
  };
}

/** 讀取某 requestId 嘅診斷紀錄（KV key：maildiag:<uuid>）。 */
function readDiag(kv: MockKV, requestId: string): Record<string, unknown> | null {
  const raw = kv._map.get(`maildiag:${requestId}`);
  return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
}

/** 某次請求對 `maildiag:` key 嘅寫入次數（KV 每 key 每秒最多寫 1 次）。 */
const diagPuts = (kv: MockKV): number => kv._puts.filter((p) => p.key.startsWith("maildiag:")).length;

/** 所有 maildiag: 寫入都必須指向「單一」UUID key。 */
function assertSingleDiagKey(kv: MockKV): string {
  const keys = kv._puts.filter((p) => p.key.startsWith("maildiag:")).map((p) => p.key);
  assert.equal(keys.length, 1, `每個請求只可寫一次 maildiag（實際 ${keys.length} 次）`);
  return keys[0];
}

async function main(): Promise<void> {
  console.log("mail-diagnostics — 安全持久化郵件診斷\n");

  // ── 1. 缺設定：requestId + missing_config，診斷落 KV ────────────────────────
  console.log("1) 缺 RESEND_API_KEY：回 503 missing_config，並持久化診斷");
  await t("缺 key → 503 missing_config + requestId；診斷 stage=config/outcome=failed；唔呼叫供應商", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn, calls } = mockFetch(() => jsonResp({ id: "should_not_happen" }));
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest({ message: "缺設定情境" }), env: { ENQUIRIES: kv, TURNSTILE_SECRET: TS_SECRET } });
      assert.equal(r.status, 503, "缺 key 應回 503");
      const j = (await r.json()) as { success: boolean; code?: string; requestId?: string };
      assert.equal(j.success, false);
      assert.equal(j.code, "missing_config");
      assert.ok(j.requestId && UUID_RE.test(j.requestId), `requestId 應為 UUID：${j.requestId}`);
      assert.equal(resendCalls(calls).length, 0, "缺 key 唔應該呼叫供應商");

      const diag = readDiag(kv, j.requestId as string);
      assert.ok(diag, "診斷紀錄應以 maildiag:<uuid> 寫入 KV");
      assert.equal(diagPuts(kv), 1, "每個請求只可寫一次 maildiag（KV 每 key 每秒 1 寫）");
      assertSingleDiagKey(kv);
      assert.equal(diag!.code, "missing_config");
      assert.equal(diag!.outcome, "failed");
      assert.equal(diag!.stage, "config");
      assert.equal(diag!.source, "contact");
      assert.equal(diag!.providerStatus, null);
      assert.ok(typeof diag!.createdAt === "string" && typeof diag!.updatedAt === "string", "應有時間戳");

      // enquiry 副本與診斷以 requestId 關聯
      const enqKey = [...kv._map.keys()].find((k) => k.startsWith("enq:"));
      assert.ok(enqKey, "應有 enq: lead 副本");
      const enq = JSON.parse(kv._map.get(enqKey as string) as string) as { requestId?: string };
      assert.equal(enq.requestId, j.requestId, "enq: 副本必須帶同一個 requestId");
    } finally {
      restore();
    }
  });

  // ── 2. 供應商 401（無效 key）────────────────────────────────────────────────
  console.log("\n2) 供應商 401 無效 key：回 502 provider_error，診斷見真實 HTTP");
  await t("401 → 502 provider_error + requestId；診斷 providerStatus=401、name=validation_error；公開 JSON 無供應商細節", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const leak = "API key is invalid";
    const { fn } = mockFetch(() =>
      jsonResp({ statusCode: 401, name: "validation_error", message: `${leak}: ${KEY}` }, 401),
    );
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest({ message: "401情境" }), env: baseEnv({ ENQUIRIES: kv }) });
      assert.equal(r.status, 502);
      const rawBody = await r.text();
      const j = JSON.parse(rawBody) as { success: boolean; code?: string; requestId?: string };
      assert.equal(j.success, false);
      assert.equal(j.code, "provider_error");
      assert.ok(j.requestId && UUID_RE.test(j.requestId), "失敗 JSON 應帶 requestId");

      // 公開 JSON 唔可以有供應商原始錯誤或 key
      assert.ok(!rawBody.includes(leak), "公開 JSON 不可含供應商錯誤原文");
      assert.ok(!rawBody.includes(KEY), "公開 JSON 不可含 API key");
      assert.ok(!rawBody.includes("validation_error"), "供應商錯誤名稱只可存於受保護診斷");

      const diag = readDiag(kv, j.requestId as string);
      assert.ok(diag, "診斷應存在");
      assert.equal(diagPuts(kv), 1, "每個請求只可寫一次 maildiag");
      assert.equal(diag!.code, "provider_error");
      assert.equal(diag!.stage, "provider");
      assert.equal(diag!.outcome, "failed");
      assert.equal(diag!.providerStatus, 401, "診斷需記錄真實供應商 HTTP");
      assert.equal(diag!.providerErrorName, "validation_error");
      const storedMsg = String(diag!.providerErrorMessage ?? "");
      assert.ok(storedMsg.length > 0, "診斷應保留供應商訊息");
      assert.ok(!storedMsg.includes(KEY), "診斷訊息必須遮罩 API key");
    } finally {
      restore();
    }
  });

  // ── 3. 供應商 403（網域未驗證）──────────────────────────────────────────────
  console.log("\n3) 供應商 403 網域問題：回 502 provider_error，診斷 providerStatus=403");
  await t("403 → 502 provider_error；診斷 providerStatus=403 且訊息為安全解析後內容", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn } = mockFetch(() =>
      jsonResp({ statusCode: 403, name: "validation_error", message: "Domain not verified" }, 403),
    );
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest({ message: "403情境" }), env: baseEnv({ ENQUIRIES: kv }) });
      assert.equal(r.status, 502);
      const j = (await r.json()) as { code?: string; requestId?: string };
      assert.equal(j.code, "provider_error");
      const diag = readDiag(kv, j.requestId as string);
      assert.equal(diag!.providerStatus, 403);
      assert.ok(String(diag!.providerErrorMessage).includes("Domain not verified"), "診斷應保留安全解析後訊息");
    } finally {
      restore();
    }
  });

  // ── 4. 網絡例外 ─────────────────────────────────────────────────────────────
  console.log("\n4) fetch throw：回 502 network_error，診斷記錄網絡錯誤");
  await t("fetch throw → 502 network_error + requestId；診斷 code=network_error、providerStatus=null", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn } = mockFetch(() => {
      throw new Error("network down");
    });
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest({ message: "網絡情境" }), env: baseEnv({ ENQUIRIES: kv }) });
      assert.equal(r.status, 502);
      const j = (await r.json()) as { code?: string; requestId?: string };
      assert.equal(j.code, "network_error");
      assert.ok(j.requestId && UUID_RE.test(j.requestId));
      const diag = readDiag(kv, j.requestId as string);
      assert.equal(diag!.code, "network_error");
      assert.equal(diag!.stage, "network");
      assert.equal(diag!.providerStatus, null);
    } finally {
      restore();
    }
  });

  // ── 4b. 網絡例外保留真正原因（已遮罩）─────────────────────────────────────
  console.log("\n4b) 網絡例外：保留真實失敗原因，同時遮罩 API key／電郵");
  await t("fetch throw 'Headers: Invalid value' → 診斷保留該原因，但遮罩 key/email", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const submittedEmail = "real@client.com";
    const { fn } = mockFetch(() => {
      throw new Error(`Headers: Invalid value (Authorization: Bearer ${KEY}, reply_to ${submittedEmail})`);
    });
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({
        request: mkRequest({ message: "網絡原因情境", email: submittedEmail }),
        env: baseEnv({ ENQUIRIES: kv }),
      });
      assert.equal(r.status, 502);
      const j = (await r.json()) as { code?: string; requestId?: string };
      assert.equal(j.code, "network_error");
      const diag = readDiag(kv, j.requestId as string);
      assert.equal(diag!.code, "network_error");
      const msg = String(diag!.providerErrorMessage ?? "");
      const name = String(diag!.providerErrorName ?? "");
      assert.ok(msg.includes("Headers: Invalid value"), `應保留真實失敗原因：${msg}`);
      assert.ok(!msg.includes(KEY), "診斷不可含 API key");
      assert.ok(!msg.includes(submittedEmail), "診斷不可含提交電郵");
      assert.ok(name.length > 0, "應記錄例外名稱");
    } finally {
      restore();
    }
  });

  // ── 5. 成功 2xx：accepted + 供應商 id ───────────────────────────────────────
  console.log("\n5) 供應商 2xx：accepted，診斷保存安全解析嘅供應商 id（絕不叫 Delivered）");
  await t("2xx → 200 success；診斷 outcome=accepted、providerEmailId 解析自 body.id、無 'Delivered'", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn, calls } = mockFetch(() => jsonResp({ id: "email_test_id" }));
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest({ message: "成功情境" }), env: baseEnv({ ENQUIRIES: kv }) });
      assert.equal(r.status, 200);
      const j = (await r.json()) as { success: boolean; requestId?: string };
      assert.equal(j.success, true);
      assert.ok(j.requestId && UUID_RE.test(j.requestId), "成功回應亦應帶 requestId");
      assert.equal(calls.filter((c) => c.url === RESEND_URL).length, 1);

      const raw = kv._map.get(`maildiag:${j.requestId}`);
      const diag = JSON.parse(raw as string) as Record<string, unknown>;
      assert.equal(diag.outcome, "accepted");
      assert.equal(diag.code, "ok");
      assert.equal(diag.stage, "sent");
      assert.equal(diag.providerStatus, 200);
      assert.equal(diag.providerEmailId, "email_test_id", "應保存安全解析嘅供應商 id");
      assert.ok(!raw!.includes("Delivered"), "診斷不可把 accepted 寫成 Delivered");
      assert.equal(diagPuts(kv), 1, "成功請求只可寫一次 maildiag");
    } finally {
      restore();
    }
  });

  // ── 6. 診斷 KV 故障唔可以破壞寄信 ──────────────────────────────────────────
  console.log("\n6) 診斷 KV 寫入失敗：唔可以令已接受嘅寄信變成失敗");
  await t("maildiag:/enq:/dup: put 全部 throw，但供應商已接受 → 仍回 200 success", async () => {
    const mod = await loadSend();
    const kv = mockKV({
      failPut: (k) => k.startsWith("maildiag:") || k.startsWith("enq:") || k.startsWith("dup:"),
    });
    const { fn, calls } = mockFetch(() => jsonResp({ id: "email_ok" }));
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest({ message: "KV故障情境" }), env: baseEnv({ ENQUIRIES: kv }) });
      assert.equal(r.status, 200, "診斷／KV 寫入失敗唔可以令已寄出變成失敗");
      assert.equal(((await r.json()) as { success: boolean }).success, true);
      assert.equal(resendCalls(calls).length, 1);
      assert.equal(diagPuts(kv), 1, "即使寫入 throw，亦只可嘗試寫一次 maildiag");
    } finally {
      restore();
    }
  });

  // ── 7. 遮罩與無 PII ─────────────────────────────────────────────────────────
  console.log("\n7) 診斷遮罩：供應商訊息含秘密／PII 必須紅字處理，且唔儲存 form PII");
  await t("診斷唔可含 email／Bearer／re_ token／name／phone／ip／ua", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const leakedEmail = "victim@example.com";
    const leakedBearer = "Bearer sk_live_ZZZSECRET999";
    const leakedRe = "re_LEAKED_TOKEN_XYZ1";
    const { fn } = mockFetch(() =>
      new Response(`error for ${leakedEmail} via ${leakedBearer} and ${leakedRe}; 陳大文 91234567 203.0.113.9 mail-diagnostics-test`, { status: 500 }),
    );
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest({ message: "遮罩情境" }), env: baseEnv({ ENQUIRIES: kv }) });
      assert.equal(r.status, 502);
      const j = (await r.json()) as { requestId?: string };
      const raw = kv._map.get(`maildiag:${j.requestId}`) as string;
      assert.ok(raw, "診斷應寫入");
      assert.ok(!raw.includes(leakedEmail), "診斷不可含 email（PII）");
      assert.ok(!raw.includes("sk_live_ZZZSECRET999"), "診斷不可含 Bearer token");
      assert.ok(!raw.includes("re_LEAKED_TOKEN_XYZ1"), "診斷不可含 re_ token");
      assert.ok(!raw.includes("陳大文"), "診斷不可含提交姓名");
      assert.ok(!raw.includes("91234567"), "診斷不可含提交電話");
      assert.ok(!raw.includes("203.0.113.9"), "診斷不可含 IP");
      assert.ok(!raw.includes("mail-diagnostics-test"), "診斷不可含 UA");
      assert.ok(raw.includes("[email]") || raw.includes("[redacted]"), "應以佔位符取代敏感資料");
      assert.equal(diagPuts(kv), 1, "每個請求只可寫一次 maildiag");
    } finally {
      restore();
    }
  });

  // ── 7b. 同一請求只寫一次（成功與失敗都各一次）───────────────────────────────
  console.log("\n7b) 每筆終端結果恰寫一次：兩個請求 → 兩個不同 UUID key，各寫一次");
  await t("先 provider_error 後 success → maildiag: 共 2 次、2 個不同 key、各 1 次", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    let n = 0;
    const { fn } = mockFetch(() => (++n === 1 ? new Response("boom", { status: 500 }) : jsonResp({ id: "email_2" })));
    const restore = withFetch(fn);
    try {
      const r1 = await mod.onRequest({ request: mkRequest({ message: "第一個請求" }), env: baseEnv({ ENQUIRIES: kv }) });
      const j1 = (await r1.json()) as { requestId?: string; code?: string };
      const r2 = await mod.onRequest({ request: mkRequest({ message: "第二個請求" }), env: baseEnv({ ENQUIRIES: kv }) });
      const j2 = (await r2.json()) as { requestId?: string; success?: boolean };
      assert.equal(j1.code, "provider_error");
      assert.equal(j2.success, true);
      assert.notEqual(j1.requestId, j2.requestId, "兩個請求應有唔同 requestId");

      const keys = kv._puts.filter((p) => p.key.startsWith("maildiag:")).map((p) => p.key);
      assert.equal(keys.length, 2, "兩個請求合共只可寫 2 次 maildiag");
      assert.equal(new Set(keys).size, 2, "兩個請求應寫入兩個不同 UUID key");
      assert.equal(keys.filter((k) => k === `maildiag:${j1.requestId}`).length, 1, "失敗請求恰寫一次");
      assert.equal(keys.filter((k) => k === `maildiag:${j2.requestId}`).length, 1, "成功請求恰寫一次");
    } finally {
      restore();
    }
  });

  // ── 8. /inbox 診斷端點 ─────────────────────────────────────────────────────
  console.log("\n8) /inbox?diagnostics=1：需 Basic Auth，唔可以繞過");
  const inboxReq = (query: string, auth?: string): Request =>
    new Request(`https://adwire.com.hk/inbox${query}`, {
      method: "GET",
      headers: auth ? { authorization: auth } : {},
    });
  const basic = (user: string, pass: string) => "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");

  await t("未認證 → 401，唔會回診斷資料", async () => {
    const inbox = await loadInbox();
    const kv = mockKV();
    const r = await inbox.onRequest({
      request: inboxReq("?diagnostics=1"),
      env: { ENQUIRIES: kv, INBOX_PASSWORD: "s3cret" },
    });
    assert.equal(r.status, 401);
    const body = await r.text();
    assert.ok(!body.includes("maildiag"), "未認證回應不可含診斷資料");
  });

  await t("已認證 diagnostics=1 → 200 JSON，no-store + noindex", async () => {
    const inbox = await loadInbox();
    const kv = mockKV();
    kv._map.set(
      "maildiag:11111111-1111-4111-8111-111111111111",
      JSON.stringify({ requestId: "11111111-1111-4111-8111-111111111111", code: "ok", outcome: "accepted", createdAt: "2026-01-01T00:00:00.000Z" }),
    );
    const r = await inbox.onRequest({
      request: inboxReq("?diagnostics=1", basic("any", "s3cret")),
      env: { ENQUIRIES: kv, INBOX_PASSWORD: "s3cret" },
    });
    assert.equal(r.status, 200);
    assert.ok((r.headers.get("content-type") || "").includes("application/json"), "診斷回應應為 JSON");
    assert.ok((r.headers.get("cache-control") || "").includes("no-store"), "診斷回應必須 no-store");
    assert.ok((r.headers.get("x-robots-tag") || "").includes("noindex"), "診斷回應必須 noindex");
    const j = (await r.json()) as { success?: boolean; count?: number; diagnostics?: unknown[] };
    assert.equal(j.success, true);
    assert.equal(j.count, 1);
    assert.equal((j.diagnostics as Array<Record<string, unknown>>)[0].code, "ok");
  });

  await t("requestId 非 UUID → 400 invalid_request_id（唔可以列任意 key）", async () => {
    const inbox = await loadInbox();
    const kv = mockKV();
    kv._map.set("maildiag:11111111-1111-4111-8111-111111111111", JSON.stringify({ code: "ok" }));
    const r = await inbox.onRequest({
      request: inboxReq("?diagnostics=1&requestId=not-a-uuid", basic("any", "s3cret")),
      env: { ENQUIRIES: kv, INBOX_PASSWORD: "s3cret" },
    });
    assert.equal(r.status, 400);
    const j = (await r.json()) as { success?: boolean; error?: string };
    assert.equal(j.success, false);
    assert.equal(j.error, "invalid_request_id");
  });

  await t("requestId 有效 UUID → 只回該筆紀錄", async () => {
    const inbox = await loadInbox();
    const kv = mockKV();
    kv._map.set("maildiag:11111111-1111-4111-8111-111111111111", JSON.stringify({ requestId: "11111111-1111-4111-8111-111111111111", code: "ok" }));
    kv._map.set("maildiag:22222222-2222-4222-8222-222222222222", JSON.stringify({ requestId: "22222222-2222-4222-8222-222222222222", code: "missing_config" }));
    const r = await inbox.onRequest({
      request: inboxReq("?diagnostics=1&requestId=22222222-2222-4222-8222-222222222222", basic("any", "s3cret")),
      env: { ENQUIRIES: kv, INBOX_PASSWORD: "s3cret" },
    });
    assert.equal(r.status, 200);
    const j = (await r.json()) as { count?: number; diagnostics?: Array<Record<string, unknown>> };
    assert.equal(j.count, 1, "應只回一筆");
    assert.equal(j.diagnostics![0].code, "missing_config");
  });

  // ── 9. 公開失敗 JSON 唔含供應商細節（回歸）─────────────────────────────────
  console.log("\n9) 公開失敗 JSON 保持通用訊息，唔含供應商原始細節");
  await t("provider_error 回應 body 只有通用訊息 + 安全碼", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn } = mockFetch(() => new Response("smtp upstream failure at resend-node-7", { status: 500 }));
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest({ message: "公開JSON情境" }), env: baseEnv({ ENQUIRIES: kv }) });
      assert.equal(r.status, 502);
      const body = await r.text();
      assert.ok(!body.includes("resend-node-7"), "公開 JSON 不可含供應商內部細節");
      assert.ok(body.includes("provider_error"), "應含安全碼");
      const j = JSON.parse(body) as { message?: string };
      assert.ok(
        (j.message || "").includes("WhatsApp") || (j.message || "").includes("info@adwire.com.hk"),
        "訊息應保持通用",
      );
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

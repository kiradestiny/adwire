/**
 * tests/send-mail.test.ts — functions/send-mail.php.ts 單元測試
 *
 * 執行方式（Node 原生 type stripping，repo 未安裝測試框架）：
 *   node --experimental-strip-types tests/send-mail.test.ts
 *
 * 針對 bug：「寄信失敗卻回報成功」嘅假成功 —— 原本 isDuplicate() 喺寄信之前
 * 就寫入去重標記，所以喺 (a) 缺 RESEND_API_KEY、(b) Resend 非 2xx、
 * (c) fetch throw 之後再重試，都會因為撞到去重標記而回 success，但實際上冇寄出。
 *
 * 本測試以 mock fetch ＋ in-memory KV 模擬，零真實網絡、零真實寄信、零部署。
 * 動態 import ＋ cache-busting query：Node ESM 需要顯式 .ts 副檔名，
 * 而每個 case 要一個乾淨模組狀態。
 */

import assert from "node:assert/strict";

type PagesFunctionModule = {
  onRequest: (context: { request: Request; env: Record<string, unknown> }) => Promise<Response>;
};

let counter = 0;
const load = (): Promise<PagesFunctionModule> =>
  import(`../functions/send-mail.php.ts?case=t${counter++}`) as Promise<PagesFunctionModule>;

// ── 迷你測試框架（同 tests/assessment.test.ts 一致嘅手寫 runner）─────────────
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
  _map: Map<string, string>;
}

/** 用 Map 模擬 KV。failPut 可指定邊啲 key 嘅寫入會 throw（模擬 KV 故障）。 */
function mockKV(opts: { failPut?: (key: string) => boolean } = {}): MockKV {
  const map = new Map<string, string>();
  return {
    _map: map,
    async get(key: string) {
      return map.has(key) ? (map.get(key) as string) : null;
    },
    async put(key: string, value: string) {
      if (opts.failPut?.(key)) throw new Error("KV put failed (simulated)");
      map.set(key, value);
    },
  };
}

interface FetchCall {
  url: string;
}
type FetchHandler = (url: string, init: unknown, callIndex: number) => Response | Promise<Response>;

/** 以 mock 取代 globalThis.fetch，並記錄每次呼叫。 */
function mockFetch(handler: FetchHandler) {
  const calls: FetchCall[] = [];
  const fn = async (url: unknown, init: unknown): Promise<Response> => {
    const u = String(url);
    calls.push({ url: u });
    return handler(u, init, calls.length - 1);
  };
  return { fn, calls };
}

const jsonResp = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const resendOk = (): Response => jsonResp({ id: "email_test_id" });
const resendError = (status: number, detail: string): Response =>
  new Response(detail, { status, headers: { "content-type": "text/plain" } });

const RESEND_URL = "https://api.resend.com/emails";
const TURNSTILE_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Turnstile siteverify 成功回應（必須帶正確 hostname，否則 fail-closed 會拒絕）。 */
const TS_OK = { success: true, hostname: "adwire.com.hk", "error-codes": [] as string[] };
/** 包裝供應商 mock：只有 Turnstile 端點回固定成功，其餘交由 provider mock 決定。 */
const withTurnstile = (provider: FetchHandler): FetchHandler =>
  (url, init, idx) => (url.includes(TURNSTILE_URL) ? jsonResp(TS_OK) : provider(url, init, idx));
/** 只計「供應商」呼叫（Turnstile 呼叫唔算）。 */
const resendCalls = (calls: FetchCall[]): FetchCall[] => calls.filter((c) => c.url === RESEND_URL);

const KEY = "re_test_key_ABC123";
const TS_SECRET = "ts_test_secret_DEF456";

function mkRequest(body: Record<string, unknown> = {}): Request {
  return new Request("https://adwire.com.hk/send-mail.php", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "origin": "https://adwire.com.hk",
      "cf-connecting-ip": "1.2.3.4",
      "cf-ipcountry": "HK",
      "user-agent": "send-mail-test",
    },
    body: JSON.stringify({
      name: "陳大文",
      phone: "91234567",
      email: "test@example.com",
      service: "SEO",
      message: "我想了解 SEO 服務",
      formStartedAt: Date.now() - 10_000,
      turnstileToken: "good-token",
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

/** 暫時取代 globalThis.fetch，回傳還原函式。 */
function withFetch(fn: unknown): () => void {
  const real = globalThis.fetch;
  (globalThis as { fetch: unknown }).fetch = fn;
  return () => {
    (globalThis as { fetch: unknown }).fetch = real;
  };
}

async function main(): Promise<void> {
  console.log("send-mail.php.ts — 失敗重試假成功回歸測試\n");

  // ── 1. retry after missing config ──────────────────────────────────────────
  console.log("1) 缺 RESEND_API_KEY：重試必須真正再寄（唔可以被去重標記攔截）");
  await t("缺 key → 503 missing_config，唔呼叫 Resend；補 key 後重試會真正呼叫 Resend", async () => {
    const mod = await load();
    const kv = mockKV();
    const { fn, calls } = mockFetch(withTurnstile(() => resendOk()));
    const restore = withFetch(fn);
    try {
      const r1 = await mod.onRequest({ request: mkRequest({ message: "缺 key 情境" }), env: { ENQUIRIES: kv, TURNSTILE_SECRET: TS_SECRET } });
      assert.equal(r1.status, 503, "缺 key 應回 503");
      const j1 = (await r1.json()) as { success: boolean; code?: string };
      assert.equal(j1.success, false);
      assert.equal(resendCalls(calls).length, 0, "缺 key 唔應該呼叫 Resend");

      const r2 = await mod.onRequest({
        request: mkRequest({ message: "缺 key 情境" }),
        env: baseEnv({ ENQUIRIES: kv }),
      });
      assert.equal(resendCalls(calls).length, 1, "重試必須真正呼叫 Resend（假成功 bug：此處會係 0）");
      assert.equal(r2.status, 200, "補 key 後重試應成功");
      assert.equal(((await r2.json()) as { success: boolean }).success, true);
      assert.equal(j1.code, "missing_config", "應帶安全診斷碼 missing_config");
    } finally {
      restore();
    }
  });

  // ── 2. retry after Resend non-2xx ──────────────────────────────────────────
  console.log("\n2) Resend 非 2xx：重試必須真正重試");
  await t("Resend 422 → 502 provider_error；之後 retry 會真正再呼叫 Resend 且成功", async () => {
    const mod = await load();
    let n = 0;
    const { fn, calls } = mockFetch(withTurnstile(() => (++n === 1 ? resendError(422, "domain not verified") : resendOk())));
    const restore = withFetch(fn);
    try {
      const env = baseEnv();
      const r1 = await mod.onRequest({ request: mkRequest({ message: "非2xx情境" }), env });
      assert.equal(r1.status, 502);
      const j1 = (await r1.json()) as { success: boolean; code?: string };
      assert.equal(j1.success, false);

      const r2 = await mod.onRequest({ request: mkRequest({ message: "非2xx情境" }), env });
      assert.equal(resendCalls(calls).length, 2, "重試必須真正再呼叫 Resend（假成功 bug：此處會係 1）");
      assert.equal(r2.status, 200, "重試應成功");
      assert.equal(((await r2.json()) as { success: boolean }).success, true);
      assert.equal(j1.code, "provider_error", "應帶安全診斷碼 provider_error");
    } finally {
      restore();
    }
  });

  // ── 3. retry after fetch throw ─────────────────────────────────────────────
  console.log("\n3) fetch throw（網絡失敗）：重試必須真正重試");
  await t("fetch throw → 502 network_error；之後 retry 會真正再呼叫 Resend 且成功", async () => {
    const mod = await load();
    let n = 0;
    const { fn, calls } = mockFetch(withTurnstile(() => {
      if (++n === 1) throw new Error("network down");
      return resendOk();
    }));
    const restore = withFetch(fn);
    try {
      const env = baseEnv();
      const r1 = await mod.onRequest({ request: mkRequest({ message: "網絡情境" }), env });
      assert.equal(r1.status, 502);
      const j1 = (await r1.json()) as { success: boolean; code?: string };
      assert.equal(j1.success, false);

      const r2 = await mod.onRequest({ request: mkRequest({ message: "網絡情境" }), env });
      assert.equal(resendCalls(calls).length, 2, "重試必須真正再呼叫 Resend（假成功 bug：此處會係 1）");
      assert.equal(r2.status, 200, "重試應成功");
      assert.equal(((await r2.json()) as { success: boolean }).success, true);
      assert.equal(j1.code, "network_error", "應帶安全診斷碼 network_error");
    } finally {
      restore();
    }
  });

  // ── 4. successful send → duplicate suppressed ──────────────────────────────
  console.log("\n4) 成功寄出後：相同內容重複提交被抑制");
  await t("首寄成功；第二次相同指紋回 success 但唔再呼叫 Resend", async () => {
    const mod = await load();
    const { fn, calls } = mockFetch(withTurnstile(() => resendOk()));
    const restore = withFetch(fn);
    try {
      const env = baseEnv();
      const r1 = await mod.onRequest({ request: mkRequest({ message: "重複抑制情境" }), env });
      assert.equal(r1.status, 200);
      assert.equal(resendCalls(calls).length, 1, "首寄應呼叫 Resend 一次");

      const r2 = await mod.onRequest({ request: mkRequest({ message: "重複抑制情境" }), env });
      assert.equal(r2.status, 200);
      assert.equal(((await r2.json()) as { success: boolean }).success, true);
      assert.equal(resendCalls(calls).length, 1, "重複提交唔應該再呼叫 Resend");
    } finally {
      restore();
    }
  });

  // ── 5. KV post-send error must not fail an accepted send ───────────────────
  console.log("\n5) 寄出後 KV 寫入失敗：唔可以將已接受嘅寄信變成失敗");
  await t("KV put（enq: 與 dup:）throw，但 Resend 已接受 → 仍回 success", async () => {
    const mod = await load();
    const kv = mockKV({ failPut: (k) => k.startsWith("enq:") || k.startsWith("dup:") });
    const { fn, calls } = mockFetch(withTurnstile(() => resendOk()));
    const restore = withFetch(fn);
    try {
      const env = baseEnv({ ENQUIRIES: kv });
      const r = await mod.onRequest({ request: mkRequest({ message: "KV故障情境" }), env });
      assert.equal(r.status, 200, "Resend 已接受，唔應該因 KV 寫入失敗而當失敗");
      assert.equal(((await r.json()) as { success: boolean }).success, true);
      assert.equal(resendCalls(calls).length, 1);
    } finally {
      restore();
    }
  });

  // ── 6. validation preserved ────────────────────────────────────────────────
  console.log("\n6) 驗證保持：唔合法輸入唔會觸發寄信");
  await t("非法 email → 400，唔呼叫 Resend", async () => {
    const mod = await load();
    const { fn, calls } = mockFetch(withTurnstile(() => resendOk()));
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest({ email: "not-an-email" }), env: baseEnv() });
      assert.equal(r.status, 400);
      assert.equal(((await r.json()) as { success: boolean }).success, false);
      assert.equal(calls.length, 0, "驗證失敗唔應該呼叫 Resend");
    } finally {
      restore();
    }
  });
  await t("缺姓名／電話 → 400，唔呼叫 Resend", async () => {
    const mod = await load();
    const { fn, calls } = mockFetch(withTurnstile(() => resendOk()));
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest({ name: "", phone: "12" }), env: baseEnv() });
      assert.equal(r.status, 400);
      assert.equal(calls.length, 0);
    } finally {
      restore();
    }
  });
  await t("Honeypot：填咗 website → 回 success 但唔寄信", async () => {
    const mod = await load();
    const { fn, calls } = mockFetch(withTurnstile(() => resendOk()));
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest({ website: "http://spam.example" }), env: baseEnv() });
      assert.equal(r.status, 200);
      assert.equal(((await r.json()) as { success: boolean }).success, true);
      assert.equal(calls.length, 0, "Honeypot 唔應該呼叫 Resend");
    } finally {
      restore();
    }
  });

  // ── 7. Turnstile preserved ─────────────────────────────────────────────────
  console.log("\n7) Turnstile 保持：有 secret 但缺 token／驗證失敗都唔寄信");
  await t("有 TURNSTILE_SECRET 但缺 token → 400，唔呼叫 Resend", async () => {
    const mod = await load();
    const { fn, calls } = mockFetch((u) => (u.includes(TURNSTILE_URL) ? jsonResp({ success: true }) : resendOk()));
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest({ turnstileToken: "" }), env: baseEnv({ TURNSTILE_SECRET: TS_SECRET }) });
      assert.equal(r.status, 400);
      assert.equal(calls.length, 0, "缺 token 唔應該有任何 fetch");
    } finally {
      restore();
    }
  });
  await t("Turnstile 驗證失敗 → 400，唔呼叫 Resend", async () => {
    const mod = await load();
    const { fn, calls } = mockFetch((u) =>
      u.includes(TURNSTILE_URL) ? jsonResp({ success: false }) : resendOk(),
    );
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({
        request: mkRequest({ turnstileToken: "bad-token" }),
        env: baseEnv({ TURNSTILE_SECRET: TS_SECRET }),
      });
      assert.equal(r.status, 400);
      assert.equal(calls.length, 1, "只應有 Turnstile 呼叫，唔應該呼叫 Resend");
      assert.ok(calls[0].url.includes(TURNSTILE_URL));
    } finally {
      restore();
    }
  });
  await t("Turnstile 通過 → 正常寄信", async () => {
    const mod = await load();
    const { fn, calls } = mockFetch((u) => (u.includes(TURNSTILE_URL) ? jsonResp(TS_OK) : resendOk()));
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({
        request: mkRequest({ turnstileToken: "good-token" }),
        env: baseEnv({ TURNSTILE_SECRET: TS_SECRET }),
      });
      assert.equal(r.status, 200);
      assert.equal(calls.filter((c) => c.url === RESEND_URL).length, 1);
    } finally {
      restore();
    }
  });

  // ── 8. secrets masked in logs ──────────────────────────────────────────────
  console.log("\n8) 日誌遮罩：唔可以洩漏 API key");
  const captureError = (): { restore: () => void; lines: string[] } => {
    const lines: string[] = [];
    const real = console.error;
    console.error = (...args: unknown[]) => {
      lines.push(args.map((a) => (typeof a === "string" ? a : String(a))).join(" "));
    };
    return { restore: () => (console.error = real), lines };
  };

  await t("Resend 錯誤 body 回顯 API key → 日誌必須遮罩", async () => {
    const mod = await load();
    const secret = "re_SUPER_SECRET_VALUE_XYZ789";
    const { fn } = mockFetch(withTurnstile(() => resendError(500, `internal error: Bearer ${secret} rejected`)));
    const restoreFetch = withFetch(fn);
    const cap = captureError();
    try {
      const r = await mod.onRequest({
        request: mkRequest({ message: "遮罩情境1" }),
        env: baseEnv({ RESEND_API_KEY: secret }),
      });
      assert.equal(r.status, 502);
      const logged = cap.lines.join("\n");
      assert.ok(logged.length > 0, "應該有錯誤日誌");
      assert.ok(!logged.includes(secret), "日誌唔可以包含 API key 明文");
      assert.ok(logged.includes("[redacted]"), "敏感 header 必須以遮罩佔位符取代");
    } finally {
      cap.restore();
      restoreFetch();
    }
  });

  await t("fetch throw 錯誤訊息含 API key → 日誌必須遮罩", async () => {
    const mod = await load();
    const secret = "re_ANOTHER_SECRET_VALUE_ABC999";
    const { fn } = mockFetch(withTurnstile(() => {
      throw new Error(`request to Resend failed (Authorization: Bearer ${secret})`);
    }));
    const restoreFetch = withFetch(fn);
    const cap = captureError();
    try {
      const r = await mod.onRequest({
        request: mkRequest({ message: "遮罩情境2" }),
        env: baseEnv({ RESEND_API_KEY: secret }),
      });
      assert.equal(r.status, 502);
      const logged = cap.lines.join("\n");
      assert.ok(!logged.includes(secret), "日誌唔可以包含 API key 明文");
    } finally {
      cap.restore();
      restoreFetch();
    }
  });

  // ── 9. enquiries 保留：每次提交都有 lead 副本 ──────────────────────────────
  console.log("\n9) enquiries 保留：成功寄出時仍寫入 lead 副本");
  await t("KV 正常時，成功寄出會寫入 enq: 紀錄", async () => {
    const mod = await load();
    const kv = mockKV();
    const { fn } = mockFetch(withTurnstile(() => resendOk()));
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest({ message: "副本情境" }), env: baseEnv({ ENQUIRIES: kv }) });
      assert.equal(r.status, 200);
      const enqKeys = [...kv._map.keys()].filter((k) => k.startsWith("enq:"));
      assert.equal(enqKeys.length, 1, "應該寫入一筆 enq: lead 副本");
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

/**
 * tests/mail-resilience.test.ts — 寄信韌性（outbox／自動重試／/inbox ops API）
 *
 * 執行方式（Node 原生 type stripping，repo 未安裝測試框架）：
 *   node --experimental-strip-types tests/mail-resilience.test.ts
 *
 * 覆蓋三層：
 *   1) functions/send-mail.php.ts：初次寄信失敗時，將「凍結嘅 EXACT 供應商 payload」
 *      寫入不可變 mailoutbox:UUID（30 日），另以 mailoutboxstate:UUID 追蹤狀態；
 *      初次寄信同每次重試都用同一個 Idempotency-Key ＋ 完全一樣嘅 payload；
 *      絕不假成功（success 永遠 false、queued 只在真正保存到 KV 時才 true）。
 *   2) lib/mail-runtime.ts：狀態機、23 小時 TTL、max 6 attempts、指數退避、
 *      批次上限 10、cursor 分頁、manual_review、健康檢查、受控 probe。
 *   3) functions/inbox.ts：mailops 分支（Bearer MAIL_OPS_TOKEN、constant-time、
 *      fail-closed、方法檢查、無 CORS）。
 *
 * 全部 mock fetch ＋ in-memory KV；零真實網絡、零真實寄信、零部署。
 */

import assert from "node:assert/strict";
import {
  MAIL_PROTECTION_VERSION,
  MAX_ATTEMPTS,
  RETRY_BATCH_LIMIT,
  RETRY_CURSOR_KEY,
  RETRY_SCAN_LIMIT,
  PROBE_RECIPIENT,
  PROBE_SUBJECT,
  deriveIdempotencyKey,
  outboxKey,
  outboxStateKey,
  runRetryBatch,
} from "../lib/mail-runtime.ts";

type PagesFunctionModule = {
  onRequest: (context: { request: Request; env: Record<string, unknown> }) => Promise<Response>;
};

let counter = 0;
const loadSend = (): Promise<PagesFunctionModule> =>
  import(`../functions/send-mail.php.ts?mr=${counter++}`) as Promise<PagesFunctionModule>;
const loadInbox = (): Promise<PagesFunctionModule> =>
  import(`../functions/inbox.ts?mri=${counter++}`) as Promise<PagesFunctionModule>;

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

// ── 測試替身 ──────────────────────────────────────────────────────────────────
interface MockListResult {
  keys: Array<{ name: string }>;
  list_complete?: boolean;
  cursor?: string;
}

interface MockKV {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
  list(opts?: { prefix?: string; limit?: number; cursor?: string }): Promise<MockListResult>;
  _map: Map<string, string>;
  _puts: Array<{ key: string; value: string; ttl?: number }>;
  _deletes: string[];
}

/** in-memory KV，支援 cursor 分頁、put/get 失敗注入、delete 記錄（應永遠為空）。 */
function mockKV(
  opts: { failPut?: (key: string) => boolean; failList?: boolean; failGet?: (key: string) => boolean } = {},
): MockKV {
  const map = new Map<string, string>();
  const puts: MockKV["_puts"] = [];
  const deletes: string[] = [];
  return {
    _map: map,
    _puts: puts,
    _deletes: deletes,
    async get(key: string) {
      if (opts.failGet?.(key)) throw new Error("KV get failed (simulated)");
      return map.has(key) ? (map.get(key) as string) : null;
    },
    async put(key: string, value: string, o?: { expirationTtl?: number }) {
      puts.push({ key, value, ttl: o?.expirationTtl });
      if (opts.failPut?.(key)) throw new Error("KV put failed (simulated)");
      map.set(key, value);
    },
    async delete(key: string) {
      deletes.push(key);
      map.delete(key);
    },
    async list({ prefix = "", limit = 1000, cursor }: { prefix?: string; limit?: number; cursor?: string } = {}) {
      if (opts.failList) throw new Error("KV list failed (simulated)");
      const all = [...map.keys()].filter((k) => k.startsWith(prefix)).sort();
      const start = cursor ? Number(cursor) : 0;
      const slice = all.slice(start, start + limit);
      const next = start + limit < all.length ? String(start + limit) : undefined;
      return { keys: slice.map((name) => ({ name })), list_complete: next === undefined, cursor: next };
    },
  };
}

interface CapturedCall {
  url: string;
  headers: Record<string, string>;
  body: string;
}
type FetchHandler = (url: string, init: unknown, callIndex: number) => Response | Promise<Response>;

function mockFetch(handler: FetchHandler) {
  const calls: CapturedCall[] = [];
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

const RESEND_URL = "https://api.resend.com/emails";
const KEY = "re_resilience_key_ABC123";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function withFetch(fn: unknown): () => void {
  const real = globalThis.fetch;
  (globalThis as { fetch: unknown }).fetch = fn;
  return () => {
    (globalThis as { fetch: unknown }).fetch = real;
  };
}

function mkRequest(body: Record<string, unknown> = {}, headers: Record<string, string> = {}): Request {
  return new Request("https://adwire.com.hk/send-mail.php", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "cf-connecting-ip": "203.0.113.9",
      "cf-ipcountry": "HK",
      "user-agent": "mail-resilience-test",
      ...headers,
    },
    body: JSON.stringify({
      name: "陳大文",
      phone: "91234567",
      email: "test@example.com",
      service: "SEO",
      message: "我想了解 SEO 服務",
      formStartedAt: Date.now() - 10_000,
      ...body,
    }),
  });
}

function baseEnv(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    RESEND_API_KEY: KEY,
    MAIL_TO: "info@adwire.com.hk",
    MAIL_FROM: "ADWire Website <website@adwire.com.hk>",
    ENQUIRIES: mockKV(),
    ...over,
  };
}

// ── /inbox ops 請求 ───────────────────────────────────────────────────────────
const OPS_TOKEN = "ops_secret_token_XYZ";

function opsReq(query: string, opts: { token?: string; method?: string; body?: string } = {}): Request {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (opts.token !== undefined && opts.token !== "") headers.authorization = `Bearer ${opts.token}`;
  const init: RequestInit = { method: opts.method ?? "GET", headers };
  if (opts.body !== undefined) init.body = opts.body;
  return new Request(`https://adwire.com.hk/inbox${query}`, init);
}

function opsEnv(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    ENQUIRIES: mockKV(),
    INBOX_PASSWORD: "inboxpass",
    MAIL_OPS_TOKEN: OPS_TOKEN,
    RESEND_API_KEY: KEY,
    MAIL_TO: "info@adwire.com.hk",
    MAIL_FROM: "ADWire Website <website@adwire.com.hk>",
    ...over,
  };
}

// ── outbox seed 工具（直接砌狀態紀錄，繞過 send-mail）─────────────────────────
interface SeedOpts {
  requestId: string;
  status?: "pending" | "accepted" | "manual_review";
  attempts?: number;
  firstAttemptAgoMs?: number;
  nextRetryInMs?: number | null;
  code?: string;
  payload?: string;
  writeRecord?: boolean;
}

function seedOutbox(kv: MockKV, o: SeedOpts): void {
  const now = Date.now();
  const first = new Date(now - (o.firstAttemptAgoMs ?? 1000)).toISOString();
  const state = {
    requestId: o.requestId,
    createdAt: first,
    updatedAt: first,
    status: o.status ?? "pending",
    attempts: o.attempts ?? 1,
    firstAttemptAt: first,
    lastAttemptAt: first,
    nextRetryAt: o.nextRetryInMs == null ? null : new Date(now + o.nextRetryInMs).toISOString(),
    providerStatus: null,
    code: o.code ?? "provider_error",
  };
  if (o.writeRecord !== false) {
    kv._map.set(
      outboxKey(o.requestId),
      JSON.stringify({
        requestId: o.requestId,
        createdAt: first,
        idempotencyKey: deriveIdempotencyKey(o.requestId),
        providerUrl: RESEND_URL,
        payload:
          o.payload ??
          JSON.stringify({ from: "x", to: [PROBE_RECIPIENT], reply_to: "a@b.com", subject: "s", html: "<p>h</p>" }),
        source: "contact",
      }),
    );
  }
  kv._map.set(outboxStateKey(o.requestId), JSON.stringify(state));
}

const readState = (kv: MockKV, id: string): Record<string, unknown> =>
  JSON.parse(kv._map.get(outboxStateKey(id)) as string) as Record<string, unknown>;
const outboxPutCount = (kv: MockKV, id: string): number =>
  kv._puts.filter((p) => p.key === outboxKey(id)).length;

async function main(): Promise<void> {
  console.log("mail-resilience — 寄信韌性（outbox／重試／ops）\n");

  // ══ A. 初次寄信失敗 → 凍結 payload 落 outbox ══════════════════════════════
  console.log("A) 初次寄信失敗：保留凍結 payload、唔假成功");

  await t("供應商 500 → 502 provider_error、queued=true；mailoutbox 存 frozen payload、state=pending", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn, calls } = mockFetch(() => new Response("boom", { status: 500 }));
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest({ message: "A1" }), env: baseEnv({ ENQUIRIES: kv }) });
      assert.equal(r.status, 502);
      const j = (await r.json()) as { success: boolean; code?: string; requestId?: string; queued?: boolean };
      assert.equal(j.success, false, "失敗絕不可報成功");
      assert.equal(j.code, "provider_error");
      assert.ok(j.requestId && UUID_RE.test(j.requestId));
      assert.equal(j.queued, true, "已保存到 KV 時 queued 應為 true");

      const rec = kv._map.get(outboxKey(j.requestId as string));
      assert.ok(rec, "mailoutbox:UUID 應存在");
      const parsed = JSON.parse(rec as string) as { payload: string; idempotencyKey: string; providerUrl: string };
      assert.equal(parsed.providerUrl, RESEND_URL);
      assert.equal(
        parsed.idempotencyKey,
        deriveIdempotencyKey(j.requestId as string),
        "Idempotency-Key 應由 requestId 導出（非舊指紋）",
      );
      const payloadObj = JSON.parse(parsed.payload) as Record<string, unknown>;
      assert.equal(payloadObj.reply_to, "test@example.com");
      assert.ok(String(payloadObj.html).includes("陳大文"), "frozen payload 必須含完整內容");

      const st = readState(kv, j.requestId as string);
      assert.equal(st.status, "pending");
      assert.equal(st.attempts, 1);

      const enqKey = [...kv._map.keys()].find((k) => k.startsWith("enq:"));
      assert.ok(enqKey, "enq: lead 副本必須保留");
      const enq = JSON.parse(kv._map.get(enqKey as string) as string) as { requestId?: string };
      assert.equal(enq.requestId, j.requestId, "enq: 副本 requestId 不變");
      assert.equal(calls.filter((c) => c.url === RESEND_URL).length, 1);
    } finally {
      restore();
    }
  });

  await t("供應商回覆 body 回顯 key → 公開 JSON 唔含 key／供應商細節", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn } = mockFetch(() => new Response(`invalid key ${KEY}`, { status: 401 }));
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest({ message: "A2" }), env: baseEnv({ ENQUIRIES: kv }) });
      const body = await r.text();
      assert.ok(!body.includes(KEY), "公開 JSON 不可含 API key");
      assert.ok(body.includes("provider_error"));
      assert.equal(r.status, 502);
    } finally {
      restore();
    }
  });

  await t("fetch throw → 502 network_error、queued=true、state=pending", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn } = mockFetch(() => {
      throw new Error("network down");
    });
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest({ message: "A3" }), env: baseEnv({ ENQUIRIES: kv }) });
      assert.equal(r.status, 502);
      const j = (await r.json()) as { code?: string; requestId?: string; queued?: boolean };
      assert.equal(j.code, "network_error");
      assert.equal(j.queued, true);
      assert.ok(kv._map.get(outboxKey(j.requestId as string)), "網絡失敗亦要保存 frozen payload");
      assert.equal(readState(kv, j.requestId as string).status, "pending");
    } finally {
      restore();
    }
  });

  await t("缺 RESEND_API_KEY → 503 missing_config、queued=true、零供應商呼叫", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn, calls } = mockFetch(() => jsonResp({ id: "x" }));
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest({ message: "A4" }), env: { ENQUIRIES: kv } });
      assert.equal(r.status, 503);
      const j = (await r.json()) as { success: boolean; code?: string; requestId?: string; queued?: boolean };
      assert.equal(j.success, false);
      assert.equal(j.code, "missing_config");
      assert.equal(j.queued, true, "缺設定亦要保存 frozen payload 待重試");
      assert.equal(calls.length, 0, "缺 key 唔應該呼叫供應商");
      assert.ok(kv._map.get(outboxKey(j.requestId as string)));
    } finally {
      restore();
    }
  });

  await t("KV 寫入失敗 → queued=false（唔可以報 queued=true）但仍 success:false", async () => {
    const mod = await loadSend();
    const kv = mockKV({ failPut: (k) => k.startsWith("mailoutbox") });
    const { fn } = mockFetch(() => new Response("boom", { status: 500 }));
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest({ message: "A5" }), env: baseEnv({ ENQUIRIES: kv }) });
      assert.equal(r.status, 502);
      const j = (await r.json()) as { success: boolean; queued?: boolean };
      assert.equal(j.success, false);
      assert.equal(j.queued, false, "KV 保存失敗時 queued 必須為 false");
    } finally {
      restore();
    }
  });

  await t("冇綁定 ENQUIRIES → queued=false，唔可以假成功", async () => {
    const mod = await loadSend();
    const { fn } = mockFetch(() => new Response("boom", { status: 500 }));
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest({ message: "A6" }), env: { RESEND_API_KEY: KEY } });
      assert.equal(r.status, 502);
      const j = (await r.json()) as { success: boolean; queued?: boolean };
      assert.equal(j.success, false);
      assert.equal(j.queued, false);
    } finally {
      restore();
    }
  });

  await t("成功寄信 → 無 outbox、無 state、無 delete（唔會將成功排隊）", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn, calls } = mockFetch(() => jsonResp({ id: "email_ok" }));
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest({ message: "A7" }), env: baseEnv({ ENQUIRIES: kv }) });
      assert.equal(r.status, 200);
      assert.equal(calls.filter((c) => c.url === RESEND_URL).length, 1);
      assert.equal([...kv._map.keys()].filter((k) => k.startsWith("mailoutbox")).length, 0);
      assert.equal(kv._deletes.length, 0, "任何情況都唔可以 delete 紀錄");
    } finally {
      restore();
    }
  });

  // ══ B. 初次寄信帶 Idempotency-Key ════════════════════════════════════════
  console.log("\nB) 初次寄信：Idempotency-Key = f(requestId)，非舊指紋");

  await t("成功路徑亦有 Idempotency-Key，且與 body 內 requestId 對應", async () => {
    const mod = await loadSend();
    const kv = mockKV();
    const { fn, calls } = mockFetch(() => jsonResp({ id: "email_ok" }));
    const restore = withFetch(fn);
    try {
      const r = await mod.onRequest({ request: mkRequest({ message: "B1" }), env: baseEnv({ ENQUIRIES: kv }) });
      const j = (await r.json()) as { requestId?: string };
      assert.equal(r.status, 200);
      const call = calls.find((c) => c.url === RESEND_URL) as CapturedCall;
      assert.equal(call.headers["Idempotency-Key"], deriveIdempotencyKey(j.requestId as string));
    } finally {
      restore();
    }
  });

  // ══ C. ops 認證與方法 ════════════════════════════════════════════════════
  console.log("\nC) mailops：Bearer 認證、constant-time、fail-closed、方法檢查");

  await t("缺 MAIL_OPS_TOKEN → 503 ops_disabled（fail-closed，唔會裸露資料）", async () => {
    const inbox = await loadInbox();
    const r = await inbox.onRequest({
      request: opsReq("?mailops=health", { token: OPS_TOKEN }),
      env: opsEnv({ MAIL_OPS_TOKEN: undefined }),
    });
    assert.equal(r.status, 503);
    const body = await r.text();
    assert.ok(!body.includes(OPS_TOKEN));
    assert.equal((JSON.parse(body) as { error?: string }).error, "ops_disabled");
  });

  await t("空白 MAIL_OPS_TOKEN → 503 ops_disabled（trimmed nonempty 才有效）", async () => {
    const inbox = await loadInbox();
    const r = await inbox.onRequest({
      request: opsReq("?mailops=health", { token: OPS_TOKEN }),
      env: opsEnv({ MAIL_OPS_TOKEN: "   " }),
    });
    assert.equal(r.status, 503);
  });

  await t("缺／錯 Bearer → 401 unauthorized", async () => {
    const inbox = await loadInbox();
    const noAuth = await inbox.onRequest({ request: opsReq("?mailops=health"), env: opsEnv() });
    assert.equal(noAuth.status, 401);
    const wrong = await inbox.onRequest({
      request: opsReq("?mailops=health", { token: "wrong-token" }),
      env: opsEnv(),
    });
    assert.equal(wrong.status, 401);
  });

  await t("health 用錯 method（POST）→ 405", async () => {
    const inbox = await loadInbox();
    const r = await inbox.onRequest({
      request: opsReq("?mailops=health", { token: OPS_TOKEN, method: "POST" }),
      env: opsEnv(),
    });
    assert.equal(r.status, 405);
  });

  await t("retry 用錯 method（GET）→ 405，且唔會處理任何 outbox", async () => {
    const inbox = await loadInbox();
    const kv = mockKV();
    seedOutbox(kv, { requestId: "11111111-1111-4111-8111-111111111111" });
    const { fn, calls } = mockFetch(() => jsonResp({ id: "x" }));
    const restore = withFetch(fn);
    try {
      const r = await inbox.onRequest({
        request: opsReq("?mailops=retry", { token: OPS_TOKEN, method: "GET" }),
        env: opsEnv({ ENQUIRIES: kv }),
      });
      assert.equal(r.status, 405);
      assert.equal(calls.length, 0);
    } finally {
      restore();
    }
  });

  await t("未知 operation → 400", async () => {
    const inbox = await loadInbox();
    const r = await inbox.onRequest({
      request: opsReq("?mailops=send-any", { token: OPS_TOKEN }),
      env: opsEnv(),
    });
    assert.equal(r.status, 400);
  });

  await t("ops 回應無 CORS 標頭", async () => {
    const inbox = await loadInbox();
    const r = await inbox.onRequest({ request: opsReq("?mailops=health", { token: OPS_TOKEN }), env: opsEnv() });
    assert.equal(r.headers.get("access-control-allow-origin"), null, "ops API 唔可以有 CORS");
  });

  // ══ D. health ════════════════════════════════════════════════════════════
  console.log("\nD) health：checks 由 context.env 實際內容控制、KV read tested");

  await t("有效設定 → 200 ok=true，checks 全 true，無秘密／hash，no-store/noindex", async () => {
    const inbox = await loadInbox();
    const kv = mockKV();
    seedOutbox(kv, { requestId: "11111111-1111-4111-8111-111111111111" });
    seedOutbox(kv, { requestId: "22222222-2222-4222-8222-222222222222", status: "manual_review" });
    const r = await inbox.onRequest({
      request: opsReq("?mailops=health", { token: OPS_TOKEN }),
      env: opsEnv({ ENQUIRIES: kv, TURNSTILE_SECRET: "ts_secret" }),
    });
    assert.equal(r.status, 200);
    assert.ok((r.headers.get("cache-control") || "").includes("no-store"));
    assert.ok((r.headers.get("x-robots-tag") || "").includes("noindex"));
    const body = await r.text();
    assert.ok(!body.includes(KEY), "不可回傳 secret");
    assert.ok(!body.includes(OPS_TOKEN), "不可回傳 ops token");
    assert.ok(!body.includes("inboxpass"), "不可回傳 inbox password");
    const j = JSON.parse(body) as {
      ok: boolean;
      version: string;
      checks: Record<string, boolean>;
      outbox: { pending: number; manualReview: number };
    };
    assert.equal(j.ok, true);
    assert.equal(j.version, MAIL_PROTECTION_VERSION);
    assert.deepEqual(j.checks, {
      resendKey: true,
      turnstileSecret: true,
      inboxPassword: true,
      outboxStorage: true,
      opsToken: true,
    });
    assert.deepEqual(j.outbox, { pending: 1, manualReview: 1 });
  });

  await t("缺 RESEND_API_KEY → 503 ok=false，僅 resendKey=false", async () => {
    const inbox = await loadInbox();
    const r = await inbox.onRequest({
      request: opsReq("?mailops=health", { token: OPS_TOKEN }),
      env: opsEnv({ RESEND_API_KEY: undefined }),
    });
    assert.equal(r.status, 503);
    const j = (await r.json()) as { ok: boolean; checks: Record<string, boolean> };
    assert.equal(j.ok, false);
    assert.equal(j.checks.resendKey, false);
    assert.equal(j.checks.inboxPassword, true);
    assert.equal(j.checks.outboxStorage, true);
  });

  await t("RESEND_API_KEY 只有空格 → 視為無效（trimmed nonempty 才真）", async () => {
    const inbox = await loadInbox();
    const r = await inbox.onRequest({
      request: opsReq("?mailops=health", { token: OPS_TOKEN }),
      env: opsEnv({ RESEND_API_KEY: "   " }),
    });
    assert.equal(r.status, 503);
    const j = (await r.json()) as { checks: Record<string, boolean> };
    assert.equal(j.checks.resendKey, false);
  });

  await t("缺 TURNSTILE_SECRET → 503 ok=false（readiness 需要全部 check 為 true）", async () => {
    const inbox = await loadInbox();
    const r = await inbox.onRequest({
      request: opsReq("?mailops=health", { token: OPS_TOKEN }),
      env: opsEnv({ TURNSTILE_SECRET: undefined }),
    });
    assert.equal(r.status, 503);
    const j = (await r.json()) as { ok: boolean; checks: Record<string, boolean> };
    assert.equal(j.ok, false);
    assert.equal(j.checks.turnstileSecret, false);
    assert.equal(j.checks.resendKey, true);
  });

  await t("KV list throw → outboxStorage=false、ok=false、503", async () => {
    const inbox = await loadInbox();
    const r = await inbox.onRequest({
      request: opsReq("?mailops=health", { token: OPS_TOKEN }),
      env: opsEnv({ ENQUIRIES: mockKV({ failList: true }) }),
    });
    assert.equal(r.status, 503);
    const j = (await r.json()) as { ok: boolean; checks: Record<string, boolean> };
    assert.equal(j.ok, false);
    assert.equal(j.checks.outboxStorage, false);
  });

  // ══ E. retry：重播已排隊、同一 idempotency-key + frozen payload ═══════════
  console.log("\nE) retry：只重播已排隊、用凍結 payload（忽略新 IP/UA 及請求 body）");

  await t("初次失敗(network) → ops retry 重播：idempotency-key 與 payload 完全一致、變 accepted", async () => {
    const send = await loadSend();
    const inbox = await loadInbox();
    const kv = mockKV();
    let n = 0;
    const { fn, calls } = mockFetch(() => {
      n++;
      if (n === 1) throw new Error("network down");
      return jsonResp({ id: "email_retry_ok" });
    });
    const restore = withFetch(fn);
    try {
      const r1 = await send.onRequest({ request: mkRequest({ message: "E1" }), env: baseEnv({ ENQUIRIES: kv }) });
      const j1 = (await r1.json()) as { requestId: string; code: string };
      assert.equal(j1.code, "network_error");
      const first = calls[0];

      // 初次失敗會排期 5 分鐘後（指數退避）才可自動重試；模擬已過該窗口。
      const stKey = outboxStateKey(j1.requestId);
      const stRaw = JSON.parse(kv._map.get(stKey) as string) as Record<string, unknown>;
      assert.equal(stRaw.status, "pending");
      assert.ok(typeof stRaw.nextRetryAt === "string", "初次失敗應排期下次重試");
      stRaw.nextRetryAt = new Date(Date.now() - 1000).toISOString();
      kv._map.set(stKey, JSON.stringify(stRaw));

      const rr = await inbox.onRequest({
        request: opsReq("?mailops=retry", {
          token: OPS_TOKEN,
          method: "POST",
          body: JSON.stringify({ to: "attacker@evil.com", subject: "HIJACK", html: "<b>x</b>" }),
        }),
        env: opsEnv({ ENQUIRIES: kv }),
      });
      assert.equal(rr.status, 200);
      const rj = (await rr.json()) as {
        processed: number;
        accepted: number;
        pending: number;
        manualReview: number;
        errors: unknown[];
      };
      assert.equal(rj.processed, 1);
      assert.equal(rj.accepted, 1);
      assert.equal(rj.pending, 0);
      assert.equal(rj.manualReview, 0);
      assert.deepEqual(rj.errors, []);

      const second = calls[1];
      assert.equal(second.url, RESEND_URL);
      assert.equal(second.body, first.body, "重試必須用完全一樣嘅凍結 payload");
      assert.equal(second.headers["Idempotency-Key"], first.headers["Idempotency-Key"], "重試必須用同一 idempotency key");
      assert.ok(!second.body.includes("attacker@evil.com"), "唔可以接受任意收件人");
      assert.ok(!second.body.includes("HIJACK"), "唔可以接受任意內容");

      const st = readState(kv, j1.requestId);
      assert.equal(st.status, "accepted", "成功重播後 state=accepted");
      assert.equal(st.providerEmailId, "email_retry_ok");
      assert.equal(outboxPutCount(kv, j1.requestId), 1, "mailoutbox 不可被改寫（immutable）");
      assert.equal(kv._deletes.length, 0, "重試唔可以 delete 任何紀錄");
    } finally {
      restore();
    }
  });

  await t("accepted 之後唔會再被重試（accepted stops future calls）", async () => {
    const inbox = await loadInbox();
    const kv = mockKV();
    seedOutbox(kv, { requestId: "11111111-1111-4111-8111-111111111111", status: "accepted" });
    const { fn, calls } = mockFetch(() => jsonResp({ id: "x" }));
    const restore = withFetch(fn);
    try {
      const rr = await inbox.onRequest({
        request: opsReq("?mailops=retry", { token: OPS_TOKEN, method: "POST" }),
        env: opsEnv({ ENQUIRIES: kv }),
      });
      const rj = (await rr.json()) as { processed: number; accepted: number };
      assert.equal(rj.processed, 0);
      assert.equal(rj.accepted, 0);
      assert.equal(calls.length, 0, "已 accepted 唔應該再呼叫供應商");
    } finally {
      restore();
    }
  });

  await t("未到 nextRetryAt（退避中）→ 唔會被處理，保持 pending", async () => {
    const inbox = await loadInbox();
    const kv = mockKV();
    seedOutbox(kv, { requestId: "11111111-1111-4111-8111-111111111111", nextRetryInMs: 5 * 60_000 });
    const { fn, calls } = mockFetch(() => jsonResp({ id: "x" }));
    const restore = withFetch(fn);
    try {
      const rr = await inbox.onRequest({
        request: opsReq("?mailops=retry", { token: OPS_TOKEN, method: "POST" }),
        env: opsEnv({ ENQUIRIES: kv }),
      });
      const rj = (await rr.json()) as { processed: number; pending: number };
      assert.equal(rj.processed, 0);
      assert.equal(rj.pending, 1);
      assert.equal(calls.length, 0);
      assert.equal(readState(kv, "11111111-1111-4111-8111-111111111111").status, "pending");
    } finally {
      restore();
    }
  });

  await t("重試失敗（供應商 5xx）→ 保留錯誤詳情、attempts+1、重新排 pending", async () => {
    const inbox = await loadInbox();
    const kv = mockKV();
    seedOutbox(kv, { requestId: "33333333-3333-4333-8333-333333333333", attempts: 2 });
    const { fn, calls } = mockFetch(() => new Response("upstream 500", { status: 500 }));
    const restore = withFetch(fn);
    try {
      const rr = await inbox.onRequest({
        request: opsReq("?mailops=retry", { token: OPS_TOKEN, method: "POST" }),
        env: opsEnv({ ENQUIRIES: kv }),
      });
      const rj = (await rr.json()) as {
        processed: number;
        accepted: number;
        errors: Array<{ requestId: string; code: string; providerStatus: number | null }>;
      };
      assert.equal(rj.processed, 1);
      assert.equal(rj.accepted, 0);
      assert.equal(rj.errors.length, 1);
      assert.equal(rj.errors[0].requestId, "33333333-3333-4333-8333-333333333333");
      assert.equal(rj.errors[0].code, "provider_error");
      assert.equal(rj.errors[0].providerStatus, 500);
      const st = readState(kv, "33333333-3333-4333-8333-333333333333");
      assert.equal(st.attempts, 3, "attempts 應 +1");
      assert.equal(st.status, "pending");
      assert.ok(typeof st.nextRetryAt === "string" && String(st.nextRetryAt).length > 0, "應重新安排下次重試");
      assert.equal(calls.length, 1);
    } finally {
      restore();
    }
  });

  await t("超過 23 小時 TTL → 標 manual_review、唔自動寄、errors 記錄", async () => {
    const inbox = await loadInbox();
    const kv = mockKV();
    seedOutbox(kv, { requestId: "44444444-4444-4444-8444-444444444444", firstAttemptAgoMs: 24 * 60 * 60_000 });
    const { fn, calls } = mockFetch(() => jsonResp({ id: "x" }));
    const restore = withFetch(fn);
    try {
      const rr = await inbox.onRequest({
        request: opsReq("?mailops=retry", { token: OPS_TOKEN, method: "POST" }),
        env: opsEnv({ ENQUIRIES: kv }),
      });
      const rj = (await rr.json()) as { manualReview: number; errors: Array<{ requestId: string; code: string }> };
      assert.equal(rj.manualReview, 1);
      assert.equal(readState(kv, "44444444-4444-4444-8444-444444444444").status, "manual_review");
      assert.equal(calls.length, 0, "過期後唔可以自動寄");
      assert.ok(rj.errors.some((e) => e.requestId === "44444444-4444-4444-8444-444444444444"));
    } finally {
      restore();
    }
  });

  await t("已達 max 6 attempts → 標 manual_review、唔再寄", async () => {
    const inbox = await loadInbox();
    const kv = mockKV();
    seedOutbox(kv, { requestId: "55555555-5555-4555-8555-555555555555", attempts: MAX_ATTEMPTS });
    const { fn, calls } = mockFetch(() => jsonResp({ id: "x" }));
    const restore = withFetch(fn);
    try {
      const rr = await inbox.onRequest({
        request: opsReq("?mailops=retry", { token: OPS_TOKEN, method: "POST" }),
        env: opsEnv({ ENQUIRIES: kv }),
      });
      const rj = (await rr.json()) as { manualReview: number };
      assert.equal(rj.manualReview, 1);
      assert.equal(readState(kv, "55555555-5555-4555-8555-555555555555").status, "manual_review");
      assert.equal(calls.length, 0);
    } finally {
      restore();
    }
  });

  await t("缺少 frozen payload（mailoutbox 唔見）→ 唔會亂寄，標 manual_review", async () => {
    const inbox = await loadInbox();
    const kv = mockKV();
    seedOutbox(kv, { requestId: "66666666-6666-4666-8666-666666666666", writeRecord: false });
    const { fn, calls } = mockFetch(() => jsonResp({ id: "x" }));
    const restore = withFetch(fn);
    try {
      const rr = await inbox.onRequest({
        request: opsReq("?mailops=retry", { token: OPS_TOKEN, method: "POST" }),
        env: opsEnv({ ENQUIRIES: kv }),
      });
      const rj = (await rr.json()) as { errors: Array<{ code: string }> };
      assert.equal(calls.length, 0, "冇 payload 唔可以呼叫供應商");
      assert.equal(readState(kv, "66666666-6666-4666-8666-666666666666").status, "manual_review");
      assert.ok(rj.errors.some((e) => e.code === "payload_missing"));
    } finally {
      restore();
    }
  });

  await t("批次上限 10：25 條到期 → 每次 10／10／5，且 pending 遞減", async () => {
    const inbox = await loadInbox();
    const kv = mockKV();
    for (let i = 0; i < 25; i++) {
      seedOutbox(kv, {
        requestId: `00000000-0000-4000-8000-0000000000${i.toString(16).padStart(2, "0")}`,
        attempts: 1,
      });
    }
    const { fn, calls } = mockFetch(() => jsonResp({ id: "ok" }));
    const restore = withFetch(fn);
    try {
      const run = async () => {
        const rr = await inbox.onRequest({
          request: opsReq("?mailops=retry", { token: OPS_TOKEN, method: "POST" }),
          env: opsEnv({ ENQUIRIES: kv }),
        });
        return (await rr.json()) as { processed: number; accepted: number; pending: number };
      };
      const a = await run();
      assert.equal(a.processed, RETRY_BATCH_LIMIT, "第一次應處理 10 條");
      assert.equal(a.accepted, 10);
      assert.equal(calls.length, 10);
      const b = await run();
      assert.equal(b.processed, 10);
      const c = await run();
      assert.equal(c.processed, 5, "最後一次處理剩餘 5 條");
      assert.equal(calls.length, 25, "三次合共正好 25 次供應商呼叫");
      const d = await run();
      assert.equal(d.processed, 0, "處理完後應無到期項目");
    } finally {
      restore();
    }
  });

  await t("retry 未就緒（缺 RESEND_API_KEY）→ 503 not_ready，唔會寄", async () => {
    const inbox = await loadInbox();
    const kv = mockKV();
    seedOutbox(kv, { requestId: "77777777-7777-4777-8777-777777777777" });
    const { fn, calls } = mockFetch(() => jsonResp({ id: "x" }));
    const restore = withFetch(fn);
    try {
      const rr = await inbox.onRequest({
        request: opsReq("?mailops=retry", { token: OPS_TOKEN, method: "POST" }),
        env: opsEnv({ ENQUIRIES: kv, RESEND_API_KEY: undefined }),
      });
      assert.equal(rr.status, 503);
      assert.equal(calls.length, 0);
    } finally {
      restore();
    }
  });

  // ══ F. probe ═════════════════════════════════════════════════════════════
  console.log("\nF) probe：固定測試信，只寄 MAIL_TO（限定 info@adwire.com.hk），無 queue／無紀錄");

  await t("probe → 固定收件人／固定標題，回 ok/requestId/providerStatus/providerEmailId，無 queue", async () => {
    const inbox = await loadInbox();
    const kv = mockKV();
    const { fn, calls } = mockFetch(() => jsonResp({ id: "email_probe_1" }));
    const restore = withFetch(fn);
    try {
      const r = await inbox.onRequest({
        request: opsReq("?mailops=probe", { token: OPS_TOKEN, method: "POST" }),
        env: opsEnv({ ENQUIRIES: kv }),
      });
      assert.equal(r.status, 200);
      const j = (await r.json()) as Record<string, unknown>;
      assert.equal(j.ok, true);
      assert.ok(typeof j.requestId === "string" && UUID_RE.test(j.requestId as string));
      assert.equal(j.providerStatus, 200);
      assert.equal(j.providerEmailId, "email_probe_1");

      const call = calls.find((c) => c.url === RESEND_URL) as CapturedCall;
      const payload = JSON.parse(call.body) as Record<string, unknown>;
      assert.deepEqual(payload.to, [PROBE_RECIPIENT], "probe 只可寄固定收件人");
      assert.equal(payload.subject, PROBE_SUBJECT);
      assert.equal([...kv._map.keys()].filter((k) => k.startsWith("enq:")).length, 0, "probe 唔可以寫 enquiry");
      assert.equal([...kv._map.keys()].filter((k) => k.startsWith("mailoutbox")).length, 0, "probe 唔可以入 outbox");
      assert.equal(kv._deletes.length, 0);
    } finally {
      restore();
    }
  });

  await t("MAIL_TO 被改成其他地址 → probe 拒絕（locked_recipient），零供應商呼叫", async () => {
    const inbox = await loadInbox();
    const { fn, calls } = mockFetch(() => jsonResp({ id: "x" }));
    const restore = withFetch(fn);
    try {
      const r = await inbox.onRequest({
        request: opsReq("?mailops=probe", { token: OPS_TOKEN, method: "POST" }),
        env: opsEnv({ MAIL_TO: "attacker@evil.com" }),
      });
      const j = (await r.json()) as { ok: boolean; errorCode?: string };
      assert.equal(j.ok, false);
      assert.equal(j.errorCode, "locked_recipient");
      assert.equal(calls.length, 0);
    } finally {
      restore();
    }
  });

  await t("probe 供應商失敗 → ok=false、sanitized errorCode，無供應商原文／secret", async () => {
    const inbox = await loadInbox();
    const { fn } = mockFetch(() => new Response(`invalid key ${KEY}`, { status: 401 }));
    const restore = withFetch(fn);
    try {
      const r = await inbox.onRequest({
        request: opsReq("?mailops=probe", { token: OPS_TOKEN, method: "POST" }),
        env: opsEnv(),
      });
      const body = await r.text();
      assert.ok(!body.includes(KEY), "probe 錯誤唔可以洩漏 key");
      assert.ok(!body.includes("invalid key"), "probe 錯誤唔可以含供應商原文");
      const j = JSON.parse(body) as { ok: boolean; providerStatus: number | null; errorCode?: string };
      assert.equal(j.ok, false);
      assert.equal(j.providerStatus, 401);
      assert.equal(j.errorCode, "provider_error");
    } finally {
      restore();
    }
  });

  await t("probe 缺 RESEND_API_KEY → ok=false、errorCode=missing_config，零呼叫", async () => {
    const inbox = await loadInbox();
    const { fn, calls } = mockFetch(() => jsonResp({ id: "x" }));
    const restore = withFetch(fn);
    try {
      const r = await inbox.onRequest({
        request: opsReq("?mailops=probe", { token: OPS_TOKEN, method: "POST" }),
        env: opsEnv({ RESEND_API_KEY: undefined }),
      });
      const j = (await r.json()) as { ok: boolean; errorCode?: string };
      assert.equal(j.ok, false);
      assert.equal(j.errorCode, "missing_config");
      assert.equal(calls.length, 0);
    } finally {
      restore();
    }
  });

  // ══ G. 既有 /inbox Basic Auth 行為不變 ═══════════════════════════════════
  console.log("\nG) 既有 /inbox（Basic Auth）行為不受 mailops 影響");

  await t("冇 mailops 參數 → 走原有 Basic Auth（未認證 401）", async () => {
    const inbox = await loadInbox();
    const r = await inbox.onRequest({
      request: new Request("https://adwire.com.hk/inbox", { method: "GET" }),
      env: opsEnv(),
    });
    assert.equal(r.status, 401);
  });

  await t("mailops 分支唔會被 Basic Auth 攔（有 ops token 就得）", async () => {
    const inbox = await loadInbox();
    const r = await inbox.onRequest({
      request: opsReq("?mailops=health", { token: OPS_TOKEN }),
      env: opsEnv({ INBOX_PASSWORD: undefined }),
    });
    assert.equal(r.status, 503);
    const j = (await r.json()) as { checks: Record<string, boolean> };
    assert.equal(j.checks.inboxPassword, false);
  });

  // ══ H. 重試掃描游標：公平輪轉、避免 starvation、儲存層失敗唔假成功 ════════
  console.log("\nH) retry 掃描游標：>scanlimit retained state 之下仍然公平輪轉");

  const accId = (i: number): string => `acc-${i.toString().padStart(3, "0")}`;
  const penId = (i: number): string => `pen-${i.toString().padStart(3, "0")}`;
  const readCursor = (kv: MockKV): string | null => kv._map.get(RETRY_CURSOR_KEY) ?? null;

  await t(">scanlimit 個 accepted 前綴 + pending 尾：多輪呼叫最終處理到尾（唔會餓死）", async () => {
    const inbox = await loadInbox();
    const kv = mockKV();
    const ACCEPTED = 120; // 全部排在掃描窗口（RETRY_SCAN_LIMIT）之後嘅 pending 之前
    for (let i = 0; i < ACCEPTED; i++) seedOutbox(kv, { requestId: accId(i), status: "accepted" });
    const PENDING = 8;
    for (let i = 0; i < PENDING; i++) seedOutbox(kv, { requestId: penId(i) });

    const { fn, calls } = mockFetch(() => jsonResp({ id: "ok" }));
    const restore = withFetch(fn);
    try {
      const run = async () => {
        const rr = await inbox.onRequest({
          request: opsReq("?mailops=retry", { token: OPS_TOKEN, method: "POST" }),
          env: opsEnv({ ENQUIRIES: kv }),
        });
        return (await rr.json()) as { processed: number; accepted: number; storageError: boolean };
      };

      const first = await run();
      assert.equal(first.processed, 0, "第一輪掃描窗口（首 100 個）全部係 accepted，無到期項");
      assert.equal(first.storageError, false);
      assert.equal(readCursor(kv), "100", "第一輪後游標應前進到 100（跨呼叫持久化）");
      assert.ok(!RETRY_CURSOR_KEY.startsWith("mailoutboxstate:"), "游標 key 唔屬客戶狀態前綴");

      const second = await run();
      assert.equal(second.processed, PENDING, "第二輪由游標續掃，輪到尾 pending（舊 bug 會永遠掃唔到）");
      assert.equal(second.accepted, PENDING);
      assert.ok(second.processed <= RETRY_BATCH_LIMIT, "每次供應商呼叫上限 10");
      for (let i = 0; i < PENDING; i++) {
        assert.equal(readState(kv, penId(i)).status, "accepted", `${penId(i)} 最終應被接受`);
      }
      assert.equal(calls.length, PENDING, "尾 8 條各寄一次");
      assert.equal(kv._deletes.length, 0, "游標／狀態永不刪除");

      const third = await run();
      assert.equal(third.processed, 0, "掃到盡後 wrap，再無到期項");
      assert.ok([...kv._map.keys()].includes(RETRY_CURSOR_KEY), "游標 key 恆存");
    } finally {
      restore();
    }
  });

  await t("pending 全部喺 scanlimit 之後（100 accepted + 5 pending）→ 第二輪處理到尾", async () => {
    const inbox = await loadInbox();
    const kv = mockKV();
    for (let i = 0; i < RETRY_SCAN_LIMIT; i++) seedOutbox(kv, { requestId: accId(i), status: "accepted" });
    for (let i = 0; i < 5; i++) seedOutbox(kv, { requestId: penId(i) });
    const { fn, calls } = mockFetch(() => jsonResp({ id: "ok" }));
    const restore = withFetch(fn);
    try {
      const run = async () => {
        const rr = await inbox.onRequest({
          request: opsReq("?mailops=retry", { token: OPS_TOKEN, method: "POST" }),
          env: opsEnv({ ENQUIRIES: kv }),
        });
        return (await rr.json()) as { processed: number; accepted: number };
      };
      assert.equal((await run()).processed, 0, "首 100 個全 accepted");
      const second = await run();
      assert.equal(second.processed, 5, "由游標續掃到尾 5 條");
      assert.equal(second.accepted, 5);
      assert.equal(calls.length, 5);
    } finally {
      restore();
    }
  });

  await t("游標 wrap：掃到盡寫空字串（下一輪由頭），游標 key 恆存", async () => {
    const kv = mockKV();
    seedOutbox(kv, { requestId: "11111111-1111-4111-8111-111111111111" });
    const { fn } = mockFetch(() => jsonResp({ id: "ok" }));
    const restore = withFetch(fn);
    try {
      const out = await runRetryBatch(kv, { apiKey: KEY });
      assert.equal(out.processed, 1);
      assert.equal(out.storageError, false);
      assert.equal(readCursor(kv), "", "掃到盡（wrap）應寫空字串代表由頭");
      assert.ok([...kv._map.keys()].includes(RETRY_CURSOR_KEY), "游標 key 必須存在");
      assert.equal(kv._deletes.length, 0);
    } finally {
      restore();
    }
  });

  await t("游標讀取失敗 → storageError=true + 結構化錯誤（唔當 all-zero 為乾淨成功）", async () => {
    const kv = mockKV({ failGet: (k) => k === RETRY_CURSOR_KEY });
    seedOutbox(kv, { requestId: "11111111-1111-4111-8111-111111111111" });
    const { fn, calls } = mockFetch(() => jsonResp({ id: "ok" }));
    const restore = withFetch(fn);
    try {
      const out = await runRetryBatch(kv, { apiKey: KEY });
      assert.equal(out.storageError, true, "儲存層失敗必須明確標示，唔可以靜靜回成功");
      assert.equal(out.processed, 0);
      assert.equal(out.accepted, 0);
      assert.equal(calls.length, 0, "fail-closed：唔會亂寄");
      assert.ok(
        out.errors.some((e) => e.requestId === "" && e.code === "retry_storage_error"),
        "應有安全結構化錯誤碼（requestId 為空）",
      );
    } finally {
      restore();
    }
  });

  await t("KV list 失敗 → storageError=true（舊行為會靜靜回 all-zero 成功）", async () => {
    const kv = mockKV({ failList: true });
    seedOutbox(kv, { requestId: "11111111-1111-4111-8111-111111111111" });
    const { fn, calls } = mockFetch(() => jsonResp({ id: "ok" }));
    const restore = withFetch(fn);
    try {
      const out = await runRetryBatch(kv, { apiKey: KEY });
      assert.equal(out.storageError, true);
      assert.equal(out.processed, 0);
      assert.equal(calls.length, 0);
      assert.ok(out.errors.some((e) => e.code === "retry_storage_error"));
    } finally {
      restore();
    }
  });

  await t("游標寫入失敗 → 仍重播，但 storageError=true + retry_cursor_error", async () => {
    const kv = mockKV({ failPut: (k) => k === RETRY_CURSOR_KEY });
    seedOutbox(kv, { requestId: "11111111-1111-4111-8111-111111111111" });
    const { fn, calls } = mockFetch(() => jsonResp({ id: "ok" }));
    const restore = withFetch(fn);
    try {
      const out = await runRetryBatch(kv, { apiKey: KEY });
      assert.equal(out.processed, 1, "重播本身成功");
      assert.equal(out.accepted, 1);
      assert.equal(out.storageError, true, "游標寫唔到 = 下輪會重掃，必須告警");
      assert.ok(out.errors.some((e) => e.requestId === "" && e.code === "retry_cursor_error"));
      assert.equal(calls.length, 1);
    } finally {
      restore();
    }
  });

  await t("storageError 經 /inbox?mailops=retry 對呼叫端可見（唔會被當成乾淨 ok）", async () => {
    const inbox = await loadInbox();
    const kv = mockKV({ failList: true });
    seedOutbox(kv, { requestId: "11111111-1111-4111-8111-111111111111" });
    const { fn } = mockFetch(() => jsonResp({ id: "ok" }));
    const restore = withFetch(fn);
    try {
      const rr = await inbox.onRequest({
        request: opsReq("?mailops=retry", { token: OPS_TOKEN, method: "POST" }),
        env: opsEnv({ ENQUIRIES: kv }),
      });
      const rj = (await rr.json()) as { storageError?: boolean; errors: Array<{ code: string }> };
      assert.equal(rj.storageError, true, "呼叫端必須收到儲存層失敗訊號");
      assert.ok(rj.errors.some((e) => e.code === "retry_storage_error"));
    } finally {
      restore();
    }
  });

  await t("全部 accepted（>scanlimit）→ 零供應商呼叫、無 error、storageError=false", async () => {
    const kv = mockKV();
    for (let i = 0; i < 120; i++) seedOutbox(kv, { requestId: accId(i), status: "accepted" });
    const { fn, calls } = mockFetch(() => jsonResp({ id: "ok" }));
    const restore = withFetch(fn);
    try {
      const out = await runRetryBatch(kv, { apiKey: KEY });
      assert.equal(out.processed, 0);
      assert.equal(out.accepted, 0);
      assert.equal(out.storageError, false);
      assert.deepEqual(out.errors, []);
      assert.equal(calls.length, 0);
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

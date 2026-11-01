/**
 * tests/form-security.test.ts — lib/form-security.ts 單元測試
 *
 * 執行方式（Node 原生 type stripping，本 repo 未安裝測試框架）：
 *   node --experimental-strip-types tests/form-security.test.ts
 *
 * 全部測試只呼叫真正嘅純函式：零網絡（fetch 由測試注入 mock）、零 KV、
 * 零計數器狀態、零寄信、零部署、零檔案寫入。
 *
 * 契約（同 handler 整合 agent 對齊）：
 *   normalizeMultiline / validateSubmissionEnvelope / verifyHumanToken /
 *   collectNetworkMetadata / evaluateSubmissionRisk —— 全部只回傳純資料，
 *   唔會 delete／reject／skip notify；評分只係「建議審核」。
 */

import test from "node:test";
import assert from "node:assert/strict";

type EnvelopeResult = { ok: boolean; status?: number; code?: string; message?: string };
type VerifyResult = { status: "verified" | "failed" | "unavailable"; reasonCode: string };
type NetworkMetadata = { asn: number | null; organization: string; country: string };
type RiskFields = {
  name: string;
  phone: string;
  email: string;
  company: string;
  companySite: string;
  systemInfo: string;
  message: string;
  ua: string;
};
type RiskResult = { level: "low" | "review"; score: number; reasons: string[] };
type Mod = {
  normalizeMultiline(value: unknown, max: number): string;
  validateSubmissionEnvelope(
    request: Request,
    body: Record<string, unknown>,
    nowMs?: number,
  ): EnvelopeResult;
  verifyHumanToken(
    opts: { token: string; secret?: string; ip: string; expectedHostname: string; nowMs?: number },
    fetcher?: typeof fetch,
  ): Promise<VerifyResult>;
  collectNetworkMetadata(request: Request): NetworkMetadata;
  evaluateSubmissionRisk(fields: RiskFields): RiskResult;
};

const securitySpecifier = "../lib/form-security.ts?case=tests";
const m = (await import(securitySpecifier)) as unknown as Mod;

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const NOW = 1_700_000_000_000;
const GOOD_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

const jsonResp = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

function mkReq(origin?: string | null): Request {
  const headers: Record<string, string> = {};
  if (origin != null) headers.origin = origin;
  return new Request("https://adwire.com.hk/send-mail.php", { method: "POST", headers });
}

function reqWithCf(cf: unknown, headers: Record<string, string> = {}): Request {
  const r = new Request("https://adwire.com.hk/send-mail.php", { method: "POST", headers });
  Object.defineProperty(r, "cf", { value: cf, configurable: true });
  return r;
}

const normalFields = (over: Partial<RiskFields> = {}): RiskFields => ({
  name: "陳大文",
  phone: "91234567",
  email: "me@gmail.com",
  company: "ADWire",
  companySite: "adwire.com.hk",
  systemInfo: "",
  message: "你好，我想了解 SEO 服務，請聯絡我。",
  ua: GOOD_UA,
  ...over,
});

// ─────────────────────────────────────────────────────────────────────────────
// normalizeMultiline
// ─────────────────────────────────────────────────────────────────────────────

test("normalizeMultiline: CRLF 與單獨 CR 都轉成 LF", () => {
  assert.equal(m.normalizeMultiline("a\r\nb\rc\nd", 100), "a\nb\nc\nd");
});

test("normalizeMultiline: 剝除其他 C0 控制字元但保留 LF", () => {
  assert.equal(m.normalizeMultiline("a\u0000b\u0007c\u001bd\ne", 100), "abcd\ne");
  assert.equal(m.normalizeMultiline("tab\there", 100), "tabhere");
});

test("normalizeMultiline: 前後空白 trim（包括 LF）", () => {
  assert.equal(m.normalizeMultiline("  \n  hi  \n ", 100), "hi");
});

test("normalizeMultiline: 依 max 截斷", () => {
  assert.equal(m.normalizeMultiline("abcdef", 3), "abc");
  assert.equal(m.normalizeMultiline("abc", 0), "");
});

test("normalizeMultiline: 唔會做 HTML unescape", () => {
  assert.equal(m.normalizeMultiline("&amp; &lt; &gt; &#39;", 100), "&amp; &lt; &gt; &#39;");
});

test("normalizeMultiline: 非字串一律回空字串", () => {
  assert.equal(m.normalizeMultiline(null, 100), "");
  assert.equal(m.normalizeMultiline(undefined, 100), "");
  assert.equal(m.normalizeMultiline(42, 100), "");
  assert.equal(m.normalizeMultiline({ a: 1 }, 100), "");
});

test("normalizeMultiline: 保留中文與內部換行", () => {
  assert.equal(m.normalizeMultiline("第一行\n第二行 你好", 100), "第一行\n第二行 你好");
});

// ─────────────────────────────────────────────────────────────────────────────
// validateSubmissionEnvelope
// ─────────────────────────────────────────────────────────────────────────────

test("envelope: 正確 origin + 數字 ms 舊時間戳 → ok", () => {
  const r = m.validateSubmissionEnvelope(mkReq("https://adwire.com.hk"), {
    formStartedAt: NOW - 10_000,
  }, NOW);
  assert.equal(r.ok, true);
  assert.equal(r.status, undefined);
});

test("envelope: www origin + ISO 字串舊時間戳 → ok", () => {
  const r = m.validateSubmissionEnvelope(
    mkReq("https://www.adwire.com.hk"),
    { formStartedAt: new Date(NOW - 10_000).toISOString() },
    NOW,
  );
  assert.equal(r.ok, true);
});

test("envelope: 缺少 Origin → 拒絕（唔可以用 origin 當認證）", () => {
  const r = m.validateSubmissionEnvelope(mkReq(), { formStartedAt: NOW - 10_000 }, NOW);
  assert.equal(r.ok, false);
  assert.equal(r.status, 403);
  assert.equal(r.code, "ORIGIN_MISSING");
  assert.ok(r.message);
});

test("envelope: 敵意 Origin → 拒絕", () => {
  const r = m.validateSubmissionEnvelope(mkReq("https://evil.example.com"), { formStartedAt: NOW - 10_000 }, NOW);
  assert.equal(r.ok, false);
  assert.equal(r.status, 403);
  assert.equal(r.code, "ORIGIN_INVALID");
});

test("envelope: origin 尾隨斜線／大小寫不符 → 拒絕（必須完全一致）", () => {
  assert.equal(m.validateSubmissionEnvelope(mkReq("https://adwire.com.hk/"), {}, NOW).code, "ORIGIN_INVALID");
  assert.equal(m.validateSubmissionEnvelope(mkReq("null"), {}, NOW).code, "ORIGIN_INVALID");
  assert.equal(m.validateSubmissionEnvelope(mkReq("https://ADWIRE.com.hk"), {}, NOW).code, "ORIGIN_INVALID");
});

test("envelope: 缺 formStartedAt → 拒絕", () => {
  const r = m.validateSubmissionEnvelope(mkReq("https://adwire.com.hk"), {}, NOW);
  assert.equal(r.ok, false);
  assert.equal(r.status, 400);
  assert.equal(r.code, "FORM_STARTED_MISSING");
});

test("envelope: NaN／零／無法解析 → 拒絕", () => {
  assert.equal(m.validateSubmissionEnvelope(mkReq("https://adwire.com.hk"), { formStartedAt: "abc" }, NOW).code, "FORM_STARTED_INVALID");
  assert.equal(m.validateSubmissionEnvelope(mkReq("https://adwire.com.hk"), { formStartedAt: 0 }, NOW).code, "FORM_STARTED_INVALID");
  assert.equal(m.validateSubmissionEnvelope(mkReq("https://adwire.com.hk"), { formStartedAt: "0" }, NOW).code, "FORM_STARTED_INVALID");
  assert.equal(m.validateSubmissionEnvelope(mkReq("https://adwire.com.hk"), { formStartedAt: Number.NaN }, NOW).code, "FORM_STARTED_INVALID");
});

test("envelope: 未來時間戳（數字或 ISO）→ 拒絕", () => {
  assert.equal(m.validateSubmissionEnvelope(mkReq("https://adwire.com.hk"), { formStartedAt: NOW + 60_000 }, NOW).code, "FORM_STARTED_FUTURE");
  assert.equal(
    m.validateSubmissionEnvelope(mkReq("https://adwire.com.hk"), { formStartedAt: new Date(NOW + 60_000).toISOString() }, NOW).code,
    "FORM_STARTED_FUTURE",
  );
});

test("envelope: 提交太快（< 2500ms）→ 拒絕", () => {
  assert.equal(m.validateSubmissionEnvelope(mkReq("https://adwire.com.hk"), { formStartedAt: NOW - 1_000 }, NOW).code, "FORM_TOO_QUICK");
  assert.equal(
    m.validateSubmissionEnvelope(mkReq("https://adwire.com.hk"), { formStartedAt: new Date(NOW - 1_000).toISOString() }, NOW).code,
    "FORM_TOO_QUICK",
  );
});

test("envelope: 剛好 2500ms → 通過（唔可以過度嚴格）", () => {
  assert.equal(m.validateSubmissionEnvelope(mkReq("https://adwire.com.hk"), { formStartedAt: NOW - 2_500 }, NOW).ok, true);
});

test("envelope: 好舊嘅時間戳仍然接受（冇任意長 session 拒絕）", () => {
  assert.equal(
    m.validateSubmissionEnvelope(mkReq("https://adwire.com.hk"), { formStartedAt: NOW - 86_400_000 }, NOW).ok,
    true,
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// verifyHumanToken
// ─────────────────────────────────────────────────────────────────────────────

test("verify: secret 缺失／空白 → unavailable，且完全唔會呼叫 fetch", async () => {
  let called = 0;
  const fetcher = (async () => {
    called++;
    return jsonResp({ success: true });
  }) as unknown as typeof fetch;

  const a = await m.verifyHumanToken({ token: "tok", ip: "1.2.3.4", expectedHostname: "adwire.com.hk" }, fetcher);
  assert.equal(a.status, "unavailable");
  assert.equal(a.reasonCode, "SECRET_MISSING");

  const b = await m.verifyHumanToken({ token: "tok", secret: "   ", ip: "1.2.3.4", expectedHostname: "adwire.com.hk" }, fetcher);
  assert.equal(b.status, "unavailable");
  assert.equal(b.reasonCode, "SECRET_MISSING");

  assert.equal(called, 0, "缺 secret 時唔可以打 API");
});

test("verify: token 缺失 → failed，且唔會打 API", async () => {
  let called = 0;
  const fetcher = (async () => {
    called++;
    return jsonResp({ success: true });
  }) as unknown as typeof fetch;
  const r = await m.verifyHumanToken({ token: "  ", secret: "sec", ip: "1.2.3.4", expectedHostname: "adwire.com.hk" }, fetcher);
  assert.equal(r.status, "failed");
  assert.equal(r.reasonCode, "TOKEN_MISSING");
  assert.equal(called, 0);
});

test("verify: 只用官方固定 siteverify URL、POST、FormData（secret/response/remoteip）、redirect manual", async () => {
  const calls: Array<{ url: string; init: { method?: string; body?: unknown; redirect?: string } }> = [];
  const fetcher = (async (url: unknown, init: unknown) => {
    calls.push({ url: String(url), init: init as { method?: string; body?: unknown; redirect?: string } });
    return jsonResp({ success: true, hostname: "adwire.com.hk" });
  }) as unknown as typeof fetch;

  const r = await m.verifyHumanToken(
    { token: "tok-123", secret: "sec-abc", ip: "9.9.9.9", expectedHostname: "adwire.com.hk" },
    fetcher,
  );
  assert.equal(r.status, "verified");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, SITEVERIFY);
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.redirect, "manual");
  const body = calls[0].init.body;
  assert.ok(body instanceof FormData);
  assert.equal((body as FormData).get("secret"), "sec-abc");
  assert.equal((body as FormData).get("response"), "tok-123");
  assert.equal((body as FormData).get("remoteip"), "9.9.9.9");
});

test("verify: success:true + hostname 相符 → verified（唔需要 action 欄位）", async () => {
  const fetcher = (async () =>
    jsonResp({ success: true, hostname: "adwire.com.hk", action: undefined })) as unknown as typeof fetch;
  const r = await m.verifyHumanToken({ token: "t", secret: "s", ip: "1.1.1.1", expectedHostname: "adwire.com.hk" }, fetcher);
  assert.equal(r.status, "verified");
  assert.equal(r.reasonCode, "VERIFIED");
});

test("verify: hostname 不相符 → failed", async () => {
  const fetcher = (async () =>
    jsonResp({ success: true, hostname: "attacker.example" })) as unknown as typeof fetch;
  const r = await m.verifyHumanToken({ token: "t", secret: "s", ip: "1.1.1.1", expectedHostname: "adwire.com.hk" }, fetcher);
  assert.equal(r.status, "failed");
  assert.equal(r.reasonCode, "HOSTNAME_MISMATCH");
});

test("verify: 缺 hostname → failed（必須有 hostname）", async () => {
  const fetcher = (async () => jsonResp({ success: true })) as unknown as typeof fetch;
  const r = await m.verifyHumanToken({ token: "t", secret: "s", ip: "1.1.1.1", expectedHostname: "adwire.com.hk" }, fetcher);
  assert.equal(r.status, "failed");
  assert.equal(r.reasonCode, "HOSTNAME_MISMATCH");
});

test("verify: success:false → failed", async () => {
  const fetcher = (async () => jsonResp({ success: false, "error-codes": ["invalid-input-response"] })) as unknown as typeof fetch;
  const r = await m.verifyHumanToken({ token: "t", secret: "s", ip: "1.1.1.1", expectedHostname: "adwire.com.hk" }, fetcher);
  assert.equal(r.status, "failed");
  assert.equal(r.reasonCode, "NOT_SUCCESS");
});

test("verify: non-2xx（500／302）→ unavailable", async () => {
  for (const status of [500, 302, 403]) {
    const fetcher = (async () => new Response("boom", { status })) as unknown as typeof fetch;
    const r = await m.verifyHumanToken({ token: "t", secret: "s", ip: "1.1.1.1", expectedHostname: "adwire.com.hk" }, fetcher);
    assert.equal(r.status, "unavailable");
    assert.equal(r.reasonCode, "HTTP_ERROR");
  }
});

test("verify: 壞 JSON → unavailable", async () => {
  const fetcher = (async () =>
    new Response("<html>not json</html>", { status: 200, headers: { "content-type": "text/html" } })) as unknown as typeof fetch;
  const r = await m.verifyHumanToken({ token: "t", secret: "s", ip: "1.1.1.1", expectedHostname: "adwire.com.hk" }, fetcher);
  assert.equal(r.status, "unavailable");
  assert.equal(r.reasonCode, "BAD_JSON");
});

test("verify: fetch throw → unavailable（fail-open 訊號）", async () => {
  const fetcher = (async () => {
    throw new Error("network down");
  }) as unknown as typeof fetch;
  const r = await m.verifyHumanToken({ token: "t", secret: "s", ip: "1.1.1.1", expectedHostname: "adwire.com.hk" }, fetcher);
  assert.equal(r.status, "unavailable");
  assert.equal(r.reasonCode, "FETCH_ERROR");
});

test("verify: 逾時（AbortController）→ unavailable", async () => {
  const fetcher = ((_url: unknown, init: unknown) =>
    new Promise<Response>((_resolve, reject) => {
      const signal = (init as { signal?: AbortSignal }).signal;
      signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    })) as unknown as typeof fetch;
  const r = await m.verifyHumanToken({ token: "t", secret: "s", ip: "1.1.1.1", expectedHostname: "adwire.com.hk" }, fetcher);
  assert.equal(r.status, "unavailable");
  assert.equal(r.reasonCode, "TIMEOUT");
});

test("verify: challenge_ts 過期（>300s）→ failed", async () => {
  const fetcher = (async () =>
    jsonResp({ success: true, hostname: "adwire.com.hk", challenge_ts: new Date(NOW - 400_000).toISOString() })) as unknown as typeof fetch;
  const r = await m.verifyHumanToken({ token: "t", secret: "s", ip: "1.1.1.1", expectedHostname: "adwire.com.hk", nowMs: NOW }, fetcher);
  assert.equal(r.status, "failed");
  assert.equal(r.reasonCode, "CHALLENGE_EXPIRED");
});

test("verify: challenge_ts 格式錯誤 → failed", async () => {
  const fetcher = (async () =>
    jsonResp({ success: true, hostname: "adwire.com.hk", challenge_ts: "not-a-date" })) as unknown as typeof fetch;
  const r = await m.verifyHumanToken({ token: "t", secret: "s", ip: "1.1.1.1", expectedHostname: "adwire.com.hk", nowMs: NOW }, fetcher);
  assert.equal(r.status, "failed");
  assert.equal(r.reasonCode, "CHALLENGE_TS_INVALID");
});

test("verify: challenge_ts 新鮮 → verified", async () => {
  const fetcher = (async () =>
    jsonResp({ success: true, hostname: "adwire.com.hk", challenge_ts: new Date(NOW - 5_000).toISOString() })) as unknown as typeof fetch;
  const r = await m.verifyHumanToken({ token: "t", secret: "s", ip: "1.1.1.1", expectedHostname: "adwire.com.hk", nowMs: NOW }, fetcher);
  assert.equal(r.status, "verified");
});

test("verify: 永不回傳原始 token／secret／response", async () => {
  const secret = "super-secret-value-xyz";
  const token = "raw-token-value-abc";
  const fetcher = (async () =>
    jsonResp({ success: true, hostname: "adwire.com.hk", secret, token })) as unknown as typeof fetch;
  const r = await m.verifyHumanToken({ token, secret, ip: "1.1.1.1", expectedHostname: "adwire.com.hk" }, fetcher);
  assert.deepEqual(Object.keys(r).sort(), ["reasonCode", "status"]);
  const serialized = JSON.stringify(r);
  assert.ok(!serialized.includes(secret));
  assert.ok(!serialized.includes(token));
});

// ─────────────────────────────────────────────────────────────────────────────
// collectNetworkMetadata
// ─────────────────────────────────────────────────────────────────────────────

test("metadata: 讀取受信任嘅 request.cf（asn／asOrganization／country）", () => {
  const tags = { asn: 13335, asOrganization: "Cloudflare, Inc.", country: "HK" };
  assert.deepEqual(m.collectNetworkMetadata(reqWithCf(tags)), {
    asn: 13335,
    organization: "Cloudflare, Inc.",
    country: "HK",
  });
});

test("metadata: cf 缺失時回退 header CF-IPCountry（只接受兩個字母）", () => {
  const r = m.collectNetworkMetadata(reqWithCf(undefined, { "cf-ipcountry": "hk" }));
  assert.equal(r.country, "HK");
  assert.equal(r.asn, null);
  assert.equal(r.organization, "");
});

test("metadata: cf country 無效 → 用 header；header 都無效 → 空", () => {
  assert.equal(m.collectNetworkMetadata(reqWithCf({ country: "HKG" }, { "cf-ipcountry": "US" })).country, "US");
  assert.equal(m.collectNetworkMetadata(reqWithCf({ country: "1" }, { "cf-ipcountry": "XYZ1" })).country, "");
  assert.equal(m.collectNetworkMetadata(reqWithCf(undefined, {})).country, "");
});

test("metadata: 唔會由 ASN 推斷 ISP／VPN／normal（唔加額外欄位）", () => {
  const meta = m.collectNetworkMetadata(reqWithCf({ asn: 212238, asOrganization: "Datacamp Limited", country: "US" }));
  assert.deepEqual(Object.keys(meta).sort(), ["asn", "country", "organization"]);
  assert.equal(meta.asn, 212238);
  assert.equal(meta.organization, "Datacamp Limited");
});

test("metadata: asn 非數字／0／負數 → null", () => {
  assert.equal(m.collectNetworkMetadata(reqWithCf({ asn: "abc" })).asn, null);
  assert.equal(m.collectNetworkMetadata(reqWithCf({ asn: 0 })).asn, null);
  assert.equal(m.collectNetworkMetadata(reqWithCf({ asn: -5 })).asn, null);
  assert.equal(m.collectNetworkMetadata(reqWithCf({ asn: Number.NaN })).asn, null);
});

test("metadata: 唔會接受 body 內嘅 metadata（只信 request.cf／header）", () => {
  const body = new Request("https://adwire.com.hk/send-mail.php", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ asn: 999, organization: "HandInjected", country: "US" }),
  });
  const meta = m.collectNetworkMetadata(body);
  assert.deepEqual(meta, { asn: null, organization: "", country: "" });
});

// ─────────────────────────────────────────────────────────────────────────────
// evaluateSubmissionRisk
// ─────────────────────────────────────────────────────────────────────────────

test("risk: 正常香港客戶 → low，score 0（冇已知內容訊號）", () => {
  const r = m.evaluateSubmissionRisk(normalFields());
  assert.equal(r.level, "low");
  assert.equal(r.score, 0);
  assert.deepEqual(r.reasons, []);
});

test("risk: 國家／外國／VPN metadata 唔會自動加分", () => {
  // 同一批正常欄位，唔理 metadata 點，風險評估結果都一樣（函式唔收 metadata）
  const a = m.evaluateSubmissionRisk(normalFields({ email: "a@corp.co.uk" }));
  const b = m.evaluateSubmissionRisk(normalFields({ email: "b@company.com.hk" }));
  assert.equal(a.level, "low");
  assert.equal(b.level, "low");
  assert.equal(a.score, 0);
  assert.equal(b.score, 0);
});

test("risk: 免費用戶電郵（gmail）唔會被扣分", () => {
  const r = m.evaluateSubmissionRisk(normalFields({ email: "freeuser@gmail.com" }));
  assert.equal(r.level, "low");
  assert.equal(r.score, 0);
});

test("risk: 一次性電郵域名 → review", () => {
  const r = m.evaluateSubmissionRisk(normalFields({ email: "throwaway@mailinator.com" }));
  assert.equal(r.level, "review");
  assert.ok(r.score >= 55);
  assert.ok(r.reasons.some((x) => x.includes("一次性") || x.includes("棄用")));
});

test("risk: 公司／網站填純數字 → 加訊號", () => {
  const one = m.evaluateSubmissionRisk(normalFields({ company: "12345678" }));
  assert.ok(one.reasons.some((x) => x.includes("公司")));
  const two = m.evaluateSubmissionRisk(normalFields({ companySite: "999" }));
  assert.ok(two.reasons.some((x) => x.includes("網站")));
});

test("risk: 電話／公司／網站填完全相同純數字 → review", () => {
  const r = m.evaluateSubmissionRisk(normalFields({ phone: "12345678", company: "12345678", companySite: "12345678" }));
  assert.equal(r.level, "review");
});

test("risk: 公司網站唔似有效網域 → 加訊號；中文／N/A／無／空白一律放行", () => {
  const bad = m.evaluateSubmissionRisk(normalFields({ companySite: "Hdhdbsh" }));
  assert.ok(bad.reasons.some((x) => x.includes("公司網站")));

  for (const site of ["", "暫未有網站", "Instagram 專頁", "N/A", "無", "n/a", "-"]) {
    const r = m.evaluateSubmissionRisk(normalFields({ companySite: site }));
    assert.ok(!r.reasons.some((x) => x.includes("網域")), `唔應該 flag: ${site}`);
  }
  // 合法 domain 亦唔應該 flag
  for (const site of ["https://example.com.hk", "www.example.com", "example.com:8080/path"]) {
    const r = m.evaluateSubmissionRisk(normalFields({ companySite: site }));
    assert.ok(!r.reasons.some((x) => x.includes("網域")), `合法網域唔應 flag: ${site}`);
  }
});

test("risk: 電郵 TLD 打錯字（.con／.cmo）→ 加訊號", () => {
  for (const email of ["cn@coffsec.con", "user@example.cmo", "x@site.nte"]) {
    const r = m.evaluateSubmissionRisk(normalFields({ email }));
    assert.ok(r.reasons.some((x) => x.includes("頂級域")), `應 flag: ${email}`);
  }
  // 正常 TLD 唔應 flag
  for (const email of ["a@example.com", "b@example.com.hk", "c@example.org"]) {
    const r = m.evaluateSubmissionRisk(normalFields({ email }));
    assert.ok(!r.reasons.some((x) => x.includes("頂級域")), `正常 TLD 唔應 flag: ${email}`);
  }
});

test("risk: 亂打鍵盤（多個欄位）→ review，且有上限", () => {
  const r = m.evaluateSubmissionRisk(
    normalFields({
      company: "Iddnsn",
      companySite: "Hdhdbsh",
      systemInfo: "Ejznznxn",
      message: "Ixidjsnxnc",
      email: "cn@coffsec.con",
    }),
  );
  assert.equal(r.level, "review");
  assert.ok(r.reasons.some((x) => x.includes("亂打鍵盤")));
  assert.ok(r.score <= 200, "分數要有界");
});

test("risk: 中文內容／品牌縮寫／正常技術詞唔會被當亂碼", () => {
  const r = m.evaluateSubmissionRisk(
    normalFields({
      company: "香港創意科技",
      companySite: "我哋未有網站",
      systemInfo: "WordPress + WooCommerce",
      message: "你好，想升級現有網站同埋做 SEO。",
    }),
  );
  assert.ok(!r.reasons.some((x) => x.includes("亂打鍵盤")));
  assert.equal(r.level, "low");

  for (const brand of ["HKTVmall", "PCCW", "HKBN", "Shopify", "WordPress", "React", "Node.js"]) {
    const rr = m.evaluateSubmissionRisk(normalFields({ company: brand, companySite: "example.com.hk" }));
    assert.ok(!rr.reasons.some((x) => x.includes("亂打鍵盤")), `品牌唔應 flag: ${brand}`);
  }
});

test("risk: 缺 UA／bot UA → 只加訊號（單獨唔會 review）", () => {
  for (const ua of ["", "curl/8.0.1", "python-requests/2.31", "Go-http-client/1.1", "short"]) {
    const r = m.evaluateSubmissionRisk(normalFields({ ua }));
    assert.ok(r.reasons.some((x) => x.includes("User-Agent")), `應 flag UA: ${ua}`);
    assert.equal(r.level, "low"); // 只 flag，唔單獨 review
  }
});

test("risk: 門檻 55 —— 剛好 55 分 → review，50 分 → low", () => {
  // 30（網站唔似網域，但唔屬亂碼）+ 25（bot UA）= 55 → review
  const at55 = m.evaluateSubmissionRisk(normalFields({ companySite: "mycompany", ua: "curl/8.0.1" }));
  assert.equal(at55.score, 55);
  assert.equal(at55.level, "review");
  // 25（公司純數字）+ 25（bot UA）= 50 → low
  const at50 = m.evaluateSubmissionRisk(normalFields({ company: "12345678", ua: "curl/8.0.1" }));
  assert.equal(at50.score, 50);
  assert.equal(at50.level, "low");
});

test("risk: 只係旗標，永不刪除／改變輸入，回傳形狀只有 level/score/reasons", () => {
  const fields = normalFields({
    company: "Iddnsn",
    companySite: "Hdhdbsh",
    systemInfo: "Ejznznxn",
    message: "Ixidjsnxnc",
    email: "cn@coffsec.con",
  });
  const snapshot = JSON.parse(JSON.stringify(fields));
  const r = m.evaluateSubmissionRisk(fields);
  assert.deepEqual(fields, snapshot, "輸入物件唔可以被改動");
  assert.deepEqual(Object.keys(r).sort(), ["level", "reasons", "score"]);
  assert.equal(r.level, "review");
  assert.ok(r.reasons.length > 0);
});

test("risk: score 0 只代表『冇已知內容訊號』，唔等於已認證真人", () => {
  const r = m.evaluateSubmissionRisk(normalFields());
  assert.equal(r.score, 0);
  // verified human 係另一個獨立判斷（verifyHumanToken），唔應由 score 推斷
  assert.ok(!("verified" in r));
});

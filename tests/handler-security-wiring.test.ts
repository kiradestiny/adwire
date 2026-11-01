import assert from "node:assert/strict";
const specifier = "../functions/send-mail.php.ts";
const { onRequest } = await import(specifier);

function storage() {
  const values = new Map<string, string>();
  return { values, async get(k: string) { return values.get(k) ?? null; }, async put(k: string, v: string) { values.set(k, v); } };
}

async function exercise(origin: string, withStorage = true, rawBody?: unknown, breakStorage = false) {
  const kv = storage();
  if (breakStorage) kv.get = async (): Promise<string | null> => { throw new Error("KV transient fixture failure"); };
  const captures: { url: string; body: string }[] = [];
  const previous = globalThis.fetch;
  globalThis.fetch = (async (url: unknown, init: RequestInit = {}) => {
    const u = String(url);
    captures.push({ url: u, body: typeof init.body === "string" ? init.body : "" });
    if (u === "https://challenges.cloudflare.com/turnstile/v0/siteverify") {
      return new Response(JSON.stringify({ success: true, hostname: new URL(origin).hostname }), { status: 200 });
    }
    if (u === "https://api.resend.com/emails") return new Response(JSON.stringify({ id: "email_fixture_id" }), { status: 200 });
    throw new Error("Unexpected outbound request in test");
  }) as typeof fetch;
  try {
    const req = new Request("https://adwire.com.hk/send-mail.php", {
      method: "POST", headers: { origin, "content-type": "application/json", "cf-connecting-ip": "203.0.113.20", "user-agent": "Mozilla/5.0" },
      body: JSON.stringify(rawBody === undefined ? { name: "示範公司同事", phone: "+852 9123 4567", email: "lead@example.com", company: "示範品牌", service: "SEO/GEO 搜尋引擎優化", message: "想了解服務\n請先用電郵聯絡", turnstileToken: "token_fixture", formStartedAt: Date.now() - 5000 } : rawBody),
    });
    Object.defineProperty(req, "cf", { value: { asn: 64512, asOrganization: "Example Network", country: "HK" } });
    const response = await onRequest({ request: req, env: { RESEND_API_KEY: "re_fixture_only", TURNSTILE_SECRET: "secret_fixture_only", ENQUIRIES: withStorage ? kv : undefined } });
    return { response, captures, kv };
  } finally { globalThis.fetch = previous; }
}

let failed = 0;
let ran = 0;
for (const [name, test] of [
  ["www allowed Origin verifies matching www token hostname", async () => {
    const { response, captures } = await exercise("https://www.adwire.com.hk");
    assert.equal(response.status, 200);
    assert.equal(captures.filter(c => c.url === "https://api.resend.com/emails").length, 1);
  }],
  ["missing enquiry storage fails closed without email", async () => {
    const { response, captures } = await exercise("https://adwire.com.hk", false);
    assert.equal(response.status, 503);
    assert.equal(captures.filter(c => c.url === "https://api.resend.com/emails").length, 0);
    assert.equal((await response.json() as { code: string }).code, "storage_unavailable");
  }],
  ["JSON primitives and arrays return a safe validation response", async () => {
    for (const body of [null, [], 123, "text"]) {
      const { response, captures } = await exercise("https://adwire.com.hk", true, body);
      assert.equal(response.status, 400);
      assert.equal(captures.length, 0);
    }
  }],
  ["storage read outage is an explicit safe response, never a send", async () => {
    const { response, captures } = await exercise("https://adwire.com.hk", true, undefined, true);
    assert.equal(response.status, 503);
    const body = await response.json() as { code: string; message: string };
    assert.equal(body.code, "storage_unavailable");
    assert.ok(!body.message.includes("KV transient fixture failure"));
    assert.equal(captures.filter(c => c.url === "https://api.resend.com/emails").length, 0);
  }],
  ["verified metadata is rendered once inside the email document", async () => {
    const { response, captures } = await exercise("https://adwire.com.hk");
    assert.equal(response.status, 200);
    const sent = captures.find(c => c.url === "https://api.resend.com/emails");
    assert.ok(sent);
    const { html, subject } = JSON.parse(sent.body) as { html: string; subject: string };
    assert.ok(html.includes("Turnstile 已通過"));
    assert.ok(!html.includes("未提供驗證結果"));
    assert.ok(html.trim().endsWith("</html>"), "No orphan metadata appended after HTML document");
    assert.equal((html.match(/安全與來源資訊/g) ?? []).length, 1);
    assert.ok(html.includes("Example Network"));
    assert.equal((html.match(/WhatsApp 回覆客戶/g) ?? []).length, 1, "Real handler must retain one follow-up CTA");
    assert.ok(html.includes('href="https://wa.me/85291234567"'), "CTA must use submitted customer phone, not agency number");
    assert.ok(html.indexOf("WhatsApp 回覆客戶") < html.indexOf("安全與來源資訊"));
    assert.ok(!subject.startsWith("[待確認]"));
  }],
] as Array<[string, () => Promise<void>]>) {
  ran++;
  try { await test(); console.log("PASS", name); }
  catch (error) { failed++; console.error("FAIL", name, error instanceof Error ? error.message : String(error)); }
}
console.log(`handler-security-wiring: ${ran - failed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;

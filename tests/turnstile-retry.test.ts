/**
 * tests/turnstile-retry.test.ts
 *
 * 1) lib/turnstile-retry.ts 單元測試（真實 helper，用最小假 API／spy，零 DOM、零 React）。
 * 2) 表單原始碼契約護欄：兩個表單都要「捕獲 render 回傳嘅 widget id」、
 *    只在「未確認成功」嘅失敗路徑呼叫共享 reset helper、
 *    成功跳轉路徑永唔 reset，並且 callback 會清走失效 token。
 *
 * 執行方式（同 repo 其他測試一致，Node 原生 type stripping、無測試框架）：
 *   node --experimental-strip-types tests/turnstile-retry.test.ts
 *
 * 背景 bug：Turnstile token 一次性、壽命 300 秒。舊版兩個表單喺伺服器／網絡
 * 失敗之後都冇 reset widget，重試會重用「已消耗」token → 每次重試必敗。
 * reset 一定要用 render() 當下回傳嘅精準 widget id，唔可以無參數 reset（會
 * 連人為／其他元件嘅 widget 一齊清走）。
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

type RetryModule = typeof import("../lib/turnstile-retry");

let counter = 0;
const load = (tag: string): Promise<RetryModule> =>
  import(`../lib/turnstile-retry.ts?case=${tag}&n=${counter++}`) as Promise<RetryModule>;

/** 可變 ref（模擬 React useRef）。 */
const ref = <T>(value: T) => ({ current: value });

/** 記錄 reset 呼叫參數嘅最小假 Turnstile API（唔會接觸任何真實／網絡資源）。 */
function spyApi() {
  const calls: (string | undefined)[] = [];
  return {
    calls,
    api: {
      reset: (widgetId?: string) => {
        calls.push(widgetId);
      },
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// A. helper 行為：清 token／failed ＋ 精準 reset
// ─────────────────────────────────────────────────────────────────────────────
test("清走已消耗／過期 token、重設 failed flag，並以精準 widgetId 呼叫 reset", async () => {
  const { resetTurnstileAfterFailure } = await load("reset-ok");
  const token = ref("consumed-token");
  const failed = ref(true);
  const { api, calls } = spyApi();

  const didReset = resetTurnstileAfterFailure({ token, failed }, "widget-abc", api);

  assert.equal(didReset, true, "有 widget id ＋ API → 應該真的呼叫 reset");
  assert.equal(token.current, "", "一次性／已用 token 必須清空，唔可以再重用");
  assert.equal(failed.current, false, "清 failed 令重置後嘅 widget 可以再等新 token");
  assert.deepEqual(calls, ["widget-abc"], "只可以 reset 捕獲嘅嗰個 widget");
});

test("冇 widget id（widget 未 render）→ 唔呼叫 reset，但照樣清 token／failed", async () => {
  const { resetTurnstileAfterFailure } = await load("no-widget");

  for (const id of [null, undefined, ""] as (string | null | undefined)[]) {
    const token = ref("stale-token");
    const failed = ref(true);
    const { api, calls } = spyApi();

    const didReset = resetTurnstileAfterFailure({ token, failed }, id, api);

    assert.equal(didReset, false, `widgetId=${String(id)} 唔應該 reset`);
    assert.equal(token.current, "", "冇 widget 都必須清走 stale token");
    assert.equal(failed.current, false, "冇 widget 都必須清 failed flag");
    assert.equal(calls.length, 0, `widgetId=${String(id)} 時 reset 呼叫次數應為 0`);
  }
});

test("冇 Turnstile API／缺 reset 方法 → 安全略過，永不拋錯", async () => {
  const { resetTurnstileAfterFailure } = await load("no-api");

  const token = ref("stale");
  const failed = ref(true);
  assert.doesNotThrow(() => resetTurnstileAfterFailure({ token, failed }, "w1", null));
  assert.equal(token.current, "");
  assert.equal(failed.current, false);

  const noReset = {} as unknown as { reset?: (widgetId?: string) => void };
  assert.doesNotThrow(() =>
    resetTurnstileAfterFailure(
      { token: ref("x"), failed: ref(false) },
      "w1",
      noReset as unknown as import("../lib/turnstile-retry").TurnstileResetApi
    )
  );
});

test("reset 拋錯 → helper 吞掉錯誤，仍然清 refs（提交流程唔可以因 reset 失敗而中斷）", async () => {
  const { resetTurnstileAfterFailure } = await load("reset-throw");
  const token = ref("stale");
  const failed = ref(true);
  const api = {
    reset: () => {
      throw new Error("turnstile boom");
    },
  };

  let result: boolean | null = null;
  assert.doesNotThrow(() => {
    result = resetTurnstileAfterFailure({ token, failed }, "w1", api);
  });
  assert.equal(result, false, "reset 失敗 → 回報 false");
  assert.equal(token.current, "", "refs 仍然要清");
  assert.equal(failed.current, false);
});

test("永不以空參數呼叫 reset（唔可以全域 reset 所有 widget）", async () => {
  const { resetTurnstileAfterFailure } = await load("exact-id");
  const { api, calls } = spyApi();

  resetTurnstileAfterFailure({ token: ref("stale"), failed: ref(false) }, "EXACT-WIDGET-123", api);

  assert.equal(calls.length, 1);
  assert.equal(calls[0], "EXACT-WIDGET-123", "傳入嘅係捕獲到嘅完整 id，未被改寫");
  assert.notEqual(calls[0], undefined, "唔可以無參數呼叫（等於 reset 所有 widget）");
});

// ─────────────────────────────────────────────────────────────────────────────
// B. helper 原始碼契約：只用 reset(widgetId)，冇無參數 reset、冇偽造 token
// ─────────────────────────────────────────────────────────────────────────────
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ") // /* … */（含 JSX {/* … */}）
    .replace(/(^|[^:"'])\/\/[^\n]*/g, "$1"); // // …（避開 https:// 同字串內嘅 //）
}

test("helper 原始碼：呼叫 reset(widgetId)，冇無參數 reset、冇寫入偽造 token", () => {
  const code = stripComments(readFileSync(path.join(process.cwd(), "lib/turnstile-retry.ts"), "utf8"));

  assert.match(code, /\.reset\(\s*widgetId\s*\)/, "必須用捕獲嘅 widgetId 呼叫 reset");
  assert.equal(/\.reset\(\s*\)/.test(code), false, "唔可以有無參數 reset（會清走所有 widget）");
  assert.equal(
    /[Tt]oken\w*Ref\.current\s*=\s*["'`][^"'`]/.test(code),
    false,
    "唔可以寫入偽造／非空 token（只可以清空為 \"\"）"
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// C. 兩個表單的原始碼契約（ContactSection ＋ AssessmentLeadForm）
// ─────────────────────────────────────────────────────────────────────────────
const readCode = (rel: string) => stripComments(readFileSync(path.join(process.cwd(), rel), "utf8"));

const FORMS = [
  { name: "ContactSection", file: "components/ContactSection.tsx" },
  { name: "AssessmentLeadForm", file: "app/start/AssessmentLeadForm.tsx" },
];

for (const { name, file } of FORMS) {
  test(`${name}：捕獲 render() 回傳嘅 widget id，並透過共享 helper 做 reset`, () => {
    const code = readCode(file);
    assert.ok(
      code.includes('from "@/lib/turnstile-retry"'),
      "必須改用共享 helper（唔可以喺元件內自己重新實現 reset）"
    );
    assert.match(
      code,
      /[Ww]idgetIdRef\.current\s*=\s*[^\n]*\.render\(/,
      "必須把 render() 回傳嘅 widget id 存起（用於精準 reset）"
    );
  });

  test(`${name}：只有失敗（catch）路徑才 reset，成功跳轉路徑唔會 reset`, () => {
    const code = readCode(file);

    const calls = code.match(/resetTurnstileAfterFailure\(/g) || [];
    assert.equal(calls.length, 1, "reset 只可以有一個呼叫點（喺 catch 內）");

    assert.match(code, /catch[\s\S]*resetTurnstileAfterFailure\(/, "reset 必須喺 catch（失敗）路徑");
    assert.ok(
      code.indexOf("resetTurnstileAfterFailure(") > code.indexOf('router.push("/thank-you/")'),
      "reset 唔可以喺成功跳轉之前／同路徑"
    );
    assert.match(
      code,
      /if\s*\(\s*!\s*\w*[Cc]onfirmed\s*\)\s*\{\s*resetTurnstileAfterFailure\(/,
      "reset 要以「未確認成功」為守衛（後端成功就唔應該 reset）"
    );
    assert.match(
      code,
      /isConfirmedSubmission[\s\S]{0,240}?\w*[Cc]onfirmed\s*=\s*true/,
      "成功分支要標記 confirmed，先至可以阻止成功路徑 reset"
    );
  });

  test(`${name}：callback 清走失效 token，新 token 令 widget 重新可用`, () => {
    const code = readCode(file);
    assert.match(
      code,
      /"expired-callback"[\s\S]{0,200}?[Tt]oken\w*Ref\.current\s*=\s*""/,
      "token 過期 → 必須清走（唔可以當仲有效）"
    );
    assert.match(
      code,
      /"error-callback"[\s\S]{0,200}?[Tt]oken\w*Ref\.current\s*=\s*""/,
      "widget 出錯 → 必須清走已失效 token"
    );
    assert.match(
      code,
      /callback[\s\S]{0,300}?failed\w*Ref\.current\s*=\s*false/i,
      "新 token 一到要清 failed flag，令重置後嘅 widget 再次可用"
    );
  });
}

test("MIN_FORM_FILL 值維持不變（唔可以順手改動業務邏輯）", () => {
  assert.match(readCode("components/ContactSection.tsx"), /MIN_FORM_FILL_MS\s*=\s*4_000/);
  assert.match(readCode("app/start/AssessmentLeadForm.tsx"), /MIN_FORM_FILL_MS\s*=\s*3_000/);
});

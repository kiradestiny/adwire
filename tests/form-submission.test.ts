/**
 * tests/form-submission.test.ts — lib/form-submission.ts 單元測試
 *
 * 執行方式（Node 原生 type stripping，repo 未安裝測試框架）：
 *   node --experimental-strip-types --test tests/form-submission.test.ts
 *
 * 為何用動態 import：同 tests/assessment.test.ts 一致 —— Node ESM 需要顯式 .ts 副檔名，
 * 但 tsconfig 未啟用 allowImportingTsExtensions，所以型別走 extensionless 的
 * `import type`（執行時抹除），執行時才用計算出嘅字串動態 import 真正模組。
 *
 * 為何每個測試都加 cache-busting query：module 級嘅 in-memory receipt 係刻意設計
 * （同一個 document 內權威），但測試之間必須互不污染，所以每個 case 取一個「乾淨模組」。
 *
 * 本測試只驗純函式／記憶體＋storage 行為，唔會呼叫後端（fetch／CRM／mail 一律零接觸）。
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

import type { KeyValueStorage } from "../lib/form-submission";

type FormSubmissionModule = typeof import("../lib/form-submission");

let counter = 0;
const load = (tag: string): Promise<FormSubmissionModule> =>
  import(`../lib/form-submission.ts?case=${tag}&n=${counter++}`) as Promise<FormSubmissionModule>;

/** 正常可用的 storage（用 Map 模擬，行為同 Web Storage 一致）。 */
function workingStorage(seed: Record<string, string> = {}) {
  const map = new Map<string, string>(Object.entries(seed));
  const storage: KeyValueStorage = {
    getItem: (key) => (map.has(key) ? (map.get(key) as string) : null),
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
  return { storage, map };
}

/** 被封鎖的 storage：連 getItem／setItem／removeItem 都 throw（無痕／封 cookie／企業政策）。 */
function blockedStorage(): KeyValueStorage {
  const boom = () => {
    throw new Error("SecurityError: storage is blocked");
  };
  return {
    getItem: boom,
    setItem: boom,
    removeItem: boom,
  } as unknown as KeyValueStorage;
}

const RECEIPT_KEY = "adwire_form_submitted";

// ─────────────────────────────────────────────────────────────────────────────
// 1. 只有真正成功嘅回應才算 lead（防止假 lead）
// ─────────────────────────────────────────────────────────────────────────────
test("isConfirmedSubmission：只有 HTTP 成功 + success:true 才算收到 lead", async () => {
  const { isConfirmedSubmission } = await load("confirmed");

  assert.equal(isConfirmedSubmission({ httpOk: true, success: true }), true);
  // 429／後端硬性拒收：回 200 但 success:false 唔算
  assert.equal(isConfirmedSubmission({ httpOk: true, success: false }), false);
  // 5xx／網絡層錯但 body 剛好有 success → 唔算
  assert.equal(isConfirmedSubmission({ httpOk: false, success: true }), false);
  assert.equal(isConfirmedSubmission({ httpOk: false, success: false }), false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. 記憶體 receipt：consume 只回一次 true（lead conversion 只觸發一次）
// ─────────────────────────────────────────────────────────────────────────────
test("markFormSubmitted → consumeFormSubmitted 只回 true 一次", async () => {
  const { markFormSubmitted, consumeFormSubmitted } = await load("once");
  const { storage, map } = workingStorage();

  markFormSubmitted(storage);

  assert.equal(consumeFormSubmitted(storage), true, "第一次 consume 應該確認成功");
  assert.equal(consumeFormSubmitted(storage), false, "第二次 consume 唔可以再觸發");
  assert.equal(map.has(RECEIPT_KEY), false, "consume 之後要清走 storage receipt");
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. 核心 bug：storage 被封鎖唔可以令「已成功」變成「失敗」
// ─────────────────────────────────────────────────────────────────────────────
test("storage 被封鎖（setItem/getItem/removeItem 全部 throw）→ 不拋錯、仍確認一次成功", async () => {
  const { markFormSubmitted, consumeFormSubmitted } = await load("blocked-success");
  const storage = blockedStorage();

  // 舊版就係呢一步 throw → 落入 catch → 客人見到「發送失敗」
  assert.doesNotThrow(() => markFormSubmitted(storage));

  // 同一個 document（client route push）內仍然確認成功 → 客戶端跳轉路徑不受影響
  assert.equal(consumeFormSubmitted(storage), true);
  assert.equal(consumeFormSubmitted(storage), false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. 直接開啟 /thank-you/（無 receipt）→ 唔可以觸發 lead conversion
// ─────────────────────────────────────────────────────────────────────────────
test("直接開啟 /thank-you/：無 receipt（storage 可用但空）→ consume 回 false", async () => {
  const { consumeFormSubmitted } = await load("direct-empty");
  const { storage } = workingStorage();

  assert.equal(consumeFormSubmitted(storage), false, "直接開啟唔可以算一次 conversion");
});

test("直接開啟 /thank-you/：storage 讀取 throw → consume 回 false 且不拋 page error", async () => {
  const { consumeFormSubmitted } = await load("direct-blocked");
  const storage = blockedStorage();

  let result: boolean | null = null;
  assert.doesNotThrow(() => {
    result = consumeFormSubmitted(storage);
  });
  assert.equal(result, false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. reload 情境：storage 仍留 receipt（記憶體已清）
// ─────────────────────────────────────────────────────────────────────────────
test("reload：storage 仍有 receipt → consume 回 true 一次，並清掉 key", async () => {
  const { consumeFormSubmitted } = await load("reload-receipt");
  const { storage, map } = workingStorage({ [RECEIPT_KEY]: "1" });

  assert.equal(consumeFormSubmitted(storage), true);
  assert.equal(map.has(RECEIPT_KEY), false, "確認後即清走，避免重複觸發");
  assert.equal(consumeFormSubmitted(storage), false, "reload 後再 consume 唔會再成功");
});

test("reload：storage 可用但 receipt 已被清走 → consume 回 false（可接受，元件會 redirect）", async () => {
  const { consumeFormSubmitted } = await load("reload-cleared");
  const { storage } = workingStorage();

  assert.equal(consumeFormSubmitted(storage), false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 5b. 已消耗 receipt 必須「同一 document 內只回一次」，即使 removeItem 被封鎖
//     （舊版 bug：remove 失敗 → storage 仍讀到 receipt → 每次 consume 都 true
//      → 重複觸發 lead conversion）
// ─────────────────────────────────────────────────────────────────────────────
/** removeItem 被封鎖嘅 storage（receipt 仍在，setItem 正常）：模擬無痕／封 site data。 */
function removeBlockedStorage(seed: Record<string, string> = {}) {
  const map = new Map<string, string>(Object.entries(seed));
  const storage: KeyValueStorage = {
    getItem: (key) => (map.has(key) ? (map.get(key) as string) : null),
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: () => {
      throw new Error("SecurityError: removeItem blocked");
    },
  };
  return { storage, map };
}

test("storage fallback（記憶體無 receipt、removeItem 被封鎖）→ consume 只可以回一次 true", async () => {
  const { consumeFormSubmitted } = await load("fallback-remove-blocked");
  const { storage, map } = removeBlockedStorage({ [RECEIPT_KEY]: "1" });

  assert.equal(consumeFormSubmitted(storage), true, "第一次 = 已確認成功");
  assert.equal(
    consumeFormSubmitted(storage),
    false,
    "removeItem 失敗時 storage 仍留 receipt，但同一 document 內唔可以再確認一次"
  );
  assert.equal(consumeFormSubmitted(storage), false, "第三次亦唔可以");
  assert.equal(map.has(RECEIPT_KEY), true, "確認 remove 真的被封鎖（測試前提成立）");
});

test("storage fallback ＋ 重複 mark：每次 mark 之後只可以消耗一次", async () => {
  const { markFormSubmitted, consumeFormSubmitted } = await load("fallback-repeat-mark");
  const { storage } = removeBlockedStorage({ [RECEIPT_KEY]: "1" });

  // 第一次由 storage fallback 確認
  assert.equal(consumeFormSubmitted(storage), true);
  assert.equal(consumeFormSubmitted(storage), false);

  // 新一次真正成功送出 → mark 必須重置（新 receipt 應該再確認一次）
  markFormSubmitted(storage);
  assert.equal(consumeFormSubmitted(storage), true, "新 mark 之後應該再確認一次");
  assert.equal(consumeFormSubmitted(storage), false, "但仍然只可以一次");
});

test("重複 mark（storage 全封鎖）：每次 mark 之後只可以消耗一次", async () => {
  const { markFormSubmitted, consumeFormSubmitted } = await load("blocked-repeat-mark");
  const storage = blockedStorage();

  markFormSubmitted(storage);
  assert.equal(consumeFormSubmitted(storage), true);
  assert.equal(consumeFormSubmitted(storage), false);

  markFormSubmitted(storage);
  assert.equal(consumeFormSubmitted(storage), true, "新 mark 應該重新開放一次");
  assert.equal(consumeFormSubmitted(storage), false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 5c. storage 內非 "1" 嘅值唔算 receipt（避免任何真值都當成功）
// ─────────────────────────────────────────────────────────────────────────────
test("storage 內係 '0'／'yes' 等非 '1' 值 → 唔算 receipt", async () => {
  const m1 = await load("stored-zero");
  const { storage: zero } = workingStorage({ [RECEIPT_KEY]: "0" });
  assert.equal(m1.consumeFormSubmitted(zero), false, "'0' 唔可以當成成功 receipt");

  const m2 = await load("stored-yes");
  const { storage: yes } = workingStorage({ [RECEIPT_KEY]: "yes" });
  assert.equal(m2.consumeFormSubmitted(yes), false, "'yes' 唔可以當成成功 receipt");
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. 無 window（SSR／Node 環境）都要安全
// ─────────────────────────────────────────────────────────────────────────────
test("無 window：預設 storage 為 null，函式不拋錯", async () => {
  const { browserSessionStorage, browserLocalStorage, markFormSubmitted, consumeFormSubmitted } =
    await load("no-window");

  assert.equal(typeof window, "undefined", "此測試假定跑在 Node（無 DOM）");
  assert.equal(browserSessionStorage(), null);
  assert.equal(browserLocalStorage(), null);

  assert.doesNotThrow(() => markFormSubmitted());
  assert.equal(consumeFormSubmitted(), true, "同一 document 內仍確認成功");
  assert.equal(consumeFormSubmitted(), false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. safeStorage* 輔助函式：任何 storage 例外都唔向外拋
// ─────────────────────────────────────────────────────────────────────────────
test("safeStorage*：被封鎖或 null 時回安全預設值，永不拋錯", async () => {
  const { safeStorageRead, safeStorageWrite, safeStorageRemove } = await load("safe-helpers");
  const blocked = blockedStorage();

  assert.equal(safeStorageWrite(blocked, "k", "v"), false);
  assert.equal(safeStorageRead(blocked, "k"), null);
  assert.doesNotThrow(() => safeStorageRemove(blocked, "k"));

  assert.equal(safeStorageWrite(null, "k", "v"), false);
  assert.equal(safeStorageRead(null, "k"), null);
  assert.doesNotThrow(() => safeStorageRemove(null, "k"));
  assert.equal(safeStorageRead(undefined, "k"), null);
});

test("safeStorage*：可用 storage 正常讀寫（cooldown 等用途）", async () => {
  const { safeStorageRead, safeStorageWrite, safeStorageRemove } = await load("safe-helpers-ok");
  const { storage } = workingStorage();

  assert.equal(safeStorageWrite(storage, "adwire_contact_submit_cooldown_until", "123"), true);
  assert.equal(safeStorageRead(storage, "adwire_contact_submit_cooldown_until"), "123");
  safeStorageRemove(storage, "adwire_contact_submit_cooldown_until");
  assert.equal(safeStorageRead(storage, "adwire_contact_submit_cooldown_until"), null);
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. 原始碼層回歸護欄：案例頁唔可以用「建置／瀏覽當下日期」當最後更新
//    （SSR 與 client 會算出唔同字串 → React hydration mismatch #418，全部案例頁中招）
// ─────────────────────────────────────────────────────────────────────────────
/** 只檢查真正會執行嘅程式碼：本 repo 刻意保留大量粵語註解，唔應該被斷言當成程式碼。 */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ") // /* … */（JSX 嘅 {/* … */} 亦一併覆蓋）
    .replace(/(^|[^:"])\/\/[^\n]*/g, "$1"); // // …（避開 https:// 同字串內嘅 //）
}

test("CaseStudyContent：唔可以再用當下日期做「最後更新」（hydration mismatch 來源）", () => {
  const file = path.join(process.cwd(), "app/portfolio/[slug]/CaseStudyContent.tsx");
  const code = stripComments(readFileSync(file, "utf8"));

  assert.equal(
    /toLocaleDateString|toLocaleString|new Date\(\s*\)/.test(code),
    false,
    "案例頁不得在建置／瀏覽當下取日期（SSR 與 client 會不一致）"
  );
  assert.equal(
    code.includes("最後更新"),
    false,
    "冇已驗證嘅 updatedAt 就不要顯示「最後更新」列（不可用建置日期冒充）"
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. 原始碼層回歸護欄：ThankYouContent 嘅 receipt 守衛唔可以攔住倒計時 timer
//    舊版 `if (handledRef.current) return;` 包住整個 effect —— React StrictMode
//    開發模式第二次 run 會直接 early return，timer 永遠唔會重建（倒計時停死），
//    同時間 receipt 亦唔應該再被消耗／再 push 追蹤事件。
//    動態行為（真·StrictMode 雙次執行）由瀏覽器驗證覆蓋。
// ─────────────────────────────────────────────────────────────────────────────
test("ThankYouContent：receipt／追蹤守衛唔可以連 timer setup 一齊攔（StrictMode 倒計時停死 bug）", () => {
  const file = path.join(process.cwd(), "app/thank-you/ThankYouContent.tsx");
  const code = stripComments(readFileSync(file, "utf8"));

  assert.equal(
    /if\s*\(\s*handledRef\.current\s*\)\s*return/.test(code),
    false,
    "守衛唔可以包住整個 effect（第二次 StrictMode run 會導致 timer 永遠唔重建）"
  );
  assert.match(
    code,
    /if\s*\(\s*!handledRef\.current\s*\)/,
    "receipt／追蹤只可以喺第一次 run 做（一次性守衛要包住嗰兩段）"
  );
  assert.match(
    code,
    /if\s*\(\s*!confirmedRef\.current\s*\)\s*return/,
    "冇 confirmed receipt（直接開 /thank-you/）唔應該起 timer"
  );

  // 每次 setup 都要有 timer ＋ 對應 cleanup
  assert.match(code, /const timer = setInterval\(/, "timer 必須喺守衛之後每次 setup 都建立");
  assert.match(code, /return\s*\(\)\s*=>\s*clearInterval\(timer\)/, "timer cleanup 仍要保留");

  // 追蹤內容／conversion 設定唔可以順手改（唔可以變假 lead、唔可以再 POST）
  assert.ok(code.includes('event: "generate_lead"'), "GA4 generate_lead 事件要保留原樣");
  assert.ok(
    code.includes("AW-16621944778/m2HhCM33xLQaEMr_-vU9"),
    "Google Ads conversion label 要保留原樣"
  );
  assert.ok(
    !/fetch\s*\(|XMLHttpRequest|navigator\.sendBeacon/.test(code),
    "Thank You 頁唔可以有自家網絡提交（lead 只可以由表單頁送出）"
  );
  assert.equal(/new Date\(/.test(code), false, "冇已驗證嘅日期就不要顯示（不可用建置日期冒充）");
});

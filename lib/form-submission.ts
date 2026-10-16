/**
 * lib/form-submission.ts
 *
 * 表單送出「已確認成功」receipt ＋ 安全 storage 輔助（只供 "use client" 元件使用）。
 *
 * ── 為何要獨立一份 ─────────────────────────────────────────────────────────
 *   1) sessionStorage 可能被封鎖（無痕模式、封鎖 cookie／site data、企業政策），
 *      一讀一寫就 throw。舊版喺 fetch 成功之後直接
 *      `sessionStorage.setItem("adwire_form_submitted", "1")`，一旦 throw 就會
 *      落入 catch 分支 → 客人明明成功送出、後台已經收到 lead，畫面卻顯示
 *      「發送失敗，請稍後再試」。呢個係「成功被誤報成失敗」。
 *   2) /thank-you/ 舊版喺 effect 內直接 `sessionStorage.getItem(...)`，
 *      throw 就變成未處理例外（page error），連轉換追蹤都跑唔到。
 *
 * ── 設計 ─────────────────────────────────────────────────────────────────
 *   · 表單跳 /thank-you/ 係 client-side route push（同一個 document），所以
 *     「已確認成功」可以只存在於記憶體；受影響頁面因此一定認得。
 *   · sessionStorage 只係額外保險（reload 後仍然認得係合法提交）。
 *   · 任何 storage 例外一律吞掉：storage 只係輔助，唔可以改變「已成功」嘅事實。
 *
 * ── 契約 ─────────────────────────────────────────────────────────────────
 *   · markFormSubmitted() 只可以在「真正收到成功回應」之後呼叫
 *     （判斷條件用 isConfirmedSubmission：HTTP 成功 且 body success:true）。
 *   · consumeFormSubmitted() 每次確認成功只回一次 true，避免重複觸發 lead conversion。
 *   · 完全冇 receipt（例如直接開 /thank-you/）→ 回 false，呼叫方必須唔好觸發轉換。
 */

/** 舊有 key，沿用唔改（外部／其他頁面可能引用同一字串）。 */
export const SUBMISSION_RECEIPT_KEY = "adwire_form_submitted";

/** Web Storage 的最小介面（方便注入假 storage 測試，唔需要 DOM）。 */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * 取得瀏覽器 storage。留意：封印 cookie／site data 時，
 * **連讀 `window.sessionStorage` 本身都可以 throw**，所以整個取得過程都要包住。
 */
function browserStorage(kind: "session" | "local"): KeyValueStorage | null {
  try {
    if (typeof window === "undefined") return null;
    const storage = kind === "session" ? window.sessionStorage : window.localStorage;
    return storage ?? null;
  } catch {
    return null;
  }
}

/** sessionStorage 或 null（被封鎖／SSR）。 */
export function browserSessionStorage(): KeyValueStorage | null {
  return browserStorage("session");
}

/** localStorage 或 null（被封鎖／SSR）。 */
export function browserLocalStorage(): KeyValueStorage | null {
  return browserStorage("local");
}

/** 讀取，任何例外回 null。 */
export function safeStorageRead(
  storage: KeyValueStorage | null | undefined,
  key: string
): string | null {
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

/** 寫入，成功回 true；被封鎖／超過配額回 false（永不拋錯）。 */
export function safeStorageWrite(
  storage: KeyValueStorage | null | undefined,
  key: string,
  value: string
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/** 刪除，任何例外都略過。 */
export function safeStorageRemove(storage: KeyValueStorage | null | undefined, key: string): void {
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    /* 略過：刪唔到唔影響流程（receipt 本來就係一次性） */
  }
}

/**
 * 只有「HTTP 成功」而且「回應 success:true」才算真正收到 lead。
 * 其餘一律唔算 —— 包括後端評分後回 200 但 success:false、429 冷卻、5xx、網絡錯誤。
 */
export function isConfirmedSubmission(response: { httpOk: boolean; success: boolean }): boolean {
  return response.httpOk === true && response.success === true;
}

/**
 * 同一個 document 內嘅權威 receipt。
 * 表單頁 → /thank-you/ 係 client-side route push，JS 環境同一個，所以呢個 flag 一定見到。
 */
let confirmedInDocument = false;

/**
 * 同一個 document 內「已經消耗過 receipt」嘅墓碑（tombstone）。
 *
 * 為何需要：storage 有機會「讀到但刪唔到」（無痕模式／封 site data 之下
 * removeItem 可以 throw，而 getItem 仍然正常）。若果只靠清 storage 去防重複，
 * 一旦 removeItem 失敗，storage fallback 每次都會再讀到 receipt → 重複觸發
 * lead conversion。墓碑令「同一個 document 內只回一次 true」唔再取決於 storage 寫入。
 *
 * 限制（已知、可接受）：墓碑只存在於記憶體，reload 之後會消失。如果 removeItem
 * 一直失敗，reload 後 storage 仍留有 receipt → 會再確認一次。呢個係 best-effort，
 * 唔可以宣稱跨 reload 都保證 exactly-once。
 */
let consumedInDocument = false;

/** 標記「已確認成功」。只可以在成功回應之後呼叫；storage 只作 best-effort 保險。 */
export function markFormSubmitted(storage: KeyValueStorage | null = browserSessionStorage()): void {
  confirmedInDocument = true;
  // 新一次成功送出 → 清走舊墓碑，令新 receipt 可以（且只可以）再確認一次。
  consumedInDocument = false;
  safeStorageWrite(storage, SUBMISSION_RECEIPT_KEY, "1");
}

/**
 * 取出（並消耗）「已確認成功」receipt。
 * 每次成功只回一次 true；冇 receipt 時回 false，呼叫方不可觸發 lead conversion。
 */
export function consumeFormSubmitted(
  storage: KeyValueStorage | null = browserSessionStorage()
): boolean {
  if (confirmedInDocument) {
    confirmedInDocument = false;
    consumedInDocument = true;
    safeStorageRemove(storage, SUBMISSION_RECEIPT_KEY);
    return true;
  }

  // 同一個 document 已經消耗過 → storage fallback 唔可以再確認（即使 remove 失敗）。
  if (consumedInDocument) return false;

  const stored = safeStorageRead(storage, SUBMISSION_RECEIPT_KEY);
  // 只有明確嘅 "1" 才算 receipt（避免任何真值都當成成功）。
  if (stored !== "1") return false;

  consumedInDocument = true;
  safeStorageRemove(storage, SUBMISSION_RECEIPT_KEY);
  return true;
}

/**
 * lib/turnstile-retry.ts
 *
 * 共用（純函式）helper：一次過清理 Turnstile 嘅「已消耗 token」同「失敗標記」，
 * 並且喺掌握到精準 widget id 時呼叫官方 `turnstile.reset(widgetId)`。
 *
 * ── 為何需要 ────────────────────────────────────────────────────────────────
 *   Turnstile token 係「一次性」而且壽命只有 300 秒。當伺服器／網絡層面令一次
 *   提交失敗（send-mail.php 5xx、429、網絡斷線、回應格式錯誤），個 token 其實
 *   已經被消耗。舊版兩個表單（ContactSection、AssessmentLeadForm）喺 catch 之後
 *   都冇 reset widget，客人一按重試就會重用同一個已消耗 token → 每次都失敗。
 *
 * ── 安全邊界（唔可以越界）────────────────────────────────────────────────
 *   · 只用 `render()` 當下回傳嘅「精準 widget id」呼叫 reset；
 *     永遠唔會無參數呼叫 `reset()`（咁樣會連人為／其他元件嘅 widget 一齊清走）。
 *   · 完全唔會偽造／注入 token —— 只會把 ref 清空為 ""，新 token 一律由
 *     Cloudflare callback 提供。
 *   · 冇 widget id（widget 未 render）或冇 API → 靜默略過，永不拋錯；
 *     提交流程唔可以因為 reset 失敗而中斷。
 */

/** 可變字串 ref（相容 React `useRef<string>`）。 */
export type TokenRef = { current: string };
/** 可變布林 ref（相容 React `useRef<boolean>`）。 */
export type FailedRef = { current: boolean };

/** Turnstile 官方客戶端 API 嘅最小介面（只需要 reset）。 */
export interface TurnstileResetApi {
  reset(widgetId?: string): void;
}

/**
 * 失敗（伺服器／網絡／格式）之後重置 Turnstile。
 *
 * @param refs    表單持有嘅 token ref 同 failed ref
 * @param widgetId `render()` 回傳並捕獲嘅 widget id（冇就傳 null／undefined）
 * @param api     全域 `window.turnstile`（或等價物件）；可能未載入 → 傳 undefined
 * @returns 有真正呼叫 `api.reset(widgetId)` 才回 `true`
 */
export function resetTurnstileAfterFailure(
  refs: { token: TokenRef; failed: FailedRef },
  widgetId: string | null | undefined,
  api: TurnstileResetApi | null | undefined
): boolean {
  // 已消耗／失效嘅 token 一律清空，唔可以留低俾下一次提交重用。
  refs.token.current = "";
  // 清 failed flag：widget 重置後會經 callback 派新 token，要可以再等。
  refs.failed.current = false;

  if (!widgetId || !api || typeof api.reset !== "function") return false;

  try {
    api.reset(widgetId);
    return true;
  } catch {
    // reset 失敗唔可以影響表單流程（best-effort）。
    return false;
  }
}

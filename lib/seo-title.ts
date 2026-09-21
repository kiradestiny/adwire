/**
 * seo-title.ts — SEO 標題正規化
 *
 * 為何需要這個（2026-09-21 發現的真實問題）：
 *
 *   `app/layout.tsx` 設定了 title template：
 *       template: "%s | ADWire Agency"
 *
 *   即任何頁面傳入的 title 都會自動加上品牌尾綴。但後台 CMS 的
 *   `seoTitle` 欄位，編輯人員往往會【連品牌尾綴一齊輸入】。結果：
 *
 *       後台輸入：  AI 辦公效率工具開發案例 | Google Gemini | ADWire Agency
 *       前端輸出：  AI 辦公效率工具開發案例 | Google Gemini | ADWire Agency | ADWire Agency
 *
 *   2026-09-21 在 CI build 的出街前閘門攔到 16 個 portfolio 頁面都有
 *   這個問題，另有 blog 標題因此超出 62 字被 Google 截斷。
 *
 *   本機 build 見不到這個問題，是因為本機連不到後台 API，用了乾淨的
 *   本地 fallback；CI 連得到 API，才會把後台資料帶進來。
 *
 * 為何在資料層修正而非改後台 16 筆資料：
 *   1. 這是【顯示邏輯】問題，不是資料錯誤。同一個後台標題，在
 *      template 之下應該輸出一次品牌名。
 *   2. 在資料層修正，日後編輯人員無論連尾綴一齊輸入、抑或唔輸入，
 *      輸出都會正確，不需要靠人記住格式。
 *   3. 不需要改動正式後台資料（用戶規定操作 CRM 需先取得批准）。
 */

/** 品牌尾綴的各種寫法：半形／全形直線、有無 Agency、有無空格。 */
const BRAND_SUFFIX_RE = /\s*[|｜]\s*ADWire(?:\s+Agency)?\s*$/i;

/**
 * 移除標題尾部的品牌名稱。
 *
 * 會【重複執行】直至沒有尾綴為止，因為後台資料可能已經被疊加了兩次
 * （歷史上確實出現過 `| ADWire Agency | ADWire Agency`）。
 *
 * @example
 *   stripBrandSuffix("網店自動化案例 | ADWire Agency")        // "網店自動化案例"
 *   stripBrandSuffix("網店自動化案例 | ADWire Agency | ADWire Agency") // "網店自動化案例"
 *   stripBrandSuffix("網店自動化案例")                          // "網店自動化案例"
 */
export function stripBrandSuffix(input: string | null | undefined): string {
  let out = (input ?? '').trim();
  for (;;) {
    const next = out.replace(BRAND_SUFFIX_RE, '').trim();
    if (next === out) return out;
    out = next;
  }
}

/**
 * 正規化要交給 Next.js title template 的標題。
 *
 * 除了移除重複尾綴，亦會把連續空白收窄，避免後台輸入造成的排版問題。
 */
export function normalizeSeoTitle(input: string | null | undefined): string {
  return stripBrandSuffix(input).replace(/\s{2,}/g, ' ');
}

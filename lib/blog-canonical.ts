/**
 * Blog slug 正規化（canonical 去重）
 *
 * 背景（2026-10-24 實測）：後台 DB 內仍保留一批舊 slug（無年份，例如
 * `ai-agent-hong-kong-business-guide`），而 repo 內是新版（帶年份，
 * `ai-agent-hong-kong-business-guide-2026`）。兩者都會被 build 出來、
 * 都回 200、都 `index, follow`、canonical 各自指自己 —— GSC 90 日內
 * 25 對 URL 同時有曝光，等於自己搶自己排名。
 *
 * 本模組只做一件事：同一主題（去掉結尾年份後相同）存在多個 slug 時，
 * 指出應該代表該主題的那一個。**不改 URL、不刪頁、不 301**，所以完全
 * 可逆；之後確認內容新舊再決定是否真的 301。
 */

const YEAR_SUFFIX = /-20\d{2}$/;

/** 去掉結尾的 `-20XX`，取得主題鍵 */
export function topicKey(slug: string): string {
  return slug.replace(YEAR_SUFFIX, "");
}

/**
 * 在全部 slug 中找出應該代表此主題的 canonical slug。
 *
 * 規則（可預測、可測試）：
 * 1. 沒有同主題兄弟 → 回自己（大部分文章屬此情況）。
 * 2. 有兄弟時，優先選「不帶年份」的版本 —— 因為 public/.htaccess 已把
 *    `-2026` 一律 301 去無年份版本，站方的正式 URL 就是無年份那個。
 *    若 canonical 指向帶年份版本，等於指向一個會被 301 的網址（信號自相矛盾）。
 * 3. 若全部兄弟都帶年份（沒有無年份版本）→ 取最大年份。
 * 4. 以上皆非 → 回自己，避免誤指。
 *
 * 注意：此規則必須同 .htaccess / _redirects 的 301 方向保持一致，
 * 兩者任何一方改動都要同步（有測試覆蓋）。
 */
export function resolveCanonicalSlug(slug: string, allSlugs: string[]): string {
  const key = topicKey(slug);
  if (!key) return slug;

  const siblings = allSlugs.filter((s) => s !== slug && topicKey(s) === key);
  if (siblings.length === 0) return slug;

  const yearOf = (s: string): number => {
    const m = s.match(/-(\d{4})$/);
    return m ? Number(m[1]) : -1;
  };

  const candidates = [slug, ...siblings];

  // 優先「無年份」版本（配合 .htaccess 的 301 方向）
  const withoutYear = candidates.filter((s) => yearOf(s) === -1);
  if (withoutYear.length > 0) {
    // 若有多個，取最短（最貼近原始 slug），避免 `foo-bar` vs `foo-bar-baz` 之類怪情況
    return withoutYear.reduce((best, cur) => (cur.length < best.length ? cur : best), withoutYear[0]);
  }

  // 全部都有年份 → 取最大年份
  return candidates.reduce((best, cur) => (yearOf(cur) > yearOf(best) ? cur : best), candidates[0]);
}

/** 此 slug 是否就是它所屬主題的代表版本 */
export function isCanonicalSlug(slug: string, allSlugs: string[]): boolean {
  return resolveCanonicalSlug(slug, allSlugs) === slug;
}

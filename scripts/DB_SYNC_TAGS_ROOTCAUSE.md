# 真實 root cause：live 的 tags／updatedAt 為何對不上 repo

（診斷，未改任何 merge 策略；依指示只回報。）

## 事實鏈

1. `lib/data-resolver.ts` `getAllBlogPosts()`：
   ```ts
   const merged = fallbackBlogPosts.map((p) => apiBySlug.get(p.slug) ?? p);
   ```
   → 同一 slug，**整個 API（後台 DB）物件取代 repo 物件**（唔係逐欄合併）。所以 DB 缺的欄位會變成 DB 的值（多數是空），唔會 fallback 回 repo。

2. `public/admin/api/blog.php` 的 `formatBlogPost()` 回傳：
   - `tags` ← `LEFT JOIN blog_tags … GROUP_CONCAT(bt.tag)`；冇 blog_tags 行 → `[]`。
   - `updatedAt` ← `$row['updated_at']`（blog_posts 欄）。
   - `readTime` ← `$row['read_time']`。

3. `scripts/db-sync/sync_blog_posts.php` 只 UPDATE blog_posts 的 `title / excerpt / content / image / updated_at`；
   **從不寫 blog_tags，亦從不寫 read_time**。而現有 `scripts/db-sync/payload.json` 甚至只有 9 個 key
   （slug,title,excerpt,content,image,imageColor,date,category — 冇 readTime / updatedAt / tags）。

## 後果

- `tags`：線上會用 DB 的 blog_tags；若該 slug 冇 tag 行 → `[]`。因為整個物件被覆蓋，repo 的
  SEO/GEO tags 消失 → 文章 tag pills 空、`getServiceLinks(post)` 只剩 category 可 match，
  內鏈退化為預設三條。**（唔係 crash：blog.php 一定回 array。）**
- `updatedAt`：只在 blog_posts 真的有 `updated_at` 欄時才有值。而 sync 每次寫入都設成
  `date('Y-m-d H:i:s')` → 線上「最後更新」顯示 sync 當日，而唔係編輯日 2026-10-03。
  若 DB 冇該欄 → blog.php 回 null → `updatedAt` undefined → `isUpdated()` false，最後更新永不顯示。
- `readTime`：同理，payload 冇帶 → DB 冇就被覆蓋成空。

## 結論

唔係 priority／override 方向錯（DB 該贏 title/content 是設計），而是：**sync 的 payload 只覆蓋
部分欄位，但 resolver 是整物件覆蓋**，令 blog_posts 以外的欄位（tags 來自 blog_tags、read_time）
被清空或以 sync 時間冒充更新時間。

## 可選修法（未實作，留待 parent 決定，因涉及 merge 策略）

- 短期：sync 一併維護 blog_tags 與 read_time（payload 已可由本工具帶上 tags/readTime/updatedAt，
  但 sync_blog_posts.php 目前只讀 5 欄），令 DB 有能力承載真值。
- 或：resolver 對 tags/readTime/updatedAt 做逐欄 fallback（保留 DB 的 title/content 覆蓋）。
- 兩者二選一即可；唔好兩邊同時改。

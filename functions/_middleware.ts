/**
 * Cloudflare Pages Function — PHP 後端反向代理
 *
 * 背景：本站是「Next.js 靜態輸出 + PHP 後台」的混合架構。
 *   - 靜態頁面（HTML / CSS / JS / 圖片）→ Cloudflare Pages 邊緣節點
 *   - PHP（/admin 後台、/admin/api 資料 API、/send-mail.php 表單）→ 必須留在 SiteGround
 *
 * 這個 middleware 只做一件事：把上述三個路徑原封不動轉去 origin，
 * 其餘所有請求交由 Pages 靜態資源處理（return next()）。
 *
 * 為何用 Workers 的 fetch 而不是 302 跳轉：
 *   跳轉會改變瀏覽器地址欄（admin.adwire.com.hk），令 cookie 網域、
 *   表單 Origin 檢查、後台內部相對連結全部要改。反向代理則完全透明。
 *
 * ⚠️ 注意：
 *   1. 代理只覆蓋「路徑」層面，PHP session cookie 由 origin 以 adwire.com.hk
 *      網域簽發，經代理回傳時仍屬同網域，登入狀態可保持。
 *   2. 若日後把表單改為 Worker + 郵件 API，可移除 /send-mail.php 的代理，
 *      此檔案即成為唯一仍依賴 SiteGround 的地方。
 *   3. 這個檔案不會進入 Next build（Next 只處理 app/ 與 public/）。
 */

interface Env {
  /**
   * SiteGround origin 主機名（預設 https://adwire.com.hk）。
   * ⚠️ 切換 DNS 之後 adwire.com.hk 會指向 Cloudflare 自己，直接 fetch 會無限迴圈，
   * 所以正式上線時必須設成一個仍然指向 SiteGround 的主機，例如
   * https://origin.adwire.com.hk（需在 SiteGround 加入為附屬網域）。
   */
  ORIGIN_BASE?: string;
  /**
   * 可選：直接指定 origin IP（配合 Workers 的 resolveOverride）。
   * 好處：唔需要動 SiteGround 面板加子網域。
   * 壞處：SiteGround 換 IP 就要更新（所以預設唔用）。
   */
  ORIGIN_IP?: string;
}

// /send-mail.php 已改由 functions/send-mail.php.ts 直接處理（Resend + Turnstile），
// 所以唔再代理去 SiteGround。只剩後台仍然依賴 PHP。
const PROXY_PATHS = [/^\/admin(\/|$)/, /^\/api(\/|$)/];

/**
 * 型別刻意唔用 `PagesFunction` 全域型別：呢個 repo 冇裝 @cloudflare/workers-types，
 * 而 Next 的 tsc 會掃到呢個檔案。用結構性型別已足夠描述 runtime 實際傳入的物件。
 */
type PagesContext = {
  request: Request;
  next: () => Promise<Response>;
  env: Env;
};

export const onRequest = async (context: PagesContext): Promise<Response> => {
  const { request, next, env } = context;
  const url = new URL(request.url);

  if (!PROXY_PATHS.some((re) => re.test(url.pathname))) {
    return next();
  }

  const originBase = (env.ORIGIN_BASE || "https://adwire.com.hk").replace(/\/+$/, "");
  const target = new URL(url.pathname + url.search, originBase);

  // 複製請求標頭，但移除會令 origin 混淆的欄位：
  //   host —— 必須是 origin 的 host，否則 vhost / cookie 會錯
  //   cf-* —— Cloudflare 內部標頭
  const headers = new Headers(request.headers);
  headers.delete("host");
  for (const key of [...headers.keys()]) {
    if (key.toLowerCase().startsWith("cf-")) headers.delete(key);
  }
  headers.set("X-Forwarded-Host", url.host);

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
    // @ts-expect-error — duplex 是 fetch 串流 body 的必要選項，CF runtime 支援但 TS 型別未收錄
    init.duplex = "half";
  }

  // resolveOverride：保留 Host／SNI（正確 vhost），但把 DNS 解析強制指去指定 IP。
  // 只在設定了 ORIGIN_IP 時使用，否則走正常 DNS。
  const upstream = await fetch(target.toString(), {
    ...init,
    ...(env.ORIGIN_IP ? { cf: { resolveOverride: env.ORIGIN_IP } } : {}),
  } as RequestInit);

  // 回傳 origin 的回應，但修正兩個 header：
  //   - 保留 set-cookie（登入狀態）
  //   - 移除 origin 的嚴格傳輸／CSP header，交由 Pages 的 _headers 統一處理
  const resp = new Response(upstream.body, upstream);
  resp.headers.delete("strict-transport-security");
  resp.headers.delete("content-security-policy");
  resp.headers.delete("x-frame-options");
  return resp;
};

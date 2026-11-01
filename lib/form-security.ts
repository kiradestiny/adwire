/**
 * lib/form-security.ts
 *
 * 正規化、信封檢查、metadata 提取及內容評分係純函式。只有明確呼叫
 * verifyHumanToken() 先會連線官方 Siteverify；import 本模組唔會發網絡請求。
 * 本檔唔寫 KV／計數器、唔 delete／skip notify、唔查外部 IP 情報 API。
 *
 * ── 為何獨立一份 ─────────────────────────────────────────────────────────
 *   舊版 public/send-mail.php 內嘅防護同評分邏輯同 handler 綁死，無法測試。
 *   呢份抽出可測試嘅核心規則，handler 只負責 I/O（parse body／寄信／KV）。
 *
 * ── 契約（同 handler 整合 agent 對齊）────────────────────────────────────
 *   normalizeMultiline(value, max)            → 正規化多行文字（唔 unescape HTML）
 *   validateSubmissionEnvelope(req, body, now)→ 來源 + 填表時間信封，回 {ok,...}
 *   verifyHumanToken(opts, fetcher?)          → Cloudflare Turnstile siteverify
 *   collectNetworkMetadata(request)           → 受信任嘅 request.cf / CF-IPCountry
 *   evaluateSubmissionRisk(fields)            → 保守啟發式評分（只建議審核）
 *
 * ── 設計原則 ─────────────────────────────────────────────────────────────
 *   · 寧漏勿殺：真客零損失優先於捉盡所有機械人。
 *   · 只回報訊號：risk 只係「建議人手審核」，永不刪除、永不攔截。
 *   · 驗證服務唔可用 → 'unavailable'；handler 必須 fail-closed 拒絕寄信，
 *     唔可以將 'unavailable' 當作通過。
 *   · 零新增狀態：唔用 counter／KV，方便共享同測試。
 */

// ── 常數（對外契約一部分，唔好隨意改）──────────────────────────────────────

/** 只接受呢兩個完全一致嘅來源網域（唔接受子網域／preview／頁面外來源）。 */
export const ALLOWED_ORIGINS = new Set(["https://adwire.com.hk", "https://www.adwire.com.hk"]);

/** 最短填表時間：少於 2.5 秒視為機械人。 */
export const MIN_DWELL_MS = 2_500;

/** 未來時間戳容忍值（容許客戶端時鐘輕微偏差）。 */
export const FUTURE_TOLERANCE_MS = 10_000;

/** Turnstile siteverify 固定端點（唔可以由呼叫方覆寫）。 */
export const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** siteverify 網絡逾時（毫秒）。 */
export const VERIFY_TIMEOUT_MS = 6_000;

/** Cloudflare Turnstile token 壽命（毫秒）—— 300 秒、單次使用。 */
export const TOKEN_MAX_AGE_MS = 300_000;

/** 評分門檻：>= 55 → review。 */
export const REVIEW_THRESHOLD = 55;

// ─────────────────────────────────────────────────────────────────────────────
// normalizeMultiline
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 正規化多行文字欄位：
 *   1. CRLF／單獨 CR → LF
 *   2. 剝除其餘 C0 控制字元（保留 LF）；順帶剝除 DEL
 *   3. trim
 *   4. 依 max 截斷（以 UTF-16 code unit 計）
 *
 * 刻意「唔做」HTML unescape（&amp; 保持原樣）—— escape 由渲染層負責，
 * 呢度嘅輸出會直接入郵件／DB，唔應該預先反解。
 */
export function normalizeMultiline(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  // 1) 統一換行
  let s = value.replace(/\r\n?/g, "\n");
  // 2) 剝除控制字元但保留 LF：範圍排除 \u000a
  // eslint-disable-next-line no-control-regex
  s = s.replace(/[\u0000-\u0009\u000b\u000c\u000e-\u001f\u007f]/g, "");
  // 3) trim
  s = s.trim();
  // 4) 截斷
  const limit = Number.isFinite(max) && (max as number) > 0 ? Math.floor(max as number) : 0;
  return s.slice(0, limit);
}

// ─────────────────────────────────────────────────────────────────────────────
// validateSubmissionEnvelope
// ─────────────────────────────────────────────────────────────────────────────

export interface EnvelopeResult {
  ok: boolean;
  status?: number;
  code?: string;
  message?: string;
}

/** 解析 formStartedAt：接受數值毫秒或 ISO 字串。無法解析回 NaN。 */
function parseStartedAt(raw: unknown): number {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : Number.NaN;
  if (typeof raw === "string") {
    const s = raw.trim();
    if (s === "") return Number.NaN;
    if (/^\d+$/.test(s)) return Number(s);
    return Date.parse(s);
  }
  return Number.NaN;
}

/**
 * 提交信封驗證 —— 只檢查 (a) 來源、(b) 填表時間。其他檢查（POST／honeypot／
 * 必填欄位／Turnstile）由 handler 負責。
 *
 * 注意：「來源正確」只係一個門檻，**唔可以**當作身份認證（Origin 可被偽造）。
 *
 * 回傳 ok:true 代表信封有效；否則帶 status／code／message。
 */
export function validateSubmissionEnvelope(
  request: Request,
  body: Record<string, unknown>,
  nowMs?: number,
): EnvelopeResult {
  const now = typeof nowMs === "number" && Number.isFinite(nowMs) ? nowMs : Date.now();

  // (a) 來源必須係完全一致嘅官方網域
  let origin: string | null = null;
  try {
    origin = request.headers?.get("origin") ?? null;
  } catch {
    origin = null;
  }
  if (!origin) {
    return {
      ok: false,
      status: 403,
      code: "ORIGIN_MISSING",
      message: "提交來源不正確，請重新載入頁面後再試。",
    };
  }
  if (!ALLOWED_ORIGINS.has(origin)) {
    return {
      ok: false,
      status: 403,
      code: "ORIGIN_INVALID",
      message: "提交來源不正確，請重新載入頁面後再試。",
    };
  }

  // (b) formStartedAt 必須存在而且有效
  const raw = body.formStartedAt;
  if (raw === undefined || raw === null || raw === "") {
    return {
      ok: false,
      status: 400,
      code: "FORM_STARTED_MISSING",
      message: "提交資料不完整，請重新載入頁面後再試。",
    };
  }
  const startedAt = parseStartedAt(raw);
  if (!Number.isFinite(startedAt) || startedAt === 0) {
    return {
      ok: false,
      status: 400,
      code: "FORM_STARTED_INVALID",
      message: "提交時間戳無效，請重新載入頁面後再試。",
    };
  }
  if (startedAt > now + FUTURE_TOLERANCE_MS) {
    return {
      ok: false,
      status: 400,
      code: "FORM_STARTED_FUTURE",
      message: "提交時間戳異常，請重新載入頁面後再試。",
    };
  }
  // 填表太快（elapsed < 2500ms）。注意：好舊嘅時間戳一律接受，
  // 唔會因為「session 太長」而拒絕（避免長表單被誤殺）。
  if (now - startedAt < MIN_DWELL_MS) {
    return {
      ok: false,
      status: 400,
      code: "FORM_TOO_QUICK",
      message: "提交太快，請稍後再試。",
    };
  }

  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// verifyHumanToken
// ─────────────────────────────────────────────────────────────────────────────

export type VerifyStatus = "verified" | "failed" | "unavailable";

export interface VerifyResult {
  status: VerifyStatus;
  reasonCode: string;
}

export interface VerifyOpts {
  token: string;
  secret?: string;
  ip: string;
  /** 由 handler 由受信任來源推導嘅預期 hostname。 */
  expectedHostname: string;
  nowMs?: number;
}

/**
 * 向 Cloudflare Turnstile siteverify 驗證 token。
 *
 *   回傳 verified    ：success === true 而且 hostname 完全相符（可信）
 *   回傳 failed      ：明確失敗（缺 token／唔成功／hostname 唔符／challenge_ts 過期或壞）
 *   回傳 unavailable ：無法判斷（缺 secret／非 2xx／逾時／例外／壞 JSON）→ handler 必須 fail-closed
 *
 * 安全設計：
 *   · secret 缺失／空白 → 直接 unavailable，**完全唔會**發網絡請求。
 *   · 只用官方固定端點、POST FormData（secret／response／remoteip）、redirect manual、
 *     AbortController 有限逾時。
 *   · 只有 success===true **而且** hostname===expectedHostname 才算 verified。
 *     （Cloudflare token 係 300 秒、單次使用；供應商已查過期，呢度再自行查
 *      challenge_ts 以策安全。因為現有 widget 冇 action，所以唔要求 action。）
 *   · 永不回傳原始 response／token／secret —— 只有 status + reasonCode。
 */
export async function verifyHumanToken(
  opts: VerifyOpts,
  fetcher?: typeof fetch,
): Promise<VerifyResult> {
  const token = typeof opts.token === "string" ? opts.token.trim() : "";
  const secret = typeof opts.secret === "string" ? opts.secret.trim() : "";

  // 缺 secret → 唔可以驗證（而且唔應該打 API）
  if (!secret) return { status: "unavailable", reasonCode: "SECRET_MISSING" };
  // 有 secret 但冇 token → 明確失敗
  if (!token) return { status: "failed", reasonCode: "TOKEN_MISSING" };

  const doFetch = fetcher ?? (typeof fetch === "function" ? fetch : undefined);
  if (typeof doFetch !== "function") return { status: "unavailable", reasonCode: "FETCH_ERROR" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);

  let res: Response;
  try {
    const form = new FormData();
    form.append("secret", secret);
    form.append("response", token);
    if (opts.ip) form.append("remoteip", opts.ip);
    res = await doFetch(SITEVERIFY_URL, {
      method: "POST",
      body: form,
      redirect: "manual",
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(timer);
    const name = (e as { name?: string } | null)?.name;
    const aborted = controller.signal.aborted || name === "AbortError" || name === "TimeoutError";
    return { status: "unavailable", reasonCode: aborted ? "TIMEOUT" : "FETCH_ERROR" };
  }
  clearTimeout(timer);

  if (!res || typeof res.status !== "number") {
    return { status: "unavailable", reasonCode: "FETCH_ERROR" };
  }
  if (res.status < 200 || res.status >= 300) {
    return { status: "unavailable", reasonCode: "HTTP_ERROR" };
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return { status: "unavailable", reasonCode: "BAD_JSON" };
  }
  if (!data || typeof data !== "object") {
    return { status: "unavailable", reasonCode: "BAD_JSON" };
  }
  const payload = data as Record<string, unknown>;

  if (payload.success !== true) return { status: "failed", reasonCode: "NOT_SUCCESS" };

  const hostname = typeof payload.hostname === "string" ? payload.hostname : "";
  if (!hostname || hostname !== opts.expectedHostname) {
    return { status: "failed", reasonCode: "HOSTNAME_MISMATCH" };
  }

  // challenge_ts 若提供就一定要有效；唔新鮮（>300s）一律 failed。
  const rawTs = payload.challenge_ts;
  if (rawTs !== undefined && rawTs !== null) {
    const ts = typeof rawTs === "string" ? Date.parse(rawTs) : Number.NaN;
    if (!Number.isFinite(ts)) return { status: "failed", reasonCode: "CHALLENGE_TS_INVALID" };
    const now = typeof opts.nowMs === "number" && Number.isFinite(opts.nowMs) ? opts.nowMs : Date.now();
    if (now - ts > TOKEN_MAX_AGE_MS) return { status: "failed", reasonCode: "CHALLENGE_EXPIRED" };
  }

  return { status: "verified", reasonCode: "VERIFIED" };
}

// ─────────────────────────────────────────────────────────────────────────────
// collectNetworkMetadata
// ─────────────────────────────────────────────────────────────────────────────

export interface NetworkMetadata {
  asn: number | null;
  organization: string;
  country: string;
}

interface CfProperties {
  asn?: unknown;
  asOrganization?: unknown;
  country?: unknown;
}

const TWO_LETTERS = /^[A-Za-z]{2}$/;

/**
 * 由「受信任」嘅 request.cf（Cloudflare 只會喺自己嘅邊緣節點注入，客戶端無法偽造）
 * 讀取網絡 metadata；country 可以用 header CF-IPCountry 補位（只接受兩個字母）。
 *
 *   · 唔會接受 body 內嘅 metadata（函式根本冇 body 參數）。
 *   · 唔會做任何付費／外部 IP 情報查詢。
 *   · 亦唔會由 ASN 推斷 ISP／VPN／正常 —— 只回報原始 ASN／組織名。
 */
export function collectNetworkMetadata(request: Request): NetworkMetadata {
  const cf = (request as unknown as { cf?: CfProperties }).cf;

  let asn: number | null = null;
  if (cf && typeof cf.asn === "number" && Number.isFinite(cf.asn) && cf.asn > 0) {
    asn = cf.asn;
  }

  let organization = "";
  if (cf && typeof cf.asOrganization === "string") {
    organization = cf.asOrganization.trim();
  }

  let country = "";
  if (cf && typeof cf.country === "string" && TWO_LETTERS.test(cf.country)) {
    country = cf.country.toUpperCase();
  } else {
    let header: string | null = null;
    try {
      header = request.headers?.get("cf-ipcountry") ?? null;
    } catch {
      header = null;
    }
    if (header && TWO_LETTERS.test(header.trim())) {
      country = header.trim().toUpperCase();
    }
  }

  return { asn, organization, country };
}

// ─────────────────────────────────────────────────────────────────────────────
// evaluateSubmissionRisk
// ─────────────────────────────────────────────────────────────────────────────

export interface RiskFields {
  name: string;
  phone: string;
  email: string;
  company: string;
  companySite: string;
  systemInfo: string;
  message: string;
  ua: string;
}

export interface RiskResult {
  level: "low" | "review";
  score: number;
  reasons: string[];
}

// ── 私有啟發式輔助（對應 public/send-mail.php 嘅同名 PHP 函式，保守版）──────

/** 一次性／棄用電郵域名（沿用舊版硬編碼清單 + 關鍵字）。 */
const DISPOSABLE_DOMAINS = new Set([
  "ifastnet1.com", "usaaxa.com", "mailinator.com", "guerrillamail.com",
  "guerrillamail.net", "sharklasers.com", "grr.la", "spam4.me",
  "10minutemail.com", "10minutemail.net", "tempmail.com", "temp-mail.org",
  "throwawaymail.com", "yopmail.com", "yopmail.net", "trashmail.com",
  "maildrop.cc", "getnada.com", "dispostable.com", "mailnesia.com",
  "mytemp.email", "moakt.com", "emailondeck.com", "fakeinbox.com",
  "mailcatch.com", "spambog.com", "discard.email", "mail-temporaire.fr",
  "byom.de", "kurzepost.de", "wegwerfmail.de", "trbvm.com",
]);
const DISPOSABLE_KEYWORDS = [
  "tempmail", "temp-mail", "throwaway", "10minutemail", "disposable", "trashmail", "mailinator",
];

function isDisposableEmailDomain(domain: string): boolean {
  const d = domain.trim().toLowerCase();
  if (d === "") return false;
  if (DISPOSABLE_DOMAINS.has(d)) return true;
  return DISPOSABLE_KEYWORDS.some((kw) => d.includes(kw));
}

const HAS_HAN = /\p{Script=Han}/u;

/** 公司網站欄位是否「似有效網域」或屬真空值／中文描述（回 true = 合格）。 */
function looksLikeDomainOrBlank(value: string): boolean {
  const v = value.trim();
  if (v === "") return true;
  const benign = new Set([
    "n/a", "na", "nil", "none", "-", "--",
    "無", "沒有", "暫無", "未有", "未填", "沒有網站", "暫未有", "無網站",
  ]);
  if (benign.has(v.toLowerCase())) return true;
  if (HAS_HAN.test(v)) return true;
  let s = v.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  s = s.replace(/[/?#].*$/, "").replace(/:\d+$/, "");
  const host = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;
  return host.test(s) && /\.[a-z]{2,24}$/i.test(s);
}

/** 小型 Levenshtein（只處理短 TLD，效能無關）。 */
function levenshtein(a: string, b: string): number {
  const prev = new Array<number>(b.length + 1);
  const curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

/** 電郵域名 TLD 疑似打錯字（同常見 TLD 只差一個字母或字母調序）。 */
function emailTldLooksMisspelled(domain: string): boolean {
  const d = domain.trim().toLowerCase();
  const dot = d.lastIndexOf(".");
  if (d === "" || dot === -1) return false;
  const tld = d.slice(dot + 1);
  if (tld.length < 3 || tld.length > 6 || !/^[a-z]+$/.test(tld)) return false;
  const common = ["com", "net", "org", "edu", "gov", "info", "biz", "int", "mil", "name", "pro"];
  if (common.includes(tld)) return false;
  for (const c of common) {
    if (levenshtein(tld, c) === 1) return true;
    if (tld.length === c.length && [...tld].sort().join("") === [...c].sort().join("")) return true;
  }
  return false;
}

/** 常用英文 bigram（用於亂碼判斷）。 */
const BIGRAMS = new Set([
  "th", "he", "in", "er", "an", "re", "on", "at", "en", "nd", "ti", "es", "or", "te", "of", "ed",
  "is", "it", "al", "ar", "st", "to", "nt", "ng", "se", "ha", "as", "ou", "io", "le", "ve", "co",
  "me", "de", "hi", "ri", "ro", "ic", "ne", "ea", "ra", "ce", "li", "ch", "ll", "be", "ma", "si",
  "om", "ur", "ho", "op", "sh", "ca", "el", "ta", "la", "di", "lo", "ck", "un", "ai", "oo", "ay",
  "ey", "oa", "ee", "ow", "ir", "us", "ac", "ss", "so", "rs", "il", "ly", "wi", "fl", "du", "um",
  "ut", "ry", "fi", "ni",
]);

const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "qwertzuiop", "1234567890"];

/**
 * 單一「詞」是否亂打鍵盤。保守：>=5 字母、少於 3 個大寫（大寫 3 個以上當品牌縮寫豁免），
 * 並要求係鍵盤橫排、或母音比例／常見字母組合極端。經品牌／技術詞樣本驗證零誤判。
 */
function looksLikeGibberishToken(token: string): boolean {
  if (token.length < 5 || !/^[A-Za-z]+$/.test(token)) return false;
  if ((token.match(/[A-Z]/g) || []).length >= 3) return false;
  const t = token.toLowerCase();

  for (const row of KEYBOARD_ROWS) {
    for (let i = 0; i + 4 <= row.length; i++) {
      if (t.includes(row.slice(i, i + 4))) return true;
    }
  }

  const len = t.length;
  const vr = (t.match(/[aeiouy]/g) || []).length / len;
  const pairs: string[] = [];
  for (let i = 0; i + 2 <= len; i++) pairs.push(t.slice(i, i + 2));
  const hit = pairs.length ? pairs.filter((p) => BIGRAMS.has(p)).length / pairs.length : 1.0;
  const segs = t.match(/[^aeiouy]+/g) || [];
  let run = 0;
  for (const s of segs) run = Math.max(run, s.length);

  if (vr === 0) return true;
  if (hit < 0.15 && vr < 0.4) return true;
  if (run >= 5 && vr < 0.3) return true;
  return false;
}

/** 整個欄位是否亂打鍵盤（純拉丁、無中文、長度 >=4，而且「所有詞」都屬亂碼）。 */
function looksLikeGibberish(value: string): boolean {
  const v = value.trim();
  if (v === "" || [...v].length < 4) return false;
  if (HAS_HAN.test(v)) return false;
  const tokens = v.split(/[^A-Za-z]+/).filter((x) => x !== "");
  if (tokens.length === 0) return false;
  return tokens.every((tk) => looksLikeGibberishToken(tk));
}

/** 明顯非瀏覽器嘅 User-Agent（bot 常漏送或填假值）。 */
function looksLikeBotUserAgent(ua: string): boolean {
  const u = ua.trim();
  if (u === "" || [...u].length < 20) return true;
  const bad = ["curl", "python", "wget", "httpclient", "headlesschrome", "phantomjs",
    "scrapy", "go-http-client", "java/", "libwww", "okhttp", "axios"];
  const lower = u.toLowerCase();
  return bad.some((b) => lower.includes(b));
}

const isDigitsOnly = (v: string): boolean => v !== "" && /^\d+$/.test(v);
const isNumericGibberish = (v: string): boolean => v !== "" && /\d/.test(v) && !/\p{L}/u.test(v);

function emailDomainOf(email: string): string {
  const at = email.lastIndexOf("@");
  return at === -1 ? "" : email.slice(at + 1).trim().toLowerCase();
}

/**
 * 保守啟發式評分 —— **只係旗標**：level='review' 代表建議人手審核，
 * 絕不代表要刪除／拒收／唔寄通知。
 *
 * 只計「已知內容訊號」：一次性電郵、純數字公司／網站、電話＝公司＝網站同一串數字、
 * 網站唔似網域、TLD 打錯字、明顯亂打鍵盤、缺／bot UA。
 * 刻意「唔計」：來源國家／VPN／ASN、免費用戶電郵、問卷評級（leadGrade）、
 * 速率限制／ASN 用量（需外部狀態）。
 *
 * score === 0 只代表「冇已知內容訊號」，**唔等於**已認證真人
 * （真人驗證係 verifyHumanToken 嘅獨立判斷）。
 */
export function evaluateSubmissionRisk(fields: RiskFields): RiskResult {
  const reasons: string[] = [];
  let score = 0;
  const add = (points: number, reason: string): void => {
    if (points <= 0) return;
    score += points;
    reasons.push(reason);
  };

  const phone = (fields.phone || "").trim();
  const phoneDigits = phone.replace(/\D+/g, "");
  const company = (fields.company || "").trim();
  const companySite = (fields.companySite || "").trim();
  const systemInfo = (fields.systemInfo || "").trim();
  const message = (fields.message || "").trim();
  const emailDomain = emailDomainOf(fields.email || "");

  // (1) 電話／公司／公司網站填寫完全相同的純數字（真人唔會咁做）
  if (
    phoneDigits !== "" &&
    company !== "" &&
    companySite !== "" &&
    phoneDigits === company &&
    phoneDigits === companySite &&
    isDigitsOnly(phoneDigits)
  ) {
    add(60, "電話／公司／公司網站填寫完全相同的純數字");
  } else {
    // (2) 公司名稱只填數字 / 公司網站只填數字
    if (isNumericGibberish(company)) add(25, "公司／品牌名稱只填數字");
    if (isNumericGibberish(companySite)) add(25, "公司網站只填數字");
  }

  // (3) 公司網站唔似有效網域（中文描述與真空值一律放行）
  if (companySite !== "" && !looksLikeDomainOrBlank(companySite)) {
    add(30, "公司網站唔似有效網域格式");
  }

  // (4) 電郵域名頂級域疑似打錯（.con / .cmo …）
  if (emailDomain !== "" && emailTldLooksMisspelled(emailDomain)) {
    add(30, `電郵域名頂級域疑似打錯（${emailDomain}）`);
  }

  // (5) 一次性／棄用電郵域名
  if (emailDomain !== "" && isDisposableEmailDomain(emailDomain)) {
    add(60, `一次性／棄用電郵域名 ${emailDomain}`);
  }

  // (6) 內容係亂打鍵盤（多個欄位同時中，上限 30 分）
  const gibberishFields: string[] = [];
  const gibCandidates: Array<[string, string]> = [
    ["公司／品牌", company],
    ["公司網站", companySite],
    ["現有系統／技術", systemInfo],
    ["客戶訊息", message],
  ];
  for (const [label, val] of gibCandidates) {
    if (val !== "" && looksLikeGibberish(val)) gibberishFields.push(label);
  }
  if (gibberishFields.length > 0) {
    add(Math.min(30, 15 * gibberishFields.length), `疑似亂打鍵盤：${gibberishFields.join("、")}`);
  }

  // (7) User-Agent 缺失或明顯非瀏覽器（只旗標，單獨唔會 review）
  if (looksLikeBotUserAgent(fields.ua || "")) {
    add(25, "User-Agent 缺失或明顯非瀏覽器");
  }

  return {
    level: score >= REVIEW_THRESHOLD ? "review" : "low",
    score,
    reasons,
  };
}

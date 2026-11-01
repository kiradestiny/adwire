/**
 * lib/mail-email.ts — ADWire 交易郵件渲染器
 *
 * 用途：由 send-mail handler 收集到嘅 lead 欄位，渲染成一封對收件人好用嘅
 * HTML 交易郵件。本模組 import 時零副作用；渲染器係純函數，唔會寄信或寫 KV。
 * handler 已接駁此模板並保留多行 message；新版已獲部署授權。
 *
 * 重要：只可對 message 使用多行 normalizer；header 及其他欄位仍需單行清理。
 * 預覽核准唔代表可以改寫既有 outbox 已 frozen 嘅 payload。
 *
 * 設計契約（email-friendly）：
 *   - 只使用 table + inline style；無 JS、無 grid/flex、無外部字體／外部依賴
 *     （唯一外部 URL 為已驗證品牌 logo 圖片，於收件端載入，非本模組依賴）。
 *   - 卡片 max-width ≥ 680px 上限；內文 16px、行高 1.75。
 *   - 所有使用者資料一律 HTML 轉義；使用者資料永不作為原始 HTML 輸出。
 *   - email 只喺合法時成 mailto；電話只喺合法數字時成 tel；
 *     網站只允許 http(s) URL，避免 javascript:。
 *   - WhatsApp CTA 只在電話化成合法 wa.me 國際號（純數字、無 query、無預填文字）
 *     時先出現；無效電話一律唔出按鈕，但保留原本已轉義嘅電話文字。
 *   - 缺／非法 grade 用中性樣式，唔會套用任何等級專屬顏色。
 *   - 保留所有已提供內容（不靜默遺失）；不改寫任何報價／價格，不改評級／問題。
 */

/** 與 functions/send-mail.php.ts buildEmail(f) 完全一致的欄位介面。 */
export interface MailEmailFixture {
  name: string;
  phone: string;
  email: string;
  service: string;
  company: string;
  companySite: string;
  budget: string;
  timeline: string;
  systemInfo: string;
  message: string;
  ip: string;
  ua: string;
  country: string;
  source: string;
  leadGrade: string;
  leadNotes: string;
  /**
   * OPTIONAL 安全 metadata：由 handler 提供**已經計算、可信**嘅結果。
   * 本渲染器唔會自行推斷（唔會查 ASN、唔會判斷 ISP／數據中心、唔會猜外國風險）；
   * 缺欄位一律誠實顯示「未提供」／「未評估」，永不捏造分數。
   */
  security?: MailEmailSecurity;
}

/** 真人驗證狀態：verified（已通過）／unavailable（服務未完成）／not_checked（尚未驗證）。 */
export type MailEmailVerification = "verified" | "unavailable" | "not_checked";
/** 風險等級：low（未見已知風險）／review（需人工確認）／unknown（未評估）。 */
export type MailEmailRiskLevel = "low" | "review" | "unknown";

export interface MailEmailSecurityRisk {
  /** 非 low/review/unknown 嘅值一律當「未評估」處理（防禦畸形輸入）。 */
  level: MailEmailRiskLevel;
  /** 有效分數需為有限、>= 0 嘅數字；null／負數／非數字一律視為「分數未提供」。 */
  score: number | null;
  /** 需要人工確認嘅原因（僅於 level=review 時垂直列出）。 */
  reasons: string[];
}

export interface MailEmailSecurityNetwork {
  asn: number | null;
  organization: string;
  country: string;
}

export interface MailEmailSecurity {
  verification: MailEmailVerification;
  risk: MailEmailSecurityRisk;
  network: MailEmailSecurityNetwork;
}

export interface AssessmentField {
  label: string;
  value: string;
}

export interface ParsedAssessment {
  /** 依訊息出現次序排列（完全相同嘅重複行只保留一次）。 */
  fields: AssessmentField[];
  /** 「客人補充：」之後嘅原文（多行保留）；無補充則為空字串。 */
  note: string;
  /** 介乎標題與註解之間、唔屬於已知標籤嘅非空行（保留，不遺失）。 */
  unknownLines: string[];
}

// ── 版式常數（ADWire 品牌）────────────────────────────────────────────────────
const BRAND_BLUE = "#0f4c81";
const BRAND_GOLD = "#f5a623";
const TEXT = "#1a1f36";
const MUTED = "#5b6b84";
const BORDER = "#e8edf5";
const SOFT = "#f7f9fc";
const PAGE_BG = "#f4f6fa";
/** 真品牌資產（已由 parent 驗證 HTTP 200 / image-png）。 */
const LOGO_SRC = "https://adwire.com.hk/logo.png";
const LOGO_ALT = "ADWire Agency";

const ASSESSMENT_TITLE = "【ADWire 需求評估摘要】";
const ASSESSMENT_LABELS = [
  "想處理",
  "主要情況",
  "現有基礎",
  "可投入",
  "預計開始",
  "角色",
  "建議方向",
  "評估結果",
] as const;
const LABEL_RE = new RegExp(`^(${ASSESSMENT_LABELS.join("|")})[：:]`);
const NOTE_RE = /^客人補充[：:]/;

// ── 純助手 ────────────────────────────────────────────────────────────────────

/**
 * 換行正規化（CRLF / 單獨 CR → LF）。
 * 純函數，只做替換：唔會截斷、唔會移除既有 LF、唔會改動其他字元。
 */
export function normalizeNewlines(input: string): string {
  return String(input ?? "").replace(/\r\n?/g, "\n");
}

/** HTML 轉義：使用者資料永不作為原始 HTML 輸出。 */
function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** 轉義 + 將換行轉成 <br>（保留多行）。 */
function escBr(s: string): string {
  return escapeHtml(normalizeNewlines(s)).replace(/\n/g, "<br>");
}

/** 合法 email 才回傳 mailto 目標；否則 null。 */
export function mailtoTarget(email: string): string | null {
  const v = String(email ?? "").trim();
  if (v.length === 0 || v.length > 254) return null;
  if (!/^[^\s@<>,;:"]+@[^\s@<>,;:"]+\.[^\s@<>,;:"]+$/.test(v)) return null;
  return v;
}

/** 合法電話（數字，可帶一個前置 +）才回傳 tel 目標；否則 null。 */
export function telTarget(phone: string): string | null {
  const v = String(phone ?? "").trim();
  // 只去分隔用嘅空白／破折／括號，其餘保留判斷合法性。
  const compact = v.replace(/[\s\-().]/g, "");
  if (!/^\+?\d{6,20}$/.test(compact)) return null;
  return compact;
}

/** WhatsApp CTA 連結前綴（官方 FAQ：https://wa.me/<國際號，純數字、無 +>）。 */
const WA_PREFIX = "https://wa.me/";

/** 明確國際號：7..15 位、首位非 0。 */
function isIntlDigits(d: string): boolean {
  return /^[1-9]\d{6,14}$/.test(d);
}

/**
 * 合法電話才回傳 **完整 WhatsApp 連結** `https://wa.me/<digits>`；否則 null。
 * ⚠️ 契約：本函數回傳完整 URL（有別於 mailtoTarget 只回傳地址）。
 * 依 WhatsApp 官方 FAQ（https://faq.whatsapp.com/5913398998672934）：wa.me 後接
 * 國際號碼，純數字、無 +、無 query、無預填文字 —— 本函數只產生「開對話」連結。
 *
 * 安全規則（唔用寬鬆 non-digit 替換，避免惡意輸入被洗成看似合法）：
 *   - 只接受：數字、最多一個**置於最前**嘅 +、以及視覺分隔符 空格 - ( ) . ；
 *   - 任何其他字元（文字／ext／HTML／URL／query／多個 +）→ null；
 *   - 原始輸入含 CR/LF 或控制字元 → null（唔會被 trim 掩蓋）；
 *   - 只去外層普通空格；分隔符只喺確認無控制字元後先移除；
 *   - HK 本地恰好 8 位、首位非 0 → 補 852；既有 852 之 11 位 → 原樣保留；
 *   - 明確 + 國際 7..15 位、首位非 0 → 原樣保留（即使 8 位都唔會當 HK）；
 *   - 00 國際前綴 → 去 00 當 +，驗證 7..15 位首位非 0；
 *   - 裸 9..15 位、首位非 0 → 原樣保留（legacy 相容）；
 *   - 含糊（裸 7 位）／單一前導 0／位數不符 → null。
 */
export function whatsappTarget(phone: string): string | null {
  const raw = String(phone ?? "");
  // 原始輸入唔可以有 CR/LF 或任何控制字元（防止注入／隱藏換行）。
  if (/[\u0000-\u001f\u007f]/.test(raw)) return null;
  // 只去外層普通空格（唔會去走控制字元 —— 上面已拒絕）。
  const v = raw.replace(/^ +/, "").replace(/ +$/, "");
  // 只允許數字、可選前置 +、視覺分隔符（空格／-／( )／.）。
  if (!/^[0-9+\-(). ]*$/.test(v)) return null;
  // 最多一個 +，且必須喺最前。
  if (v.indexOf("+") > 0) return null;
  if ((v.match(/\+/g) ?? []).length > 1) return null;
  const compact = v.replace(/[ \-().]/g, "");
  if (!/^\+?\d+$/.test(compact)) return null;

  const hasPlus = compact.startsWith("+");
  const digits = hasPlus ? compact.slice(1) : compact;

  // 明確國際：+ 國際 7..15 位、首位非 0 → 原樣保留（唔加 HK 前綴）。
  if (hasPlus) return isIntlDigits(digits) ? WA_PREFIX + digits : null;

  // 00 國際前綴 → 去 00、當 + 語意處理。
  if (digits.startsWith("00")) {
    const rest = digits.slice(2);
    return isIntlDigits(rest) ? WA_PREFIX + rest : null;
  }
  // 單一前導 0（非 00）→ 含糊，唔接受。
  if (digits.startsWith("0")) return null;
  // HK 本地：恰好 8 位、首位非 0 → 補 852。
  if (digits.length === 8) return WA_PREFIX + "852" + digits;
  // 裸國際 9..15 位（legacy 相容）→ 原樣保留。
  if (digits.length >= 9 && digits.length <= 15) return WA_PREFIX + digits;
  return null;
}

/** 只允許 http(s) 嘅連結目標；其餘（含 javascript:）回傳 null。 */
export function httpUrlTarget(raw: string): string | null {
  const v = String(raw ?? "").trim();
  if (!v) return null;
  if (!/^https?:\/\//i.test(v)) return null; // 只信 http(s)，避免 javascript:/data:
  try {
    const u = new URL(v);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return v;
  } catch {
    return null;
  }
}

// ── 評估訊息解析 ──────────────────────────────────────────────────────────────

/**
 * 只解析**確認為評估摘要格式**（第一非空行為預期標題）嘅純文字訊息。
 * 非該格式 → 回傳 null（呼叫端應改為原文字面顯示，避免誤解析）。
 *
 * 規則：
 *   - 完全相同嘅「標籤：值」重複行只保留一次；
 *   - 同一標籤、不同值 → 兩者皆保留（不遺失）；
 *   - 「客人補充：」之後全部行原樣視為註解，唔會再被當成欄位；
 *   - 標籤以外嘅非空行放入 unknownLines 保留。
 */
export function parseAssessmentMessage(message: string): ParsedAssessment | null {
  const text = normalizeNewlines(message ?? "");
  if (!text.trim()) return null;

  const lines = text.split("\n");
  let start = 0;
  while (start < lines.length && lines[start].trim() === "") start++;
  if (start >= lines.length || lines[start].trim() !== ASSESSMENT_TITLE) return null;

  const fields: AssessmentField[] = [];
  const unknownLines: string[] = [];
  const seen = new Set<string>();
  let note = "";
  let inNote = false;
  let matchedLabel = false;

  for (let i = start + 1; i < lines.length; i++) {
    const raw = lines[i];
    if (inNote) {
      note += "\n" + raw;
      continue;
    }
    const trimmed = raw.trim();
    if (trimmed === "") continue;

    if (NOTE_RE.test(trimmed)) {
      inNote = true;
      note = trimmed.slice(trimmed.match(NOTE_RE)![0].length);
      continue;
    }

    const m = LABEL_RE.exec(trimmed);
    if (m) {
      matchedLabel = true;
      const label = m[1];
      const value = trimmed.slice(m[0].length).trim();
      const key = `${label}\u0000${value}`;
      if (!seen.has(key)) {
        seen.add(key);
        fields.push({ label, value });
      }
      continue;
    }

    unknownLines.push(trimmed);
  }

  // 有標題但完全冇可辨識嘅標籤／補充 → 當作非評估格式，交由原文字面兜底。
  if (!matchedLabel && !note) return null;
  return { fields, note, unknownLines };
}

// ── 渲染 ──────────────────────────────────────────────────────────────────────

/** 需求評估（/start/）嚟嘅 lead 喺標題標明評級，方便收件箱一眼排優先次序。 */
function buildSubject(f: MailEmailFixture): string {
  const tag =
    f.source === "assessment"
      ? `【需求評估${f.leadGrade ? `・${f.leadGrade} 級` : ""}】`
      : "【新客戶查詢】";
  // `[待確認]` 前綴**只**喺安全風險需要人工確認（review）時出現，與銷售評級無關。
  const review = needsReview(f.security) ? "[待確認] " : "";
  return `${review}${tag}${f.name} - ${f.service}${f.budget && f.budget !== "未指定" ? ` - ${f.budget}` : ""}`;
}

interface GradeStyle {
  bg: string;
  fg: string;
  label: string;
}

/** 只有 A/B/C 用專屬色；缺失／非法一律中性，避免任意 CSS。 */
function gradeStyle(grade: string): GradeStyle {
  switch (grade) {
    case "A":
      return { bg: "#e8f5e9", fg: "#2e7d32", label: "A 級" };
    case "B":
      return { bg: "#fff4e0", fg: "#b26a00", label: "B 級" };
    case "C":
      return { bg: "#eef1f6", fg: MUTED, label: "C 級" };
    default:
      return { bg: "#eef1f6", fg: MUTED, label: "未評級" };
  }
}

/**
 * 值內容（保留原有連結／轉義規則）——唔再自帶 <td>，交由 infoRow 放入單一儲存格。
 */
function infoValueHtml(label: string, value: string): string {
  if (label === "電話") {
    const tel = telTarget(value);
    if (tel) {
      return `<a href="tel:${escapeHtml(tel)}" style="color:${BRAND_BLUE};text-decoration:none">${escapeHtml(value)}</a>`;
    }
  }
  if (label === "電郵") {
    const mail = mailtoTarget(value);
    if (mail) {
      return `<a href="mailto:${escapeHtml(mail)}" style="color:${BRAND_BLUE};text-decoration:none">${escapeHtml(value)}</a>`;
    }
  }
  if (label === "公司網站") {
    const href = httpUrlTarget(value);
    if (href) {
      return `<a href="${escapeHtml(href)}" style="color:${BRAND_BLUE};text-decoration:none;word-break:break-all">${escapeHtml(value)}</a>`;
    }
  }
  return escBr(value);
}

/**
 * 扁平垂直資料列：每列只有一個 <td>，muted 小標籤置於 16px 值之上，
 * 以細分隔線分間（收件人慣用版面，非兩欄 label/value 表）。
 */
function infoRow(label: string, value: string): string {
  const cell = `padding:16px 20px 14px;border-bottom:1px solid ${BORDER};vertical-align:top`;
  return `<tr>
    <td style="${cell}">
      <div class="flabel" style="font-size:12px;letter-spacing:.04em;color:${MUTED};font-weight:700;margin-bottom:4px">${escapeHtml(label)}</div>
      <div class="fvalue" style="font-size:16px;color:${TEXT};line-height:1.75;word-break:break-word">${infoValueHtml(label, value)}</div>
    </td>
  </tr>`;
}

/**
 * 頂部快速摘要（服務／評級）——精簡單行，唔再用濁亂嘅 pill 網格／大 hero。
 * 姓名已移入一般資料列，避免重複。
 */
function buildHero(f: MailEmailFixture): string {
  const isAssessment = f.source === "assessment";
  const g = gradeStyle(f.leadGrade);
  const bits: string[] = [`服務：${escapeHtml(f.service || "未指定")}`];
  if (isAssessment) {
    bits.push(`<span style="color:${g.fg};font-weight:700">評級：${escapeHtml(g.label)}</span>`);
  }
  const summary = `<div style="font-size:14px;color:${MUTED};line-height:1.75">${bits.join(
    ` <span style="color:${BORDER}">·</span> `,
  )}</div>`;
  const notes =
    isAssessment && f.leadNotes
      ? `<div style="margin-top:4px;font-size:12px;color:${MUTED}">內部評分：${escapeHtml(f.leadNotes)}</div>`
      : "";
  return summary + notes;
}

function buildAssessmentBlock(parsed: ParsedAssessment): string {
  if (parsed.fields.length === 0 && parsed.unknownLines.length === 0) return "";
  const fieldRows = parsed.fields
    .map(
      (field) => `<tr><td style="padding:14px 20px;border-bottom:1px solid ${BORDER};vertical-align:top">
        <div class="mlabel" style="font-size:12px;letter-spacing:.04em;color:${MUTED};font-weight:700;margin-bottom:4px">${escapeHtml(field.label)}</div>
        <div class="mvalue" style="font-size:16px;color:${TEXT};line-height:1.75;word-break:break-word">${escBr(field.value)}</div>
      </td></tr>`,
    )
    .join("");
  const unknownRows = parsed.unknownLines
    .map(
      (line) => `<tr><td class="munknown" style="padding:14px 20px;border-bottom:1px solid ${BORDER};vertical-align:top">
        <div class="mlabel" style="font-size:12px;letter-spacing:.04em;color:${MUTED};font-weight:700;margin-bottom:4px">其他</div>
        <div class="mvalue" style="font-size:16px;color:${TEXT};line-height:1.75;word-break:break-word">${escBr(line)}</div>
      </td></tr>`,
    )
    .join("");
  return `<tr><td style="padding:20px 20px 4px">
      <div style="font-size:13px;font-weight:700;color:${BRAND_BLUE};padding-bottom:8px;margin-bottom:8px;border-bottom:2px solid ${BRAND_GOLD}">需求評估內容</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${fieldRows}${unknownRows}</table>
    </td></tr>`;
}

function buildNoteBlock(text: string, heading: string): string {
  if (!text.trim()) return "";
  return `<tr><td style="padding:20px 20px 4px">
      <div style="font-size:13px;font-weight:700;color:${BRAND_BLUE};margin-bottom:8px">${escapeHtml(heading)}</div>
      <div style="background:${SOFT};border-left:3px solid ${BRAND_GOLD};padding:12px 14px;border-radius:0 8px 8px 0;font-size:16px;color:${TEXT};line-height:1.75;word-break:break-word">${escBr(text)}</div>
    </td></tr>`;
}

/**
 * WhatsApp 回覆 CTA：只有電話化成合法 wa.me 國際號時先出現一個綠色按鈕。
 * email-safe：table + inline style、同級 `align="center"` 置中；無 JS／svg／flex／新依賴。
 * 連結只「開對話」，不含任何 query／預填文字。無效電話 → 回傳空字串（唔出按鈕）。
 */
function buildWhatsAppCta(f: MailEmailFixture): string {
  const target = whatsappTarget(f.phone);
  if (!target) return "";
  return `<tr><td align="center" style="padding:4px 20px 20px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:260px;width:100%;border-collapse:separate">
        <tr><td align="center" bgcolor="#25D366" style="background:#25D366;border-radius:10px">
          <a href="${escapeHtml(target)}" style="display:block;padding:14px 20px;font-size:16px;font-weight:700;color:#ffffff !important;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,'PingFang TC','Microsoft JhengHei',sans-serif">WhatsApp 回覆客戶</a>
        </td></tr>
      </table>
    </td></tr>`;
}

// ── 安全／來源 metadata（誠實渲染；缺值顯示「未提供」／「未評估」）──────────────
// 契約：本渲染器**唔會**自行推斷風險或網絡性質；只忠實呈現 handler 提供嘅可信欄位。
// 缺資料 → 「未提供驗證結果」＋「未評估」；永不渲染「正常0分」等捏造結論。

/** 真人驗證文字；非法／缺失 → 「未提供驗證結果」（永不假裝已通過）。 */
function verificationText(security?: MailEmailSecurity): string {
  switch (security?.verification) {
    case "verified":
      return "Turnstile 已通過";
    case "unavailable":
      return "驗證服務未完成";
    case "not_checked":
      return "尚未驗證（預覽）";
    default:
      return "未提供驗證結果";
  }
}

/** 只有有限、>= 0 嘅數字才係有效分數；否則 null（永不捏造 0）。 */
function validRiskScore(security?: MailEmailSecurity): number | null {
  const s = security?.risk?.score;
  if (typeof s !== "number" || !Number.isFinite(s) || s < 0) return null;
  return s;
}

/** 需要人工確認（review）—— 只有此狀態才加 `[待確認]` 前綴。 */
function needsReview(security?: MailEmailSecurity): boolean {
  return security?.risk?.level === "review";
}

/** 風險評估文字；低風險需**有效分數**才成立，否則一律「未評估」。 */
function riskText(security?: MailEmailSecurity): string {
  const level = security?.risk?.level;
  const score = validRiskScore(security);
  if (level === "low" && score !== null) return score === 0 ? "未見已知內容風險（0分）" : `有內容風險訊號（${score}分）`;
  if (level === "review") {
    return score !== null ? `需要人工確認（${score}分）` : "需要人工確認（分數未提供）";
  }
  return "未評估";
}

/** 已偵測嘅風險原因逐條顯示；未達 review 門檻亦唔可以隱藏已知訊號。 */
function reviewReasons(security?: MailEmailSecurity): string[] {
  if (security?.risk?.level !== "low" && security?.risk?.level !== "review") return [];
  const reasons = security?.risk?.reasons;
  if (!Array.isArray(reasons)) return [];
  return reasons
    .filter((r) => typeof r === "string" && r.trim() !== "")
    .map((r) => String(r).trim());
}

/** 可信網絡欄位：有提供才顯示，否則「未提供」（唔會推斷 ISP／數據中心／外國風險）。 */
function networkHtml(security?: MailEmailSecurity): string {
  const net = security?.network;
  const asn =
    typeof net?.asn === "number" && Number.isFinite(net.asn) && net.asn >= 0 ? String(net.asn) : "未提供";
  const org =
    net && typeof net.organization === "string" && net.organization.trim() !== "" ? net.organization.trim() : "未提供";
  const country =
    net && typeof net.country === "string" && net.country.trim() !== "" ? net.country.trim() : "未提供";
  return [`ASN：${escapeHtml(asn)}`, `ASN機構：${escapeHtml(org)}`, `國家或地區：${escapeHtml(country)}`]
    .map((line) => `<div style="line-height:1.9">${line}</div>`)
    .join("");
}

/** 安全區塊用嘅扁垂直資料列（與一般資料列同一視覺語言、單一 <td>）。 */
function securityRow(label: string, valueHtml: string): string {
  const cell = `padding:16px 20px 14px;border-bottom:1px solid ${BORDER};vertical-align:top`;
  return `<tr>
    <td style="${cell}">
      <div class="slabel" style="font-size:12px;letter-spacing:.04em;color:${MUTED};font-weight:700;margin-bottom:4px">${escapeHtml(label)}</div>
      <div class="svalue" style="font-size:16px;color:${TEXT};line-height:1.75;word-break:break-word">${valueHtml}</div>
    </td>
  </tr>`;
}

/** 安全與來源資訊區塊：真人驗證／風險評估／來源資訊（缺資料亦照顯示「未提供」）。 */
function buildSecurityBlock(f: MailEmailFixture): string {
  const sec = f.security;
  const reasons = reviewReasons(sec);
  const reasonList = reasons.length
    ? `<div style="margin-top:6px">${reasons
        .map(
          (r) =>
            `<div style="font-size:14px;color:${TEXT};line-height:1.7;padding-left:16px;text-indent:-16px">• ${escapeHtml(
              r,
            )}</div>`,
        )
        .join("")}</div>`
    : "";
  return `<tr><td style="padding:20px 20px 4px">
      <div style="font-size:13px;font-weight:700;color:${BRAND_BLUE};padding-bottom:8px;margin-bottom:8px;border-bottom:2px solid ${BRAND_GOLD}">安全與來源資訊</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
        ${securityRow("真人驗證", escapeHtml(verificationText(sec)))}
        ${securityRow("風險評估", escapeHtml(riskText(sec)) + reasonList)}
        ${securityRow("來源資訊", networkHtml(sec))}
      </table>
    </td></tr>`;
}

function buildFooter(f: MailEmailFixture): string {
  const sourceLabel = f.source === "assessment" ? "網站需求評估問卷（/start/）" : "網站聯絡表單";
  const parts: string[] = [`來源：${escapeHtml(sourceLabel)}`];
  if (f.ip) parts.push(`IP：${escapeHtml(f.ip)}`);
  if (f.country) parts.push(`地區：${escapeHtml(f.country)}`);
  if (f.ua) parts.push(`User Agent：${escapeHtml(f.ua)}`);
  return `<div style="font-size:11px;color:${MUTED};line-height:1.7;border-top:1px solid ${BORDER};padding-top:12px;word-break:break-word">
      ${parts.join("<br>")}<br>
      由 Cloudflare Worker 接收（PHP 版已停用）
    </div>`;
}

/**
 * 渲染交易郵件。回傳 { subject, html }，與 functions/send-mail.php.ts buildEmail 對齊。
 * 純函數：無副作用、無網絡、無外部字體／依賴（logo 為品牌資產 URL，僅在收件端載入）。
 */
export function buildMailEmail(f: MailEmailFixture): { subject: string; html: string } {
  const subject = buildSubject(f);
  const isAssessment = f.source === "assessment";
  const title = isAssessment ? "需求評估查詢" : "新客戶查詢";
  // `[待確認]` 同時反映在標題（header），僅限安全風險 review；與銷售 A/B/C 級無關。
  const titleDisplay = needsReview(f.security) ? `[待確認] ${title}` : title;

  // 一般資訊列（過濾空值／「未指定」，與原 buildEmail 一致，確保不靜默遺失）。
  // 姓名置頂併入同一垂直資料流，避免與頂部摘要重複。
  const rows: Array<[string, string]> = (
    [
      ["姓名", f.name],
      ["電話", f.phone],
      ["電郵", f.email],
      ["公司／品牌", f.company],
      ["公司網站", f.companySite],
      ["預算區間", f.budget],
      ["預計開始", f.timeline],
      ["現有系統／技術", f.systemInfo],
    ] as Array<[string, string]>
  ).filter(([, v]) => v && v !== "未指定");
  const infoRows = rows.map(([k, v]) => infoRow(k, v)).join("");

  // 訊息處理：評估格式 → 解析欄位 + 註解；否則一律原文字面保留。
  let assessmentBlock = "";
  let noteBlock = "";
  if (isAssessment) {
    const parsed = parseAssessmentMessage(f.message);
    if (parsed) {
      assessmentBlock = buildAssessmentBlock(parsed);
      noteBlock = buildNoteBlock(parsed.note, "客人補充");
    } else {
      // 奇形怪狀／格式不符 → 原文可讀兜底，絕不誤解析。
      noteBlock = buildNoteBlock(f.message, "訊息");
    }
  } else {
    noteBlock = buildNoteBlock(f.message, "客戶訊息");
  }

  // WhatsApp CTA 置於客戶訊息／客人補充之後、安全資訊之前；無效電話則整段省略。
  const whatsappCta = buildWhatsAppCta(f);
  const securityBlock = buildSecurityBlock(f);

  const html = `<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${PAGE_BG};font-family:'Helvetica Neue',Helvetica,Arial,'PingFang TC','Microsoft JhengHei',sans-serif;line-height:1.75">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE_BG};padding:20px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;width:100%;background:#ffffff;border:1px solid ${BORDER};border-radius:14px;overflow:hidden">
        <tr><td style="background:#ffffff;padding:20px 20px;border-bottom:3px solid ${BRAND_BLUE}">
          <img src="${LOGO_SRC}" width="150" alt="${LOGO_ALT}" style="display:block;border:0;height:auto">
          <div style="margin-top:10px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${MUTED};font-weight:700">網站查詢通知</div>
        </td></tr>
        <tr><td style="background:${BRAND_BLUE};padding:16px 20px;color:#ffffff">
          <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${BRAND_GOLD};font-weight:700">ADWire Agency</div>
          <div style="font-size:20px;font-weight:700;margin-top:6px">${escapeHtml(titleDisplay)}</div>
        </td></tr>
        <tr><td style="padding:20px 20px 12px">${buildHero(f)}</td></tr>
        <tr><td style="padding:0 20px 4px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${infoRows}</table>
        </td></tr>
        ${assessmentBlock}
        ${noteBlock}
        ${whatsappCta}
        ${securityBlock}
        <tr><td style="padding:16px 20px 20px">${buildFooter(f)}</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { subject, html };
}

/**
 * lib/mail-runtime.ts — 寄信韌性 runtime（outbox／自動重試／ops 健康檢查／probe）
 *
 * 背景：Cloudflare Pages Function（functions/send-mail.php.ts）在供應商（Resend）
 * 非 2xx、網絡錯誤或缺少設定時會寄唔出 lead。呢個模組提供「唔會假成功」嘅韌性：
 *   1) 初次寄信失敗時，將「凍結嘅 EXACT 供應商 payload」存去不可變
 *      `mailoutbox:<requestId>`（30 日 TTL）。payload 一經寫入就唔會改。
 *   2) 另以 `mailoutboxstate:<requestId>` 追蹤可變狀態（pending／accepted／
 *      manual_review）。因為 KV 同一 key 每秒最多寫 1 次，狀態同 payload 分開
 *      兩個 key，令「一次 terminal 寫一次」永遠唔會撞上限。
 *   3) 初次寄信同每次重試都用同一個 `Idempotency-Key`（由穩定嘅 requestId 導出）
 *      ＋ 完全一樣嘅 frozen JSON payload。供應商嘅 idempotency 令「並行／重複呼叫」
 *      安全；我哋**唔**聲稱 KV 提供 exactly-once。
 *   4) 自動重試只限「首次嘗試後 23 小時內」（供應商 idempotency 為 24 小時），
 *      最多 6 次、指數退避（5/15/30/60/120 分鐘）；過期或達上限即標 manual_review，
 *      唔會再自動寄。
 *
 * 安全／私隱：
 *   - 呢個模組**唔會** delete 任何紀錄。
 *   - ops 端點只回傳布林／計數，絕不回傳秘密、hash 或供應商原文。
 *   - 冇 @cloudflare/workers-types：用結構性型別（KVWriter／MailKV），
 *     令 functions/send-mail.php.ts（只有 get/put）同 functions/inbox.ts（get/put/list）
 *     都可以直接傳入。
 */

// ── 常數 ──────────────────────────────────────────────────────────────────────
export const MAIL_PROTECTION_VERSION = "mail-protection-v1";
export const RESEND_URL = "https://api.resend.com/emails";

/** outbox payload 保留 30 日 */
export const OUTBOX_TTL_S = 60 * 60 * 24 * 30;
/** outbox 狀態保留 30 日 */
export const OUTBOX_STATE_TTL_S = 60 * 60 * 24 * 30;

/** 自動重試窗口：首次嘗試後 23 小時（供應商 idempotency 為 24 小時） */
export const RETRY_WINDOW_MS = 23 * 60 * 60 * 1000;
/** 合共最多 6 次嘗試（初次 1 次 + 最多 5 次重試） */
export const MAX_ATTEMPTS = 6;
/** 每次 retry 呼叫最多重播 10 條（避免一次性大量外呼） */
export const RETRY_BATCH_LIMIT = 10;
/** KV list 每頁大小 */
export const RETRY_PAGE_SIZE = 20;
/** 每次 retry 呼叫最多掃描幾多個 state key（有界，避免無上限讀取） */
export const RETRY_SCAN_LIMIT = 100;
/**
 * 重試掃描游標 key。刻意**唔**屬於客戶狀態前綴（`mailoutboxstate:`），
 * 所以佢唔會被 outbox 掃描／health／清理當成客戶紀錄；亦**永不 delete**。
 * 每次 retry 呼叫：先讀游標 → 由游標位置開始有界掃描 → 將新游標寫返。
 * 呢個游標令「已 accepted 但仍然保留 30 日」嘅舊 key 唔會永久霸住掃描窗口，
 * 使 >RETRY_SCAN_LIMIT 個 retained state 之下仍然可以公平輪轉到後面嘅 pending。
 */
export const RETRY_CURSOR_KEY = "mailcontrol:retry-cursor";
/** health 掃描 outbox 狀態嘅上限 */
export const OPS_HEALTH_SCAN_LIMIT = 100;
/** 指數退避（分鐘）：第 1 次失敗後 +5 分鐘、第 2 次 +15… 第 5 次 +120 */
export const RETRY_BACKOFF_MINUTES: readonly number[] = [5, 15, 30, 60, 120];

/** probe 固定收件人（唔可以由請求指定） */
export const PROBE_RECIPIENT = "info@adwire.com.hk";
/** probe 固定標題 */
export const PROBE_SUBJECT = "【系統測試】ADWire 部署寄信驗收";

// ── 結構性 KV 型別 ────────────────────────────────────────────────────────────
export interface KVWriter {
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
}

export interface MailKV extends KVWriter {
  get(key: string): Promise<string | null>;
  list(opts?: {
    prefix?: string;
    limit?: number;
    cursor?: string;
  }): Promise<{ keys: Array<{ name: string }>; list_complete?: boolean; cursor?: string }>;
}

// ── 紀錄型別 ──────────────────────────────────────────────────────────────────
export type OutboxStatus = "pending" | "accepted" | "manual_review";

/** 不可變 outbox 紀錄（`mailoutbox:<requestId>`）——只寫一次，永不改寫。 */
export interface OutboxRecord {
  requestId: string;
  createdAt: string;
  /** 由 requestId 導出，初次寄信同每次重試都用同一個 */
  idempotencyKey: string;
  providerUrl: string;
  /** 凍結嘅 EXACT 供應商 JSON body（一經寫入唔會重建） */
  payload: string;
  source: "assessment" | "contact";
}

/** 可變 outbox 狀態（`mailoutboxstate:<requestId>`）——每個 terminal 結果寫一次。 */
export interface OutboxState {
  requestId: string;
  createdAt: string;
  updatedAt: string;
  status: OutboxStatus;
  attempts: number;
  firstAttemptAt: string;
  lastAttemptAt: string;
  nextRetryAt: string | null;
  providerStatus: number | null;
  providerEmailId?: string;
  code: string;
}

// ── key builders ──────────────────────────────────────────────────────────────
export const outboxKey = (requestId: string): string => `mailoutbox:${requestId}`;
export const outboxStateKey = (requestId: string): string => `mailoutboxstate:${requestId}`;

// ── 小工具 ────────────────────────────────────────────────────────────────────
export function stringifyError(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/** trimmed non-empty 才算「已設定」（避免 "   " 被當成有效秘密／設定）。 */
export function hasText(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/** 由穩定嘅隨機 requestId 導出供應商 Idempotency-Key。 */
export function deriveIdempotencyKey(requestId: string): string {
  return `adwire-mail-${requestId}`;
}

/** 固定時間比較（唔短路，XOR 全長），避免時序側通道。 */
export function safeEqual(a: string, b: string): boolean {
  const A = new TextEncoder().encode(a);
  const B = new TextEncoder().encode(b);
  let diff = A.length ^ B.length;
  const n = Math.max(A.length, B.length);
  for (let i = 0; i < n; i++) diff |= (A[i] ?? 0) ^ (B[i] ?? 0);
  return diff === 0;
}

/** 檢查 Bearer header 是否等於預期 token（固定時間）。 */
export function checkBearer(authHeader: string | null, expected: string): boolean {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  return safeEqual(authHeader.slice(7), expected);
}

/** 第 `attempt` 次失敗之後嘅退避分鐘數（attempt 由 1 起）。 */
export function backoffMinutesForAttempt(attempt: number): number {
  const idx = Math.min(Math.max(attempt, 1), RETRY_BACKOFF_MINUTES.length) - 1;
  return RETRY_BACKOFF_MINUTES[idx];
}

export function computeNextRetryAt(attempts: number, fromMs: number): string {
  return new Date(fromMs + backoffMinutesForAttempt(attempts) * 60_000).toISOString();
}

/** 首次嘗試是否已超出 23 小時窗口（parse 失敗即視為過期，fail-closed）。 */
export function isExpired(firstAttemptAt: string, nowMs: number): boolean {
  const t = Date.parse(firstAttemptAt);
  if (!Number.isFinite(t)) return true;
  return nowMs - t >= RETRY_WINDOW_MS;
}

/** 某狀態而家係咪應該自動重試。 */
export function isDue(st: OutboxState, nowMs: number): boolean {
  if (st.status !== "pending") return false;
  if (st.attempts >= MAX_ATTEMPTS) return false;
  if (isExpired(st.firstAttemptAt, nowMs)) return false;
  if (st.nextRetryAt && Date.parse(st.nextRetryAt) > nowMs) return false;
  return true;
}

function parseState(raw: string | null): OutboxState | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as Partial<OutboxState>;
    if (!o || typeof o.requestId !== "string" || typeof o.status !== "string") return null;
    return o as OutboxState;
  } catch {
    return null;
  }
}

function parseRecord(raw: string | null): OutboxRecord | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as Partial<OutboxRecord>;
    if (!o || typeof o.payload !== "string" || typeof o.idempotencyKey !== "string") return null;
    return o as OutboxRecord;
  } catch {
    return null;
  }
}

// ── outbox 寫入（immutable payload ＋ mutable state 各一次）───────────────────
/** 寫入不可變 outbox 紀錄；成功回 true。絕不改寫既有紀錄。 */
export async function enqueueOutbox(kv: KVWriter | undefined, rec: OutboxRecord): Promise<boolean> {
  if (!kv) return false;
  try {
    await kv.put(outboxKey(rec.requestId), JSON.stringify(rec), { expirationTtl: OUTBOX_TTL_S });
    return true;
  } catch (e) {
    console.error("[mail-runtime] outbox put failed", stringifyError(e));
    return false;
  }
}

/** 寫入可變狀態（每次 terminal 結果恰一次）；成功回 true。 */
export async function writeOutboxState(kv: KVWriter | undefined, st: OutboxState): Promise<boolean> {
  if (!kv) return false;
  try {
    await kv.put(outboxStateKey(st.requestId), JSON.stringify(st), { expirationTtl: OUTBOX_STATE_TTL_S });
    return true;
  } catch (e) {
    console.error("[mail-runtime] outbox state put failed", stringifyError(e));
    return false;
  }
}

/**
 * 初次寄信失敗時保存：先寫不可變 payload，再寫可變狀態（兩個不同 key，各寫一次）。
 * 只有兩者都成功才回 true（queued=true 必須真確）。
 */
export async function persistFailedAttempt(
  kv: KVWriter | undefined,
  rec: OutboxRecord,
  st: OutboxState,
): Promise<boolean> {
  const recSaved = await enqueueOutbox(kv, rec);
  if (!recSaved) return false;
  return await writeOutboxState(kv, st);
}

export async function readOutboxState(kv: MailKV | undefined, requestId: string): Promise<OutboxState | null> {
  if (!kv) return null;
  try {
    return parseState(await kv.get(outboxStateKey(requestId)));
  } catch {
    return null;
  }
}

export async function readOutboxRecord(kv: MailKV | undefined, requestId: string): Promise<OutboxRecord | null> {
  if (!kv) return null;
  try {
    return parseRecord(await kv.get(outboxKey(requestId)));
  } catch {
    return null;
  }
}

// ── 供應商呼叫（單一入口：初次寄信與每次重試共用）────────────────────────────
export interface ProviderResult {
  status: number | null;
  ok: boolean;
  emailId?: string;
  networkError: boolean;
  /** 供應商錯誤原文／例外訊息（呼叫端負責遮罩後才寫診斷） */
  errorDetail: string;
  /** 例外名稱（網絡錯誤時）或 "provider_error" */
  errorName: string;
}

/**
 * POST frozen payload 去供應商。帶 `Idempotency-Key`（由 requestId 導出），
 * 令並行／重複呼叫安全。**唔會**喺呢層遮罩或記錄秘密。
 */
export async function providerSend(
  providerUrl: string,
  payload: string,
  idempotencyKey: string,
  apiKey: string,
): Promise<ProviderResult> {
  try {
    const res = await fetch(providerUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: payload,
    });
    if (!res.ok) {
      let detail = "";
      try {
        detail = await res.text();
      } catch {
        detail = "";
      }
      return { status: res.status, ok: false, networkError: false, errorDetail: detail, errorName: "provider_error" };
    }
    let emailId: string | undefined;
    try {
      const data = (await res.json()) as { id?: unknown };
      if (data && typeof data.id === "string") emailId = data.id.slice(0, 200);
    } catch {
      /* body 唔係 JSON：安全忽略，唔影響 accepted */
    }
    return { status: res.status, ok: true, emailId, networkError: false, errorDetail: "", errorName: "" };
  } catch (e) {
    return {
      status: null,
      ok: false,
      networkError: true,
      errorDetail: stringifyError(e),
      errorName: e instanceof Error ? e.name : "Error",
    };
  }
}

// ── 自動重試批次 ──────────────────────────────────────────────────────────────
export interface RetryError {
  requestId: string;
  code: string;
  providerStatus: number | null;
}

export interface RetryOutcome {
  /** 今次呼叫實際向供應商重播嘅條數 */
  processed: number;
  /** 其中被供應商接受嘅條數 */
  accepted: number;
  /** 掃描窗口內仍然 pending 嘅條數 */
  pending: number;
  /** 掃描窗口內 manual_review 嘅條數（含今次新標記） */
  manualReview: number;
  /** 重播失敗／過期／缺 payload／儲存層問題嘅錯誤（供應商原文唔會出現） */
  errors: RetryError[];
  /**
   * true 表示掃描／游標嘅 KV 儲存層失敗，今次 outcome **唔可信**（不可視為乾淨
   * 成功）。呼叫端（/inbox?mailops=retry 同 watchdog）應將佢當成告警訊號，
   * 唔可以因為 processed=accepted=0 就當「冇嘢要重播」。儲存層問題會以
   * `{ requestId: "", code: "retry_storage_error" | "retry_cursor_error" }` 形式
   * 記入 errors，方便結構化偵測（唔含任何秘密）。
   */
  storageError: boolean;
}

/**
 * 重播「已排隊且到期」嘅 outbox 紀錄。
 *
 * 有界讀取：先由獨立 key `mailcontrol:retry-cursor`（唔屬客戶狀態前綴、永不
 * 刪除）讀取掃描游標，再由該位置開始以 KV cursor 分頁掃描 `mailoutboxstate:`，
 * 每次呼叫最多掃 RETRY_SCAN_LIMIT 個 key、最多重播 RETRY_BATCH_LIMIT 條；掃描
 * 完結後將新游標寫返（wrap 時寫空字串代表「由頭開始」）。
 *
 * 之前嘅 bug：每次呼叫都 cursor=undefined 由頭掃，當前面有一大堆已終結
 * （accepted／manual_review）但仍然 retained 30 日嘅 state 時，佢哋會永久霸住
 * 掃描窗口，後面嘅 pending 永遠輪唔到。持久化游標令掃描位置跨呼叫向前推進，
 * 即使 retained state 多過 RETRY_SCAN_LIMIT 亦會公平輪轉，唔會餓死。
 *
 * 儲存層（讀游標／list／寫游標）失敗時**唔會**靜靜地回一個 all-zero 成功；
 * 會設 `storageError=true` 並以 `requestId:""` 記錄安全嘅結構化錯誤碼。
 *
 * 唔會 delete 任何紀錄（包括游標 key）；每個 terminal 結果只寫一次狀態。
 */
export async function runRetryBatch(
  kv: MailKV | undefined,
  opts: { apiKey: string | undefined; nowMs?: number },
): Promise<RetryOutcome> {
  const nowMs = opts.nowMs ?? Date.now();
  const out: RetryOutcome = { processed: 0, accepted: 0, pending: 0, manualReview: 0, errors: [], storageError: false };
  const apiKey = opts.apiKey;
  if (!kv || !hasText(apiKey)) return out;

  /** 儲存層失敗：安全結構化錯誤，明確表示今次 outcome 唔可信（requestId 為空）。 */
  const markStorageError = (code: "retry_storage_error" | "retry_cursor_error"): RetryOutcome => {
    out.storageError = true;
    out.errors.push({ requestId: "", code, providerStatus: null });
    return out;
  };

  /** 由 startCursor 起有界掃描 state keys；回傳狀態同下一個續掃游標（undefined = wrap）。 */
  const scanStates = async (
    startCursor: string | undefined,
  ): Promise<{ states: OutboxState[]; nextCursor: string | undefined }> => {
    const found: OutboxState[] = [];
    let cursor = startCursor;
    let scanned = 0;
    while (scanned < RETRY_SCAN_LIMIT) {
      const page = await kv.list({ prefix: "mailoutboxstate:", limit: RETRY_PAGE_SIZE, cursor });
      const keys = page.keys.map((k) => k.name);
      scanned += keys.length;
      for (const key of keys) {
        const st = parseState(await kv.get(key));
        if (st) found.push(st);
      }
      if (page.list_complete || !page.cursor || keys.length === 0) {
        return { states: found, nextCursor: undefined }; // 掃到盡 → 下一輪由頭
      }
      cursor = page.cursor; // 到掃描上限就由呢度續掃
    }
    return { states: found, nextCursor: cursor };
  };

  // 1) 讀游標（獨立 key；讀唔到即 fail-closed，唔可以用「每次由頭掃」嘅舊 bug 行為）
  let startCursor: string | undefined;
  try {
    const raw = await kv.get(RETRY_CURSOR_KEY);
    if (hasText(raw)) startCursor = raw;
  } catch (e) {
    console.error("[mail-runtime] retry cursor read failed", stringifyError(e));
    return markStorageError("retry_storage_error");
  }

  // 2) 有界掃描（由持久化游標開始，cursor 分頁）
  let states: OutboxState[];
  let nextCursor: string | undefined;
  try {
    ({ states, nextCursor } = await scanStates(startCursor));
  } catch (e) {
    console.error("[mail-runtime] retry scan failed", stringifyError(e));
    if (startCursor !== undefined) {
      // 游標可能已失效（KV cursor 有時效）：由頭再掃一次（有界：最多兩輪）
      try {
        ({ states, nextCursor } = await scanStates(undefined));
      } catch (e2) {
        console.error("[mail-runtime] retry rescan failed", stringifyError(e2));
        return markStorageError("retry_storage_error");
      }
    } else {
      return markStorageError("retry_storage_error");
    }
  }

  // 3) 過期／達上限 → 標 manual_review（唔自動寄）
  for (const st of states) {
    if (st.status !== "pending") continue;
    if (st.attempts >= MAX_ATTEMPTS || isExpired(st.firstAttemptAt, nowMs)) {
      st.status = "manual_review";
      st.updatedAt = new Date(nowMs).toISOString();
      st.nextRetryAt = null;
      st.code = st.attempts >= MAX_ATTEMPTS ? "max_attempts" : "expired";
      await writeOutboxState(kv, st);
      out.errors.push({ requestId: st.requestId, code: st.code, providerStatus: st.providerStatus ?? null });
    }
  }

  // 4) 重播到期項目（最多 RETRY_BATCH_LIMIT 條）
  for (const st of states) {
    if (out.processed >= RETRY_BATCH_LIMIT) break;
    if (!isDue(st, nowMs)) continue;

    const rec = await readOutboxRecord(kv, st.requestId);
    if (!rec) {
      // 冇 frozen payload：唔可以亂砌，標 manual_review
      st.status = "manual_review";
      st.updatedAt = new Date(nowMs).toISOString();
      st.nextRetryAt = null;
      st.code = "payload_missing";
      await writeOutboxState(kv, st);
      out.errors.push({ requestId: st.requestId, code: "payload_missing", providerStatus: null });
      continue;
    }

    out.processed++;
    const result = await providerSend(rec.providerUrl, rec.payload, rec.idempotencyKey, apiKey);
    const attempts = st.attempts + 1;
    const nowIso = new Date(nowMs).toISOString();

    if (result.ok) {
      st.status = "accepted";
      st.attempts = attempts;
      st.updatedAt = nowIso;
      st.lastAttemptAt = nowIso;
      st.nextRetryAt = null;
      st.providerStatus = result.status;
      st.providerEmailId = result.emailId;
      st.code = "ok";
      await writeOutboxState(kv, st);
      out.accepted++;
    } else {
      const code = result.networkError ? "network_error" : "provider_error";
      st.attempts = attempts;
      st.updatedAt = nowIso;
      st.lastAttemptAt = nowIso;
      st.providerStatus = result.status;
      st.code = code;
      if (attempts >= MAX_ATTEMPTS || isExpired(st.firstAttemptAt, nowMs)) {
        st.status = "manual_review";
        st.nextRetryAt = null;
      } else {
        st.status = "pending";
        st.nextRetryAt = computeNextRetryAt(attempts, nowMs);
      }
      await writeOutboxState(kv, st);
      out.errors.push({ requestId: st.requestId, code, providerStatus: result.status });
    }
  }

  // 5) 由最終狀態計出窗口內 pending／manualReview
  for (const st of states) {
    if (st.status === "pending") out.pending++;
    else if (st.status === "manual_review") out.manualReview++;
  }

  // 6) 掃描完結 → 將游標寫返（wrap 時寫空字串；永不 delete key）
  try {
    await kv.put(RETRY_CURSOR_KEY, nextCursor ?? "");
  } catch (e) {
    console.error("[mail-runtime] retry cursor persist failed", stringifyError(e));
    return markStorageError("retry_cursor_error");
  }
  return out;
}

// ── 健康檢查（無秘密／無 hash）────────────────────────────────────────────────
export interface MailChecks {
  resendKey: boolean;
  turnstileSecret: boolean;
  inboxPassword: boolean;
  outboxStorage: boolean;
  opsToken: boolean;
}

export interface HealthResult {
  ok: boolean;
  version: string;
  checks: MailChecks;
  outbox: { pending: number; manualReview: number };
}

async function countOutbox(
  kv: MailKV,
  scanLimit: number,
): Promise<{ pending: number; manualReview: number }> {
  const res = { pending: 0, manualReview: 0 };
  let cursor: string | undefined;
  let scanned = 0;
  while (scanned < scanLimit) {
    const page = await kv.list({ prefix: "mailoutboxstate:", limit: RETRY_PAGE_SIZE, cursor });
    const keys = page.keys.map((k) => k.name);
    scanned += keys.length;
    for (const key of keys) {
      const st = parseState(await kv.get(key));
      if (!st) continue;
      if (st.status === "pending") res.pending++;
      else if (st.status === "manual_review") res.manualReview++;
    }
    if (page.list_complete || !page.cursor) break;
    cursor = page.cursor;
    if (keys.length === 0) break;
  }
  return res;
}

/**
 * 由實際 context.env 計算 readiness。checks 只回布林，絕不回傳秘密或 hash。
 * outboxStorage 會做一次真正 KV read（list ＋ get）以確認可讀。
 * ok = 所有 check 皆 true（readiness 代表「mail-protection 完全就緒」，
 * 與 ops／部署工具（mail-readiness.mjs）嘅 REQUIRED_CHECKS 一致）。
 */
export async function runHealth(env: {
  RESEND_API_KEY?: string;
  TURNSTILE_SECRET?: string;
  INBOX_PASSWORD?: string;
  MAIL_OPS_TOKEN?: string;
  ENQUIRIES?: MailKV;
}): Promise<HealthResult> {
  const checks: MailChecks = {
    resendKey: hasText(env.RESEND_API_KEY),
    turnstileSecret: hasText(env.TURNSTILE_SECRET),
    inboxPassword: hasText(env.INBOX_PASSWORD),
    outboxStorage: false,
    opsToken: hasText(env.MAIL_OPS_TOKEN),
  };
  const outbox = { pending: 0, manualReview: 0 };

  if (env.ENQUIRIES) {
    try {
      const probe = await env.ENQUIRIES.list({ prefix: "mailoutboxstate:", limit: 1 });
      if (probe.keys.length > 0) await env.ENQUIRIES.get(probe.keys[0].name);
      const counts = await countOutbox(env.ENQUIRIES, OPS_HEALTH_SCAN_LIMIT);
      outbox.pending = counts.pending;
      outbox.manualReview = counts.manualReview;
      checks.outboxStorage = true;
    } catch (e) {
      console.error("[mail-runtime] health KV read failed", stringifyError(e));
      checks.outboxStorage = false;
    }
  }

  const ok =
    checks.resendKey &&
    checks.turnstileSecret &&
    checks.inboxPassword &&
    checks.outboxStorage &&
    checks.opsToken;
  return { ok, version: MAIL_PROTECTION_VERSION, checks, outbox };
}

// ── 受控 probe（固定測試信，唔入 queue／唔寫紀錄）────────────────────────────
export interface ProbeResult {
  ok: boolean;
  requestId: string;
  providerStatus: number | null;
  providerEmailId?: string;
  errorCode?: string;
}

/**
 * 只寄一封「固定」測試信：固定收件人（限定 info@adwire.com.hk）、固定標題、
 * 固定 HTML。唔會寫 enquiry／outbox。MAIL_TO 一旦被改成其他地址即拒絕。
 */
export async function runProbe(opts: {
  apiKey?: string;
  mailTo?: string;
  mailFrom?: string;
  providerUrl?: string;
}): Promise<ProbeResult> {
  const requestId = crypto.randomUUID();
  if (hasText(opts.mailTo) && opts.mailTo.trim().toLowerCase() !== PROBE_RECIPIENT.toLowerCase()) {
    return { ok: false, requestId, providerStatus: null, errorCode: "locked_recipient" };
  }
  if (!hasText(opts.apiKey)) {
    return { ok: false, requestId, providerStatus: null, errorCode: "missing_config" };
  }
  const payload = JSON.stringify({
    from: hasText(opts.mailFrom) ? opts.mailFrom : "ADWire Website <website@adwire.com.hk>",
    to: [PROBE_RECIPIENT],
    subject: PROBE_SUBJECT,
    html: '<!DOCTYPE html><html lang="zh-Hant"><body style="font-family:sans-serif"><h2>ADWire 部署寄信驗收</h2><p>呢封係系統測試信，用嚟確認部署後 Resend 寄信正常。收到即表示寄信通路正常。</p></body></html>',
  });
  const result = await providerSend(
    opts.providerUrl || RESEND_URL,
    payload,
    deriveIdempotencyKey(requestId),
    opts.apiKey,
  );
  if (result.ok) {
    return { ok: true, requestId, providerStatus: result.status, providerEmailId: result.emailId };
  }
  return {
    ok: false,
    requestId,
    providerStatus: result.status,
    errorCode: result.networkError ? "network_error" : "provider_error",
  };
}

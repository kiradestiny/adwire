# ADWire 郵件保護獨立監察 Worker（adwire-mail-watchdog）

一個**獨立於 Resend** 嘅 Cloudflare Worker，每 5 分鐘檢查 ADWire 網站嘅郵件保護後端，
一旦偵測到異常就用 **AgentMail**（第二管道）發告警到 `info@adwire.com.hk`。

## 行為契約

Cron（每 5 分鐘）觸發 `scheduled`：

1. `GET  {SITE_URL}/inbox?mailops=health`（`Authorization: Bearer <MAIL_OPS_TOKEN>`）
   - 期望 JSON：`{ ok, version:"mail-protection-v1", checks:{resendKey,turnstileSecret,inboxPassword,outboxStorage,opsToken}, outbox:{pending,manualReview} }`
2. 健康時 → `POST {SITE_URL}/inbox?mailops=retry`（同一個 Bearer）
   - 期望 JSON：`{ ok, processed, accepted, pending, manualReview, errors:[{requestId,code,providerStatus}] }`
   - 由後端決定邊啲項目到期，Worker 唔會自行加大重試量。

**觸發告警嘅情況**：缺設定（`checks` 有 false）／不健康（非 2xx 或 `ok:false`）／
認證失敗（401/403）／網絡失敗（逾時或連線錯誤）／重試錯誤（`errors` 非空或非 2xx）／
有待人手覆核（`manualReview > 0`）。

**去重（避免洗版）**：同一 fingerprint 首次即刻告警，之後每鐘最多一次；復原只告警一次。

> ⚠️ 本 Worker 只經 AgentMail 發告警。AgentMail 不可用時只記錄，**永遠唔會**退回 Resend
> 或其他供應商——避免連鎖失效。

## 設定

`wrangler.jsonc`：
- `name`: `adwire-mail-watchdog`
- `compatibility_date`: `2026-10-26`
- `triggers.crons`: `["*/5 * * * *"]`（每 5 分鐘；Cloudflare cron 一律 UTC）
- `kv_namespaces`: `WATCH_STATE` — namespace id 由父層填入（已非 placeholder）。
- `vars`（非秘密）：`SITE_URL`、`ALERT_TO=info@adwire.com.hk`、`AGENTMAIL_INBOX_ID=adwire-hermes3099@agentmail.to`

Secret（**唔可以 commit**，用 `wrangler secret put` 注入）：
- `AGENTMAIL_API_KEY`
- `MAIL_OPS_TOKEN`

## 端點

| Method | Path | 說明 |
| --- | --- | --- |
| `GET` | `/` | 公開：只回 `{ok,worker,version,status,protectionVersion}`，零副作用。 |
| `POST` | `/run` | 需 `Authorization: Bearer <MAIL_OPS_TOKEN>`，執行一次監察並回傳摘要。 |
| `POST` | `/run?testAlert=1` | 需同樣認證；發一封主旨為 `【系統測試】獨立告警驗收` 嘅測試告警，**唔會**捏造 incident 或改動 KV。回 `{ok,alertSent,messageId}`；供應商拒絕時回 502（唔會報假成功）。 |
| — | `/run`（GET） | `405`，唔安全嘅 GET 絕對冇副作用。 |

## 狀態

只用 `WATCH_STATE` KV 存運維 metadata：`alert:<kind>` → `{active,lastAt,count}`。
- 冇客戶紀錄、冇表單內容、冇秘密。
- 只讀寫，**永不刪除**（復原時標記 `active:false`）。

## 安全

- `MAIL_OPS_TOKEN` 用固定長度逐字元比較、fail-closed（未設定即永不放行）。
- 只 fetch 固定站點端點同固定 AgentMail 端點，**唔會** fetch 請求帶入嘅任意 URL（無 SSRF）。
- 所有 fetch 設逾時（`FETCH_TIMEOUT_MS`，預設 8000）。
- 回應、KV、告警內文都唔含秘密或 PII（告警只帶安全計數／`requestId`／狀態碼）。

## 測試

```bash
node --experimental-strip-types tests/mail-watchdog.test.ts
```

零真實網絡、零真實寄信、零部署（mock fetch ＋ in-memory KV ＋ 注入時鐘）。

## AgentMail REST 來源

依官方文件 `https://api.agentmail.to/v0/inboxes/{inbox_id}/messages/send`（`docs.agentmail.to`）：
`Authorization: Bearer <key>`、body `{to,subject,text,html?}`、回應 `{message_id,thread_id}`；
未驗證帳戶只能寄去 sign-up 嘅 human email，否則 403 `message_rejected`。

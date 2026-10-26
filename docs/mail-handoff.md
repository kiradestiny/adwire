# ADWire 寄信事故：交接、不可刪除項目及未完成工作

> 整理日期：2026-10-26 15:26（香港時間）。下列係已保存嘅驗證紀錄，唔係保證外部系統永遠維持同一狀態。接手時先唯讀核對，唔好先部署、清理、輪換 key 或刪資料。
>
> **STATUS：2026-10-26 用戶已明確確認成功收到真實問卷 email，寄信故障嘅收信驗收已通過。後續新版 email／真人驗證防護已獲「上線啦」授權並正式部署，canonical `7baa6554-9fa0-4643-bdcc-9297f0bbd162`，source `13039a3f838b983be253ec6671f5bae05d53f0fa`；runtime smoke 通過；用戶其後提供 Gmail 截圖，已確認收到新版普通表單通知。用戶指出漏咗 WhatsApp 回覆客戶 button，呢個功能漏項另行修補；唔將收信確認當成全部功能驗收。**
>
> **本機新預覽工作另見 `docs/mail-email-preview.md`，分支 `feat/mail-readability-security-preview`。新 email／防護已部署；版本化證據見 `deliverables/mail-email-preview/production-release.json`，仍唔可誤用舊 main／舊 out。**
>
> **最危險嘅遺漏：修復尚未合併到 GitHub `main`。直接部署舊 `main` 會倒退。**

## 1. 接手第一步（只讀）

1. 先讀本文件、`docs/mail-operations.md`、`ops/mail-watchdog/README.md`。
2. 核對工作目錄、`git status --short --branch`、remote history，以及 Cloudflare Pages 實際 canonical deployment；唔好由 Git 分支名推斷正式站版本。
3. 比較下一節嘅 snapshot。有更新／分歧時停低查清楚，保留新工作；唔可以用本文件嘅舊數字硬覆蓋現況。
4. 未獲相應授權之前只做調查；「接手」唔等於可以刪紀錄、換服務、改 DNS 或重新部署。

本機 repo：`C:/Users/user/repos/adwire`。GitHub：`kiradestiny/adwire`。

## 2. 已驗證版本及部署陷阱

| 項目 | 最後保存嘅狀態 |
|---|---|
| 修復分支 | `fix/mail-diagnostics-20261026`（已 push，遠端 SHA 已讀回核對） |
| 分支實作 HEAD | `d4ac548ac8c7223a824f77488c532557e4480392`；之後可再有文件提交，應核對 Git |
| 三層保護實作 | `ffcf86660f0b103ba0b13ef1ac686aa5027b2901` |
| 監察 Worker runtime 修正 | `d4ac548ac8c7223a824f77488c532557e4480392` |
| `origin/main`（2026-10-26 15:26 fetch 核對） | `b1488a63d7d2e0d4f365ed0f65723d56875148cd`，未包含上述修復 |
| 正式 Pages project | `adwire-site`，正式網址 `https://adwire.com.hk` |
| 正式 Pages deployment | `7baa6554-9fa0-4643-bdcc-9297f0bbd162`，source `13039a3f838b983be253ec6671f5bae05d53f0fa`（已讀回） |
| 上一個可回退部署 | `8270c757-f3f8-4e4b-b3a0-18423d2b72b4`，source `ffcf86660f0b103ba0b13ef1ac686aa5027b2901`，冇刪除 |
| 獨立 Worker | `adwire-mail-watchdog`，`https://adwire-mail-watchdog.qewethf.workers.dev` |
| Worker version | `4e34de92-6236-4d5f-a32d-0bc94710db86` |
| Cron | `*/5 * * * *`（Cloudflare UTC，每五分鐘；排程 API 已讀回） |

**唔好直接 push main：** `.github/workflows/deploy.yml` 會自動部署舊 SiteGround 路徑。Cloudflare Pages 係 Direct Upload project，唔係 push 就自動更新。`.github/workflows/deploy-cloudflare.yml` 係另一條手動工作流。安全整合修復入 main、釐清舊部署觸發器，係未完成工作，唔可以默默刪 workflow 或亂改觸發器。

## 3. 不可刪除／不可覆蓋

以下唔可以為咗「清理」、「測試」或「重建」而移除：

- 客戶查詢、診斷、待寄 payload、待寄狀態、重試游標、監察狀態。
- KV namespace、binding、secret 名稱／值、既有部署、修復分支、未提交或更新咗嘅程式。
- 獨立 watchdog Worker／cron；唔好另開第二個 scheduler 重複跑。
- `mailoutbox:` frozen JSON payload 及其 idempotency key；重試唔可以重新砌內容。
- 既有 retention；唔可以縮短 TTL 來清隊列。

有必要刪除／不可逆操作：**先解釋精確範圍、備份、復原及 rollback，再取得用戶明確批准。** 目前程式既有 TTL 自動到期，唔代表用戶批准人手刪資料。

| 資源 | 識別／用途 |
|---|---|
| 客戶 KV `ENQUIRIES` | `3a21665db2fb4b36b8c4df77667f9c9d` |
| `enq:` | 查詢備份；既有 30 日 TTL |
| `maildiag:` | 私有安全診斷；既有 7 日 TTL |
| `mailoutbox:` | 不可變 frozen provider payload；30 日 TTL |
| `mailoutboxstate:` | `pending` / `accepted` / `manual_review`；30 日 TTL |
| `mailcontrol:retry-cursor` | 持久分頁游標；移除會破壞公平掃描，唔好清除 |
| `dup:<fingerprint>` | provider accepted 後嘅去重標記，600 秒 TTL；唔清除來強行重送 |
| `rl:<ip>` | 每 IP 提交限流計數，60 秒 TTL；唔清除來繞過限流 |
| 監察 KV `WATCH_STATE` | `a9234393e2a74fc1b128e7b84875719c`，title `adwire-mail-watchdog-state` |
| `alert:<kind>` | 只放運維 metadata；唔放客戶資料，唔好清空作測試 |

兩個 KV 有意分隔：watchdog 經受保護 ops API 檢查／重試，唔直接讀客戶 KV。

## 4. 真正事故及唔可以重犯嘅操作

### 已確認與推斷分開

- 實際 runtime 曾回 `missing_config`，證明寄信前讀唔到 `RESEND_API_KEY`；最後部署驗收亦直接發現 `TURNSTILE_SECRET` 空值。
- 審計時間、歷史執行程式及 masked Secret round-trip 演算法，高度吻合先前完整 config PATCH 意外清空 Secret。**審計本身唔會揭示 Secret 明文；唔好寫成睇到原值被刪嘅完整 audit payload。**
- 用戶已更新 production Resend key。Turnstile 後來由既有 ADWire widget API 取回原 secret，僅更新指定 production binding，冇輪換 widget。

### 強制守則

1. **禁止 `GET project → 複製 deployment_configs → PATCH 完整 config`。** Cloudflare GET 嘅 Secret 值係遮罩／空；寫返就有機會清空。`setdefault` 唔會修復已存在嘅空 entry。
2. 只用 `scripts/mail-safe-config.mjs`（先 dry-run）或已驗證 native Wrangler 單 Secret 更新；拒絕空值、遮罩、控制字元，明確指定 production／preview。
3. 設定先於部署；部署後檢查實際 runtime。Dashboard 有 Secret 名稱、build 成功、HTTP200，全部都唔等於寄信已正常。
4. 唔准將憑證貼聊天、log、repo、附件。唔好盲目恢復歷史 key，亦唔好重新註冊 AgentMail——會輪換 organization key，可能令其他自動化失效。
5. 唔好改 DNS、供應商、收件人、CAPTCHA 作捷徑。`GET /domains` 401 唔等於 sending-only Resend key 冇寄信權限。
6. Cloudflare Worker `fetch` **唔支援 `redirect: "error"`**，會 request 未送出已 TypeError。Worker 要用 `manual` 並拒絕 non-2xx／3xx；唔用 `follow` 轉送 Bearer。Node readiness CLI 係另一個 runtime，唔好一概取代。
7. 保留 dedupe「provider accepted 後先 mark」時序；否則失敗重試會假成功。
8. 保留隨機 requestId-based 穩定 idempotency key、完全相同 frozen JSON、合共最多六次及原始 attempt 後 23 小時窗口。KV 唔係 transaction，唔承諾 exactly-once。
9. 保留持久 retry cursor；每次永遠由頭掃前 100 個保留中 key，會永久餓死後面待寄紀錄。KV 同一 key 每秒最多一次寫入，唔好用連續多階段同 key 更新。
10. 唔可以因為 Node mock 全綠就跳過真實 Worker smoke test；上面 redirect 問題正係 mock 冇捉到。

## 5. 憑證位置（只列路徑／名稱，冇實際值）

- Pages production：`RESEND_API_KEY`、`TURNSTILE_SECRET`、`INBOX_PASSWORD`、`MAIL_OPS_TOKEN`；另有 `MAIL_FROM`、`MAIL_TO`。
- Worker：`MAIL_OPS_TOKEN`、`AGENTMAIL_API_KEY`；metadata KV binding `WATCH_STATE`。
- GitHub Actions 已有 repository secret `MAIL_OPS_TOKEN`，但存在唔等於所有 workflow 已執行驗收。
- 本機私有 operator 檔：`C:/Users/user/AppData/Local/hermes/private/adwire-mail-ops.json`。
- 本機私有 Worker deploy 檔：`C:/Users/user/AppData/Local/hermes/private/adwire-mail-watchdog-secrets.json`。
- 原有 AgentMail key 在現有 Hermes config；**唔重新 sign-up／rotate**。冇權限讀私有檔時，停低索取安全存取方式，唔要求用戶將值貼聊天。
- 告警固定由 `adwire-hermes3099@agentmail.to` 寄去 `info@adwire.com.hk`；唔改寄其他地址／客戶。

私有檔唔在 Git；第二部機唔會自動有。檔案路徑唔代表已核實 OS 權限安全，亦唔可當備份已完成。

## 6. 已有嘅真實證據（歷史紀錄，唔冒充新一輪驗證）

- 完整 `npm test` 及 `npm run build -- --webpack` 均 exit 0；獨立覆核通過。
- 部署 suite 50、resilience 43、watchdog 34 測試通過；以上供應商測試用 mock。
- 正式 Pages health HTTP200、version `mail-protection-v1`，五項 checks 全 true。
- 固定收件人 Resend probe HTTP200／providerStatus200，provider email ID `01a17710-d30d-786b-8e24-3e3aaa2c04f0`。
- 實際 watchdog `/run` 睇到 canonical health200、`incidents:[]`、retry `errors:[]`／`storageError:false`。
- 獨立 testAlert 成功，AgentMail exact-message GET 讀回收件人、測試標題及 `labels:["sent"]`。
- **以上只證明 provider 接受／有寄件紀錄，唔係用戶 inbox 已收妥。**

本機詳細證據在 `.planning/2026-10-26-mail-incident/`：`protection-final-tests-build.log`、`protection-production-verified.json`、`protection-watchdog-verified.json`、`protection-alert-readback.json`、`progress.md`。呢個目錄被 Git 忽略，其他機器可能冇；本文件因此保存咗關鍵摘要。

## 7. 真正未完成／已知限制（唔好默默當做完）

- [ ] **Repo `AGENTS.md` 尚未建立**：受保護檔案寫入所需額外批准逾時，系統拒絕，冇重試或繞過。現有入口係 README 置頂連結及本文件；如要新增自動 agent 入口，需另行取得批准，唔好假稱已存在。
- [x] **用戶最後收信驗收已通過**：2026-10-26 用戶明確確認成功收到問卷 email，並提供 Gmail 截圖。寄信故障驗收完成；email 閱讀版面優化係獨立新要求，先做預覽，唔代表批准部署。
- [ ] **修復未合併 main**：需要受控整合及釐清 SiteGround／Pages 工作流。唔好強推 main、刪舊 workflow 或用舊 main 重新部署。
- [ ] **Preview 設定未恢復**：最後 preview health503，`resendKey=false`、`turnstileSecret=false`；只修復 production。Preview 同時綁既有客戶 KV，唔可以不經批准測試真實 lead 或複製 production secrets。
- [ ] **歷史失敗查詢未逐筆補寄**：新 outbox 唔會自動將舊 `enq:` 變待寄。先唯讀盤點及排重，再由用戶批准補寄；唔好重新砌 payload 批量寄出，亦唔好刪舊記錄。
- [ ] **到期資料唔係永久備份**：查詢／outbox 30 日、diagnostics 7 日既有 TTL；需要長期保留應另訂安全匯出／備份，今次未做。
- [ ] **Health 計數只掃前 100 個 state key**：`pending=0`／`manualReview=0` 唔代表全庫冇資料。Retry 係持久 cursor 輪轉，會逐窗口掃尾部；唔好將 advisory count 報成全庫總數。
- [ ] **非空 key 唔等於 key 有效**：health 檢查 Secret 存在及 KV 讀取，唔會驗 Resend key 權限／停用狀態；cron 冇定時真寄 probe。無效但非空嘅 key，通常要真實寄信／重試或明確 probe 才知。
- [ ] **告警失敗嘅限流缺口**：現時 AgentMail 發送失敗仍寫 active／lastAt，同類告警可能被抑制約一小時；恢復通知亦未保證失敗後重送。未修正，唔聲稱告警永不漏報。
- [ ] **Worker 自身缺設定有缺口**：部分缺 binding／AgentMail key 情況只記 log，唔一律建立 incident。要額外改善時先測試再獲准部署，唔好為交接順手改正式行為。
- [ ] **HTTP200 唔等於監察健康**：`runWatch.ok` 主要表示執行完成，有 incident 時仍可 true；公開 `/` 回 ready 亦唔係端到端驗收。必須讀 `incidents`、`healthStatus`、`alertsFailed`、`retry.errors`。Backend `/inbox?mailops=retry` 有 `storageError`；已保存嘅真實 watchdog `/run` JSON 亦透傳為 **`retry.storageError`（唔係頂層）**。唔假設每個版本都有此欄；仍要處理 `retry_storage_error`／`retry_cursor_error` 錯誤碼。
- [ ] **Build 有既有 API fallback warnings**：SiteGround API 可能回 HTML／captcha 而唔係 JSON。Webpack build exit0 唔等於所有外部內容成功拉取，部署前要檢查實際產物，唔盲目隱藏 warning。
- [x] **Turnstile 原 fail-open 缺口已由新版修正及部署**：正式 source `13039a3` 改為 positive server verification 先可寄／入 outbox；missing／unavailable 喺本機測試 fail-closed，正式 invalid token 回400，health 全 true。**以下只係舊版歷史描述，唔代表最新 runtime**：`functions/send-mail.php.ts` 只有 Secret 存在先執行 server verification；缺 Secret 時跳過。`verifyTurnstile` 遇 non-2xx／network exception 回 `unknown`，handler 只阻擋 `fail`，所以 `unknown` 仍可繼續。前端 widget 唔等於 server positive verification。舊缺口已由本輪 fail-closed 方案修正，但既有 frozen outbox 冇補做驗證，唔可倒推歷史紀錄全部已通過 Siteverify；唔好恢復舊 fail-open 路徑測試或繞過 CAPTCHA。
- [ ] **GitHub Actions 呢條新 gate 未以真實 workflow run 做完驗收**：本機 CLI／實際部署已驗證，唔將此等同 CI 已跑過。

## 8. 接手驗證方法及界線

```bash
git status --short --branch
git fetch origin
git log -1 --format='%H %s' HEAD
git log -1 --format='%H %s' origin/main
npm test
npm run build -- --webpack
```

本機使用過 Node22／Wrangler4.152.0；接手先核對實際版本。Windows shell 係 Git Bash，native 工具用 `C:/...` 路徑。若 npx 背景無輸出，先診斷程序／stdin，唔冒稱成功。

`node scripts/mail-readiness.mjs --target https://adwire.com.hk` 係只讀 health；token 只由環境／私有檔取得。`--probe`、`POST /inbox?mailops=retry`、`POST watchdog /run`、`testAlert=1` **有寄信／重試／寫 state 副作用**，唔屬純讀取，需適當授權，唔好每次接手自動重寄。

正式故障可用受保護 `/inbox?diagnostics=1&requestId=<actual UUID>` 讀安全診斷；唔公開 Basic Auth／Bearer。前端顯示 code／requestId 應保留。

Rollback 只可以回已核實版本並重新驗收設定；`59991421`、`d3219ee4`、`f656c848` 都曾涉及寄信設定缺失，唔可以叫佢哋「已知健康」。Rollback code 唔會自動恢復 Secret。

## 9. 向下一個 AI 嘅回報要求

清楚分四欄：做過嘅實際操作／讀回證據／未驗證或未完成／任何資料及設定變更。未測就寫未測、缺權限就停手；唔刪嘢令測試過關，唔捏造送達紀錄，唔把歷史延遲完成通知當成新部署指令。

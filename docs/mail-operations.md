# Mail 部署／運維安全（ADWire — Cloudflare Pages）

> **先讀 `docs/mail-handoff.md`：包括最後正式版本、尚未合併 main、不可刪除資源、未完成驗收同已知限制。** 本文件保留通用操作及歷史部署資料，唔代表每個歷史版本都健康。

本文件說明 2026-10-26 郵件事故後新增嘅**三層保護**、兩個維運 CLI、部署 workflow
變更，以及回滾參考。目標：**永不再把遮罩秘密回寫、部署後缺 binding 不得聲稱成功**。

---

## 1. 背景（為何要有呢啲護欄）

已確認 runtime 缺少寄信 key；根因高度吻合先前設定更新腳本（審計與演算法推斷，審計不會回傳 Secret 明文）：一個維運腳本用 **GET project → 深拷貝整個 `deployment_configs`
→ 改一個 key → PATCH 整個 config** 嘅方式更新 Pages env_vars。因為 GET 回傳嘅
秘密已被 Cloudflare **遮罩**，呢個「來回」把空／遮罩值寫返去，覆蓋咗 `RESEND_API_KEY`
（Live audit `01a16cf6-…` @ 2026-10-24T08:10:59Z 顯示 Python-urllib PATCH 把整個
env_vars 來回）。寄信因此靜默壞掉，而且**部署本身完全成功、無人察覺**。

三層保護：

1. **最小秘密補丁**（`scripts/mail-safe-config.mjs`）——單向寫入，只送白名單名稱，
   拒絕遮罩／空值，永不 GET→PATCH 來回。
2. **部署後 readiness**（`scripts/mail-readiness.mjs` + workflow）——驗證 runtime
   實際 binding 齊全；缺 binding 立即令部署 run **失敗**（唔會聲稱成功）。
3. **獨立監察＋失敗重試**（`ops/mail-watchdog`、`lib/mail-runtime.ts`）——每五分鐘檢查實際 runtime，經獨立 AgentMail 告警到固定 `info@adwire.com.hk`；已通過原始表單驗證嘅失敗查詢，保存 exact frozen payload 後有限度重試。設定缺失、provider/network error 同樣保留待寄紀錄；最多六次、原始 attempt 起計 23 小時內，超限轉人工處理，唔刪紀錄。

流程文件及契約測試支援以上三層，唔係代替實際監察。

> ⚠️ **誠實邊界**：呢啲護欄**只降低誤覆蓋風險，不能阻止任何持有 Cloudflare API
> token 嘅人直接呼叫 API** 去改專案設定。真正的防線是：
> **最小權限 token + 只用已核准腳本 + 審計日誌**。切勿給通用／全域 token。

---

## 2. `scripts/mail-safe-config.mjs` — 最小秘密補丁

### 用法

```bash
# 預設 dry-run（只列名稱，零網絡）：
node scripts/mail-safe-config.mjs --secret-file ./mail-secrets.json --target production

# 實際套用（必須明確 --apply；需要 CF 環境變數）：
CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=… CLOUDFLARE_PROJECT_NAME=adwire-site \
  node scripts/mail-safe-config.mjs --secret-file ./mail-secrets.json --target production --apply
```

- `--secret-file <path>`：**外部** JSON，格式 `{ "NAME": "value", … }`（不入 repo）。
- `--target`：必須明確 `production` 或 `preview`。
- `--apply`：預設 **dry-run**（安全摘要，只列名稱）。無 `--apply` 永不呼叫網絡。
- CF API token 只讀自環境變數，**永不印出／echo**。

### 白名單（唯一准許寫入嘅名稱）

| 名稱 | 類型 |
|---|---|
| `RESEND_API_KEY` | `secret_text` |
| `TURNSTILE_SECRET` | `secret_text` |
| `INBOX_PASSWORD` | `secret_text` |
| `MAIL_OPS_TOKEN` | `secret_text` |
| `MAIL_TO` | `plain_text`（有需要時） |
| `MAIL_FROM` | `plain_text`（有需要時） |

其他任何名稱一律 **拒絕**（`ADMIN_API_KEY` 等唔會、亦唔應該經此工具寫入 Pages）。

### 拒絕規則（全部有測試）

- 非白名單名稱 → `NOT_ALLOWED`
- 非字串（物件／陣列／null）→ `MASKED_OR_OBJECT`（呢個就係遮罩 Secret 物件）
- 遮罩值（`********`、`***`、`REDACTED`、`[REDACTED]`、`••••`…）→ `MASKED_VALUE`
- 空 / 純空白 → `EMPTY_VALUE`
- 含控制字元（`\n`、`\t`、`\0`…）→ `CONTROL_CHARS`
- 前後有空白 → `WHITESPACE_VALUE`
- 整個回傳 config（含 `result`/`success`/`deployment_configs`/`env_vars` 等 envelope key）→ `CONFIG_OBJECT`

### 不變式

- **只送指定、白名單嘅 `env_vars`**，補丁 body 形如
  `{ deployment_configs: { <target>: { env_vars: { <NAME>: { type, value } } } } }`。
- **永不 GET**，因此永不把遮罩值來回（測試斷言 apply 只有一個 PATCH、零 GET）。
- 失敗訊息只帶 **名稱同錯誤碼**，絕不含值。

---

## 3. `scripts/mail-readiness.mjs` — 部署後 readiness

### 用法

```bash
MAIL_OPS_TOKEN=… node scripts/mail-readiness.mjs --target https://adwire.com.hk
MAIL_OPS_TOKEN=… node scripts/mail-readiness.mjs --target https://adwire-site.pages.dev --probe
node scripts/mail-readiness.mjs --target https://adwire.com.hk --ops-token-file ./ops.token
```

- token 來自 `MAIL_OPS_TOKEN` 環境變數，或 `--ops-token-file <path>`。
- **target 主機嚴格白名單**：只接受 `https://adwire.com.hk` 或 `adwire-site.pages.dev`／單層部署別名 `*.adwire-site.pages.dev`
  （必須 https、禁憑證、禁非預設埠／path／query／fragment，拒絕 redirect）→ **防 SSRF**。其他一律非零退出且**不發出請求**。
- 逾時（預設 10s）／非 2xx／body 壞 JSON → **非零退出**，且**永不印出回應 body 或 token**。
- 只輸出**安全摘要**欄位；預設**唔會真實寄信**。

### 後端端點合約（由 backend 提供）

`GET {target}/inbox?mailops=health`（`Authorization: Bearer <MAIL_OPS_TOKEN>`）：

```json
{
  "ok": true,
  "version": "mail-protection-v1",
  "checks": { "resendKey": true, "turnstileSecret": true, "inboxPassword": true, "outboxStorage": true, "opsToken": true },
  "outbox": { "pending": 0, "manualReview": 0 }
}
```

必要條件：HTTP 200、`ok === true`、`version === "mail-protection-v1"`、
所有 `checks.*` 皆 `true`。任何一項不符 → 檢查失敗。

`POST {target}/inbox?mailops=probe`（可選，`--probe`）：

```json
{ "ok": true, "providerStatus": 200, "providerEmailId": "em_…", "errorCode": "optional" }
```

必要條件：provider HTTP **200/201 accepted** 且 `ok === true`。
**只聲稱供應商「接受」，永不聲稱 inbox 已投遞**（輸出絕不含 `inboxDelivered`）。

退出碼：`0` 成功；`1` 檢查失敗／逾時／網絡錯誤；`2` 用法或 token 問題。

---

## 4. 部署 workflow（`.github/workflows/deploy-cloudflare.yml`）

手動 `workflow_dispatch`，輸入 `target`（`preview`/`production`）＋ `probe`（布林，預設 false）。

1. **生產前必須有 `MAIL_OPS_TOKEN`**：`production` 部署前有一步檢查此 secret 存在
   （只報長度，不印值），缺則**中止整個部署**。
2. **Build**：用 `npm run build -- --webpack`。原因：本 repo `next build` 預設走
   Turbopack，喺現有 `next/font/google` Lexend 解析上會失敗
   （`next/font/google queries have exactly one entry`），**與本次 mail 變更無關**；
   Next 16 官方支援 webpack opt-in，可完成建置（含 postbuild 測試）。
3. **Deploy**：`wrangler pages deploy out`（`production → main`、`preview → preview`）。
   Workflow **只部署建置輸出**，永不 GET→PATCH 專案設定、永不回寫遮罩秘密。
4. **部署後 readiness（僅 production）**：`mail-readiness.mjs --target https://adwire.com.hk`。
5. **受控 probe（僅 production、需 `probe=true`）**：`… --probe`。

> ✅ **缺 binding 部署 MUST NOT 聲稱成功**：步驟 4 若見到任何 `checks` 為 `false`
> （例如秘密未綁定），會非零退出 → **整個 run 標記為失敗**。即「已部署，但唔合格」，
> 唔會被當成成功部署。

---

## 5. 回滾參考（已知上一個 release）

Cloudflare Pages 專案 `adwire-site` 嘅已知部署：

| 部署 ID | 說明 |
|---|---|
| `59991421-01a5-4b03-a0fe-9072c2cc5320` | 較早生產部署；曾受寄信缺 key 事故影響，**不是已驗證健康版本** |
| `d3219ee4-e48e-4d03-a565-72465aac6e2d` | 診斷＋去重修復生產部署（2026-10-26 13:36 HK） |
| `e160261a`（preview） | 診斷版預覽；唔係第三個 production rollback 版本 |
| `f656c848`（production） | 三層保護首次正式驗收捉到 `turnstileSecret=false`；唔係已知健康版本 |
| `8270c757-f3f8-4e4b-b3a0-18423d2b72b4`（production） | 2026-10-26 最後保存嘅正式版：實際 health 五項全 true、provider probe accepted；本人問卷收信驗收仍未確認 |

以上包含唔同用途嘅歷史 deployment，唔係可互換嘅 rollback 清單。完整 source／Worker snapshot 及未完成工作見 `docs/mail-handoff.md`。

Git 對應：`main` = `b1488a6`；診斷/去重修復 = `5b09ef9`
（branch `fix/mail-diagnostics-20261026`）。

回滾做法（Cloudflare Dashboard → Workers & Pages → `adwire-site` → Deployments）
只選已驗證良好部署並 **Rollback**；舊版本未必有 `/inbox?mailops=health`，而部署 rollback 亦不等於 Secret 已恢復。曾有缺設定嘅歷史部署唔可當作寄信正常證據；回滾後仍須驗證 runtime 設定及實際寄信。

---

## 6. 測試

```bash
node tests/mail-deployment.test.mjs        # 契約測試，全 mock、零真實網絡
npm test                                 # 包含部署、outbox、watchdog 及既有全部測試
```

`tests/mail-deployment.test.mjs` 覆蓋：白名單/值護欄、遮罩/空值/控制字元/整個 config 拒絕、
補丁只含指定名稱（含 production vs preview）、apply 只 PATCH 一次且無 GET、
target 白名單防 SSRF、health/probe 嚴格驗證、逾時/網絡失敗/壞 JSON 非零退出、
CLI 零秘密輸出。

`package.json` 已串接 `mail-deployment`、`mail-resilience`、`mail-watchdog`，完整 `npm test` 會執行。測試用 mock provider，不能證明真實 inbox 收到。

---

## 7. 快速檢查清單

- 改 Pages env_vars？→ **只用 `mail-safe-config.mjs`**，先 dry-run。
- 好奇某 key 是否有效？→ **切勿** GET 再 PATCH 來回；用 `mail-readiness.mjs` health。
- 生產部署後？→ 必須見到 readiness 全綠；紅燈即當部署失敗處理並考慮回滾。
- Token？→ 最小權限（Account > Cloudflare Pages > Edit）；公開過／可疑即撤換。

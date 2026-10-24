# ADWire DNS 切換去 Cloudflare — 執行清單

> 建立：2026-10-24　執行者：你 + 我
> 前提：email 已搬 Google Workspace（實測 MX 只有 `smtp.google.com`），所以切換風險比想像低。

## 0. 現時 DNS 實況（8.8.8.8 實測，已存 baseline）

| 記錄 | 值 |
|---|---|
| NS | ns1.siteground.net / ns2.siteground.net |
| @ A | 34.149.36.179、34.160.17.71、34.160.81.203、35.190.31.54 等 4 個（SiteGround CDN） |
| www A | 同上 4 個 |
| MX | `1 smtp.google.com.`（Google Workspace）✅ |
| @ TXT | SPF `v=spf1 include:_spf.google.com ~all`、google-site-verification、一個 apex DKIM |
| _dmarc TXT | `v=DMARC1; p=quarantine; rua=mailto:info@adwire.com.hk` |
| default._domainkey TXT | DKIM（長度 >255，會被 DNS 分塊） |
| mail / ftp / autodiscover A | 35.213.134.225（SiteGround 伺服器） |

Baseline 檔：`dns_baseline_2026-10-24.json`
切換後驗證：`python verify_dns_after_cutover.py`

## 1. 我做唔到、要你落手嘅兩件事

### 1.1 Cloudflare 加網域（需要權限）

我手上嘅 Cloudflare token 只有 `zone (read)`，**冇 zone 建立同 DNS 寫入權限**，所以唔可以幫你加網域。

二選一：
- **（快）** Cloudflare Dashboard → Add a site → 輸入 `adwire.com.hk` → 選 Free → 佢會掃描現有 DNS。之後把 `adwire-dns-import.txt` 上傳（DNS → Import DNS records）。
- **（我全程代做）** 開一個 API token，權限只要 `Zone:Edit` + `DNS:Edit`（範圍限 adwire.com.hk），貼畀我，我幫你建 zone、寫入全部 record、之後綁 Pages 網域。

### 1.2 SiteGround 反 bot 排除

我冇 SiteGround 面板憑證，呢步一定要你（或畀我登入）。

**路徑**：Site Tools → Security →（Anti-Bot / Bot Protection 或 Blocked Traffic）
把以下加入 allow／排除清單：
```
/admin/*
/admin/api/*
/send-mail.php
```
**目的**：你自己部機（office IP）已被 flag，唔排除就連後台都登入唔到。
**注意**：唔好一次過全關，其餘路徑保持保護。

## 2. 切換次序（照做，唔好跳步）

| # | 動作 | 負責 | 驗收 |
|---|---|---|---|
| 1 | Cloudflare 加 `adwire.com.hk`，匯入 `adwire-dns-import.txt` | 你／我 | Dashboard 見到 9 組記錄齊 |
| 2 | 在 Cloudflare 核對 MX／SPF／DMARC／DKIM 四項同 baseline 一致 | 我 | 逐字對比，任何差異即停 |
| 3 | 去 registrar 把 NS 改成 Cloudflare 提供嘅兩個 NS | 你 | 我提供逐步畫面指引 |
| 4 | 等 Cloudflare 顯示 Active（通常 1–24 小時） | — | Zone 狀態 Active |
| 5 | 綁定自訂網域：`adwire.com.hk` + `www.adwire.com.hk` → Pages 專案 `adwire-site` | 我（API） | Pages 顯示 Active，A record 自動改寫 |
| 6 | 設定 Pages 環境變數 `ORIGIN_BASE`（PHP 代理目標） | 我 | `/admin/` 回 200 |
| 7 | SiteGround 加反 bot 排除（見 1.2） | 你 | 你部機入得後台 |
| 8 | 全面驗收（見第 4 節） | 我 | 全部通過 |
| 9 | 保留 SiteGround 帳戶至少 30 日做回滾 | — | — |

**關鍵順序原因**：第 5 步之前 `adwire.com.hk` 仍然解析去 SiteGround，網站唔會斷；綁定 Pages 之後才真正切換流量。

## 3. 回滾方案

任何一步出錯（尤其是 email）：

1. 去 registrar 把 NS 改回 `ns1.siteground.net` / `ns2.siteground.net`。
2. TTL 已設 300 秒，最多 5 分鐘生效。
3. 執行 `python verify_dns_after_cutover.py` 確認 MX／DKIM 復原。
4. 網站會自動回到 SiteGround 版本（因為 A record 本來就指去 SG）。

**所以：切換前唔好刪 SiteGround 任何東西。**

## 4. 驗收清單（切換後我會逐項做）

- [ ] `https://adwire.com.hk/` 200，TTFB < 400ms
- [ ] 首頁 16 張圖全部載入（`naturalWidth > 0`）
- [ ] console 0 個 CSS MIME 錯誤
- [ ] 撳 nav 連結正常跳轉（含淡出過渡期）
- [ ] `/services/...__next.*.txt` 回 200（RSC prefetch 修復）
- [ ] `/admin/` 可以登入（經 Worker 代理）
- [ ] 表單提交成功，收到 email + 後台 enquiries 有記錄
- [ ] 由外部 send 一封 email 去 info@adwire.com.hk，收到
- [ ] GSC 無新增抓取錯誤（觀察 7 日）
- [ ] `verify_dns_after_cutover.py` 全部一致

## 5. 未解風險

1. **PHP 代理 origin**：切換後 `adwire.com.hk` 會指去 Cloudflare，Worker 唔可以再 fetch 自己（無限迴圈）。兩個解法：
   - （建議）SiteGround 面板加子網域 `origin.adwire.com.hk`，我設 `ORIGIN_BASE=https://origin.adwire.com.hk`；
   - （免面板）用 Workers `resolveOverride` 指去 `35.213.134.225`，我已在 `functions/_middleware.ts` 支援，設 `ORIGIN_IP` 即可，但 SiteGround 換 IP 會斷。
2. **SiteGround 反 bot 代理風險**：Cloudflare Worker 出口 IP 係共用，可能同樣被 SG 攔。所以第 7 步（排除路徑）幾乎係必需。
3. **`.hk` 域名 registrar**：如果 registrar 係 HKDNR 而唔係 SiteGround，改 NS 要去 HKDNR 後台，需要你嘅帳號。

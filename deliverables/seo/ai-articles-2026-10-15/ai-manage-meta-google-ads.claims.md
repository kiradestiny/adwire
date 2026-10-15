# claims.md — ai-manage-meta-google-ads

查核日期：2026-10-15（所有 URL 於此日期以 curl 抓取原文核對）

| 主張 | 一手來源 URL | 生效日期 | 適用範圍 |
|---|---|---|---|
| Marketing API 可程式建立 ad campaign、ad set、個別 ad，並根據即時成效部署與調整 | https://developers.facebook.com/documentation/ads-commerce/marketing-api/overview | 查閱 2026-10-15 | Meta 官方文件（Marketing API Overview） |
| 除建立外，還可更新、暫停或刪除廣告；確保廣告計劃與業務目標一致；取得詳細洞察與分析追蹤成效 | https://developers.facebook.com/documentation/ads-commerce/marketing-api/overview | 查閱 2026-10-15 | 同上 |
| campaign 為最上層、代表單一目標；ad set 負責預算、競價與檔期；ad 包含素材與投放設定 | https://developers.facebook.com/documentation/ads-commerce/marketing-api/overview | 查閱 2026-10-15 | 同上 |
| 舊稱「Standard Access」改名為 Limited Access；「Advanced Access」改名為 Full Access；升級層級不需修改程式碼 | https://developers.facebook.com/documentation/ads-commerce/marketing-api/get-started/authorization | 查閱 2026-10-15（頁面更新日 2026-05-05，依任務提供） | Meta 官方文件（Authorization） |
| Full Access 門檻由 1,500 次下調至 500 次 Marketing API 呼叫 | https://developers.facebook.com/documentation/ads-commerce/marketing-api/get-started/authorization | 查閱 2026-10-15 | 同上 |
| Limited（預設）：加入 Marketing API 產品後自動獲得；每個廣告帳戶受嚴格速率限制；官方說明只供開發用途、不適用於為真實客戶投放的正式應用；只能建立 1 個 system user | https://developers.facebook.com/documentation/ads-commerce/marketing-api/get-started/authorization | 查閱 2026-10-15 | 同上 |
| Full（須 App Review）：速率限制較寬鬆；可管理無限數量廣告帳戶；可建立 10 個 system users | https://developers.facebook.com/documentation/ads-commerce/marketing-api/get-started/authorization | 查閱 2026-10-15 | 同上 |
| 取得 Full Access 須在最近 15 天內成功完成至少 500 次 Marketing API 呼叫，並在最近 500 次呼叫中錯誤率低於 15%；通過後須持續符合以維持層級 | https://developers.facebook.com/documentation/ads-commerce/marketing-api/get-started/authorization | 查閱 2026-10-15 | 同上 |
| 最新 API 版本為 v26.0 | https://developers.facebook.com/documentation/ads-commerce/marketing-api/get-started/authorization | 查閱 2026-10-15 | 同上（頁面內標示 developer latest API version） |
| App Review 會實際測試應用；若無法進入應用測試，整份申請會被拒絕；能測試但測不到某權限的功能，該權限不獲批 | https://developers.facebook.com/docs/app-review | 查閱 2026-10-15 | Meta 官方文件（App Review） |
| Meta 設有 Advantage+（受眾、版位、預算、素材等平台內建自動化） | https://www.facebook.com/business/help/273363992030035 | 查閱 2026-10-15 | Meta Business Help Center（About Advantage+ audience） |
| Google Ads API developer token 已於 2026-09-09 退役；權限改綁 Google Cloud 專案；權杖變成可選並會被 API 伺服器忽略；已按退役前 90 天活動轉移存取級別 | https://developers.google.com/google-ads/api/docs/api-policy/developer-token | 2026-09-09 | Google 官方文件（Developer token） |
| Google Ads API 存取級別與 Google Cloud 專案綁定；四個級別：Test、Explorer、Basic、Standard | https://developers.google.com/google-ads/api/docs/access-levels | 查閱 2026-10-15 | Google 官方文件（Access levels and permissible use） |
| 每日操作上限：Test（只測試帳戶）15,000；Explorer（測試＋正式）正式 2,880、測試 15,000；Basic（測試＋正式）15,000；Standard（測試＋正式）無上限 | https://developers.google.com/google-ads/api/docs/access-levels | 查閱 2026-10-15 | 同上 |
| 官方建議由 Basic Access 起步，並及早申請 Standard；Standard 須經應用審核，可能需數個工作日、有時數星期 | https://developers.google.com/google-ads/api/docs/productionize/access-levels | 查閱 2026-10-15 | Google 官方文件（Access levels and RMF） |
| Google Ads API 免費使用（Test／Explorer／Basic／Standard 都不收 API 費用）；RMF（最低功能要求）只適用於 Standard Access；Standard 不合規可能被收取不合規費用 | https://developers.google.com/google-ads/api/docs/productionize/access-levels | 查閱 2026-10-15 | 同上 |
| AI Max for Search campaigns 主要兩項功能為搜尋詞配對（search term matching）與素材優化（asset optimisation），並含文案自動定製與最終到達網址擴展 | https://support.google.com/google-ads/answer/15910366 | 查閱 2026-10-15 | Google Ads 說明中心 |
| 官方自述：啟用 AI Max 於 Search 廣告系列者，「一般可見 14% 更多轉換或轉換價值，而 CPA／ROAS 相若」（屬 Google 自述，非第三方獨立實測） | https://support.google.com/google-ads/answer/15910366 | 查閱 2026-10-15 | 同上 |
| 新建立的 Search 廣告系列預設開啟 AI Max；可啟用／編輯／關閉 | https://support.google.com/google-ads/answer/15909989 | 查閱 2026-10-15 | Google Ads 說明中心（Set up AI Max for Search campaigns） |
| AI Max for Shopping campaigns 存在；另有由 Dynamic Search Ads 升級至 AI Max 的路徑 | https://support.google.com/google-ads/answer/15909989（AI Max 導覽列同時列出「AI Max for Search campaigns」與「AI Max for Shopping campaigns」） | 查閱 2026-10-15 | Google Ads 說明中心導覽 |

## 未能核實 / 已標示為未找到官方細節

| 項目 | 處理方式 | 說明 |
|---|---|---|
| Meta「Tech Provider」計劃的官方定義與用途 | 文中只寫「Meta 設有 Tech Provider 計劃」，並明示「未能在 Meta 官方網站找到該計劃的詳細定義頁面」，且提醒不宜引用第三方教學或博客當作一手 | 查閱期內嘗試的 Meta 官方相關路徑（如 developers.facebook.com 相關 tech-provider 路徑）皆回 404；任務亦要求「如果找唔到官方頁，就只寫『Meta 設有 Tech Provider 計劃』並標示未找到官方細節」 |
| Meta 自動規則引擎的官方技術文件頁 | 文中以行為描述（排程／觸發條件、跨多個廣告批量調整出價、預算、開停）表述，未逐字引用官方頁面 | 任務所列 https://developers.facebook.com/social-technologies/marketing-api/ 於查閱期內為推廣頁（無規則引擎細節）；自動化規則的專屬官方文件路徑未能定位，故未在文中作精確數值或逐字引述 |

## 備註

- 本文所有 Meta 與 Google 的機制、數字、日期均以官方文件為一手來源；文中已標明「14% 更多轉換」屬 Google 官方自述效益。
- 「AI 可以接手／無法接手」、「導入四階段」、「人工覆核分級」等屬業界實務框架與本文作者判斷，並非官方數據，文中已以實務建議方式表述，未冒充官方數字。
- ADWire 自稱數字：文中只使用「代操 28 個 Meta 廣告客戶」（源自任務提供之業務陳述），未使用其他未核准自稱成效數字。

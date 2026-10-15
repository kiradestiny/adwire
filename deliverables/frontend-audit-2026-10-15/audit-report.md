# ADWire 全站 Frontend 審核與需求分流建議 — 最終覆核版

日期：2026-10-15｜原始碼基準：main `82f7b65`｜狀態：審核及設計，未改網站原始碼、未部署。

## 結論

網站不是「全部重做」的情況。SEO 基礎大致齊全；最值得先處理的是導航／表單的真實 frontend 缺陷、全站 schema 資料一致性、第三方標籤成本，以及首頁過度倚賴抽象能力展示、未替不懂選服務的客人做需求判斷。

建議順序：**修 bugs → 收斂 schema 及口徑 → 首頁改用具體作品和需求入口 → 推出短問卷／預算預覽 → 量測銷售接受率。**

不是先大量加 AI 辦公室照，也不是為 Lighthouse 分數刪追蹤／防垃圾元件。

## 範圍、證據及限制

- 已檢查 frontend `app/`、`components/`、相關 `lib/`、靜態輸出、圖片及追蹤腳本載入。
- 已掃描88個建置index頁、85條sitemap URL。詳情頁實際為44篇文章、16個案例、16個服務；列表頁另外計，避免誤報45篇文章。
- UX 做過本機DOM／可聚焦性測試；速度有7次正式站Lighthouse手機模擬＋4次本機測試。主審已直接讀回11份原始JSON、核對URL及runtimeError，再計算指標範圍。
- 未測每一頁的每一個互動，不聲稱「零其他bugs」；未作真實表單提交，沒有寄測試信或寫入CRM。
- 未分析PHP、API、資料庫或CRM。快取／CDN標頭只列為frontend速度的外部依賴，未改`.htaccess`或主機。
- Lighthouse是受控環境手機模擬，不是CrUX真實用戶分佈；沒有量到真實INP，不拿TBT冒充INP。沒有讀GA4/GSC轉換數據，故不聲稱流失率或成交提升。
- 三份子審底稿`seo-geo.md`、`ux-code.md`、`performance-audit-v1.md`有主審更正註；若措辭不同，以本文件及`verified-summary.json`為準。

## 1. Frontend bugs／UX：先修這些

### 1.1 關閉的桌面服務選單仍能取得鍵盤焦點
- 證據：`components/Navbar.tsx:249–303`。只用`opacity-0 pointer-events-none`，子連結仍在焦點序列，沒有focus-within開啟處理。
- 本機測試：17個服務連結可聚焦、有效opacity為0。不是純美觀，鍵盤用戶會進入看不到的連結。
- 修法：明確開關狀態，關閉時inert／不可聚焦，支援鍵盤開啟及Escape；不只加aria-hidden，因其本身不阻止焦點。
- 優先：高｜信心：高。

### 1.2 手機Drawer關閉後，畫面外內容仍可聚焦
- 證據：`Navbar.tsx:535–543`。translate-x-full只移出畫面；`aria-modal=true`一直存在。
- 本機測試：關閉時29個內部元素仍可聚焦。手機服務手風琴亦缺aria-expanded／aria-controls（:609–628）。
- 修法：關閉時inert、打開時正確模態語意、焦點移入／關閉還原；手風琴補狀態和面板id。
- 優先：高｜信心：高。

### 1.3 部分頁面手機查詢按鈕只有#contact，沒有目標
- 證據：`Navbar.tsx:344–348`。只找當頁contact；`privacy/terms/disclaimer`等沒有ContactSection。
- 後果：按鈕只加hash，不能帶客去查詢。
- 修法：有當頁表單才捲動，否則連`/contact/#contact`；無JS時href本身亦應可用。
- 優先：高（修正容易）｜信心：高。

### 1.4 四秒時間閘先於欄位驗證，短時間提交顯示不合適錯誤
- 證據：`ContactSection.tsx:424–443`。先報「提交過快」，才檢查姓名、電話、電郵。
- 本機可重現：掛載後不足4秒送空表，先得到時間錯誤而非欄位提示。不是永久不能提交；超過時間後可進入正常驗證。
- 修法：先做欄位驗證、聚焦首個錯誤；保持防濫用設計但不要拿錯誤訊息懲罰自動填寫真客。改前需測成功／失敗／重試／自動填寫，不改backend規則。
- 優先：中高｜信心：高（影響頻率未知）。

### 1.5 動態、可讀性與漸進增強
- 走馬燈`LogoWall.tsx:64–85`無限播放、品牌重複4份；應有暫停、複製項不重複交給讀屏，減少動態模式改靜態。
- 檢查到多處小字用text-gray-400配白底或淺灰底，例BlogSection及ContactSection helper，測得約2.4–2.5:1，應提高對比。品牌標誌另有WCAG例外，不混為所有logo必須4.5:1。
- `StatsSection.tsx:93–95`、`ProcessSection.tsx:80–82`初始opacity-0：JS失敗／關閉時內容不可見。HTML文字仍存在，不代表爬蟲完全讀不到；應預設可見再增強動畫。
- 全站減少動態支援須補實測，不能只grep一個詞便斷言所有庫一律不支援。
- 優先：中｜信心：高（上述具體源碼），正常JS捲動後動畫未全數驗證。

## 2. SEO／GEO：少堆標記，多做一致與可信

### 2.1 全站殘留4.9／128的AggregateRating
- `components/JsonLd.tsx:126–132`；全站輸出。其前面註解:61–63卻寫評分來源及評論數未核實、已移除。
- `PROOF.rating`本身也註明來源待補。128的來源不能用真實品牌數或客戶數推導。
- Google對自己網站標記自身LocalBusiness／Organization評價不提供self-serving review stars，即使有真評價也不是加上就有星。
- 建議：移除無法支持的評分標記；保留已核准真實客戶資料，不牽連刪客戶見證。沒有證據說網站已被處罰。
- 優先：高｜信心：高。

### 2.2 Schema與可見內容／共用資料未完全一致
- `ads/kol/seo/social`四頁畫面FAQ與page.tsx的schema各維護一份；SEO schema仍有舊口語問句。字面不同不自動等於違規，但極易產生承諾／價錢漂移，應共用資料。
- 首頁`app/page.tsx:64`及全站HowTo `JsonLd.tsx:180`殘留「15分鐘免費業務診斷」；與聯絡頁清理方向不一致。
- 首頁FAQ說四條業務線，`SERVICE_LINES`已為五條含跨境；Hero「平均ROI」與`PROOF`的「平均ROI提升」是不同概念，應統一已核准定義而不是改數字。
- 相同Organization @id可合法合併，問題在不同節點的url／name是否互相矛盾。文章author把相同@id的url寫成/about/，主節點為根網址，建議頁面直接引用統一節點。
- logo schema 400×200與實際533×173不符，屬低成本修正。
- 優先：中高｜信心：高。

### 2.3 舊搜尋展示功能不用繼續當優化賣點
- HowTo失去Google rich result，不等於schema語法非法，但沒必要全站重複一個合作教學並夾帶舊承諾。
- SearchAction指向`/blog/?q=`；BlogContent目前搜尋state預設空字串，未讀q。頁面有搜尋功能，但這個URL參數沒有實作，不要誤報為完全沒有站內搜尋。
- Google於2024-10-21公告，從2024-11-21起移除sitelinks search box；不再以加SearchAction作搜尋展示效果承諾。
- 3篇description超過160字只屬可讀性與摘要編輯優化，不是硬性SEO錯誤；顯示與否由搜尋引擎決定。

### 2.4 明確更正之前的sr-only說法

之前把「sr-only仍在HTML」直接等同「有效GEO」是過度推論。Google官方明示：
- AI搜尋沒有額外特製schema要求；llms.txt不會提升Google Search能見度。
- 結構化資料要對應可見內容。
- 真正讀屏輔助文字可合理使用；不是所有sr-only都違規，亦不能說SEO用途的隱藏塊一概無害。

建議保留自然可讀的公司介紹、交付範圍、可展開FAQ、真實案例與來源。移走冗餘的「只給爬蟲」長塊前先比對資料，不刪真正無障礙標籤，不再把隱藏當核心GEO策略。Google規則不能自動代表其他AI平台，其他平台引用效果本輪未實測。

### 2.5 已確認做得對
- 88個建置頁皆有一個H1；一般可索引頁canonical存在；404例外不拿來當錯誤。
- sitemap85個URL；thank-you及錯誤頁不在其中。
- ai-agency內鏈孤島已解決。
- 大份Blog全文沒有整包進client JS；字型為本地woff2，沒有Google Fonts下載鏈。

## 3. 速度：有優化空間，但不能錯誤歸因

### 正式站手機Lighthouse（13.5.0，模擬節流；不是實際用戶數據）

| 頁面 | 次數 | Performance中位數（範圍） | LCP範圍 | TBT範圍 |
|---|---:|---:|---:|---:|
| 首頁 | 3 | 76（74–76） | 5.86–6.75秒 | 87–99ms |
| SEO服務 | 2 | 60（58–62） | 5.65–5.94秒 | 682–800ms |
| AI廣告文章 | 2 | 72（70–74） | 3.38–3.89秒 | 674–693ms |

這7次均為正式站預期URL、沒有Lighthouse runtimeError，原始報告存在；CLS量測皆0。4次本機結果受HTTP/1.1及prefetch行為影響，不作正式站速度結論。

### 優先處理方向

1. **追蹤載入盤點，而非盲刪。** 首頁一份原始run顯示4支Google標籤合計688,411bytes（約672KiB）；兩個不同GA4 ID連同GTM與Ads均載入。多ID不等於同一資源page_view重複，需查實際送出的measurement／conversion依賴後才決定合併。不能只按JS大小斷言所有TBT都是追蹤造成，需阻擋對照或trace驗證。
2. **Turnstile負載值得按需初始化測試。** 原始network有驗證iframe及約607KB challenge XHR；這次headless負載未必等於所有訪客。可在表單接近視口／意圖明確時初始化，但需測快速提交、token過期、widget錯誤，不移除防垃圾、不改backend。
3. **文章封面LCP priority。** Lighthouse發現文章LCP圖片priority hint不足；現有preload應保留，再核對實際img及link fetchpriority。用同環境前後對照，不承諾加一個屬性必定快多少。
4. **靜態響應式圖片。** `images.unoptimized=true`配靜態匯出不是bug，但原圖不一定適合小卡／手機；產生480／800等窄版並用srcset/sizes。不能直接關unoptimized要求不存在的Next image server。
5. **保留SSR再精簡互動。** 首頁有約62KB gzip動畫相關chunk可研究降低；不把重要內容改ssr:false換分數。

快取／CDN觀察另需覆核：目前出現互相衝突cache headers的線索，單次If-None-Match回200不等於完全沒快取；已有一年max-age但缺immutable也不等於壞。依你本輪範圍，不在本次修改主機／.htaccess。

## 4. 首頁：不是完全沒有圖片，而是欠「能證明你做到甚麼」的圖片

源碼有案例／文章圖，但Hero和前段主要是文字、icon、示意dashboard及品牌文字走馬燈；真正案例區排在Services、Stats、Comparison、Process、Testimonials之後。客人很遲才看到具體成果。

主審目視核對：`public/portfolio/beauty-ads.webp`是團隊／拍攝情景圖，螢幕寫ROI 1:8，並非實際網站或廣告帳戶截圖；`public/clients/aura-tress-hair-care-hong-kong.webp`清楚展示品牌門市。不能只憑圖斷定來源，但兩者證據功能不同。門市圖能證明客戶辨識，仍不代表你交付的設計作品，應配真實工作範圍／作品。

### 建議版面（維持品牌及既有資產）
1. Hero左邊講客戶目標；右邊展示真實已核准網站／系統／創意作品，清楚標明ADWire負責範圍。
2. 保留全部52品牌名字；有真logo檔才轉logo，不用門市相冒充logo、不自行移除品牌。
3. 提前放3個不同能力的案例：增長／網站系統／營運自動化。每個只講「原來問題 → 我們做甚麼 → 可核實交付」，數字用原核准口徑。
4. 加「你目前遇到哪個情況」入口帶短問卷，服務清單留作已知需求者的次入口。
5. 再放服務／合作流程／費用參考／FAQ／查詢。大幅合併重複能力或數據，不是增加更多section。

Hero dashboard已有「示意圖」標籤，不應誤報未有標示；可以保留作示意，但不宜當主要作品證據。

### 從客戶角度仍欠的答案
- 我想多些客，不識SEO／SEM，應由哪一項先開始？
- 最低要投入多少？包括廣告費、素材及工具嗎？月費還是一次性？
- 你們做過與我相似的項目嗎？具體負責哪部分？
- 網站／系統交付後，帳戶、原始碼、維護和第三方費用如何分？
- 按查詢之後要準備甚麼？有誰跟進？不要承諾未確認回覆時限。
- Partners究竟是使用的技術／整合工具，還是正式認證關係？未確認官方夥伴資格不可暗示。

500+客戶、52品牌與16個公開精選案例可以並存，沒有義務公開全部客戶。匿名見證亦不自動等於虛假。建議只改善公開／精選／授權的範圍說明，不自行刪已核准數字或改成「參考成效」。

## 5. 短問卷方案（完整規格另附questionnaire-spec.md）

### 有現成agency參考，不必憑空發明
- Oui Digital：4題、先看估價不用email，結果後才邀請聯絡。適合參考流程。
- WebFX：依網站工作量給範圍，再索取正式報價。適合有清楚需求者，不照搬其長技術表及保證文案。
- Fatcow Digital：多服務估價，拆工作量／素材來源，明示不是final price。適合參考費用拆分，不照搬長表。

已抓回三個官網HTTP200及原始HTML；未取得轉換率，不聲稱其流程一定提高成交。

### 推薦5題，技術自助分支2題結束
1. **想解決甚麼？** 增加查詢／改善網站系統或工序／已有項目找人執行／只找技術教學。
2. **目前最主要問題？** 依答案出不同選項，不要求客人先懂服務名稱。
3. **現有基礎？** 是否有網站、正在投放、需要整合，依分支只問相關範圍。
4. **可投入預算？** 分清每月服務費、廣告總投入、一次性IT費；預算未定者先看參考下限，不直接淘汰。
5. **何時準備開始？** 一個月／一至三個月／更後／先了解。

結果先顯示：推薦一項主要方向＋理由＋已核准方案／需確認的範圍＋不包含項目。確認想委託者才留聯絡資料，直接查詢入口亦保留。

### 分流
- 有商業需求＋接受對應投入＋有委託意向：銷售入口。
- 預算未定但可接受參考投入／複雜項目：人工預審，不當無預算。
- 明確只想免費自助／無投入計劃：相關文章及準備清單，主CTA不是預約sales。
- 技術教學：文章，不強迫留電話；保留「需要付費代辦」回程。

只在frontend做結果及CTA分流並不能防人繞過表單，更不等於CRM已自動分配；本輪不改CRM/backend。

### 價錢示範必須真實
Repo已公開：Ads管理費HK$3,800／月起（單平台），雙平台HK$8,800／月；SEO HK$5,800／月起；社媒HK$8,000／月起。**這些不是所有需求的全包價。** Ads要另列平台媒體費；SEO要交代現有3個月起條件；系統／AI項目未確認價目不得作一個假的即時價。

推薦站內React規則式元件；暫不買外部平台、不用自由聊天AI報價。先以透明門檻驗證需求，再考慮CRM自動路由。analytics只記分支／結果ID，不記電話／電郵，點結果不等於真正lead conversion。

## 6. 執行及驗收次序

| 批次 | 工作 | 驗收 |
|---|---|---|
| 第一批 | Navbar焦點／Drawer／CTA、表單驗證順序、schema評分及舊承諾 | 鍵盤、手機、空值／自動填寫、無正式提交；schema與可見資料一致 |
| 第二批 | FAQ單一來源、SSR可見、對比／減少動態、圖片priority及變體 | source/build掃描、320/390/430及桌面、無JS、Lighthouse前後對照 |
| 第三批 | 首頁作品證據提前＋需求入口＋精簡重複段落 | 真資產／工作範圍、完整品牌保留、視覺及手機審查 |
| 第四批 | 問卷frontend與現有message／WhatsApp草稿交接 | 所有分支、返回／更改答案、未定／零預算、價格邊界、無資料洩漏、無轉換重複 |

不承諾未測完成工期或百分比提升。GTM需先確認資產及事件依賴；需主機/CDN配合的另列工作，不混入本輪frontend修復。

## 7. 一手來源

- Google AI搜尋原則：https://developers.google.com/search/docs/appearance/ai-features
- Google AI optimization guide：https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google structured data policies：https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Google review標記：https://developers.google.com/search/docs/appearance/structured-data/review-snippet
- Google hidden text政策：https://developers.google.com/search/docs/essentials/spam-policies#hidden-text-and-links
- HowTo更新：https://developers.google.com/search/blog/2023/08/howto-faq-changes
- Sitelinks search box移除：https://developers.google.com/search/blog/2024/10/sitelinks-search-box
- Oui Digital：https://oui.digital/tools/website-cost-calculator
- WebFX：https://www.webfx.com/web-design/learn/website-design-cost-calculator/
- Fatcow：https://fatcowdigital.com/quotation-calculator

上述官方／agency頁面內容已實際取得；Typeform文件直接抓取403，只在問卷附稿標為搜尋可見、未測builder，不拿其未確認plan價格作決策。

## 交付檔案

- `audit-report.md`：本最終覆核版。
- `questionnaire-spec.md`：完整題目、分支、收費／分流／privacy及驗收規格。
- `verified-summary.json`：主審由原始Lighthouse重算指標及正確頁數。
- `raw/performance-*.json`：11份原始報告。
- 其他子審底稿僅作debug證據，已標更正，不作最終客向結論。

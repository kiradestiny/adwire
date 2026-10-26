# 內部查詢通知：WhatsApp 回覆客戶漏項

## 用戶要求／範圍

用戶以舊通知信截圖指出：新內部通知漏咗「WhatsApp 回覆客戶」綠色 button。呢個係跟進潛客嘅功能，唔係裝飾。恢復舊行為作上一版漏項修補，測試／覆核後更新正式版；不改問卷／商業評分／前台欄位、寄件供應商、收件人、Secret、DNS 或安全驗證。

用戶提供新版 Gmail 截圖亦證明普通表單新信已收到；唔再將「未收到新版」列成現況，但 CTA 未恢復前唔當全部功能驗收。

## 行為契約

- 綠色「WhatsApp 回覆客戶」放客人訊息／補充之後、安全與來源資訊之前。
- 只用該次提交 `phone`，唔硬編 ADWire／Peko 電話，唔由 IP 國家推電話國碼。
- 香港本地 8 位格式補 852；明確國際 `+`／`00` 前綴按國際處理，唔重複加 852。
- URL 用數字國際號碼 `https://wa.me/<number>`；無預填訊息、無自動發送。
- 非法／不明號碼唔建立錯誤 WhatsApp 連結，仍保留原本已轉義電話文字及現有安全電話／電郵聯絡方式。
- 普通聯絡表單同問卷都要有，冇客人補充亦唔可以漏 button。
- 只影響新建立嘅通知；已收 email 唔會自動更新，已 frozen outbox payload 唔改寫。

## 驗證／部署狀態

修改及本機驗證已完成：renderer 59/59、完整 npm test exit0、專案／handler TypeScript 檢查 exit0；真實 handler 測試亦斷言 provider HTML 含一個指向提交電話嘅 WhatsApp CTA。手機 browser 380px 寬無溢出，按鈕 260px、綠色、位於備註後／安全區前；冇點擊連結或聯絡真人。獨立覆核已 APPROVE（59/59，無阻塞問題）；正式部署仍須核對 canonical／runtime，未將本機完成當作已上線。

本輪只改 backend renderer（加測試／文件／本機預覽），前台 app/components/public/functions/scripts/package 同既有 source `13039a3` 無 diff。重用上次已通過完整 build 嘅原 `out/`；重新編譯／上傳 Functions，唔重新抓外部 CMS 或改動靜態內容。已核對原 route JS/CSS bytes 同正式證據一致；部署仍須 read-back canonical／runtime，唔由 git push 推斷已上線。

上一個正式版本 `7baa6554-9fa0-4643-bdcc-9297f0bbd162`（source `13039a3f838b983be253ec6671f5bae05d53f0fa`）保留回退。

官方連結契約：https://faq.whatsapp.com/5913398998672934

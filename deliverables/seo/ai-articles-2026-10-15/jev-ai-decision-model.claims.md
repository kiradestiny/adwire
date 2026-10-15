# claims.md — jev-ai-decision-model

查核日期：2026-10-15。以下每條主張均附一手來源 URL、生效日期與適用範圍。
標記說明：**[廠商自述]**＝來源為廠商官方公告，未經獨立第三方驗證；**[第三方]**＝獨立學術來源。

| # | 主張 | 一手來源 URL | 生效日期 | 適用範圍 |
|---|---|---|---|---|
| 1 | Jev 由 TypeSafe AI 開發，於 2026-09-15 開放早期存取（early access） | https://www.typesafe.ai/blog/introducing-system-one-models-and-jev ；https://en.wikipedia.org/wiki/Jev_(AI_model) | 2026-09-15 | Jev 發布狀態（early access，非全面開放） |
| 2 | TypeSafe AI 2024 年於三藩市成立；創辦人包括 Diogo Almeida（前 OpenAI） | https://en.wikipedia.org/wiki/Jev_(AI_model) | 2024（成立） | 公司背景 |
| 3 | 宣布 US$40M 種子輪，由 DCVC 領投 | https://en.wikipedia.org/wiki/Jev_(AI_model) | 2026-09-15 | 融資（宣布，非已交割細節） |
| 4 | Jev 是判別式模型，不生成自然語言文字；輸出 typed values＋機率＋confidence | https://en.wikipedia.org/wiki/Jev_(AI_model) | 2026-09-15 | 模型輸出形態 |
| 5 | 三個提問原語（noul／choice／score），全部多選題、平行回答、問題之間不允許依賴 | https://en.wikipedia.org/wiki/Jev_(AI_model) ；https://www.typesafe.ai/blog/introducing-system-one-models-and-jev | 2026-09-15 | API 問題型別 |
| 6 | 官方 API 輸入上限 64k token（含 32k 狀態＋最長問題） | https://en.wikipedia.org/wiki/Jev_(AI_model) | 2026-09-15 | API 限制 |
| 7 | 訓練方法為 RLCD（Reinforcement Learning for Calibrated Decisions）；與 RLHF／RLVR 對比 | https://www.typesafe.ai/blog/introducing-system-one-models-and-jev | 2026-09-15 | 訓練方法（名稱與定位；細節未公開） |
| 8 | **[廠商自述]** 輸入定價 $0.042／MTok；輸出免費 | https://www.typesafe.ai/blog/introducing-system-one-models-and-jev | 2026-09-15 | 定價（廠商自述，未經獨立核實；廠商亦稱無法證明無補貼） |
| 9 | **[廠商自述]** 端到端延遲 70–500ms；同級智能下快 40–200 倍；官網標示「193.6x faster／444.6x cheaper」 | https://www.typesafe.ai/blog/introducing-system-one-models-and-jev ；https://www.typesafe.ai/ | 2026-09-15（官網數字其後可見） | 速度（廠商自述；測試在西岸筆記型電腦、參考基準可能存在偏誤） |
| 10 | **[廠商自述]** 傳統 LLM 端到端回應 3–329 秒；輸入 $0.20–$10／MTok，輸出約為輸入 5 倍 | https://www.typesafe.ai/blog/introducing-system-one-models-and-jev | 2026-09-15 | 對照數字（廠商自述） |
| 11 | 廠商表明刻意不公布（not to publish）公開 benchmark 表現 | https://www.typesafe.ai/blog/introducing-system-one-models-and-jev | 2026-09-15 | 廠商對 benchmark 的立場 |
| 12 | **「廠商自評準確度約 67.8%」——未經一手來源核實**：無法在 TypeSafe 官網或第三方論文中找到出處，本文不作為事實引用 | （無一手來源） | 不適用 | 本文明確標示為無法核實 |
| 13 | **[第三方]** arXiv:2609.37647：37 個 dataset、346,009 requests、成本 <US$10；IMDB／SST-2／HellaSwag／ARC 達 95–99%；Belebele 122 語言 86.7%；勝 Qwen 27/37、勝 Gemma 37/37 | https://arxiv.org/abs/2609.37647 | 2026-09-29 提交 | 一般任務零樣本評測（jev-1.13.0；含旋轉選項、抽走問題等消融） |
| 14 | **[第三方]** arXiv:2609.37647：Jev 選項機率校準良好、支援選擇性預測；二元機率相對固定 0.5 門檻擺位不佳 | https://arxiv.org/abs/2609.37647 | 2026-09-29 | 校準表現（一般任務） |
| 15 | **[第三方]** arXiv:2609.34024：醫療評測 2,823 題（8,469 requests）、共約 US$0.08、中位延遲 0.27–0.31 秒 | https://arxiv.org/abs/2609.34024 | 2026-09-27 提交，2026-10-10 修訂（v4） | 醫療任務；成本數字官方摘要寫 USD 0.08 |
| 16 | **[第三方]** arXiv:2609.34024：PubMedQA 78.4%（對 GPT-6 Sol 78.2%）、MetaMedQA 74.8%（82.7%）、DiagnosisArena-MCQ 59.8%（82.4%）、NEJM 61.8%（82.4%） | https://arxiv.org/abs/2609.34024 | 2026-09-27 提交，2026-10-10 修訂 | 醫療任務準確度對比（GPT-6 Sol 中等推理） |
| 17 | **[第三方]** arXiv:2609.34024：MetaMedQA 上 Jev 校準最好（ECE 0.063 vs 0.146）；機率 ≥0.9 時準確度 93.4%（佔 52.9%）；DiagnosisArena AUROC 0.645 vs 0.768 | https://arxiv.org/abs/2609.34024 | 2026-09-27 提交，2026-10-10 修訂 | 校準與區辨力（醫療任務） |
| 18 | OpenAI Decisions API：公開 beta；predicate／choice／score 三種問題型別；目前僅支援 gpt-6-luna；POST /v1/decisions；速度約為 Responses API 的 10 倍；官方建議生成自訂 schema 時改用 Responses API | https://developers.openai.com/api/docs/guides/decisions | 文件現行版本（查核日 2026-10-15） | OpenAI 官方文件；推出日期 2026-10-06 由任務簡報提供，未在文件頁面明示 |
| 19 | JEPA（Joint Embedding Predictive Architecture）為 Meta 的世界模型架構，屬潛在空間預測路線；代表成果含 V-JEPA（其論文以特徵預測方式學習影片視覺表示） | https://ai.meta.com/research/publications/revisiting-feature-prediction-for-learning-visual-representations-from-video/ ；https://en.wikipedia.org/wiki/Jev_(AI_model)（Jev 與 JEPA 之區分） | Meta 官方研究頁（查核日 2026-10-15 可存取） | 兩者區分；Jev 與 JEPA 為不同路線 |
| 20 | Jev 命名源自 19 世紀經濟學家 William Stanley Jevons（Jevons paradox，1865） | https://www.typesafe.ai/blog/introducing-system-one-models-and-jev ；https://en.wikipedia.org/wiki/Jevons_paradox | 2026-09-15（命名說明） | 命名由來 |
| 21 | TypeSafe 未公布 Jev 的架構、權重或技術論文，僅稱「基於 transformer」；訓練資料為合成資料（細節未公開） | https://en.wikipedia.org/wiki/Jev_(AI_model) | 2026-09-15 | 技術透明度（架構與資料未公開） |
| 22 | Jev 穩定版本號 jev-1.13.0 | https://en.wikipedia.org/wiki/Jev_(AI_model) | 2026-09-15 | 版本（第三方評測亦以 1.13 為準） |

## 待確認／不確定事項

- **67.8% 廠商自評準確度**：來源不明的數字，無法在 TypeSafe 官方頁面或 arXiv 論文中找到一手出處。本文已在正文明確標示為「未經一手來源核實，不宜當成既定事實引用」，並未當作事實使用。
- **OpenAI Decisions API 推出日期 2026-10-06**：來自任務簡報，官方文件頁面本身未標明日期；正文只寫「2026 年 10 月推出」。
- **醫療評測成本**：arXiv 摘要寫「USD 0.08」，任務簡報寫「US$0.082」；本文採用官方摘要的 US$0.08（約 0.08 美元）。
- **速度與成本數字**（$0.042／MTok、70–500ms、40–200x、193.6x、444.6x）：全部屬廠商自述，未經獨立第三方全面驗證；廠商本身亦主動披露測試環境與參考基準可能存在偏誤。
- **官網「193.6x faster／444.6x cheaper」**：於查核日仍在 typesafe.ai 首頁可見，但屬廠商自述；正文已標明為廠商官方標示。

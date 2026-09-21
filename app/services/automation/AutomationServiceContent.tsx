"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { motion } from "framer-motion";
import { Bot, Zap, Clock, Database, MessageSquare, ShoppingCart, UserCheck, ArrowRight, Check, X } from "lucide-react";

export default function AutomationServiceContent() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* 1. Hero Banner: 未來科技感 */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
        {/* 背景：電路板紋理 */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/50 bg-emerald-500/10 text-emerald-300 text-sm mb-8">
              <Bot size={14} />
              Business Workflow Automation
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              企業工作流程自動化<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">減少重複工序，連接現有系統</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              將 Email、表格、Excel、報價、訂單及客戶跟進等重複工序自動化。<br/>
              依已配置的流程持續執行；出現異常時會通知真人接手，並保留完整日誌。
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="/contact" className="bg-emerald-600 text-white px-8 py-4 rounded-full font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2">
                <Zap size={18} /> 討論你的流程
              </a>
              <a href="#demo" className="bg-white/10 border border-white/25 text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                看流程如何運作
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. 視覺核心：自動化流水線 (Workflow Visualization) */}
      <section className="py-24 bg-slate-50" id="demo">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81]">自動化是如何運作的？</h2>
            <p className="text-gray-500 mt-4">一個簡單的例子：當客人填寫了 Facebook Form...</p>
          </div>

          {/* Workflow Diagram */}
          <div className="relative">
            {/* 連接線 (Animated Line) */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 hidden md:block">
              <motion.div 
                className="h-full bg-emerald-500"
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 2, ease: "linear", repeat: Infinity, repeatDelay: 1 }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              <WorkflowStep 
                icon={UserCheck} 
                title="1. 取得名單" 
                desc="客人在 FB/IG 填寫 Lead Form" 
                delay={0}
              />
              <WorkflowStep 
                icon={Database} 
                title="2. 自動入庫" 
                desc="自動寫入 CRM 或指定系統，只輸入一次" 
                delay={0.5}
                isAuto
              />
              <WorkflowStep 
                icon={MessageSquare} 
                title="3. 即時聯絡" 
                desc="WhatsApp Bot 立即發送歡迎訊息" 
                delay={1.0}
                isAuto
              />
              <WorkflowStep 
                icon={ShoppingCart} 
                title="4. 成功轉化" 
                desc="同事接手跟進，個案有記錄可追" 
                delay={1.5}
                isSuccess
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. 人類 vs AI (Comparison) */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f4c81]">為什麼你需要自動化？</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Traditional Way */}
            <div className="border border-red-100 bg-red-50/30 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6 text-red-500 font-bold text-xl">
                <X size={24} /> 傳統人手操作
              </div>
              <ul className="space-y-4 text-gray-600">
                <li className="flex gap-3"><span className="text-red-400">❌</span> 回覆慢：客人等幾粒鐘都未有人理，轉頭搵第二間。</li>
                <li className="flex gap-3"><span className="text-red-400">❌</span> 易出錯：人手 Copy & Paste 電話號碼，容易打錯字。</li>
                <li className="flex gap-3"><span className="text-red-400">❌</span> 成本高：請一個 CS 要 $15k-$20k，仲要放假、MPF。</li>
                <li className="flex gap-3"><span className="text-red-400">❌</span> 被動：唔識主動追單 (Follow up)，流失大量潛在客。</li>
              </ul>
            </div>

            {/* Automation Way */}
            <div className="border border-emerald-100 bg-emerald-50/30 rounded-2xl p-8 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">ADWire 方案</div>
              <div className="flex items-center gap-3 mb-6 text-emerald-600 font-bold text-xl">
                <Check size={24} /> 營銷自動化系統
              </div>
              <ul className="space-y-4 text-gray-700">
                <li className="flex gap-3"><span className="text-emerald-500">✅</span> 即時：新查詢進入後即時觸發流程，非辦公時間仍可先接收及分類。</li>
                <li className="flex gap-3"><span className="text-emerald-500">✅</span> 可追查：API 直接對接，每步執行都有日誌；資料來源或欄位有誤時會標示並通知負責同事。</li>
                <li className="flex gap-3"><span className="text-emerald-500">✅</span> 減少人手：把重複輸入及跟進工序交由系統處理，同事專注需要判斷的個案。</li>
                <li className="flex gap-3"><span className="text-emerald-500">✅</span> 主動跟進：按設定時間自動提醒客戶或同事（例如報價後 24 小時提醒）。</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 業務問題 (Business Problems) */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">日常營運中最常見的重複工序</h2>
            <p className="text-gray-500 max-w-3xl mx-auto">
              以下情況通常不需要「全盤數碼轉型」才能解決。多數企業可以先自動化一至兩條流程，
              驗證效果後再擴展。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Email／Excel 之間複製資料", desc: "同一批資料要在 Email、Excel 及系統之間重複輸入，出錯後要找很久才知道錯在哪一步。" },
              { title: "報價重複製作", desc: "每次報價都要重新整理項目、單價及條款，格式和版本容易不一致。" },
              { title: "訂單及 Invoice 手動輸入", desc: "人手輸入單號、金額及客戶資料，月結時需要大量時間對數。" },
              { title: "客戶漏跟進", desc: "查詢分散在 WhatsApp、電郵及表格，沒有統一記錄，跟進依賴個人記憶。" },
              { title: "系統之間資料不同步", desc: "網店、CRM 及會計系統各自一份資料，數量及狀態不一致。" },
              { title: "流程出錯只有事後才知道", desc: "沒有日誌及通知機制，問題通常由客戶先發現。" },
            ].map((p) => (
              <div key={p.title} className="border border-gray-100 rounded-2xl p-6 bg-gray-50/60">
                <h3 className="font-bold text-[#0f4c81] mb-2">{p.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Before / After 代表流程 */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">一條流程的前後分別</h2>
            <p className="text-gray-500">以「查詢進入 → 建檔 → 跟進」為例</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-2xl p-8 bg-white">
              <div className="flex items-center gap-2 text-gray-500 font-bold mb-6">
                <Clock size={18} /> 自動化之前
              </div>
              <ol className="space-y-4 text-sm text-gray-600">
                <li>1. 客戶在表格或 WhatsApp 留下查詢</li>
                <li>2. 同事手動複製到 Excel</li>
                <li>3. 有空時再打開 CRM 輸入一次</li>
                <li>4. 靠記憶或個人提醒跟進</li>
                <li>5. 月底才由 Excel 統計成效</li>
              </ol>
            </div>

            <div className="border-2 border-emerald-200 rounded-2xl p-8 bg-emerald-50/40">
              <div className="flex items-center gap-2 text-emerald-700 font-bold mb-6">
                <Zap size={18} /> 自動化之後
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {[
                  "Email／表格",
                  "欄位擷取",
                  "資料校驗",
                  "CRM／ERP",
                  "人工核准",
                  "回覆／報告",
                ].map((step, i) => (
                  <span key={step} className="flex items-center gap-2">
                    <span className="bg-white border border-emerald-200 text-emerald-800 rounded-lg px-3 py-1.5 font-medium">
                      {step}
                    </span>
                    {i < 5 ? <ArrowRight size={14} className="text-emerald-400" /> : null}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-6 leading-relaxed">
                資料只輸入一次，其餘步驟由系統執行。需要人工判斷的個案會標示出來，
                由同事核准後才回覆客戶，避免系統自行發出不適當的內容。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. 應用場景 (Use Cases) */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">常見自動化場景</h2>
            <p className="text-gray-400">以下為流程設計示例，實際做法會按你的系統及權限確認。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScenarioCard 
              title="購物車未完成提醒" 
              desc="客人加入購物車但未付款時，按設定時間自動發送提醒訊息。訊息內容、發送時機及頻率均由你確認，並可設定每位客人的發送上限。"
              tag="E-commerce"
            />
            <ScenarioCard 
              title="預約／試堂自動提醒" 
              desc="預約完成後自動發送確認，並在約定時間前再次提醒。提醒方式可選 Email、WhatsApp 或兩者並用，視乎你已具備的平台權限。"
              tag="Service / Education"
            />
            <ScenarioCard 
              title="查詢自動分流與跟進" 
              desc="透過幾條問題收集預算、需求及時間表，按規則分流。個案會自動建立記錄並通知負責同事，避免只靠個人記憶跟進。"
              tag="B2B / Professional Services"
            />
          </div>
        </div>
      </section>

      {/* 7. 解決方案類型 */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">解決方案類型</h2>
            <p className="text-gray-500">按流程的確定程度選擇，不同類型可以混合使用。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "規則式自動化 (Rule-based)", desc: "條件明確、結果可預期的流程，例如「收到表格 → 建立記錄 → 通知指定同事」。容易驗證及維護，通常優先處理。" },
              { title: "AI 協助的流程 (AI-assisted)", desc: "適用於需要理解內容的步驟，例如從 Email 或文件中擷取欄位、把查詢分類、草擬回覆初稿。會加入人工覆核環節。" },
              { title: "系統整合 (API Integration)", desc: "連接現有 CRM、ERP、會計或預約系統，避免同一份資料在多處重複輸入。需要相關系統的 API 權限。" },
              { title: "通知與報告", desc: "按日／週／月自動產生摘要，讓負責人看到處理量、待跟進個案及異常記錄。" },
            ].map((s) => (
              <div key={s.title} className="border border-gray-100 rounded-2xl p-7 bg-gray-50/60">
                <h3 className="font-bold text-[#0f4c81] mb-3">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. 實作方式及例外處理 */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">實作方式及例外處理</h2>
            <p className="text-gray-500 max-w-3xl mx-auto">
              自動化最重要的不是「成功時如何運作」，而是「失敗時會發生什麼事」。
              以下項目會在方案中一併確認。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "失敗重試", desc: "第三方系統暫時無回應時，按設定次數自動重試，避免資料遺失。" },
              { title: "錯誤通知", desc: "連續失敗或異常情況會通知指定同事，而不是靜靜地停下來。" },
              { title: "權限控制", desc: "每個流程只取得執行所需的最小權限，員工離職或轉職時可獨立撤銷。" },
              { title: "人工交接", desc: "遇到無法判斷的個案（例如特殊折扣、投訴）會轉交真人處理。" },
              { title: "監控及日誌", desc: "每次執行都留有記錄，可追查某筆資料在什麼時間被哪個步驟處理。" },
              { title: "變更管理", desc: "流程修改前先確認影響範圍，重要改動會先在測試環境驗證。" },
            ].map((e) => (
              <div key={e.title} className="bg-white border border-gray-100 rounded-2xl p-6">
                <h3 className="font-bold text-[#0f4c81] mb-2">{e.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{e.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white border border-gray-100 rounded-2xl p-8">
            <h3 className="font-bold text-[#0f4c81] mb-4">可連接的系統</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              ADWire 可連接的範圍取決於對方系統有否提供 API、你所購買的方案是否包含 API 權限，
              以及該平台是否允許自動化存取。因此我們會先在 Discovery 階段確認實際可行的範圍，
              而不是預先承諾「任何系統都能接駁」。
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              常見類型包括：WhatsApp Business API、網站表單、電郵、CRM、ERP／會計系統、
              預約系統、網店平台及 Google Sheets／Drive。部分平台需要額外訂閱或申請權限，
              相關費用由客戶直接支付給該平台。
            </p>
          </div>
        </div>
      </section>

      {/* 9. 收費模式 */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[#0f4c81] mb-6">收費模式</h2>
          <p className="text-gray-600 leading-relaxed mb-8">
            自動化項目按流程數量及整合複雜度報價，沒有一個適用於所有企業的固定價格。
            一般流程是：先做 Discovery 釐清現有流程及系統限制，再提供明確的範圍、報價及時間表。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { step: "1", title: "Discovery", desc: "了解現有流程、系統、權限及人手安排，確立可自動化的範圍。" },
              { step: "2", title: "方案及報價", desc: "提供流程圖、交付清單、時間表及報價方式（一次性開發及／或按月維護）。" },
              { step: "3", title: "開發及上線", desc: "分段交付並提供測試環境，通過驗收後上線，並安排交接及文件。" },
            ].map((s) => (
              <div key={s.step} className="border border-gray-100 rounded-2xl p-6 bg-gray-50/60">
                <div className="text-3xl font-bold text-[#0f4c81]/20 mb-2">{s.step}</div>
                <h3 className="font-bold text-[#0f4c81] mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. 常見問題 */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#0f4c81] mb-12 text-center">流程自動化常見問題</h2>
          <div className="space-y-5">
            {[
              { q: "自動化之後，是否完全不需要人手處理？", a: "不是。規則明確的步驟可以交由系統執行，但涉及判斷、例外處理或客戶關係的環節通常保留人工覆核。實際設計會按你的業務風險決定哪些步驟必須由人確認。" },
              { q: "現有的 CRM 或 ERP 可以連接嗎？", a: "取決於該系統是否提供 API、你的方案是否包含 API 權限，以及平台是否允許自動化存取。我們會在 Discovery 階段實測確認，再告知可行的整合方式；如不可行會直接說明，不會先承諾後補救。" },
              { q: "流程出錯會不會影響客戶？", a: "設計時會加入失敗重試、錯誤通知及人工交接。高風險步驟（例如發出報價、確認訂單）通常設定為需要人手核准後才執行。" },
              { q: "需要多長時間？", a: "單一流程一般 2–6 週；涉及多系統整合或需要處理歷史資料的項目會較長。實際時間會在確認範圍後一併提供。" },
              { q: "資料會放在哪裡？", a: "資料存放及傳輸方式會按你的要求及所用平台的能力確認，包括誰可以存取、保留多久及是否需要日誌。我們會逐項說明實際安排，不會以「絕對安全」一類說法代替具體描述。" },
              { q: "上線之後由誰維護？", a: "可以交由 ADWire 按需要維護（按月安排），也可以由你的團隊接手。原始碼及帳戶歸屬會在合約中清楚列明，並在交付時提供文件及交接安排。" },
            ].map((f) => (
              <details key={f.q} className="group border border-gray-200 rounded-2xl bg-white overflow-hidden">
                <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer list-none">
                  <span className="font-bold text-[#0f4c81]">{f.q}</span>
                  <span className="text-[#f5a623] text-xl group-open:rotate-45 transition-transform shrink-0">+</span>
                </summary>
                <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 11. 維護 CTA */}
      <section className="py-16 bg-[#0f4c81] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">上線之後，需要持續調整</h2>
          <p className="text-blue-100 leading-relaxed mb-8 max-w-2xl mx-auto">
            流程會隨業務改變。可以選擇由 ADWire 按需要維護及調整，
            或由你的團隊接手 —— 兩者都會在合約中事先講清楚。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/contact" className="bg-[#f5a623] text-white px-8 py-3 rounded-full font-bold hover:bg-[#e09612] transition-colors">
              討論你的流程
            </a>
            <a href="/services/ai/" className="bg-white/10 border border-white/30 text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-colors">
              了解 AI 應用及維護安排
            </a>
          </div>
        </div>
      </section>

      <ContactSection defaultService="營銷自動化系統" />
      <Footer />
    </div>
  );
}

// --- 小組件 ---

function WorkflowStep({ icon: Icon, title, desc, delay, isAuto = false, isSuccess = false }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      viewport={{ once: true }}
      className={`relative bg-white p-6 rounded-2xl shadow-md border-2 text-center z-10 ${isAuto ? 'border-emerald-400' : isSuccess ? 'border-[#f5a623]' : 'border-gray-100'}`}
    >
      {isAuto && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider">
          AUTO
        </div>
      )}
      <div className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center ${isAuto ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
        <Icon size={24} />
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-500 text-sm">{desc}</p>
    </motion.div>
  );
}

function ScenarioCard({ title, desc, tag }: { title: string, desc: string, tag: string }) {
  return (
    <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all">
      <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">{tag}</div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}

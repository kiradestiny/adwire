/**
 * lib/assessment.ts — 「找出適合你的方案與預算」需求評估規則（純函式）
 *
 * 設計原則（依 deliverables/frontend-audit-2026-10-15/questionnaire-spec.md）：
 *   1. 純函式、無副作用、無 network、無 LLM、無 backend —— 可獨立測試。
 *   2. 分類分別判斷 intent / fit / budget acceptance / readiness，不靠「答題多＝分高」。
 *   3. 不因免費電郵、行業大小、電話來源而判低質素（本模組完全不接收這類資料）。
 *   4. 只用 repo 已公布的價目；網站／CRM／AI 項目沒有核准價目，故一律說「需確認範圍」，
 *      不填虛構區間、不挪用第三方 agency 的美金價格。
 *   5. 「尚未確定」預算 !== 零預算，會導向「需確認」而非「未準備」。
 *   6. 任何 #start 結果都不會在此模組寫入個人資料或轉換事件。
 *
 * 注意：本檔必須可被 Node 直接執行（type stripping）以進行單元測試，
 *   故只用 `import type`（執行時被抹除），不使用 enum / namespace。
 *   service-options 只以「型別」方式引入，實際字串由測試對照 public/config/services.json 驗證。
 */

import type { ServiceOption } from "./service-options";

// ─────────────────────────────────────────────────────────────────────────────
// 型別
// ─────────────────────────────────────────────────────────────────────────────

export type Goal = "growth" | "ops" | "project" | "selfhelp";

export type ServiceLineKey =
  | "ads"
  | "seo"
  | "social"
  | "web"
  | "system"
  | "automation"
  | "ai"
  | "other";

export type QuestionId = "goal" | "problem" | "base" | "budget" | "timing";

export type BudgetMode = "monthly-total-ads" | "monthly-service" | "one-off-project";

export type BudgetBand =
  | "none"
  | "below-floor"
  | "undecided"
  | "at-floor"
  | "mid"
  | "above-floor"
  | "high";

export type Timing = "within-month" | "1-3-months" | "later" | "exploring";

export type Classification =
  | "sales"
  | "needs-confirmation"
  | "not-ready"
  | "technical-self-help";

export interface BudgetAnswer {
  mode: BudgetMode;
  band: BudgetBand;
  /** 可選：明確金額（HK$／月 或 一次性）。只供邊界計算，UI 可不提供。 */
  amountHKD?: number | null;
}

export interface Answers {
  goal?: Goal;
  problem?: string;
  base?: string;
  budget?: BudgetAnswer;
  timing?: Timing;
}

export interface QuestionOption {
  id: string;
  label: string;
  hint?: string;
}

export interface Question {
  id: QuestionId;
  title: string;
  help?: string;
  /** 全部題目皆為單選；保留欄位讓 UI 明示「單選」/「多選」。 */
  multi: boolean;
  options: QuestionOption[];
}

export interface AdsPlanQuote {
  managementFeeHKD: number;
  basis: "single-platform" | "dual-platform" | "enterprise-15pct";
  note: string;
  /** 是否同時需要考慮平台數（用於說明「不是純粹睇預算揀套餐」）。 */
  platformScope: "single" | "multi" | "unknown";
}

export interface PricingBlock {
  label: string;
  lines: string[];
}

export interface ResourceLink {
  label: string;
  href: string;
}

export interface AssessmentResult {
  classification: Classification;
  /** 主要推薦方向（服務線名稱） */
  serviceLine: string;
  /** 對應 lib/service-options 白名單的服務選項（可用於交接） */
  serviceOption: ServiceOption;
  headline: string;
  reason: string;
  included: string[];
  notIncluded: string[];
  pricing?: PricingBlock;
  resources: ResourceLink[];
  nextStep: string;
  /** 是否顯示「交給 ADWire 跟進」交接 CTA */
  contactCta: boolean;
  /** 是否容許（非強制）提交摘要作人工預審 */
  allowSummarySubmit: boolean;
  /** 技術自助分支：是否提供「其實我需要付費團隊代辦」回程 */
  returnToPaidCta: boolean;
  /** 匿名分支／結果識別碼，只供 analytics 使用，不含個資 */
  branchId: string;
  resultId: string;
}

export interface PrefillPayload {
  service: string;
  message: string;
  budget: string;
  timeline: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 靜態資料
// ─────────────────────────────────────────────────────────────────────────────

export const PREFILL_STORAGE_KEY = "adwire_assessment_prefill_v1";

/** 統一服務頁路徑（保留現有 URL，不新增 slug） */
const LINE_HREF: Record<ServiceLineKey, string> = {
  ads: "/services/ads/",
  seo: "/services/seo/",
  social: "/services/social/",
  web: "/services/web/",
  system: "/services/system/",
  automation: "/services/automation/",
  ai: "/services/ai/",
  other: "/services/",
};

const LINE_NAME: Record<ServiceLineKey, string> = {
  ads: "成效廣告投放",
  seo: "SEO／GEO 搜尋引擎優化",
  social: "社交媒體代管",
  web: "網頁設計及優化",
  system: "系統／App 開發",
  automation: "企業流程自動化及 RPA",
  ai: "AI 應用與自動化",
  other: "綜合項目",
};

/** 與 lib/service-options（public/config/services.json）對應；型別保證為合法值。 */
const SERVICE_OPTION: Record<ServiceLineKey, ServiceOption> = {
  ads: "成效廣告投放",
  seo: "SEO/GEO 搜尋引擎優化",
  social: "社交媒體管理",
  web: "網頁設計及優化",
  system: "系統/APP開發",
  automation: "企業流程自動化及 RPA",
  ai: "AI 企業轉型方案",
  other: "其他合作",
};

export const GOAL_LABEL: Record<Goal, string> = {
  growth: "希望增加查詢／銷售",
  ops: "希望改善網站、系統或人手工序",
  project: "已有項目，希望找團隊執行",
  selfhelp: "只想查找技術教學或自行解決問題",
};

const TIMING_LABEL: Record<Timing, string> = {
  "within-month": "一個月內",
  "1-3-months": "一至三個月",
  later: "三個月後",
  exploring: "先了解，暫未有計劃",
};

const CLASSIFICATION_LABEL: Record<Classification, string> = {
  sales: "適合安排銷售跟進",
  "needs-confirmation": "需要先確認",
  "not-ready": "未準備投入付費服務",
  "technical-self-help": "技術自助",
};

// ── Q1 選項 ──────────────────────────────────────────────────────────────────
const GOAL_OPTIONS: QuestionOption[] = [
  { id: "growth", label: GOAL_LABEL.growth, hint: "例如查詢不足、廣告成本高、搜尋曝光少" },
  { id: "ops", label: GOAL_LABEL.ops, hint: "例如網站不合用、回覆跟進太花人手、資料分散" },
  { id: "project", label: GOAL_LABEL.project, hint: "已經有資助計劃、招標、內部項目或明確需求" },
  { id: "selfhelp", label: GOAL_LABEL.selfhelp, hint: "想先看教學與做法，暫時自己處理" },
];

// ── Q2 選項（依 Q1 分支）──────────────────────────────────────────────────────
const PROBLEM_OPTIONS: Record<Goal, QuestionOption[]> = {
  growth: [
    { id: "ads-low-enquiries", label: "有產品／服務，但查詢太少" },
    { id: "ads-high-cost", label: "已投放廣告，但查詢成本高、轉換差" },
    { id: "seo-visibility", label: "有網站，但搜尋曝光不足" },
    { id: "web-trust", label: "有流量，但網站或社交內容不足以建立信任" },
  ],
  ops: [
    { id: "ops-no-site", label: "沒有網站，或現有網站不合用" },
    { id: "ops-manual", label: "回覆、預約或跟進花太多人手" },
    { id: "ops-data-silos", label: "資料分散，Excel 與現有系統不能互通" },
    { id: "ops-knowledge", label: "內部文件搜尋或知識處理太慢" },
  ],
  project: [
    { id: "proj-web", label: "網站或 Landing Page" },
    { id: "proj-system", label: "系統、App 或 CRM／ERP" },
    { id: "proj-ai", label: "AI 應用或工作流程自動化" },
    { id: "proj-ads", label: "廣告投放" },
    { id: "proj-seo", label: "SEO／GEO" },
    { id: "proj-social", label: "社媒內容或影片製作" },
    { id: "proj-other", label: "其他（範圍待確認）" },
  ],
  selfhelp: [
    { id: "self-web", label: "網站／網頁設計", hint: "自己動手做網站、改版或技術設定" },
    { id: "self-ads", label: "廣告投放", hint: "自己設定及優化 Meta／Google 廣告" },
    { id: "self-seo", label: "SEO／搜尋優化", hint: "自己改善自然搜尋曝光" },
    { id: "self-ai", label: "AI／自動化", hint: "自己試用 AI 工具或自動化流程" },
  ],
};

/** problem id → 服務線 */
const PROBLEM_LINE: Record<string, ServiceLineKey> = {
  "ads-low-enquiries": "ads",
  "ads-high-cost": "ads",
  "seo-visibility": "seo",
  "web-trust": "web",
  "ops-no-site": "web",
  "ops-manual": "automation",
  "ops-data-silos": "system",
  "ops-knowledge": "ai",
  "proj-web": "web",
  "proj-system": "system",
  "proj-ai": "ai",
  "proj-ads": "ads",
  "proj-seo": "seo",
  "proj-social": "social",
  "proj-other": "other",
};

const PROBLEM_LABEL: Record<string, string> = Object.values(PROBLEM_OPTIONS)
  .flat()
  .reduce<Record<string, string>>((acc, o) => {
    acc[o.id] = o.label;
    return acc;
  }, {});

// ── Q3 選項（依 Q2 分支）──────────────────────────────────────────────────────
const BASE_SETS: Record<string, QuestionOption[]> = {
  ads: [
    { id: "ads-none", label: "尚未開始投放廣告" },
    { id: "ads-site-ready", label: "已有網站及可接單流程" },
    { id: "ads-single", label: "正在投放單一平台" },
    { id: "ads-multi", label: "正在投放多個平台" },
  ],
  seo: [
    { id: "seo-no-site", label: "沒有網站" },
    { id: "seo-no-seo", label: "有網站但未做 SEO" },
    { id: "seo-improve", label: "已有 SEO，想改善成效" },
    { id: "seo-large", label: "多語言網站或大型電商" },
  ],
  web: [
    { id: "build-new", label: "新建網站或系統" },
    { id: "rebuild", label: "改現有網站或系統" },
    { id: "integration", label: "需要登入、支付、預約或其他系統整合" },
    { id: "scope-unknown", label: "範圍未定，需要先釐清" },
  ],
  system: [
    { id: "build-new", label: "全新系統／App" },
    { id: "rebuild", label: "改現有系統或資料流程" },
    { id: "integration", label: "需要與現有 CRM／ERP 或其他系統整合" },
    { id: "scope-unknown", label: "範圍未定，需要先釐清" },
  ],
  automation: [
    { id: "auto-none", label: "目前全靠人手處理" },
    { id: "auto-tools", label: "有部分工具但仍要人手串接" },
    { id: "auto-integrate", label: "需要與現有系統或 CRM 整合" },
  ],
  ai: [
    { id: "ai-none", label: "仍未使用任何 AI 工具" },
    { id: "ai-scattered", label: "資料分散在文件及雲端硬碟" },
    { id: "ai-integrate", label: "需要與現有系統整合" },
  ],
  social: [
    { id: "social-assets", label: "已有可用素材" },
    { id: "social-need-shoot", label: "需要定期拍攝及製作" },
    { id: "social-none", label: "尚未有帳戶或品牌素材" },
  ],
  other: [
    { id: "other-general", label: "其他合作（範圍待確認）" },
  ],
};

/** problem id → 適用的 Q3 選項組 key */
const PROBLEM_BASE_SET: Record<string, string> = {
  "ads-low-enquiries": "ads",
  "ads-high-cost": "ads",
  "seo-visibility": "seo",
  "web-trust": "web",
  "ops-no-site": "web",
  "ops-manual": "automation",
  "ops-data-silos": "system",
  "ops-knowledge": "ai",
  "proj-web": "web",
  "proj-system": "system",
  "proj-ai": "ai",
  "proj-ads": "ads",
  "proj-seo": "seo",
  "proj-social": "social",
  "proj-other": "other",
};

const BASE_LABEL: Record<string, string> = Object.values(BASE_SETS)
  .flat()
  .reduce<Record<string, string>>((acc, o) => {
    acc[o.id] = o.label;
    return acc;
  }, {});

// ── Q5 選項 ──────────────────────────────────────────────────────────────────
const TIMING_OPTIONS: QuestionOption[] = [
  { id: "within-month", label: TIMING_LABEL["within-month"] },
  { id: "1-3-months", label: TIMING_LABEL["1-3-months"] },
  { id: "later", label: TIMING_LABEL.later },
  { id: "exploring", label: TIMING_LABEL.exploring },
];

// ─────────────────────────────────────────────────────────────────────────────
// 已公布價目（只可用這些數字；網站／CRM／AI 項目沒有核准價目）
// ─────────────────────────────────────────────────────────────────────────────

export const PUBLISHED = {
  adsManagementSingle: 3800,
  adsManagementDual: 8800,
  adsEnterpriseMin: 8800,
  adsEnterprisePct: 0.15,
  seoFrom: 5800,
  socialFrom: 8000,
} as const;

/** 廣告「每月總投入」到達此水平才適用企業抽成層（HK$50,000）。 */
export const ADS_ENTERPRISE_SPEND_THRESHOLD = 50000;

/**
 * 依平台數與每月總投入（服務費＋廣告費）推算廣告管理費。
 *
 * 為何不是「純粹睇預算揀套餐」：
 *   - 15,000 水平：單平台 → 標準單平台方案（3,800）；多平台 → 雙平台方案（8,800）。
 *     同一筆預算，因為平台數不同而落在不同方案。
 *   - 50,000 水平：進入企業抽成層（廣告費 15%，最低 HK$8,800／月）。
 *   - 平台數未知時不可臆測，只報最低標準（單平台）。
 */
export function quoteAdsPlan(input: {
  platforms: "single" | "multi" | "unknown";
  totalMonthlySpendHKD?: number | null;
}): AdsPlanQuote {
  const spend =
    typeof input.totalMonthlySpendHKD === "number" && input.totalMonthlySpendHKD > 0
      ? input.totalMonthlySpendHKD
      : null;

  if (spend !== null && spend >= ADS_ENTERPRISE_SPEND_THRESHOLD) {
    const pct = Math.round(spend * PUBLISHED.adsEnterprisePct);
    return {
      managementFeeHKD: Math.max(PUBLISHED.adsEnterpriseMin, pct),
      basis: "enterprise-15pct",
      note: "預算屬較高水平，管理費可按廣告費的 15% 計算（最低 HK$8,800／月）；最終方案仍須看交付範圍與平台數。",
      platformScope: input.platforms,
    };
  }

  if (input.platforms === "multi") {
    return {
      managementFeeHKD: PUBLISHED.adsManagementDual,
      basis: "dual-platform",
      note: "Meta＋Google 雙平台的標準代操管理費為 HK$8,800／月；廣告媒體費另計。",
      platformScope: "multi",
    };
  }

  return {
    managementFeeHKD: PUBLISHED.adsManagementSingle,
    basis: "single-platform",
    note:
      input.platforms === "unknown"
        ? "未確定平台數時，以單一平台的標準代操管理費 HK$3,800／月 作參考；廣告媒體費另計。"
        : "單一平台的標準代操管理費為 HK$3,800／月；廣告媒體費另計。",
    platformScope: input.platforms,
  };
}

/** base answer → 廣告平台數 */
export function platformsFromBase(base?: string): "single" | "multi" | "unknown" {
  if (base === "ads-multi") return "multi";
  if (base === "ads-single") return "single";
  return "unknown";
}

// ─────────────────────────────────────────────────────────────────────────────
// 題目邏輯
// ─────────────────────────────────────────────────────────────────────────────

export function optionsForGoal(goal: Goal): QuestionOption[] {
  return PROBLEM_OPTIONS[goal] ?? [];
}

export function lineForProblem(problem?: string): ServiceLineKey | null {
  if (!problem) return null;
  return PROBLEM_LINE[problem] ?? null;
}

export function budgetModeForLine(line: ServiceLineKey): BudgetMode {
  if (line === "ads") return "monthly-total-ads";
  if (line === "seo" || line === "social") return "monthly-service";
  return "one-off-project";
}

/**
 * 由「預算區間」推出一個代表金額，**只用作對應已公布的收費層級**。
 *
 * ⚠️ 這不是客戶的真實預算，亦不可當作報價。它的唯一用途是讓
 * `quoteAdsPlan` 的 HK$50,000 企業抽成層可以由 UI 到達
 * （否則 `budget.amountHKD` 永遠是 null，該層形同死碼）。
 *
 * 因此區間刻意切在已公布的門檻上：10,000（起步）與 50,000（企業抽成）。
 * 不確定／未打算投入一律回 null —— 不確定不可當成零或任何金額。
 * 網站／系統／AI 線沒有已公布價目，一律回 null，不可臆測。
 */
export function bandAmountHKD(mode: BudgetMode, band: BudgetBand): number | null {
  if (band === "none" || band === "undecided") return null;
  if (mode === "monthly-total-ads") {
    if (band === "below-floor") return 5_000;
    if (band === "at-floor") return 20_000;
    if (band === "mid") return 40_000;
    if (band === "high") return 50_000;
    return null;
  }
  if (mode === "monthly-service") {
    if (band === "below-floor") return 4_000;
    if (band === "at-floor") return 8_000;
    if (band === "above-floor") return 15_000;
    return null;
  }
  return null;
}

function budgetOptions(mode: BudgetMode): QuestionOption[] {
  const commonNone: QuestionOption = { id: "none", label: "暫未打算投入付費服務（先自行了解）" };
  if (mode === "monthly-total-ads") {
    // ⚠️ 必須有「低於已公布起步」一檔。冇這一檔，每月 HK$5,000 的客人只可以
    // 選「未打算投入」而被當成沒有預算（規格 §Q4 明確要求）。區間切在已公布
    // 門檻 10,000 與 50,000，令企業抽成層可以由 UI 到達。
    return [
      commonNone,
      { id: "below-floor", label: "每月總投入低於 HK$10,000（例如 HK$5,000 左右）" },
      { id: "undecided", label: "尚未確定，願意先參考已公布的起步投入" },
      { id: "at-floor", label: "可接受每月總投入約 HK$10,000 – 30,000（代操服務費＋廣告費）" },
      { id: "mid", label: "可接受每月總投入約 HK$30,000 – 50,000" },
      { id: "high", label: "可接受每月總投入 HK$50,000 以上" },
    ];
  }
  if (mode === "monthly-service") {
    // 起步水平用已公布的 SEO HK$5,800（不是 8,000）。
    return [
      commonNone,
      { id: "below-floor", label: "每月服務費低於 HK$5,800（例如 HK$3,000 左右）" },
      { id: "undecided", label: "尚未確定，願意先參考已公布的每月服務費" },
      { id: "at-floor", label: "可接受每月服務費約 HK$5,800 – 15,000（第三方成本另計）" },
      { id: "above-floor", label: "可接受每月服務費 HK$15,000 以上" },
    ];
  }
  return [
    commonNone,
    { id: "below-floor", label: "一次性預算較有限（例如 HK$20,000 以內）" },
    { id: "undecided", label: "尚未確定，希望先了解範圍與報價方式" },
    { id: "at-floor", label: "有預算，待確認範圍後再報價" },
    { id: "above-floor", label: "較高預算，可支援較複雜的系統或整合" },
  ];
}

/**
 * 依現有答案計算「會顯示的題目」。
 * 技術自助分支在 Q2（題目主題）後結束，因此長度為 2；其餘一般分支為 5。
 */
export function getQuestions(answers: Answers): Question[] {
  const goal = answers.goal;
  const list: Question[] = [];

  list.push({
    id: "goal",
    title: "你這次主要想處理甚麼？",
    help: "先講清楚目標，我們再問相關的問題；你可以隨時返回修改。",
    multi: false,
    options: GOAL_OPTIONS,
  });

  if (!goal) return list;

  list.push({
    id: "problem",
    title: goal === "selfhelp" ? "你想查找哪方面的技術教學？" : "目前最想改善哪個情況？",
    help: "不需要先懂 SEO／SEM／CRM 等名稱，按你遇到的情況選就可以。",
    multi: false,
    options: optionsForGoal(goal),
  });

  // 技術自助：兩題結束
  if (goal === "selfhelp") return list;

  const line = lineForProblem(answers.problem) ?? (goal === "project" ? "other" : null);

  list.push({
    id: "base",
    title: "目前有甚麼基礎？",
    help: "選最接近現況的一項，方便我們判斷範圍。",
    multi: false,
    options: answers.problem
      ? BASE_SETS[PROBLEM_BASE_SET[answers.problem] ?? "other"] ?? BASE_SETS.other
      : [],
  });

  const mode: BudgetMode = line ? budgetModeForLine(line) : "one-off-project";
  list.push({
    id: "budget",
    title:
      mode === "monthly-total-ads"
        ? "這次每月可安排的總投入大約是多少？（代操服務費＋廣告費）"
        : mode === "monthly-service"
          ? "這次可接受的每月服務費大約是多少？（第三方成本另計）"
          : "這次可安排的一次性項目預算大約是多少？",
    help: "「尚未確定」不等於沒有預算；選了之後我們會先展示已公布的參考投入。",
    multi: false,
    options: budgetOptions(mode),
  });

  list.push({
    id: "timing",
    title: "預計何時開始？",
    help: "時間未定也可以照選，我們會如實說明可行的安排。",
    multi: false,
    options: TIMING_OPTIONS,
  });

  return list;
}

export function totalSteps(answers: Answers): number {
  return getQuestions(answers).length;
}

export function isSelfHelpBranch(answers: Answers): boolean {
  return answers.goal === "selfhelp";
}

// ─────────────────────────────────────────────────────────────────────────────
// 答案協調（保留相容答案、清除不相容的下游答案）
// ─────────────────────────────────────────────────────────────────────────────

export function reconcileAnswers(answers: Answers): Answers {
  const next: Answers = { ...answers };

  if (!next.goal) {
    return { goal: next.goal };
  }

  const validProblems = optionsForGoal(next.goal).map((o) => o.id);
  if (next.problem && !validProblems.includes(next.problem)) {
    next.problem = undefined;
  }

  if (next.goal === "selfhelp") {
    // 自助分支只有兩題
    delete next.base;
    delete next.budget;
    delete next.timing;
    return next;
  }

  if (next.problem) {
    const setKey = PROBLEM_BASE_SET[next.problem] ?? "other";
    const validBases = (BASE_SETS[setKey] ?? BASE_SETS.other).map((o) => o.id);
    if (next.base && !validBases.includes(next.base)) {
      next.base = undefined;
    }

    const line = lineForProblem(next.problem) ?? "other";
    const mode = budgetModeForLine(line);
    if (next.budget && next.budget.mode !== mode) {
      next.budget = undefined;
    }
  } else {
    delete next.base;
    delete next.budget;
  }

  return next;
}

/** 設定某一題的答案，並清除已不相容的下游答案。 */
export function applyAnswer(answers: Answers, id: QuestionId, value: string): Answers {
  const next: Answers = { ...answers };

  switch (id) {
    case "goal": {
      next.goal = value as Goal;
      delete next.problem;
      delete next.base;
      delete next.budget;
      delete next.timing;
      break;
    }
    case "problem": {
      next.problem = value;
      delete next.base;
      delete next.budget;
      break;
    }
    case "base": {
      next.base = value;
      break;
    }
    case "budget": {
      const line = lineForProblem(next.problem) ?? "other";
      const mode = budgetModeForLine(line);
      const band = value as BudgetBand;
      next.budget = { mode, band, amountHKD: bandAmountHKD(mode, band) };
      break;
    }
    case "timing": {
      next.timing = value as Timing;
      break;
    }
  }

  return reconcileAnswers(next);
}

/** 偽造一個 budget 答案（供測試邊界使用）。 */
export function withBudgetAmount(
  answers: Answers,
  amountHKD: number | null,
): Answers {
  if (!answers.budget) return answers;
  return { ...answers, budget: { ...answers.budget, amountHKD } };
}

// ─────────────────────────────────────────────────────────────────────────────
// 結果內容
// ─────────────────────────────────────────────────────────────────────────────

interface LineContent {
  title: string;
  included: string[];
  notIncluded: string[];
  pricing: PricingBlock;
  resources: ResourceLink[];
}

function publishedPricing(line: ServiceLineKey): PricingBlock {
  switch (line) {
    case "ads":
      return {
        label: "已公布的廣告代操收費（媒體費另計）",
        lines: [
          "代操管理費：單一平台 HK$3,800／月；Meta＋Google 雙平台 HK$8,800／月。",
          "廣告媒體費：另計，由你直接支付給廣告平台，並非 ADWire 收入。",
          "每月總投入＝代操管理費＋廣告媒體費。",
          "若以廣告費抽成方式計算，企業管理費為廣告費的 15%，最低 HK$8,800／月。",
        ],
      };
    case "seo":
      return {
        label: "已公布的 SEO 收費（第三方成本另計）",
        lines: [
          "SEO 方案由 HK$5,800／月 起（單一網站、單一市場）。",
          "3 個月最低服務期，按月預繳。",
          "大型、多語言或大量 SKU 的網站，需要確認範圍後另行報價。",
        ],
      };
    case "social":
      return {
        label: "已公布的社媒代管收費",
        lines: [
          "社交媒體代管由 HK$8,000／月 起。",
          "拍攝、廣告投放、KOL 合作等未包含的項目會另行報價。",
        ],
      };
    default:
      return {
        label: "網站／系統／AI 項目的收費",
        lines: [
          "這類項目沒有已公布的即時價目。",
          "需要先確認範圍（功能、整合、交付物）後，才會提供逐項列明的書面報價。",
          "我們不會用固定套餐或虛構區間作即時估價。",
        ],
      };
  }
}

function lineContent(line: ServiceLineKey): LineContent {
  const title = LINE_NAME[line];
  const base: LineContent = {
    title,
    included: [],
    notIncluded: [],
    pricing: publishedPricing(line),
    resources: [
      { label: `查看${LINE_NAME[line]}服務說明`, href: LINE_HREF[line] },
      { label: "查看公開成功案例", href: "/portfolio/" },
    ],
  };

  switch (line) {
    case "ads":
      base.included = [
        "廣告帳戶設定、受眾及素材策略",
        "投放、持續優化與月度成效報告",
        "追蹤碼與轉換設定的檢視",
      ];
      base.notIncluded = ["廣告媒體費（由你直接支付平台）", "額外拍攝或大量素材製作", "網站重做或大型追蹤修復"];
      break;
    case "seo":
      base.included = ["技術 SEO 檢視與修正", "關鍵字及搜尋意圖規劃", "內容優化與每月排名報告"];
      base.notIncluded = ["付費廣告投放", "網站由零開始重建", "第三方工具或內容製作費用"];
      break;
    case "social":
      base.included = ["內容排程與發佈", "帖文／短片製作（按方案範圍）", "粉絲互動管理與月度報告"];
      base.notIncluded = ["廣告投放費", "KOL 合作費", "額外實體拍攝日"];
      break;
    case "web":
      base.included = ["網站或 Landing Page 設計與開發", "效能及基本 SEO 結構", "上線、文件及交接"];
      base.notIncluded = ["與你另購的付費服務或廣告費", "長期維護（可另議）", "未確認範圍的大型系統整合"];
      break;
    case "system":
      base.included = ["需求整理與架構設計", "系統／App 開發及測試", "部署、文件及員工交接"];
      base.notIncluded = ["第三方 API 或雲端服務月費", "範圍外的功能追加", "長期維護（可另議）"];
      break;
    case "automation":
      base.included = ["流程盤點及自動化設計", "連接現有工具或系統", "人工覆核、失敗重試及錯誤通知"];
      base.notIncluded = ["現有系統本身的授權或訂閱費", "未確認範圍的深度系統改造"];
      break;
    case "ai":
      base.included = ["AI 應用或知識庫的範圍設計", "開發、測試及整合", "使用文件及培訓"];
      base.notIncluded = ["模型或雲端服務的用量費", "未確認範圍的自訂模型訓練"];
      break;
    default:
      base.included = ["先釐清需求與可行範圍", "提供方向及報價方式說明"];
      base.notIncluded = ["即時定價或固定套餐報價"];
      break;
  }

  return base;
}

const SELF_HELP_CONTENT: Record<string, { topicName: string; resources: ResourceLink[] }> = {
  "self-web": {
    topicName: "網站／網頁設計",
    resources: [
      { label: "查看網頁設計及電商服務說明", href: "/services/web/" },
      { label: "閱讀網站相關文章", href: "/blog/" },
    ],
  },
  "self-ads": {
    topicName: "廣告投放",
    resources: [
      { label: "查看成效廣告投放服務說明", href: "/services/ads/" },
      { label: "閱讀廣告相關文章", href: "/blog/" },
    ],
  },
  "self-seo": {
    topicName: "SEO／搜尋優化",
    resources: [
      { label: "查看 SEO／GEO 服務說明", href: "/services/seo/" },
      { label: "閱讀 SEO 相關文章", href: "/blog/" },
    ],
  },
  "self-ai": {
    topicName: "AI／自動化",
    resources: [
      { label: "查看 AI 應用與自動化服務說明", href: "/services/ai/" },
      { label: "閱讀 AI 與自動化文章", href: "/blog/" },
    ],
  },
};

const PREP_CHECKLIST = [
  "整理目前遇到的具體問題及影響（例如每月查詢數量、回覆時間）。",
  "列出你已擁有的資源：網站、廣告帳戶、可用素材、現有系統。",
  "寫下一個可量度的目標（例如每月新增查詢數）。",
];

// ─────────────────────────────────────────────────────────────────────────────
// 分類
// ─────────────────────────────────────────────────────────────────────────────

/** 分別判斷四項，回傳可解釋的分解，方便測試與除錯。 */
export interface Signals {
  intent: boolean;
  fit: boolean;
  budgetAccepted: boolean;
  budgetUndecided: boolean;
  noBudget: boolean;
  ready: boolean;
}

export function signals(answers: Answers): Signals {
  const band = answers.budget?.band;
  const noBudget = band === "none";
  const budgetUndecided = band === "undecided";
  const budgetAccepted = band === "at-floor" || band === "above-floor";
  const ready = answers.timing === "within-month" || answers.timing === "1-3-months";
  const intent =
    answers.goal !== undefined &&
    answers.goal !== "selfhelp" &&
    !(noBudget && answers.timing === "exploring");
  const fit = lineForProblem(answers.problem) !== null || answers.goal === "selfhelp";
  return { intent, fit, budgetAccepted, budgetUndecided, noBudget, ready };
}

export function classify(answers: Answers): AssessmentResult {
  // ── D. 技術自助 ──────────────────────────────────────────────────────────
  if (isSelfHelpBranch(answers)) {
    const topic = SELF_HELP_CONTENT[answers.problem ?? ""] ?? {
      topicName: "技術教學",
      resources: [{ label: "閱讀網誌文章", href: "/blog/" }],
    };
    return {
      classification: "technical-self-help",
      serviceLine: "技術自助",
      serviceOption: SERVICE_OPTION.other,
      headline: `先由${topic.topicName}的技術教學開始`,
      reason: "你選擇自行處理，我們不會強迫你留下電話，也不會安排銷售來電。",
      included: [
        "相關技術文章及做法說明",
        "可自行套用的準備清單",
      ],
      notIncluded: ["銷售來電跟進", "自動加入客戶名單"],
      resources: [
        ...topic.resources,
        { label: "其實我需要付費團隊代辦", href: "/contact/#contact" },
      ],
      nextStep: "先閱讀相關文章；如果之後想找團隊執行，可隨時到聯絡頁說明需求。",
      contactCta: false,
      allowSummarySubmit: false,
      returnToPaidCta: true,
      branchId: "selfhelp",
      resultId: `selfhelp:${answers.problem ?? "unknown"}`,
    };
  }

  const line = lineForProblem(answers.problem) ?? "other";
  const content = lineContent(line);
  const band = answers.budget?.band;
  const sig = signals(answers);
  const isITLine =
    line === "web" || line === "system" || line === "automation" || line === "ai" || line === "other";
  const hasPublishedFloor = line === "ads" || line === "seo" || line === "social";

  // 廣告方案的收費會依平台數調整
  let pricing = content.pricing;
  if (line === "ads") {
    const quote = quoteAdsPlan({
      platforms: platformsFromBase(answers.base),
      totalMonthlySpendHKD: answers.budget?.amountHKD ?? null,
    });
    pricing = {
      label: content.pricing.label,
      lines: [
        `代操管理費參考：HK$${quote.managementFeeHKD.toLocaleString("en-US")}／月（${quote.note}）`,
        "廣告媒體費：另計，由你直接支付給廣告平台，並非 ADWire 收入。",
        "每月總投入＝代操管理費＋廣告媒體費。",
        "正式費用及交付以書面報價為準。",
      ],
    };
  }

  const base = {
    serviceLine: LINE_NAME[line],
    serviceOption: SERVICE_OPTION[line],
    included: content.included,
    notIncluded: content.notIncluded,
    pricing,
    resources: content.resources,
    returnToPaidCta: false,
  };

  // ── C. 未準備：明確無預算 ────────────────────────────────────────────────
  if (band === "none") {
    return {
      ...base,
      classification: "not-ready",
      headline: "先打好基礎，再考慮付費方案",
      reason:
        "你表示暫未打算投入付費服務，所以我們不會安排銷售跟進，改為提供文章及準備清單。",
      resources: [
        { label: `閱讀${LINE_NAME[line]}相關文章`, href: "/blog/" },
        { label: `了解${LINE_NAME[line]}服務範圍`, href: LINE_HREF[line] },
      ],
      included: [...PREP_CHECKLIST],
      notIncluded: ["銷售預約", "自動加入客戶名單"],
      nextStep: "準備好之後，可隨時返回這裡重新評估，或直接到聯絡頁說明需求。",
      contactCta: false,
      allowSummarySubmit: false,
      branchId: `line:${line}`,
      resultId: `not-ready:${line}`,
    };
  }

  // ── B2. 需確認：願意投入但低於已公布起步 ────────────────────────────────
  // 規格明確要求「不暗中丟棄已提交查詢」。這一類客人**願意付費**，只是預算較小，
  // 不能當成 not-ready（那會令他們直接流失）。
  if (band === "below-floor") {
    return {
      ...base,
      classification: "needs-confirmation",
      headline: `先收窄範圍，再對應${LINE_NAME[line]}的起步投入`,
      reason:
        "你願意投入，但現階段預算低於已公布的起步水平。我們不會因此當作沒有預算，而是先看能否用較小範圍或分階段方式達成目標。",
      resources: [
        { label: `了解${LINE_NAME[line]}服務範圍`, href: LINE_HREF[line] },
        { label: "查看公開成功案例", href: "/portfolio/" },
      ],
      nextStep:
        "可把答案摘要交給 ADWire；同事會先看能否用較小範圍或分階段方式處理，不會承諾即時安排銷售會議。",
      contactCta: true,
      allowSummarySubmit: true,
      branchId: `line:${line}`,
      resultId: `needs-confirmation:${line}:below-floor`,
    };
  }

  // ── B. 需確認：複雜 IT 範圍，或預算未定 ─────────────────────────────────
  if (isITLine) {
    return {
      ...base,
      classification: "needs-confirmation",
      headline: `先確認範圍，再提供${LINE_NAME[line]}的報價`,
      reason:
        line === "other"
          ? "你的需求屬於綜合或未定範圍，需要先釐清才能判斷做法與收費。"
          : "這類項目沒有已公布的即時價目，需要先確認功能、整合及交付範圍。",
      resources: [
        { label: `了解${LINE_NAME[line]}交付流程`, href: LINE_HREF[line] },
        { label: "查看公開成功案例", href: "/portfolio/" },
      ],
      nextStep:
        "你可以選擇把答案摘要交給 ADWire 作人工預審；我們會先釐清範圍，不會承諾即時安排銷售會議。",
      contactCta: true,
      allowSummarySubmit: true,
      branchId: `line:${line}`,
      resultId: `needs-confirmation:${line}:${band ?? "na"}`,
    };
  }

  // 到這裡只剩有已公布起步價的營銷線（ads / seo / social）
  if (!hasPublishedFloor) {
    return {
      ...base,
      classification: "needs-confirmation",
      headline: "需要先確認範圍與預算",
      reason: "現有資料未足夠判斷，需要先確認需求與可安排的投入。",
      nextStep: "可把答案摘要交給 ADWire 作人工預審。",
      contactCta: true,
      allowSummarySubmit: true,
      branchId: `line:${line}`,
      resultId: `needs-confirmation:${line}:unknown`,
    };
  }

  // ── A. 適合銷售：接受起步投入＋有委託意向 ──────────────────────────────
  if (sig.budgetAccepted && answers.timing !== "exploring") {
    return {
      ...base,
      classification: "sales",
      headline: `建議先由一項主要方向開始：${LINE_NAME[line]}`,
      reason: `你的需求與預算已對應到已公布的${LINE_NAME[line]}方案，可直接交由同事跟進可行性與範圍。`,
      nextStep:
        "把答案摘要交給 ADWire，我們會按服務類別安排合適同事回覆做法、範圍及報價方式。",
      contactCta: true,
      allowSummarySubmit: true,
      branchId: `line:${line}`,
      resultId: `sales:${line}:${band}`,
    };
  }

  // ── B. 需確認：預算未定，或時間只是先了解 ──────────────────────────────
  return {
    ...base,
    classification: "needs-confirmation",
    headline: `可以先把${LINE_NAME[line]}的範圍與起步投入講清楚`,
    reason:
      band === "undecided"
        ? "你表示預算尚未確定，這並不等於沒有預算；我們會先展示已公布的起步投入，再確認是否合適。"
        : "你現階段仍在了解，我們會先釐清需要與時間安排，再決定下一步。",
    nextStep:
      "你可以選擇把答案摘要交給 ADWire 作人工預審；我們不會承諾即時排銷售會議。",
    contactCta: true,
    allowSummarySubmit: true,
    branchId: `line:${line}`,
    resultId: `needs-confirmation:${line}:${band ?? "na"}`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 交接（交由 /contact 消費；不含個人資料）
// ─────────────────────────────────────────────────────────────────────────────

function goalLabelSafe(goal?: Goal): string {
  return goal ? GOAL_LABEL[goal] : "未填";
}

function budgetLabel(mode: BudgetMode, band: BudgetBand): string {
  const prefix =
    mode === "monthly-total-ads"
      ? "每月總投入（代操服務費＋廣告費）"
      : mode === "monthly-service"
        ? "每月服務費"
        : "一次性項目預算";
  switch (band) {
    case "none":
      return `${prefix}：暫未打算投入付費服務`;
    case "below-floor":
      return `${prefix}：低於已公布的起步水平`;
    case "undecided":
      return `${prefix}：尚未確定，願意先參考已公布的起步投入`;
    case "at-floor":
      return `${prefix}：可接受起步水平（待確認範圍）`;
    case "mid":
      return `${prefix}：中高預算（待確認範圍）`;
    case "above-floor":
      return `${prefix}：中高預算（待確認範圍）`;
    case "high":
      return `${prefix}：高預算（待確認範圍）`;
  }
}

/** 產生可複製／可交接的純文字摘要（不含姓名、電話、電郵等個資）。 */
export function summaryText(result: AssessmentResult, answers: Answers): string {
  const mode = answers.budget?.mode ?? "one-off-project";
  const band = answers.budget?.band ?? "undecided";
  const lines = [
    "【ADWire 需求評估摘要】",
    `想處理：${goalLabelSafe(answers.goal)}`,
    `主要情況：${answers.problem ? PROBLEM_LABEL[answers.problem] ?? answers.problem : "未填"}`,
    `現有基礎：${answers.base ? BASE_LABEL[answers.base] ?? answers.base : "未填"}`,
    `可投入：${budgetLabel(mode, band)}`,
    `預計開始：${answers.timing ? TIMING_LABEL[answers.timing] : "未填"}`,
    `建議方向：${result.headline}`,
    `評估結果：${CLASSIFICATION_LABEL[result.classification]}（非正式報價）`,
  ];
  return lines.join("\n");
}

/**
 * 把 budget 答案映射成 /contact/ 表單「預算」欄位**接受的值**。
 *
 * ⚠️ 為何需要這個映射：`components/ContactSection.tsx` 只接受 `BUDGET_OPTIONS`
 * 內的字串（「尚未確定」／「HK$10,000 以下」／「HK$10,000 – 30,000」…）。
 * 若這裡直接送中文描述句，驗證會失敗，budget 會被靜默丟棄（只剩 message 帶到）。
 * 所以：表單值用短標籤，完整描述留在 message 的摘要內。
 */
function formBudgetValue(mode: BudgetMode, band: BudgetBand): string {
  if (band === "none" || band === "undecided") return "尚未確定";
  const amount = bandAmountHKD(mode, band);
  if (band === "below-floor") return "HK$10,000 以下";
  if (amount === null) return "尚未確定";
  if (amount < 10_000) return "HK$10,000 以下";
  if (amount < 30_000) return "HK$10,000 – 30,000";
  if (amount < 80_000) return "HK$30,000 – 80,000";
  if (amount < 200_000) return "HK$80,000 – 200,000";
  return "HK$200,000 以上";
}

/** 與 app/contact 的交接 JSON（sessionStorage）。刻意不含任何個人資料。 */
export function buildPrefill(result: AssessmentResult, answers: Answers): PrefillPayload {
  const mode = answers.budget?.mode ?? "one-off-project";
  const band = answers.budget?.band ?? "undecided";
  const timelineMap: Record<Timing, string> = {
    "within-month": "一個月內",
    "1-3-months": "一至三個月內",
    later: "三個月以上",
    exploring: "先了解，未決定時間",
  };
  return {
    service: result.serviceOption,
    // message 帶完整摘要（含預算的描述句），budget 欄位只放表單接受的短標籤。
    message: `${summaryText(result, answers)}\n\n可投入：${budgetLabel(mode, band)}`,
    budget: formBudgetValue(mode, band),
    timeline: answers.timing ? timelineMap[answers.timing] : "尚未確定",
  };
}

/** 只含匿名分支／結果識別碼的 analytics 事件資料。 */
export function analyticsPayload(result: AssessmentResult): {
  event: string;
  branch_id: string;
  result_id: string;
} {
  return {
    event: "assessment_result_view",
    branch_id: result.branchId,
    result_id: result.resultId,
  };
}

/**
 * tests/assessment.test.ts — lib/assessment.ts 單元測試
 *
 * 以 Node 原生 type stripping 執行（Node 26 已預設支援 .ts ESM）：
 *   node tests/assessment.test.ts
 *
 * 為何用手寫 runner 而非框架：repo 現時沒有測試框架依賴，而這個模組是純函式，
 * 用 assert + 計數器已足夠，亦避免為單一測試引入新依賴。
 *
 * 為何動態 import：Node ESM 需要顯式 .ts 副檔名，但本 repo 的 tsconfig 未啟用
 * allowImportingTsExtensions。故型別用 extensionless 的 `import type`（執行時抹除），
 * 執行時再以計算出的字串動態 import 真正的 .ts 模組。
 */

import { readFileSync } from "node:fs";
import type { Answers, BudgetBand, Goal, Timing } from "../lib/assessment";

type AssessmentModule = typeof import("../lib/assessment");

const moduleSpecifier: string = ["..", "lib", "assessment.ts"].join("/");

// ── 迷你測試框架 ──────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, cond: boolean, detail = "") {
  if (cond) {
    passed++;
    console.log(`  \u2705 ${name}`);
  } else {
    failed++;
    failures.push(name);
    console.log(`  \u274c ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function eq(name: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  check(name, a === e, `預期 ${e}，實際 ${a}`);
}

function section(title: string) {
  console.log(`\n${title}`);
}

// ── 白名單（真實來源）─────────────────────────────────────────────────────────
const servicesJson = JSON.parse(
  readFileSync(new URL("../public/config/services.json", import.meta.url), "utf8"),
) as { services: string[] };
const WHITELIST = new Set(servicesJson.services);

const BASE_BY_LINE: Record<string, string> = {
  ads: "ads-single",
  seo: "seo-no-seo",
  social: "social-assets",
  web: "rebuild",
  system: "rebuild",
  automation: "auto-none",
  ai: "ai-none",
  other: "other-general",
};

async function main() {
  const A: AssessmentModule = await import(moduleSpecifier);
  const {
    ADS_ENTERPRISE_SPEND_THRESHOLD,
    PUBLISHED,
    applyAnswer,
    bandAmountHKD,
    buildPrefill,
    classify,
    getQuestions,
    lineForProblem,
    platformsFromBase,
    quoteAdsPlan,
    reconcileAnswers,
    signals,
    summaryText,
    totalSteps,
  } = A;

  function answersFor(
    goal: Goal,
    problem: string,
    opts: { band?: BudgetBand; timing?: Timing; base?: string; amountHKD?: number | null } = {},
  ): Answers {
    const line = lineForProblem(problem) ?? "other";
    const mode =
      line === "ads"
        ? "monthly-total-ads"
        : line === "seo" || line === "social"
          ? "monthly-service"
          : "one-off-project";
    return {
      goal,
      problem,
      base: opts.base ?? BASE_BY_LINE[line] ?? "build-new",
      budget: { mode, band: opts.band ?? "at-floor", amountHKD: opts.amountHKD ?? null },
      timing: opts.timing ?? "within-month",
    };
  }

  // ── 1 ───────────────────────────────────────────────────────────────────────
  section("1. 每一條服務分支：服務選項 / 分類");
  {
    const cases: Array<[Goal, string, string, string]> = [
      ["growth", "ads-low-enquiries", "成效廣告投放", "sales"],
      ["growth", "ads-high-cost", "成效廣告投放", "sales"],
      ["growth", "seo-visibility", "SEO/GEO 搜尋引擎優化", "sales"],
      ["growth", "web-trust", "網頁設計及優化", "needs-confirmation"],
      ["ops", "ops-no-site", "網頁設計及優化", "needs-confirmation"],
      ["ops", "ops-manual", "企業流程自動化及 RPA", "needs-confirmation"],
      ["ops", "ops-data-silos", "系統/APP開發", "needs-confirmation"],
      ["ops", "ops-knowledge", "AI 企業轉型方案", "needs-confirmation"],
      ["project", "proj-web", "網頁設計及優化", "needs-confirmation"],
      ["project", "proj-system", "系統/APP開發", "needs-confirmation"],
      ["project", "proj-ai", "AI 企業轉型方案", "needs-confirmation"],
      ["project", "proj-ads", "成效廣告投放", "sales"],
      ["project", "proj-seo", "SEO/GEO 搜尋引擎優化", "sales"],
      ["project", "proj-social", "社交媒體管理", "sales"],
      ["project", "proj-other", "其他合作", "needs-confirmation"],
    ];
    for (const [goal, problem, option, klass] of cases) {
      const r = classify(answersFor(goal, problem));
      check(`${problem} →「${option}」`, r.serviceOption === option, `實際 ${r.serviceOption}`);
      check(`${problem} →「${klass}」`, r.classification === klass, `實際 ${r.classification}`);
      check(`${problem} → 服務選項在白名單`, WHITELIST.has(r.serviceOption), r.serviceOption);
    }
  }

  // ── 2 ───────────────────────────────────────────────────────────────────────
  section("2. 技術自助分支（2 題結束，不推銷售）");
  {
    for (const topic of ["self-web", "self-ads", "self-seo", "self-ai"]) {
      const r = classify({ goal: "selfhelp", problem: topic });
      check(`${topic} → technical-self-help`, r.classification === "technical-self-help", r.classification);
      check(`${topic} → contactCta=false`, r.contactCta === false);
      check(`${topic} → 提供付費回程入口`, r.returnToPaidCta === true);
    }
    eq("selfhelp 題目長度 = 2", totalSteps({ goal: "selfhelp" }), 2);
    eq("selfhelp + topic 長度 = 2", totalSteps({ goal: "selfhelp", problem: "self-seo" }), 2);
    const q = getQuestions({ goal: "selfhelp" });
    eq("第二題問技術教學", q[1]?.title.includes("技術教學"), true);
    eq("第二題選項數 = 4", q[1]?.options.length, 4);
  }

  // ── 3 ───────────────────────────────────────────────────────────────────────
  section("3. 商業分支長度 = 6（含角色題）；進度不誤報題數");
  {
    eq("growth 未答 → 6（含角色題）", totalSteps({ goal: "growth" }), 6);
    eq("growth+problem → 6", totalSteps({ goal: "growth", problem: "ads-low-enquiries" }), 6);
    eq("project → 6", totalSteps({ goal: "project" }), 6);
    eq("未選 Q1 → 只有 1 題", totalSteps({}), 1);
  }

  // ── 4 ───────────────────────────────────────────────────────────────────────
  section("4. Q2／Q3 依上游改變（dependent options）");
  {
    const growthProblems = getQuestions({ goal: "growth" })[1].options.map((o) => o.id);
    check("growth 的 Q2 不含營運選項", !growthProblems.includes("ops-manual"));
    const opsProblems = getQuestions({ goal: "ops" })[1].options.map((o) => o.id);
    check("ops 的 Q2 不含增長選項", !opsProblems.includes("seo-visibility"));

    const adsBase = getQuestions({ goal: "growth", problem: "ads-low-enquiries" })[2].options.map((o) => o.id);
    const seoBase = getQuestions({ goal: "growth", problem: "seo-visibility" })[2].options.map((o) => o.id);
    check("ads 的 Q3 有 ads-multi", adsBase.includes("ads-multi"));
    check("ads 的 Q3 無 seo-large", !adsBase.includes("seo-large"));
    check("seo 的 Q3 有 seo-large", seoBase.includes("seo-large"));
    check("seo 的 Q3 無 ads-multi", !seoBase.includes("ads-multi"));
  }

  // ── 5 ───────────────────────────────────────────────────────────────────────
  section("5. 預算：未知（undecided）／無預算（none）");
  {
    const undecided = answersFor("growth", "ads-low-enquiries", { band: "undecided" });
    eq("undecided → needs-confirmation", classify(undecided).classification, "needs-confirmation");
    check("undecided → allowSummarySubmit", classify(undecided).allowSummarySubmit === true);
    const sU = signals(undecided);
    check("undecided → budgetAccepted=false", sU.budgetAccepted === false);
    check("undecided → budgetUndecided=true", sU.budgetUndecided === true);
    check("undecided → noBudget=false（≠零預算）", sU.noBudget === false);

    const none = answersFor("growth", "ads-low-enquiries", { band: "none" });
    const rNone = classify(none);
    eq("none → not-ready", rNone.classification, "not-ready");
    check("none → contactCta=false", rNone.contactCta === false);
    check("none → 含準備清單", rNone.included.length >= 1);

    const noneUrgent = answersFor("growth", "seo-visibility", { band: "none", timing: "within-month" });
    eq("none + 一個月內 → not-ready", classify(noneUrgent).classification, "not-ready");

    const acceptedExploring = answersFor("project", "proj-ads", { band: "at-floor", timing: "exploring" });
    eq("接受起步 + 先了解 → needs-confirmation", classify(acceptedExploring).classification, "needs-confirmation");

    const acceptedLater = answersFor("growth", "ads-low-enquiries", { band: "at-floor", timing: "later" });
    eq("接受起步 + 三個月後 → sales", classify(acceptedLater).classification, "sales");
  }

  // ── 6 ───────────────────────────────────────────────────────────────────────
  section("6. 廣告價格邊界：HK$15,000 與 HK$50,000");
  {
    eq("15000 單平台 → 3,800", quoteAdsPlan({ platforms: "single", totalMonthlySpendHKD: 15000 }).managementFeeHKD, PUBLISHED.adsManagementSingle);
    eq("15000 單平台 basis", quoteAdsPlan({ platforms: "single", totalMonthlySpendHKD: 15000 }).basis, "single-platform");
    eq("15000 多平台 → 8,800", quoteAdsPlan({ platforms: "multi", totalMonthlySpendHKD: 15000 }).managementFeeHKD, PUBLISHED.adsManagementDual);
    eq("15000 多平台 basis", quoteAdsPlan({ platforms: "multi", totalMonthlySpendHKD: 15000 }).basis, "dual-platform");

    const s15 = quoteAdsPlan({ platforms: "single", totalMonthlySpendHKD: 15000 });
    const m15 = quoteAdsPlan({ platforms: "multi", totalMonthlySpendHKD: 15000 });
    check("15,000：平台數改變方案（非純看預算）", s15.managementFeeHKD !== m15.managementFeeHKD && s15.basis !== m15.basis);

    eq("49,999 多平台（低於門檻）→ 8,800", quoteAdsPlan({ platforms: "multi", totalMonthlySpendHKD: 49999 }).managementFeeHKD, PUBLISHED.adsManagementDual);
    eq("49,999 basis = dual-platform", quoteAdsPlan({ platforms: "multi", totalMonthlySpendHKD: 49999 }).basis, "dual-platform");

    eq("50,000 單平台 → 企業層 8,800", quoteAdsPlan({ platforms: "single", totalMonthlySpendHKD: 50000 }).managementFeeHKD, PUBLISHED.adsEnterpriseMin);
    eq("50,000 basis = enterprise", quoteAdsPlan({ platforms: "single", totalMonthlySpendHKD: 50000 }).basis, "enterprise-15pct");
    eq("100,000 → 15% = 15,000", quoteAdsPlan({ platforms: "multi", totalMonthlySpendHKD: 100000 }).managementFeeHKD, 15000);
    eq("門檻常數 = 50,000", ADS_ENTERPRISE_SPEND_THRESHOLD, 50000);
    eq("15000 平台未知 → 3,800", quoteAdsPlan({ platforms: "unknown", totalMonthlySpendHKD: 15000 }).managementFeeHKD, PUBLISHED.adsManagementSingle);
    eq("無金額單平台 → 3,800", quoteAdsPlan({ platforms: "single" }).managementFeeHKD, PUBLISHED.adsManagementSingle);

    eq("platformsFromBase(ads-multi)=multi", platformsFromBase("ads-multi"), "multi");
    eq("platformsFromBase(ads-single)=single", platformsFromBase("ads-single"), "single");
    eq("platformsFromBase(undefined)=unknown", platformsFromBase(undefined), "unknown");

    const lines15s = classify(answersFor("project", "proj-ads", { base: "ads-single", amountHKD: 15000 })).pricing?.lines.join("\n") ?? "";
    check("15,000 單平台結果含 3,800", lines15s.includes("3,800"));
    check("結果列明媒體費另計", lines15s.includes("媒體費") && lines15s.includes("另計"));
    const lines15m = classify(answersFor("project", "proj-ads", { base: "ads-multi", amountHKD: 15000 })).pricing?.lines.join("\n") ?? "";
    check("15,000 多平台結果含 8,800", lines15m.includes("8,800"));
    const lines50 = classify(answersFor("project", "proj-ads", { base: "ads-single", amountHKD: 50000 })).pricing?.lines.join("\n") ?? "";
    check("50,000 結果含 15% 抽成說明", lines50.includes("15%"));
  }

  // ── 7 ───────────────────────────────────────────────────────────────────────
  section("7. 只用已公布價目；IT 項目無虛構區間");
  {
    const rAds = classify(answersFor("growth", "ads-low-enquiries"));
    check("ads 引用 3,800", (rAds.pricing?.lines.join(" ") ?? "").includes("3,800"));
    const rSeo = classify(answersFor("growth", "seo-visibility"));
    check("seo 引用 5,800", (rSeo.pricing?.lines.join(" ") ?? "").includes("5,800"));
    check("seo 交代 3 個月最低", (rSeo.pricing?.lines.join(" ") ?? "").includes("3 個月"));
    const rSocial = classify(answersFor("project", "proj-social"));
    check("social 引用 8,000", (rSocial.pricing?.lines.join(" ") ?? "").includes("8,000"));
    const webPrice = classify(answersFor("project", "proj-web")).pricing?.lines.join(" ") ?? "";
    check("web：明示沒有即時價目", webPrice.includes("沒有已公布"));
    check("web：不含 HK$ 數字（無假區間）", !/HK\$[\d,]+/.test(webPrice));
    check("web：不提美金價", !/USD|美金|US\$/.test(webPrice));
  }

  // ── 8 ───────────────────────────────────────────────────────────────────────
  section("8. 變更上游答案 → 清除不相容下游；相容則保留");
  {
    const a: Answers = {
      goal: "growth",
      problem: "ads-low-enquiries",
      base: "ads-single",
      budget: { mode: "monthly-total-ads", band: "at-floor" },
      timing: "within-month",
    };

    const same = reconcileAnswers(a);
    check(
      "相容答案全部保留",
      same.problem === a.problem && same.base === a.base && same.budget?.band === "at-floor" && same.timing === "within-month",
    );

    const changedGoal = applyAnswer(a, "goal", "ops");
    eq("改 Q1 → problem 清除", changedGoal.problem, undefined);
    eq("改 Q1 → base 清除", changedGoal.base, undefined);
    eq("改 Q1 → budget 清除", changedGoal.budget, undefined);
    eq("改 Q1 → timing 清除", changedGoal.timing, undefined);
    eq("改 Q1 → goal 更新", changedGoal.goal, "ops");

    const changedProblem = applyAnswer(a, "problem", "seo-visibility");
    eq("改 Q2 → base 清除", changedProblem.base, undefined);
    eq("改 Q2 → budget 清除（模式改變）", changedProblem.budget, undefined);
    eq("改 Q2 → timing 保留", changedProblem.timing, "within-month");

    const stillAdsBase: Answers = {
      goal: "growth",
      problem: "seo-visibility",
      base: "ads-single",
      budget: { mode: "monthly-service", band: "at-floor" },
      timing: "within-month",
    };
    const rec = reconcileAnswers(stillAdsBase);
    eq("Q2=seo + base=ads-single（不相容）→ base 清除", rec.base, undefined);
    eq("Q2=seo + budget mode 正確 → 保留", rec.budget?.band, "at-floor");

    const changedBase = applyAnswer(a, "base", "ads-multi");
    eq("改 Q3 → budget 保留", changedBase.budget?.band, "at-floor");
    eq("改 Q3 → base 更新", changedBase.base, "ads-multi");

    eq(
      "空 goal → 其他答案清空",
      JSON.stringify(reconcileAnswers({ problem: "proj-web" })),
      JSON.stringify({}),
    );
  }

  // ── 9 ───────────────────────────────────────────────────────────────────────
  section("9. 交接 contract：JSON 形狀與白名單");
  {
    const answers = answersFor("project", "proj-seo");
    const r = classify(answers);
    const prefill = buildPrefill(r, answers);
    eq("keys 只有 4 個（無個資）", Object.keys(prefill).sort(), ["budget", "message", "service", "timeline"]);
    check("service 在白名單內", WHITELIST.has(prefill.service), prefill.service);
    check("可 JSON 序列化並還原", JSON.stringify(JSON.parse(JSON.stringify(prefill))) === JSON.stringify(prefill));
    check("message 不含電郵符號 @", !prefill.message.includes("@"));
    check("message 標明非正式報價", prefill.message.includes("非正式報價"));
    // ⚠️ 這兩個斷言以前寫錯方向：舊版把 budget 填成中文描述句（含「服務費」／
    // 「廣告費」），但 /contact 表單只接受 BUDGET_OPTIONS 內的短標籤，所以驗證
    // 必然失敗 → budget 被靜默丟棄，只剩 message 帶到。
    // 正確契約：budget 必須是表單接受的值；「服務費 vs 廣告費」的分辨留在 message。
    const FORM_BUDGET_OPTIONS = [
      "尚未確定", "HK$10,000 以下", "HK$10,000 – 30,000",
      "HK$30,000 – 80,000", "HK$80,000 – 200,000", "HK$200,000 以上",
    ];
    check("budget 為 /contact 表單接受的值（否則會被靜默丟棄）",
          FORM_BUDGET_OPTIONS.includes(prefill.budget), prefill.budget);
    check("可投入的描述留在 message", prefill.message.includes("可投入"));

    // 新區間的覆蓋（M2／M3 修正）：企業 15% 層必須真的可以由 UI 到達，
    // 而「低於起步但願意投入」不可被當成沒有預算。
    let adsAns = applyAnswer(answersFor("growth", "ads-low-enquiries"), "base", "ads-multi");
    adsAns = applyAnswer(adsAns, "budget", "high");
    adsAns = applyAnswer(adsAns, "timing", "within-month");
    const adsRes = classify(adsAns);
    check("ads 高投入 → 管理費可用 15% 計算（企業層可達）",
          (adsRes.pricing?.lines.join(" ") ?? "").includes("15%"),
          adsRes.pricing?.lines[0] ?? "(無 pricing)");
    check("ads 高投入的交接分辨服務費＋廣告費",
          buildPrefill(adsRes, adsAns).message.includes("廣告費")
          && buildPrefill(adsRes, adsAns).message.includes("服務費"));

    let midAns = applyAnswer(answersFor("growth", "ads-low-enquiries"), "base", "ads-multi");
    midAns = applyAnswer(midAns, "budget", "mid");
    check("HK$30,000–50,000 不會誤觸企業 15% 層",
          !(classify(midAns).pricing?.lines.join(" ") ?? "").includes("15%"),
          classify(midAns).pricing?.lines[0] ?? "(無 pricing)");

    let lowAns = applyAnswer(answersFor("growth", "ads-low-enquiries"), "budget", "below-floor");
    const lowRes = classify(lowAns);
    check("低於起步但願意投入 ≠ 未準備（不可當成沒有預算）",
          lowRes.classification === "needs-confirmation" && lowRes.contactCta === true,
          `${lowRes.classification} / contactCta=${lowRes.contactCta}`);

    check("「尚未確定」不會被當成任何金額",
          bandAmountHKD("monthly-total-ads", "undecided") === null
          && bandAmountHKD("monthly-total-ads", "none") === null);
    check("IT 線沒有已公布價目 → 不推算金額",
          bandAmountHKD("one-off-project", "at-floor") === null);

    const allProblems = [
      "ads-low-enquiries", "ads-high-cost", "seo-visibility", "web-trust",
      "ops-no-site", "ops-manual", "ops-data-silos", "ops-knowledge",
      "proj-web", "proj-system", "proj-ai", "proj-ads", "proj-seo", "proj-social", "proj-other",
    ];
    let allInWhitelist = true;
    for (const p of allProblems) {
      const goal: Goal = p.startsWith("ops") ? "ops" : p.startsWith("proj") ? "project" : "growth";
      if (!WHITELIST.has(classify(answersFor(goal, p)).serviceOption)) allInWhitelist = false;
    }
    check("所有分支 serviceOption 皆在白名單", allInWhitelist);
    check("selfhelp serviceOption 在白名單", WHITELIST.has(classify({ goal: "selfhelp", problem: "self-seo" }).serviceOption));

    const sum = summaryText(classify(answersFor("growth", "ads-low-enquiries")), answersFor("growth", "ads-low-enquiries"));
    check("summary 不含姓名／電話／電郵欄", !/姓名|電話|電郵|手機/.test(sum));
  }

  // ── 10 ──────────────────────────────────────────────────────────────────────
  section("10. analytics payload：只有匿名識別碼");
  {
    const r = classify(answersFor("growth", "ads-low-enquiries"));
    const p = A.analyticsPayload(r);
    eq("event 名稱", p.event, "assessment_result_view");
    eq("payload keys", Object.keys(p).sort(), ["branch_id", "event", "result_id"]);
    check("branch/result 不含個資", !p.branch_id.includes("@") && !p.result_id.includes("@"));
    check("resultId 帶分類前綴", r.resultId.includes(":"));
  }

  // ── 11 ──────────────────────────────────────────────────────────────────────
  section("11. 潛在客戶評級：BANT，唔受個資影響");
  {
    const hot = A.leadScore({ goal: "project", problem: "proj-system", base: "integration", budget: { mode: "one-off-project", band: "high", amountHKD: null }, timing: "within-month", role: "owner" });
    eq("高預算＋一個月內＋老闆 → A", hot.grade, "A");
    check("分數上限 100", hot.score <= 100);
    const cold = A.leadScore({ goal: "growth", problem: "seo-visibility", budget: { mode: "monthly-service", band: "none", amountHKD: null }, timing: "exploring", role: "other" });
    eq("零預算＋了解中＋其他 → C", cold.grade, "C");
    const mid = A.leadScore({ goal: "ops", problem: "ops-manual", budget: { mode: "one-off-project", band: "undecided", amountHKD: null }, timing: "1-3-months", role: "manager" });
    eq("預算未定＋三個月內＋主管 → B", mid.grade, "B");
    const roleOnly = A.applyAnswer({ goal: "growth" }, "role", "owner");
    eq("角色答案保留", roleOnly.role, "owner");
    eq("自助分支清除角色", A.applyAnswer({ ...roleOnly, goal: "selfhelp" }, "goal", "selfhelp").role, undefined);
  }

  // ── 總結 ────────────────────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(64));
  console.log(`通過 ${passed} 項，失敗 ${failed} 項。`);
  if (failed > 0) {
    console.log("失敗項目：\n - " + failures.join("\n - "));
    process.exit(1);
  }
  console.log("✅ 全部通過。");
}

main();

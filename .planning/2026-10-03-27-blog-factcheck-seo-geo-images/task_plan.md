# Task Plan: ADWire 全27篇SEO文章事實查核、深化、keywords、配圖及SEO/GEO

## Active Scope and Approval
用戶要求全部27篇，並已批准修改完成後直接upload。保留現有URL、網站風格與全部原有有用內容；不改CRM、價格與品牌客戶白名單。先備份，再DB精準UPDATE、rebuild、deploy；部署後逐篇讀回驗證。

## Active Roadmap
1. 已抓取live27篇；repo clean，HEAD=origin/main；確認DB同slug覆蓋repo。
2. 匯出原始HTML/meta、讀現有keywords資料、逐篇claim/source/日期查核。
3. 逐篇改寫深化；同步摘要/表格/FAQ，補決策流程、成本限制、相關內鏈。
4. 每篇新增切題資訊圖，alt/caption/尺寸/lazy load；核對canonical/OG/BlogPosting/FAQ/TOC/日期。
5. 覆蓋27篇程式核對、build/content gate與獨立review。
6. DB dry-run與備份apply、CI deploy，全部27個正式URL核對。

配圖優先原創流程／比較圖，唔製作假客戶截圖；無證據stat刪或標估算，唔捏造search volume、SEO分數或保證AI引用。

## Active Next Step
匯出repo27篇原文與metadata，分組開始核實與內容優化。

---
原始planning模板留存如下，不作本次實際狀態。


Use this file as the durable roadmap for the task. Create it before complex work and keep it current as phases change.

## Goal

State the intended end result in one clear sentence.

[One sentence describing the end state]

## Next Step

Record the single action that should happen next. Update it whenever the active phase or immediate action changes.

[The single next action. Update whenever phase status changes.]

## Current Phase

Name the phase currently being worked on.

Phase 1

## Phases

Break the task into three to seven verifiable phases. Use only `pending`, `in_progress`, or `complete` for each status and update the value when work advances.

### Phase 1: Requirements & Discovery

- [ ] Understand user intent
- [ ] Identify constraints and requirements
- [ ] Document findings in findings.md
- **Status:** in_progress

### Phase 2: Planning & Structure

- [ ] Define technical approach
- [ ] Create project structure if needed
- [ ] Document decisions with rationale
- **Status:** pending

### Phase 3: Implementation

- [ ] Execute the plan step by step
- [ ] Write code to files before executing
- [ ] Test incrementally
- **Status:** pending

### Phase 4: Testing & Verification

- [ ] Verify all requirements met
- [ ] Document test results in progress.md
- [ ] Fix any issues found
- **Status:** pending

### Phase 5: Delivery

- [ ] Review all output files
- [ ] Ensure deliverables are complete
- [ ] Deliver to user
- **Status:** pending

## Key Questions

Record important questions and replace them with answers as they are resolved.

1. [Question to answer]
2. [Question to answer]

## Decisions Made

Record significant choices and the reason for each one.

| Decision | Rationale |
|----------|-----------|
|          |           |

## Errors Encountered

Record each distinct error, the attempt number, and the resolution. Change the approach before retrying a failed action.

| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes

- Update phase status as work progresses: `pending` to `in_progress` to `complete`.
- Re-read the goal and next step before major decisions.
- Log errors promptly so failed approaches are not repeated.

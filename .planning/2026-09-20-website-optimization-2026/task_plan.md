# Task Plan: ADWire Website Optimization 2026

## Goal

Audit and optimize adwire.com.hk for SEO/GEO, service-page conversion, clearer Software/AI positioning, and qualified lead generation while preserving the existing visual identity and all established URLs/services.

## Next Step

Confirm with the owner: (a) which Google account will own the new ADWire GA4 property and how GSC will be connected, (b) the single authoritative count for the 500+/150+/120+/100+ figures and the ROI wording (328% vs 3.8x). Then start Phase 2 layout work on the feature branch.

## Current Phase

Phase 1 — Baseline audit and approved-source capture

## Phases

### Phase 1: Baseline Audit & Approved Sources
- [x] Read master implementation brief
- [x] Inspect repository architecture and deployment workflow
- [x] Capture owner approvals and confirmed contact details
- [x] Extract and review the 15-page SEO/GEO pricing PDF
- [x] Crawl all indexable pages and create URL/metadata/content inventory (45 URLs)
- [x] Produce service-page SEO/CRO scorecard and claims register
- [x] Extract approved SEO/GEO pricing and commercial terms from the PDF
- [ ] Audit GA4/GSC access and establish baseline (blocked: no ADWire property)
- **Status:** in_progress

### Phase 2: SEO/GEO, IA & Conversion Proposal
- [ ] Produce keyword/intent map for every service page and blog cluster
- [ ] Score every service page for pain-point coverage, offer clarity, trust and CTA strength
- [ ] Finalize sitemap/navigation and page-layout specifications
- [ ] Finalize SEO/GEO page scope and pricing from the approved PDF
- **Status:** pending

### Phase 3: Staging Implementation — Layout & Foundations
- [x] Create feature branch and safe staging workflow (branch only; no staging host yet)
- [x] Fix duplicated brand suffix in titles across all pages
- [x] Implement navigation grouping into four service lines (all old URLs kept)
- [x] Implement homepage positioning, service cards and CTA changes
- [x] Implement metadata, schema and sitemap lastModified foundations
- [x] Add lib/site-content.ts as the single source for approved figures and CTAs
- **Status:** complete

### Phase 4: Staging Implementation — Page Content
- [ ] Upgrade thin service pages and pain-point sections
- [ ] Rebuild SEO/GEO page using approved pricing and deliverables
- [ ] Improve blog templates, article structure, authorship, citations and contextual CTAs
- [ ] Update Contact/Project Enquiry flow
- **Status:** pending

### Phase 5: QA, UAT & Production Release
- [ ] Run lint/build and automated SEO/link checks
- [ ] Test 360/390/tablet/desktop, accessibility, forms and tracking
- [ ] Verify GA4/GTM/GSC and staging noindex
- [ ] Obtain UAT approval and separate production-release approval
- [ ] Deploy, verify exact live targets and monitor
- **Status:** pending

### Phase 6: Showcase & Logo Refresh
- [ ] Apply approved showcase/case-study data to completed layouts
- [ ] Update logo relationships/permissions and case evidence
- [ ] Add verified case studies without fabricating missing material
- **Status:** pending

## Key Questions

1. Which Google Analytics account should own the new ADWire GA4 property? Pending live account inspection.
2. Is the current office address a staffed office or correspondence address? Pending owner confirmation.
3. Which client logos/cases are direct ADWire contracts versus partner/subcontract/past-member work? Deferred until layout is approved, per owner instruction.

## Decisions Made

| Decision | Rationale |
|---|---|
| SEO/GEO and organic acquisition are the first business priority | Explicit owner instruction on 2026-09-20 |
| Keep existing visual identity and build layout before updating showcase/logo content | Explicit owner instruction |
| Use the 15-page PDF as the pricing/scope source of truth for SEO/GEO | Explicit owner instruction |
| Keep +852 9586 1027 and info@adwire.com.hk; remove hr@adwire.com.hk | Owner-confirmed contact details |
| Preserve existing service URLs by default | Protect existing SEO equity and avoid unnecessary redirects |
| Treat owner-confirmed metrics as approved facts, but rewrite universal technical guarantees into scoped, defensible wording | Prevent misleading universal promises while preserving the underlying capability claim |
| Use /services/system/ as the initial Software Development hub proposal | Existing route already covers systems/apps and avoids immediate duplicate-page creation |

## Errors Encountered

| Error | Attempt | Resolution |
|---|---:|---|
| Browser live-site batch audit timed out | 1 | Used repository source inspection and direct HTTP checks instead |
| PDF had no text layer | 1 | Rendered all 15 pages to PNG and visually extracted the content |
| pdf_read helper missing pypdf | 1 | Used installed PyMuPDF renderer; no large OCR installation required |
| Background subagent batch stalled | 1 | Continued audit directly without depending on subagents |

## Notes

- Do not push to `main`; current workflow deploys `main` directly to production.
- No production release without a separate explicit approval.
- External/web findings belong in findings.md, not this repeatedly injected plan file.

# Findings & Decisions

## Requirements

- Optimize the full ADWire website with SEO/GEO as the highest priority for acquiring more customers.
- Analyze every service page for conversion sufficiency and whether it clearly addresses buyer pain points.
- Keep the existing design direction and visual identity; improve layout/structure before updating showcases and logos.
- Structural changes to article templates are allowed to improve indexing and rankings.
- Use `C:\Users\user\Downloads\ADWire_SEO_GEO_服務介紹_15頁.pdf` as the latest SEO/GEO pricing and scope source.
- Confirmed contact details: WhatsApp +852 9586 1027; only info@adwire.com.hk is used; hr@adwire.com.hk must be removed.
- User approved creating a new ADWire GA4 property.

## Research Findings

### Repository and deployment

- Next.js 16 / React 19 / TypeScript static-export site.
- Production is deployed to SiteGround through GitHub Actions when `main` changes.
- `rsync --delete` is used, with explicit exclusions for `.well-known`, `crm`, `.htaccess`, and `admin/includes/config.php`.
- Blog, portfolio and brand data use a build-time API-plus-local-fallback merge. Deleting an API item does not necessarily remove the corresponding hardcoded fallback.
- Contact form posts JSON to `/send-mail.php` and redirects successful submissions to `/thank-you/`.
- GTM container: GTM-WLF36PTR. Microsoft Clarity project: ulgozaske6.
- Current Analytics connector exposes only the Peko Beauty GA4 property; no ADWire property is currently visible.
- Current OpenSEO projects do not include adwire.com.hk, so GSC baseline data remains unavailable.

### Current content risks/opportunities

- Homepage metadata and hero positioning remain marketing/MarTech-first.
- Navbar lists ten services at one level rather than grouping the four business lines.
- Approved metrics are repeated across metadata, JSON-LD, nav, stats, contact and service pages; they require one central source of truth.
- AI, Automation and SEO pages use absolute wording that should be converted to scoped contractual/technical wording even though the underlying capabilities are owner-confirmed.
- Contact page still publishes hr@adwire.com.hk and must be corrected.
- Current project enquiry form lacks company, project type, current system, budget and timeline fields.
- Existing Software content is split between `/services/web/` and `/services/system/`.

### SEO/GEO PDF — approved source capture

The 15-page PDF positions SEO + GEO as a combined search-growth service:

- SEO: Google/Bing natural search, rankings, website traffic, keyword exposure and high-intent searches.
- GEO: AI-answer visibility, brand mentions/citations, content credibility and an additional search entry point.
- Growth chain: search visibility → traffic → enquiries → business opportunities.
- Delivery process: website/market audit → content strategy/page optimization → SEO+GEO technical deployment → measurement and continuous adjustment.
- Deliverables include website SEO/GEO audit, keyword opportunity research, page optimization, SEO content planning/writing, AI visibility tracking and monthly performance reports.
- Expected timeline: foundation first; 3–6 months for clearer ranking/traffic movement; 6–12 months for content assets and brand/AI visibility; ongoing optimization thereafter.

Approved packages from page 13:

| Package | Price | Intended client | Included |
|---|---:|---|---|
| Starter | HK$5,800/month | SMEs starting SEO | 15 target keywords; 2 content pieces/month; 2 page optimizations/month; monthly performance report |
| Growth (recommended) | HK$9,800/month | Businesses wanting more exposure and enquiries | 30 target keywords; 4 content pieces/month; 4 page optimizations/month; GEO visibility tracking; monthly strategy review |
| Premium | HK$16,800/month | Competitive markets or broad coverage | 50 target keywords; 6 content pieces/month; 6 page optimizations/month; deeper technical support; broader SEO+GEO coverage |

Commercial terms from page 14:

- Minimum engagement: 3 months.
- Payment: monthly in advance.
- Baseline scope: one website / one market.
- Excludes: ad spend, hosting and third-party tools.
- Separate quote: large websites, multilingual sites and large SKU catalogues.
- Optional add-ons: additional articles, landing pages and technical support.
- Actual scope is confirmed according to site size, content volume and business needs.

### PDF messaging to preserve in web copy

- SEO and GEO complement each other; GEO does not replace SEO.
- Search growth is cumulative and not a one-off advertisement.
- Reporting must connect visibility, clicks/sessions, keyword movement, AI mentions/citations/AI traffic, enquiry conversion and commercial lead direction.
- Main buyer outcome: more suitable customers discover ADWire through Google and AI search.

## Technical Decisions

| Decision | Rationale |
|---|---|
| Create a feature branch before code changes | `main` deploys directly to production |
| Keep current service slugs during the first implementation batch | Protect organic equity and simplify rollback |
| Centralize approved proof metrics and contact details | Prevent inconsistent claims across metadata, schema and visible sections |
| Build reusable service-page sections before filling new case/logo content | Matches owner-requested sequence and improves consistency |
| Add article-level author/update/source/CTA structures | Improve E-E-A-T, crawl context and conversion from informational traffic |
| Build page-level keyword intent mapping before rewriting copy | Prevent service-page and blog cannibalization |

## Issues Encountered

| Issue | Resolution |
|---|---|
| PDF is image-only | Rendered all pages using PyMuPDF and reviewed page images |
| Live browser automation timed out | Used code source, HTTP checks and local page artifacts; visual browser QA remains required later |
| ADWire GA4/GSC unavailable through current connectors | Owner authorized new GA4 property; GSC connection remains a required setup step |

## Resources

- Master brief: `C:\Users\user\Downloads\ADWire_Website_Optimization_Master_Brief_2026-09-19 (1).md`
- Approved SEO/GEO PDF: `C:\Users\user\Downloads\ADWire_SEO_GEO_服務介紹_15頁.pdf`
- Repository: `C:\Users\user\repos\adwire`
- Rendered PDF pages: `C:\Users\user\AppData\Local\hermes\cache\scratch\adwire-seo-geo-pdf\`

## Visual/Browser Findings

- PDF uses the same blue/gold ADWire visual language and frames the offer as a progression from visibility to real business growth.
- Growth package is visually marked as the recommended plan.
- Pricing pages clearly state 3-month minimum and monthly prepayment.
- PDF contains generated illustrative dashboards/search interfaces; when reused on the website they should be labelled as process/measurement illustrations rather than client-platform screenshots.

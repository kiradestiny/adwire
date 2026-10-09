# -*- coding: utf-8 -*-
import re, os, shutil, sys

ROOT = r"C:/Users/user/repos/adwire"
OLDS = """xiaohongshu-marketing-hong-kong-guide-2026
kol-marketing-hong-kong-guide-2026
video-production-hong-kong-guide-2026
social-media-management-hong-kong-guide-2026
china-market-strategy-hong-kong-2026
ai-reduce-hong-kong-business-labour-cost-2026
ai-agent-hong-kong-business-guide-2026
hong-kong-ai-chatbot-customer-service-guide-2026
ai-automation-roi-hong-kong-2026
geo-generative-engine-optimization-guide-2026
how-to-choose-seo-company-hong-kong-2026
crm-system-selection-guide-hong-kong-2026
core-web-vitals-website-speed-guide-2026
app-development-cost-guide-hong-kong-2026
hong-kong-government-ai-digital-funding-2026
rpa-hong-kong-guide-2026
hong-kong-web-design-pricing-guide-2026
ai-solution-hong-kong-enterprise-guide-2026
hong-kong-brand-china-market-guide-2026
google-meta-ads-guide-2026
hong-kong-seo-geo-guide-2026
seo-vs-geo-2025""".split()
NEW = {o: re.sub(r'-20\d\d$', '', o) for o in OLDS}
assert len(set(NEW.values())) == len(NEW), "collision in new slugs"

def fix_links(text):
    for o in OLDS:
        n = NEW[o]
        text = text.replace('slug: "%s"' % o, 'slug: "%s"' % n)
        # /blog/<old> NOT followed by . \w or -  → protects /blog/<old>.webp
        text = re.sub(r'/blog/%s(?![.\w-])' % re.escape(o), '/blog/%s' % n, text)
    return text

# 1) lib/blogData.ts
p = os.path.join(ROOT, "lib/blogData.ts")
s = fix_links(open(p, encoding="utf-8").read())
open(p, "w", encoding="utf-8").write(s)
print("blogData.ts migrated")

# 2) service content files
for f in ["app/services/ServicesContent.tsx","app/services/ai/AiServiceContent.tsx",
          "app/services/automation/AutomationServiceContent.tsx","app/services/china-market/ChinaMarketContent.tsx"]:
    fp = os.path.join(ROOT, f)
    _t = open(fp, encoding="utf-8").read()          # READ FIRST
    open(fp, "w", encoding="utf-8").write(fix_links(_t))
print("service files migrated")

# 3) public/llms-full.txt (uses blog/<slug> with no leading slash)
lp = os.path.join(ROOT, "public/llms-full.txt")
t = open(lp, encoding="utf-8").read()
for o in OLDS:
    t = re.sub(r'blog/%s(?![.\w-])' % re.escape(o), 'blog/%s' % NEW[o], t)
open(lp, "w", encoding="utf-8").write(t)
print("llms-full.txt migrated")

# 4) .htaccess 301
hp = os.path.join(ROOT, "public/.htaccess")
h = open(hp, encoding="utf-8").read()
anchor = "RewriteRule ^short-video-marketing/?$"
idx = h.find(anchor)
assert idx > 0
line_end = h.index("\n", idx) + 1
block = ["    # ── 2026-10：blog slug 去除年份（evergreen URL）301 ──\n"]
for o in OLDS:
    block.append("    RewriteRule ^blog/%s/?$ /blog/%s/ [R=301,L,NE]\n" % (o, NEW[o]))
h = h[:line_end] + "".join(block) + h[line_end:]
open(hp, "w", encoding="utf-8").write(h)
print(".htaccess: added", len(OLDS), "301 rules")
print("\nmap sample:", list(NEW.items())[:3])

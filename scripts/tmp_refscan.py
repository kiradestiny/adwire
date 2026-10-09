# -*- coding: utf-8 -*-
import os, re, json
ROOT = r"C:/Users/user/repos/adwire"
SKIP = {"node_modules",".git","out",".next","preview-build","deliverables"}
olds = """xiaohongshu-marketing-hong-kong-guide-2026
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

hits={}
for dp,dns,fns in os.walk(ROOT):
    parts=set(os.path.relpath(dp,ROOT).split(os.sep))
    if parts & SKIP: 
        dns[:]=[]; continue
    for fn in fns:
        if not re.search(r'\.(ts|tsx|js|jsx|mjs|cjs|json|htaccess|md|txt)$', fn) and fn!=".htaccess": continue
        p=os.path.join(dp,fn)
        try: t=open(p,encoding="utf-8").read()
        except: continue
        for s in olds:
            c=t.count(s)
            if c: hits.setdefault(os.path.relpath(p,ROOT),{})[s]=c
for f,d in sorted(hits.items()):
    print(f)
    for s,c in sorted(d.items()): print(f"   {c:3}  {s}")

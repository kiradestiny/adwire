# -*- coding: utf-8 -*-
import sys, re, json
sys.path.insert(0, r"C:/Users/user/repos/adwire/scripts")
import pilot
s = pilot.load()
SEP = ["rpa-hong-kong-guide","hong-kong-government-ai-digital-funding",
 "ai-reduce-hong-kong-business-labour-cost","hong-kong-ai-chatbot-customer-service-guide",
 "ai-automation-roi-hong-kong","how-to-choose-seo-company-hong-kong","crm-system-selection-guide-hong-kong",
 "core-web-vitals-website-speed-guide","xiaohongshu-marketing-hong-kong-guide","kol-marketing-hong-kong-guide",
 "video-production-hong-kong-guide","social-media-management-hong-kong-guide","china-market-strategy-hong-kong"]
plan={}; total=0
for slug in SEP:
    a,b = pilot.find_content_span(s, slug); c = pilot.unesc(s[a:b])
    cjk = len(re.findall(r'[\u4e00-\u9fff]', c))
    blocks, ins = pilot.plan_insertions(c, gap=360)
    plan[slug] = [dict(after=x["after"], ctx=x["ctx"], section=x["section"]) for x in ins]
    total += len(ins)
    print(f"{slug}: {cjk} CJK, existing figs {c.count(chr(60)+'figure')}, NEW {len(ins)}, target~{round(cjk/360)}")
json.dump(plan, open(r"C:/Users/user/repos/adwire/deliverables/seo/sept_plan.json","w",encoding="utf-8"), ensure_ascii=False, indent=1)
print("TOTAL NEW:", total)

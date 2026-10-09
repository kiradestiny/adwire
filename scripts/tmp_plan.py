import re, os, json, sys

BASE = r"C:/Users/user/repos/adwire/deliverables/pilot"
FLAG = ["ai-agent-hong-kong-business-guide-2026",
        "geo-generative-engine-optimization-guide-2026",
        "app-development-cost-guide-hong-kong-2026",
        "hong-kong-web-design-pricing-guide-2026"]
GAP = 340  # target CJK chars between images

def cjk(t): return len(re.findall(r'[\u4e00-\u9fff]', t))
def strip(t): return re.sub(r'<[^>]+>', '', t)

def plan(slug):
    c = open(os.path.join(BASE, slug + ".content.html"), encoding="utf-8").read()
    heads = list(re.finditer(r'<(h3|h4)[^>]*>(.*?)</\1>', c, re.S))
    segs = []
    for i, m in enumerate(heads):
        end = heads[i+1].start() if i+1 < len(heads) else len(c)
        body = c[m.end():end]
        segs.append(dict(level=m.group(1), text=strip(m.group(2)).strip(),
                         start=m.start(), chars=cjk(body), head100=strip(body)[:110].strip()))
    # decide insertions: before a heading, if accumulated since last image >= GAP
    plan_ins = []
    acc = 0
    skip_words = ("常見問題", "總結", "FAQ")
    for i, s in enumerate(segs):
        if i == 0:
            acc = s["chars"]; continue
        if any(w in s["text"] for w in skip_words):
            acc = 0 if "總結" in s["text"] else acc
            continue
        acc += s["chars"]
        if acc >= GAP:
            plan_ins.append(dict(idx=i, level=s["level"], heading=s["text"],
                                 following=s["head100"]))
            acc = 0
    return segs, plan_ins

allplan = {}
for slug in FLAG:
    segs, ins = plan(slug)
    allplan[slug] = ins
    print(f"\n##### {slug}: {len(segs)} headings, {len(ins)} NEW images (existing 2 inline +1 hero)")
    for k, x in enumerate(ins):
        print(f"  [{k+1:02d}] <{x['level']}> {x['heading'][:46]}")
        print(f"        → {x['following'][:96]}")
json.dump(allplan, open(os.path.join(BASE, "image_plan.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("\nwrote image_plan.json")
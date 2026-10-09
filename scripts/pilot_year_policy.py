# -*- coding: utf-8 -*-
import sys, re
sys.path.insert(0, r"C:/Users/user/repos/adwire/scripts")
import pilot
SRC = pilot.SRC
s = pilot.load()

NEW = {
 "short-video-marketing-guide": "短視頻營銷香港：抖音、Reels、小紅書實戰攻略",
 "marketing-automation-roi": "流程自動化香港中小企：跨系統工作流程設計實戰",
 "high-converting-landing-page": "Landing Page 優化香港：高轉換率設計與測試實戰指南",
 "stop-wasting-ad-budget": "Facebook、Instagram 廣告優化香港：降低獲客成本實戰",
 "custom-system-efficiency": "度身訂造系統香港：取代 Excel 的範圍、資料模型與權限實戰",
 "ai-solution-hong-kong-enterprise-guide": "香港企業 AI 化完全指南：政策、痛點與低風險導入路線",
 "rpa-hong-kong-guide": "RPA 是什麼？香港企業機械人流程自動化導入指南",
 "ai-automation-roi-hong-kong": "AI 自動化 ROI 怎樣計？香港企業成本效益評估框架",
 "how-to-choose-seo-company-hong-kong": "香港 SEO 公司點揀？Google 官方問題清單與危險信號",
}
pat = re.compile(r'\n  \{\n    id: (\d+),\n    slug: "([^"]+)",')
for slug, newt in NEW.items():
    ms = list(pat.finditer(s))
    m = next(mm for mm in ms if mm.group(2)==slug)
    i = ms.index(m)
    blk = s[m.start(): ms[i+1].start() if i+1 < len(ms) else len(s)]
    tm = re.search(r'\n    title: "((?:[^"\\]|\\.)*)"', blk)
    old_line = tm.group(0)
    assert s.count(old_line)==1, ("not unique", slug)
    s = s.replace(old_line, '\n    title: "%s"' % pilot.esc(newt))
    print("OK", slug, "->", newt)
open(SRC,"w",encoding="utf-8").write(s)
print("done", len(NEW))

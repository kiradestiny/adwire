# -*- coding: utf-8 -*-
import sys, re, json
sys.path.insert(0, r"C:/Users/user/repos/adwire/scripts")
import pilot

plan = json.load(open(r"C:/Users/user/repos/adwire/deliverables/seo/sept_plan.json", encoding="utf-8"))
STYLE = ("Flat vector editorial illustration, deep navy #0f4c81 and warm orange #f5a623 on off-white, "
         "rounded shapes, generous whitespace, soft shadows, clean corporate style, 16:9. "
         "Absolutely no text, no letters, no words, no numbers, no logos.")
ROT = ["isometric composition", "flat icon composition", "a scene with two people and screens",
       "a single large central object with side annotations", "a layered card composition"]

MOTIF = [
 (("資助","補貼","撥款","BUD","申請"), "a funding and grant motif: application forms, approval stamps and a growth arrow"),
 (("影片","視頻","拍攝","製作","剪"), "a video production motif: a camera, a clapperboard and a storyboard"),
 (("小紅書","抖音","微信","百度","內地","中國","種草"), "a China-market platform motif: mobile app cards and a rising trend line"),
 (("KOL","網紅","粉絲","社交","媒體","influencer"), "an influencer and social media motif: creator avatars, follower counts and a post grid"),
 (("客服","chatbot","聊天","對話"), "a customer service motif: chat panels, a support operator and a handover"),
 (("機械人","RPA","自動化","流程","步驟","階段"), "an automation motif: gears, flow arrows and connected process cards"),
 (("成本","價錢","報價","收費","費用","預算"), "a pricing and cost motif: price tags, coins and a budget gauge"),
 (("ROI","效益","成效","回本"), "an ROI motif: a cost-versus-benefit balance and an upward return chart"),
 (("風險","失敗","治理","合規","法規","警告","陷阱"), "a risk and compliance motif: a shield, warning markers and a governance checklist"),
 (("數據","數字","量度","指標","追蹤"), "a data and measurement motif: dashboards, gauges and KPI panels"),
 (("SEO","搜尋","排名","引用","關鍵字","Google"), "a search and SERP motif: a magnifier, ranking cards and a citation panel"),
 (("AI","智能","模型","大型語言"), "an AI motif: neural nodes, an assistant orb and spark"),
 (("網站","網頁","App","應用","著陸","landing"), "a website and app motif: browser and phone screens"),
 (("系統","平台","工具","軟件","CRM","整合","API"), "a systems and integration motif: connected software cards and API links"),
 (("客戶","用戶","體驗","痛點"), "a customer experience motif: personas, journey arrows and feedback cards"),
 (("清單","檢查","核對","驗收"), "a checklist motif: a form being ticked with a magnifier"),
 (("比較","對比","分別","差異","vs","選擇"), "a side-by-side comparison motif: two option cards on a balance"),
 (("物流","送貨","訂單","庫存"), "a logistics motif: parcels, a delivery van and a stock dashboard"),
 (("香港","本地","地區"), "a Hong Kong motif: skyline silhouette with a local business scene"),
]
DEFAULT_MOTIF = "a conceptual business illustration"

MOTIF_LABEL = {
 "a funding and grant motif": "政府資助與申請流程", "a video production motif": "影片製作的流程與交付",
 "a China-market platform motif": "內地平台渠道與趨勢", "an influencer and social media motif": "KOL 與社交媒體營銷",
 "a customer service motif": "客戶服務與對話流程", "an automation motif": "自動化流程的運作方式",
 "a pricing and cost motif": "成本結構與收費考量", "an ROI motif": "成本效益與回本評估",
 "a risk and compliance motif": "風險、治理與合規", "a data and measurement motif": "數據量度與成效追蹤",
 "a search and SERP motif": "搜尋排名與 AI 引用", "an AI motif": "AI 與智能應用",
 "a website and app motif": "網站與應用介面", "a systems and integration motif": "系統整合與連接",
 "a customer experience motif": "客戶體驗與痛點", "a checklist motif": "檢查清單與核對",
 "a side-by-side comparison motif": "選項比較", "a logistics motif": "物流與訂單",
 "a Hong Kong motif": "香港本地市場", "a conceptual business illustration": "重點概念說明",
}

def brief(ctx, i):
    text = ctx
    motif = DEFAULT_MOTIF
    for kws, m in MOTIF:
        if any(k in text for k in kws): motif = m; break
    return motif

def caption(ctx, motif):
    t = re.sub(r'\s+', '', ctx)
    runs = re.findall(r'[\u4e00-\u9fff][\u4e00-\u9fff，。、：；「」（）]{7,}', t)
    base = max(runs, key=len) if runs else t
    base = re.sub(r'^\d+[.、）)]?', '', base)
    base = re.sub(r'^[，。、：；「」（）+]+', '', base)
    if len(re.sub(r'[^\u4e00-\u9fff]', '', base)) < 5:
        return MOTIF_LABEL.get(motif, "重點概念說明")
    for stop in ("。","，","、","：","；"):
        idx = base.find(stop, 12)
        if 12 <= idx <= 30:
            return base[:idx]
    return base[:22]

out = {}
total = 0
for slug, items in plan.items():
    rows = []
    for i, it in enumerate(items):
        mot = brief(it["ctx"], i)
        cap = caption(it["ctx"], mot)
        pr = "%s, %s. %s" % (mot, ROT[i % len(ROT)], STYLE)
        rows.append(dict(n=i+1, after=it["after"], caption=cap, prompt=pr))
    out[slug] = rows; total += len(rows)
json.dump(out, open(r"C:/Users/user/repos/adwire/deliverables/seo/sept_briefs.json","w",encoding="utf-8"), ensure_ascii=False, indent=1)
print("briefs total:", total)
for slug, rows in list(out.items())[:2]:
    print("###", slug)
    for r in rows[:4]: print("   ", r["caption"], "||", r["prompt"][:60])

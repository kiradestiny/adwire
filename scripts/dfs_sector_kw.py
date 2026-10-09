# -*- coding: utf-8 -*-
"""四個客群（學校／政府公營／大企業／Idea）香港搜尋量。"""
import json, urllib.error, urllib.request
from pathlib import Path
WORK = Path(r"C:\Users\user\AppData\Local\hermes\workspace")
OUT = Path(r"C:\Users\user\repos\adwire\deliverables\seo"); OUT.mkdir(parents=True, exist_ok=True)
BASIC = [l.split('=',1)[1].strip() for l in (WORK/'dataforseo_credentials.ini').read_text(encoding='utf-8').splitlines() if l.startswith('basic =')][0]
H = {"Authorization": "Basic "+BASIC, "Content-Type": "application/json"}
def post(url, body):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=H, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=240) as r: return json.load(r)
    except urllib.error.HTTPError as e: return {'http_error': e.code, 'body': e.read().decode('utf-8','replace')[:300]}

KW = {
 "學校": ["學校網站設計","學校網站","學校管理系統","校務系統","學校系統","學生管理系統","點名系統","出勤系統","eclass","內聯網","學校內聯網","電子學習平台","電子學習","學習管理系統","lms","家校溝通 app","圖書館系統","成績管理系統","學費系統","優質教育基金","qef","教育局 資助","學校 it 支援","校園 系統","學校 app","校園電視台","timetable 系統","學生出席系統"],
 "政府公營": ["政府 it 外判","政府招標","政府資訊科技","公營機構 it","政府系統開發","ogcio","標書","政府採購","tender 香港","it 外判","系統整合","系統整合商","系統整合公司"],
 "大企業／轉型": ["數碼轉型","數位轉型","企業數碼轉型","數碼轉型顧問","企業系統整合","erp 整合","企業 ai 導入","ai 導入顧問","it 顧問","系統顧問","企業自動化","業務流程改善","bpr","digital transformation"],
 "Idea／初創": ["mvp 開發","產品開發","prototype 開發","app 開發價錢","寫 app 價錢","開發報價","技術夥伴","技術顧問","cto 外判","軟件開發 香港","app 開發公司","初創 技術支援"],
}
allkw = [k for v in KW.values() for k in v]
r = post('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live',
         [{"keywords": allkw, "location_name": "Hong Kong", "language_name": "Chinese (Traditional)", "search_partners": False}])
t = (r.get('tasks') or [{}])[0]
res = {}
if t.get('status_code') == 20000:
    items = t.get('result') or []
    if items and isinstance(items[0], dict) and 'items' in items[0]: items = items[0]['items']
    for it in items:
        res[it.get('keyword')] = {"volume": it.get('search_volume'), "cpc": it.get('cpc'), "competition": it.get('competition')}
    print("ok", len(items), "cost", t.get('cost'))
else:
    print("FAIL", t.get('status_code'), t.get('status_message'), str(r.get('body'))[:200])
(OUT/'hk_sector_kw.json').write_text(json.dumps({"by_cluster": KW, "volumes": res}, ensure_ascii=False, indent=1), encoding='utf-8')
for name, kws in KW.items():
    print("\n### %s" % name)
    for k in sorted(kws, key=lambda x: -(res.get(x, {}).get('volume') or 0)):
        d = res.get(k, {})
        if (d.get('volume') or 0) >= 20:
            print("  %6s  cpc=%-6s %-7s %s" % (d.get('volume'), d.get('cpc'), d.get('competition'), k))

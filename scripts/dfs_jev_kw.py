# -*- coding: utf-8 -*-
"""Jev / ChatGPT 廣告 / AI 中小企 三大主題關鍵字搜尋量（DataForSEO Google Ads search_volume）。"""
import json, time, urllib.error, urllib.request
from pathlib import Path

WORK = Path(r"C:\Users\user\AppData\Local\hermes\workspace")
OUT = Path(r"C:\Users\user\repos\adwire\deliverables\seo"); OUT.mkdir(parents=True, exist_ok=True)
BASIC = [l.split('=', 1)[1].strip() for l in (WORK / 'dataforseo_credentials.ini').read_text(encoding='utf-8').splitlines() if l.startswith('basic =')][0]
H = {"Authorization": "Basic " + BASIC, "Content-Type": "application/json"}


def post(url, body, tries=4):
    for t in range(tries):
        req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=H, method='POST')
        try:
            with urllib.request.urlopen(req, timeout=240) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            return {'http_error': e.code, 'body': e.read().decode('utf-8', 'replace')[:300]}
        except Exception as e:
            if t == tries - 1:
                return {'err': str(e)}
            time.sleep(8)


CLUSTERS = {
 "A_ChatGPT廣告": [
   "chatgpt 廣告","chatgpt ads","chatgpt advertising","openai 廣告","openai ads",
   "ai 廣告","ai 廣告投放","ai 廣告公司","ai advertising","ai ads",
   "chatgpt 廣告 香港","chatgpt ads hong kong","ai 廣告平台","ai 投放廣告",
   "人工智能 廣告","openai advertising","廣告投放 ai","ai ad platform",
   "chatgpt 落廣告","ai marketing","ai 營銷","ai 搜尋廣告",
 ],
 "B_AI中小企": [
   "中小企 ai","ai 中小企","ai 提升工作效率","microsoft copilot","copilot 香港",
   "microsoft 365 copilot","copilot 教學","ai 工具 香港","ai 應用","企業 ai 應用",
   "ai 自動化","ai 工作效率","香港 ai","ai 轉型","ai 辦公","ai 助理",
   "生成式 ai 應用","ai 導入","ai agent","ai 技術","中小企 數碼轉型",
   "數碼轉型","ai 會議紀錄","ai 客服","工作效率 工具","ai 寫作工具",
 ],
 "C_決策模型": [
   "jev","jev ai","jev model","typesafe ai","system one model","system 1 model",
   "ai 決策","決策模型","ai decision model","decision model",
   "world model","世界模型","jepa","v-jepa","ai agent 決策","決策智能",
   "openai decisions api","decisions api","ai 判斷","模型校準","ai classification model",
 ],
}

rows = []
allkw = [k for v in CLUSTERS.values() for k in v]
for i in range(0, len(allkw), 700):
    batch = allkw[i:i + 700]
    r = post('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live',
             [{"keywords": batch, "location_name": "Hong Kong",
               "language_name": "Chinese (Traditional)", "search_partners": False}])
    t = (r.get('tasks') or [{}])[0]
    if t.get('status_code') == 20000:
        items = t.get('result') or []
        if items and isinstance(items[0], dict) and 'items' in items[0]:
            items = items[0]['items']
        for it in items:
            rows.append(it)
        print("batch ok", len(items), "cost", t.get('cost'))
    else:
        print("FAIL", t.get('status_code'), t.get('status_message'), str(r)[:250])
    time.sleep(2)

res = {}
for it in rows:
    kw = it.get('keyword')
    if not kw:
        continue
    res[kw] = {"volume": it.get('search_volume'), "cpc": it.get('cpc'),
               "competition": it.get('competition'), "ci": it.get('competition_index')}

(OUT / 'jev_kw_volumes.json').write_text(
    json.dumps({"clusters": CLUSTERS, "volumes": res}, ensure_ascii=False, indent=1), encoding='utf-8')

for name, kws in CLUSTERS.items():
    print("\n### %s" % name)
    for k in sorted(kws, key=lambda x: -(res.get(x, {}).get('volume') or 0)):
        d = res.get(k, {})
        v = d.get('volume')
        print("  %7s  cpc=%-6s %-8s %s" % (v if v is not None else '-', d.get('cpc') or '-',
                                            d.get('competition') or '-', k))

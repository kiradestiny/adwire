# -*- coding: utf-8 -*-
"""企業 AI／IT／自動化 cluster 香港搜尋量。"""
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
 "企業 AI 方案": ["企業 AI","企業ai 應用","ai 轉型","人工智能 方案","ai 解決方案","ai 顧問","ai 導入","生成式 ai 企業","企業ai 導入","ai project"],
 "自動化／轉型": ["企業自動化","流程自動化","工作流程自動化","業務自動化","自動化 工具","rpa","rpa 香港","數碼轉型","數碼轉型顧問","企業數碼轉型","數字化轉型","低代碼","low code"],
 "系統／App 開發": ["系統開發","系統開發公司","軟件開發","軟件開發公司","應用程式開發","app 開發","訂造系統","度身訂造系統","企業系統","內部系統","erp","erp 系統","crm 系統","庫存管理系統","會員系統","預約系統"],
 "IT 顧問／外判": ["it 顧問","it 外判","科技顧問","資訊科技 服務","科技公司","軟件公司","it 公司"],
 "政府資助": ["科技券","tvp","bud 專項基金","dtspp","數碼轉型支援先導計劃","中小企資助","政府資助 數碼"],
 "客服／chatbot": ["chatbot 香港","客服系統","ai 客服","智能客服"],
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
        res[it.get('keyword')] = {"volume": it.get('search_volume'), "cpc": it.get('cpc'),
                                  "competition": it.get('competition')}
    print("ok", len(items), "cost", t.get('cost'))
else:
    print("FAIL", t.get('status_code'), t.get('status_message'), str(r.get('body'))[:200])
(OUT/'hk_enterprise_ai_kw.json').write_text(json.dumps({"by_cluster": KW, "volumes": res}, ensure_ascii=False, indent=1), encoding='utf-8')
for name, kws in KW.items():
    print("\n### %s" % name)
    for k in sorted(kws, key=lambda x: -(res.get(x, {}).get('volume') or 0)):
        d = res.get(k, {})
        if (d.get('volume') or 0) >= 10:
            print("  %6s  cpc=%-5s %-7s %s" % (d.get('volume'), d.get('cpc'), d.get('competition'), k))

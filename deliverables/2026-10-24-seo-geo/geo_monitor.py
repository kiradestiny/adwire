# -*- coding: utf-8 -*-
"""
GEO 可見度監測：每月跑一次，量度品牌在 Google 香港 SERP 與 AI Overview 的出現情況。

量度什麼（全部可核實，不是估算）：
  1. AI Overview 有無出現
  2. AI Overview 有無引用 adwire.com.hk
  3. AI Overview 引用了哪些競爭對手網域
  4. 自然搜尋結果 Top 10 有無 adwire.com.hk，排名第幾
  5. 首頁結果的網域分佈（判斷誰在爭這條字）

用法：
  python geo_monitor.py                 # 輸出 report + json 到同目錄
  python geo_monitor.py --out DIR

憑證：預設讀 ~/peko_ads/campA_cpc_dfs_0924.py 的 LOGIN/PASSWORD；
亦可用環境變數 DFS_LOGIN / DFS_PASSWORD 覆寫。
"""
import json, base64, re, os, sys, time, urllib.request, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
BRAND = "adwire.com.hk"
CRED_SRC = os.path.expanduser("~/peko_ads/campA_cpc_dfs_0924.py")

# ── 監測問題清單 ───────────────────────────────────────────────
# 全部來自真實搜尋（autocomplete / 論壇 / AI Overview 分析），不要憑空加。
QUERIES = [
    "網頁設計價錢",
    "網頁設計 香港",
    "網站設計 費用",
    "網站製作 收費",
    "做網站 幾錢",
    "香港 網頁設計公司 推薦",
    "網頁設計公司 邊間好",
    "wordpress 定 自建網站",
    "shopline 同 shopify 分別",
    "開網店 平台 推薦",
    "網店平台 比較",
    "shopify 費用",
    "shopline 收費",
    "系統開發公司 香港",
    "crm 系統 香港",
    "app 開發 費用",
    "網站搬遷 seo 影響",
    "網站保養 費用",
    "廣告代操 費用",
    "診所 系統 推薦",
]


def get_auth():
    login = os.environ.get("DFS_LOGIN")
    pwd = os.environ.get("DFS_PASSWORD")
    if not (login and pwd):
        src = open(CRED_SRC, encoding="utf-8").read()
        login = re.search(r'LOGIN\s*=\s*"([^"]+)"', src).group(1)
        pwd = re.search(r'PASSWORD\s*=\s*"([^"]+)"', src).group(1)
    return "Basic " + base64.b64encode(f"{login}:{pwd}".encode()).decode()


def post(path, payload, auth, timeout=120):
    req = urllib.request.Request(
        "https://api.dataforseo.com/v3/" + path,
        data=json.dumps(payload).encode(),
        headers={"Authorization": auth, "Content-Type": "application/json"},
    )
    return json.load(urllib.request.urlopen(req, timeout=timeout))


def flatten(items):
    """DFS 的 items 有時是 list of dict/list，統一展開。"""
    out = []
    stack = list(items or [])
    while stack:
        x = stack.pop(0)
        if isinstance(x, dict):
            out.append(x)
            for v in x.values():
                if isinstance(v, list):
                    stack.extend(v)
        elif isinstance(x, list):
            stack.extend(x)
    return out


def domains_in(node):
    """由 AI Overview 節點抽出所有引用網域。"""
    txt = json.dumps(node, ensure_ascii=False)
    urls = re.findall(r'https?://([a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,})', txt)
    return sorted({u.lower().replace("www.", "") for u in urls})


def run_query(q, auth):
    r = post("serp/google/organic/live/advanced",
             [{"keyword": q, "location_name": "Hong Kong",
               "language_code": "zh-HK", "depth": 20}], auth)
    task = r["tasks"][0]
    res = (task.get("result") or [{}])[0]
    flat = flatten(res.get("items", []))

    ai_present = False
    ai_cites_brand = False
    ai_domains = []
    for it in flat:
        if it.get("type") == "ai_overview":
            ai_present = True
            ai_domains = domains_in(it)
            ai_cites_brand = any(BRAND in d for d in ai_domains)

    organic, brand_rank = [], None
    for it in flat:
        if it.get("type") != "organic":
            continue
        dom = (it.get("domain") or "").lower().replace("www.", "")
        organic.append({"rank": it.get("rank_absolute") or it.get("rank_group"), "domain": dom})
        if BRAND in dom and brand_rank is None:
            brand_rank = it.get("rank_absolute") or it.get("rank_group")
    organic.sort(key=lambda x: x["rank"] or 999)

    return {
        "query": q,
        "ai_overview": ai_present,
        "ai_cites_adwire": ai_cites_brand,
        "ai_domains": ai_domains[:12],
        "adwire_organic_rank": brand_rank,
        "top_domains": [o["domain"] for o in organic[:10] if o["domain"]],
    }


def main():
    out_dir = HERE
    if "--out" in sys.argv:
        out_dir = sys.argv[sys.argv.index("--out") + 1]
    auth = get_auth()
    stamp = datetime.date.today().isoformat()
    rows = []
    for q in QUERIES:
        try:
            row = run_query(q, auth)
        except Exception as e:
            row = {"query": q, "error": str(e)[:120]}
        rows.append(row)
        print(f"  {q:26s} AI={'Y' if row.get('ai_overview') else '-'} "
              f"cite={'Y' if row.get('ai_cites_adwire') else '-'} "
              f"rank={row.get('adwire_organic_rank') or '-'}")
        time.sleep(0.5)

    json_path = os.path.join(out_dir, f"geo_visibility_{stamp}.json")
    json.dump({"date": stamp, "brand": BRAND, "rows": rows},
              open(json_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    n_ai = sum(1 for r in rows if r.get("ai_overview"))
    n_cite = sum(1 for r in rows if r.get("ai_cites_adwire"))
    n_top = sum(1 for r in rows if r.get("adwire_organic_rank") and r["adwire_organic_rank"] <= 10)

    lines = [f"# GEO 可見度報告 — {stamp}", "",
             f"品牌：{BRAND}｜監測問題：{len(QUERIES)} 條", "",
             "## 摘要", "",
             f"- AI Overview 出現：**{n_ai}/{len(QUERIES)}** 條查詢",
             f"- AI Overview 引用 ADWire：**{n_cite}/{len(QUERIES)}**",
             f"- 自然搜尋 Top 10 有 ADWire：**{n_top}/{len(QUERIES)}**", "",
             "## 逐條結果", "",
             "| 查詢 | AI Overview | AI 引用我們 | 我們排名 | AI 引用的主要網域 |",
             "|---|---|---|---|---|"]
    for r in rows:
        doms = ", ".join(r.get("ai_domains", [])[:4]) or "—"
        lines.append(f"| {r['query']} | {'有' if r.get('ai_overview') else '無'} | "
                     f"{'有' if r.get('ai_cites_adwire') else '無'} | "
                     f"{r.get('adwire_organic_rank') or '—'} | {doms} |")
    md_path = os.path.join(out_dir, f"geo_visibility_{stamp}.md")
    open(md_path, "w", encoding="utf-8").write("\n".join(lines) + "\n")

    print(f"\n報告：{md_path}\n原始數據：{json_path}")
    print(f"AI Overview {n_ai}/{len(QUERIES)}｜引用我們 {n_cite}｜Top10 {n_top}")


if __name__ == "__main__":
    main()

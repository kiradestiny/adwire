import re, sys, subprocess, urllib.request, urllib.error, gzip, io, json, os

ROOT = r"C:/Users/user/repos/adwire/out"
PAGES = ["", "about/", "services/", "services/ads/", "services/seo/", "portfolio/",
         "blog/", "contact/", "thank-you/", "privacy/", "terms/", "disclaimer/"]

def fetch(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept-Encoding": "gzip"})
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            raw = r.read()
            if r.headers.get("Content-Encoding") == "gzip":
                raw = gzip.decompress(raw)
            return raw.decode("utf-8", "replace")
    except Exception as e:
        return None

def visible_text(html):
    html = re.sub(r"(?is)<script.*?</script>", " ", html)
    html = re.sub(r"(?is)<style.*?</style>", " ", html)
    html = re.sub(r"(?is)<!--.*?-->", " ", html)
    html = re.sub(r"(?is)<[^>]+>", "\n", html)
    html = html.replace("&nbsp;", " ").replace("&amp;", "&").replace("&#x27;", "'").replace("&quot;", '"')
    # Chinese runs of >=4 chars, and latin words of >=4 chars
    toks = re.findall(r"[\u4e00-\u9fff]{4,}", html)
    toks += [w.lower() for w in re.findall(r"[A-Za-z]{5,}", html)]
    return set(toks)

print(f"{'路徑':<20} {'本機詞':>7} {'官網詞':>7} {'官網有本機有':>13} {'重疊率':>8}")
print("-" * 66)
summary = []
for p in PAGES:
    loc = os.path.join(ROOT, p, "index.html")
    if not os.path.exists(loc):
        print(f"/{p:<19}  （本機無此頁）")
        continue
    lt = visible_text(open(loc, encoding="utf-8", errors="replace").read())
    live_html = fetch(f"https://adwire.com.hk/{p}")
    if live_html is None:
        print(f"/{p:<19}  （官網抓取失敗）")
        continue
    wt = visible_text(live_html)
    inter = len(lt & wt)
    rate = inter / max(1, len(wt))
    summary.append(rate)
    flag = "✅" if rate >= 0.9 else ("⚠️" if rate >= 0.6 else "❌")
    print(f"/{p:<19} {len(lt):>7} {len(wt):>7} {inter:>13} {rate*100:>7.1f}% {flag}")

if summary:
    print("-" * 66)
    print(f"平均重疊率: {sum(summary)/len(summary)*100:.1f}%")

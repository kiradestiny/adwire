# -*- coding: utf-8 -*-
"""全站文章內容體檢 — 口語字、簡體字、標點、標題層級、標籤平衡、字數。"""
import re, sys, json
sys.path.insert(0, "scripts")
import pilot

raw = open("lib/blogData.ts", encoding="utf-8").read()
# ⚠️ 必須在「未 unescape」的原文上抽取：content 值內含 \" 與 \n，
# unescape 後會出現真引號／真換行，令正則在字串中途斷開。
parts = re.split(r'slug:\s*"', raw)[1:]

COLLOQ = list("嘅唔係冇咁啲喺乜咩嘢畀攞睇揀嘢") + ["點揀", "點樣", "邊種", "邊個", "幾時", "係咪"]
SIMP = "为个发应后关务门会现时际织术据风较设还张进这样对开报级们无实专业员题间单东车见长点亲观听边卫乐读陈书买卖费价铁银钱钟"

rows = []
for seg in parts:
    slug = seg[: seg.find('"')]
    m = re.search(r'content:\s*"((?:[^"\\]|\\.)*)"', seg, re.S)
    if not m:
        continue
    c = pilot.unesc('"' + m.group(1) + '"')[1:-1]
    txt = re.sub(r"<[^>]+>", "", c)
    txt_ns = re.sub(r"\s+", "", txt)
    # 只計正文（排除「」引號內的示範口語）
    outside = re.sub(r"「[^」]*」", "", txt_ns)

    row = {
        "slug": slug,
        "cjk": len(re.findall(r"[\u4e00-\u9fff]", txt_ns)),
        "colloquial": {w: outside.count(w) for w in COLLOQ if outside.count(w)},
        "simplified": [ch for ch in set(SIMP) if ch in txt_ns],
        "h2": len(re.findall(r"<h2[ >]", c)),
        "h3": len(re.findall(r"<h3[ >]", c)),
        "h4": len(re.findall(r"<h4[ >]", c)),
        "img": len(re.findall(r"<img[^>]+src=", c)),
        "table": len(re.findall(r"<table", c)),
        "ul": len(re.findall(r"<ul", c)),
        "faq": len(re.findall(r'itemprop="name"', c)),
        "dbl_punct": len(re.findall(r"[，。；：]{2}", txt_ns)),
        "halfwidth_after_cjk": len(re.findall(r"[\u4e00-\u9fff][,;:!?]", txt_ns)),
        "tag_balance": (
            c.count("<p") - c.count("</p>"),
            c.count("<ul") - c.count("</ul>"),
            c.count("<li") - c.count("</li>"),
            c.count("<table") - c.count("</table>"),
            c.count("<strong>") - c.count("</strong>"),
        ),
    }
    rows.append(row)

json.dump(rows, open("deliverables/seo/corpus_audit.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

print(f"{'slug':46s} {'CJK':>6s} {'H2':>3s} {'H3':>3s} {'圖':>3s} {'表':>3s} {'FAQ':>4s}  口語")
print("-" * 104)
issues = []
for r in rows:
    col = "".join(f"{k}×{v} " for k, v in r["colloquial"].items())
    flags = []
    if r["colloquial"]:
        flags.append("口語")
    if r["simplified"]:
        flags.append("簡體:" + "".join(r["simplified"]))
    if r["h2"] == 0:
        flags.append("無H2")
    if any(x != 0 for x in r["tag_balance"]):
        flags.append(f"標籤不平衡{r['tag_balance']}")
    if r["dbl_punct"]:
        flags.append("重複標點")
    if r["halfwidth_after_cjk"]:
        flags.append("半角標點")
    if r["cjk"] < 1500:
        flags.append(f"偏短({r['cjk']})")
    if flags:
        issues.append((r["slug"], flags))
    print(f"{r['slug'][:44]:46s} {r['cjk']:>6d} {r['h2']:>3d} {r['h3']:>3d} {r['img']:>3d} {r['table']:>3d} {r['faq']:>4d}  {col}")

print()
print(f"=== 有問題文章：{len(issues)} / {len(rows)} ===")
for s, f in issues:
    print(f"  • {s}\n      {' | '.join(f)}")

# -*- coding: utf-8 -*-
"""列出每篇文章所有口語字嘅出現位置連上下文，供逐項判斷真偽。"""
import re, sys
sys.path.insert(0, "scripts")
import pilot

raw = open("lib/blogData.ts", encoding="utf-8").read()
parts = re.split(r'slug:\s*"', raw)[1:]

TOKENS = ["嘅", "唔", "係", "冇", "咁", "啲", "喺", "乜", "咩", "嘢", "畀", "攞", "睇", "揀",
          "點揀", "點樣", "邊種", "邊個", "幾時", "係咪", "幾多", "唔係"]

out = []
for seg in parts:
    slug = seg[: seg.find('"')]
    m = re.search(r'content:\s*"((?:[^"\\]|\\.)*)"', seg, re.S)
    if not m:
        continue
    c = pilot.unesc('"' + m.group(1) + '"')[1:-1]
    # 移除標籤但保留位置感
    txt = re.sub(r"<[^>]+>", "｜", c)
    txt = re.sub(r"「[^」]*」", lambda x: "◇" * len(x.group(0)), txt)  # 遮蔽引號內容
    hits = []
    for t in TOKENS:
        for mm in re.finditer(re.escape(t), txt):
            i = mm.start()
            ctx = txt[max(0, i - 26): i + len(t) + 22].replace("\n", " ").replace("\r", " ")
            ctx = re.sub(r"[｜]{2,}", "｜", ctx)
            hits.append((i, t, ctx))
    if hits:
        hits.sort()
        out.append(f"\n=== {slug} ({len(hits)} 處) ===")
        for i, t, ctx in hits:
            out.append(f"  [{t}] …{ctx}…")

open("deliverables/seo/colloquial_contexts.txt", "w", encoding="utf-8").write("\n".join(out))
print(f"寫入 {len(out)} 行")
print("\n".join(out[:70]))

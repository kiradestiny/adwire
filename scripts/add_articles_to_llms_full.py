# -*- coding: utf-8 -*-
"""把 3 篇新文章加入 public/llms-full.txt 第 5 節（AI 知識庫文章清單）。

llms-full.txt 係人手維護檔，build 唔會自動補 —— 新文章出街後要手動加，
否則 ChatGPT / Perplexity 等索引唔到（違背 GEO 目的）。
"""
import json, re

FP = "public/llms-full.txt"
SLUGS = [
    "digital-education-tools-hong-kong-schools",
    "steam-classroom-setup-hong-kong",
    "school-ai-project-hong-kong",
]

s = open(FP, encoding="utf-8", newline="").read()

# 找第 5 節最後一個編號
nums = [int(m.group(1)) for m in re.finditer(r"### 5\.(\d+) ", s)]
last = max(nums) if nums else 0
print("現有 5.x 條目:", len(nums), "｜最後編號:", last)

# 檢查是否已存在（idempotent）
todo = [x for x in SLUGS if x not in s]
if not todo:
    print("3 篇都已在檔內，無需改動")
    raise SystemExit(0)
print("要加入:", len(todo), "篇")

blocks = []
n = last
for slug in todo:
    n += 1
    meta = json.load(open(f"deliverables/seo/{slug}.meta.json", encoding="utf-8"))
    tags = ", ".join(meta["tags"])
    blocks.append(
        f"### 5.{n} {meta['title']}\r\n"
        f"- **標題：** {meta['title']}\r\n"
        f"- **摘要：** {meta['excerpt']}\r\n"
        f"- **標籤：** {tags}\r\n"
        f"- **連結：** https://adwire.com.hk/blog/{slug}\r\n"
    )
insert = "\r\n".join(blocks) + "\r\n"

# 插在第 6 節之前
anchor = "## 6. 網站地圖與重要頁面"
i = s.find(anchor)
assert i > 0, "找不到第 6 節錨點"
s = s[:i] + insert + "\r\n" + s[i:]

open(FP, "w", encoding="utf-8", newline="").write(s)
print("✓ 已寫入", len(blocks), "篇")

# 覆核
chk = open(FP, encoding="utf-8", newline="").read()
for slug in SLUGS:
    print("  ", slug, "→", "IN" if slug in chk else "STILL MISSING")
print("  5.x 條目總數:", len(re.findall(r"### 5\.\d+ ", chk)))

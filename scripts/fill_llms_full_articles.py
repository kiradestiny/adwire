# -*- coding: utf-8 -*-
"""補齊 public/llms-full.txt 第 5 節 —— 列出全部 deliverables/seo/*.meta.json 而檔內未有的文章。

背景：llms-full.txt 係人手維護，新文章出街後唔會自動加入，導致 AI 索引漏咗一批文章。
"""
import glob, json, os, re

FP = "public/llms-full.txt"
s = open(FP, encoding="utf-8", newline="").read()

entries = []
for fp in glob.glob("deliverables/seo/*.meta.json"):
    try:
        m = json.load(open(fp, encoding="utf-8"))
    except Exception:
        continue
    if not all(k in m for k in ("id", "slug", "title", "excerpt", "tags")):
        continue
    entries.append(m)

# 只做未在檔內的
todo = [m for m in sorted(entries, key=lambda x: x["id"]) if m["slug"] not in s]
print("meta 檔數:", len(entries), "｜已在 llms-full.txt:", len(entries) - len(todo), "｜要補:", len(todo))
if not todo:
    print("無需改動")
    raise SystemExit(0)

nums = [int(m.group(1)) for m in re.finditer(r"### 5\.(\d+) ", s)]
n = max(nums) if nums else 0

blocks = []
for m in todo:
    n += 1
    blocks.append(
        f"### 5.{n} {m['title']}\r\n"
        f"- **標題：** {m['title']}\r\n"
        f"- **摘要：** {m['excerpt']}\r\n"
        f"- **標籤：** {', '.join(m['tags'])}\r\n"
        f"- **連結：** https://adwire.com.hk/blog/{m['slug']}\r\n"
    )
    print("  +", m["slug"])

insert = "\r\n".join(blocks) + "\r\n"
anchor = "## 6. 網站地圖與重要頁面"
i = s.find(anchor)
assert i > 0, "找不到第 6 節錨點"
open(FP, "w", encoding="utf-8", newline="").write(s[:i] + insert + "\r\n" + s[i:])

chk = open(FP, encoding="utf-8", newline="").read()
print("\n完成：5.x 條目數 =", len(re.findall(r"### 5\.\d+ ", chk)))
miss = [m["slug"] for m in entries if m["slug"] not in chk]
print("仍缺:", miss if miss else "無 ✓")

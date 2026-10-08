# -*- coding: utf-8 -*-
"""標題／描述改寫：ai-agent（加 AI Agency 意圖）、xiaohongshu（加 marketing）。"""
import sys
sys.path.insert(0, r"C:/Users/user/repos/adwire/scripts")
import pilot

FP = r"C:/Users/user/repos/adwire/lib/blogData.ts"
raw = open(FP, encoding="utf-8").read()

REPL = [
    # 提案 2：AI Agent — 對上 agency 商業意圖
    ("title: \"AI Agent 是什麼？香港企業應用完整指南\"",
     "title: \"AI Agent 是什麼？香港企業應用與 AI Agency 選擇指南\""),
    ("excerpt: \"AI Agent 與聊天機械人、自動化流程有何分別？本文拆解 Agent 的運作架構、四種常見企業應用場景、導入成本與風險，並說明為何多數企業第一步不應該直接做 Agent。\"",
     "excerpt: \"AI Agent 與聊天機械人、自動化流程有何分別？本文拆解運作架構、四種企業應用場景、導入成本與風險，並說明香港企業選擇 AI Agency 時應該問什麼、為何多數公司第一步不該直接做 Agent。\""),
    # 提案 3：小紅書 — 補英文 marketing
    ("title: \"小紅書推廣攻略：香港品牌實戰指南 2026\"",
     "title: \"小紅書 Marketing 攻略：香港品牌實戰指南 2026\""),
]

ok = 0
for old, new in REPL:
    eo, en = pilot.esc(old), pilot.esc(new)
    c = raw.count(eo)
    if c != 1:
        print("!! 命中 %d 次（預期 1）: %s" % (c, old[:40])); continue
    raw = raw.replace(eo, en); ok += 1
print("套用:", ok, "/", len(REPL))
if ok == len(REPL):
    open(FP, "w", encoding="utf-8", newline="").write(raw)
    print("written ok")
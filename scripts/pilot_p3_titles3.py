# -*- coding: utf-8 -*-
"""標題／描述改寫 v3。"""
import sys
sys.path.insert(0, r"C:/Users/user/repos/adwire/scripts")
import pilot

FP = r"C:/Users/user/repos/adwire/lib/blogData.ts"
raw = open(FP, encoding="utf-8").read()

PAIRS = [
 ('title: "%s"', "AI Agent 是什麼？香港企業應用完整指南",
                 "AI Agent 是什麼？香港企業應用與 AI Agency 選擇指南"),
 ('"%s"', "AI Agent 與聊天機械人、自動化流程有何分別？本文拆解 Agent 的運作架構、四種常見企業應用場景、導入成本與風險，並說明為何多數企業第一步不應該直接做 Agent。",
          "AI Agent 與聊天機械人、自動化流程有何分別？本文拆解運作架構、四種企業應用場景、導入成本與風險，並說明香港企業選擇 AI Agency 時應該問什麼、為何多數公司第一步不該直接做 Agent。"),
 ('title: "%s"', "小紅書推廣攻略：香港品牌實戰指南 2026",
                 "小紅書 Marketing 攻略：香港品牌實戰指南 2026"),
]

ok = 0
for tpl, old, new in PAIRS:
    eo = tpl % pilot.esc(old)
    en = tpl % pilot.esc(new)
    c = raw.count(eo)
    if c != 1:
        print("!! 命中 %d 次（預期 1）: %s" % (c, old[:36])); continue
    raw = raw.replace(eo, en); ok += 1
print("套用:", ok, "/", len(PAIRS))
if ok == len(PAIRS):
    open(FP, "w", encoding="utf-8", newline="").write(raw)
    print("written ok")
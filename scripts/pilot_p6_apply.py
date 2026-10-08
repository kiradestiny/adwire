# -*- coding: utf-8 -*-
"""P6：補內容缺口 — 於現有文章 FAQ 加 microdata 問答（自動產生 FAQPage schema）。"""
import sys
sys.path.insert(0, r"C:/Users/user/repos/adwire/scripts")
import pilot

FP = r"C:/Users/user/repos/adwire/lib/blogData.ts"
raw = open(FP, encoding="utf-8").read()

SEO_CARD = ('<div class="border border-gray-200 rounded-xl p-5" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">\n'
            '          <h4 class="font-bold text-[#0f4c81] mb-2" itemprop="name">SEO 是什麼？與 GEO 有什麼關係？</h4>\n'
            '          <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">\n'
            '            <p class="text-gray-600 text-sm leading-relaxed" itemprop="text">SEO（搜尋引擎優化）是透過改善網站的技術結構、內容與外部訊號，令它在搜尋結果中更容易被找到並取得相關流量的做法。它不是單一技巧，而是技術、內容與連結三方面的持續工作。GEO（生成式引擎優化）處理另一層：品牌在 AI 生成答案（例如搜尋的 AI 摘要與聊天式搜尋）中是否被引用、以及被引用的方式是否正確。兩者共用同一套品質與索引基礎，因此實務上應一併規劃，而不是先做一個再補另一個。</p>\n'
            '          </div>\n'
            '        </div>')

AI_CARD = ('<div class="border border-gray-200 rounded-xl p-5" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">\n'
           '          <p class="font-bold text-[#0f4c81] mb-2 text-sm" itemprop="name">AI 應用是什麼？香港企業普遍用在哪些地方？</p>\n'
           '          <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">\n'
           '            <p class="text-gray-600 text-sm leading-relaxed" itemprop="text">AI 應用指把人工智能技術用於實際業務流程，而不是停留在示範或試用。香港企業常見的落地場景包括客服與查詢回覆、文件與資料的抽取和分類、行銷內容生成，以及跨系統的工作流程自動化。判斷一項工序是否值得做，標準是它每年耗用的人力時間與出錯代價，而不是是否「用了 AI」；先做工序盤點再選工具，比先買工具再想用途更有效。</p>\n'
           '          </div>\n'
           '        </div>')

PAIRS = [
    # SEO 定義（目標字：SEO 是什麼）
    ('<h3 class="text-2xl font-bold text-[#0f4c81] mt-10 mb-4">十、常見問題</h3>\n\n        <div class="border border-gray-200 rounded-xl p-5" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">\n          <h4 class="font-bold text-[#0f4c81] mb-2" itemprop="name">SEO 與 GEO 是否一定要同時做？可不可以只做其中一個？</h4>',
     '<h3 class="text-2xl font-bold text-[#0f4c81] mt-10 mb-4">十、常見問題</h3>\n\n        ' + SEO_CARD + '\n\n        <div class="border border-gray-200 rounded-xl p-5" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">\n          <h4 class="font-bold text-[#0f4c81] mb-2" itemprop="name">SEO 與 GEO 是否一定要同時做？可不可以只做其中一個？</h4>'),
    # AI 應用定義（目標字：AI 應用）
    ('<h3 class="text-2xl font-bold text-[#0f4c81] mt-10 mb-4">六、常見問題 FAQ</h3>\n\n        <div class="border border-gray-200 rounded-xl p-5" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">\n          <p class="font-bold text-[#0f4c81] mb-2 text-sm" itemprop="name">香港政府「全民 AI」計劃對中小企有什麼具體支援？</p>',
     '<h3 class="text-2xl font-bold text-[#0f4c81] mt-10 mb-4">六、常見問題 FAQ</h3>\n\n        ' + AI_CARD + '\n\n        <div class="border border-gray-200 rounded-xl p-5" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">\n          <p class="font-bold text-[#0f4c81] mb-2 text-sm" itemprop="name">香港政府「全民 AI」計劃對中小企有什麼具體支援？</p>'),
]

ok = 0
for old, new in PAIRS:
    eo, en = pilot.esc(old), pilot.esc(new)
    c = raw.count(eo)
    if c != 1:
        print("!! 命中 %d 次（預期 1）: %s..." % (c, old[:50]))
        continue
    raw = raw.replace(eo, en)
    ok += 1
print("套用:", ok, "/", len(PAIRS))
if ok == len(PAIRS):
    open(FP, "w", encoding="utf-8", newline="").write(raw)
    print("written ok")

# -*- coding: utf-8 -*-
"""生成「學校項目報價清單」PDF（ADWire 品牌色，A4）。
輸出：public/downloads/school-project-quotation-checklist.pdf
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate, Paragraph,
                                Spacer, Table, TableStyle, KeepTogether)

NAVY = colors.HexColor("#0f4c81")
ORANGE = colors.HexColor("#f5a623")
GREY = colors.HexColor("#4b5563")
LIGHT = colors.HexColor("#f3f5f8")

FONT = "C:/Windows/Fonts/msjh.ttc"
FONTB = "C:/Windows/Fonts/msjhbd.ttc"
pdfmetrics.registerFont(TTFont("JH", FONT, subfontIndex=0))
pdfmetrics.registerFont(TTFont("JHB", FONTB, subfontIndex=0))

T = ParagraphStyle("T", fontName="JHB", fontSize=19, leading=26, textColor=NAVY, spaceAfter=2)
SUB = ParagraphStyle("SUB", fontName="JH", fontSize=10.5, leading=16, textColor=GREY)
H = ParagraphStyle("H", fontName="JHB", fontSize=12.5, leading=18, textColor=NAVY,
                   spaceBefore=11, spaceAfter=5)
P = ParagraphStyle("P", fontName="JH", fontSize=10, leading=15.5, textColor=colors.HexColor("#374151"))
LI = ParagraphStyle("LI", parent=P, leftIndent=13, bulletIndent=2, spaceAfter=3.2)
NOTE = ParagraphStyle("NOTE", fontName="JH", fontSize=8.5, leading=13, textColor=colors.HexColor("#6b7280"))

def box(title, rows):
    """橙邊提示框。"""
    data = [[Paragraph(f"<b>{title}</b>", ParagraphStyle("bt", fontName="JHB", fontSize=10, textColor=NAVY))]]
    inner = [[Paragraph(t, NOTE)] for t in rows]
    t = Table([[data[0][0]], *inner], colWidths=[168 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
        ("LINEBEFORE", (0, 0), (0, -1), 2.6, ORANGE),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (0, 0), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return t

def checklist(headers, rows, widths):
    data = [[Paragraph(f"<b>{h}</b>", ParagraphStyle("th", fontName="JHB", fontSize=9.5,
                                                     textColor=colors.white)) for h in headers]]
    for r in rows:
        data.append([Paragraph("☐  " + c, P) if i == 0 else Paragraph(c, P)
                     for i, c in enumerate(r)])
    t = Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#e2e8f0")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return t

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#e5e7eb"))
    canvas.setLineWidth(0.6)
    canvas.line(21 * mm, 16 * mm, A4[0] - 21 * mm, 16 * mm)
    canvas.setFont("JH", 7.6)
    canvas.setFillColor(colors.HexColor("#9ca3af"))
    canvas.drawString(21 * mm, 11 * mm,
                      "ADWire Agency Limited ｜ adwire.com.hk ｜ WhatsApp +852 9586 1027 ｜ info@adwire.com.hk")
    canvas.drawRightString(A4[0] - 21 * mm, 11 * mm, "第 %d 頁" % doc.page)
    canvas.restoreState()

out = "public/downloads/school-project-quotation-checklist.pdf"
os.makedirs(os.path.dirname(out), exist_ok=True)

doc = BaseDocTemplate(out, pagesize=A4, leftMargin=21 * mm, rightMargin=21 * mm,
                      topMargin=18 * mm, bottomMargin=20 * mm,
                      title="學校項目報價清單", author="ADWire Agency")
doc.addPageTemplates([PageTemplate(id="p", frames=[Frame(doc.leftMargin, doc.bottomMargin,
                                                        doc.width, doc.height, id="f")],
                                   onPage=footer)])

s = []
s.append(Paragraph("學校項目報價清單", T))
s.append(Paragraph("由需求盤點、索取報價到驗收的一份實用檢查表　｜　ADWire Agency", SUB))
s.append(Spacer(1, 5 * mm))
s.append(box("這份清單怎樣用", [
    "印出來或開在旁邊，逐項核對；任何一格填不到，就代表報價的範圍仍未講清楚。",
    "適用於學校網站、校務系統、點名／考勤、家校通訊 App、教室設備及 AI 項目。",
]))

s.append(Paragraph("一、索取報價前，學校應先準備的五件事", H))
s.append(checklist(["項目", "說明"], [
    ["需求目標", "這個項目要解決什麼問題？寫一句具體的（例如「減少點名行政時間」）。"],
    ["使用者與角色", "誰會用（老師／學生／家長／行政）？各自需要看到什麼、不能看到什麼？"],
    ["現有系統清單", "現在用哪些平台（例如 eClass、內聯網、會計系統）？要與它們共存還是取代？"],
    ["資料來源與去向", "現有資料在哪裡、格式為何、上線後由誰擁有、能否完整匯出？"],
    ["時間與預算範圍", "期望何時上線？是否須配合學年或資助計劃的推行期？"],
], [34 * mm, 134 * mm]))

s.append(Paragraph("二、一份完整報價單應該包含", H))
s.append(checklist(["報價項目", "為什麼重要"], [
    ["功能清單與數量", "逐項列出模組／頁面數量，避免日後爭議「這個有沒有包含」。"],
    ["交付物清單", "原始碼、後台帳號、文件、培訓是否包括在內。"],
    ["不包含事項", "主機、網域、第三方服務（短訊、電郵、AI 模型）由誰付費。"],
    ["時間表與里程碑", "每個階段交付什麼、需要學校配合什麼。"],
    ["付款條件", "分幾期、每期觸發條件（簽約／交付／驗收）。"],
    ["保養範圍與年期", "保養期多久、包含什麼、超出範圍怎樣計價、回應時間。"],
    ["知識產權與資料擁有權", "原始碼、資料、帳戶權限的歸屬與日後遷移安排。"],
], [40 * mm, 128 * mm]))

s.append(Paragraph("三、面試供應商必問的五條問題", H))
for q, why in [
    ("可否提供同類型項目的實際案例與聯絡人？", "「做過」不等於「做得好」，要看對方願意讓你查證。"),
    ("上線後由誰跟進？保養期之後怎樣安排？", "最常見的風險不是做不出，而是交貨後找不到人。"),
    ("系統的資料可否完整匯出？轉換供應商要多久？", "評估日後被單一供應商鎖定的風險。"),
    ("有沒有隱藏收費（交易費、加值模組、匯出費）？", "要求以書面列出所有可能收費項目。"),
    ("如果中途要改範圍，怎樣計價與記錄？", "範圍變更是常態，事前講清楚比事後爭議好。"),
]:
    s.append(Paragraph(f"<b>{q}</b>　<a>—</a> {why}", LI))

s.append(Paragraph("四、資助計劃文件清單（以校本計劃為例）", H))
s.append(checklist(["文件", "備註"], [
    ["項目目標與校本需要說明", "說明與學校發展計劃的關係，以及針對的學生群體。"],
    ["推行計劃與時間表", "推行期、各階段工作、負責人。"],
    ["開支預算明細", "逐項列出，並注意計劃不涵蓋的項目（須以最新官方指引為準）。"],
    ["成效指標與評估方法", "如何量度、由誰量度、什麼時候報告。"],
    ["採購程序記錄", "報價份數、比較記錄、批核記錄（按學校採購程序要求保存）。"],
    ["供應商報價與規格書", "作為預算依據，並與交付物清單對應。"],
], [46 * mm, 122 * mm]))

s.append(Paragraph("五、驗收時的檢查清單", H))
s.append(checklist(["檢查項目", "驗收重點"], [
    ["功能逐項對照報價單", "以報價單的功能清單為準，逐項確認可運作。"],
    ["資料遷移核對", "抽查紀錄數量與內容，確認新舊系統一致。"],
    ["權限測試", "用不同角色帳號登入，確認看不到不應看到的資料。"],
    ["備份與還原", "確認備份頻率、存放位置，並實際試過還原。"],
    ["培訓與文件", "負責同事能自行完成日常操作，並有書面文件。"],
    ["帳戶與權限移交", "主機、網域、第三方服務帳戶以學校名義開立並完成交接。"],
], [42 * mm, 126 * mm]))

s.append(Spacer(1, 4 * mm))
s.append(box("個人資料用途聲明", [
    "你提供的姓名、聯絡電話及電郵地址，只會用於提供本清單及就學校項目與你聯絡。",
    "我們不會將你的資料轉交第三方作推銷用途。你可隨時要求查閱或更正你的個人資料。",
    "詳見我們的私隱政策：https://adwire.com.hk/privacy/",
]))
s.append(Spacer(1, 3 * mm))
s.append(Paragraph(
    "本清單為一般參考資料，不構成法律、會計或採購程序建議。資助計劃的申請資格、資助範圍與推行期以官方最新公布為準；"
    "學校的採購程序須依教育局相關指引及校本規定執行。", NOTE))

doc.build(s)
print(out, os.path.getsize(out) // 1024, "KB")

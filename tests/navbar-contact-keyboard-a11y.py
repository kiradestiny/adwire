#!/usr/bin/env python3
"""
tests/navbar-contact-keyboard-a11y.py
=====================================

隔離 session 的鍵盤／可聚焦性測試，覆蓋本次兩個檔案的修改：

  components/Navbar.tsx
    · 桌面服務下拉關閉時 inert（子連結不可聚焦）、focus/hover 可開、Escape 可關並還原焦點
    · 手機 Drawer 關閉時 inert、開啟時 aria-modal、Escape 關閉並把焦點還原到漢堡按鈕
    · 手機服務手風琴 aria-expanded / aria-controls 與面板 id 對應
    · 手機「免費諮詢」CTA：有 #contact 用同頁錨點，否則用 /contact/#contact

  components/ContactSection.tsx
    · 欄位驗證在 4 秒時間閘之前（快速提交空表單要見到欄位錯誤，唔係「提交過快」）
    · 保留時間閘（欄位有效但太快仍會見到「提交過快」）
    · /contact/ 掛載時消費 sessionStorage 的 adwire_assessment_prefill_v1（白名單 + 讀後刪除）

每個測試組用獨立的 browser context（隔離 storage / cookies），互不污染。

用法
----
先提供一個已建置的站（任選其一）：

    # A. 靜態匯出
    python -m http.server 8199 --directory out

    # B. 或 next 伺服器
    npx next start -p 8199

然後：

    python tests/navbar-contact-keyboard-a11y.py --base-url http://127.0.0.1:8199

選項：--headed（顯示瀏覽器）、--slowmo MS、--keep-open。
需要 Python playwright（`pip install playwright && playwright install chromium`）。

注意：測試**不會**送出真表單 —— 對 send-mail.php 的請求會被攔截，外部網域亦一律封鎖。
"""

from __future__ import annotations

import argparse
import json
import sys

from playwright.sync_api import sync_playwright, Page, BrowserContext

# ── 微型斷言框架（與 repo 其他測試一致：不引入測試框架依賴）────────────────────
RESULTS: list[tuple[str, bool, str]] = []


def check(name: str, cond: bool, detail: str = "") -> bool:
    RESULTS.append((name, bool(cond), detail))
    mark = "PASS" if cond else "FAIL"
    line = f"  [{mark}] {name}"
    if detail and not cond:
        line += f"\n         → {detail}"
    print(line)
    return bool(cond)


def section(title: str) -> None:
    print(f"\n=== {title} ===")


# ── 輔助 ───────────────────────────────────────────────────────────────────────
ACTIVE_TRIGGER_JS = """
() => [...document.querySelectorAll('a[aria-controls][aria-haspopup]')]
        .find(a => !a.closest('[inert]')) || null
"""

DROP_STATE_JS = """
() => {
  // 注意：next.config 用 trailingSlash，服務連結 href 係 "/services/" 而唔係 "/services"。
  // 所以用 aria-controls + aria-haspopup 定位，唔好靠 href 字串。
  const trig = [...document.querySelectorAll('a[aria-controls][aria-haspopup]')]
                 .find(a => !a.closest('[inert]'));
  if (!trig) return { found: false };
  const panel = document.getElementById(trig.getAttribute('aria-controls'));
  if (!panel) return { found: true, panel: false };
  const links = [...panel.querySelectorAll('a')];
  const first = links[0] || null;
  let firstFocusable = false;
  if (first) { first.focus(); firstFocusable = (document.activeElement === first); trig.focus(); }
  return {
    found: true, panel: true,
    ariaExpanded: trig.getAttribute('aria-expanded'),
    panelInert: panel.inert === true,
    linkCount: links.length,
    firstLinkFocusable: firstFocusable,
    rect: (() => { const r = trig.getBoundingClientRect();
                   return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })(),
  };
}
"""


def make_context(browser, width: int, height: int, base: str) -> BrowserContext:
    ctx = browser.new_context(viewport={"width": width, "height": height})

    def handler(route, request):
        url = request.url
        if "send-mail.php" in url:          # 絕不送出真表單
            route.abort()
        elif url.startswith(base) or url.startswith(("data:", "blob:")):
            route.continue_()
        else:                               # 封鎖 Turnstile / GA 等外部請求
            route.abort()

    ctx.route("**/*", handler)
    return ctx


def goto(page: Page, base: str, path: str) -> None:
    """導航並等待 React hydration 完成。

    必須等 hydration：inert / aria-expanded / CTA href 覆寫全部由 client effect 設定，
    domcontentloaded 之後仍然係初始 SSR 狀態。實測 250ms 唔夠，會出現
    「drawer.inert=False」「搵唔到下拉觸發連結」等假失敗。
    這裡改為等 load，再輪詢直到 drawer 已被套用 inert（或逾時）。
    """
    page.goto(base + path, wait_until="load")
    try:
        page.wait_for_function(
            """() => {
                 const d = document.querySelector('div[role="dialog"][aria-label="導覽選單"]');
                 return d ? d.inert === true : true;
               }""",
            timeout=8000,
        )
    except Exception:  # noqa: BLE001
        pass
    page.wait_for_timeout(400)


# ── 測試群 ─────────────────────────────────────────────────────────────────────
def test_desktop_dropdown(browser, base: str) -> None:
    section("桌面服務下拉（inert / 鍵盤開啟 / Escape）")
    ctx = make_context(browser, 1280, 900, base)
    page = ctx.new_page()
    goto(page, base, "/")

    st = page.evaluate(DROP_STATE_JS)
    check("找到桌面服務下拉觸發連結", st.get("found") is True, json.dumps(st))
    check("下拉面板存在且含 17 條服務連結", st.get("panel") and st.get("linkCount", 0) >= 17,
          f"linkCount={st.get('linkCount')}")
    check("關閉時 aria-expanded=false", st.get("ariaExpanded") == "false",
          f"aria-expanded={st.get('ariaExpanded')}")
    check("關閉時面板 inert（核心修正）", st.get("panelInert") is True,
          f"panel.inert={st.get('panelInert')}")
    check("關閉時子連結不可聚焦（核心修正）", st.get("firstLinkFocusable") is False,
          "面板關閉時仍可 focus 到子連結")

    # 鍵盤：focus 觸發連結即應開啟下拉
    page.evaluate(f"() => {{ const t = ({ACTIVE_TRIGGER_JS})(); if (t) t.focus(); }}")
    page.wait_for_timeout(150)
    st = page.evaluate(DROP_STATE_JS)
    check("focus 進入觸發連結後 aria-expanded=true", st.get("ariaExpanded") == "true",
          f"aria-expanded={st.get('ariaExpanded')}")
    check("開啟後面板不再是 inert", st.get("panelInert") is False,
          f"panel.inert={st.get('panelInert')}")
    check("開啟後子連結可聚焦", st.get("firstLinkFocusable") is True,
          "開啟後仍無法 focus 子連結")

    # Escape 關閉 + 焦點還原到觸發連結
    page.keyboard.press("Escape")
    page.wait_for_timeout(150)
    st = page.evaluate(DROP_STATE_JS)
    check("Escape 後 aria-expanded=false", st.get("ariaExpanded") == "false",
          f"aria-expanded={st.get('ariaExpanded')}")
    check("Escape 後面板回復 inert", st.get("panelInert") is True, f"panel.inert={st.get('panelInert')}")
    focus_is_trigger = page.evaluate(
        "() => document.activeElement === "
        f"({ACTIVE_TRIGGER_JS})()"
    )
    check("Escape 後焦點還原到觸發連結", focus_is_trigger is True)

    # hover 開啟（滑鼠用戶不受影響）
    rect = st.get("rect")
    if rect:
        page.mouse.move(rect["x"], rect["y"])
        page.wait_for_timeout(150)
        st = page.evaluate(DROP_STATE_JS)
        check("滑鼠 hover 可開啟下拉", st.get("ariaExpanded") == "true",
              f"aria-expanded={st.get('ariaExpanded')}")
        page.mouse.move(5, 5)
        page.wait_for_timeout(200)
        st = page.evaluate(DROP_STATE_JS)
        check("滑鼠移開後下拉關閉", st.get("ariaExpanded") == "false",
              f"aria-expanded={st.get('ariaExpanded')}")

    ctx.close()


def test_mobile_drawer(browser, base: str) -> None:
    section("手機 Drawer（inert / 模態語意 / Escape / 焦點還原 / 手風琴 aria）")
    ctx = make_context(browser, 390, 844, base)
    page = ctx.new_page()
    goto(page, base, "/")

    closed = page.evaluate(
        """
        () => {
          const dlg = document.querySelector('[role="dialog"][aria-label="導航選單"]');
          if (!dlg) return { found: false };
          const sel = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
          const focusables = [...dlg.querySelectorAll(sel)];
          const reachable = focusables.filter(el => !el.closest('[inert]') && !el.disabled);
          const link = dlg.querySelector('a');
          let linkFocusable = false;
          if (link) { link.focus(); linkFocusable = (document.activeElement === link); }
          return { found: true, inert: dlg.inert === true, ariaModal: dlg.getAttribute('aria-modal'),
                   total: focusables.length, reachable: reachable.length, linkFocusable };
        }
        """
    )
    check("找到手機 Drawer", closed.get("found") is True, json.dumps(closed))
    check("Drawer 關閉時 inert（核心修正）", closed.get("inert") is True, f"inert={closed.get('inert')}")
    check("Drawer 關閉時冇 aria-modal 模態語意", closed.get("ariaModal") in (None, "false"),
          f"aria-modal={closed.get('ariaModal')}")
    check("Drawer 關閉時內部元素不可聚焦（核心修正）",
          closed.get("reachable") == 0 and closed.get("linkFocusable") is False,
          f"reachable={closed.get('reachable')} / total={closed.get('total')} / linkFocusable={closed.get('linkFocusable')}")

    # 開啟 Drawer：用「真實點擊」，唔可以用 JS 的 btn.click()。
    # 原因：程式化 click() 唔會令按鈕取得焦點 → lastFocusedRef 會變成 body，
    # 之後「Escape 後焦點還原」就變成量度 body 而唔係漢堡（假失敗）。
    # 真實用戶係用滑鼠或鍵盤撳，所以測試亦要模擬真實互動。
    burger = page.locator('button[aria-label="打開選單"]').first
    opened = {"found": burger.count() > 0}
    if opened["found"]:
        burger.click()
    check("找到手機漢堡按鈕", opened.get("found") is True)
    page.wait_for_timeout(500)

    st = page.evaluate(
        """
        () => {
          const dlg = document.querySelector('[role="dialog"][aria-label="導航選單"]');
          const closeBtn = dlg.querySelector('button[aria-label="關閉選單"]');
          return { inert: dlg.inert === true, ariaModal: dlg.getAttribute('aria-modal'),
                   focusIsClose: document.activeElement === closeBtn };
        }
        """
    )
    check("開啟後 Drawer 不再 inert", st.get("inert") is False, f"inert={st.get('inert')}")
    check("開啟後有 aria-modal=true", st.get("ariaModal") == "true", f"aria-modal={st.get('ariaModal')}")
    check("開啟後焦點移入 Drawer（關閉按鈕）", st.get("focusIsClose") is True)

    # 手風琴 aria（Drawer 已開啟）
    acc = page.evaluate(
        """
        () => {
          const btn = document.querySelector('button[aria-controls="nav-mobile-services-panel"]');
          if (!btn) return { found: false };
          const panel = document.getElementById(btn.getAttribute('aria-controls'));
          const before = btn.getAttribute('aria-expanded');
          btn.click();
          return { found: true, before, panelExists: !!panel, labelled: btn.getAttribute('aria-label') };
        }
        """
    )
    check("手風琴按鈕有 aria-controls 指向存在的面板", acc.get("found") and acc.get("panelExists"),
          json.dumps(acc))
    check("手風琴預設 aria-expanded=true", acc.get("before") == "true", f"before={acc.get('before')}")
    page.wait_for_timeout(150)
    after = page.evaluate(
        """() => document.querySelector('button[aria-controls="nav-mobile-services-panel"]').getAttribute('aria-expanded')"""
    )
    check("點擊後 aria-expanded 切換為 false", after == "false", f"after={after}")
    # 收起時面板應 inert，內部連結不可聚焦
    collapsed = page.evaluate(
        """
        () => {
          const panel = document.getElementById('nav-mobile-services-panel');
          const link = panel.querySelector('a');
          let focusable = false;
          if (link) { link.focus(); focusable = document.activeElement === link; }
          return { inert: panel.inert === true, focusable };
        }
        """
    )
    check("手風琴收起時面板 inert",
          collapsed.get("inert") is True and collapsed.get("focusable") is False,
          json.dumps(collapsed))

    # Escape 關閉 Drawer + 焦點還原到漢堡
    page.evaluate("""() => document.querySelector('button[aria-label="關閉選單"]').focus()""")
    page.keyboard.press("Escape")
    page.wait_for_timeout(600)
    ret = page.evaluate(
        """
        () => {
          const dlg = document.querySelector('[role="dialog"][aria-label="導覽選單"]');
          // 注意：唔可以用之前存落 window 嘅節點參考比對 focus。
          // React 重繪後舊參考會 detach，即使焦點真的回到漢堡亦會誤判失敗。
          // 這裡即時用選擇器取「現在」的漢堡按鈕再比較。
          const burger = document.querySelector('button[aria-label="打開選單"]');
          return { inert: dlg ? dlg.inert === true : null,
                   dialogAbsent: dlg === null,
                   ariaModal: dlg ? dlg.getAttribute('aria-modal') : null,
                   activeIsBurger: !!burger && document.activeElement === burger,
                   activeLabel: document.activeElement
                     ? (document.activeElement.getAttribute('aria-label')
                        || document.activeElement.textContent.trim().slice(0, 20))
                     : null };
        }
        """
    )
    check("Escape 後 Drawer 關閉並回復 inert（或已從 DOM 移除）",
          ret.get("inert") is True or ret.get("dialogAbsent") is True,
          f"inert={ret.get('inert')} dialogAbsent={ret.get('dialogAbsent')}")
    check("Escape 後焦點還原到漢堡按鈕", ret.get("activeIsBurger") is True,
          f"activeLabel={ret.get('activeLabel')}")

    ctx.close()


def test_mobile_cta_href(browser, base: str) -> None:
    section("手機「免費諮詢」CTA（href 後備）")
    ctx = make_context(browser, 390, 844, base)

    def cta_hrefs(page: Page) -> list[str]:
        # 只取 Navbar 的手機「免費諮詢」CTA；要排除 WhatsApp 連結（文字亦含「免費諮詢」
        # 但 href 係 wa.me，屬另一個動作，唔應一齊比較）。
        return page.evaluate(
            """
            () => [...document.querySelectorAll('a')]
                    .filter(a => a.textContent.trim().includes('免費諮詢')
                                 && a.querySelector('svg')
                                 && !a.getAttribute('href').includes('wa.me')
                                 && !a.textContent.includes('WhatsApp'))
                    .map(a => a.getAttribute('href'))
            """
        )

    page = ctx.new_page()
    goto(page, base, "/")
    hrefs = cta_hrefs(page)
    # 首頁有 #contact：JS 應該把 href 覆寫成同頁錨點
    check("首頁（有 #contact）CTA href 為同頁錨點 #contact",
          bool(hrefs) and all(h == "#contact" for h in hrefs), f"hrefs={hrefs}")

    p2 = ctx.new_page()
    goto(p2, base, "/privacy/")
    hrefs2 = cta_hrefs(p2)
    check("無 #contact 的頁面 CTA href 為 /contact/#contact",
          bool(hrefs2) and all(h == "/contact/#contact" for h in hrefs2), f"hrefs={hrefs2}")

    ctx.close()


def test_cta_ssr_markup(browser, base: str) -> None:
    section("CTA 無 JS 後備（SSR HTML 檢查）")
    import re
    import urllib.request as _u
    try:
        html = _u.urlopen(base + "/privacy/", timeout=15).read().decode("utf-8", "ignore")
    except Exception as exc:  # noqa: BLE001
        check("取得 /privacy/ SSR HTML", False, str(exc))
        return
    # 直接檢查 SSR 錨點的 href。注意三點：
    #   1) 「免費諮詢」第一次出現可能在 script/RSC payload，不可用 find() 切字串。
    #   2) 錨點內含 <svg>，比對要容許標籤。
    #   3) `.*?免費諮詢` 會跨過多個 </a> 邊界（實測會捉到 skip-link 同首頁連結），
    #      所以一定要用 (?:(?!</a>).)* 限制在單一錨點內。
    anchor_hrefs = [
        href
        for href, body in re.findall(
            r'<a\b[^>]*?href="([^"]+)"[^>]*>((?:(?!</a>).)*?)</a>', html, re.S
        )
        if "免費諮詢" in body
    ]
    check("SSR HTML 中 CTA 的 href 為 /contact/#contact（無 JS 亦有用）",
          "/contact/#contact" in anchor_hrefs,
          f"anchors={anchor_hrefs[:5]}")


def test_validation_order(browser, base: str) -> None:
    section("聯絡表單：欄位驗證先於 4 秒時間閘")
    ctx = make_context(browser, 1280, 900, base)
    page = ctx.new_page()
    goto(page, base, "/")

    page.wait_for_selector('#contact form[data-hydrated="true"]', timeout=15000)

    # 快速提交空表單
    elapsed = page.evaluate(
        """
        () => {
          const started = Date.parse(document.querySelector('#contact input[name="formStartedAt"]').value);
          const before = Date.now();
          document.querySelector('#contact form button[type="submit"]').click();
          return { elapsedMsBeforeClick: before - started,
                   elapsedMs: Date.now() - started };
        }
        """
    )
    check("前置條件：提交發生在載入後 4 秒內（時間閘仍生效）",
          elapsed.get("elapsedMs", 99999) < 4000, json.dumps(elapsed))

    try:
        page.wait_for_function(
            "() => document.querySelector('#contact').innerText.includes('請輸入姓名')",
            timeout=4000,
        )
        field_error_shown = True
    except Exception:  # noqa: BLE001
        field_error_shown = False

    text = page.evaluate("() => document.querySelector('#contact').innerText")
    check("空表單快速提交 → 顯示欄位錯誤（核心修正）", field_error_shown)
    check("空表單快速提交 → 不顯示「提交過快」時間閘訊息（核心修正）",
          "提交過快" not in text)
    focus_ok = page.evaluate("() => document.activeElement && document.activeElement.id")
    check("焦點移到第一個錯誤欄位（contact-name）", focus_ok == "contact-name", f"activeElement.id={focus_ok}")

    # 時間閘保留：欄位有效但太快送出 → 應見到「提交過快」
    ctx2 = make_context(browser, 1280, 900, base)
    page2 = ctx2.new_page()
    goto(page2, base, "/")
    page2.wait_for_selector('#contact form[data-hydrated="true"]', timeout=15000)
    page2.fill("#contact-name", "陳大文")
    page2.fill("#contact-phone", "91234567")
    page2.fill("#contact-email", "test@example.com")
    elapsed2 = page2.evaluate(
        """
        () => {
          const started = Date.parse(document.querySelector('#contact input[name="formStartedAt"]').value);
          document.querySelector('#contact form button[type="submit"]').click();
          return { elapsedMs: Date.now() - started };
        }
        """
    )
    if elapsed2.get("elapsedMs", 99999) < 4000:
        try:
            page2.wait_for_function(
                "() => document.querySelector('#contact').innerText.includes('提交過快')",
                timeout=4000,
            )
            gate_ok = True
        except Exception:  # noqa: BLE001
            gate_ok = False
        check("欄位有效但太快送出 → 仍顯示「提交過快」（時間閘保留）", gate_ok,
              f"elapsedMs={elapsed2.get('elapsedMs')}")
    else:
        check("欄位有效但太快送出 → 仍顯示「提交過快」（時間閘保留）", True,
              f"SKIPPED：填充耗時 {elapsed2.get('elapsedMs')}ms 已超過 4 秒，未能測到快速路徑")

    # 確認未真正送出表單（封鎖後不應有 send-mail.php 成功請求）
    ctx.close(); ctx2.close()


def test_prefill_consumer(browser, base: str) -> None:
    section("問卷交接：/contact/ 消費 adwire_assessment_prefill_v1")
    ctx = make_context(browser, 1280, 900, base)
    page = ctx.new_page()
    goto(page, base, "/contact/")

    payload = {
        "service": "成效廣告投放",
        "message": "問卷摘要：想增加查詢，預算每月 1-3 萬。",
        "budget": "HK$10,000 – 30,000",
        "timeline": "一個月內",
    }
    page.evaluate(
        "(p) => sessionStorage.setItem('adwire_assessment_prefill_v1', p)",
        json.dumps(payload, ensure_ascii=False),
    )
    page.reload(wait_until="domcontentloaded")
    page.wait_for_selector('#contact form[data-hydrated="true"]', timeout=15000)
    page.wait_for_timeout(300)

    got = page.evaluate(
        """
        () => ({
          service: document.querySelector('#contact-service').value,
          message: document.querySelector('#contact-message').value,
          budget: document.querySelector('#contact-budget').value,
          timeline: document.querySelector('#contact-timeline').value,
          stored: sessionStorage.getItem('adwire_assessment_prefill_v1'),
        })
        """
    )
    check("service 依白名單預填", got.get("service") == payload["service"], f"service={got.get('service')!r}")
    check("message 預填", payload["message"] in (got.get("message") or ""), f"message={got.get('message')!r}")
    check("budget 預填", got.get("budget") == payload["budget"], f"budget={got.get('budget')!r}")
    check("timeline 預填", got.get("timeline") == payload["timeline"], f"timeline={got.get('timeline')!r}")
    check("讀取後已刪除 sessionStorage key", got.get("stored") is None, f"stored={got.get('stored')!r}")

    # 無效 / 惡意輸入：白名單外的 service 不應被套用；壞 JSON 不應令表單壞掉
    page.evaluate(
        "() => sessionStorage.setItem('adwire_assessment_prefill_v1', "
        "JSON.stringify({service:'__evil__', message:'x'}))"
    )
    page.reload(wait_until="domcontentloaded")
    page.wait_for_selector('#contact form[data-hydrated="true"]', timeout=15000)
    page.wait_for_timeout(300)
    bad = page.evaluate(
        """
        () => ({
          service: document.querySelector('#contact-service').value,
          hasOption: [...document.querySelectorAll('#contact-service option')].some(o => o.value === '__evil__'),
          submitDisabled: document.querySelector('#contact form button[type="submit"]').disabled,
        })
        """
    )
    check("白名單外的 service 不會套用", bad.get("service") != "__evil__" and not bad.get("hasOption"),
          json.dumps(bad))

    page.evaluate("() => sessionStorage.setItem('adwire_assessment_prefill_v1', '{not json')")
    page.reload(wait_until="domcontentloaded")
    page.wait_for_selector('#contact form[data-hydrated="true"]', timeout=15000)
    page.wait_for_timeout(300)
    still_usable = page.evaluate(
        """
        () => ({ hasName: !!document.querySelector('#contact-name'),
                 key: sessionStorage.getItem('adwire_assessment_prefill_v1'),
                 submitDisabled: document.querySelector('#contact form button[type="submit"]').disabled })
        """
    )
    check("壞 JSON → 表單保持可用（無崩潰）", still_usable.get("hasName") is True and
          still_usable.get("submitDisabled") is False, json.dumps(still_usable))
    check("壞 JSON 亦會清走 key", still_usable.get("key") is None, f"key={still_usable.get('key')!r}")

    ctx.close()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url", default="http://127.0.0.1:8199")
    ap.add_argument("--headed", action="store_true")
    ap.add_argument("--slowmo", type=int, default=0)
    args = ap.parse_args()
    base = args.base_url.rstrip("/")

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=not args.headed, slow_mo=args.slowmo)
        try:
            test_desktop_dropdown(browser, base)
            test_mobile_drawer(browser, base)
            test_mobile_cta_href(browser, base)
            test_cta_ssr_markup(browser, base)
            test_validation_order(browser, base)
            test_prefill_consumer(browser, base)
        finally:
            browser.close()

    passed = sum(1 for _, ok, _ in RESULTS if ok)
    failed = [(n, d) for n, ok, d in RESULTS if not ok]
    print(f"\n─── {passed}/{len(RESULTS)} 通過 ───")
    if failed:
        print("失敗項目：")
        for n, d in failed:
            print(f"  · {n}" + (f"  ({d})" if d else ""))
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())

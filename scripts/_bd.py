r"""安全修改 lib/blogData.ts 文章內容（v2 —— 支援兩種存放格式）。

⚠️ 兩種格式並存，必須都支援：
  1. content: "…"     —— 非 ASCII 用 \uXXXX escape、整段擠在一行
  2. content: `…`     —— 反引號 template literal、中文原文、保留真實換行
（歷史上兩批文章用唔同格式；只認雙引號會攞錯下一篇嘅內容。）

另外：全檔 2.4MB，直接 grep 會灌爆輸出。一律經本模組讀。

用法：
    from _bd import patch_content, get_content
    patch_content("slug", "舊文字", "新文字")       # 全篇必須只中一次，否則 raise 唔改
    patch_content("slug", "舊", "新", expect=2)    # 預期中 2 次

安全設計：
    * 先定位該 slug 所屬物件，再於物件內搵 content —— 唔會誤中其他文章
    * 保持原本 delimiter 與編碼風格
    * 預設要求匹配次數正好 1；唔中或中多過一次即 raise，唔會改檔
    * 寫入前備份 .bak；寫入後回讀驗證，失敗即還原
"""
import io, json, os, re, shutil, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BD = os.path.join(REPO, "lib", "blogData.ts")


def esc_quote(s):
    out = []
    for ch in s:
        o = ord(ch)
        if ch == '"':
            out.append('\\"')
        elif ch == "\\":
            out.append("\\\\")
        elif ch == "\n":
            out.append("\\n")
        elif ch == "\r":
            out.append("\\r")
        elif 0x20 <= o <= 0x7E:
            out.append(ch)
        else:
            out.append("\\u%04X" % o)
    return "".join(out)


def esc_backtick(s):
    out, i = [], 0
    while i < len(s):
        ch = s[i]
        if ch == "\\":
            out.append("\\\\")
        elif ch == "`":
            out.append("\\`")
        elif ch == "$" and i + 1 < len(s) and s[i + 1] == "{":
            out.append("\\$")
        else:
            out.append(ch)
        i += 1
    return "".join(out)


def _unescape_backtick(raw):
    out, i = [], 0
    while i < len(raw):
        if raw[i] == "\\" and i + 1 < len(raw):
            nxt = raw[i + 1]
            if nxt == "n":
                out.append("\n"); i += 2; continue
            if nxt == "r":
                out.append("\r"); i += 2; continue
            if nxt == "t":
                out.append("\t"); i += 2; continue
            out.append(nxt); i += 2; continue
        out.append(raw[i]); i += 1
    return "".join(out)


def _obj_bounds(slug, s):
    i = s.find('slug: "%s"' % slug)
    if i < 0:
        raise KeyError("找不到 slug: %s" % slug)
    start = s.rfind("\n  {", 0, i)
    if start < 0:
        start = 0
    end = s.find("\n  },", i)
    if end < 0:
        end = len(s)
    return start, end


def _content_span(slug, s):
    start, end = _obj_bounds(slug, s)
    obj = s[start:end]
    j = obj.find("content:")
    if j < 0:
        raise KeyError("slug %s 之物件內找不到 content 欄位" % slug)
    k = j + len("content:")
    while k < len(obj) and obj[k] in " \t":
        k += 1
    if k >= len(obj) or obj[k] not in ('"', "`"):
        raise ValueError("slug %s: content 值唔係字串（%r）" % (slug, obj[k:k + 12]))
    delim = obj[k]
    k += 1
    p = k
    while p < len(obj):
        if obj[p] == "\\":
            p += 2
            continue
        if obj[p] == delim:
            break
        p += 1
    return start + k, start + p, obj[k:p], delim


def get_content(slug):
    s = io.open(BD, encoding="utf-8").read()
    _, _, raw, delim = _content_span(slug, s)
    return json.loads('"' + raw + '"') if delim == '"' else _unescape_backtick(raw)


def patch_content(slug, old, new, expect=1, dry_run=False):
    s = io.open(BD, encoding="utf-8").read()
    a, b, raw, delim = _content_span(slug, s)
    dec = json.loads('"' + raw + '"') if delim == '"' else _unescape_backtick(raw)
    n = dec.count(old)
    if n != expect:
        raise ValueError("slug %s: 明文出現 %d 次，預期 %d 次 —— 未改動。片段：%r"
                         % (slug, n, expect, old[:60]))
    new_dec = dec.replace(old, new)
    enc = esc_quote(new_dec) if delim == '"' else esc_backtick(new_dec)
    s2 = s[:a] + enc + s[b:]
    if dry_run:
        print("[dry-run] %s (%s): 可換 %d 處" % (slug, "quote" if delim == '"' else "tick", n))
        return n
    shutil.copyfile(BD, BD + ".bak")
    io.open(BD, "w", encoding="utf-8", newline="").write(s2)
    chk = get_content(slug)
    if old in chk or new not in chk:
        shutil.copyfile(BD + ".bak", BD)
        raise RuntimeError("slug %s 寫入後驗證失敗，已還原" % slug)
    print("[ok] %s: 換 %d 處  %r -> %r" % (slug, n, old[:30], new[:30]))
    return n


def all_slugs():
    return re.findall(r'slug:\s*"([^"]+)"', io.open(BD, encoding="utf-8").read())


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "--show":
        print(get_content(sys.argv[2])[:2000])
    elif len(sys.argv) >= 2 and sys.argv[1] == "--list":
        s = io.open(BD, encoding="utf-8").read()
        for sl in all_slugs():
            _, _, _, d = _content_span(sl, s)
            print("%-52s %s  %d 字" % (sl, "quote" if d == '"' else "tick", len(get_content(sl))))

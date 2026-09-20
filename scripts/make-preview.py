#!/usr/bin/env python3
"""
make-preview.py — 建立本機預覽目錄

為什麼需要這一步：
    Next.js 靜態匯出會產生 RSC payload 快取檔（例如
    `__next.services.automation.__PAGE__.txt`），客戶端在頁面之間跳轉時會請求它們。

    但檔名結構會因作業系統而異：
      - Linux（GitHub Actions 正式部署用）→ 扁平檔名
        `<dir>/__next.services.automation.__PAGE__.txt`
      - Windows（本機開發）→ 嵌套目錄
        `<dir>/__next.services/automation/__PAGE__.txt`

    結果：本機預覽會對頁內跳轉所需的快取檔回傳 404（頁面本身仍正常）。
    本腳本把 Windows 產生的嵌套檔案複製成 Linux 版的扁平檔名，
    令本機預覽與正式站行為一致。

    另外，伺服器改為 serve 這個獨立目錄後，重新 build 就不需要先停掉伺服器
    （Windows 會鎖住正在 serve 的 out/ 目錄）。

用法：
    python scripts/make-preview.py            # 建立／更新 preview-build
    cd preview-build && python -m http.server 4173 --bind 127.0.0.1
"""

from __future__ import annotations

import os
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "out")
DST = os.path.join(ROOT, "preview-build")

# 不需要帶入預覽的目錄：後台與 CRM（含憑證，且預覽用不到）
EXCLUDE_DIRS = {"admin", "crm"}


def _excluded(rel: str) -> bool:
    parts = rel.replace(os.sep, "/").split("/")
    return any(p in EXCLUDE_DIRS for p in parts)


def sync_build() -> int:
    """
    以「就地同步」方式更新 preview-build，而不是整個目錄刪除重建。

    原因：Windows 上如果 HTTP 伺服器正在 serve 這個目錄，刪除根目錄會失敗
    （WinError 32 檔案正由另一個程序使用）。就地同步只需要覆寫檔案，
    伺服器可以一直運行，重新 build 後預覽立即更新。
    """
    if not os.path.isdir(SRC):
        sys.exit("找不到 out/ —— 請先執行 `npm run build`。")

    os.makedirs(DST, exist_ok=True)

    src_files: set[str] = set()
    for root, _dirs, files in os.walk(SRC):
        for f in files:
            full = os.path.join(root, f)
            rel = os.path.relpath(full, SRC)
            if _excluded(rel):
                continue
            src_files.add(rel)
            target = os.path.join(DST, rel)
            os.makedirs(os.path.dirname(target), exist_ok=True)
            shutil.copyfile(full, target)

    # 移除來源已不存在的檔案（對應 rsync --delete 的行為）
    removed = 0
    for root, _dirs, files in os.walk(DST):
        for f in files:
            full = os.path.join(root, f)
            rel = os.path.relpath(full, DST)
            if rel not in src_files:
                try:
                    os.remove(full)
                    removed += 1
                except PermissionError:
                    pass

    print(f"  移除舊檔：{removed} 個")
    return len(src_files)


def flatten_rsc_payloads() -> int:
    """
    <dir>/__next.<seg>/<a>/<b>/<file>  ->  <dir>/__next.<seg>.<a>.<b>.<file>
    """
    created = 0
    for root, dirs, _files in os.walk(DST):
        for d in list(dirs):
            if not d.startswith("__next."):
                continue
            nest = os.path.join(root, d)
            for sub_root, _sub_dirs, sub_files in os.walk(nest):
                for f in sub_files:
                    rel = os.path.relpath(os.path.join(sub_root, f), nest)
                    flat = f"{d}.{rel.replace(os.sep, '.')}"
                    dst = os.path.join(root, flat)
                    if not os.path.exists(dst):
                        shutil.copyfile(os.path.join(sub_root, f), dst)
                        created += 1
    return created


def main() -> None:
    files = sync_build()
    created = flatten_rsc_payloads()
    print(f"out/ -> preview-build/  ({files} 個檔案，就地同步)")
    print(f"補上扁平 RSC 快取檔：{created} 個")
    print()
    print("啟動預覽：")
    print("  cd preview-build && python -m http.server 4173 --bind 127.0.0.1")
    print("  然後開啟 http://127.0.0.1:4173/")


if __name__ == "__main__":
    main()

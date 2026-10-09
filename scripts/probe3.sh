#!/usr/bin/env bash
set -e
cd ~/repos/adwire
git add .github/workflows/live-probe.yml
git commit -q -m "ci(live-probe): 輸出 size_download（驗圖片重量）" || true
git push origin main >/dev/null 2>&1
sleep 8
fmt() { echo "  $1 -> expect $2 KB"; }
URLS="https://adwire.com.hk/services/kol/cafe.webp https://adwire.com.hk/portfolio/cafe-reels.webp https://adwire.com.hk/blog/ai-agent-hong-kong-business-guide.webp"
gh workflow run live-probe.yml -f "urls=$URLS" >/dev/null 2>&1
sleep 20
ID=$(gh run list --workflow=live-probe.yml --limit 1 --json databaseId -q '.[0].databaseId')
for i in $(seq 1 24); do
  ST=$(gh run view "$ID" --json status -q '.status' 2>/dev/null)
  [ "$ST" = "completed" ] && break
  sleep 10
done
echo "--- 本機大小 ---"
for f in services/kol/cafe.webp portfolio/cafe-reels.webp blog/ai-agent-hong-kong-business-guide.webp; do
  echo "  $f = $(( $(stat -c %s public/$f) / 1024 )) KB"
done
echo "--- 線上 ---"
gh run view "$ID" --log 2>/dev/null | sed 's/^[^\t]*\t[^\t]*\t//' | grep -E "^=====|status="

#!/usr/bin/env bash
cd ~/repos/adwire
echo "=== git：未 commit 嘅改動 ==="
git status --porcelain | grep -vE "^\?\?" | head -10 || true
echo "=== git：未 push？ ==="
git log --oneline origin/main..HEAD | head -5 || true
echo "=== 最近 5 個 commit ==="
git log --oneline -5
echo "=== deploy 狀態 ==="
gh run list --workflow=deploy.yml --limit 3 --json status,conclusion,headSha -q '.[] | "\(.status)/\(.conclusion) \(.headSha[0:7])"'

URLS="https://adwire.com.hk/services/web/ https://adwire.com.hk/services/seo/ https://adwire.com.hk/services/ai/ https://adwire.com.hk/services/system/ https://adwire.com.hk/blog/hong-kong-seo-geo-guide/ https://adwire.com.hk/blog/ai-solution-hong-kong-enterprise-guide/ https://adwire.com.hk/blog/hong-kong-brand-china-market-guide/ https://adwire.com.hk/blog/google-meta-ads-guide/ https://adwire.com.hk/services/kol/cafe.webp"
KW="網站設計公司 網頁製作 網站架設 網店平台 顧問 收費 整合與資料擁有權 由定義到落地 被引用的方式是否正確 應用指把人工智能技術 第57次 Engage-Through"

for attempt in 1 2 3; do
  gh workflow run live-probe.yml -f "urls=$URLS" -f "grep=$KW" >/dev/null 2>&1
  sleep 25
  ID=$(gh run list --workflow=live-probe.yml --limit 1 --json databaseId -q '.[0].databaseId')
  for i in $(seq 1 22); do
    ST=$(gh run view "$ID" --json status -q '.status' 2>/dev/null)
    [ "$ST" = "completed" ] && break
    sleep 10
  done
  OUT=$(gh run view "$ID" --log 2>/dev/null | sed 's/^[^\t]*\t[^\t]*\t//' | grep -E "^=====|status=|grep '")
  echo "$OUT" | grep -q "status=202" || break
  echo ">>> 202，重試"; sleep 90
done
echo "=== 線上結果（只列非零命中）==="
echo "$OUT" | grep -E "^=====|status=" 
echo "--- 命中 ---"
echo "$OUT" | grep "grep '" | grep -v "= 0$"
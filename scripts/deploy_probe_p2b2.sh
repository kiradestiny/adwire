#!/usr/bin/env bash
cd ~/repos/adwire
git add lib/service-deep-dive.ts scripts/pilot_p2b_kw.py scripts/dfs_hk_service_kw.py scripts/gsc_*.py
git commit -q -m "feat(services): 短名單關鍵字落服務頁 — 網站設計公司/網站架設/網店平台/網頁製作、SEO 收費/排名/香港/顧問（web 5141、seo 5781 CJK）" && echo committed
git push origin main >/dev/null 2>&1 && echo pushed
git log --oneline -1
# 等 deploy
for i in $(seq 1 30); do
  C=$(gh run list --workflow=deploy.yml --limit 1 --json status,conclusion -q '.[0].status+"/"+.[0].conclusion' 2>/dev/null)
  [ "$C" = "completed/success" ] && break
  [ "$C" = "completed/failure" ] && { echo "DEPLOY FAILED"; break; }
  sleep 15
done
echo "deploy: $C"
sleep 45
sleep 60
# 驗線上（WAF 可能 202，最多試 3 次）
for attempt in 1 2 3; do
  gh workflow run live-probe.yml -f "urls=https://adwire.com.hk/services/web/ https://adwire.com.hk/services/seo/" \
     -f "grep=網站設計公司 網站架設 網店平台 網頁製作 SEO 收費 SEO 顧問" >/dev/null 2>&1
  sleep 25
  ID=$(gh run list --workflow=live-probe.yml --limit 1 --json databaseId -q '.[0].databaseId')
  for i in $(seq 1 20); do
    ST=$(gh run view "$ID" --json status -q '.status' 2>/dev/null)
    [ "$ST" = "completed" ] && break
    sleep 10
  done
  OUT=$(gh run view "$ID" --log 2>/dev/null | sed 's/^[^\t]*\t[^\t]*\t//' | grep -E "^=====|status=|grep '")
  echo "$OUT"
  echo "$OUT" | grep -q "status=202" || { echo ">>> 驗證成功"; break; }
  echo ">>> 202，等 90s 再試"
  sleep 90
done
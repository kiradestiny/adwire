#!/usr/bin/env bash
cd ~/repos/adwire
git add lib/blogData.ts scripts/db-sync/payload.json scripts/pilot_p3_titles*.py scripts/gsc_ctr_candidates*.py deliverables/seo/
git commit -q -m "seo(titles): 改寫 striking-distance 標題／描述 — AI Agent(加 AI Agency 意圖)、小紅書(加 Marketing)" && echo committed
git push origin main >/dev/null 2>&1 && echo pushed
git log --oneline -1
sleep 15
gh workflow run db-sync-blog.yml -f mode=dry-run >/dev/null 2>&1 && echo "dry-run 已觸發"
sleep 20
ID=$(gh run list --workflow=db-sync-blog.yml --limit 1 --json databaseId -q '.[0].databaseId')
for i in $(seq 1 24); do
  ST=$(gh run view "$ID" --json status -q '.status' 2>/dev/null)
  [ "$ST" = "completed" ] && break
  sleep 10
done
echo "--- dry-run 結果 ---"
gh run view "$ID" --log 2>/dev/null | sed 's/^[^\t]*\t[^\t]*\t//' | grep -E "比對|後台有|後台沒有|title:|content 不同|差異|ai-agent|xiaohongshu" | head -40
#!/usr/bin/env bash
set -e
cd ~/repos/adwire
URLS="https://adwire.com.hk/blog/ai-agent-hong-kong-business-guide-2026/ https://adwire.com.hk/blog/ai-agent-hong-kong-business-guide/ https://adwire.com.hk/sitemap.xml https://adwire.com.hk/services/web/"
KW="ai-agent-hong-kong-business-guide services/web"
gh workflow run live-probe.yml -f "urls=$URLS" -f "grep=$KW" >/dev/null 2>&1
sleep 25
ID=$(gh run list --workflow=live-probe.yml --limit 1 --json databaseId -q '.[0].databaseId')
for i in $(seq 1 24); do
  ST=$(gh run view "$ID" --json status -q '.status' 2>/dev/null)
  [ "$ST" = "completed" ] && break
  sleep 10
done
gh run view "$ID" --log 2>/dev/null | sed 's/^[^\t]*\t[^\t]*\t//' | grep -E "^=====|status=|grep '"
echo "=== 本機 out/.htaccess 301 數 ==="
grep -c "RewriteRule" out/.htaccess 2>/dev/null || echo "no out/.htaccess"
echo "=== sitemap 內舊 slug 殘留 ==="
grep -c "\-2026" out/sitemap.xml 2>/dev/null || echo 0
echo "=== sitemap URL 總數 ==="
grep -c "<loc>" out/sitemap.xml 2>/dev/null
#!/usr/bin/env bash
# 通用部署 + 等待（核對 headSha）
MSG="${1:-deploy}"
cd ~/repos/adwire
git add -A 2>/dev/null
git commit -q -m "$MSG" || echo "nothing to commit"
git push origin main 2>&1 | tail -1
SHA=$(git rev-parse --short HEAD)
echo "commit=$SHA"
for i in $(seq 1 40); do
  R=$(gh run list --workflow=deploy.yml --limit 1 --json status,conclusion,headSha -q '.[0].status+"/"+.[0].conclusion+" "+.[0].headSha[0:7]' 2>/dev/null)
  case "$R" in *"$SHA"*) case "$R" in completed/*) echo "$R"; break;; esac;; esac
  sleep 15
done
echo "deploy: $R"
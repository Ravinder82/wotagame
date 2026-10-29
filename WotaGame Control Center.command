#!/bin/zsh
cd /Users/ravinderpoonia/Developer/WotaGame
if ! lsof -nP -iTCP:4178 -sTCP:LISTEN >/dev/null 2>&1; then
  nohup node server.mjs > /tmp/wotagame-local.log 2>&1 &
  sleep 1
fi
open http://localhost:4178/

#!/usr/bin/env bash
# Renders both formats + 1 PNG per second for the Reviewer.
set -euo pipefail
cd "$(dirname "$0")/.."
NAME=$(node -e "console.log(require('./storyboard.json').name)")
mkdir -p output frames

render() { # $1 = composition id, $2 = suffix
  for try in 1 2 3; do
    if npx remotion render src/index.ts "$1" "output/${NAME}_$2.mp4" --codec=h264; then
      return 0
    fi
    echo "render $1 failed (try $try)" >> errors.md
    sleep $((try * 5))
  done
  echo "[$(date -u +%F)] $1 failed 3 times: skipped" >> errors.md
  return 1
}

PC_OK=0; MOB_OK=0
render Pc pc && PC_OK=1 || true
render Mobile mobile && MOB_OK=1 || true

# frames for the Reviewer agent (1 per second)
if [ "$PC_OK" = 1 ]; then
  for t in 1 3 5 7 9; do npx remotion still src/index.ts Pc "frames/pc_${t}s.png" --frame=$((t*30)) || true; done
fi
if [ "$MOB_OK" = 1 ]; then
  for t in 1 3 5 7 9; do npx remotion still src/index.ts Mobile "frames/mobile_${t}s.png" --frame=$((t*30)) || true; done
fi

echo "done: pc=$PC_OK mobile=$MOB_OK"
# one format failing is fine; both failing is an error
[ "$PC_OK" = 1 ] || [ "$MOB_OK" = 1 ]

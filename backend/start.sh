#!/bin/bash
# Find main.js in dist folder and run it
# This handles cases where root directory might be misconfigured

cd "$(dirname "$0")" || exit 1

if [ -f "dist/main.js" ]; then
  node dist/main.js
elif [ -f "../backend/dist/main.js" ]; then
  node ../backend/dist/main.js
elif [ -f "/opt/render/project/backend/dist/main.js" ]; then
  node /opt/render/project/backend/dist/main.js
else
  echo "Error: Cannot find dist/main.js"
  echo "Current directory: $(pwd)"
  echo "Looking for:"
  echo "  - dist/main.js"
  echo "  - ../backend/dist/main.js"
  echo "  - /opt/render/project/backend/dist/main.js"
  exit 1
fi

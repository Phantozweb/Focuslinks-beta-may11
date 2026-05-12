#!/bin/bash
cd /home/z/my-project
# Start the server
bun run dev >> /home/z/my-project/dev.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Keep pinging to keep it alive
sleep 5
while true; do
  if ! ss -tlnp | grep -q 3000; then
    echo "[$(date)] Server died, restarting..." >> /home/z/my-project/dev.log
    bun run dev >> /home/z/my-project/dev.log 2>&1 &
    SERVER_PID=$!
    echo "New Server PID: $SERVER_PID"
  fi
  sleep 5
done

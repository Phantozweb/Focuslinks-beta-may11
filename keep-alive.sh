#!/bin/bash
cd /home/z/my-project
while true; do
  npx next dev --port 3000 > dev.log 2>&1
  echo "Server crashed at $(date), restarting in 3s..." >> dev.log
  sleep 3
done

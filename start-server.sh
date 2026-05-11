#!/bin/bash
cd /home/z/my-project
exec npx next dev --port 3000 >> dev.log 2>&1

#!/bin/bash
set -e

cd /home/progi-playtrade/projekt/Backend
git pull origin main

cd ../Frontend
git pull origin main
npm install
npm run build

cd ../Backend
pm2 restart playtrade

# cron job
# */5 * * * * /home/progi-playtrade/projekt/deploy.sh >> /home/progi-playtrade/projekt/deploy.log 2>&1

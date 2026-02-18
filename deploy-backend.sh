set -e
cd /home/ubuntu/storageapp-backend
git pull
npm install
pm2 restart 0

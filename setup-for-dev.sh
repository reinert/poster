#!/bin/bash

#sudo rm -rf pgsql/.data
rm -rf server/.logs
rm -rf server/node_modules
rm -f server/.env
rm -f .env

echo ">> environment cleaned"

cp .env.template .env

#sed -i "s:\$USR:$USER:g" .env
#USRID=`id -u`
#GRPID=`id -g`
#sed -i "s:\$UID:$USRID:g" .env
#sed -i "s:\$GID:$GRPID:g" .env

#mkdir -p pgsql/.data

cp .env server/.env

echo ">> .env files set"

mkdir -p server/.logs
mkdir -p server/node_modules

echo ">> server directories set"

#sudo nginx/setup-local-hosts.sh

echo ">> dev setup done!"

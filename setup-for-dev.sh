#!/bin/bash

sudo rm -rf db/.data
rm -rf server/.logs
rm -rf server/node_modules
rm -f server/.env
rm -f .env

cp .env.template .env

sed -i "s:\$USR:$USER:g" .env
USRID=`id -u`
GRPID=`id -g`
sed -i "s:\$UID:$USRID:g" .env
sed -i "s:\$GID:$GRPID:g" .env

mkdir -p db/.data

cp .env server/.env
mkdir -p server/.logs
mkdir -p server/node_modules

sudo nginx/setup-local-hosts.sh

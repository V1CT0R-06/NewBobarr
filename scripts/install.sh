#!/bin/bash
set -e # exit when error

cat << "EOF"

    /$$                 /$$
    | $$                | $$
    | $$$$$$$   /$$$$$$ | $$$$$$$   /$$$$$$   /$$$$$$   /$$$$$$
    | $$__  $$ /$$__  $$| $$__  $$ |____  $$ /$$__  $$ /$$__  $$
    | $$  \ $$| $$  \ $$| $$  \ $$  /$$$$$$$| $$  \__/| $$  \__/
    | $$  | $$| $$  | $$| $$  | $$ /$$__  $$| $$      | $$
    | $$$$$$$/|  $$$$$$/| $$$$$$$/|  $$$$$$$| $$      | $$
    |_______/  \______/ |_______/  \_______/|__/      |__/

        Bobarr

EOF

RAW_BASE="${BOBARR_RAW_BASE:-https://raw.githubusercontent.com/OWNER/REPOSITORY/main}"

if [ "$(ls -A $PWD)" ]
then
    echo "$(pwd) is not empty"
    echo "please re-run this install script in an empty and new directory"
    exit 2
fi

echo "downloading bobarr into directory"

mkdir -p library/downloads
mkdir -p library/movies
mkdir -p library/tvshows

mkdir -p packages/jackett/config
mkdir -p packages/jackett/downloads
mkdir -p packages/transmission/config
mkdir -p packages/vpn

(
  cd packages/transmission/config
  curl -fsSL "$RAW_BASE/packages/transmission/config/settings.example.json" -o settings.json
)

curl -fsSL "$RAW_BASE/.env.example" -o .env
curl -fsSL "$RAW_BASE/docker-compose.yml" -o docker-compose.yml
curl -fsSL "$RAW_BASE/docker-compose.vpn.yml" -o docker-compose.vpn.yml
curl -fsSL "$RAW_BASE/docker-compose.wireguard.yml" -o docker-compose.wireguard.yml

curl -fsSL "$RAW_BASE/scripts/bobarr.sh" -o bobarr.sh
chmod +x ./bobarr.sh

echo "downloading docker images"

docker-compose pull

echo ""
echo "bobarr installation is now complete!"
echo "update your configuration into [.env] and [docker-compose.yml] to link your library"

echo ""
echo "when done run you can start bobarr with [./bobarr.sh start]"

echo ""
echo "if you want to setup a vpn or wireguard, drop your vpn configuration into [./packages/vpn]"
echo "and then start with [./bobarr.sh start:vpn] or [./bobarr.sh start:wireguard]"

echo ""
echo "you can find the documentation in this project's README"

echo ""
echo "enjoy"

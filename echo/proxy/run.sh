#!/bin/sh

# Start echo dapp
echo -n "Starting proxy server: "
php -S localhost:8000 -t public

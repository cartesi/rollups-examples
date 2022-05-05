#!/bin/sh
# Copyright 2022 Cartesi Pte. Ltd.
#
# SPDX-License-Identifier: Apache-2.0
# Licensed under the Apache License, Version 2.0 (the "License"); you may not use
# this file except in compliance with the License. You may obtain a copy of the
# License at http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software distributed
# under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
# CONDITIONS OF ANY KIND, either express or implied. See the License for the
# specific language governing permissions and limitations under the License.

# Start the Cartesi HTTP-Dispatcher and the cartesi-dex-dapp.
# This script must run inside the cartesi machine

DAPP_PORT=5003
HTTP_DISPATCHER_PORT=5004

# Change dir to cartesi-dex-dapp root
cd /mnt/cartesi-dex-dapp

(cd src/db; python3 ./seed.py)

# Start cartesi-dex dapp
echo -n "Starting cartesi-dex-dapp: "
HTTP_DISPATCHER_URL="http://127.0.0.1:$HTTP_DISPATCHER_PORT" \
gunicorn --preload --workers 1 --bind 127.0.0.1:$DAPP_PORT cartesi-dex:app &

# Wait for the cartesi-dex dapp to start up
RETRY=0
while ! netstat -ntl 2&>1 | grep $DAPP_PORT > /dev/null
do
    echo -n "."
    sleep 1
    RETRY=$(echo $RETRY + 1 | bc)
    if [ "$RETRY" == "100" ]
    then
        echo "cartesi-dex dapp timed out"
        return 1
    fi
done
echo ""

# Start http dispatcher
echo "Starting http-dispatcher: "
http-dispatcher --address 127.0.0.1:$HTTP_DISPATCHER_PORT --dapp 127.0.0.1:$DAPP_PORT --verbose

#!/bin/bash

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

#exit when any command fails
set -e

enable_traps() {
    #enable traps inside functions
    set -TE

    # capture the line number where the error occured
    trap 'line_number=$LINENO' ERR
    # keep track of the last executed command
    trap 'last_command=$current_command; current_command=$BASH_COMMAND' DEBUG
    # echo an error message before exiting
    trap 'echo "At line $line_number: \"${last_command}\" failed with exit code $?."; docker-compose down -v' EXIT
}

disable_traps() {
    set +T
    set +e
    set +E
    trap - DEBUG
    trap - EXIT
}

print() {
    echo -n "[TEST] "
    echo $1 $2
}

# Searches for a specific string in a log file.
# Parameters:
#   cmd: array containing a command that outputs the log to STDOUT
#   str: the string being search for
#   timeout: how many seconds to wait before the search fails
search_in_log() {
    local -n cmd=$1
    str=$2

    if [[ -z $3 || $3 -lt 1 ]]; then timeout=60; else timeout=$3; fi

    matches=0
    retry=0

    while [ $matches -lt 1 ]; do
        echo -n "."
        sleep 1
        if [ $retry -eq $timeout ]; then
            echo ""
            print "Timed out"
            return 1
        fi
        matches=$(
            ${cmd[@]} 2>&1 | grep -c "$str"
            exit 0
        )
        retry=$(expr $retry + 1)
    done
}

wait_containers_ready() {
    print -n "Waiting for containers to be ready"

    log=(docker logs echo_server_manager_1)

    if [[ "$1" == "host" ]]; then
        ready_str="received get_epoch_status with id=default_rollups_id and epoch_index=0"
    elif [[ "$1" == "prod" ]]; then
        ready_str="Received GetEpochStatus for session default_rollups_id epoch 0"
    fi

    search_in_log log "$ready_str" 120
    echo ""
}

assert_input_sent() {
    expected="Added input '0x63617274657369' to epoch '0'"
    if [[ "$1" == "$expected"* ]]; then return 0; else return 1; fi
}

assert_input_processed() {
    print -n "Waiting for input to be processed"

    if [[ "$1" == "host" ]]; then
        ready_str="received get_epoch_status with id=default_rollups_id and epoch_index=0"
    elif [[ "$1" == "prod" ]]; then
        ready_str="Received GetEpochStatus for session default_rollups_id epoch 0"
    fi

    log=(docker logs -n 6 echo_server_manager_1)
    search_in_log log "$ready_str"

    echo ""
}

assert_notice() {
    expected='{'\
'"session_id":"default_rollups_id",'\
'"epoch_index":"0",'\
'"input_index":"1",'\
'"notice_index":"0",'\
'"payload":"63617274657369"'\
'}'
    if [[ "$1" == "$expected" ]]; then return 0; else return 1; fi
}

assert_epoch_advance() {
    print -n "Waiting for epoch to advance"

    if [[ "$1" == "host" ]]; then
        ready_str="received get_epoch_status with id=default_rollups_id and epoch_index=1"
    elif [[ "$1" == "prod" ]]; then
        ready_str="Received GetEpochStatus for session default_rollups_id epoch 1"
    fi

    log=(docker logs -n 6 echo_server_manager_1)
    search_in_log log "$ready_str"

    echo ""
}

assert_local_server_ready() {
    print -n "Waiting for local backend to be ready"

    ready_str="Received finish status 202"
    log=(cat echo.log)
    search_in_log log "$ready_str"

    echo ""
}

test_production_mode() {
    print '### Smoke Test - Production Mode ###'
    enable_traps
    cd ..

    print 'Creating cartesi machine'
    make machine

    print 'Starting docker environment'
    docker-compose up -d
    wait_containers_ready 'prod'

    print 'Sending input'
    cd contracts
    yarn
    input=$(npx hardhat --network localhost echo:addInput --input "0x63617274657369")
    assert_input_sent "$input"
    assert_input_processed 'prod'

    print 'Querying notice'
    notice=$(npx hardhat --network localhost echo:getNotices --epoch 0 --input 1)
    assert_notice $notice

    print 'Advancing epoch'
    npx hardhat --network localhost util:advanceTime --seconds 864010
    assert_epoch_advance 'prod'
    cd ..

    print 'Taking down docker environment'
    docker-compose down -v

    cd test
    print 'Done'
    disable_traps
}

test_host_mode() {
    print '### Smoke Test - Host Mode ###'
    enable_traps
    cd ..

    print 'Starting docker environment'
    docker-compose -f docker-compose.yml -f docker-compose-host.yml up --build -d
    wait_containers_ready 'host'

    print 'Starting backend'
    cd backend
    python3 -m venv .env
    . .env/bin/activate
    pip install -r requirements.txt
    ROLLUP_HTTP_SERVER_URL="http://127.0.0.1:5004" python3 echo.py > echo.log 2>&1 &
    ECHO_PID=$!
    assert_local_server_ready
    cd ..

    print 'Sending input'
    cd contracts
    yarn
    input=$(npx hardhat --network localhost echo:addInput --input "0x63617274657369")
    assert_input_sent "$input"
    assert_input_processed 'host'

    print 'Querying notice'
    notice=$(npx hardhat --network localhost echo:getNotices --epoch 0 --input 1)
    assert_notice $notice

    print 'Advancing epoch'
    npx hardhat --network localhost util:advanceTime --seconds 864010
    assert_epoch_advance 'host'
    cd ..

    print 'Taking down backend'
    kill $ECHO_PID
    rm backend/echo.log

    print 'Taking down docker environment'
    docker-compose down -v

    cd test
    print 'Done'
    disable_traps
}

if [ $# = 0 ]; then
    test_production_mode
    test_host_mode
elif [ $1 = 'prod' ]; then
    test_production_mode
elif [ $1 = "host" ]; then
    test_host_mode
else
    echo 'Wrong parameter. Use "prod", "host", or leave it blank to test both environments'
    exit 1
fi

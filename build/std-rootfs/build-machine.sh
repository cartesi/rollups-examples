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

set -e

MACHINE_DIR=$1
ROLLUP_HTTP_SERVER_PORT=5004
NETWORK=$2

cartesi-machine \
    --assert-rolling-template \
    --ram-length=128Mi \
    --rollup \
    --flash-drive=label:dapp,filename:dapp.ext2 \
    --flash-drive=label:root,filename:rootfs.ext2 \
    --ram-image=linux.bin \
    --rom-image=rom.bin \
    --store=$MACHINE_DIR \
    -- "cd /mnt/dapp; \
        NETWORK=$NETWORK ROLLUP_HTTP_SERVER_URL=\"http://127.0.0.1:$ROLLUP_HTTP_SERVER_PORT\" \
        ./entrypoint.sh"

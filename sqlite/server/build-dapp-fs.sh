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

DAPP_FS=/opt/cartesi/sqlite-dapp-fs/sqlite-dapp
DAPP_FS_BIN=/opt/cartesi/sqlite-dapp-fs/sqlite-dapp.ext2

mkdir -p $DAPP_FS
cp ./sqlite.py $DAPP_FS
cp ./run.sh $DAPP_FS
genext2fs -f -i 512 -b 1024 -d $DAPP_FS $DAPP_FS_BIN
truncate -s %4096 $DAPP_FS_BIN

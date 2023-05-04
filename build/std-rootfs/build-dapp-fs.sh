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

CONFIG_DEFAULT=$1
CONFIG_DAPP=$2
EXT2=$3
FS_DIR=$(mktemp -d)
TAR=$(mktemp)
FILES=$(mktemp)

# copy filesystem files to tmp dir
jq -rs '.[0] * .[1] | .fs.files[]?' $CONFIG_DEFAULT $CONFIG_DAPP > $FILES
rsync -r --files-from=$FILES . $FS_DIR
rsync -r ./deployments $FS_DIR

# create tar as the dapp user
tar --sort=name --mtime="2022-01-01" --owner=1000 --group=1000 --numeric-owner -cf $TAR --directory=$FS_DIR .

# generate ext2 filesystem
FS_SIZE=$(jq -rs '.[0] * .[1] | .fs.size // 4096' $CONFIG_DEFAULT $CONFIG_DAPP)
# extra space to accommodate the deployments
FS_SIZE=$((FS_SIZE + 4096))
genext2fs -f -i 512 -b $FS_SIZE -a $TAR $EXT2

# truncate to multiple of 4k
truncate -s %4096 $EXT2

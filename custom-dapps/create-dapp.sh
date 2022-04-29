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

if [ $# -ne 1 ]
  then
    echo "No DAPP_NAME supplied"
    echo "Usage: $0 DAPP_NAME"
    exit 1
fi

dapp_name=${1}
echo "Creating DApp ${dapp_name}..."

echo "Copying files from template..."
cp -pr template ${dapp_name}

echo "Copying common files..."
cp -pr ../config ${dapp_name}
mkdir -p ${dapp_name}/contracts
cp -pr ../contracts/config ${dapp_name}/contracts
cp -pr ../contracts/deploy ${dapp_name}/contracts
find ../contracts -maxdepth 1 -type f | xargs -I {} cp {} ${dapp_name}/contracts
cp ../docker-compose.yml ${dapp_name}
cp ../docker-compose-host.yml ${dapp_name}
cp ../Dockerfile ${dapp_name}

echo "Customizing DApp infrastructure..."
# replace references to machine directory from '${dapp}/machine' to './machine'
for i in \
    ${dapp_name}/Dockerfile \
    ${dapp_name}/docker-compose.yml
do
    sed -i'' -e "s/\$DAPP_NAME\/machine/machine/g" $i
done
sed -i'' -e "s/..\/\${dapp}\/machine/..\/machine/g" ${dapp_name}/contracts/deploy/01_rollups.ts
# replace variable for dapp to be executed with the actual dapp name
sed -i'' -e "s/dapps = \[.*\]/dapps = \[\"${dapp_name}\"\]/g" ${dapp_name}/contracts/hardhat.config.ts
sed -i'' -e "s/\$DAPP_NAME/${dapp_name}/g" ${dapp_name}/docker-compose.yml
# replace template placeholders by dapp name
for i in \
    ${dapp_name}/backend/build-dapp-fs.sh \
    ${dapp_name}/backend/build-machine.sh \
    ${dapp_name}/backend/Makefile \
    ${dapp_name}/backend/run-machine-console.sh \
    ${dapp_name}/README.md
do
    sed -i'' -e "s/template/${dapp_name}/g" $i
    sed -i'' -e "s/Template/${dapp_name}/g" $i
done

find ${dapp_name} -name '*-e' -exec rm {} \;

echo "Creating template back-end script..."
mv ${dapp_name}/server/template.py ${dapp_name}/server/${1}.py

echo "Done"
echo "Proceed with adapting or replacing the back-end source code of the DApp at ${dapp_name}/server/${dapp_name}.py"

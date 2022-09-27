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
cp -pr ../docker ${dapp_name}
cp ../base.hcl ${dapp_name}/docker-bake.hcl
cp ../deploy-testnet.yml ${dapp_name}
cp ../docker-compose.yml ${dapp_name}
cp ../docker-compose-testnet.yml ${dapp_name}
cp ../docker-compose-host.yml ${dapp_name}

echo "Customizing DApp infrastructure..."
# adjust relative paths
for i in \
    ${dapp_name}/docker-bake.hcl
do
    sed -i'' -e "s/\.\.\/docker/\.\/docker/g" $i
done

# replace template placeholders by dapp name
for i in \
    ${dapp_name}/dapp.json \
    ${dapp_name}/docker-bake.override.hcl \
    ${dapp_name}/docker-compose.override.yml \
    ${dapp_name}/entrypoint.sh \
    ${dapp_name}/README.md
do
    sed -i'' -e "s/template/${dapp_name}/g" $i
    sed -i'' -e "s/Template/${dapp_name}/g" $i
done

find ${dapp_name} -name '*-e' -exec rm {} \;

echo "Creating template back-end script..."
mv ${dapp_name}/template.py ${dapp_name}/${1}.py

echo "Done"
echo "Proceed with adapting or replacing the back-end source code of the DApp at ${dapp_name}.py"

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

mkdir -p ../libs

python3 -m venv .env
. .env/bin/activate; \
    pip install -r requirements.txt; \
    python_lib_dir=./.env/lib/python$(python --version | awk '{split($2, a, "."); print a[1]"."a[2]}')/site-packages/; \
    cat requirements.txt | \
    awk -v python_lib_dir=$python_lib_dir -v lib_dir=$lib_dir '{printf "%s"$1"\n", python_lib_dir}' | \
    xargs -I % sh -c 'cp -pr % ../libs' \
    deactivate

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

# Start the Cartesi echo-dapp in host mode

ROLLUP_HTTP_SERVER_PORT=5004

# Rebuild echo dapp
echo -n "Rebuilding echo-dapp: "
make echo-backend-host

# Start echo dapp
echo -n "Starting echo-dapp: "
ROLLUP_HTTP_SERVER_URL="http://127.0.0.1:$ROLLUP_HTTP_SERVER_PORT" \
./echo-backend-host

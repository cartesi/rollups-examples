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

set -e
#rollup-init nix build nixpkgs#hello --extra-experimental-features nix-command --extra-experimental-features flakes && echo ciao
# rollup-init nix --version
rollup-init /nix/store2qzfvsqb9afhb73cc3yfg8hk2xpxcy47-nix-2.16.0pre20230512_dirty-riscv64-unknown-linux-gnu/bin/nix --version \
  && curl -X POST http://${ROLLUP_HTTP_SERVER_URL}/finish \
  -H 'Content-Type: application/json' \
  -d '{"status":"accept"}'
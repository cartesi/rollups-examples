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

CXX  := riscv64-cartesi-linux-gnu-g++
CXX_HOST := g++

.PHONY: clean 3rdparty

echo-backend: echo-backend.cpp
	make -C 3rdparty
	$(CXX) -pthread -std=c++11 -o $@ $^

echo-backend-host: echo-backend.cpp
	make -C 3rdparty
	$(CXX_HOST) -pthread -std=c++11 -o $@ $^

clean:
	@rm -rf echo-backend echo-backend-host
	make -C 3rdparty clean

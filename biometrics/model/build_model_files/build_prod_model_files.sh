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

cmake .
make
./fex "-d" ./dataset/
#Input here your path to cartesi toolchain binaries. Or keep it if you have in the same path as bellow.
export PATH="/home/marcus/Documents/riscv/riscv64-cartesi-linux-gnu/bin:$PATH"
riscv64-cartesi-linux-gnu-g++ featureExtractor.cpp -o fexrvv -I /usr/local/opencv4-rvv/include/opencv4 -L /usr/local/opencv4-rvv/lib -lopencv_core -lopencv_imgcodecs -lopencv_imgproc -lopencv_highgui
mv ./fexrvv ../../
mv training_hists.txt testing_hists.txt training_labels.txt testing_labels.txt ../

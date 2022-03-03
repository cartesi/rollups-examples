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

DAPP_SERVER_MANAGER_TAG := 0.1.0
DAPP_SERVER_MANAGER_IMG := cartesi/server-manager:$(DAPP_SERVER_MANAGER_TAG)

CONTAINER_NAME := cartesi-echo-dapp
CONTAINER_BASE := /opt/cartesi/echo
CONTAINER_DAPP_FS_BIN := /opt/cartesi/echo-dapp-fs/echo-dapp.ext2
CONTAINER_MACHINE_DIR := /opt/cartesi/echo-machine

DAPP_FS_BIN := echo-dapp.ext2
BINARIES := rootfs.ext2 linux-5.5.19-ctsi-3.bin rom.bin
MACHINE_DIR := machine

.PHONY: console clean

$(MACHINE_DIR): $(DAPP_FS_BIN) $(BINARIES)
	@echo "Building cartesi-machine echo-dapp instance..."
	@if docker inspect $(CONTAINER_NAME) > /dev/null 2>&1; then \
		docker rm -f $(CONTAINER_NAME) > /dev/null; \
	fi
	@docker run \
		--name $(CONTAINER_NAME) \
		--hostname server-manager-env \
		--platform linux/amd64 \
		-v `pwd`:$(CONTAINER_BASE) \
		-w $(CONTAINER_BASE) \
		$(DAPP_SERVER_MANAGER_IMG) $(CONTAINER_BASE)/build-machine.sh
	@docker cp $(CONTAINER_NAME):$(CONTAINER_MACHINE_DIR) $@
	@docker rm -f $(CONTAINER_NAME) > /dev/null
	@echo "$(MACHINE_DIR): OK"

console: $(DAPP_FS_BIN) $(BINARIES)
	@echo "Running cartesi-machine console..."
	@docker run --hostname server-manager-env -it --rm \
		-v `pwd`:$(CONTAINER_BASE) \
		-w $(CONTAINER_BASE) \
		--platform linux/amd64 \
		$(DAPP_SERVER_MANAGER_IMG) $(CONTAINER_BASE)/run-machine-console.sh

$(BINARIES) &:
	@echo "Downloading cartesi-machine rom, kernel and rootfs..."
	@wget -q -nc -i dependencies -P .
	@shasum -c shasumfile

$(DAPP_FS_BIN): echo.py run.sh
	@echo "Building echo-dapp filesystem..."
	@if docker inspect $(CONTAINER_NAME) > /dev/null 2>&1; then \
		docker rm -f $(CONTAINER_NAME) > /dev/null; \
	fi
	@docker run \
		--name $(CONTAINER_NAME) \
		--hostname server-manager-env \
		-v `pwd`:$(CONTAINER_BASE) \
		-w $(CONTAINER_BASE) \
		--platform linux/amd64 \
		$(DAPP_SERVER_MANAGER_IMG) $(CONTAINER_BASE)/build-dapp-fs.sh
	@docker cp $(CONTAINER_NAME):$(CONTAINER_DAPP_FS_BIN) $@
	@docker rm -f $(CONTAINER_NAME) > /dev/null
	@echo "$(DAPP_FS_BIN): OK"

clean:
	@rm -rf $(DAPP_FS_BIN) $(BINARIES) $(MACHINE_DIR)

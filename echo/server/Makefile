DAPP_FS_BIN := echo-dapp.ext2

DAPP_ROOTFS_TAG := 0.8.0
DAPP_ROOTFS_IMG := cartesi/rootfs:$(DAPP_ROOTFS_TAG)

DAPP_SERVER_MANAGER_TAG := 0.1.0
DAPP_SERVER_MANAGER_IMG := cartesi/server-manager:$(DAPP_SERVER_MANAGER_TAG)

CONTAINER_BASE := /opt/cartesi/echo

BINARIES := rootfs.ext2 linux-5.5.19-ctsi-3.bin rom.bin
MACHINE_DIR := ..

.PHONY: console clean

$(MACHINE_DIR)/machine: $(DAPP_FS_BIN) $(BINARIES)
	docker run --hostname server-manager-env -it --rm \
		-v `pwd`:$(CONTAINER_BASE) \
		-w $(CONTAINER_BASE) \
		$(DAPP_SERVER_MANAGER_IMG) $(CONTAINER_BASE)/build-machine.sh
	mv machine $(MACHINE_DIR)

console: $(DAPP_FS_BIN) $(BINARIES)
	@docker run --hostname server-manager-env -it --rm \
		-v `pwd`:$(CONTAINER_BASE) \
		-w $(CONTAINER_BASE) \
		$(DAPP_SERVER_MANAGER_IMG) $(CONTAINER_BASE)/run-machine-console.sh

$(BINARIES) &:
	wget -nc -i dependencies -P .
	shasum -c shasumfile

$(DAPP_FS_BIN): dapp.yaml
	docker run --hostname rootfs-env -it --rm \
		-v `pwd`:$(CONTAINER_BASE) \
		-w $(CONTAINER_BASE) \
		$(DAPP_ROOTFS_IMG) $(CONTAINER_BASE)/build-dapp-fs.sh

dapp.yaml: ../../openapi-interfaces/dapp.yaml
	cp $< $@

clean:
	rm -rf $(DAPP_FS_BIN) $(BINARIES) machine dapp.yaml

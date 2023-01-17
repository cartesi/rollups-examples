# syntax=docker.io/docker/dockerfile:1.4
# layers for caching and versioning
FROM cartesi/toolchain:0.12.0 as toolchain
FROM cartesicorp/server-manager:0.5.0-rv64gc-test as server-manager

# download standard machine drives
FROM busybox as machine-core

WORKDIR /opt/cartesi/share

# download dependencies
COPY dependencies .
COPY shasumfile .
RUN cat dependencies | xargs wget
RUN sha1sum -c shasumfile
# temporary adds
ADD rom.bin . 
ADD linux.bin .

from toolchain as dapp-fs-build
WORKDIR /var/tmp/app_fs/
COPY --from=dapp-build / ./
RUN rm -rf ./proc/* ./sys/* ./dev/*
ADD bootfs.tar.gz /var/tmp/app_fs

# Check /tmp/app_fs size and tar it
RUN <<EOF
tar -cf /dapp.tar --transform='s:^./::g'  --mtime="2022-01-01" --owner=1000 --group=1000 --numeric-owner ./

blocksize=4096
bytes=$(du -bd0 /dapp.tar | cut -f1)
blocks=$(echo "1.2 * ($bytes + $blocksize - 1) / $blocksize" | bc)
genext2fs -fzB $blocksize -i $blocksize -b $blocks -a /dapp.tar /dapp.ext2
truncate -s %4096 /dapp.ext2
EOF


# stage to build the initial cartesi machine
FROM server-manager as machine-server

WORKDIR /opt/cartesi/dapp

# copy dapp ext2 from dapp stage
COPY --from=dapp-fs-build /dapp.ext2 ./dapp.ext2 

# copy rootfs, linux, rom
COPY --from=machine-core /opt/cartesi/share/* .

# build machine
COPY build-machine.sh /usr/local/bin
RUN build-machine.sh /opt/cartesi/share/dapp-bin

# switch back to server-manager workdir
WORKDIR /opt/cartesi/bin


# stage to run machine shell
FROM server-manager as machine-console

WORKDIR /opt/cartesi/dapp

# copy dapp ext2 from stage 1
COPY --from=dapp-fs-build /dapp.ext2 ./dapp.ext2

# copy rootfs, kernel, rom
COPY --from=machine-core /opt/cartesi/share/* .

COPY run-machine-console.sh /usr/local/bin
CMD ["run-machine-console.sh"]


# stage to copy the stored machine
FROM busybox as machine-standalone

WORKDIR /opt/cartesi/share/dapp-bin
COPY --from=machine-server /opt/cartesi/share/dapp-bin .

CMD ["xxd", "-c", "256", "-p", "hash"]

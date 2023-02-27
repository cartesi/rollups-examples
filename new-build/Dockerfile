# syntax=docker.io/docker/dockerfile:1.4
# layers for caching and versioning
FROM cartesi/toolchain:0.13.0 as toolchain
FROM cartesi/server-manager:0.6.0 as server-manager

# download standard machine drives
FROM busybox as machine-core

WORKDIR /opt/cartesi/share

# download dependencies
COPY dependencies .
COPY shasumfile .
RUN cat dependencies | xargs wget
RUN sha1sum -c shasumfile


FROM dapp as normalized-dapp
WORKDIR /
RUN useradd --create-home --user-group --uid 1000 dapp
RUN chown -R 1000:1000 /opt/cartesi/dapp  
RUN apt-get update && apt-get install -y --no-install-recommends busybox-static && rm -rf /var/apt/lists/*

FROM toolchain as dapp-fs-build
WORKDIR /var/tmp/app_fs/
COPY --from=final-dapp / ./
RUN rm -rf ./proc/* ./sys/* ./dev/*
COPY --from=machine-core /opt/cartesi/share/machine-emulator-tools-v0.10.0.tar.gz /var/tmp/app_fs/
RUN tar -xvf machine-emulator-tools-v0.10.0.tar.gz ./
RUN rm machine-emulator-tools-v0.10.0.tar.gz


# Check /tmp/app_fs size and tar it
RUN <<EOF
tar -cf /dapp.tar --transform='s:^./::g'  --mtime="2022-01-01" --format=gnu --numeric-owner ./

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
COPY --from=dapp-fs /dapp.ext2 ./dapp.ext2 

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
COPY --from=dapp-fs /dapp.ext2 ./dapp.ext2

# copy rootfs, kernel, rom
COPY --from=machine-core /opt/cartesi/share/* .

COPY run-machine-console.sh /usr/local/bin
CMD ["run-machine-console.sh"]


# stage to copy the stored machine
FROM busybox as machine-standalone

WORKDIR /opt/cartesi/share/dapp-bin
COPY --from=machine-server /opt/cartesi/share/dapp-bin .

CMD ["xxd", "-c", "256", "-p", "hash"]

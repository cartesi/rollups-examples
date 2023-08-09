# syntax=docker.io/docker/dockerfile:1.4
# layers for caching and versioning
FROM cartesi/toolchain:0.15.0 as toolchain
FROM cartesi/server-manager:0.8.2 as server-manager
FROM cartesi/rollups-hardhat:1.0.0 as rollups-hardhat


# stage to download dependencies
FROM busybox as machine-core

WORKDIR /opt/cartesi/share

COPY dependencies .
COPY shasumfile .
RUN while read DEP; do wget -O $DEP; done < dependencies
RUN sha1sum -c shasumfile


# Deploy contracts locally
FROM rollups-hardhat AS local-deployments-stage

ARG NETWORK=localhost

RUN <<EOF 
if [ "$NETWORK" = "localhost" ] ; then
    echo "Add localhost deployments"
    sh -c "npx hardhat deploy --write true --network hardhat"
else
   mkdir /app/rollups/deployments/hardhat
fi
EOF

ENTRYPOINT [ "/bin/sh" ]



# Download known testnet/mainet deployments
FROM busybox as deployments-stage

WORKDIR /opt/cartesi/share
COPY --from=machine-core opt/cartesi/share/rollups.tgz ./
RUN tar -xzvf ./rollups.tgz 

# stage to wrap the dapp installing resources needed to run inside the Cartesi Machine
FROM dapp as wrapped-stage

WORKDIR /

# normalize date for subsequent operations
ENV SOURCE_DATE_EPOCH=1640995200

# add the required 'dapp' user
RUN useradd --create-home --user-group --uid 2874 dapp
RUN chown -R 2874:2874 /opt/cartesi/dapp

# install busybox
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    busybox-static=1:1.30.1-7ubuntu3 \
    && rm -rf /var/lib/apt/lists/* \
    && find /var/log \( -name '*.log' -o -name '*.log.*' \) -exec truncate -s 0 {} \;

# stage to build the final ext2 filesystem for the dapp
FROM toolchain as fs-stage

WORKDIR /var/tmp/dapp_fs/

# copy wrapped dapp filesystem
COPY --from=wrapped / ./

# add emulator tools
COPY --from=machine-core /opt/cartesi/share/machine-emulator-tools.tar.gz /var/tmp/dapp_fs/
RUN tar -xvf machine-emulator-tools.tar.gz ./
RUN rm machine-emulator-tools.tar.gz

#add deployments 
COPY --from=deployments /opt/cartesi/share/package/deployments* /var/tmp/dapp_fs/opt/cartesi/dapp/deployments/
COPY --from=local-deployments /app/rollups/deployments/hardhat/* /var/tmp/dapp_fs/opt/cartesi/dapp/deployments/localhost/

# build tar normalizing file timestamps and create final ext2 file with the appropriate size
RUN <<EOF
tar -cf /dapp.tar --transform='s:^./::g'  --mtime="2022-01-01" --format=gnu --numeric-owner ./

blocksize=4096
bytes=$(($(wc -c < "/dapp.tar") +0))
bcargs="$(cat <<- EOF
	define max(a, b) { return (a > b) * a + (a <= b) * b }
	max(8, 1.5 * ($bytes + $blocksize - 1) / $blocksize)
	EOF
)"
blocks=$(echo "$bcargs" | bc)
genext2fs -fzB $blocksize -i $blocksize -b $blocks -a /dapp.tar /dapp.ext2
truncate -s %4096 /dapp.ext2
EOF


# stage to build the initial cartesi machine
FROM server-manager as build-server-stage

ARG NETWORK=localhost

WORKDIR /opt/cartesi/dapp

# copy dapp ext2 from fs stage
COPY --from=fs /dapp.ext2 ./dapp.ext2

# copy machine dependencies (rom, linux kernel)
COPY --from=machine-core /opt/cartesi/share/rom.bin .
COPY --from=machine-core /opt/cartesi/share/linux.bin .

# create var dir with correct permissions
USER root
RUN mkdir -p /var/opt/cartesi
RUN chown cartesi:cartesi /var/opt/cartesi
USER cartesi

# build machine
COPY build-machine.sh /usr/local/bin
RUN mkdir -p /var/opt/cartesi/machine-snapshots
RUN build-machine.sh /var/opt/cartesi/machine-snapshots/0_0 $NETWORK

FROM server-manager as server-stage

WORKDIR /opt/cartesi/bin
COPY --from=build-server-stage --chown=cartesi:cartesi /var/opt/cartesi/machine-snapshots/0_0 /var/opt/cartesi/machine-snapshots/0_0
RUN ln -s /var/opt/cartesi/machine-snapshots/0_0 /var/opt/cartesi/machine-snapshots/latest

# stage to run machine shell
FROM server-manager as console-stage

WORKDIR /opt/cartesi/dapp

# copy dapp ext2 from fs stage
COPY --from=fs /dapp.ext2 ./dapp.ext2

# copy machine dependencies (rom, linux kernel)
COPY --from=machine-core /opt/cartesi/share/rom.bin .
COPY --from=machine-core /opt/cartesi/share/linux.bin .

COPY run-machine-console.sh /usr/local/bin
CMD ["run-machine-console.sh"]


# stage to copy the stored machine
FROM busybox as machine-stage

WORKDIR /var/opt/cartesi/machine-snapshots
COPY --from=server-stage /var/opt/cartesi/machine-snapshots .
CMD ["xxd", "-c", "256", "-p", "0_0/hash"]

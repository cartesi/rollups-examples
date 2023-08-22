# syntax=docker.io/docker/dockerfile:1.4
# layers for caching and versioning
FROM cartesi/toolchain:0.15.0 as toolchain
FROM cartesi/rootfs:0.18.0 as rootfs
FROM cartesi/server-manager:0.8.2 as server-manager
FROM cartesi/rollups-hardhat:1.0.0 as rollups-hardhat


FROM rootfs as toolchain-python

ENV DEBIAN_FRONTEND=noninteractive
RUN apt update \
    && apt install -y \
    libncurses-dev \
    libgdbm-dev \
    libz-dev \
    tk-dev \
    libsqlite3-dev \
    libreadline-dev \
    liblzma-dev \
    libffi-dev \
    libssl-dev

ENV PYTHON_VERSION=3.10
ENV PYTHON_VERSION_FULL=3.10.1
ENV BUILD_PYTHON_PREFIX=/opt/build-python
ENV HOST_PYTHON_PREFIX=/mnt/python-dapp

# Download Python source
WORKDIR /tmp
RUN wget https://www.python.org/ftp/python/$PYTHON_VERSION_FULL/Python-$PYTHON_VERSION_FULL.tgz
RUN tar zxfv Python-$PYTHON_VERSION_FULL.tgz

# Build build-python from source
RUN cp -r Python-$PYTHON_VERSION_FULL build-python
WORKDIR /tmp/build-python
RUN ./configure --prefix=$BUILD_PYTHON_PREFIX
RUN make -j$(nproc)
RUN make install

ENV PATH=$BUILD_PYTHON_PREFIX/bin:$PATH

# Build host-python
WORKDIR /tmp
RUN cp -r Python-$PYTHON_VERSION_FULL host-python
WORKDIR /tmp/host-python
RUN CPPFLAGS="-I/opt/riscv/rootfs/buildroot/work/staging/usr/include" \
    LDFLAGS="-L/opt/riscv/rootfs/buildroot/work/staging/usr/lib" \
    ./configure \
    --enable-shared \
    --enable-optimizations \
    --prefix=$HOST_PYTHON_PREFIX \
    --host=riscv64-cartesi-linux-gnu \
    --build=x86_64-linux-gnu \
    --without-ensurepip \
    --disable-test-modules \
    ac_cv_buggy_getaddrinfo=no \
    ac_cv_file__dev_ptmx=yes \
    ac_cv_file__dev_ptc=no
WORKDIR /tmp/host-python
RUN make -j$(nproc)
RUN make install

WORKDIR /tmp
RUN pip3 install crossenv
RUN rm -rf Python-$PYTHON_VERSION_FULL*


# download standard machine drives
FROM busybox as machine-core

WORKDIR /opt/cartesi/share

# download dependencies
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

# stage to build the dapp ext2 filesystem
FROM toolchain as fs-stage

# install jq
RUN <<EOF
apt-get update
DEBIAN_FRONTEND="noninteractive" apt-get install -y jq
rm -rf /var/lib/apt/lists/*
EOF

WORKDIR /opt/cartesi/dapp
COPY --from=dapp /opt/cartesi/dapp .
COPY --from=deployments /opt/cartesi/share/package/deployments ./deployments
COPY --from=local-deployments /app/rollups/deployments/hardhat/* ./deployments/localhost/

COPY build-dapp-fs.sh /usr/local/bin
COPY default.json /opt/cartesi/

RUN build-dapp-fs.sh /opt/cartesi/default.json dapp.json dapp.ext2


# stage to build the initial cartesi machine
FROM server-manager as server-stage

ARG NETWORK=localhost

WORKDIR /opt/cartesi/dapp

# copy dapp ext2 from fs stage
COPY --from=fs /opt/cartesi/dapp/dapp.ext2 .

# copy machine dependencies (rom, linux kernel, rootfs)
COPY --from=machine-core /opt/cartesi/share/rom.bin .
COPY --from=machine-core /opt/cartesi/share/linux.bin .
COPY --from=machine-core /opt/cartesi/share/rootfs.ext2 .

# create var dir with correct permissions
USER root
RUN mkdir -p /var/opt/cartesi
RUN chown cartesi:cartesi /var/opt/cartesi
USER cartesi

# build machine
COPY build-machine.sh /usr/local/bin
RUN mkdir -p /var/opt/cartesi/machine-snapshots
RUN build-machine.sh /var/opt/cartesi/machine-snapshots/0_0 $NETWORK
RUN ln -s /var/opt/cartesi/machine-snapshots/0_0 /var/opt/cartesi/machine-snapshots/latest

# switch back to server-manager workdir
WORKDIR /opt/cartesi/bin


# stage to run machine shell
FROM server-manager as console-stage

WORKDIR /opt/cartesi/dapp

# copy dapp ext2 from fs stage
COPY --from=fs /opt/cartesi/dapp/dapp.ext2 .

# copy machine dependencies (rom, linux kernel, rootfs)
COPY --from=machine-core /opt/cartesi/share/* .

COPY run-machine-console.sh /usr/local/bin
CMD ["run-machine-console.sh"]


# stage to copy the stored machine
FROM busybox as machine-stage

WORKDIR /var/opt/cartesi/machine-snapshots
COPY --from=server /var/opt/cartesi/machine-snapshots .

CMD ["xxd", "-c", "256", "-p", "0_0/hash"]

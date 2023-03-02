# syntax=docker.io/docker/dockerfile:1.4
# layers for caching and versioning
FROM cartesi/toolchain:0.13.0 as toolchain
FROM cartesi/rootfs:0.16.0 as rootfs
FROM cartesi/server-manager:0.6.0 as server-manager

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
COPY build-dapp-fs.sh /usr/local/bin
COPY default.json /opt/cartesi/

RUN build-dapp-fs.sh /opt/cartesi/default.json dapp.json dapp.ext2


# stage to build the initial cartesi machine
FROM server-manager as server-stage

WORKDIR /opt/cartesi/dapp

# copy dapp ext2 from fs stage
COPY --from=fs-stage /opt/cartesi/dapp/dapp.ext2 .

# copy machine dependencies (rom, linux kernel, rootfs)
COPY --from=machine-core /opt/cartesi/share/* .

# build machine
COPY build-machine.sh /usr/local/bin
RUN build-machine.sh /opt/cartesi/share/dapp-bin

# switch back to server-manager workdir
WORKDIR /opt/cartesi/bin


# stage to run machine shell
FROM server-manager as console-stage

WORKDIR /opt/cartesi/dapp

# copy dapp ext2 from fs stage
COPY --from=fs-stage /opt/cartesi/dapp/dapp.ext2 .

# copy machine dependencies (rom, linux kernel, rootfs)
COPY --from=machine-core /opt/cartesi/share/* .

COPY run-machine-console.sh /usr/local/bin
CMD ["run-machine-console.sh"]


# stage to copy the stored machine
FROM busybox as machine-stage

WORKDIR /opt/cartesi/share/dapp-bin
COPY --from=server-stage /opt/cartesi/share/dapp-bin .

CMD ["xxd", "-c", "256", "-p", "hash"]

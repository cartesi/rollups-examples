#!/usr/bin/env bash
# Build the Python dependencies and generate a image with the echo-dapp.
# The script must run inside the rootfs docker container.

PYTHON_VERSION=3.10
PYTHON_VERSION_FULL=3.10.1
BUILD_PYTHON_PREFIX=/opt/build-python
HOST_PYTHON_PREFIX=/mnt/echo-dapp

# Install dependencies to build Python from source
apt update
apt install -y libncurses-dev libgdbm-dev libz-dev tk-dev libsqlite3-dev libreadline-dev liblzma-dev libffi-dev libssl-dev

# Download Python source
cd /tmp
wget https://www.python.org/ftp/python/$PYTHON_VERSION_FULL/Python-$PYTHON_VERSION_FULL.tgz
tar zxfv Python-$PYTHON_VERSION_FULL.tgz

# Build build-python from source
cp -r Python-$PYTHON_VERSION_FULL build-python
cd build-python
./configure --prefix=$BUILD_PYTHON_PREFIX
make -j$(nproc)
make install
cd -

# Setup path for build python
export PATH=$BUILD_PYTHON_PREFIX/bin:$PATH

# Build host-python
cp -r Python-$PYTHON_VERSION_FULL host-python
cd host-python
CPPFLAGS="-I/opt/riscv/rootfs/buildroot/work/staging/usr/include" \
LDFLAGS="-L/opt/riscv/rootfs/buildroot/work/staging/usr/lib" \
./configure \
    --enable-shared \
    --enable-optimizations \
    --prefix=$HOST_PYTHON_PREFIX \
    --host=riscv64-cartesi-linux-gnu \
    --build=x86_64-linux-gnu \
    --without-ensurepip \
    ac_cv_buggy_getaddrinfo=no \
    ac_cv_file__dev_ptmx=yes \
    ac_cv_file__dev_ptc=no
make -j$(nproc)
make install
cd -

# Install crossenv
pip3 install crossenv

# Setup crossenv
cd /tmp
python3 -m crossenv $HOST_PYTHON_PREFIX/bin/python3 venv
. venv/bin/activate

# Build dependencies
pip3 install -r /opt/cartesi/echo/requirements.txt

# Copy compiled libraries to echo-dapp volume
cp -r /tmp/venv/cross/lib/python$PYTHON_VERSION/site-packages/* $HOST_PYTHON_PREFIX/lib/python$PYTHON_VERSION/site-packages/

# Build http-dispatcher
cp -a /opt/cartesi/echo/tools/linux/rollup/http/http-dispatcher /opt/riscv/http-dispatcher
cd /opt/riscv/http-dispatcher
source ./environment.sh
cargo +nightly build -Z build-std=std,core,alloc,panic_abort,proc_macro --target riscv64ima-cartesi-linux-gnu.json --release

# Add echo dapp
mkdir -p $HOST_PYTHON_PREFIX/echo-dapp/
cp /opt/cartesi/echo/echo.py $HOST_PYTHON_PREFIX/echo-dapp
cp /opt/cartesi/echo/dapp.yaml $HOST_PYTHON_PREFIX/echo-dapp
cp /opt/cartesi/echo/run.sh $HOST_PYTHON_PREFIX/echo-dapp
cp /opt/riscv/http-dispatcher/target/riscv64ima-cartesi-linux-gnu/release/http-dispatcher $HOST_PYTHON_PREFIX/bin

# Generate ext2 file
cd /mnt
genext2fs -f -i 512 -b 524288 -d echo-dapp echo-dapp.ext2
mv echo-dapp.ext2 /opt/cartesi/echo

# syntax=docker.io/docker/dockerfile:1.4
FROM cartesi/toolchain:0.11.0 as dapp-build

WORKDIR /opt/cartesi/dapp

COPY . .
RUN cargo build -Z build-std=std,core,alloc,panic_abort,proc_macro --target riscv64ima-cartesi-linux-gnu.json --release

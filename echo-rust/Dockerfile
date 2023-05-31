# syntax=docker.io/docker/dockerfile:1.4
FROM cartesi/toolchain:0.14.0

WORKDIR /opt/cartesi/dapp

COPY . .
RUN cargo build -Z build-std=std,core,alloc,panic_abort,proc_macro --target riscv64g-cartesi-linux-gnu.json --release

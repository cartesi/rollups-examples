# syntax=docker.io/docker/dockerfile:1.4
FROM cartesi/toolchain:0.14.0

WORKDIR /opt/cartesi/dapp
COPY . .

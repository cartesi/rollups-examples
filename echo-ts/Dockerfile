# syntax=docker.io/docker/dockerfile:1.4
FROM toolchain-ts

WORKDIR /opt/cartesi/dapp
COPY . .

RUN cd server/  \
    && npm ci  \
    && npm run build \
    && rm -rf node_modules src

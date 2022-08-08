# syntax=docker.io/docker/dockerfile:1.4
FROM cartesi/toolchain:0.11.0 as dapp-build
FROM node:16.15.0-alpine3.15 as base-build
WORKDIR /opt/cartesi/dapp
COPY . .
RUN yarn
RUN yarn build

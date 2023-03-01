# syntax=docker.io/docker/dockerfile:1.4
FROM node:16.15.0-alpine3.15
WORKDIR /opt/cartesi/dapp
COPY . .
RUN yarn
RUN yarn build

# syntax=docker.io/docker/dockerfile:1.4
FROM --platform=linux/riscv64 riscv64/ubuntu:22.04

WORKDIR /opt/cartesi/dapp

RUN apt-get update \
    && apt-get install -y ruby ruby-dev build-essential \
    && gem install json http \
    && gem cleanup \
    && rm -rf /usr/lib/ruby/gems/*/cache/* \
    && rm -rf /var/apt/lists/*

COPY echo.rb .
COPY entrypoint.sh .
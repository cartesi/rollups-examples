# syntax=docker.io/docker/dockerfile:1.4
FROM --platform=linux/riscv64 cartesi/toolchain:0.13.0

WORKDIR /opt/cartesi/dapp
COPY . .

RUN apt-get update \
    && apt-get install -y ruby ruby-dev \
    && gem install json http \
    && gem cleanup \
    && rm -rf /usr/lib/ruby/gems/*/cache/* \
    && rm -rf /var/apt/lists/*
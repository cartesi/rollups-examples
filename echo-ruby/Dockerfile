# syntax=docker.io/docker/dockerfile:1.4

# build stage: includes resources necessary for installing dependencies

# Here the image's platform does not necessarily have to be riscv64.
# If any needed dependencies rely on native binaries, you must use
# a riscv64 image such as riscv64/ubuntu:22.04 for the build stage,
# to ensure that the appropriate binaries will be generated.
FROM --platform=linux/riscv64 riscv64/ubuntu:22.04 as build-stage

WORKDIR /opt/cartesi/dapp

COPY Gemfile .
COPY Gemfile.lock .

ENV GEM_HOME="/opt/cartesi/dapp/bundle"
ENV PATH=$GEM_HOME/bin:$GEM_HOME/gems/bin:$PATH

RUN apt-get update \
    && apt-get install -y ruby ruby-dev build-essential \
    && gem install bundler \
    && bundle install \
    && rm -rf /opt/cartesi/dapp/bundle/cache/*

# runtime stage: produces final image that will be executed

# Here the image's platform must be riscv64.
# Give preference to small base images, which lead to better start-up
# performance when loading the Cartesi Machine.
FROM --platform=linux/riscv64 riscv64/ubuntu:jammy
WORKDIR /opt/cartesi/dapp

ENV GEM_HOME="/opt/cartesi/dapp/bundle"
ENV PATH=$GEM_HOME/bin:$GEM_HOME/gems/bin:$PATH

RUN apt-get update \
    && apt-get install -y ruby \
    && rm -rf /var/apt/lists/* \
    && rm -rf /usr/lib/ruby/gems/*/cache/*
COPY --from=build-stage /opt/cartesi/dapp ./

COPY echo.rb .
COPY entrypoint.sh .
# syntax=docker.io/docker/dockerfile:1.4
FROM --platform=linux/riscv64 cartesi/python:3.10-slim-jammy
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    sqlite3=3.37.2-2ubuntu0.1 \
    && rm -rf /var/apt/lists/*

WORKDIR /opt/cartesi/dapp
COPY . .

RUN pip install -r requirements.txt

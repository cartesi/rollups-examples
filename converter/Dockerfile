# syntax=docker.io/docker/dockerfile:1.4
FROM --platform=riscv64 cartesi/python:3.10-jammy

WORKDIR /opt/cartesi/dapp
COPY . .

RUN pip install -r requirements.txt

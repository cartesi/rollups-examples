# syntax=docker.io/docker/dockerfile:1.4
FROM --platform=riscv64 cartesi/python:jammy as dapp

WORKDIR /opt/cartesi/dapp
COPY . .
RUN pip install -r requirements.txt
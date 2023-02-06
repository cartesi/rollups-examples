# syntax=docker.io/docker/dockerfile:1.4
#FROM --platform=riscv64 ghcr.io/cartesi-corp/python:3.11.1-jammy as dapp
FROM riscv64/ubuntu:jammy
RUN apt update && apt install -y python3 python3-pip

WORKDIR /opt/cartesi/dapp
COPY . .

RUN pip install -r requirements.txt

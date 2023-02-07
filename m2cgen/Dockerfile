# syntax=docker.io/docker/dockerfile:1.4
FROM python:3.8.10 as model

WORKDIR /usr/src/app
COPY ./model .
RUN pip3 install -r requirements.txt
RUN python3 build_model.py

#FROM --platform=riscv64 ghcr.io/cartesi-corp/python:3.11.1-jammy as dapp
FROM riscv64/ubuntu:jammy
RUN apt update && apt install -y python3 python3-pip

WORKDIR /opt/cartesi/dapp
COPY . .
COPY --from=model /usr/src/app/model.py .
RUN pip3 install -r requirements.txt

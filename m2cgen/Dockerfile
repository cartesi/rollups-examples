# syntax=docker.io/docker/dockerfile:1.4

# build stage: generates model
FROM python:3.8.10 as model

WORKDIR /usr/src/app
COPY ./model .
RUN pip3 install -r requirements.txt
RUN python3 build_model.py

# runtime stage: produces final image that will be executed
FROM --platform=linux/riscv64 cartesi/python:3.10-slim-jammy

WORKDIR /opt/cartesi/dapp

COPY ./requirements.txt .
RUN pip install -r requirements.txt --no-cache \
    && find /usr/local/lib -type d -name __pycache__ -exec rm -r {} +

COPY ./entrypoint.sh .
COPY ./m2cgen.py .

COPY --from=model /usr/src/app/model.py .

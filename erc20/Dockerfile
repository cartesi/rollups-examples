# syntax=docker.io/docker/dockerfile:1.4
FROM toolchain-python

WORKDIR /opt/cartesi/dapp
COPY . .

RUN <<EOF
python3 -m crossenv $(which python3) .crossenv
. ./.crossenv/bin/activate
pip install -r requirements.txt
EOF

# syntax=docker.io/docker/dockerfile:1.4

# build stage: includes resources necessary for installing dependencies
FROM --platform=linux/riscv64 cartesi/python:3.10-slim-jammy as build-stage
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    build-essential=12.9ubuntu3 \
    && rm -rf /var/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .

RUN pip install -r requirements.txt

# Download Nix and install it into the system.
RUN apt-get update && apt-get install -y xz-utils curl
COPY nix-tarball ./nix-tarball
RUN addgroup --gid 30000 --system nixbld \
    && for i in $(seq 1 30); do adduser --system --disabled-password --home /var/empty --gecos "Nix build user $i" --uid $((30000 + i)) --ingroup nixbld nixbld$i ; done \
    && mkdir -m 0755 /etc/nix \
    && echo 'sandbox = false' > /etc/nix/nix.conf \
    && echo "build-users-group =" > /etc/nix/nix.conf \
    && echo "extra-experimental-features = nix-command flakes" > /etc/nix/nix.conf \
    # https://github.com/hercules-ci/hercules-ci-agent/issues/183
    && mkdir -m 0755 /nix && USER=root sh nix-tarball/install \
    && ln -s /nix/var/nix/profiles/default/etc/profile.d/nix.sh /etc/profile.d/ \
    # && rm -r /nix-${NIX_VERSION}-$(uname -m)-linux* \
    && rm -rf /var/cache/apk/* \
    && /nix/var/nix/profiles/default/bin/nix-collect-garbage --delete-old \
    && /nix/var/nix/profiles/default/bin/nix-store --optimise \
    && /nix/var/nix/profiles/default/bin/nix-store --verify --check-contents \
    
RUN echo "$PATH:/nix/store/2qzfvsqb9afhb73cc3yfg8hk2xpxcy47-nix-2.16.0pre20230512_dirty-riscv64-unknown-linux-gnu/bin" > /etc/environment

ONBUILD ENV \
    ENV=/etc/profile \
    USER=root \
    PATH=/nix/var/nix/profiles/default/bin:/nix/var/nix/profiles/default/sbin:/bin:/sbin:/usr/bin:/usr/sbin \
    GIT_SSL_CAINFO=/etc/ssl/certs/ca-certificates.crt \
    NIX_SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt

ENV \
    ENV=/etc/profile \
    USER=root \
    PATH=/nix/var/nix/profiles/default/bin:/nix/var/nix/profiles/default/sbin:/bin:/sbin:/usr/bin:/usr/sbin \
    GIT_SSL_CAINFO=/etc/ssl/certs/ca-certificates.crt \
    NIX_SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt \
    NIX_PATH=/nix/var/nix/profiles/per-user/root/channels

# runtime stage: produces final image that will be executed
FROM --platform=linux/riscv64 cartesi/python:3.10-slim-jammy

COPY --from=build-stage /opt/venv /opt/venv

WORKDIR /opt/cartesi/dapp
COPY ./entrypoint.sh .
COPY ./nix.py .

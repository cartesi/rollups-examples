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

# runtime stage: produces final image that will be executed
FROM --platform=linux/riscv64 cartesi/python:3.10-slim-jammy

COPY --from=build-stage /opt/venv /opt/venv

# Download Nix and install it into the system.
RUN apt-get update && apt-get install -y xz-utils curl
COPY nix-tarball.tar.xz ./nix-tarball.tar.xz
RUN tar -xf nix-tarball.tar.xz
RUN addgroup --gid 30000 --system nixbld \
    && for i in $(seq 1 30); do adduser --system --disabled-password --home /var/empty --gecos "Nix build user $i" --uid $((30000 + i)) --ingroup nixbld nixbld$i ; done \
    && mkdir -m 0755 /etc/nix \
    && echo 'sandbox = true' > /etc/nix/nix.conf \
    && echo "build-users-group =" >> /etc/nix/nix.conf \
    && echo "extra-experimental-features = nix-command flakes" >> /etc/nix/nix.conf
# https://github.com/hercules-ci/hercules-ci-agent/issues/183
RUN mkdir -m 0755 /nix && USER=root sh nix-tarball/install --no-daemon \
    && ln -s /nix/var/nix/profiles/default/etc/profile.d/nix.sh /etc/profile.d/ \
    && rm -rf /var/cache/apk/* \
    && /nix/var/nix/profiles/default/bin/nix-collect-garbage --delete-old \
    && /nix/var/nix/profiles/default/bin/nix-store --optimise \
    && /nix/var/nix/profiles/default/bin/nix-store --verify --check-contents
RUN rm nix-tarball.tar.xz \
    && rm -r /nix-tarball

# FIXME: add nix to the path in the right way?
RUN echo "$PATH:/nix/store/2qzfvsqb9afhb73cc3yfg8hk2xpxcy47-nix-2.16.0pre20230512_dirty-riscv64-unknown-linux-gnu/bin" > /etc/environment
ENV PATH="${PATH}:/nix/store/2qzfvsqb9afhb73cc3yfg8hk2xpxcy47-nix-2.16.0pre20230512_dirty-riscv64-unknown-linux-gnu/bin"

RUN chown -R 2874:2874 /nix

RUN apt-get install -y jq
# TODO remove the flake in favor of a complex non dependency free application
# COPY hello-fo-drvs.txt ./hello-fo-drvs.txt
# RUN nix derivation show -r nixpkgs#hello | jq -r '.[] | select(.outputs.out.hash and .env.urls) | .env.urls' | uniq | sort > ./hello-fo-drvs.txt
# RUN for url in $(cat ./hello-fo-drvs.txt) ; do nix-prefetch-url $url; done

COPY flake ./flake
RUN chown -R 2874:2874 ./flake
# RUN cd flake && nix build .# -L && nix store delete $(readlink ./result)

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

WORKDIR /opt/cartesi/dapp
COPY ./entrypoint.sh .
COPY ./nix.py .

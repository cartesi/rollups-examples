FROM node:16-buster-slim
ARG DAPP_NAME

RUN [ -z "$DAPP_NAME" ] && echo "DAPP_NAME is required" && exit 1 || true

# install git
RUN apt-get update && DEBIAN_FRONTEND="noninteractive" apt-get install -y \
    build-essential git python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# copy machines
COPY $DAPP_NAME/machine ./$DAPP_NAME/machine

# build to bring node_modules
WORKDIR /app/contracts
COPY ["contracts/package.json", "contracts/yarn.lock", "./"]
RUN yarn install --non-interactive

# build app
COPY contracts .
RUN yarn install --non-interactive

# expose hardhat node port
EXPOSE 8545

WORKDIR /app/contracts
ENTRYPOINT ["npx", "hardhat"]
CMD ["node"]

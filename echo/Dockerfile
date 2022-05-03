FROM node:16-buster-slim

# install git
RUN apt-get update && DEBIAN_FRONTEND="noninteractive" apt-get install -y \
    build-essential git python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# copy machine
WORKDIR /app/machine
COPY machine .

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

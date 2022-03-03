FROM node:16-buster-slim

# install git
RUN apt-get update && DEBIAN_FRONTEND="noninteractive" apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# build to bring node_modules
COPY ["package.json", "yarn.lock", "./"]
RUN yarn install --non-interactive

# build app
COPY . .
RUN yarn install --non-interactive

# expose hardhat node port
EXPOSE 8545

ENTRYPOINT ["npx", "hardhat"]
CMD ["node"]

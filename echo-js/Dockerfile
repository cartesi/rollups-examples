# syntax=docker.io/docker/dockerfile:1.4

# build stage: includes resources necessary for installing dependencies

# Here the image's platform does not necessarily have to be riscv64.
# If any needed dependencies rely on native binaries, you must use 
# a riscv64 image such as cartesi/node:19-jammy for the build stage,
# to ensure that the appropriate binaries will be generated.
FROM node:19-bullseye  as build-stage
WORKDIR /opt/cartesi/dapp
COPY . .
RUN yarn
RUN yarn build


# runtime stage: produces final image that will be executed

# Here the image's platform must be riscv64.
# Give preference to small base images, which lead to better start-up
# performance when loading the Cartesi Machine.
FROM --platform=linux/riscv64 cartesi/node:19-jammy-slim
WORKDIR /opt/cartesi/dapp
COPY --from=build-stage /opt/cartesi/dapp/dist ./dist/
COPY ./entrypoint.sh ./

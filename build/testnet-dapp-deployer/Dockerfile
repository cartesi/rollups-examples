# syntax=docker.io/docker/dockerfile:1.4
FROM cartesi/rollups-cli:1.0.0

RUN apk update && apk add jq

COPY deploy.sh .

ENTRYPOINT [ "./deploy.sh" ]

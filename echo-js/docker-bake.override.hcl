
target "dapp" {
  # default context is "."
  # default dockerfile is "Dockerfile"
}

target "server" {
  tags = ["cartesi/dapp:echo-js-devel-server"]
}

target "console" {
  tags = ["cartesi/dapp:echo-js-devel-console"]
}

target "machine" {
  tags = ["cartesi/dapp:echo-js-devel-machine"]
}

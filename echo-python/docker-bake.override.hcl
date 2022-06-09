
target "dapp" {
  # default context is "."
  # default dockerfile is "Dockerfile"
}

target "server" {
  tags = ["cartesi/dapp-echo-python-server"]
}

target "console" {
  tags = ["cartesi/dapp-echo-python-console"]
}

target "machine" {
  tags = ["cartesi/dapp-echo-python-machine"]
}

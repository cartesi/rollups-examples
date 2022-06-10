
target "dapp" {
  # default context is "."
  # default dockerfile is "Dockerfile"
}

target "server" {
  tags = ["cartesi/dapp:echo-python-devel-server"]
}

target "console" {
  tags = ["cartesi/dapp:echo-python-devel-console"]
}

target "machine" {
  tags = ["cartesi/dapp:echo-python-devel-machine"]
}

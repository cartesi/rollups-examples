
target "dapp" {
}

target "server" {
  tags = ["cartesi/dapp:converter-devel-server"]
}

target "console" {
  tags = ["cartesi/dapp:converter-devel-console"]
}

target "machine" {
  tags = ["cartesi/dapp:converter-devel-machine"]
}

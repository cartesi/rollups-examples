
target "dapp" {
}

target "server" {
  tags = ["cartesi/dapp:m2cgen-devel-server"]
}

target "console" {
  tags = ["cartesi/dapp:m2cgen-devel-console"]
}

target "machine" {
  tags = ["cartesi/dapp:m2cgen-devel-machine"]
}

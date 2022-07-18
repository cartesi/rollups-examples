
target "dapp" {
}

target "server" {
  tags = ["cartesi/dapp:template-devel-server"]
}

target "console" {
  tags = ["cartesi/dapp:template-devel-console"]
}

target "machine" {
  tags = ["cartesi/dapp:template-devel-machine"]
}


target "dapp" {
  contexts = {
    toolchain-python = "target:toolchain-python"
  }
}

target "server" {
  tags = ["cartesi/dapp:auction-devel-server"]
}

target "console" {
  tags = ["cartesi/dapp:auction-devel-console"]
}

target "machine" {
  tags = ["cartesi/dapp:auction-devel-machine"]
}

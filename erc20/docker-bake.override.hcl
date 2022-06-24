
target "dapp" {
  contexts = {
    toolchain-python = "target:toolchain-python"
  }
}

target "server" {
  tags = ["cartesi/dapp:erc20-devel-server"]
}

target "console" {
  tags = ["cartesi/dapp:erc20-devel-console"]
}

target "machine" {
  tags = ["cartesi/dapp:erc20-devel-machine"]
}

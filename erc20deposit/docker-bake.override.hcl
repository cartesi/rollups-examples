
target "dapp" {
  contexts = {
    toolchain-python = "target:toolchain-python"
  }
}

target "server" {
  tags = ["cartesi/dapp:erc20deposit-devel-server"]
}

target "console" {
  tags = ["cartesi/dapp:erc20deposit-devel-console"]
}

target "machine" {
  tags = ["cartesi/dapp:erc20deposit-devel-machine"]
}

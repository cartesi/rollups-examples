
target "dapp" {
  contexts = {
    toolchain-python = "target:toolchain-python"
  }
}

target "server" {
  tags = ["cartesi/dapp-erc20deposit-server"]
}

target "console" {
  tags = ["cartesi/dapp-erc20deposit-console"]
}

target "hardhat" {
  tags = ["cartesi/dapp-erc20deposit-hardhat"]
  args = {
    DAPP_NAME = "erc20deposit",
  }
}

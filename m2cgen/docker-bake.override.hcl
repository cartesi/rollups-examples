
target "dapp" {
}

target "server" {
  tags = ["cartesi/dapp-m2cgen-server"]
}

target "console" {
  tags = ["cartesi/dapp-m2cgen-console"]
}

target "hardhat" {
  tags = ["cartesi/dapp-m2cgen-hardhat"]
  args = {
    DAPP_NAME = "m2cgen",
  }
}

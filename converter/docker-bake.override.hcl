
target "dapp" {
}

target "server" {
  tags = ["cartesi/dapp-converter-server"]
}

target "console" {
  tags = ["cartesi/dapp-converter-console"]
}

target "hardhat" {
  tags = ["cartesi/dapp-converter-hardhat"]
  args = {
    DAPP_NAME = "converter",
  }
}


target "dapp" {
}

target "server" {
  tags = ["cartesi/dapp-template-server"]
}

target "console" {
  tags = ["cartesi/dapp-template-console"]
}

target "hardhat" {
  tags = ["cartesi/dapp-template-hardhat"]
  args = {
    DAPP_NAME = "template",
  }
}

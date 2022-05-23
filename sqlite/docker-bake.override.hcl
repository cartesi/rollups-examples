
target "dapp" {
}

target "server" {
  tags = ["cartesi/dapp-sqlite-server"]
}

target "console" {
  tags = ["cartesi/dapp-sqlite-console"]
}

target "hardhat" {
  tags = ["cartesi/dapp-sqlite-hardhat"]
  args = {
    DAPP_NAME = "sqlite",
  }
}

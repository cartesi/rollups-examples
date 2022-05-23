
target "dapp" {
}

target "server" {
  tags = ["cartesi/dapp-knn-server"]
}

target "console" {
  tags = ["cartesi/dapp-knn-console"]
}

target "hardhat" {
  tags = ["cartesi/dapp-knn-hardhat"]
  args = {
    DAPP_NAME = "knn",
  }
}

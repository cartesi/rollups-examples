
target "dapp" {
}

target "server" {
  tags = ["cartesi/dapp-echo-cpp-server"]
}

target "console" {
  tags = ["cartesi/dapp-echo-cpp-console"]
}

target "hardhat" {
  tags = ["cartesi/dapp-echo-cpp-hardhat"]
  args = {
    DAPP_NAME = "echo-cpp",
  }
}

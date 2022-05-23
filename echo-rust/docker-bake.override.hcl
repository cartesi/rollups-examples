
target "dapp" {
}

target "fs" {
  tags = ["cartesi/dapp-echo-rust-fs"]
}

target "server" {
  tags = ["cartesi/dapp-echo-rust-server"]
}

target "console" {
  tags = ["cartesi/dapp-echo-rust-console"]
}

target "hardhat" {
  tags = ["cartesi/dapp-echo-rust-hardhat"]
  args = {
    DAPP_NAME = "echo-rust",
  }
}

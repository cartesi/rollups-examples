
target "dapp" {
}

target "server" {
  tags = ["cartesi/dapp-echo-rust-server"]
}

target "console" {
  tags = ["cartesi/dapp-echo-rust-console"]
}

target "machine" {
  tags = ["cartesi/dapp-echo-rust-machine"]
}

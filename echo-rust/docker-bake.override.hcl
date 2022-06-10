
target "dapp" {
}

target "server" {
  tags = ["cartesi/dapp:echo-rust-devel-server"]
}

target "console" {
  tags = ["cartesi/dapp:echo-rust-devel-console"]
}

target "machine" {
  tags = ["cartesi/dapp:echo-rust-devel-machine"]
}

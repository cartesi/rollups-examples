
target "dapp" {
}

target "server" {
  tags = ["cartesi/dapp:echo-low-level-devel-server"]
}

target "console" {
  tags = ["cartesi/dapp:echo-low-level-devel-console"]
}

target "machine" {
  tags = ["cartesi/dapp:echo-low-level-devel-machine"]
}

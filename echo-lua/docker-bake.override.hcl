
target "dapp" {
}

target "server" {
  tags = ["cartesi/dapp:echo-lua-devel-server"]
}

target "console" {
  tags = ["cartesi/dapp:echo-lua-devel-console"]
}

target "machine" {
  tags = ["cartesi/dapp:echo-lua-devel-machine"]
}

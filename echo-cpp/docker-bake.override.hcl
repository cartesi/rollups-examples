
target "dapp" {
}

target "server" {
  tags = ["cartesi/dapp:echo-cpp-devel-server"]
}

target "console" {
  tags = ["cartesi/dapp:echo-cpp-devel-console"]
}

target "machine" {
  tags = ["cartesi/dapp:echo-cpp-devel-machine"]
}

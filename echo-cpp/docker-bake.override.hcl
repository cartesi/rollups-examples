
target "dapp" {
}

target "server" {
  tags = ["cartesi/dapp-echo-cpp-server"]
}

target "console" {
  tags = ["cartesi/dapp-echo-cpp-console"]
}

target "machine" {
  tags = ["cartesi/dapp-echo-cpp-machine"]
}

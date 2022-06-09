
target "dapp" {
}

target "server" {
  tags = ["cartesi/dapp-sqlite-server"]
}

target "console" {
  tags = ["cartesi/dapp-sqlite-console"]
}

target "machine" {
  tags = ["cartesi/dapp-sqlite-machine"]
}

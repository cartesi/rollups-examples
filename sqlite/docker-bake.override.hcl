
target "dapp" {
}

target "server" {
  tags = ["cartesi/dapp:sqlite-devel-server"]
}

target "console" {
  tags = ["cartesi/dapp:sqlite-devel-console"]
}

target "machine" {
  tags = ["cartesi/dapp:sqlite-devel-machine"]
}

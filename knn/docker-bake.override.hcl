
target "dapp" {
}

target "server" {
  tags = ["cartesi/dapp:knn-devel-server"]
}

target "console" {
  tags = ["cartesi/dapp:knn-devel-console"]
}

target "machine" {
  tags = ["cartesi/dapp:knn-devel-machine"]
}

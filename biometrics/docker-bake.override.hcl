
target "dapp" {
}

target "server" {
  tags = ["cartesi/dapp:biometrics-devel-server"]
}

target "console" {
  tags = ["cartesi/dapp:biometrics-devel-console"]
}

target "machine" {
  tags = ["cartesi/dapp:biometrics-devel-machine"]
}

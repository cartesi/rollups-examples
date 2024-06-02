
target "dapp" {
  contexts = {
    toolchain-ts = "target:toolchain-ts"
  }
}

target "server" {
  tags = ["cartesi/dapp:echo-ts-devel-server"]
}

target "console" {
  tags = ["cartesi/dapp:echo-ts-devel-console"]
}

target "machine" {
  tags = ["cartesi/dapp:echo-ts-devel-machine"]
}

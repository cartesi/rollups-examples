
target "dapp" {
  contexts = {
    toolchain-python = "target:toolchain-python"
  }
}

target "server" {
  tags = ["cartesi/dapp:calculator-devel-server"]
}

target "console" {
  tags = ["cartesi/dapp:calculator-devel-console"]
}

target "machine" {
  tags = ["cartesi/dapp:calculator-devel-machine"]
}

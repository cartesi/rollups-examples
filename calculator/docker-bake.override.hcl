
target "dapp" {
  contexts = {
    toolchain-python = "target:toolchain-python"
  }
}

target "server" {
  tags = ["cartesi/dapp-calculator-server"]
}

target "console" {
  tags = ["cartesi/dapp-calculator-console"]
}

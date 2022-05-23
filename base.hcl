
group "default" {
  targets = ["server", "console", "hardhat"]
}

# crossenv toolchain for python dapps
target "toolchain-python" {
  context = "../docker"
  target  = "toolchain-python"
  tags    = ["cartesi/toolchain-python"]
}

target "fs" {
  context = "../docker"
  target  = "dapp-fs-build"
  contexts = {
    dapp-build = "target:dapp"
  }
}

target "server" {
  context = "../docker"
  target  = "machine-server"
  contexts = {
    dapp-build = "target:dapp"
  }
}

target "console" {
  context = "../docker"
  target  = "machine-console"
  contexts = {
    dapp-build = "target:dapp"
  }
}

target "hardhat" {
  context = "../docker"
  target  = "dapp-hardhat"
  contexts = {
    hardhat    = "../hardhat"
    dapp-build = "target:dapp"
  }
}

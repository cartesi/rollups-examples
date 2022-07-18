
group "default" {
  targets = ["dapp", "server", "console"]
}

# crossenv toolchain for js dapps
target "toolchain-js" {
  context = "./docker"
  target  = "toolchain-js"
  tags    = ["cartesi/toolchain-js"]
}

target "fs" {
  context = "./docker"
  target  = "dapp-fs-build"
  contexts = {
    dapp-build = "target:dapp"
  }
}

target "server" {
  context = "./docker"
  target  = "machine-server"
  contexts = {
    dapp-build = "target:dapp"
  }
}

target "console" {
  context = "./docker"
  target  = "machine-console"
  contexts = {
    dapp-build = "target:dapp"
  }
}

target "machine" {
  context = "./docker"
  target  = "machine-standalone"
  contexts = {
    dapp-build = "target:dapp"
  }
}

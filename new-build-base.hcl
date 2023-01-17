
group "default" {
  targets = ["dapp", "server", "console"]
}

target "fs" {
  context = "../new-build"
  target  = "dapp-fs-build"
  contexts = {
    dapp-build = "target:dapp"
  }
  tags = ["cartesi/dapp-fs-build"]
}

target "server" {
  context = "../new-build"
  target  = "machine-server"
  contexts = {
    dapp-build = "target:dapp"
  }
}

target "console" {
  context = "../new-build"
  target  = "machine-console"
  contexts = {
    dapp-build = "target:dapp"
  }
}

target "machine" {
  context = "../new-build"
  target  = "machine-standalone"
  contexts = {
    dapp-build = "target:dapp"
  }
}



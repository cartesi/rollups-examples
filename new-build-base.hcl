
group "default" {
  targets = ["server", "console"]
}

target "normalized" {
  context = "../new-build"
  target = "normalized-dapp"
  contexts = {
    dapp = "target:dapp"
  }
}

target "fs" {
  context = "../new-build"
  target  = "dapp-fs-build"
  contexts = {
    final-dapp = "target:normalized"
  }
}



target "server" {
  context = "../new-build"
  target  = "machine-server"
  contexts = {
    dapp-fs = "target:fs"
  }
}

target "console" {
  context = "../new-build"
  target  = "machine-console"
  contexts = {
    dapp-fs = "target:fs"
  }
}

target "machine" {
  context = "../new-build"
  target  = "machine-standalone"
  contexts = {
    dapp-fs = "target:fs"
  }
}



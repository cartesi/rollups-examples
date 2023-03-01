
group "default" {
  targets = ["server", "console"]
}

target "normalized" {
  context = "../build/docker-riscv"
  target = "normalized-dapp"
  contexts = {
    dapp = "target:dapp"
  }
}

target "fs" {
  context = "../build/docker-riscv"
  target  = "dapp-fs-build"
  contexts = {
    final-dapp = "target:normalized"
  }
}

target "server" {
  context = "../build/docker-riscv"
  target  = "machine-server"
  contexts = {
    dapp-fs = "target:fs"
  }
}

target "console" {
  context = "../build/docker-riscv"
  target  = "machine-console"
  contexts = {
    dapp-fs = "target:fs"
  }
}

target "machine" {
  context = "../build/docker-riscv"
  target  = "machine-standalone"
  contexts = {
    dapp-fs = "target:fs"
  }
}




group "default" {
  targets = ["dapp", "server", "console"]
}

# crossenv toolchain for python dapps
target "toolchain-python" {
  context = "../build/std-rootfs"
  target  = "toolchain-python"
  tags    = ["cartesi/toolchain-python"]
}

target "fs" {
  context = "../build/std-rootfs"
  target  = "dapp-fs-build"
  contexts = {
    dapp-build = "target:dapp"
  }
}

target "server" {
  context = "../build/std-rootfs"
  target  = "machine-server"
  contexts = {
    dapp-build = "target:dapp"
  }
}

target "console" {
  context = "../build/std-rootfs"
  target  = "machine-console"
  contexts = {
    dapp-build = "target:dapp"
  }
}

target "machine" {
  context = "../build/std-rootfs"
  target  = "machine-standalone"
  contexts = {
    dapp-build = "target:dapp"
  }
}



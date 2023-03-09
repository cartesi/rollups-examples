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
  target  = "fs-stage"
  contexts = {
    dapp = "target:dapp"
  }
}

target "server" {
  context = "../build/std-rootfs"
  target  = "server-stage"
  contexts = {
    dapp = "target:dapp"
  }
}

target "console" {
  context = "../build/std-rootfs"
  target  = "console-stage"
  contexts = {
    dapp = "target:dapp"
  }
}

target "machine" {
  context = "../build/std-rootfs"
  target  = "machine-stage"
  contexts = {
    dapp = "target:dapp"
  }
}
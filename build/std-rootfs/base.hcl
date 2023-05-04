group "default" {
  targets = ["dapp", "server", "console"]
}

# crossenv toolchain for python dapps
target "toolchain-python" {
  context = "../build/std-rootfs"
  target  = "toolchain-python"
  tags    = ["cartesi/toolchain-python"]
}

target "local-deployments" {
  context = "../build/std-rootfs"
  target = "local-deployments-stage"
}

target "deployments" {
  context = "../build/std-rootfs"
  target = "deployments-stage"
}

target "fs" {
  context = "../build/std-rootfs"
  target  = "fs-stage"
  contexts = {
    dapp = "target:dapp"
    deployments = "target:deployments"
    local-deployments = "target:local-deployments"
  }
}

target "server" {
  context = "../build/std-rootfs"
  target  = "server-stage"
  contexts = {
    fs = "target:fs"
  }
}

target "console" {
  context = "../build/std-rootfs"
  target  = "console-stage"
  contexts = {
    fs = "target:fs"
  }
}

target "machine" {
  context = "../build/std-rootfs"
  target  = "machine-stage"
  contexts = {
    server = "target:server"
  }
}
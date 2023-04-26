
group "default" {
  targets = ["server", "console"]
}

target "local-deployments" {
  context = "../build/docker-riscv"
  target = "local-deployments-stage"
}

target "deployments" {
  context = "../build/docker-riscv"
  target = "deployments-stage"
}

target "wrapped" {
  context = "../build/docker-riscv"
  target = "wrapped-stage"
  contexts = {
    dapp = "target:dapp"
  }
}

target "fs" {
  context = "../build/docker-riscv"
  target  = "fs-stage"
  contexts = {
    wrapped = "target:wrapped"
    deployments = "target:deployments"
    local-deployments = "target:local-deployments"
  }
}

target "server" {
  context = "../build/docker-riscv"
  target  = "server-stage"
  contexts = {
    fs = "target:fs"
  }
}

target "console" {
  context = "../build/docker-riscv"
  target  = "console-stage"
  contexts = {
    fs = "target:fs"
  }
}

target "machine" {
  context = "../build/docker-riscv"
  target  = "machine-stage"
  contexts = {
    fs = "target:fs"
  }
}



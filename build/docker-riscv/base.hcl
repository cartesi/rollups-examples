
group "default" {
  targets = ["server", "console"]
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




variable "TAG" {
  default = "devel"
}

variable "DOCKER_ORGANIZATION" {
  default = "cartesi"
}

target "dapp" {
}

target "server" {
  tags = ["${DOCKER_ORGANIZATION}/dapp:echo-ruby-${TAG}-server"]
}

target "console" {
  tags = ["${DOCKER_ORGANIZATION}/dapp:echo-ruby-${TAG}-console"]
}

target "machine" {
  tags = ["${DOCKER_ORGANIZATION}/dapp:echo-ruby-${TAG}-machine"]
}

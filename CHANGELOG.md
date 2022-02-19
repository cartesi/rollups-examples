# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] 2022-02-18

### Changed

- Fix error when using larger payload sizes.

## [0.2.0] 2022-01-17

### Added

- Add target to run cartesi-machine interactively in echo DApp
- New contracts module for DApp smart contract deployment

### Changed

- Enhance echo-dapp instructions
- Simplify echo-dapp implementation to use dependencies directly from Cartesi rootfs
- Bump image-rootfs to 0.9.0
- Bump host-server-manager to 0.2.1
- Change dapp and http-dispatcher ports in echo server run.sh script

### Removed

- Remove machine-emulator-tools submodule
- Remove openapi-interfaces submodule

## [Previous Versions]

[0.2.1]: https://github.com/cartesi/rollups-examples/releases/tag/v0.2.1
[0.2.0]: https://github.com/cartesi/rollups-examples/releases/tag/v0.2.0
[0.1.0]: https://github.com/cartesi/rollups-examples/releases/tag/v0.1.0

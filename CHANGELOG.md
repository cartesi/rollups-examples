# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0]

### Added

- Echo C++ DApp example
- Converter DApp example
- k-NN DApp example
- m2cgen DApp example

## [0.3.2] 2022-03-23

### Added

- Contributing guidelines and license

### Changed

- Updated Echo DApp polygon_mumbai deploy
- Fix template Python requirements

## [0.3.1] 2022-03-15

### Added

- Easy link in main README to open working development environment using Gitpod

### Changed

- Use Chainstack for polygon_mumbai and not Infura

## [0.3.0] 2022-03-12

### Added

- Frontend console application for Echo DApp
- SQLite DApp example
- Allow hardhat tasks to work on localhost
- Use new Rollups getNotice task to retrieve notices
- Support for submitting inputs and reading notices as UTF-8 strings

### Changed

- Locks `itsdangerous` to version 1.1.0 to avoid a crash when executing Echo DApp in host mode
- AddInput task returning submitted input's index

## [0.2.2] 2022-02-25

### Changed

- Fix make console
- Fix server-manager container version
- Bump rootfs to v0.10.0, which includes default support for Python sqlite3 core module

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

[0.4.0]: https://github.com/cartesi/rollups-examples/releases/tag/v0.4.0
[0.3.2]: https://github.com/cartesi/rollups-examples/releases/tag/v0.3.2
[0.3.1]: https://github.com/cartesi/rollups-examples/releases/tag/v0.3.1
[0.3.0]: https://github.com/cartesi/rollups-examples/releases/tag/v0.3.0
[0.2.2]: https://github.com/cartesi/rollups-examples/releases/tag/v0.2.2
[0.2.1]: https://github.com/cartesi/rollups-examples/releases/tag/v0.2.1
[0.2.0]: https://github.com/cartesi/rollups-examples/releases/tag/v0.2.0
[0.1.0]: https://github.com/cartesi/rollups-examples/releases/tag/v0.1.0

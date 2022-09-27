<!-- markdownlint-disable-file MD024 -->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.0] 2022-09-14

### Added

- Support for deploying DApps to Arbitrum Goerli and Optimism Goerli
- Internal queue added to Inspect Server in order to serialize concurrent requests
- Quick-start recommendations using web environments Gitpod and CodeSandbox

### Changed

- Proper handling of inspect requests in SQLite DApp
- Cleaner logs by using more appropriate logging levels in offchain components
- DApp filesystem creation and DApp execution using regular 'dapp' user instead of root
- Bump toolchain to 0.11.0
- Bump rootfs to 0.14.1
- Bump kernel to linux-5.5.19-ctsi-6
- Bump rom to 0.12.0
- Bump server-manager to 0.4.0

## [0.8.1] 2022-08-24

### Changed

- Fix reference of docker image at docker-compose-testnet.yml

## [0.8.0] 2022-08-17

### Added

- Inspect Server allowing clients to directly query internal DApp state
- Echo JavaScript DApp example
- Documentation and tools to validate notices, execute vouchers, list reports and inspect DApp state

### Changed

- Major refactor in Indexer service, with significant improvements to the GraphQL API
- Major refactor in State Fold service, with significant improvements to resource consumption
- Use interval mining mode in Hardhat service for local development
- Use Ethereum Goerli instead of Polygon Mumbai for live testnet deployments
- Fix withdrawal voucher encoding in ERC-20 DApp example
- Refactor of frontend-console commands structure
- Bump server-manager to 0.3.1

## [0.7.2] 2022-07-28

### Changed

- Fix toolchain docker image reference of Lua example

## [0.7.1] 2022-07-18

### Changed

- Remove Gitpod reference while we investigate an issue using it

## [0.7.0] 2022-07-06

### Added

- Echo Low-Level C++ DApp example
- Echo Lua DApp example
- ERC-20 DApp generating vouchers for withdrawals

### Changed

- Move rollup-init call from build-machine.sh to entrypoint.sh
- Support for running nodes in host mode for DApps deployed on testnet

## [0.6.0] 2022-06-14

### Added

- Deployment mechanism for EVM-compatible testnets
- Echo Rust DApp example
- Calculator DApp example
- ERC-20 Deposit DApp example
- Basic mechanism for adding extra Python dependencies
- Usage of new exception endpoint in SQLite DApp example

### Changed

- Major reorganization of packages and build processes to reduce boilerplate code duplication
- Major refactor of the frontend-console application, originally specific for the Echo Python DApp and now generalized to support sending inputs, querying notices and depositing ERC-20 tokens for all DApps, both locally and deployed on testnets
- Deprecated usage of Hardhat tasks for interacting with applications in favor of the frontend-console

## [0.5.1] 2022-05-02

### Changed

- Fix example Dockerfiles to stop referring to local .yalc directories

## [0.5.0] 2022-04-29

### Changed

- Major update to rollups 0.2.0 with new HTTP API
- Fix m2cgen example to work with Apple Silicon

## [0.4.2] 2022-03-29

### Changed

- Fix Python DApp requirements due to changes in dependencies

## [0.4.1] 2022-03-27

### Changed

- Fix m2cgen DApp build model requirements

## [0.4.0] 2022-03-27

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

[0.9.0]: https://github.com/cartesi/rollups-examples/releases/tag/v0.9.0
[0.8.1]: https://github.com/cartesi/rollups-examples/releases/tag/v0.8.1
[0.8.0]: https://github.com/cartesi/rollups-examples/releases/tag/v0.8.0
[0.7.2]: https://github.com/cartesi/rollups-examples/releases/tag/v0.7.2
[0.7.1]: https://github.com/cartesi/rollups-examples/releases/tag/v0.7.1
[0.7.0]: https://github.com/cartesi/rollups-examples/releases/tag/v0.7.0
[0.6.0]: https://github.com/cartesi/rollups-examples/releases/tag/v0.6.0
[0.5.1]: https://github.com/cartesi/rollups-examples/releases/tag/v0.5.1
[0.5.0]: https://github.com/cartesi/rollups-examples/releases/tag/v0.5.0
[0.4.2]: https://github.com/cartesi/rollups-examples/releases/tag/v0.4.2
[0.4.1]: https://github.com/cartesi/rollups-examples/releases/tag/v0.4.1
[0.4.0]: https://github.com/cartesi/rollups-examples/releases/tag/v0.4.0
[0.3.2]: https://github.com/cartesi/rollups-examples/releases/tag/v0.3.2
[0.3.1]: https://github.com/cartesi/rollups-examples/releases/tag/v0.3.1
[0.3.0]: https://github.com/cartesi/rollups-examples/releases/tag/v0.3.0
[0.2.2]: https://github.com/cartesi/rollups-examples/releases/tag/v0.2.2
[0.2.1]: https://github.com/cartesi/rollups-examples/releases/tag/v0.2.1
[0.2.0]: https://github.com/cartesi/rollups-examples/releases/tag/v0.2.0
[0.1.0]: https://github.com/cartesi/rollups-examples/releases/tag/v0.1.0

# Cartesi Rollups Examples

The Cartesi Rollups infrastructure can be executed in 2 modes:
1. As a **production environment** that provides a Cartesi Machine where the DApp back-end logic will run after being cross-compiled to the RISC-V architecture. Please check our [echo dapp example](https://github.com/cartesi/rollups-examples/tree/main/echo) to learn how to use Cartesi Rolllups usage.

2. As a **host environment** that provides the very same HTTP API as the regular one, mimicking the behavior of the actual layer-1 and layer-2 components. This way, the Cartesi Rollups infrastructure can make HTTP requests to a native back-end running on localhost. This allows the developer to run and debug them using familiar tools, such as an IDE. To execute the Cartesi Rollups as a host environment please check our [host example](https://github.com/cartesi/rollups-examples/tree/main/host).



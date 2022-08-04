export enum ChainId {
    localhost = "0x7a69",
    testnet = "0x5",
}

export enum ChainToken {
    localhost = "ETH",
    testnet = "ETH",
}

export enum ChainLabel {
    localhost = "localhost",
    testnet = "Goerli testnet",
}

export enum ChainRpcUrl {
    localhost = "http://localhost:8545",
    testnet = "https://goerli.etherscan.io/",
}

export interface Chain {
    id: ChainId;
    token: ChainToken;
    label: ChainLabel;
    rpcUrl: ChainRpcUrl;
}

export enum WalletName {
    MetaMask = "MetaMask",
    Coinbase = "Coinbase",
}

export enum WalletUrl {
    MetaMask = "https://metamask.io",
    Coinbase = "https://wallet.coinbase.com/",
}

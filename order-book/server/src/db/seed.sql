CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY,
    address TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE,
    symbol TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY,
    address_id INTEGER NOT NULL,
    unit_price INTEGER,
    amount INTEGER,
    product_id INTEGER NOT NULL,
    closing_time INTEGER,
    timestamp INTEGER
);

INSERT OR IGNORE INTO products (name, symbol) VALUES ('Ethereum', 'ETH');
INSERT OR IGNORE INTO products (name, symbol) VALUES ('Bitcoin', 'BTC');
INSERT OR IGNORE INTO products (name, symbol) VALUES ('Tether', 'USDT');
INSERT OR IGNORE INTO products (name, symbol) VALUES ('Binance Coin', 'BNB');
INSERT OR IGNORE INTO products (name, symbol) VALUES ('Solana', 'SOL');
CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY,
    address TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE,
    symbol TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS funds (
    id INTEGER PRIMARY KEY,
    address_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    amount INTEGER NOT NULL
    -- FOREIGN KEY (address_id) 
    --     REFERENCES accounts (id)
    --         ON UPDATE CASCADE
    --         ON DELETE CASCADE,
    -- FOREIGN KEY (product_id) 
    --     REFERENCES products (id)
    --         ON UPDATE CASCADE
    --         ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY,
    address_id INTEGER NOT NULL,
    type TEXT,
    side TEXT,
    unit_price INTEGER,
    amount INTEGER,
    product_id INTEGER NOT NULL,
    closing_time INTEGER,
    timestamp INTEGER
    -- FOREIGN KEY (address_id)
    --     REFERENCES accounts (id)
    --         ON UPDATE CASCADE
    --         ON DELETE CASCADE,
    -- FOREIGN KEY (product_id)
    --     REFERENCES products (id)
    --         ON UPDATE CASCADE
    --         ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY,
    buy_order_id INTEGER NOT NULL,
    sell_order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    unit_price INTEGER,
    amount INTEGER,
    timestamp INTEGER
    -- FOREIGN KEY (sell_order_id)
    --     REFERENCES open_orders (id)
    --         ON UPDATE CASCADE
    --         ON DELETE CASCADE,
    -- FOREIGN KEY (buy_order_id)
    --     REFERENCES open_orders (id)
    --         ON UPDATE CASCADE
    --         ON DELETE CASCADE,
    -- FOREIGN KEY (product_id)
    --     REFERENCES products (id)
    --         ON UPDATE CASCADE
    --         ON DELETE CASCADE
);


INSERT OR IGNORE INTO products (name, symbol) VALUES ('Ethereum', 'ETH');
INSERT OR IGNORE INTO products (name, symbol) VALUES ('Bitcoin', 'BTC');
INSERT OR IGNORE INTO products (name, symbol) VALUES ('Tether', 'USDT');
INSERT OR IGNORE INTO products (name, symbol) VALUES ('Binance Coin', 'BNB');
INSERT OR IGNORE INTO products (name, symbol) VALUES ('Solana', 'SOL');
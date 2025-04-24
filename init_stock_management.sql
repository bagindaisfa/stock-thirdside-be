-- File: init_stock_management.sql

-- 1. Table: users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

-- 2. Table: ingredients
CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,  -- e.g. gram, ml, pcs
    stock NUMERIC DEFAULT 0,
    min_stock NUMERIC DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: stock_in (stok masuk)
CREATE TABLE stock_in (
    id SERIAL PRIMARY KEY,
    ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity NUMERIC NOT NULL,
    date DATE DEFAULT CURRENT_DATE
);

-- 4. Table: stock_usage (pemakaian harian)
CREATE TABLE stock_usage (
    id SERIAL PRIMARY KEY,
    ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity NUMERIC NOT NULL,
    date DATE DEFAULT CURRENT_DATE
);

-- Optional: Trigger to auto-update updated_at on ingredients
CREATE OR REPLACE FUNCTION update_ingredients_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ingredients
BEFORE UPDATE ON ingredients
FOR EACH ROW
EXECUTE FUNCTION update_ingredients_timestamp();

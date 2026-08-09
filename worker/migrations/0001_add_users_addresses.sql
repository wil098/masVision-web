-- Migration number: 0001 	 2026-07-29T01:23:46.491Z

-- Cuentas de cliente (Google Sign-In vía Firebase) y direcciones guardadas.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- uid de Firebase
  email TEXT NOT NULL,
  nombre TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  etiqueta TEXT,
  departamento TEXT NOT NULL,
  municipio TEXT NOT NULL,
  direccion TEXT NOT NULL,
  referencia TEXT,
  es_predeterminada INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses (user_id);

ALTER TABLE orders ADD COLUMN user_id TEXT REFERENCES users(id);
ALTER TABLE orders ADD COLUMN tracking_number TEXT;
ALTER TABLE orders ADD COLUMN tracking_url TEXT;
ALTER TABLE orders ADD COLUMN courier_name TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);

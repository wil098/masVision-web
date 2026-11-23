-- Migration number: 0011 	 2026-11-22T00:00:00.000Z

-- Carrito de cada cliente con sesión iniciada (copia del carrito del
-- navegador). Sirve para el recordatorio de carrito abandonado (un correo,
-- 24 h después del último cambio) y para recuperar el carrito en otro
-- dispositivo.
CREATE TABLE IF NOT EXISTS carritos (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  items TEXT NOT NULL,                 -- JSON: [{codigo,name,brand,price,image,color,medida,quantity,lensOptions}]
  total REAL NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  recordatorio_enviado_at TEXT          -- NULL = todavía no se envió para esta versión del carrito
);

CREATE INDEX IF NOT EXISTS idx_carritos_pendientes ON carritos (recordatorio_enviado_at, updated_at);

-- El cliente puede darse de baja solo de los recordatorios de carrito.
ALTER TABLE users ADD COLUMN recordatorio_carrito INTEGER NOT NULL DEFAULT 1;

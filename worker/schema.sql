CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendiente', -- pendiente | pagado | fallido
  asunto TEXT NOT NULL,
  resumen TEXT NOT NULL,
  total REAL NOT NULL,
  nombre_cliente TEXT NOT NULL,
  telefono TEXT NOT NULL,
  correo_cliente TEXT NOT NULL,
  departamento TEXT NOT NULL,
  municipio TEXT NOT NULL,
  direccion TEXT NOT NULL,
  referencia TEXT,
  tiene_receta INTEGER NOT NULL DEFAULT 0,
  wompi_transaccion_id TEXT,
  email_vendedor_enviado INTEGER NOT NULL DEFAULT 0,
  email_cliente_enviado INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);

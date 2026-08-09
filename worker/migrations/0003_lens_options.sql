-- Migration number: 0003 	 2026-07-29T04:46:30.924Z

-- Catálogo de opciones de lente (filtro, marca, etc.), separado del precio
-- del aro. Se crea sin filas: el admin las agrega cuando el dueño defina
-- los precios reales, y quedan con disponible = 0 hasta que se activen a
-- propósito desde el panel — así nunca se muestran ni se cobran sin precio.
CREATE TABLE lens_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  categoria TEXT NOT NULL,
  nombre TEXT NOT NULL,
  precio_adicional REAL,
  disponible INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

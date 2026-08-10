-- Migration number: 0007 	 2026-08-10T00:00:00.000Z

-- Bloques promocionales que el admin intercala dentro de la grilla de
-- productos de Aros Oftálmicos / Aros de Sol (mismo tamaño que una card de
-- producto), al estilo de los banners de Warby Parker. "position" indica en
-- qué celda de la grilla se inserta (1 = primera).
CREATE TABLE promo_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pagina TEXT NOT NULL CHECK (pagina IN ('aros-oftalmicos', 'aros-sol')),
  title TEXT NOT NULL,
  subtitle TEXT,
  image TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

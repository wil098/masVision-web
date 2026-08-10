-- Migration number: 0006 	 2026-08-10T00:00:00.000Z

-- Flag independiente de "destacado": controla qué aros aparecen en el
-- carousel "Nueva colección" del Home, sin afectar la sección de
-- Productos Destacados (que usa "destacado").
ALTER TABLE products ADD COLUMN nueva_coleccion INTEGER NOT NULL DEFAULT 0;

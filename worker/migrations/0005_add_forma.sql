-- Migration number: 0005 	 2026-07-29T05:45:18.350Z

-- Forma del armazón (aviador, redondo, cuadrado, etc.) — dato de ficha
-- técnica, un solo valor por producto (no es una variante como color/medida).
ALTER TABLE products ADD COLUMN forma TEXT;

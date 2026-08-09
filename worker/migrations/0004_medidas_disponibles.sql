-- Migration number: 0004 	 2026-07-29T05:18:41.236Z

-- Igual que colores_disponibles: un aro puede venir en varias medidas
-- (calibre/puente/varilla), así que pasa de ser 3 columnas de un solo valor
-- a una lista de variantes que el cliente elige, igual que el color.
ALTER TABLE products ADD COLUMN medidas_disponibles TEXT;

UPDATE products SET medidas_disponibles = '[{"calibre":"56 mm","puente":"18 mm","varilla":"145 mm"}]' WHERE codigo = 'G280686';
UPDATE products SET medidas_disponibles = '[{"calibre":"55 mm","puente":"18 mm","varilla":"145 mm"}]' WHERE codigo = 'G280687';
UPDATE products SET medidas_disponibles = '[{"calibre":"52 mm","puente":"19 mm","varilla":"145 mm"}]' WHERE codigo = 'G280688';
UPDATE products SET medidas_disponibles = '[{"calibre":"53 mm","puente":"18 mm","varilla":"148 mm"}]' WHERE codigo = 'G280689';
UPDATE products SET medidas_disponibles = '[{"calibre":"53 mm","puente":"19 mm","varilla":"148 mm"}]' WHERE codigo = 'G280691';
UPDATE products SET medidas_disponibles = '[{"calibre":"53 mm","puente":"19 mm","varilla":"150 mm"}]' WHERE codigo = 'G280692';
UPDATE products SET medidas_disponibles = '[{"calibre":"52 mm","puente":"20 mm","varilla":"143 mm"}]' WHERE codigo = 'G280693';
UPDATE products SET medidas_disponibles = '[{"calibre":"58 mm","puente":"15 mm","varilla":"145 mm"}]' WHERE codigo = 'G280694';
UPDATE products SET medidas_disponibles = '[{"calibre":"59 mm","puente":"15 mm","varilla":"145 mm"}]' WHERE codigo = 'G280695';
UPDATE products SET medidas_disponibles = '[{"calibre":"58 mm","puente":"18 mm","varilla":"140 mm"}]' WHERE codigo = 'G280696';
UPDATE products SET medidas_disponibles = '[{"calibre":"57 mm","puente":"16 mm","varilla":"141 mm"}]' WHERE codigo = 'G280697';
UPDATE products SET medidas_disponibles = '[]' WHERE medidas_disponibles IS NULL;

ALTER TABLE products DROP COLUMN calibre;
ALTER TABLE products DROP COLUMN puente;
ALTER TABLE products DROP COLUMN varilla;

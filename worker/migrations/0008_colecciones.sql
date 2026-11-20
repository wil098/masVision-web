-- Migration number: 0008 	 2026-11-20T00:00:00.000Z

-- Colección a la que pertenece cada aro (ej. "Metal Collection") y colección
-- que encabeza cada bloque promocional. Así el bloque se muestra siempre
-- encima de los aros de su colección, sin depender de una posición fija que
-- se corre cada vez que se agregan productos nuevos.
ALTER TABLE products ADD COLUMN coleccion TEXT;
ALTER TABLE promo_blocks ADD COLUMN coleccion TEXT;

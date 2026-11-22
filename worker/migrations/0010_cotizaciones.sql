-- Migration number: 0010 	 2026-11-21T00:00:00.000Z

-- Cotización de lentes antes del pago: el cliente sube su receta, el pedido
-- queda en status 'cotizacion'; el admin agrega el precio de los lentes y se
-- genera un solo enlace de pago (aro + lentes + envío) → status 'cotizado'.
-- Otros status nuevos: 'cancelado'.
ALTER TABLE orders ADD COLUMN total_base REAL;          -- aros + envío, sin lentes
ALTER TABLE orders ADD COLUMN lentes_descripcion TEXT;
ALTER TABLE orders ADD COLUMN lentes_precio REAL;
ALTER TABLE orders ADD COLUMN url_pago TEXT;            -- enlace de Wompi vigente
ALTER TABLE orders ADD COLUMN cotizacion_version INTEGER NOT NULL DEFAULT 0;
-- Llave del archivo de receta en el bucket privado RECETAS_BUCKET.
ALTER TABLE orders ADD COLUMN receta_key TEXT;

UPDATE orders SET total_base = total WHERE total_base IS NULL;

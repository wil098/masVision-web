-- Migration number: 0009 	 2026-11-20T00:00:00.000Z

-- Consentimiento para correos de marketing (ofertas, novedades). Solo se
-- envían a quien lo aceptó explícitamente, y cada correo lleva un enlace
-- para darse de baja.
ALTER TABLE users ADD COLUMN acepta_marketing INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN marketing_actualizado_at TEXT;
-- Evita mandar el correo de bienvenida más de una vez.
ALTER TABLE users ADD COLUMN email_bienvenida_enviado INTEGER NOT NULL DEFAULT 0;

-- Aviso al cliente cuando el pedido sale con número de guía.
ALTER TABLE orders ADD COLUMN email_envio_enviado INTEGER NOT NULL DEFAULT 0;

-- Los usuarios que ya existían no reciben una bienvenida atrasada.
UPDATE users SET email_bienvenida_enviado = 1;
-- Los pedidos viejos que ya tienen guía no disparan el aviso de envío.
UPDATE orders SET email_envio_enviado = 1 WHERE tracking_number IS NOT NULL AND tracking_number <> '';

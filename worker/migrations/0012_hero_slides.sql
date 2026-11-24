-- Migration number: 0012 	 2026-11-24T00:00:00.000Z

-- Slides del carrusel de la portada (Inicio), administrables desde el panel.
-- - image: foto horizontal (escritorio). image_movil: opcional, vertical.
-- - mostrar_texto = 0 para banners que ya traen el texto en la imagen: se
--   oculta el texto/degradado y todo el slide enlaza a boton_link.
-- - enfoque: qué parte de la foto se conserva al recortar en celular.
-- - fecha_inicio / fecha_fin (YYYY-MM-DD, hora de El Salvador, opcionales):
--   el slide solo se muestra entre esas fechas (ej. Black Friday).
CREATE TABLE hero_slides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  eyebrow TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL,
  image_movil TEXT NOT NULL DEFAULT '',
  boton_texto TEXT NOT NULL DEFAULT '',
  boton_link TEXT NOT NULL DEFAULT '',
  mostrar_texto INTEGER NOT NULL DEFAULT 1,
  enfoque TEXT NOT NULL DEFAULT 'centro' CHECK (enfoque IN ('izquierda', 'centro', 'derecha')),
  position INTEGER NOT NULL DEFAULT 1,
  activo INTEGER NOT NULL DEFAULT 1,
  fecha_inicio TEXT NOT NULL DEFAULT '',
  fecha_fin TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- El slide que hoy está fijo en la portada, para que nada cambie al publicar.
INSERT INTO hero_slides
  (eyebrow, title, subtitle, image, boton_texto, boton_link, mostrar_texto, enfoque, position, activo, created_at, updated_at)
VALUES
  ('Óptica Más Visión', 'Nueva colección',
   'Lentes de alta calidad y exámenes visuales profesionales, con envíos a todo El Salvador.',
   '/img/wide%20foto.png', 'Ver catálogo', '/aros-oftalmicos', 1, 'derecha', 1, 1,
   '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z');

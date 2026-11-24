import { z } from 'zod'

const codigo = z.string().trim().min(1).max(100)
const shortText = z.string().trim().min(1).max(200)
const price = z.coerce.number().finite().nonnegative().max(1_000_000)

// Acepta string, pero también null/undefined (columnas opcionales de D1
// llegan como null cuando nunca se llenaron) normalizándolos a ''.
const optionalText = (max) =>
  z.preprocess((v) => (typeof v === 'string' ? v : ''), z.string().trim().max(max))

const longText = optionalText(2000)

export const checkoutItemSchema = z.object({
  codigo,
  cantidad: z.coerce.number().int().min(1).max(50).default(1),
  color: optionalText(100),
  medida: optionalText(100),
  lensOptionIds: z.array(z.coerce.number().int().positive()).max(20).optional().default([]),
})

export const checkoutItemsSchema = z.array(checkoutItemSchema).min(1).max(50)

export const addressSchema = z.object({
  etiqueta: z.string().trim().max(100).optional(),
  departamento: shortText,
  municipio: shortText,
  direccion: z.string().trim().min(1).max(500),
  referencia: z.string().trim().max(500).optional(),
  esPredeterminada: z.boolean().optional(),
})

const colorSchema = z.object({
  nombre: z.string().trim().min(1).max(100),
  hex: optionalText(20),
  images: z.array(z.string().trim().max(2000)).max(20).optional().default([]),
})

const medidaSchema = z.object({
  calibre: z.string().trim().max(20).optional().default(''),
  puente: z.string().trim().max(20).optional().default(''),
  varilla: z.string().trim().max(20).optional().default(''),
})

export const adminProductSchema = z.object({
  codigo,
  name: shortText,
  categoria: z.enum(['oftalmico', 'sol']),
  price,
  brand: shortText,
  description: longText,
  material: optionalText(200),
  forma: optionalText(200),
  coleccion: optionalText(200),
  caracteristicas: optionalText(2000),
  colores_disponibles: z.array(colorSchema).max(50).optional().default([]),
  medidas_disponibles: z.array(medidaSchema).max(50).optional().default([]),
  images: z.array(z.string().trim().max(2000)).max(20).optional().default([]),
  disponible: z.boolean().optional(),
  destacado: z.boolean().optional(),
  nueva_coleccion: z.boolean().optional(),
})

export const adminLensOptionSchema = z.object({
  categoria: shortText,
  nombre: shortText,
  precio_adicional: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.union([z.number().finite(), z.null()])
  ),
  disponible: z.boolean().optional(),
})

export const adminPromoBlockSchema = z.object({
  pagina: z.enum(['aros-oftalmicos', 'aros-sol']),
  title: shortText,
  subtitle: optionalText(300),
  image: z.string().trim().min(1).max(2000),
  position: z.coerce.number().int().positive(),
  coleccion: optionalText(200),
})

// Enlaces del botón del slide: rutas internas ("/aros-sol") o https://.
const heroLink = z.preprocess(
  (v) => (typeof v === 'string' ? v : ''),
  z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === '' || /^\/(?!\/)/.test(v) || /^https:\/\//.test(v), 'Enlace inválido')
)
// Imagen: URL https (subida al bucket) o ruta del propio sitio ("/img/...").
const heroImage = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => /^https:\/\//.test(v) || /^\/(?!\/)/.test(v), 'Imagen inválida')
const isoDay = z.preprocess(
  (v) => (typeof v === 'string' ? v : ''),
  z.string().trim().regex(/^(\d{4}-\d{2}-\d{2})?$/)
)

export const adminHeroSlideSchema = z
  .object({
    eyebrow: optionalText(80),
    title: optionalText(120),
    subtitle: optionalText(300),
    image: heroImage,
    image_movil: z.preprocess((v) => (typeof v === 'string' ? v : ''), z.union([z.literal(''), heroImage])),
    boton_texto: optionalText(40),
    boton_link: heroLink,
    mostrar_texto: z.boolean().default(true),
    enfoque: z.enum(['izquierda', 'centro', 'derecha']).default('centro'),
    position: z.coerce.number().int().positive().max(1000),
    activo: z.boolean().default(true),
    fecha_inicio: isoDay,
    fecha_fin: isoDay,
  })
  // Con texto visible el título es obligatorio; sin texto, la imagen lo trae.
  .refine((s) => !s.mostrar_texto || s.title.length > 0, { message: 'Falta el título', path: ['title'] })
  .refine((s) => !s.fecha_inicio || !s.fecha_fin || s.fecha_inicio <= s.fecha_fin, {
    message: 'La fecha de fin es anterior a la de inicio',
    path: ['fecha_fin'],
  })

export const adminRenameProductCodeSchema = z.object({
  newCodigo: codigo,
})

const cartLineSchema = z.object({
  codigo,
  name: z.string().trim().min(1).max(200),
  brand: optionalText(100),
  price: z.coerce.number().finite().nonnegative().max(100_000),
  image: z.preprocess((v) => (typeof v === 'string' && /^https:\/\//.test(v) ? v : ''), z.string().max(2000)),
  color: optionalText(100),
  medida: optionalText(100),
  colorHex: optionalText(20),
  quantity: z.coerce.number().int().min(1).max(50),
})

export const cartSchema = z.object({
  items: z.array(cartLineSchema).max(50),
})

export const adminQuoteSchema = z.object({
  descripcion: z.string().trim().min(3).max(300),
  precio: z.coerce.number().finite().positive().max(10_000),
})

export const adminOrderUpdateSchema = z.object({
  courierName: z.string().trim().max(200).optional(),
  trackingNumber: z.string().trim().max(200).optional(),
  trackingUrl: z.string().trim().max(2000).optional(),
  status: z.enum(['pendiente', 'pagado', 'fallido', 'cotizacion', 'cotizado', 'cancelado']).optional(),
})

// Devuelve { data } o { error: string } listo para loguear y responder 400.
export function parseSchema(schema, input) {
  const result = schema.safeParse(input)
  if (!result.success) {
    return { error: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') }
  }
  return { data: result.data }
}

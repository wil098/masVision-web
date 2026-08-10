import { z } from 'zod'

const codigo = z.string().trim().min(1).max(100)
const shortText = z.string().trim().min(1).max(200)
const longText = z.string().trim().max(2000).optional()
const price = z.coerce.number().finite().nonnegative().max(1_000_000)

const optionalText = (max) =>
  z.preprocess((v) => (typeof v === 'string' ? v : ''), z.string().trim().max(max))

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
  hex: z.string().trim().max(20).optional(),
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
  material: z.string().trim().max(200).optional(),
  forma: z.string().trim().max(200).optional(),
  caracteristicas: z.string().trim().max(2000).optional(),
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
})

export const adminOrderUpdateSchema = z.object({
  courierName: z.string().trim().max(200).optional(),
  trackingNumber: z.string().trim().max(200).optional(),
  trackingUrl: z.string().trim().max(2000).optional(),
  status: z.enum(['pendiente', 'pagado', 'fallido']).optional(),
})

// Devuelve { data } o { error: string } listo para loguear y responder 400.
export function parseSchema(schema, input) {
  const result = schema.safeParse(input)
  if (!result.success) {
    return { error: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') }
  }
  return { data: result.data }
}

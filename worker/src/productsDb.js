function parseProduct(row) {
  if (!row) return null
  return {
    ...row,
    colores_disponibles: row.colores_disponibles ? JSON.parse(row.colores_disponibles) : [],
    medidas_disponibles: row.medidas_disponibles ? JSON.parse(row.medidas_disponibles) : [],
    images: row.images ? JSON.parse(row.images) : [],
    disponible: Boolean(row.disponible),
    destacado: Boolean(row.destacado),
    nueva_coleccion: Boolean(row.nueva_coleccion),
  }
}

export async function listProducts(env, { categoria, destacado, nuevaColeccion } = {}) {
  const conditions = ['disponible = 1']
  const params = []
  if (categoria) {
    conditions.push('categoria = ?')
    params.push(categoria)
  }
  if (destacado) {
    conditions.push('destacado = 1')
  }
  if (nuevaColeccion) {
    conditions.push('nueva_coleccion = 1')
  }

  const { results } = await env.DB.prepare(
    `SELECT * FROM products WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`
  )
    .bind(...params)
    .all()
  return results.map(parseProduct)
}

export async function listAllProductsForAdmin(env) {
  const { results } = await env.DB.prepare(`SELECT * FROM products ORDER BY created_at DESC`).all()
  return results.map(parseProduct)
}

export async function getProduct(env, codigo) {
  const row = await env.DB.prepare(`SELECT * FROM products WHERE codigo = ?`).bind(codigo).first()
  return parseProduct(row)
}

export async function createProduct(env, product) {
  const now = new Date().toISOString()
  await env.DB.prepare(
    `INSERT INTO products (
      codigo, categoria, name, description, price, brand, material, forma,
      caracteristicas, colores_disponibles, medidas_disponibles, images, disponible, destacado, nueva_coleccion, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      product.codigo,
      product.categoria,
      product.name,
      product.description || null,
      product.price,
      product.brand,
      product.material || null,
      product.forma || null,
      product.caracteristicas || null,
      JSON.stringify(product.colores_disponibles || []),
      JSON.stringify(product.medidas_disponibles || []),
      JSON.stringify(product.images || []),
      product.disponible === false ? 0 : 1,
      product.destacado ? 1 : 0,
      product.nueva_coleccion ? 1 : 0,
      now,
      now
    )
    .run()
}

export async function updateProduct(env, codigo, product) {
  const now = new Date().toISOString()
  const result = await env.DB.prepare(
    `UPDATE products SET
      categoria = ?, name = ?, description = ?, price = ?, brand = ?, material = ?, forma = ?,
      caracteristicas = ?, colores_disponibles = ?, medidas_disponibles = ?,
      images = ?, disponible = ?, destacado = ?, nueva_coleccion = ?, updated_at = ?
     WHERE codigo = ?`
  )
    .bind(
      product.categoria,
      product.name,
      product.description || null,
      product.price,
      product.brand,
      product.material || null,
      product.forma || null,
      product.caracteristicas || null,
      JSON.stringify(product.colores_disponibles || []),
      JSON.stringify(product.medidas_disponibles || []),
      JSON.stringify(product.images || []),
      product.disponible === false ? 0 : 1,
      product.destacado ? 1 : 0,
      product.nueva_coleccion ? 1 : 0,
      now,
      codigo
    )
    .run()
  return result.meta.changes > 0
}

export async function deleteProduct(env, codigo) {
  const result = await env.DB.prepare(`DELETE FROM products WHERE codigo = ?`).bind(codigo).run()
  return result.meta.changes > 0
}

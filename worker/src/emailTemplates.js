const BRAND = 'Óptica Más Visión'
const BRAND_COLOR = '#0891b2'
const DARK = '#0f172a'
const WHATSAPP_URL = 'https://wa.me/50371497972'

export function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Solo deja pasar enlaces http(s) a los href del correo.
function safeUrl(url) {
  try {
    const u = new URL(url)
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : ''
  } catch {
    return ''
  }
}

const money = (n) => `$${Number(n || 0).toFixed(2)}`
const shortId = (id) => String(id || '').slice(0, 8).toUpperCase()

function resumenToHtml(resumen) {
  return String(resumen || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map(
      (line) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid #eef0f3;color:#374151;font-size:14px;line-height:1.5;">${escapeHtml(line)}</td></tr>`
    )
    .join('')
}

function button(label, href) {
  const url = safeUrl(href)
  if (!url) return ''
  return `<a href="${escapeHtml(url)}" style="display:inline-block;background-color:${DARK};color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 26px;border-radius:999px;">${escapeHtml(label)}</a>`
}

// Layout común. `preheader` es el texto que muestran Gmail/Outlook junto al
// asunto en la bandeja; `footerExtraHtml` se usa para el enlace de baja.
function emailLayout({ preheader = '', heading, subheading, bodyHtml, siteUrl, footerExtraHtml = '' }) {
  const site = safeUrl(siteUrl)
  const logo = site ? `${site.replace(/\/$/, '')}/img/logo-mas-vision.png` : ''
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(heading)}</title></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;">
<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</span>
<div style="background-color:#f3f4f6;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;">
    <div style="text-align:center;padding:0 0 20px 0;">
      ${
        logo
          ? `<a href="${escapeHtml(site)}" style="text-decoration:none;"><img src="${escapeHtml(logo)}" alt="${BRAND}" height="48" style="height:48px;width:auto;border:0;"></a>`
          : `<p style="margin:0;color:${DARK};font-size:18px;font-weight:800;">${BRAND}</p>`
      }
    </div>
    <div style="background-color:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="padding:32px 32px 8px 32px;">
        <h1 style="margin:0;color:${DARK};font-size:24px;line-height:1.25;font-weight:800;">${escapeHtml(heading)}</h1>
        ${subheading ? `<p style="margin:8px 0 0 0;color:#6b7280;font-size:15px;line-height:1.5;">${escapeHtml(subheading)}</p>` : ''}
      </div>
      <div style="padding:20px 32px 32px 32px;">
        ${bodyHtml}
      </div>
    </div>
    <div style="text-align:center;padding:24px 16px 0 16px;color:#9ca3af;font-size:12px;line-height:1.6;">
      <p style="margin:0 0 6px 0;"><strong style="color:#6b7280;">${BRAND}</strong> · San Vicente · Zacatecoluca · Cojutepeque</p>
      <p style="margin:0 0 6px 0;">¿Dudas? Responde este correo o escríbenos por <a href="${WHATSAPP_URL}" style="color:${BRAND_COLOR};">WhatsApp</a>.</p>
      ${footerExtraHtml}
    </div>
  </div>
</div>
</body></html>`
}

function shippingAddressHtml({ departamento, municipio, direccion, referencia }) {
  return `
    <div style="background-color:#f9fafb;border-radius:14px;padding:16px 20px;margin:0 0 20px 0;">
      <p style="margin:0 0 8px 0;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Dirección de envío</p>
      <p style="margin:0 0 4px 0;color:#111827;font-size:14px;">${escapeHtml(direccion)}</p>
      <p style="margin:0;color:#374151;font-size:14px;">${escapeHtml(municipio)}, ${escapeHtml(departamento)}</p>
      ${referencia ? `<p style="margin:6px 0 0 0;color:#6b7280;font-size:13px;">Referencia: ${escapeHtml(referencia)}</p>` : ''}
    </div>`
}

function orderSummaryHtml({ id, resumen, total }) {
  return `
    <p style="margin:0 0 4px 0;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Pedido #${escapeHtml(shortId(id))}</p>
    <table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 8px 0;">${resumenToHtml(resumen)}</table>
    <table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 24px 0;">
      <tr>
        <td style="padding:8px 0;color:#111827;font-size:15px;font-weight:700;">Total pagado</td>
        <td style="padding:8px 0;color:#111827;font-size:18px;font-weight:800;text-align:right;">${escapeHtml(money(total))}</td>
      </tr>
    </table>`
}

/* ---------- Al dueño: nuevo pedido pagado ---------- */
export function buildVendorEmailHtml(order, { siteUrl } = {}) {
  const { nombreCliente, telefono, correoCliente, tieneReceta, recetaAttachment } = order
  const receta = recetaAttachment
    ? `<p style="margin:0 0 16px 0;color:#0e7490;background-color:#ecfeff;border-radius:12px;padding:12px 16px;font-size:13px;">📎 Receta adjunta (${escapeHtml(recetaAttachment.filename)}). El cliente espera la cotización de sus lentes.</p>`
    : tieneReceta
      ? `<p style="margin:0 0 16px 0;color:#b45309;background-color:#fffbeb;border-radius:12px;padding:12px 16px;font-size:13px;">⚠️ El cliente subió una receta, pero ya no estaba disponible al confirmar el pago. Pídesela por WhatsApp.</p>`
      : ''

  const bodyHtml = `
    ${orderSummaryHtml(order)}
    <div style="border-top:1px solid #e5e7eb;padding-top:16px;margin:0 0 20px 0;font-size:14px;color:#111827;line-height:1.7;">
      <strong>Cliente:</strong> ${escapeHtml(nombreCliente)}<br>
      <strong>Teléfono:</strong> ${escapeHtml(telefono)}<br>
      <strong>Correo:</strong> ${escapeHtml(correoCliente)}
    </div>
    ${shippingAddressHtml(order)}
    ${receta}
  `
  return emailLayout({
    preheader: `${nombreCliente} pagó ${money(order.total)}`,
    heading: 'Nuevo pedido pagado',
    subheading: order.asunto,
    bodyHtml,
    siteUrl,
  })
}

/* ---------- Al cliente: pago confirmado ---------- */
export function buildCustomerEmailHtml(order, { siteUrl } = {}) {
  const { nombreCliente, tieneReceta } = order
  const nombre = String(nombreCliente || '').split(' ')[0] || ''
  const site = safeUrl(siteUrl)

  const bodyHtml = `
    <p style="margin:0 0 20px 0;color:#374151;font-size:15px;line-height:1.6;">${nombre ? `¡Hola ${escapeHtml(nombre)}! ` : ''}Recibimos tu pago correctamente. Estos son los detalles de tu pedido:</p>
    ${orderSummaryHtml(order)}
    ${shippingAddressHtml(order)}
    ${
      tieneReceta
        ? `<p style="margin:0 0 20px 0;color:#0e7490;background-color:#ecfeff;border-radius:12px;padding:14px 16px;font-size:14px;line-height:1.6;">Recibimos tu receta. Te enviaremos la cotización de tus lentes por WhatsApp; recuerda que el precio de los aros no incluye lentes: se pagan aparte, solo si aceptas la cotización.</p>`
        : ''
    }
    <p style="margin:0 0 8px 0;color:#111827;font-size:15px;font-weight:700;">¿Qué sigue?</p>
    <p style="margin:0 0 24px 0;color:#374151;font-size:14px;line-height:1.6;">Preparamos tu pedido y te avisaremos por correo cuando salga, con el número de guía para que lo sigas. Si algo de la dirección está incorrecto, respóndenos a este correo.</p>
    ${site ? `<div style="text-align:center;">${button('Ver mis pedidos', `${site.replace(/\/$/, '')}/mi-cuenta`)}</div>` : ''}
  `
  return emailLayout({
    preheader: `Pedido #${shortId(order.id)} · ${money(order.total)}`,
    heading: '¡Gracias por tu compra!',
    subheading: 'Tu pago fue confirmado',
    bodyHtml,
    siteUrl,
  })
}

/* ---------- Al cliente: pedido enviado ---------- */
export function buildShippedEmailHtml(order, { siteUrl } = {}) {
  const nombre = String(order.nombre_cliente || '').split(' ')[0] || ''
  const trackingUrl = safeUrl(order.tracking_url)
  const bodyHtml = `
    <p style="margin:0 0 20px 0;color:#374151;font-size:15px;line-height:1.6;">${nombre ? `¡Hola ${escapeHtml(nombre)}! ` : ''}Tu pedido #${escapeHtml(shortId(order.id))} ya va en camino.</p>
    <div style="background-color:#f9fafb;border-radius:14px;padding:16px 20px;margin:0 0 20px 0;font-size:14px;color:#111827;line-height:1.7;">
      ${order.courier_name ? `<strong>Empresa de envío:</strong> ${escapeHtml(order.courier_name)}<br>` : ''}
      ${order.tracking_number ? `<strong>Número de guía:</strong> ${escapeHtml(order.tracking_number)}` : ''}
    </div>
    ${shippingAddressHtml(order)}
    ${trackingUrl ? `<div style="text-align:center;margin:0 0 8px 0;">${button('Rastrear mi pedido', trackingUrl)}</div>` : ''}
  `
  return emailLayout({
    preheader: order.tracking_number ? `Guía ${order.tracking_number}` : 'Tu pedido va en camino',
    heading: 'Tu pedido va en camino 📦',
    subheading: order.asunto,
    bodyHtml,
    siteUrl,
  })
}

/* ---------- Al cliente: bienvenida al registrarse ---------- */
export function buildWelcomeEmailHtml({ nombre, siteUrl, unsubscribeUrl, aceptaMarketing }) {
  const first = String(nombre || '').split(' ')[0] || ''
  const site = safeUrl(siteUrl)?.replace(/\/$/, '') || ''
  const bodyHtml = `
    <p style="margin:0 0 20px 0;color:#374151;font-size:15px;line-height:1.6;">${first ? `¡Hola ${escapeHtml(first)}! ` : ''}Gracias por crear tu cuenta en ${BRAND}. Desde ahora puedes comprar en línea, guardar tus direcciones y seguir tus pedidos.</p>
    <table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 24px 0;">
      <tr><td style="padding:10px 0;border-bottom:1px solid #eef0f3;font-size:14px;color:#374151;">🚚 &nbsp;Envíos a todo El Salvador</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #eef0f3;font-size:14px;color:#374151;">👓 &nbsp;Aros oftálmicos y lentes de sol de las mejores marcas</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #eef0f3;font-size:14px;color:#374151;">🩺 &nbsp;Exámenes de la vista en nuestras 4 sucursales</td></tr>
    </table>
    ${site ? `<div style="text-align:center;margin:0 0 24px 0;">${button('Ver el catálogo', `${site}/aros-oftalmicos`)}</div>` : ''}
    ${
      !aceptaMarketing && site
        ? `<p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;text-align:center;">¿Quieres enterarte primero de las ofertas y nuevas colecciones? Actívalo en <a href="${escapeHtml(`${site}/mi-cuenta`)}" style="color:${BRAND_COLOR};">Mi cuenta</a>.</p>`
        : ''
    }
  `
  return emailLayout({
    preheader: 'Tu cuenta está lista',
    heading: `Bienvenido a ${BRAND}`,
    bodyHtml,
    siteUrl,
    footerExtraHtml: aceptaMarketing && unsubscribeUrl ? unsubscribeFooter(unsubscribeUrl) : '',
  })
}

export function unsubscribeFooter(unsubscribeUrl) {
  const url = safeUrl(unsubscribeUrl)
  if (!url) return ''
  return `<p style="margin:0;">Recibes este correo porque aceptaste novedades de ${BRAND}. <a href="${escapeHtml(url)}" style="color:#9ca3af;">Darme de baja</a></p>`
}

/* ---------- Página simple de confirmación de baja ---------- */
export function buildUnsubscribePageHtml({ ok, siteUrl }) {
  const site = safeUrl(siteUrl)
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${BRAND}</title></head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f3f4f6;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:16px;">
<div style="max-width:420px;background:#fff;border-radius:20px;padding:32px;text-align:center;border:1px solid #e5e7eb;">
<h1 style="margin:0 0 8px 0;font-size:22px;color:${DARK};">${ok ? 'Listo, te dimos de baja' : 'Enlace no válido'}</h1>
<p style="margin:0 0 20px 0;color:#6b7280;font-size:15px;line-height:1.6;">${
    ok
      ? 'Ya no recibirás correos de ofertas y novedades. Seguirás recibiendo los avisos de tus pedidos.'
      : 'Este enlace de baja no es válido o está incompleto. Puedes cambiar tus preferencias desde Mi cuenta.'
  }</p>
${site ? `<a href="${escapeHtml(site)}" style="color:${BRAND_COLOR};font-weight:700;text-decoration:none;">Volver a la tienda</a>` : ''}
</div></body></html>`
}

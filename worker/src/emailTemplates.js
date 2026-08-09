const BRAND_COLOR = '#0891b2'

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function resumenToHtml(resumen) {
  return resumen
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map(
      (line) =>
        `<p style="margin:0 0 8px 0;color:#374151;font-size:14px;line-height:1.5;">${escapeHtml(line)}</p>`
    )
    .join('')
}

function emailLayout({ heading, subheading, bodyHtml }) {
  return `
<div style="background-color:#f3f4f6;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background-color:${BRAND_COLOR};padding:24px 32px;">
      <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;opacity:0.85;">Óptica MasVision</p>
      <h1 style="margin:8px 0 0 0;color:#ffffff;font-size:22px;font-weight:700;">${escapeHtml(heading)}</h1>
      ${subheading ? `<p style="margin:6px 0 0 0;color:#e0f2fe;font-size:14px;">${escapeHtml(subheading)}</p>` : ''}
    </div>
    <div style="padding:28px 32px;">
      ${bodyHtml}
    </div>
    <div style="padding:18px 32px;background-color:#f9fafb;border-top:1px solid #e5e7eb;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">Óptica MasVision · Correo generado automáticamente, no responder directamente a esta dirección.</p>
    </div>
  </div>
</div>`
}

function shippingAddressHtml({ departamento, municipio, direccion, referencia }) {
  return `
    <div style="background-color:#f9fafb;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0 0 8px 0;color:#111827;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Dirección de envío</p>
      <p style="margin:0 0 4px 0;color:#374151;font-size:14px;">${escapeHtml(direccion)}</p>
      <p style="margin:0 0 4px 0;color:#374151;font-size:14px;">${escapeHtml(municipio)}, ${escapeHtml(departamento)}</p>
      ${referencia ? `<p style="margin:0;color:#6b7280;font-size:13px;">Referencia: ${escapeHtml(referencia)}</p>` : ''}
    </div>`
}

function totalRow(total) {
  return `
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <tr>
        <td style="padding:6px 0;color:#6b7280;font-size:13px;">Total pagado</td>
        <td style="padding:6px 0;color:#111827;font-size:16px;font-weight:700;text-align:right;">$${escapeHtml(String(total))}</td>
      </tr>
    </table>`
}

export function buildVendorEmailHtml(order) {
  const { asunto, resumen, total, nombreCliente, telefono, correoCliente, recetaAttachment } = order

  const bodyHtml = `
    <p style="margin:0 0 20px 0;color:#111827;font-size:15px;">Se confirmó el pago de un pedido. Aquí el detalle:</p>

    <div style="background-color:#f9fafb;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      ${resumenToHtml(resumen)}
    </div>

    ${totalRow(total)}

    <div style="border-top:1px solid #e5e7eb;padding-top:16px;margin-bottom:20px;">
      <p style="margin:0 0 6px 0;color:#111827;font-size:14px;"><strong>Cliente:</strong> ${escapeHtml(nombreCliente)}</p>
      <p style="margin:0 0 6px 0;color:#111827;font-size:14px;"><strong>Teléfono:</strong> ${escapeHtml(telefono)}</p>
      <p style="margin:0;color:#111827;font-size:14px;"><strong>Correo:</strong> ${escapeHtml(correoCliente)}</p>
    </div>

    ${shippingAddressHtml(order)}

    ${
      recetaAttachment
        ? `<p style="margin:16px 0 0 0;color:${BRAND_COLOR};font-size:13px;">📎 Receta médica adjunta: ${escapeHtml(recetaAttachment.filename)}</p>`
        : ''
    }
  `

  return emailLayout({ heading: 'Nuevo pedido pagado', subheading: asunto, bodyHtml })
}

export function buildCustomerEmailHtml(order) {
  const { asunto, resumen, total, nombreCliente } = order

  const bodyHtml = `
    <p style="margin:0 0 20px 0;color:#111827;font-size:15px;">¡Hola ${escapeHtml(nombreCliente)}! Gracias por tu compra, confirmamos que tu pago fue recibido correctamente.</p>

    <div style="background-color:#f9fafb;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      ${resumenToHtml(resumen)}
    </div>

    ${totalRow(total)}

    ${shippingAddressHtml(order)}

    <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">
      Nos pondremos en contacto contigo muy pronto para coordinar la entrega a la dirección de arriba. Si algo está incorrecto o tienes alguna duda, puedes escribirnos por WhatsApp.
    </p>
  `

  return emailLayout({ heading: '¡Pago confirmado!', subheading: asunto, bodyHtml })
}

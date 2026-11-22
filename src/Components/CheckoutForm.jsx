import { Upload, FileText, Trash2, MapPin, Plus, Glasses, CheckCircle2 } from 'lucide-react'
import { DEPARTAMENTOS_SV } from '../hooks/useCheckoutForm'

export default function CheckoutForm({ user, checkout, onSubmit, isSubmitting }) {
  const {
    telefono,
    handleTelefonoChange,
    addresses,
    addressesLoading,
    selectedAddressId,
    setSelectedAddressId,
    newAddress,
    handleNewAddressChange,
    setShowNewAddressForm,
    usingNewAddress,
    guardarDireccion,
    setGuardarDireccion,
    aceptaMarketing,
    modoReceta,
    setModoReceta,
    setAceptaMarketing,
    recetaFile,
    handleFileChange,
    removeFile,
    errors,
  } = checkout

  return (
    <form onSubmit={onSubmit} className="flex-1 flex flex-col px-6 py-5">
      <div className="space-y-4 flex-1">
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
          {user?.photoURL && (
            <img src={user.photoURL} alt={user.displayName} className="w-9 h-9 rounded-full" referrerPolicy="no-referrer" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.displayName}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        <div>
          <label htmlFor="telefono" className="block text-sm font-semibold text-gray-800 mb-1.5">
            Teléfono
          </label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            value={telefono}
            onChange={handleTelefonoChange}
            placeholder="Ej. 7149 7972"
            className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
              errors.telefono ? 'border-red-400' : 'border-gray-200'
            }`}
          />
          {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
        </div>

        <div className="pt-2 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-800 mb-3">Dirección de envío</p>
          <p className="text-xs text-gray-500 mb-3">Envío de $6.00 por pedido a todo El Salvador.</p>

          {addressesLoading && <p className="text-sm text-gray-400">Cargando tus direcciones...</p>}

          {!addressesLoading && !usingNewAddress && (
            <div className="space-y-2">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${
                    selectedAddressId === addr.id ? 'border-cyan-600 bg-cyan-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="selectedAddress"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                    className="mt-1"
                  />
                  <div className="min-w-0">
                    {addr.etiqueta && <p className="text-xs font-bold text-cyan-700">{addr.etiqueta}</p>}
                    <p className="text-sm text-gray-800">{addr.direccion}</p>
                    <p className="text-xs text-gray-500">
                      {addr.municipio}, {addr.departamento}
                    </p>
                  </div>
                </label>
              ))}
              {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}

              <button
                type="button"
                onClick={() => setShowNewAddressForm(true)}
                className="flex items-center gap-1.5 text-sm font-semibold text-cyan-600 hover:text-cyan-700 pt-1"
              >
                <Plus size={16} /> Usar otra dirección
              </button>
            </div>
          )}

          {!addressesLoading && usingNewAddress && (
            <div>
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(false)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700 mb-3"
                >
                  <MapPin size={16} /> Elegir una dirección guardada
                </button>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="departamento" className="block text-sm font-semibold text-gray-800 mb-1.5">
                    Departamento
                  </label>
                  <select
                    id="departamento"
                    name="departamento"
                    value={newAddress.departamento}
                    onChange={handleNewAddressChange}
                    className={`w-full rounded-xl border px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      errors.departamento ? 'border-red-400' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Selecciona...</option>
                    {DEPARTAMENTOS_SV.map((depto) => (
                      <option key={depto} value={depto}>
                        {depto}
                      </option>
                    ))}
                  </select>
                  {errors.departamento && <p className="text-red-500 text-xs mt-1">{errors.departamento}</p>}
                </div>

                <div>
                  <label htmlFor="municipio" className="block text-sm font-semibold text-gray-800 mb-1.5">
                    Municipio / Ciudad
                  </label>
                  <input
                    id="municipio"
                    name="municipio"
                    type="text"
                    value={newAddress.municipio}
                    onChange={handleNewAddressChange}
                    placeholder="Ej. Santa Tecla"
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      errors.municipio ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {errors.municipio && <p className="text-red-500 text-xs mt-1">{errors.municipio}</p>}
                </div>
              </div>

              <div className="mt-3">
                <label htmlFor="direccion" className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Dirección exacta
                </label>
                <textarea
                  id="direccion"
                  name="direccion"
                  rows={2}
                  value={newAddress.direccion}
                  onChange={handleNewAddressChange}
                  placeholder="Calle, colonia, número de casa..."
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    errors.direccion ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion}</p>}
              </div>

              <div className="mt-3">
                <label htmlFor="referencia" className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Punto de referencia <span className="font-normal text-gray-400">(opcional)</span>
                </label>
                <input
                  id="referencia"
                  name="referencia"
                  type="text"
                  value={newAddress.referencia}
                  onChange={handleNewAddressChange}
                  placeholder="Ej. Frente a la iglesia, casa de dos plantas color blanco"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <label className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={guardarDireccion}
                  onChange={(e) => setGuardarDireccion(e.target.checked)}
                  className="rounded"
                />
                Guardar esta dirección para la próxima vez
              </label>
            </div>
          )}
        </div>

        <section
          aria-labelledby="receta-titulo"
          className="rounded-2xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-4 sm:p-5"
        >
          <div className="flex items-start gap-3 mb-3">
            <span className="w-10 h-10 shrink-0 rounded-xl bg-cyan-600 text-white flex items-center justify-center">
              <Glasses size={20} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 id="receta-titulo" className="text-base font-bold text-gray-900">
                  ¿Quieres lentes graduados?
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-full">
                  Opcional
                </span>
              </div>
              <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                <strong className="text-gray-900">El precio es solo del aro, no incluye lentes.</strong> Sube tu receta y
                te cotizamos tus lentes.
              </p>
            </div>
          </div>

          <ol className="grid grid-cols-3 gap-2 mb-4 text-center">
            {['Sube tu receta', 'Te enviamos la cotización por WhatsApp', 'Pagas los lentes solo si aceptas'].map((paso, i) => (
              <li key={paso} className="rounded-xl bg-white border border-cyan-100 px-2 py-2.5">
                <span className="mx-auto mb-1 w-5 h-5 rounded-full bg-cyan-600 text-white text-[11px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="block text-[11px] leading-snug text-gray-700">{paso}</span>
              </li>
            ))}
          </ol>

          {recetaFile ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-emerald-800">Receta lista</p>
                  <p className="text-xs text-emerald-700 truncate flex items-center gap-1">
                    <FileText size={12} className="shrink-0" /> {recetaFile.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                aria-label="Quitar receta"
                className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <label
              htmlFor="receta"
              className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-cyan-300 bg-white px-4 py-5 text-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 transition-colors"
            >
              <Upload size={22} className="text-cyan-600" />
              <span className="text-sm font-semibold text-gray-800">Sube una foto o PDF de tu receta</span>
              <span className="text-xs text-gray-500">JPG, PNG o PDF · máx. 5 MB</span>
              <input
                id="receta"
                name="receta"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
          {errors.receta && <p className="text-red-500 text-xs mt-1">{errors.receta}</p>}

          {recetaFile && (
            <fieldset className="mt-4 space-y-2">
              <legend className="text-sm font-semibold text-gray-900 mb-2">¿Qué quieres hacer?</legend>
              {[
                {
                  value: 'cotizar',
                  title: 'Aro + lentes: pedir cotización',
                  text: 'No pagas ahora. Te enviamos el precio de tus lentes y pagas todo junto, una sola vez.',
                },
                {
                  value: 'pagar',
                  title: 'Solo el aro: pagar ahora',
                  text: 'Pagas el aro ahora. Los lentes los ves después con nosotros.',
                },
              ].map((op) => (
                <label
                  key={op.value}
                  className={`flex items-start gap-3 rounded-xl border-2 bg-white px-4 py-3 cursor-pointer transition-colors ${
                    modoReceta === op.value ? 'border-cyan-600' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="modoReceta"
                    value={op.value}
                    checked={modoReceta === op.value}
                    onChange={() => setModoReceta(op.value)}
                    className="mt-1 accent-cyan-600"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-gray-900">{op.title}</span>
                    <span className="block text-xs text-gray-500 mt-0.5 leading-relaxed">{op.text}</span>
                  </span>
                </label>
              ))}
            </fieldset>
          )}

          <p className="text-xs text-gray-500 mt-3">
            ¿No tienes receta?{' '}
            <a
              href="https://wa.me/50371497972?text=Hola, quiero agendar un examen de la vista en Óptica Más Visión"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-cyan-700 hover:underline"
            >
              Agenda tu examen de la vista
            </a>
          </p>
        </section>
      </div>

      <label className="flex items-start gap-3 mt-6 text-sm text-gray-600 cursor-pointer">
        <input
          type="checkbox"
          checked={aceptaMarketing}
          onChange={(e) => setAceptaMarketing(e.target.checked)}
          className="mt-0.5 rounded"
        />
        <span>Quiero recibir por correo ofertas y nuevas colecciones de Óptica Más Visión. Puedo darme de baja cuando quiera.</span>
      </label>

      <div className="sticky bottom-0 mt-6 pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3.5 rounded-xl font-semibold shadow-md transition-all"
        >
          {recetaFile && modoReceta === 'cotizar'
            ? isSubmitting
              ? 'Enviando tu receta...'
              : 'Pedir cotización (no pagas ahora)'
            : isSubmitting
              ? 'Redirigiendo a pago...'
              : 'Ir a pagar'}
        </button>
      </div>
    </form>
  )
}
import { Upload, FileText, Trash2, MapPin, Plus } from 'lucide-react'
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
          <p className="text-xs text-gray-500 mb-3">Hacemos envíos a todo El Salvador.</p>

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

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            Receta médica <span className="font-normal text-gray-400">(opcional)</span>
          </label>

          {recetaFile ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={18} className="text-cyan-600 shrink-0" />
                <span className="text-sm text-gray-700 truncate">{recetaFile.name}</span>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <label
              htmlFor="receta"
              className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 px-4 py-6 text-center cursor-pointer hover:border-cyan-400 hover:bg-cyan-50/40 transition-colors"
            >
              <Upload size={20} className="text-gray-400" />
              <span className="text-sm text-gray-600">Sube una foto o PDF de tu fórmula</span>
              <span className="text-xs text-gray-400">JPG, PNG o PDF · máx. 5MB</span>
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
        </div>
      </div>

      <div className="sticky bottom-0 mt-6 pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3.5 rounded-xl font-semibold shadow-md transition-all"
        >
          {isSubmitting ? 'Redirigiendo a pago...' : 'Ir a pagar'}
        </button>
      </div>
    </form>
  )
}
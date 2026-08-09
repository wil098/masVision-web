import { useEffect, useState } from 'react'
import { Package, MapPin, Trash2, Plus, Truck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import LoginGate from '../Components/LoginGate'
import { DEPARTAMENTOS_SV } from '../hooks/useCheckoutForm'
import { fetchOrders, fetchAddresses, saveAddress, deleteAddress } from '../lib/orderService'

const STATUS_STYLES = {
  pendiente: 'bg-amber-100 text-amber-700',
  pagado: 'bg-green-100 text-green-700',
  fallido: 'bg-red-100 text-red-700',
}

const STATUS_LABELS = {
  pendiente: 'Pendiente de pago',
  pagado: 'Pagado',
  fallido: 'Pago fallido',
}

const EMPTY_ADDRESS = { etiqueta: '', departamento: '', municipio: '', direccion: '', referencia: '' }

function OrdersSection({ getIdToken }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchOrders(getIdToken)
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <p className="text-sm text-gray-400">Cargando tus pedidos...</p>
  if (error) return <p className="text-sm text-red-500">{error}</p>
  if (orders.length === 0) return <p className="text-sm text-gray-500">Todavía no tienes pedidos.</p>

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="font-bold text-gray-800">{order.asunto}</p>
              <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString('es-SV')}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>
          <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans mb-3">{order.resumen}</pre>
          <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-3">
            <span className="text-gray-500">
              Envío: {order.municipio}, {order.departamento}
            </span>
            <span className="font-bold text-gray-900">${Number(order.total).toFixed(2)}</span>
          </div>
          {order.tracking_number && (
            <div className="mt-3 flex items-center gap-2 bg-cyan-50 text-cyan-700 rounded-xl px-4 py-2.5 text-sm">
              <Truck size={16} className="shrink-0" />
              {order.tracking_url ? (
                <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
                  {order.courier_name ? `${order.courier_name}: ` : ''}
                  {order.tracking_number}
                </a>
              ) : (
                <span className="font-semibold">
                  {order.courier_name ? `${order.courier_name}: ` : ''}
                  {order.tracking_number}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function AddressesSection({ getIdToken }) {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [newAddress, setNewAddress] = useState(EMPTY_ADDRESS)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    fetchAddresses(getIdToken)
      .then(setAddresses)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    const { name, value } = e.target
    setNewAddress((prev) => ({ ...prev, [name]: value }))
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newAddress.departamento || !newAddress.municipio || !newAddress.direccion) return
    setSaving(true)
    try {
      await saveAddress(newAddress, getIdToken)
      setNewAddress(EMPTY_ADDRESS)
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteAddress(id, getIdToken)
      setAddresses((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <p className="text-sm text-gray-400">Cargando tus direcciones...</p>

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-500">{error}</p>}

      {addresses.map((addr) => (
        <div key={addr.id} className="flex items-start justify-between gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="min-w-0">
            {addr.etiqueta && <p className="text-xs font-bold text-cyan-700">{addr.etiqueta}</p>}
            <p className="text-sm text-gray-800">{addr.direccion}</p>
            <p className="text-xs text-gray-500">
              {addr.municipio}, {addr.departamento}
            </p>
            {addr.referencia && <p className="text-xs text-gray-400 mt-1">Ref: {addr.referencia}</p>}
          </div>
          <button
            onClick={() => handleDelete(addr.id)}
            className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
            title="Eliminar dirección"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}

      {showForm ? (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <input
            name="etiqueta"
            value={newAddress.etiqueta}
            onChange={handleChange}
            placeholder="Etiqueta (opcional, ej. Casa)"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              name="departamento"
              value={newAddress.departamento}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">Departamento...</option>
              {DEPARTAMENTOS_SV.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <input
              name="municipio"
              value={newAddress.municipio}
              onChange={handleChange}
              placeholder="Municipio / Ciudad"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <textarea
            name="direccion"
            rows={2}
            value={newAddress.direccion}
            onChange={handleChange}
            placeholder="Dirección exacta"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <input
            name="referencia"
            value={newAddress.referencia}
            onChange={handleChange}
            placeholder="Punto de referencia (opcional)"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm font-semibold text-cyan-600 hover:text-cyan-700"
        >
          <Plus size={16} /> Agregar dirección
        </button>
      )}
    </div>
  )
}

export default function MiCuenta() {
  const { user, getIdToken } = useAuth()

  if (!user) {
    return (
      <section className="min-h-screen pt-28 pb-16 bg-gradient-to-b from-gray-50 to-white px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm">
          <LoginGate message="Inicia sesión para ver tu historial de pedidos y direcciones guardadas." />
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen pt-28 pb-16 bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="max-w-3xl mx-auto space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi cuenta</h1>
          <p className="text-gray-500">{user.email}</p>
        </div>

        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-4">
            <Package size={22} className="text-cyan-600" /> Mis pedidos
          </h2>
          <OrdersSection getIdToken={getIdToken} />
        </div>

        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-4">
            <MapPin size={22} className="text-cyan-600" /> Mis direcciones
          </h2>
          <AddressesSection getIdToken={getIdToken} />
        </div>
      </div>
    </section>
  )
}
import { useEffect, useState } from 'react'
import { Package, ShoppingBag, Users, Plus, Trash2, Pencil, X, Upload, SlidersHorizontal } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import LoginGate from '../Components/LoginGate'
import {
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  uploadAdminImage,
  fetchAdminOrders,
  updateAdminOrder,
  fetchAdminCustomers,
  fetchAdminLensOptions,
  createAdminLensOption,
  updateAdminLensOption,
  deleteAdminLensOption,
} from '../lib/adminService'

const TABS = [
  { id: 'productos', label: 'Productos', icon: Package },
  { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'lentes', label: 'Lentes', icon: SlidersHorizontal },
]

const STATUS_STYLES = {
  pendiente: 'bg-amber-100 text-amber-700',
  pagado: 'bg-green-100 text-green-700',
  fallido: 'bg-red-100 text-red-700',
}

const EMPTY_PRODUCT = {
  codigo: '',
  categoria: 'oftalmico',
  name: '',
  description: '',
  price: '',
  brand: '',
  material: '',
  forma: '',
  caracteristicas: '',
  colores_disponibles: [],
  medidas_disponibles: [],
  images: [],
  disponible: true,
  destacado: false,
}

/* ---------- Productos ---------- */
// Datos viejos guardaban solo el código de color como texto (ej. "C1"); a
// partir de ahora cada color también lleva un hex para mostrarlo como
// swatch. Esto normaliza ambos formatos al abrir el formulario.
function normalizeColor(color) {
  if (typeof color === 'string') return { nombre: color, hex: '#9ca3af', images: [] }
  return { images: [], ...color }
}

// Fotos propias de un color específico (ej. el aro en negro vs. en carey).
// Si un color no tiene ninguna, la página del producto usa las imágenes
// generales del producto como respaldo.
function ColorImagesEditor({ images, onChangeImages, getIdToken }) {
  const [newUrl, setNewUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const addUrl = () => {
    if (!newUrl.trim()) return
    onChangeImages([...images, newUrl.trim()])
    setNewUrl('')
  }

  const removeImage = (idx) => {
    onChangeImages(images.filter((_, i) => i !== idx))
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const url = await uploadAdminImage(file, getIdToken)
      onChangeImages([...images, url])
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mt-2 pl-3 border-l-2 border-gray-100">
      <p className="text-[11px] font-semibold text-gray-500 mb-1.5">Fotos de este color (opcional)</p>
      {images.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {images.map((img, idx) => (
            <div key={img + idx} className="relative w-12 h-12 rounded-lg border border-gray-200 overflow-hidden group">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-1.5">
        <input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="URL de imagen"
          className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs"
        />
        <button type="button" onClick={addUrl} className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold">
          Agregar
        </button>
        <label className="flex items-center gap-1 px-2 py-1.5 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 rounded-lg text-xs font-semibold cursor-pointer">
          <Upload size={12} />
          {uploading ? 'Subiendo...' : 'Subir'}
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function ProductForm({ initial, onCancel, onSaved, getIdToken }) {
  const isEditing = Boolean(initial)
  const [form, setForm] = useState(() => {
    const base = initial ? { ...EMPTY_PRODUCT, ...initial, price: String(initial.price) } : EMPTY_PRODUCT
    return {
      ...base,
      colores_disponibles: (base.colores_disponibles || []).map(normalizeColor),
      medidas_disponibles: base.medidas_disponibles || [],
    }
  })
  const [newImageUrl, setNewImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const addColor = () => {
    setForm((prev) => ({
      ...prev,
      colores_disponibles: [...prev.colores_disponibles, { nombre: '', hex: '#9ca3af', images: [] }],
    }))
  }

  const updateColor = (idx, changes) => {
    setForm((prev) => ({
      ...prev,
      colores_disponibles: prev.colores_disponibles.map((c, i) => (i === idx ? { ...c, ...changes } : c)),
    }))
  }

  const removeColor = (idx) => {
    setForm((prev) => ({ ...prev, colores_disponibles: prev.colores_disponibles.filter((_, i) => i !== idx) }))
  }

  const addMedida = () => {
    setForm((prev) => ({
      ...prev,
      medidas_disponibles: [...prev.medidas_disponibles, { calibre: '', puente: '', varilla: '' }],
    }))
  }

  const updateMedida = (idx, changes) => {
    setForm((prev) => ({
      ...prev,
      medidas_disponibles: prev.medidas_disponibles.map((m, i) => (i === idx ? { ...m, ...changes } : m)),
    }))
  }

  const removeMedida = (idx) => {
    setForm((prev) => ({ ...prev, medidas_disponibles: prev.medidas_disponibles.filter((_, i) => i !== idx) }))
  }

  const addImageUrl = () => {
    if (!newImageUrl.trim()) return
    setForm((prev) => ({ ...prev, images: [...prev.images, newImageUrl.trim()] }))
    setNewImageUrl('')
  }

  const removeImage = (idx) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const url = await uploadAdminImage(file, getIdToken)
      setForm((prev) => ({ ...prev, images: [...prev.images, url] }))
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.codigo || !form.name || !Number.isFinite(Number(form.price))) {
      setError('Código, nombre y precio son obligatorios.')
      return
    }

    const payload = {
      ...form,
      price: Number(form.price),
      colores_disponibles: form.colores_disponibles
        .map((c) => ({ nombre: c.nombre.trim(), hex: c.hex, images: c.images || [] }))
        .filter((c) => c.nombre),
      medidas_disponibles: form.medidas_disponibles
        .map((m) => ({ calibre: m.calibre.trim(), puente: m.puente.trim(), varilla: m.varilla.trim() }))
        .filter((m) => m.calibre || m.puente || m.varilla),
    }

    setSaving(true)
    try {
      if (isEditing) {
        await updateAdminProduct(form.codigo, payload, getIdToken)
      } else {
        await createAdminProduct(payload, getIdToken)
      }
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Código</label>
          <input
            name="codigo"
            value={form.codigo}
            onChange={handleChange}
            disabled={isEditing}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Categoría</label>
          <select
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white"
          >
            <option value="oftalmico">Oftálmico</option>
            <option value="sol">Sol</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre</label>
        <input name="name" value={form.name} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Descripción</label>
        <textarea
          name="description"
          value={form.description || ''}
          onChange={handleChange}
          rows={2}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Precio (USD)</label>
          <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Marca</label>
          <input name="brand" value={form.brand} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">Medidas disponibles (calibre / puente / varilla)</label>
        <div className="space-y-2 mb-2">
          {form.medidas_disponibles.map((medida, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                value={medida.calibre}
                onChange={(e) => updateMedida(idx, { calibre: e.target.value })}
                placeholder="Calibre (ej. 56 mm)"
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <input
                value={medida.puente}
                onChange={(e) => updateMedida(idx, { puente: e.target.value })}
                placeholder="Puente (ej. 18 mm)"
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <input
                value={medida.varilla}
                onChange={(e) => updateMedida(idx, { varilla: e.target.value })}
                placeholder="Varilla (ej. 145 mm)"
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <button type="button" onClick={() => removeMedida(idx)} className="p-2 text-gray-400 hover:text-red-500 transition-colors shrink-0">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addMedida} className="flex items-center gap-1.5 text-sm font-semibold text-cyan-600 hover:text-cyan-700">
          <Plus size={16} /> Agregar medida
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Material</label>
          <input name="material" value={form.material || ''} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Forma</label>
          <input
            name="forma"
            value={form.forma || ''}
            onChange={handleChange}
            placeholder="Ej. Aviador, Redondo"
            list="formas-armazon"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
          <datalist id="formas-armazon">
            <option value="Aviador" />
            <option value="Redondo" />
            <option value="Cuadrado" />
            <option value="Ovalado" />
            <option value="Rectangular" />
            <option value="Cat-eye" />
            <option value="Wayfarer" />
          </datalist>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Características (ej. UV 400 - Polarizado)</label>
        <input name="caracteristicas" value={form.caracteristicas || ''} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">Colores disponibles</label>
        <div className="space-y-3 mb-2">
          {form.colores_disponibles.map((color, idx) => (
            <div key={idx} className="rounded-xl border border-gray-100 p-2.5">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color.hex || '#9ca3af'}
                  onChange={(e) => updateColor(idx, { hex: e.target.value })}
                  className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer shrink-0"
                  title="Elegir color"
                />
                <input
                  value={color.nombre}
                  onChange={(e) => updateColor(idx, { nombre: e.target.value })}
                  placeholder="Nombre o código (ej. Negro, C1)"
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
                <button type="button" onClick={() => removeColor(idx)} className="p-2 text-gray-400 hover:text-red-500 transition-colors shrink-0">
                  <X size={16} />
                </button>
              </div>
              <ColorImagesEditor
                images={color.images || []}
                onChangeImages={(images) => updateColor(idx, { images })}
                getIdToken={getIdToken}
              />
            </div>
          ))}
        </div>
        <button type="button" onClick={addColor} className="flex items-center gap-1.5 text-sm font-semibold text-cyan-600 hover:text-cyan-700">
          <Plus size={16} /> Agregar color
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">Imágenes</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {form.images.map((img, idx) => (
            <div key={img + idx} className="relative w-16 h-16 rounded-lg border border-gray-200 overflow-hidden group">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Pegar URL de imagen"
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
          <button type="button" onClick={addImageUrl} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold">
            Agregar
          </button>
          <label className="flex items-center gap-1.5 px-3 py-2 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 rounded-xl text-sm font-semibold cursor-pointer">
            <Upload size={14} />
            {uploading ? 'Subiendo...' : 'Subir'}
            <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} className="hidden" />
          </label>
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="disponible" checked={form.disponible} onChange={handleChange} className="rounded" />
          Disponible
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="destacado" checked={form.destacado} onChange={handleChange} className="rounded" />
          Destacado (aparece en Inicio)
        </label>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm">
          {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </div>
    </form>
  )
}

function ProductsTab({ getIdToken }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null) // null | 'new' | product
  const [deletingCodigo, setDeletingCodigo] = useState(null)

  const load = () => {
    setLoading(true)
    fetchAdminProducts(getIdToken)
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (codigo) => {
    setDeletingCodigo(codigo)
    try {
      await deleteAdminProduct(codigo, getIdToken)
      setProducts((prev) => prev.filter((p) => p.codigo !== codigo))
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingCodigo(null)
    }
  }

  if (editing) {
    return (
      <ProductForm
        initial={editing === 'new' ? null : editing}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null)
          load()
        }}
        getIdToken={getIdToken}
      />
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{products.length} productos</p>
        <button
          onClick={() => setEditing('new')}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl text-sm font-semibold"
        >
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      {loading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.codigo} className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <img src={p.images?.[0]} alt="" className="w-14 h-14 rounded-xl object-cover bg-gray-50 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                <p className="text-xs text-gray-500">
                  {p.codigo} · {p.categoria} · ${p.price} {!p.disponible && '· No disponible'} {p.destacado && '· Destacado'}
                </p>
              </div>
              <button onClick={() => setEditing(p)} className="p-2 text-gray-400 hover:text-cyan-600 transition-colors">
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(p.codigo)}
                disabled={deletingCodigo === p.codigo}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------- Pedidos ---------- */
function OrderRow({ order, getIdToken, onUpdated }) {
  const [editing, setEditing] = useState(false)
  const [courier, setCourier] = useState(order.courier_name || '')
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '')
  const [trackingUrl, setTrackingUrl] = useState(order.tracking_url || '')
  const [status, setStatus] = useState(order.status)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateAdminOrder(
        order.id,
        { courierName: courier, trackingNumber, trackingUrl, status },
        getIdToken
      )
      onUpdated()
      setEditing(false)
    } catch (err) {
      console.error('Error actualizando el pedido:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-800">{order.asunto}</p>
          <p className="text-xs text-gray-500">
            {order.nombre_cliente} · {order.telefono} · {order.correo_cliente}
          </p>
          <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString('es-SV')}</p>
        </div>
        <div className="text-right shrink-0">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {order.status}
          </span>
          <p className="text-sm font-bold text-gray-900 mt-1">${Number(order.total).toFixed(2)}</p>
        </div>
      </div>

      {editing ? (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input value={courier} onChange={(e) => setCourier(e.target.value)} placeholder="Empresa de envío" className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm" />
            <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Número de rastreo" className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm" />
          </div>
          <input value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} placeholder="URL de rastreo (opcional)" className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm bg-white">
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="fallido">Fallido</option>
          </select>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setEditing(false)} className="text-sm text-gray-500 font-semibold px-3 py-1.5">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving} className="text-sm bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white font-semibold px-4 py-1.5 rounded-lg">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setEditing(true)} className="mt-2 text-xs font-semibold text-cyan-600 hover:text-cyan-700">
          {order.tracking_number ? `Rastreo: ${order.tracking_number}` : 'Editar envío / estado'}
        </button>
      )}
    </div>
  )
}

function OrdersTab({ getIdToken }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('todos')

  const load = () => {
    setLoading(true)
    fetchAdminOrders(getIdToken)
      .then(setOrders)
      .finally(() => setLoading(false))
  }

  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = filter === 'todos' ? orders : orders.filter((o) => o.status === filter)

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {['todos', 'pendiente', 'pagado', 'fallido'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${
              filter === f ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500">No hay pedidos con ese filtro.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderRow key={order.id} order={order} getIdToken={getIdToken} onUpdated={load} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------- Clientes ---------- */
function CustomersTab({ getIdToken }) {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminCustomers(getIdToken)
      .then(setCustomers)
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <p className="text-sm text-gray-400">Cargando...</p>

  return (
    <div className="space-y-2">
      {customers.map((c) => (
        <div key={c.id} className="flex items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">
              {c.nombre || c.email} {Boolean(c.is_admin) && <span className="text-xs text-cyan-600 font-bold">· ADMIN</span>}
            </p>
            <p className="text-xs text-gray-500">{c.email}</p>
            <p className="text-xs text-gray-400">Cliente desde {new Date(c.created_at).toLocaleDateString('es-SV')}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-gray-900">{c.total_pedidos} pedidos</p>
            <p className="text-xs text-gray-500">${Number(c.total_gastado).toFixed(2)} gastados</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---------- Lentes (filtro, marca, etc.) ---------- */
const EMPTY_LENS_OPTION = { categoria: '', nombre: '', precio_adicional: '', disponible: false }

function LensOptionForm({ initial, onCancel, onSaved, getIdToken }) {
  const isEditing = Boolean(initial)
  const [form, setForm] = useState(
    initial ? { ...EMPTY_LENS_OPTION, ...initial, precio_adicional: initial.precio_adicional ?? '' } : EMPTY_LENS_OPTION
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.categoria.trim() || !form.nombre.trim()) {
      setError('Categoría y nombre son obligatorios.')
      return
    }
    if (form.disponible && form.precio_adicional === '') {
      setError('Define un precio antes de activarla, o déjala desactivada mientras no tengas el precio.')
      return
    }

    const payload = { ...form, precio_adicional: form.precio_adicional === '' ? null : Number(form.precio_adicional) }

    setSaving(true)
    try {
      if (isEditing) {
        await updateAdminLensOption(initial.id, payload, getIdToken)
      } else {
        await createAdminLensOption(payload, getIdToken)
      }
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Categoría</label>
          <input
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            placeholder="Ej. filtro, marca"
            list="lens-categorias"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
          <datalist id="lens-categorias">
            <option value="filtro" />
            <option value="marca" />
            <option value="tratamiento" />
          </datalist>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej. Blue Filter, Kodak"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Precio adicional (USD)</label>
        <input
          name="precio_adicional"
          type="number"
          step="0.01"
          value={form.precio_adicional}
          onChange={handleChange}
          placeholder="Déjalo vacío mientras no tengas el precio real"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" name="disponible" checked={form.disponible} onChange={handleChange} className="rounded" />
        Disponible para clientes
      </label>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm">
          {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear opción'}
        </button>
      </div>
    </form>
  )
}

function LensOptionsTab({ getIdToken }) {
  const [lensOptions, setLensOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null) // null | 'new' | lensOption
  const [deletingId, setDeletingId] = useState(null)

  const load = () => {
    setLoading(true)
    fetchAdminLensOptions(getIdToken)
      .then(setLensOptions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await deleteAdminLensOption(id, getIdToken)
      setLensOptions((prev) => prev.filter((o) => o.id !== id))
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  if (editing) {
    return (
      <LensOptionForm
        initial={editing === 'new' ? null : editing}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null)
          load()
        }}
        getIdToken={getIdToken}
      />
    )
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Configura aquí las opciones de personalización de lente (filtro, marca, etc.). Mientras no tengan precio y
        estén activadas, no aparecen para los clientes — el checkout sigue funcionando igual que hoy.
      </p>

      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{lensOptions.length} opciones</p>
        <button
          onClick={() => setEditing('new')}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl text-sm font-semibold"
        >
          <Plus size={16} /> Nueva opción
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      {loading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : lensOptions.length === 0 ? (
        <p className="text-sm text-gray-500">Todavía no hay opciones de lente configuradas.</p>
      ) : (
        <div className="space-y-2">
          {lensOptions.map((o) => (
            <div key={o.id} className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">
                  {o.nombre} <span className="text-xs font-normal text-gray-400 capitalize">· {o.categoria}</span>
                </p>
                <p className="text-xs text-gray-500">
                  {o.precio_adicional === null ? 'Sin precio definido' : `+$${o.precio_adicional.toFixed(2)}`}
                  {' · '}
                  {o.disponible ? 'Disponible' : 'No disponible'}
                </p>
              </div>
              <button onClick={() => setEditing(o)} className="p-2 text-gray-400 hover:text-cyan-600 transition-colors">
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(o.id)}
                disabled={deletingId === o.id}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------- Componente principal ---------- */
export default function AdminPanel() {
  const { user, isAdmin, loading, getIdToken } = useAuth()
  const [tab, setTab] = useState('productos')

  if (loading) return null

  if (!user) {
    return (
      <section className="min-h-screen pt-28 pb-16 bg-gradient-to-b from-gray-50 to-white px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm">
          <LoginGate message="Inicia sesión para entrar al panel de administración." />
        </div>
      </section>
    )
  }

  if (!isAdmin) {
    return (
      <section className="min-h-screen pt-28 pb-16 bg-gradient-to-b from-gray-50 to-white px-4">
        <div className="max-w-md mx-auto text-center py-16">
          <h1 className="text-xl font-bold text-gray-900 mb-2">No autorizado</h1>
          <p className="text-gray-500 text-sm">Tu cuenta no tiene permisos de administrador.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen pt-28 pb-16 bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Panel de administración</h1>

        <div className="flex gap-1 mb-8 border-b border-gray-200">
          {TABS.map((tabItem) => (
            <button
              key={tabItem.id}
              onClick={() => setTab(tabItem.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === tabItem.id ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tabItem.icon size={16} /> {tabItem.label}
            </button>
          ))}
        </div>

        {tab === 'productos' && <ProductsTab getIdToken={getIdToken} />}
        {tab === 'pedidos' && <OrdersTab getIdToken={getIdToken} />}
        {tab === 'clientes' && <CustomersTab getIdToken={getIdToken} />}
        {tab === 'lentes' && <LensOptionsTab getIdToken={getIdToken} />}
      </div>
    </section>
  )
}

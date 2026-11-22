import { usePageMeta } from '../lib/seo'
import { useEffect, useState } from 'react'
import { Package, ShoppingBag, Users, Plus, Trash2, Pencil, X, Upload, SlidersHorizontal, Image } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import LoginGate from '../Components/LoginGate'
import {
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  renameAdminProductCode,
  uploadAdminImage,
  fetchAdminOrders,
  updateAdminOrder,
  fetchAdminCustomers,
  sendAdminTestEmail,
  sendAdminQuote,
  openAdminReceta,
  fetchAdminLensOptions,
  createAdminLensOption,
  updateAdminLensOption,
  deleteAdminLensOption,
  fetchAdminPromoBlocks,
  createAdminPromoBlock,
  updateAdminPromoBlock,
  deleteAdminPromoBlock,
} from '../lib/adminService'

const TABS = [
  { id: 'productos', label: 'Productos', icon: Package },
  { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'lentes', label: 'Lentes', icon: SlidersHorizontal },
  { id: 'promos', label: 'Promos', icon: Image },
]

const PROMO_PAGINAS = [
  { value: 'aros-oftalmicos', label: 'Aros Oftálmicos' },
  { value: 'aros-sol', label: 'Aros de Sol' },
]

const STATUS_STYLES = {
  pendiente: 'bg-amber-100 text-amber-700',
  pagado: 'bg-green-100 text-green-700',
  fallido: 'bg-red-100 text-red-700',
  cotizacion: 'bg-sky-100 text-sky-700',
  cotizado: 'bg-cyan-100 text-cyan-800',
  cancelado: 'bg-gray-100 text-gray-500',
}

const STATUS_LABELS = {
  pendiente: 'Pendiente de pago',
  pagado: 'Pagado',
  fallido: 'Fallido',
  cotizacion: 'Por cotizar',
  cotizado: 'Cotización enviada',
  cancelado: 'Cancelado',
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
  coleccion: '',
  caracteristicas: '',
  colores_disponibles: [],
  medidas_disponibles: [],
  images: [],
  disponible: true,
  destacado: false,
  nueva_coleccion: false,
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
  const [renamingCode, setRenamingCode] = useState(false)
  const [newCodigo, setNewCodigo] = useState('')
  const [renamingSaving, setRenamingSaving] = useState(false)
  const [renameError, setRenameError] = useState(null)

  const handleRenameCode = async () => {
    setRenameError(null)
    if (!newCodigo.trim() || newCodigo.trim() === form.codigo) {
      setRenameError('Escribe un código distinto al actual.')
      return
    }
    setRenamingSaving(true)
    try {
      await renameAdminProductCode(form.codigo, newCodigo.trim(), getIdToken)
      setForm((prev) => ({ ...prev, codigo: newCodigo.trim() }))
      setRenamingCode(false)
      setNewCodigo('')
    } catch (err) {
      setRenameError(err.message)
    } finally {
      setRenamingSaving(false)
    }
  }

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
          {isEditing && !renamingCode && (
            <button
              type="button"
              onClick={() => {
                setRenamingCode(true)
                setNewCodigo(form.codigo)
              }}
              className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 mt-1"
            >
              Cambiar código
            </button>
          )}
          {isEditing && renamingCode && (
            <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200 space-y-1.5">
              <input
                value={newCodigo}
                onChange={(e) => setNewCodigo(e.target.value)}
                placeholder="Nuevo código"
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs"
              />
              {renameError && <p className="text-red-500 text-xs">{renameError}</p>}
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setRenamingCode(false)
                    setRenameError(null)
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold py-1.5 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleRenameCode}
                  disabled={renamingSaving}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white text-xs font-semibold py-1.5 rounded-lg"
                >
                  {renamingSaving ? 'Guardando...' : 'Guardar código'}
                </button>
              </div>
            </div>
          )}
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
            <option value="Hexagonal" />
            <option value="Wayfarer" />
          </datalist>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Colección (opcional)</label>
        <input
          name="coleccion"
          value={form.coleccion || ''}
          onChange={handleChange}
          placeholder="Ej. Metal Collection"
          list="colecciones"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
        />
        <ColeccionesDatalist />
        <p className="text-[11px] text-gray-400 mt-1">Agrupa este aro bajo el bloque promocional de la misma colección.</p>
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
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="nueva_coleccion"
            checked={form.nueva_coleccion}
            onChange={handleChange}
            className="rounded"
          />
          Nueva colección (aparece en el carousel del Home)
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
                  {p.codigo} · {p.categoria} · ${p.price} {!p.disponible && '· No disponible'} {p.destacado && '· Destacado'}{' '}
                  {p.nueva_coleccion && '· Nueva colección'}
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
function RecetaButton({ orderId, getIdToken }) {
  const [error, setError] = useState(null)
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => openAdminReceta(orderId, getIdToken).catch((e) => setError(e.message))}
        className="text-xs font-semibold text-cyan-700 hover:underline"
      >
        Ver receta
      </button>
      {error && <span className="text-xs text-red-600 ml-2">{error}</span>}
    </div>
  )
}

function whatsappQuoteUrl(order, total, urlPago) {
  const digits = String(order.telefono || '').replace(/\D/g, '')
  const phone = digits.length === 8 ? `503${digits}` : digits
  const nombre = String(order.nombre_cliente || '').split(' ')[0]
  const msg = `Hola ${nombre}, ya revisamos tu receta. El total de tu pedido (aro + lentes + envío) es $${Number(total).toFixed(2)}. Puedes ver tu pedido y pagarlo aquí: ${urlPago}`
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
}

// Cotización de lentes: el admin escribe descripción y precio; se genera un
// solo enlace de pago de Wompi por el total y se envía al cliente.
function QuotePanel({ order, getIdToken, onUpdated }) {
  const [descripcion, setDescripcion] = useState(order.lentes_descripcion || '')
  const [precio, setPrecio] = useState(order.lentes_precio ?? '')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(
    order.status === 'cotizado' && order.url_pago
      ? { urlPago: order.url_pago, urlPedido: order.url_pedido, total: order.total }
      : null
  )
  const [editingQuote, setEditingQuote] = useState(order.status === 'cotizacion')

  const base = Number(order.total_base ?? order.total)
  const precioNum = Number(precio)
  const totalPreview = Number.isFinite(precioNum) && precioNum > 0 ? base + precioNum : null

  const send = async () => {
    setError(null)
    if (descripcion.trim().length < 3 || !(precioNum > 0)) {
      setError('Escribe la descripción de los lentes y su precio.')
      return
    }
    setSending(true)
    try {
      const r = await sendAdminQuote(order.id, { descripcion: descripcion.trim(), precio: precioNum }, getIdToken)
      setSent({ urlPago: r.urlPago, urlPedido: r.urlPedido, total: r.total, correoEnviado: r.correoEnviado })
      setEditingQuote(false)
      onUpdated()
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mt-3 rounded-xl border-2 border-sky-200 bg-sky-50/60 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-sky-900">Cotización de lentes</p>
        {order.receta_key && <RecetaButton orderId={order.id} getIdToken={getIdToken} />}
      </div>

      {editingQuote ? (
        <>
          <input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción (ej. Lentes CR-39 con antirreflejo)"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1 text-sm">
              <span className="text-gray-500">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="Precio lentes"
                className="w-32 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              />
            </label>
            <p className="text-xs text-gray-600">
              Aro + envío ${base.toFixed(2)}
              {totalPreview !== null && (
                <>
                  {' '}
                  → <strong className="text-gray-900">Total ${totalPreview.toFixed(2)}</strong>
                </>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            {sent && (
              <button type="button" onClick={() => setEditingQuote(false)} className="text-sm text-gray-500 font-semibold px-3 py-2">
                Cancelar
              </button>
            )}
            <button
              type="button"
              onClick={send}
              disabled={sending}
              className="text-sm bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-lg"
            >
              {sending ? 'Creando enlace de pago…' : sent ? 'Enviar nueva cotización' : 'Enviar cotización'}
            </button>
          </div>
          {sent && (
            <p className="text-[11px] text-amber-700">
              Al enviar una nueva cotización se crea otro enlace. Pídele al cliente que use el último.
            </p>
          )}
        </>
      ) : (
        sent && (
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              Enviada: <strong>{order.lentes_descripcion}</strong> · ${Number(order.lentes_precio || 0).toFixed(2)} ·{' '}
              <strong>Total ${Number(sent.total).toFixed(2)}</strong>
              {sent.correoEnviado === false && <span className="text-amber-700"> (el correo no salió, mándalo por WhatsApp)</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href={whatsappQuoteUrl(order, sent.total, sent.urlPedido || sent.urlPago)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg"
              >
                Enviar por WhatsApp
              </a>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(sent.urlPedido || sent.urlPago)}
                className="text-sm border border-gray-200 bg-white hover:bg-gray-50 font-semibold px-4 py-2 rounded-lg"
              >
                Copiar enlace del pedido
              </button>
              <button type="button" onClick={() => setEditingQuote(true)} className="text-sm text-cyan-700 font-semibold px-2 py-2">
                Cambiar cotización
              </button>
            </div>
          </div>
        )
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

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
      const result = await updateAdminOrder(
        order.id,
        { courierName: courier, trackingNumber, trackingUrl, status },
        getIdToken
      )
      onUpdated()
      setEditing(false)
      if (result?.envioNotificado) {
        window.alert('Guardado. Le avisamos al cliente por correo que su pedido va en camino.')
      }
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
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
          <p className="text-sm font-bold text-gray-900 mt-1">${Number(order.total).toFixed(2)}</p>
        </div>
      </div>

      {(order.status === 'cotizacion' || order.status === 'cotizado') && (
        <QuotePanel order={order} getIdToken={getIdToken} onUpdated={onUpdated} />
      )}

      {order.receta_key && order.status !== 'cotizacion' && order.status !== 'cotizado' && (
        <RecetaButton orderId={order.id} getIdToken={getIdToken} />
      )}

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
            <option value="cotizacion">Por cotizar</option>
            <option value="cotizado">Cotización enviada</option>
            <option value="cancelado">Cancelado</option>
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
      <div className="flex flex-wrap gap-2 mb-4">
        {['todos', 'cotizacion', 'cotizado', 'pagado', 'pendiente', 'fallido', 'cancelado'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              filter === f ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {f === 'todos' ? 'Todos' : STATUS_LABELS[f] ?? f}
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

  const conMarketing = customers.filter((c) => c.acepta_marketing)

  // CSV para importar en la herramienta de email marketing (Mailchimp,
  // Brevo, etc.). Solo exporta a quienes aceptaron recibir ofertas.
  const exportCsv = () => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const rows = [
      ['email', 'nombre', 'cliente_desde', 'pedidos', 'total_gastado', 'acepto_marketing_el'],
      ...conMarketing.map((c) => [
        c.email,
        c.nombre || '',
        (c.created_at || '').slice(0, 10),
        c.total_pedidos,
        Number(c.total_gastado).toFixed(2),
        (c.marketing_actualizado_at || '').slice(0, 10),
      ]),
    ]
    const blob = new Blob(['\ufeff' + rows.map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `clientes-marketing-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <p className="text-sm text-gray-500">
          {customers.length} clientes · {conMarketing.length} aceptan correos de ofertas
        </p>
        <button
          type="button"
          onClick={exportCsv}
          disabled={conMarketing.length === 0}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white text-sm font-semibold"
        >
          Exportar CSV para marketing
        </button>
      </div>
      {customers.map((c) => (
        <div key={c.id} className="flex items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">
              {c.nombre || c.email} {Boolean(c.is_admin) && <span className="text-xs text-cyan-600 font-bold">· ADMIN</span>}
            </p>
            <p className="text-xs text-gray-500">{c.email}</p>
            <p className="text-xs text-gray-400">
              Cliente desde {new Date(c.created_at).toLocaleDateString('es-SV')}
              {c.acepta_marketing ? <span className="ml-2 text-emerald-600 font-semibold">· Acepta ofertas</span> : null}
            </p>
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
const EMPTY_PROMO_BLOCK = { pagina: 'aros-oftalmicos', title: '', subtitle: '', image: '', position: 1, coleccion: '' }

// Sugerencias para el campo "Colección" (se puede escribir cualquier otra).
const COLECCIONES_SUGERIDAS = ['Minerals', 'Metal Collection', 'G-Metal', 'G-Sport', 'Places']

function ColeccionesDatalist() {
  return (
    <datalist id="colecciones">
      {COLECCIONES_SUGERIDAS.map((c) => (
        <option key={c} value={c} />
      ))}
    </datalist>
  )
}

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

/* ---------- Bloques promocionales ---------- */
function PromoBlockForm({ initial, onCancel, onSaved, getIdToken }) {
  const isEditing = Boolean(initial)
  const [form, setForm] = useState(initial ? { ...EMPTY_PROMO_BLOCK, ...initial } : EMPTY_PROMO_BLOCK)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const url = await uploadAdminImage(file, getIdToken)
      setForm((prev) => ({ ...prev, image: url }))
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.title.trim() || !form.image.trim()) {
      setError('Título e imagen son obligatorios.')
      return
    }

    const payload = { ...form, position: Number(form.position) || 1 }

    setSaving(true)
    try {
      if (isEditing) {
        await updateAdminPromoBlock(initial.id, payload, getIdToken)
      } else {
        await createAdminPromoBlock(payload, getIdToken)
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
          <label className="block text-xs font-semibold text-gray-600 mb-1">Página</label>
          <select
            name="pagina"
            value={form.pagina}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          >
            {PROMO_PAGINAS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            {form.coleccion?.trim() ? 'Orden de la colección' : 'Posición en la grilla'}
          </label>
          <input
            name="position"
            type="number"
            min="1"
            value={form.position}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Colección (opcional)</label>
        <input
          name="coleccion"
          value={form.coleccion || ''}
          onChange={handleChange}
          placeholder="Ej. Metal Collection"
          list="colecciones"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
        />
        <ColeccionesDatalist />
        <p className="text-[11px] text-gray-400 mt-1">
          Si la llenas, el bloque aparece encima de los aros de esa colección y el número de arriba define en qué orden van
          las colecciones. Si la dejas vacía, el bloque se coloca en esa celda de la grilla.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Título</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Ej. Nueva colección"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Subtítulo (opcional)</label>
        <input
          name="subtitle"
          value={form.subtitle}
          onChange={handleChange}
          placeholder="Ej. Bestsellers en nuevos colores"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Imagen</label>
        {form.image && (
          <div className="w-24 h-24 rounded-lg border border-gray-200 overflow-hidden mb-2">
            <img src={form.image} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <label className="inline-flex items-center gap-2 px-3 py-2 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 rounded-lg text-xs font-semibold cursor-pointer">
          <Upload size={14} />
          {uploading ? 'Subiendo...' : form.image ? 'Cambiar imagen' : 'Subir imagen'}
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving || uploading}
          className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm"
        >
          {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear bloque'}
        </button>
      </div>
    </form>
  )
}

function PromoBlocksTab({ getIdToken }) {
  const [promoBlocks, setPromoBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null) // null | 'new' | promoBlock
  const [deletingId, setDeletingId] = useState(null)

  const load = () => {
    setLoading(true)
    fetchAdminPromoBlocks(getIdToken)
      .then(setPromoBlocks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await deleteAdminPromoBlock(id, getIdToken)
      setPromoBlocks((prev) => prev.filter((b) => b.id !== id))
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  if (editing) {
    return (
      <PromoBlockForm
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
        Bloques promocionales (imagen + título + subtítulo) que se intercalan dentro de la grilla de Aros Oftálmicos y
        Aros de Sol, en el mismo tamaño que una card de producto. La posición indica en qué celda de la grilla aparece.
      </p>

      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{promoBlocks.length} bloques</p>
        <button
          onClick={() => setEditing('new')}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl text-sm font-semibold"
        >
          <Plus size={16} /> Nuevo bloque
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      {loading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : promoBlocks.length === 0 ? (
        <p className="text-sm text-gray-500">Todavía no hay bloques promocionales configurados.</p>
      ) : (
        <div className="space-y-2">
          {promoBlocks.map((b) => (
            <div key={b.id} className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={b.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{b.title}</p>
                <p className="text-xs text-gray-500">
                  {PROMO_PAGINAS.find((p) => p.value === b.pagina)?.label || b.pagina} ·{' '}
                  {b.coleccion ? `Colección ${b.coleccion} · Orden ${b.position}` : `Posición ${b.position}`}
                </p>
              </div>
              <button onClick={() => setEditing(b)} className="p-2 text-gray-400 hover:text-cyan-600 transition-colors">
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(b.id)}
                disabled={deletingId === b.id}
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
function TestEmailButton({ getIdToken }) {
  const [state, setState] = useState('idle') // idle | sending | done | error
  const [detail, setDetail] = useState('')

  const send = async () => {
    setState('sending')
    try {
      const r = await sendAdminTestEmail(getIdToken)
      const fallos = Object.entries(r.results || {}).filter(([, v]) => v !== 'enviado')
      setState(fallos.length ? 'error' : 'done')
      setDetail(fallos.length ? fallos.map(([k, v]) => `${k}: ${v}`).join(' · ') : `Revisa ${r.to} (también Spam/Promociones).`)
    } catch (err) {
      setState('error')
      setDetail(err.message)
    }
  }

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={send}
        disabled={state === 'sending'}
        className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 disabled:opacity-60"
      >
        {state === 'sending' ? 'Enviando…' : 'Enviarme correos de prueba'}
      </button>
      {detail && <p className={`text-xs mt-1 max-w-xs ${state === 'error' ? 'text-red-600' : 'text-emerald-700'}`}>{detail}</p>}
    </div>
  )
}

export default function AdminPanel() {
  const { user, isAdmin, loading, getIdToken } = useAuth()
  usePageMeta({ title: 'Administración', path: '/admin', noindex: true })
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
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Panel de administración</h1>
          <TestEmailButton getIdToken={getIdToken} />
        </div>

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
        {tab === 'promos' && <PromoBlocksTab getIdToken={getIdToken} />}
      </div>
    </section>
  )
}

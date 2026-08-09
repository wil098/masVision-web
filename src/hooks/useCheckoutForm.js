import { useCallback, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchAddresses } from '../lib/orderService'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

export const DEPARTAMENTOS_SV = [
  'Ahuachapán',
  'Santa Ana',
  'Sonsonate',
  'Chalatenango',
  'La Libertad',
  'San Salvador',
  'Cuscatlán',
  'La Paz',
  'Cabañas',
  'San Vicente',
  'Usulután',
  'San Miguel',
  'Morazán',
  'La Unión',
]

const EMPTY_ADDRESS = { etiqueta: '', departamento: '', municipio: '', direccion: '', referencia: '' }

export function useCheckoutForm() {
  const { getIdToken } = useAuth()

  const [telefono, setTelefono] = useState('')
  const [addresses, setAddresses] = useState([])
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [newAddress, setNewAddress] = useState(EMPTY_ADDRESS)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [guardarDireccion, setGuardarDireccion] = useState(true)
  const [recetaFile, setRecetaFile] = useState(null)
  const [errors, setErrors] = useState({})

  const reset = () => {
    setTelefono('')
    setAddresses([])
    setSelectedAddressId('')
    setNewAddress(EMPTY_ADDRESS)
    setShowNewAddressForm(false)
    setGuardarDireccion(true)
    setRecetaFile(null)
    setErrors({})
  }

  const loadAddresses = useCallback(async () => {
    setAddressesLoading(true)
    try {
      const list = await fetchAddresses(getIdToken)
      setAddresses(list)
      if (list.length > 0) {
        const predeterminada = list.find((a) => a.es_predeterminada) ?? list[0]
        setSelectedAddressId(predeterminada.id)
        setShowNewAddressForm(false)
      } else {
        setShowNewAddressForm(true)
      }
    } catch (err) {
      setErrors((prev) => ({ ...prev, addresses: err.message }))
    } finally {
      setAddressesLoading(false)
    }
  }, [getIdToken])

  const handleTelefonoChange = (e) => {
    setTelefono(e.target.value)
    setErrors((prev) => ({ ...prev, telefono: null }))
  }

  const handleNewAddressChange = (e) => {
    const { name, value } = e.target
    setNewAddress((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: null }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, receta: 'Formato no válido. Usa JPG, PNG o PDF.' }))
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, receta: 'El archivo no debe superar 5MB.' }))
      return
    }
    setErrors((prev) => ({ ...prev, receta: null }))
    setRecetaFile(file)
  }

  const removeFile = () => setRecetaFile(null)

  const usingNewAddress = showNewAddressForm || addresses.length === 0

  const validate = () => {
    const newErrors = {}
    if (!telefono.trim()) newErrors.telefono = 'Ingresa tu teléfono.'

    if (usingNewAddress) {
      if (!newAddress.departamento.trim()) newErrors.departamento = 'Selecciona un departamento.'
      if (!newAddress.municipio.trim()) newErrors.municipio = 'Ingresa tu municipio o ciudad.'
      if (!newAddress.direccion.trim()) newErrors.direccion = 'Ingresa tu dirección exacta.'
    } else if (!selectedAddressId) {
      newErrors.address = 'Selecciona una dirección de envío.'
    }

    setErrors((prev) => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }

  return {
    telefono,
    handleTelefonoChange,
    addresses,
    addressesLoading,
    loadAddresses,
    selectedAddressId,
    setSelectedAddressId,
    newAddress,
    handleNewAddressChange,
    showNewAddressForm,
    setShowNewAddressForm,
    usingNewAddress,
    guardarDireccion,
    setGuardarDireccion,
    recetaFile,
    handleFileChange,
    removeFile,
    errors,
    setErrors,
    validate,
    reset,
  }
}

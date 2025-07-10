import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function FrutasAdmin() {
  const router = useRouter()
  const [frutas, setFrutas] = useState<any[]>([])
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)

  const cargarFrutas = () => {
    setLoading(true)
    fetch('/api/frutas/listar')
      .then(r => r.json())
      .then(data => setFrutas(data.frutas || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargarFrutas() }, [])

  const handleAgregar = async () => {
    if (!nombre.trim()) return
    setLoading(true)
    await fetch('/api/frutas/agregar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, descripcion })
    }).then(r => r.json()).then(res => {
      setMensaje(res.success ? 'Fruta agregada correctamente.' : res.message)
      setNombre('')
      setDescripcion('')
      cargarFrutas()
    }).finally(() => setLoading(false))
  }

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar esta fruta?')) return
    setLoading(true)
    await fetch('/api/frutas/desactivar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).then(r => r.json()).then(res => {
      setMensaje(res.success ? 'Fruta eliminada correctamente.' : res.message)
      cargarFrutas()
    }).finally(() => setLoading(false))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      {/* Header */}
      <div className="w-full max-w-3xl flex flex-col md:flex-row md:justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">
            <span className="text-green-600">Administrar Frutas</span>
          </h1>
          <p className="text-gray-500 text-base">
            Administra el catálogo de frutas registradas para recepción.
          </p>
        </div>
        <button
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-xl shadow transition"
          onClick={() => router.push('/panel/administrador')}>
          Menú principal
        </button>
      </div>

      {/* Formulario */}
      <form
        className="w-full max-w-3xl bg-white rounded-2xl p-6 border border-green-200 mb-8 shadow-xl flex flex-col gap-4"
        onSubmit={e => { e.preventDefault(); handleAgregar() }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Nombre de fruta <span className="text-green-600">*</span>
            </label>
            <input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Uva, Manzana, Durazno"
              className="w-full p-3 rounded-xl bg-gray-50 border border-green-300 focus:ring-2 focus:ring-green-400 text-gray-900"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Descripción (opcional)
            </label>
            <input
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Color, variedad, origen, etc."
              className="w-full p-3 rounded-xl bg-gray-50 border border-green-300 focus:ring-2 focus:ring-green-400 text-gray-900"
              maxLength={255}
            />
          </div>
        </div>
        <div className="flex mt-4">
          <button
            type="submit"
            className={`bg-green-600 hover:bg-green-800 text-white font-bold py-3 px-6 rounded-xl shadow transition ${
              loading ? 'opacity-60 pointer-events-none' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Agregar fruta'}
          </button>
        </div>
        {mensaje && (
          <div className="mt-2 text-green-700 font-semibold text-lg">
            {mensaje}
          </div>
        )}
      </form>

      {/* Lista de frutas */}
      <div className="w-full max-w-3xl mt-10">
        <h2 className="text-xl font-bold text-green-700 mb-4">
          Frutas registradas
        </h2>
        {loading ? (
          <div className="text-gray-400 py-6 text-center">Cargando...</div>
        ) : frutas.length === 0 ? (
          <div className="text-gray-400 py-6 text-center">
            No hay frutas registradas.
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {frutas.map(fruta => (
              <div
                key={fruta.id}
                className="bg-white border border-green-200 shadow rounded-2xl p-5 flex flex-col gap-2 hover:shadow-xl transition"
              >
                <div className="flex flex-col gap-1">
                  <div className="text-lg font-bold text-gray-800">{fruta.nombre}</div>
                  {fruta.descripcion && (
                    <div className="ml-0 text-gray-500 text-sm italic">
                      {fruta.descripcion}
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    className="bg-red-600 hover:bg-red-800 text-white px-4 py-2 rounded-xl font-bold transition shadow"
                    onClick={() => handleEliminar(fruta.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

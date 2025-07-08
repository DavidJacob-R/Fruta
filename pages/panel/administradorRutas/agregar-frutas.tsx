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
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-green-400">Administrar Frutas</h1>
          <button
            className="mt-4 sm:mt-0 bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-xl text-white font-bold shadow transition"
            onClick={() => router.push('/panel/administrador')}>
            Regresar al menú principal
          </button>
        </div>

        <form
          className="bg-gray-900 rounded-2xl p-6 border border-green-500 mb-8 shadow-xl flex flex-col gap-4"
          onSubmit={e => { e.preventDefault(); handleAgregar() }}>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Nombre de fruta"
              className="flex-1 p-3 rounded-xl bg-black border border-green-400 text-white text-lg"
              required
              autoFocus/>

            <input
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Descripción (opcional)"
              className="flex-1 p-3 rounded-xl bg-black border border-green-400 text-white text-lg"/>

            <button type="submit"
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-2xl text-white font-bold"
              disabled={loading}>
              {loading ? 'Guardando...' : 'Agregar fruta'}
            </button>
          </div>
          {mensaje && (
            <div className="mt-2 text-green-300 font-semibold">{mensaje}</div>
          )}
      </form>

        <div>
          <h2 className="text-xl font-bold text-green-300 mb-4">Frutas registradas</h2>
          {loading ? (
            <div className="text-gray-400 py-6 text-center">Cargando...</div>
          ) : frutas.length === 0 ? (
            <div className="text-gray-400 py-6 text-center">No hay frutas registradas.</div>
          ) : (
            <div className="grid gap-3">
              {frutas.map(fruta => (
                <div key={fruta.id} className="flex flex-col sm:flex-row justify-between items-center bg-gray-800 p-4 rounded-xl border border-green-800 shadow">
                  <div>
                    <span className="font-bold text-lg">{fruta.nombre}</span>
                    {fruta.descripcion && (
                      <span className="ml-2 text-gray-400 text-sm">({fruta.descripcion})</span>
                    )}
                  </div>
                  <button
                    className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-xl text-white font-bold mt-3 sm:mt-0"
                    onClick={() => handleEliminar(fruta.id)}>Eliminar</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

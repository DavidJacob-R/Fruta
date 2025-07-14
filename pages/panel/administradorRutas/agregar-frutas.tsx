import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { FiSun, FiMoon } from "react-icons/fi";

export default function FrutasAdmin() {
  const router = useRouter()
  const [frutas, setFrutas] = useState<any[]>([])
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(true);

  const cargarFrutas = () => {
    setLoading(true)
    fetch('/api/frutas/listar')
      .then(r => r.json())
      .then(data => setFrutas(data.frutas || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargarFrutas() }, [])

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
  }, [darkMode])

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

  
  const bgMain = darkMode
    ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
    : "bg-gradient-to-br from-white via-green-50 to-slate-100";
  const accent = darkMode ? "text-green-300" : "text-green-700";
  const cardBg = darkMode
    ? "bg-gray-900 border-gray-700"
    : "bg-white border-green-200";
  const labelColor = darkMode ? "text-green-200" : "text-green-700";
  const formInput = darkMode
    ? "bg-gray-900 border-gray-700 text-green-100 focus:ring-green-300"
    : "bg-white border-green-300 text-green-900 focus:ring-green-200";
  const cardShadow = "shadow-xl";

  return (
    <div className={`min-h-screen ${bgMain} flex flex-col items-center py-8 transition-colors`}>
      {/* Header */}
      <div className="w-full max-w-3xl flex flex-col md:flex-row md:justify-between items-center mb-6 gap-4">
        <div>
          <h1 className={`text-3xl font-extrabold tracking-tight mb-1 ${accent}`}>
            Administrar Frutas
          </h1>
          <p className={`${darkMode ? "text-green-100/70" : "text-gray-500"} text-base`}>
            Administra el catálogo de frutas registradas para recepción.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className={`rounded-xl px-5 py-2 font-bold transition
              ${darkMode
                ? "bg-green-900 border border-green-700 text-green-100 hover:bg-green-800"
                : "bg-white border border-green-200 text-green-700 hover:bg-green-100"}`}
            onClick={() => router.push('/panel/administrador')}>
            Menú principal
          </button>
          <button
            className={`flex items-center gap-2 rounded-xl px-5 py-2 font-bold transition border
              ${darkMode
                ? "bg-gray-900 border-gray-700 text-green-100 hover:bg-gray-800"
                : "bg-white border-green-200 text-green-700 hover:bg-gray-100"}`}
            onClick={() => setDarkMode(d => !d)}>
            {darkMode ? <FiSun className="text-green-300" /> : <FiMoon className="text-green-700" />}
            {darkMode ? "Día" : "Noche"}
          </button>
        </div>
      </div>

      {/* Formulario */}
      <form
        className={`w-full max-w-3xl ${cardBg} border rounded-2xl p-6 mb-8 ${cardShadow} flex flex-col gap-4 transition`}
        onSubmit={e => { e.preventDefault(); handleAgregar() }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block mb-1 font-medium ${labelColor}`}>
              Nombre de fruta <span className="font-bold">*</span>
            </label>
            <input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Uva, Manzana, Durazno"
              className={`w-full p-3 rounded-xl border focus:ring-2 ${formInput}`}
              required
              autoFocus/>
          </div>
          <div>
            <label className={`block mb-1 font-medium ${labelColor}`}>
              Descripción (opcional)
            </label>
            <input
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Color, variedad, origen, etc."
              className={`w-full p-3 rounded-xl border focus:ring-2 ${formInput}`}
              maxLength={255}/>
          </div>
        </div>
        <div className="flex mt-4">
          <button
            type="submit"
            className={`bg-green-600 hover:bg-green-800 text-white font-bold py-3 px-6 rounded-xl shadow transition ${
              loading ? 'opacity-60 pointer-events-none' : ''
            }`}
            disabled={loading}>
            {loading ? 'Guardando...' : 'Agregar fruta'}
          </button>
        </div>
        {mensaje && (
          <div className={`mt-2 font-semibold text-lg ${darkMode ? "text-green-200" : "text-green-700"}`}>
            {mensaje}
          </div>
        )}
      </form>

      {/* Lista de frutas */}
      <div className="w-full max-w-3xl mt-10">
        <h2 className={`text-xl font-bold mb-4 ${accent}`}>
          Frutas registradas
        </h2>
        {loading ? (
          <div className={`${darkMode ? "text-green-200" : "text-gray-400"} py-6 text-center`}>Cargando...</div>
        ) : frutas.length === 0 ? (
          <div className={`${darkMode ? "text-green-200" : "text-gray-400"} py-6 text-center`}>
            No hay frutas registradas.
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {frutas.map(fruta => (
              <div
                key={fruta.id}
                className={`rounded-2xl p-5 flex flex-col gap-2 hover:shadow-2xl transition border ${cardBg}`}>
                <div className="flex flex-col gap-1">
                  <div className={`text-lg font-bold ${darkMode ? "text-green-100" : "text-gray-800"}`}>{fruta.nombre}</div>
                  {fruta.descripcion && (
                    <div className={`ml-0 text-sm italic ${darkMode ? "text-green-100/80" : "text-gray-500"}`}>
                      {fruta.descripcion}
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    className="bg-red-600 hover:bg-red-800 text-white px-4 py-2 rounded-xl font-bold transition shadow"
                    onClick={() => handleEliminar(fruta.id)}>
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

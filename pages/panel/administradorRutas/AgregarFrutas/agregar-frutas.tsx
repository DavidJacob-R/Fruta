import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/router"
import { FiHome, FiSearch, FiTrash2, FiPlus, FiLoader } from "react-icons/fi"
import { useUi } from "@/components/ui-context"

type Fruta = {
  id: number
  nombre: string
  descripcion?: string
}

export default function FrutasAdmin() {
  const router = useRouter()
  const { darkMode } = useUi()

  const [frutas, setFrutas] = useState<Fruta[]>([])
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [loading, setLoading] = useState(false)
  const [cargandoLista, setCargandoLista] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const inputNombreRef = useRef<HTMLInputElement>(null)

  // Tokens visuales (mismos del resto del panel)
  const bgDay = "bg-[#f6f4f2]"
  const bgNight = "bg-[#161616]"
  const textDay = "text-[#1a1a1a]"
  const textNight = "text-white"
  const cardDay = "bg-[#f8f7f5] border border-orange-200"
  const cardNight = "bg-[#232323] border border-[#353535]"
  const softShadow = "shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]"

  const inputClass = darkMode
    ? "bg-[#1f1f1f] border border-[#353535] text-white"
    : "bg-white border border-orange-200 text-[#1a1a1a]"

  const btnSec = darkMode
    ? "px-4 py-2 rounded-lg font-semibold border bg-[#232323] border-[#353535] text-white hover:bg-[#2a2a2a]"
    : "px-4 py-2 rounded-lg font-semibold border bg-white border-orange-300 text-[#1a1a1a] hover:bg-orange-50"

  const btnPri = "px-5 py-3 rounded-xl font-semibold text-white bg-orange-600 hover:bg-orange-700"

  // Cargar frutas
  const cargarFrutas = () => {
    setCargandoLista(true)
    fetch("/api/frutas/listar")
      .then((r) => r.json())
      .then((data) => setFrutas(Array.isArray(data.frutas) ? data.frutas : []))
      .finally(() => setCargandoLista(false))
  }

  useEffect(() => {
    cargarFrutas()
  }, [])

  // Agregar
  const handleAgregar = async () => {
    const n = nombre.trim()
    if (!n) return
    setLoading(true)
    try {
      const r = await fetch("/api/frutas/agregar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: n, descripcion: descripcion.trim() })
      })
      const res = await r.json()
      setMensaje(res.success ? "Fruta agregada correctamente." : res.message || "No se pudo agregar.")
      if (res.success) {
        setNombre("")
        setDescripcion("")
        cargarFrutas()
        // Volver a enfocar el input nombre
        setTimeout(() => inputNombreRef.current?.focus(), 50)
      }
    } catch {
      setMensaje("No se pudo conectar con el servidor.")
    } finally {
      setLoading(false)
      setTimeout(() => setMensaje(""), 2500)
    }
  }

  // Eliminar (usa el endpoint existente de “desactivar”)
  const handleEliminar = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta fruta?")) return
    setLoading(true)
    try {
      const r = await fetch("/api/frutas/desactivar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })
      const res = await r.json()
      setMensaje(res.success ? "Fruta eliminada correctamente." : res.message || "No se pudo eliminar.")
      if (res.success) cargarFrutas()
    } catch {
      setMensaje("No se pudo conectar con el servidor.")
    } finally {
      setLoading(false)
      setTimeout(() => setMensaje(""), 3000)
    }
  }

  // Filtro de búsqueda
  const frutasFiltradas = useMemo(() => {
    const k = busqueda.trim().toLowerCase()
    if (!k) return frutas
    return frutas.filter(
      (f) =>
        f.nombre.toLowerCase().includes(k) ||
        (f.descripcion || "").toLowerCase().includes(k)
    )
  }, [frutas, busqueda])

  return (
    <div className={`${darkMode ? bgNight : bgDay} min-h-screen ${darkMode ? textNight : textDay} transition-colors duration-300`}>
      {/* Header degradado */}
      <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-b-2xl p-6 text-white shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold mb-1">Frutas</h1>
            <p className="text-orange-100">Administra el catálogo de frutas para recepción.</p>
          </div>
          <button
            className="px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition flex items-center gap-2"
            onClick={() => router.push("/panel/administrador")}
            title="Ir al menú principal"
          >
            <FiHome className="text-lg" />
            <span className="hidden sm:inline">Menú</span>
          </button>
        </div>
      </section>

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Formulario */}
        <section className={`rounded-2xl p-6 ${darkMode ? cardNight : cardDay} ${softShadow}`}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20">🍊</span>
            Nueva fruta
          </h2>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!loading) handleAgregar()
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="md:col-span-1">
              <label className={`block mb-2 font-medium ${darkMode ? "text-orange-200" : "text-orange-700"}`}>
                Nombre *
              </label>
              <input
                ref={inputNombreRef}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Uva, Manzana, Durazno"
                className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none ${inputClass}`}
                required
                autoFocus
              />
            </div>

            <div className="md:col-span-2">
              <label className={`block mb-2 font-medium ${darkMode ? "text-orange-200" : "text-orange-700"}`}>
                Descripción (opcional)
              </label>
              <input
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Color, variedad, origen, etc."
                className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none ${inputClass}`}
                maxLength={255}
              />
            </div>

            <div className="md:col-span-3 flex items-center justify-end gap-3">
              <button
                type="submit"
                className={`${btnPri} inline-flex items-center gap-2 ${loading ? "opacity-60 pointer-events-none" : ""}`}
                disabled={loading}
                title="Agregar fruta"
              >
                {loading ? <FiLoader className="animate-spin" /> : <FiPlus />}
                {loading ? "Guardando..." : "Agregar fruta"}
              </button>
            </div>

            {mensaje && (
              <div className="md:col-span-3">
                <div className={`mt-1 font-semibold text-sm ${darkMode ? "text-emerald-200" : "text-green-700"}`}>{mensaje}</div>
              </div>
            )}
          </form>
        </section>

        {/* Buscador + Conteo */}
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${darkMode ? cardNight : cardDay}`}>
              <FiSearch className={darkMode ? "text-orange-300" : "text-orange-600"} />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar fruta por nombre o descripción"
                className={`w-72 max-w-full outline-none bg-transparent ${darkMode ? "text-white placeholder:text-white/60" : "text-[#1a1a1a] placeholder:text-[#1a1a1a]/60"}`}
              />
            </div>
          </div>
          <div className={`${darkMode ? "text-orange-200" : "text-orange-700"} text-sm font-semibold`}>
            {cargandoLista ? "—" : frutasFiltradas.length} resultados
          </div>
        </section>

        {/* Listado */}
        <section className={`rounded-2xl p-6 ${darkMode ? cardNight : cardDay} ${softShadow}`}>
          <h3 className="text-lg font-semibold mb-4">Frutas registradas</h3>

          {cargandoLista ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`rounded-2xl p-5 ${darkMode ? "bg-[#1f1f1f] border border-[#353535]" : "bg-white border border-orange-200"} animate-pulse`}>
                  <div className="h-5 w-2/3 rounded bg-current/10 mb-2" />
                  <div className="h-4 w-1/2 rounded bg-current/10" />
                  <div className="mt-4 h-9 w-24 rounded bg-current/10" />
                </div>
              ))}
            </div>
          ) : frutasFiltradas.length === 0 ? (
            <div className={`rounded-2xl border border-dashed ${darkMode ? "border-[#353535] text-white/80" : "border-orange-200 text-[#1a1a1a]/70"} p-8 text-center`}>
              No hay frutas registradas.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {frutasFiltradas.map((fruta) => (
                <div
                  key={fruta.id}
                  className={`group rounded-2xl p-5 border ${darkMode ? "bg-[#1f1f1f] border-[#353535] hover:bg-[#202020]" : "bg-white border-orange-200 hover:bg-orange-50"} transition ${softShadow}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className={`text-lg font-bold ${darkMode ? "text-orange-100" : "text-gray-800"}`}>{fruta.nombre}</div>
                      {fruta.descripcion && (
                        <div className={`${darkMode ? "text-white/70" : "text-gray-600"} text-sm mt-1`}>
                          {fruta.descripcion}
                        </div>
                      )}
                    </div>
                    <button
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition"
                      onClick={() => handleEliminar(fruta.id)}
                      title="Eliminar"
                    >
                      <FiTrash2 />
                      <span className="hidden sm:inline">Eliminar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

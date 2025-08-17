import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { FiHome } from "react-icons/fi"
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

  const cargarFrutas = () => {
    setLoading(true)
    fetch("/api/frutas/listar")
      .then((r) => r.json())
      .then((data) => setFrutas(Array.isArray(data.frutas) ? data.frutas : []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    cargarFrutas()
  }, [])

  const handleAgregar = async () => {
    if (!nombre.trim()) return
    setLoading(true)
    await fetch("/api/frutas/agregar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, descripcion })
    })
      .then((r) => r.json())
      .then((res) => {
        setMensaje(res.success ? "Fruta agregada correctamente." : res.message || "No se pudo agregar.")
        setNombre("")
        setDescripcion("")
        cargarFrutas()
        setTimeout(() => setMensaje(""), 2500)
      })
      .finally(() => setLoading(false))
  }

  const handleEliminar = async (id: number) => {
    if (!confirm("Seguro que deseas eliminar esta fruta?")) return
    setLoading(true)
    await fetch("/api/frutas/desactivar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    })
      .then((r) => r.json())
      .then((res) => {
        setMensaje(res.success ? "Fruta eliminada correctamente." : res.message || "No se pudo eliminar.")
        cargarFrutas()
        setTimeout(() => setMensaje(""), 3000)
      })
      .finally(() => setLoading(false))
  }

  const textMain = darkMode ? "text-orange-200" : "text-orange-700"
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-500"
  const cardBg = darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-slate-200"
  const inputClass = darkMode ? "bg-slate-900 border-slate-700 text-orange-100" : "bg-white border-orange-200 text-orange-700"

  return (
    <>
      <div className="flex flex-col md:flex-row md:justify-between items-center mb-6 gap-4">
        <div>
          <h1 className={`text-3xl font-extrabold tracking-tight mb-1 ${textMain}`}>Administrar Frutas</h1>
          <p className={`text-base ${textSecondary}`}>Administra el catalogo de frutas registradas para recepcion.</p>
        </div>
        <button
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm shadow-sm font-semibold transition-colors ${
            darkMode ? "bg-[#232323] border-orange-700 text-orange-300 hover:bg-orange-900" : "bg-white border-orange-200 text-orange-700 hover:bg-orange-100"
          }`}
          onClick={() => router.push("/panel/administrador")}
          title="Ir al menu principal"
        >
          <FiHome className="text-lg" />
          <span className="hidden sm:inline">Menu principal</span>
        </button>
      </div>

      <form
        className={`w-full ${cardBg} border rounded-2xl p-6 mb-8 shadow-[0_2px_10px_0_rgba(0,0,0,0.06)] flex flex-col gap-4 transition`}
        onSubmit={(e) => {
          e.preventDefault()
          handleAgregar()
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block mb-1 font-medium ${textMain}`}>Nombre de fruta *</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Uva, Manzana, Durazno"
              className={`w-full p-3 rounded-xl border focus:ring-2 ${inputClass}`}
              required
              autoFocus
            />
          </div>
          <div>
            <label className={`block mb-1 font-medium ${textMain}`}>Descripcion (opcional)</label>
            <input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Color, variedad, origen, etc."
              className={`w-full p-3 rounded-xl border focus:ring-2 ${inputClass}`}
              maxLength={255}
            />
          </div>
        </div>
        <div className="flex mt-4">
          <button
            type="submit"
            className={`bg-orange-500 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl shadow transition ${
              loading ? "opacity-60 pointer-events-none" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Agregar fruta"}
          </button>
        </div>
        {mensaje && <div className={`mt-2 font-semibold text-lg ${darkMode ? "text-emerald-200" : "text-green-700"}`}>{mensaje}</div>}
      </form>

      <div className="w-full mt-10">
        <h2 className={`text-xl font-bold mb-4 ${textMain}`}>Frutas registradas</h2>
        {loading ? (
          <div className={`${textSecondary} py-6 text-center`}>Cargando...</div>
        ) : frutas.length === 0 ? (
          <div className={`${textSecondary} py-6 text-center`}>No hay frutas registradas.</div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {frutas.map((fruta) => (
              <div key={fruta.id} className={`rounded-2xl p-5 flex flex-col gap-2 hover:shadow-2xl transition border ${cardBg}`}>
                <div className="flex flex-col gap-1">
                  <div className={`text-lg font-bold ${darkMode ? "text-orange-100" : "text-gray-800"}`}>{fruta.nombre}</div>
                  {fruta.descripcion && (
                    <div className={`text-sm italic ${textSecondary}`}>{fruta.descripcion}</div>
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
    </>
  )
}

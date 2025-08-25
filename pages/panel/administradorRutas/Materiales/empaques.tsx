import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import { FiHome, FiSearch, FiPlus, FiTrash2 } from "react-icons/fi"
import ModalEmpaque from "./ModalEmpaque"
import { useUi } from "@/components/ui-context"

type Empaque = {
  id: number
  tamanio: string
  descripcion: string
}

export default function AdminEmpaques() {
  const router = useRouter()
  const { darkMode } = useUi()

  const [empaques, setEmpaques] = useState<Empaque[]>([])
  const [form, setForm] = useState({ tamanio: "", descripcion: "" })
  const [mensajeAgregar, setMensajeAgregar] = useState("")
  const [mensajeEliminar, setMensajeEliminar] = useState("")
  const [loading, setLoading] = useState(false)
  const [cargandoLista, setCargandoLista] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [busqueda, setBusqueda] = useState("")

  // Tokens visuales
  const bgDay = "bg-[#f6f4f2]"
  const bgNight = "bg-[#161616]"
  const textDay = "text-[#1a1a1a]"
  const textNight = "text-white"
  const cardDay = "bg-[#f8f7f5] border border-orange-200"
  const cardNight = "bg-[#232323] border border-[#353535]"
  const softShadow = "shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]"
  const inputWrap = `${darkMode ? cardNight : cardDay} rounded-xl px-3 py-2 flex items-center gap-2`
  const inputSearch = "bg-transparent outline-none w-72 max-w-full"
  const btnPri = "inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white bg-orange-600 hover:bg-orange-700"

  const cargarEmpaques = () => {
    setCargandoLista(true)
    fetch("/api/empaques/listar")
      .then((r) => r.json())
      .then((data) => setEmpaques(Array.isArray(data.empaques) ? data.empaques : []))
      .finally(() => setCargandoLista(false))
  }

  useEffect(() => {
    cargarEmpaques()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === "tamanio") {
      // Mantiene el comportamiento previo: solo números
      const soloNumeros = value.replace(/[^\d]/g, "")
      setForm((f) => ({ ...f, tamanio: soloNumeros }))
      return
    }
    setForm((f) => ({ ...f, [name]: value }))
  }

  // Acepta valores pero usamos el estado local (compatibilidad tipada con ModalEmpaque)
  const handleAgregar = async (_?: any) => {
    const tamanioVal = form.tamanio.trim()
    const descVal = form.descripcion.trim()

    if (!tamanioVal || !descVal) return

    if (!/^\d+$/.test(tamanioVal)) {
      setMensajeAgregar("El tamaño debe ser un número válido (en oz).")
      setMensajeEliminar("")
      setTimeout(() => setMensajeAgregar(""), 2500)
      return
    }

    setLoading(true)
    await fetch("/api/empaques/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tamanio: tamanioVal, descripcion: descVal })
    })
      .then((r) => r.json())
      .then((res) => {
        setMensajeAgregar(res.success ? "Empaque agregado correctamente." : res.message || "No se pudo agregar el empaque.")
        setMensajeEliminar("")
        if (res.success) {
          setForm({ tamanio: "", descripcion: "" })
          cargarEmpaques()
          setModalOpen(false)
        }
        setTimeout(() => setMensajeAgregar(""), 2500)
      })
      .finally(() => setLoading(false))
  }

  const handleEliminar = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este empaque?")) return
    setLoading(true)
    await fetch("/api/empaques/eliminar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    })
      .then((r) => r.json())
      .then((res) => {
        setMensajeEliminar(res.success ? "Empaque eliminado correctamente." : res.message || "No se pudo eliminar el empaque.")
        setMensajeAgregar("")
        cargarEmpaques()
        setTimeout(() => setMensajeEliminar(""), 3500)
      })
      .finally(() => setLoading(false))
  }

  const empaquesFiltrados = useMemo(() => {
    const k = busqueda.trim().toLowerCase()
    if (!k) return empaques
    return empaques.filter((e) =>
      e.tamanio.toString().toLowerCase().includes(k) ||
      (e.descripcion || "").toLowerCase().includes(k)
    )
  }, [empaques, busqueda])

  return (
    <div className={`${darkMode ? bgNight : bgDay} min-h-screen ${darkMode ? textNight : textDay} transition-colors duration-300`}>
      {/* Header degradado */}
      <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-b-2xl p-6 text-white shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold mb-1">Empaques</h1>
            <p className="text-orange-100">Administra los empaques/clamshell disponibles.</p>
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
        {/* Acciones principales */}
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className={inputWrap}>
            <FiSearch className={darkMode ? "text-orange-300" : "text-orange-600"} />
            <input
              className={inputSearch}
              placeholder="Buscar por tamaño o descripción"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <button className={btnPri} onClick={() => setModalOpen(true)}>
              <FiPlus /> Agregar empaque
            </button>
          </div>
        </section>

        {/* Mensajes */}
        {!!mensajeAgregar && (
          <div className={`${darkMode ? "text-emerald-200" : "text-green-700"} font-semibold text-sm`}>{mensajeAgregar}</div>
        )}
        {!!mensajeEliminar && (
          <div className={`${darkMode ? "text-red-300" : "text-red-600"} font-semibold text-sm`}>{mensajeEliminar}</div>
        )}

        {/* Listado */}
        <section className={`rounded-2xl p-6 ${darkMode ? cardNight : cardDay} ${softShadow}`}>
          <h2 className="text-lg font-semibold mb-4">Listado de empaques</h2>

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
          ) : empaquesFiltrados.length === 0 ? (
            <div className={`rounded-2xl border border-dashed ${darkMode ? "border-[#353535] text-white/80" : "border-orange-200 text-[#1a1a1a]/70"} p-8 text-center`}>
              No hay empaques registrados.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border">
              <table className={`min-w-full text-sm ${darkMode ? "bg-[#1f1f1f] border-[#353535]" : "bg-white border-orange-200"}`}>
                <thead>
                  <tr className={`${darkMode ? "bg-slate-800 text-orange-200 border-slate-700" : "bg-orange-50 text-orange-700 border-orange-200"} border-b-2`}>
                    <th className="px-4 py-3 text-left font-bold">Tamaño (oz)</th>
                    <th className="px-4 py-3 text-left font-bold">Descripción</th>
                    <th className="px-4 py-3 text-left font-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empaquesFiltrados.map((emp, i) => (
                    <tr
                      key={emp.id}
                      className={`${i % 2 === 0 ? (darkMode ? "bg-slate-900" : "bg-orange-50") : (darkMode ? "bg-gray-800" : "bg-white")} border-b ${darkMode ? "border-slate-700" : "border-orange-100"}`}
                    >
                      <td className="px-4 py-3 font-semibold">{emp.tamanio}</td>
                      <td className="px-4 py-3">{emp.descripcion}</td>
                      <td className="px-4 py-3">
                        <button
                          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold"
                          onClick={() => handleEliminar(emp.id)}
                          title="Eliminar empaque"
                        >
                          <FiTrash2 /> Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <ModalEmpaque
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAgregar}
        values={form}
        onChange={handleChange}
        loading={loading}
      />
    </div>
  )
}

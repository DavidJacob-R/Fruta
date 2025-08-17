import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { FiHome } from "react-icons/fi"
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
  const [modalOpen, setModalOpen] = useState(false)

  const cargarEmpaques = () => {
    setLoading(true)
    fetch("/api/empaques/listar")
      .then((r) => r.json())
      .then((data) => setEmpaques(data.empaques || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    cargarEmpaques()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === "tamanio") {
      const soloNumeros = value.replace(/[^\d]/g, "")
      setForm((f) => ({ ...f, tamanio: soloNumeros }))
      return
    }
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleAgregar = async () => {
    const tamanioVal = form.tamanio.trim()
    const descVal = form.descripcion.trim()

    if (!tamanioVal || !descVal) return

    if (!/^\d+$/.test(tamanioVal)) {
      setMensajeAgregar("El tamano debe ser un numero valido.")
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
        setForm({ tamanio: "", descripcion: "" })
        cargarEmpaques()
        setModalOpen(false)
        setTimeout(() => setMensajeAgregar(""), 2500)
      })
      .finally(() => setLoading(false))
  }

  const handleEliminar = async (id: number) => {
    if (!confirm("Seguro que deseas eliminar este empaque?")) return
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

  const textMain = darkMode ? "text-orange-200" : "text-orange-700"
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-500"
  const cardBg = darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-slate-200"
  const thBg = darkMode ? "bg-slate-800 text-orange-200 border-slate-700" : "bg-orange-50 text-orange-700 border-orange-200"

  return (
    <>
      <div className="flex flex-col md:flex-row md:justify-between items-center mb-6 gap-4">
        <div>
          <h1 className={`text-3xl font-extrabold tracking-tight mb-1 ${textMain}`}>Gestion de Empaques</h1>
          <p className={`text-base ${textSecondary}`}>Administra los empaques registrados en el sistema.</p>
        </div>
        <div className="flex gap-2">
          <button
            className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-5 rounded-xl"
            onClick={() => setModalOpen(true)}
          >
            + Agregar empaque
          </button>
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
      </div>

      {mensajeAgregar && <div className="mb-3 font-semibold text-emerald-600 dark:text-emerald-300">{mensajeAgregar}</div>}
      {mensajeEliminar && <div className="mb-3 font-semibold text-red-600 dark:text-red-300">{mensajeEliminar}</div>}

      <div className={`rounded-3xl border-2 shadow-2xl overflow-x-auto p-6 transition-colors ${cardBg}`}>
        <table className="min-w-full table-auto text-base">
          <thead>
            <tr className={`${thBg} border-b-2`}>
              <th className="p-4 font-bold">Tamano</th>
              <th className="p-4 font-bold">Descripcion</th>
              <th className="p-4 font-bold"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className={`text-center py-6 ${textSecondary}`}>
                  Cargando...
                </td>
              </tr>
            ) : empaques.length === 0 ? (
              <tr>
                <td colSpan={3} className={`text-center py-6 ${textSecondary}`}>
                  No hay empaques registrados.
                </td>
              </tr>
            ) : (
              empaques.map((emp) => (
                <tr key={emp.id} className="border-b">
                  <td className={`p-4 ${textMain}`}>{emp.tamanio}</td>
                  <td className={`p-4 ${textMain}`}>{emp.descripcion}</td>
                  <td className="p-4 text-right">
                    <button
                      className="bg-red-600 hover:bg-red-800 text-white px-4 py-2 rounded-xl font-bold text-sm"
                      onClick={() => handleEliminar(emp.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ModalEmpaque
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAgregar}
        values={form}
        onChange={handleChange}
        loading={loading}
      />
    </>
  )
}

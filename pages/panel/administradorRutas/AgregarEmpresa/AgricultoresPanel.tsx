import { useState, useEffect, useMemo } from "react"
import ModalAgricultor from "./ModalAgricultor"
import { useUi } from "@/components/ui-context"
import { FiSearch, FiArrowLeft, FiPlus } from "react-icons/fi"

type Agricultor = {
  id: number
  clave: string
  nombre: string
  hectareas: string
  sectores: string
  rfc: string
  ubicacion: string
  empresa_id: number
}

type Props = {
  empresaId: number
  empresaNombre: string
  onClose: () => void
}

export default function AgricultoresPanel({ empresaId, empresaNombre, onClose }: Props) {
  const { darkMode } = useUi()

  const [agricultores, setAgricultores] = useState<Agricultor[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [agricultorForm, setAgricultorForm] = useState({
    nombre: "",
    hectareas: "",
    sectores: "",
    rfc: "",
    ubicacion: ""
  })
  const [nextClave, setNextClave] = useState("")
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState("")
  const [busqueda, setBusqueda] = useState("")

  const cardDay = "bg-[#f8f7f5] border border-orange-200"
  const cardNight = "bg-[#232323] border border-[#353535]"
  const softShadow = "shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]"
  const inputWrap = `${darkMode ? cardNight : cardDay} rounded-xl px-3 py-2 flex items-center gap-2 w-full sm:w-auto`
  const input = "bg-transparent outline-none w-full sm:w-72"
  const btnPri = "inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white bg-orange-600 hover:bg-orange-700"
  const btnSec = `${darkMode ? "px-4 py-2 rounded-xl font-semibold border bg-[#232323] border-[#353535] text-white hover:bg-[#2a2a2a]" : "px-4 py-2 rounded-xl font-semibold border bg-white border-orange-300 text-[#1a1a1a] hover:bg-orange-50"}`

  const cargarAgricultores = () => {
    fetch(`/api/agricultores_empresa/listar?empresa_id=${empresaId}`)
      .then(r => r.json())
      .then(data => setAgricultores(Array.isArray(data.agricultores) ? data.agricultores : []))
  }
  const cargarClave = () => {
    fetch("/api/agricultores_empresa/siguiente_clave")
      .then(r => r.json())
      .then(data => setNextClave(data.clave || ""))
  }

  useEffect(() => {
    cargarAgricultores()
    cargarClave()
  }, [empresaId])

  const handleOpenModal = () => {
    setModalOpen(true)
    setAgricultorForm({
      nombre: "",
      hectareas: "",
      sectores: "",
      rfc: "",
      ubicacion: ""
    })
    cargarClave()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgricultorForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleAgregarAgricultor = async () => {
    setLoading(true)
    await fetch("/api/agricultores_empresa/agregar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...agricultorForm,
        empresa_id: empresaId
      })
    })
      .then(r => r.json())
      .then(res => {
        setMensaje(res.success ? "Agricultor agregado correctamente." : (res.message || "No se pudo agregar"))
        setLoading(false)
        if (res.success) {
          setModalOpen(false)
          cargarAgricultores()
        }
        setTimeout(() => setMensaje(""), 2500)
      })
  }

  const agricultoresFiltrados = useMemo(() => {
    const k = busqueda.trim().toLowerCase()
    if (!k) return agricultores
    return agricultores.filter(a =>
      a.clave.toLowerCase().includes(k) ||
      a.nombre.toLowerCase().includes(k) ||
      (a.sectores || "").toLowerCase().includes(k) ||
      (a.rfc || "").toLowerCase().includes(k) ||
      (a.ubicacion || "").toLowerCase().includes(k)
    )
  }, [agricultores, busqueda])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className={btnSec} onClick={onClose}>
            <span className="inline-flex items-center gap-2"><FiArrowLeft /> Cambiar empresa</span>
          </button>
          <div className={inputWrap}>
            <FiSearch className={darkMode ? "text-orange-300" : "text-orange-600"} />
            <input
              className={input}
              placeholder={`Buscar en agricultores de ${empresaNombre}`}
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
        </div>
        <button className={btnPri} onClick={handleOpenModal}>
          <FiPlus /> Agregar agricultor
        </button>
      </div>

      {mensaje && <div className={`${darkMode ? "text-emerald-200" : "text-green-700"} font-semibold text-sm`}>{mensaje}</div>}

      <section className={`rounded-2xl p-6 ${darkMode ? cardNight : cardDay} ${softShadow}`}>
        <h2 className="text-lg font-semibold mb-4">Agricultores de {empresaNombre}</h2>

        <div className="md:hidden grid grid-cols-1 gap-3">
          {agricultoresFiltrados.length === 0 ? (
            <div className={`rounded-xl p-4 text-center ${darkMode ? "bg-[#1f1f1f] text-white/70" : "bg-white text-gray-600"} border ${darkMode ? "border-[#353535]" : "border-orange-200"}`}>
              No hay agricultores registrados
            </div>
          ) : (
            agricultoresFiltrados.map((a) => (
              <div key={a.id} className={`rounded-xl p-4 ${darkMode ? "bg-[#1f1f1f]" : "bg-white"} border ${darkMode ? "border-[#353535]" : "border-orange-200"}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-bold">{a.clave}</div>
                  <div className={`${darkMode ? "text-white/70" : "text-gray-600"} text-xs`}>{a.rfc || "Sin RFC"}</div>
                </div>
                <div className="mt-1 text-base font-semibold">{a.nombre}</div>
                <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
                  <div>Hectareas: {a.hectareas || "—"}</div>
                  <div>Sectores: {a.sectores || "—"}</div>
                  <div className="col-span-2">Ubicacion: {a.ubicacion || "—"}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden md:block overflow-x-auto rounded-2xl border">
          <table className={`min-w-full text-sm ${darkMode ? "bg-[#1f1f1f] border-[#353535]" : "bg-white border-orange-200"}`}>
            <thead>
              <tr className={`${darkMode ? "bg-slate-800 text-orange-200 border-slate-700" : "bg-orange-50 text-orange-700 border-orange-200"} border-b-2`}>
                <th className="px-4 py-3 text-left font-bold">Codigo</th>
                <th className="px-4 py-3 text-left font-bold">Nombre</th>
                <th className="px-4 py-3 text-left font-bold">Hectareas</th>
                <th className="px-4 py-3 text-left font-bold">Sectores</th>
                <th className="px-4 py-3 text-left font-bold">RFC</th>
                <th className="px-4 py-3 text-left font-bold">Ubicacion</th>
              </tr>
            </thead>
            <tbody>
              {agricultoresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`${darkMode ? "text-white/70" : "text-gray-500"} text-center py-8`}>No hay agricultores registrados</td>
                </tr>
              ) : (
                agricultoresFiltrados.map((a, i) => (
                  <tr key={a.id} className={`${i % 2 === 0 ? (darkMode ? "bg-slate-900" : "bg-orange-50") : (darkMode ? "bg-gray-800" : "bg-white")} border-b ${darkMode ? "border-slate-700" : "border-orange-100"}`}>
                    <td className="px-4 py-3 font-bold">{a.clave}</td>
                    <td className="px-4 py-3">{a.nombre}</td>
                    <td className="px-4 py-3">{a.hectareas}</td>
                    <td className="px-4 py-3">{a.sectores}</td>
                    <td className="px-4 py-3">{a.rfc}</td>
                    <td className="px-4 py-3">{a.ubicacion}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ModalAgricultor
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAgregarAgricultor}
        values={agricultorForm}
        onChange={handleChange}
        nextClave={nextClave}
        loading={loading}
      />
    </div>
  )
}

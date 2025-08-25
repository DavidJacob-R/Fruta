import { useState, useEffect, useMemo } from "react"
import AgricultoresPanel from "./AgricultoresPanel"
import ModalEmpresa from "./ModalEmpresa"
import { useUi } from "@/components/ui-context"
import { FiSearch, FiPlus } from "react-icons/fi"

type Empresa = {
  id: number
  empresa: string
  telefono?: string
  email?: string
  direccion?: string
  tipo_venta: string
}

export default function EmpresasPanel() {
  const { darkMode } = useUi()

  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<Empresa | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [empresaForm, setEmpresaForm] = useState({
    empresa: "",
    telefono: "",
    email: "",
    direccion: "",
    tipo_venta: "nacional",
  })
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState("")
  const [busqueda, setBusqueda] = useState("")
  const [cargandoLista, setCargandoLista] = useState(true)

  const cardDay = "bg-[#f8f7f5] border border-orange-200"
  const cardNight = "bg-[#232323] border border-[#353535]"
  const softShadow = "shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]"
  const inputWrap = `${darkMode ? cardNight : cardDay} rounded-xl px-3 py-2 flex items-center gap-2`
  const input = "bg-transparent outline-none w-72 max-w-full"
  const btnPri = "inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white bg-orange-600 hover:bg-orange-700"

  const cargarEmpresas = () => {
    setCargandoLista(true)
    fetch("/api/empresas/listar")
      .then((r) => r.json())
      .then((data) => setEmpresas(data.empresas || []))
      .finally(() => setCargandoLista(false))
  }

  useEffect(() => {
    cargarEmpresas()
  }, [])

  const handleChangeEmpresa = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEmpresaForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleAgregarEmpresa = async () => {
    setLoading(true)
    await fetch("/api/empresas/agregar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(empresaForm),
    })
      .then((r) => r.json())
      .then((res) => {
        setMensaje(res.success ? "Empresa agregada correctamente." : res.message)
        setEmpresaForm({
          empresa: "",
          telefono: "",
          email: "",
          direccion: "",
          tipo_venta: "nacional",
        })
        cargarEmpresas()
        setModalOpen(false)
        setTimeout(() => setMensaje(''), 2500)
      })
      .finally(() => setLoading(false))
  }

  const empresasFiltradas = useMemo(() => {
    const k = busqueda.trim().toLowerCase()
    if (!k) return empresas
    return empresas.filter(e =>
      e.empresa.toLowerCase().includes(k) ||
      (e.email || "").toLowerCase().includes(k) ||
      (e.direccion || "").toLowerCase().includes(k) ||
      (e.telefono || "").toLowerCase().includes(k)
    )
  }, [empresas, busqueda])

  if (empresaSeleccionada) {
    return (
      <AgricultoresPanel
        empresaId={empresaSeleccionada.id}
        empresaNombre={empresaSeleccionada.empresa}
        onClose={() => setEmpresaSeleccionada(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={inputWrap}>
            <FiSearch className={darkMode ? "text-orange-300" : "text-orange-600"} />
            <input
              className={input}
              placeholder="Buscar empresa por nombre, email, teléfono o dirección"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
        </div>
        <button className={btnPri} onClick={() => setModalOpen(true)}>
          <FiPlus /> Agregar empresa
        </button>
      </div>

      {mensaje && (
        <div className={`${darkMode ? "text-emerald-200" : "text-green-700"} font-semibold text-sm`}>{mensaje}</div>
      )}

      <section className={`rounded-2xl p-6 ${darkMode ? cardNight : cardDay} ${softShadow}`}>
        <h2 className="text-lg font-semibold mb-4">Listado de empresas</h2>

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
        ) : empresasFiltradas.length === 0 ? (
          <div className={`rounded-2xl border border-dashed ${darkMode ? "border-[#353535] text-white/80" : "border-orange-200 text-[#1a1a1a]/70"} p-8 text-center`}>
            No hay empresas registradas.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {empresasFiltradas.map((emp) => (
              <button
                type="button"
                key={emp.id}
                className={`text-left group rounded-2xl p-5 border ${darkMode ? "bg-[#1f1f1f] border-[#353535] hover:bg-[#202020]" : "bg-white border-orange-200 hover:bg-orange-50"} transition ${softShadow}`}
                onClick={() => setEmpresaSeleccionada(emp)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className={`text-lg font-bold ${darkMode ? "text-orange-100" : "text-gray-800"}`}>{emp.empresa}</div>
                    <div className={`${darkMode ? "text-white/70" : "text-gray-600"} text-sm mt-1`}>
                      Tel: {emp.telefono || <span className="opacity-60">—</span>}
                    </div>
                    <div className={`${darkMode ? "text-white/70" : "text-gray-600"} text-sm`}>
                      Email: {emp.email || <span className="opacity-60">—</span>}
                    </div>
                    {emp.direccion && (
                      <div className={`${darkMode ? "text-white/70" : "text-gray-600"} text-xs mt-1`}>{emp.direccion}</div>
                    )}
                  </div>
                  <span className={`${emp.tipo_venta === "nacional" ? "bg-orange-100 text-orange-800" : "bg-amber-100 text-amber-800"} px-3 py-1 rounded-full text-xs font-bold`}>
                    {emp.tipo_venta === "nacional" ? "Nacional" : "Exportación"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <ModalEmpresa
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAgregarEmpresa}
        values={empresaForm}
        onChange={handleChangeEmpresa}
        loading={loading}
      />
    </div>
  )
}

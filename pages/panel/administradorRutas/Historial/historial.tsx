import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import { FiHome, FiSearch, FiRefreshCw, FiDownload } from "react-icons/fi"
import { useUi } from "@/components/ui-context"

type Item = {
  id: number
  fecha: string
  accion: string
  usuario: string
  referencia: string
  detalle: string
}

const tabs = [
  { key: "recepcion", label: "Recepcion" },
  { key: "calidad", label: "Control de calidad" },
  { key: "preenfriado", label: "Preenfriado" },
  { key: "carga", label: "Salidas" }
]

export default function HistorialAdmin() {
  const router = useRouter()
  const { darkMode } = useUi()

  const [modulo, setModulo] = useState<string>("recepcion")
  const [q, setQ] = useState<string>("")
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const bgDay = "bg-[#f6f4f2]"
  const bgNight = "bg-[#121212]"
  const textDay = "text-[#1a1a1a]"
  const textNight = "text-white"
  const cardDay = "bg-[#f8f7f5] border border-orange-200"
  const cardNight = "bg-[#1a1a1a] border border-[#2a2a2a]"
  const softShadow = "shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]"
  const headDay = "bg-orange-50 text-orange-800"
  const headNight = "bg-[#0f0f0f] text-orange-200"
  const rowBorder = darkMode ? "border-[#2a2a2a]" : "border-orange-100"
  const textMuted = darkMode ? "text-gray-300" : "text-gray-700"
  const titleAccent = darkMode ? "text-orange-300" : "text-orange-700"
  const btn = "inline-flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition"
  const btnGhost = darkMode ? "bg-white/5 hover:bg-white/10 text-white" : "bg-white hover:bg-gray-100 text-gray-900 border border-orange-200"
  const btnPrimary = darkMode ? "bg-orange-600 hover:bg-orange-700 text-white" : "bg-orange-600 hover:bg-orange-700 text-white"
  const tabBtn = (active: boolean) =>
    `rounded-xl px-4 py-2 text-sm font-semibold ${active
      ? (darkMode ? "bg-orange-500/30 text-orange-200" : "bg-orange-100 text-orange-700")
      : (darkMode ? "text-orange-300 hover:bg-[#1e1914]" : "text-orange-700 hover:bg-orange-100")}`

  async function fetchData(opts?: { keepItems?: boolean }) {
    if (!opts?.keepItems) setLoading(true)
    const params = new URLSearchParams()
    params.set("modulo", modulo)
    params.set("limit", "200")
    if (q.trim().length > 0) params.set("q", q.trim())
    const r = await fetch(`/api/admin/historial?${params.toString()}`)
    const j = await r.json()
    setItems(Array.isArray(j.items) ? j.items : [])
    setLoading(false)
  }

  function exportCSV() {
    const headers = ["fecha", "accion", "usuario", "referencia", "detalle"]
    const rows = items.map(it => [it.fecha ?? "", (it.accion ?? "").replaceAll("_", " "), it.usuario ?? "", it.referencia ?? "", it.detalle ?? ""])
    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `historial_${modulo}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    fetchData()
  }, [modulo])

  const title = useMemo(() => {
    const t = tabs.find(x => x.key === modulo)
    return t ? t.label : "Historial"
  }, [modulo])

  return (
    <div className={`min-h-screen ${darkMode ? bgNight : bgDay} ${darkMode ? textNight : textDay}`}>
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col gap-4">
          <div className={`w-full rounded-2xl ${darkMode ? "bg-orange-500/10" : "bg-orange-100"} p-4 md:p-6 ${softShadow}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className={`text-sm ${textMuted}`}>Panel de administrador</div>
                <h1 className={`text-2xl md:text-3xl font-extrabold ${titleAccent}`}>{title}</h1>
                <p className={`text-sm mt-1 ${textMuted}`}>Consulta y filtra el historial por módulo, usuario, referencia o detalle.</p>
              </div>
              <div className="flex items-center gap-2">
                <button className={`${btn} ${btnGhost}`} onClick={() => router.push("/panel/administrador")} title="Ir al menú principal">
                  <FiHome />
                  <span className="hidden sm:inline">Menú</span>
                </button>
                <button className={`${btn} ${btnGhost}`} onClick={() => fetchData({ keepItems: true })} title="Recargar">
                  <FiRefreshCw />
                  <span className="hidden sm:inline">Recargar</span>
                </button>
                <button className={`${btn} ${btnPrimary}`} onClick={exportCSV} title="Exportar CSV">
                  <FiDownload />
                  <span className="hidden sm:inline">Exportar</span>
                </button>
              </div>
            </div>
          </div>

          <section className={`p-4 md:p-6 rounded-2xl ${darkMode ? cardNight : cardDay} ${softShadow}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {tabs.map(t => (
                  <button key={t.key} onClick={() => setModulo(t.key)} className={tabBtn(modulo === t.key)}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${darkMode ? "bg-[#121212] border border-[#2a2a2a]" : "bg-white border border-orange-200"} ${softShadow}`}>
                <FiSearch className={darkMode ? "text-orange-300" : "text-orange-600"} />
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="buscar por usuario, referencia o detalle"
                  className="bg-transparent outline-none w-72 max-w-full text-sm"
                />
                <button onClick={() => fetchData()} className={`${btn} ${btnPrimary}`}>buscar</button>
              </div>
            </div>

            <div className={`mt-4 overflow-x-auto rounded-2xl ${darkMode ? "border border-[#2a2a2a] bg-[#151515]" : "border border-orange-200 bg-white"} ${softShadow}`}>
              <table className="min-w-full text-left text-sm">
                <thead className={darkMode ? headNight : headDay}>
                  <tr>
                    <th className="px-4 py-3">fecha</th>
                    <th className="px-4 py-3">accion</th>
                    <th className="px-4 py-3">usuario</th>
                    <th className="px-4 py-3">referencia</th>
                    <th className="px-4 py-3">detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center">cargando...</td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center">
                        <div className="text-base font-semibold">Sin datos</div>
                        <div className={`text-xs mt-1 ${textMuted}`}>Ajusta los filtros o cambia de pestaña</div>
                      </td>
                    </tr>
                  ) : (
                    items.map(it => (
                      <tr key={it.id} className={`border-b ${rowBorder}`}>
                        <td className="px-4 py-3 whitespace-nowrap">{it.fecha}</td>
                        <td className="px-4 py-3 capitalize">{String(it.accion || "").replaceAll("_"," ")}</td>
                        <td className="px-4 py-3">{it.usuario || "-"}</td>
                        <td className="px-4 py-3">{it.referencia}</td>
                        <td className="px-4 py-3">{it.detalle}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

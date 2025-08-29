import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import { FiHome, FiSearch } from "react-icons/fi"
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
  const bgNight = "bg-[#161616]"
  const textDay = "text-[#1a1a1a]"
  const textNight = "text-white"
  const cardDay = "bg-[#f8f7f5] border border-orange-200"
  const cardNight = "bg-[#232323] border border-[#353535]"
  const softShadow = "shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]"
  const inputWrap = `${darkMode ? cardNight : cardDay} rounded-xl px-3 py-2 flex items-center gap-2`
  const inputSearch = "bg-transparent outline-none w-72 max-w-full"
  const btnPri = "inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white bg-orange-600 hover:bg-orange-700 active:scale-95"
  const tabBtn = (active: boolean) =>
    `rounded-xl px-4 py-2 text-sm font-semibold ${active ? (darkMode ? "bg-orange-500/30 text-orange-200" : "bg-orange-100 text-orange-700") : (darkMode ? "text-orange-300 hover:bg-[#1e1914]" : "text-orange-700 hover:bg-orange-100")}`

  async function fetchData() {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("modulo", modulo)
    params.set("limit", "200")
    if (q.trim().length > 0) params.set("q", q.trim())
    const r = await fetch(`/api/admin/historial?${params.toString()}`)
    const j = await r.json()
    setItems(Array.isArray(j.items) ? j.items : [])
    setLoading(false)
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
      <header className="mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/panel/administrador")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold bg-orange-500 text-white hover:bg-orange-600 active:scale-95"
            title="inicio"
          >
            <FiHome /> inicio
          </button>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
      </header>

      <section className={`p-4 md:p-6 rounded-2xl ${darkMode ? cardNight : cardDay} ${softShadow}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setModulo(t.key)}
                className={tabBtn(modulo === t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className={inputWrap}>
            <FiSearch className={darkMode ? "text-orange-300" : "text-orange-600"} />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="buscar por usuario, referencia o detalle"
              className={inputSearch}
            />
            <button onClick={fetchData} className={btnPri}>buscar</button>
          </div>
        </div>

        <div className={`mt-4 overflow-x-auto rounded-2xl ${darkMode ? "border border-[#353535] bg-[#1a1a1a]" : "border border-orange-200 bg-white"} ${softShadow}`}>
          <table className="min-w-full text-left text-sm">
            <thead className={darkMode ? "bg-slate-900" : "bg-orange-50"}>
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
                  <td colSpan={5} className="px-4 py-6 text-center">sin datos</td>
                </tr>
              ) : (
                items.map(it => (
                  <tr key={it.id} className={`border-b ${darkMode ? "border-slate-700" : "border-orange-100"}`}>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(it.fecha).toLocaleString()}</td>
                    <td className="px-4 py-3 capitalize">{String(it.accion || "").replaceAll("_"," ")}</td>
                    <td className="px-4 py-3">{it.usuario}</td>
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
  )
}

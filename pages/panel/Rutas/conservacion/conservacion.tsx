import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"

type Pallet = {
  id: number
  codigo: string
  fruta: string
  empaque: string
  cajas: number
  entryDate: string
  entryTime: string
  coolingTime: string
  finalTemp: number | null
}

type Vista = "general" | "detallada"

export default function Conservacion() {
  const router = useRouter()
  const [vista, setVista] = useState<Vista>("general")
  const [pallets, setPallets] = useState<Pallet[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function cargar() {
    try {
      setCargando(true)
      setError(null)
      const r = await fetch("/api/conservacion/conservacion")
      const j = await r.json()
      setPallets(Array.isArray(j.pallets) ? j.pallets : [])
    } catch (e) {
      setError("No se pudo cargar conservación")
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim()
    if (!q) return pallets
    return pallets.filter((p) =>
      `${p.id} ${p.codigo} ${p.fruta} ${p.empaque} ${p.cajas} ${p.entryDate} ${p.entryTime}`
        .toLowerCase()
        .includes(q)
    )
  }, [pallets, busqueda])

  function Chip({ children }: { children: React.ReactNode }) {
    return (
      <span className="inline-flex items-center rounded-lg border border-neutral-800 bg-neutral-950 px-2 py-1 text-xs text-neutral-300">
        {children}
      </span>
    )
  }

  function EmptyState({ texto }: { texto: string }) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center text-neutral-400">
        {texto}
      </div>
    )
  }

  function SkeletonCard() {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 animate-pulse">
        <div className="h-5 w-40 rounded bg-neutral-800" />
        <div className="mt-2 h-3 w-28 rounded bg-neutral-800" />
        <div className="mt-4 h-3 w-full rounded bg-neutral-800" />
        <div className="mt-2 h-3 w-5/6 rounded bg-neutral-800" />
        <div className="mt-2 h-7 w-24 rounded bg-neutral-800" />
      </div>
    )
  }

  function Cabecera() {
    return (
      <header className="w-full">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/panel/empleado")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-800 bg-neutral-900/80 text-neutral-100 hover:bg-neutral-800 transition"
          >
            <span className="text-lg -ml-1">←</span>
            <span>Regresar</span>
          </button>

          <div className="flex items-center gap-3 select-none">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow">
              <span className="text-neutral-200 text-lg">🧊</span>
            </div>
            <div className="text-right">
              <h1 className="text-lg sm:text-xl font-semibold text-neutral-100 leading-tight">
                Conservación
              </h1>
              <p className="text-xs text-neutral-400">Pallets en cámara</p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-12">
          <div className="sm:col-span-8">
            <div className="relative">
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por código, fruta, empaque…"
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder-neutral-500 outline-none focus:ring-2 focus:ring-white/10"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                🔍
              </div>
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          <div className="sm:col-span-4">
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-neutral-800 bg-neutral-900 p-1">
              <button
                onClick={() => setVista("general")}
                className={`rounded-xl px-3 py-2 text-sm ${
                  vista === "general"
                    ? "bg-white text-black font-semibold"
                    : "text-neutral-200 hover:bg-neutral-800"
                }`}
              >
                General
              </button>
              <button
                onClick={() => setVista("detallada")}
                className={`rounded-xl px-3 py-2 text-sm ${
                  vista === "detallada"
                    ? "bg-white text-black font-semibold"
                    : "text-neutral-200 hover:bg-neutral-800"
                }`}
              >
                Detallada
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-neutral-300">
            En cámara: <span className="text-neutral-100 font-medium">{pallets.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={cargar}
              className="px-3 py-2 rounded-xl border border-neutral-800 text-neutral-100 hover:bg-neutral-800 text-sm"
            >
              Refrescar
            </button>
          </div>
        </div>
      </header>
    )
  }

  function VistaGeneral() {
    if (cargando)
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )

    if (error) return <EmptyState texto={error} />

    if (filtrados.length === 0) return <EmptyState texto="Sin pallets en conservación" />

    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtrados.map((p) => {
          const temp = p.finalTemp === null ? "—" : `${p.finalTemp.toFixed(1)}°C`
          return (
            <div key={p.id} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
              <div className="flex items-start justify-between">
                <div className="pr-3">
                  <div className="text-base font-semibold text-neutral-100">
                    Pallet <span className="text-neutral-300">{String(p.id).slice(-6)}</span>
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    {p.fruta} · {p.empaque}
                  </div>
                </div>
                <Chip>{p.codigo}</Chip>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wide text-neutral-500">Cajas</div>
                  <div className="text-sm text-neutral-100">{p.cajas}</div>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wide text-neutral-500">Temp. final</div>
                  <div className="text-sm text-neutral-100">{temp}</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-neutral-400">
                  Ingreso {p.entryDate} {p.entryTime}
                </div>
                <Chip>{p.coolingTime}</Chip>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  function VistaDetallada() {
    if (cargando)
      return (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <div className="h-8 w-40 rounded bg-neutral-800 animate-pulse" />
          <div className="mt-4 h-40 w-full rounded bg-neutral-900">
            <div className="mt-2 h-5 w-full rounded bg-neutral-800 animate-pulse" />
            <div className="mt-2 h-5 w-full rounded bg-neutral-800 animate-pulse" />
            <div className="mt-2 h-5 w-full rounded bg-neutral-800 animate-pulse" />
          </div>
        </div>
      )

    if (error) return <EmptyState texto={error} />

    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900/70">
              <tr className="border-b border-neutral-800">
                <th className="p-3 text-left">Pallet</th>
                <th className="p-3 text-left">Código</th>
                <th className="p-3 text-left">Fruta</th>
                <th className="p-3 text-left">Empaque</th>
                <th className="p-3 text-left">Cajas</th>
                <th className="p-3 text-left">Fecha ingreso</th>
                <th className="p-3 text-left">Hora ingreso</th>
                <th className="p-3 text-left">Tiempo enfriamiento</th>
                <th className="p-3 text-left">Temp. final</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-neutral-400">
                    Sin pallets en conservación
                  </td>
                </tr>
              ) : (
                filtrados.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`border-b border-neutral-850/50 ${i % 2 === 0 ? "bg-neutral-950/30" : ""} hover:bg-neutral-800/40`}
                  >
                    <td className="p-3">Pallet {String(p.id).slice(-10)}</td>
                    <td className="p-3 font-mono text-neutral-300">{p.codigo}</td>
                    <td className="p-3">{p.fruta}</td>
                    <td className="p-3">{p.empaque}</td>
                    <td className="p-3">{p.cajas}</td>
                    <td className="p-3">{p.entryDate}</td>
                    <td className="p-3">{p.entryTime}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center rounded-lg border border-neutral-800 bg-neutral-950 px-2 py-1 text-xs text-neutral-300">
                        {p.coolingTime}
                      </span>
                    </td>
                    <td className="p-3">{p.finalTemp === null ? "—" : `${p.finalTemp.toFixed(1)}°C`}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-925 to-neutral-950 text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Cabecera />
        <section className="mt-6">
          {vista === "general" ? <VistaGeneral /> : <VistaDetallada />}
        </section>
      </main>
      <footer className="w-full text-center py-5 text-sm text-neutral-500">
        © {new Date().getFullYear()} El Molinito – Conservación
      </footer>
    </div>
  )
}

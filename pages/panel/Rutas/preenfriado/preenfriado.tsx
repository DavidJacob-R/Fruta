import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"

type Pedido = { id: number; fruta: string; empaque: string; cajas: number; origen: string }
type PalletSrv = { id: number; codigo: string; fruta: string; empaque: string; cajas: number; objetivo: number; completo: boolean; camara: string; temp_objetivo: number; inicio: number; temp_final: number | null; estado: "en_preenfriado" | "listo" }
type TopUp = { pallet_id: number; recepciones: { recepcion_id: number; cajas: number }[] }
type PalletLocal = { id: string; fruta: string; empaque: string; cajas: number; objetivo: number; completo: boolean; pedidos: { recepcion_id: number; cajas: number }[]; camara: string; temp_objetivo: number; estado: "en_preenfriado" | "listo"; inicio: number; temp_final?: number | null }

function normalizar(s: string) { return s.toLowerCase().trim() }
function reglas(fruta: string, empaque: string) {
  const k = normalizar(empaque); const f = normalizar(fruta)
  if (k === "6oz" || k === "6 oz") return { min: 240, max: 264, obj: 240, temp: 4 }
  if (k.includes("6oz") && k.includes("4x5")) return { min: 240, max: 264, obj: 240, temp: 4 }
  if (k === "pinta") return { min: 144, max: 156, obj: 150, temp: 4 }
  if (k === "4.4oz" || k === "4_4oz" || k === "4.4 oz") return { min: 195, max: 195, obj: 195, temp: 4 }
  if (k === "8x1lb" || k === "8 x 1lb" || k === "8x1 lb") return { min: 108, max: 120, obj: 120, temp: f === "fresa" ? 2 : 4 }
  if (k === "12oz" || k === "12 oz") return { min: 144, max: 180, obj: 150, temp: 4 }
  return { min: 200, max: 240, obj: 200, temp: 4 }
}
function genTmp() { return `TMP-${Date.now()}-${Math.floor(Math.random() * 10000)}` }
function tiempo(ms: number) { const s = Math.floor(ms / 1000); const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); const r = s % 60; return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${r.toString().padStart(2, "0")}` }

export default function Preenfriado() {
  const router = useRouter()
  const [tab, setTab] = useState<"pedidos" | "camara">("pedidos")
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [pallets, setPallets] = useState<PalletSrv[]>([])
  const [seleccionPedidos, setSeleccionPedidos] = useState<number[]>([])
  const [seleccionPallets, setSeleccionPallets] = useState<number[]>([])
  const [estadoCamara, setEstadoCamara] = useState<"todos" | "en_preenfriado" | "listo">("todos")
  const [tick, setTick] = useState(0)
  const [resumenTopUp, setResumenTopUp] = useState<TopUp[] | null>(null)
  const [resumen, setResumen] = useState<PalletLocal[] | null>(null)
  const [temps, setTemps] = useState<Record<number, string>>({})
  const [consFuente, setConsFuente] = useState<PalletSrv | null>(null)
  const [consTarget, setConsTarget] = useState<number | null>(null)
  const [consCajas, setConsCajas] = useState<number>(0)

  async function cargarPedidos() {
    const r = await fetch("/api/preenfriado/pedidos")
    const j = await r.json()
    setPedidos(j.pedidos || [])
  }
  async function cargarPallets() {
    const r = await fetch("/api/preenfriado/pallets")
    const j = await r.json()
    setPallets(j.pallets || [])
  }

  useEffect(() => { cargarPedidos(); cargarPallets() }, [])
  useEffect(() => { const t = setInterval(() => setTick((v) => v + 1), 1000); return () => clearInterval(t) }, [])

  const pedidosFiltrados = useMemo(() => pedidos.filter((p) => p.cajas > 0), [pedidos])
  const palletsCamara = useMemo(() => pallets.filter((p) => (estadoCamara === "todos" ? true : p.estado === estadoCamara)), [pallets, estadoCamara])
  const incompletos = useMemo(() => pallets.filter((p) => p.estado === "en_preenfriado" && !p.completo), [pallets])
  const totalSelPedidos = useMemo(() => pedidos.filter((p) => seleccionPedidos.includes(p.id)).reduce((a, b) => a + b.cajas, 0), [seleccionPedidos, pedidos])

  function toggleSelPedido(id: number) { setSeleccionPedidos((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])) }
  function toggleSelPallet(id: number) { setSeleccionPallets((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])) }

  function formarLocal(base: Pedido[]): PalletLocal[] {
    const grupos = new Map<string, Pedido[]>()
    for (const p of base) {
      const key = `${normalizar(p.fruta)}|${normalizar(p.empaque)}`
      const arr = grupos.get(key) || []
      arr.push({ ...p })
      grupos.set(key, arr)
    }
    const resultado: PalletLocal[] = []
    for (const [key, arr] of grupos) {
      const [fruta, empaque] = key.split("|")
      const r = reglas(fruta, empaque)
      let total = arr.reduce((s, x) => s + x.cajas, 0)
      const cola = arr.map((p) => ({ id: p.id, cajas: p.cajas }))
      while (total > 0) {
        const objetivo = Math.min(r.obj, total, r.max)
        let acum = 0
        const usados: { recepcion_id: number; cajas: number }[] = []
        for (let i = 0; i < cola.length && acum < objetivo; i++) {
          const it = cola[i]; if (it.cajas === 0) continue
          const caben = objetivo - acum
          const tomar = it.cajas <= caben ? it.cajas : caben
          if (tomar > 0) { usados.push({ recepcion_id: it.id, cajas: tomar }); it.cajas -= tomar; acum += tomar }
        }
        for (let i = cola.length - 1; i >= 0; i--) if (cola[i].cajas === 0) cola.splice(i, 1)
        total -= acum
        const completo = acum >= r.min && acum <= r.max
        resultado.push({ id: genTmp(), fruta, empaque, cajas: acum, objetivo: r.obj, completo, pedidos: usados, camara: "Cámara única", temp_objetivo: 4, estado: "en_preenfriado", inicio: Date.now(), temp_final: null })
      }
    }
    return resultado
  }

  function planRelleno(base: Pedido[]): { topups: TopUp[]; restantes: Pedido[] } {
    const restantes = base.map((p) => ({ ...p }))
    const topups: TopUp[] = []
    const grupos = new Map<string, { pedidos: { id: number; cajas: number }[]; targets: PalletSrv[] }>()
    for (const p of restantes) {
      const key = `${normalizar(p.fruta)}|${normalizar(p.empaque)}`
      const item = grupos.get(key) || { pedidos: [], targets: incompletos.filter((t) => normalizar(t.fruta) === normalizar(p.fruta) && normalizar(t.empaque) === normalizar(p.empaque)) }
      item.pedidos.push({ id: p.id, cajas: p.cajas })
      grupos.set(key, item)
    }
    for (const [key, g] of grupos) {
      const [fruta, empaque] = key.split("|")
      const r = reglas(fruta, empaque)
      const targets = g.targets.sort((a, b) => a.cajas - b.cajas)
      for (const t of targets) {
        let need = Math.max(0, t.objetivo - t.cajas)
        if (need <= 0) continue
        const movs: { recepcion_id: number; cajas: number }[] = []
        for (const ped of restantes) {
          if (normalizar(ped.fruta) !== normalizar(fruta) || normalizar(ped.empaque) !== normalizar(empaque)) continue
          if (ped.cajas <= 0 || need <= 0) continue
          const take = Math.min(ped.cajas, need)
          if (take > 0) {
            movs.push({ recepcion_id: ped.id, cajas: take })
            ped.cajas -= take
            need -= take
          }
        }
        if (movs.length > 0) topups.push({ pallet_id: t.id, recepciones: movs })
      }
    }
    const restantesClean = restantes.filter((p) => p.cajas > 0)
    return { topups, restantes: restantesClean }
  }

  function accionFormarPallets() {
    const setSel = new Set(seleccionPedidos)
    const base = pedidos.filter((p) => setSel.has(p.id) && p.cajas > 0)
    if (base.length === 0) return
    const plan = planRelleno(base)
    setResumenTopUp(plan.topups)
    setResumen(formarLocal(plan.restantes))
  }

  async function confirmarFormacion() {
    if (!resumenTopUp && (!resumen || resumen.length === 0)) return
    if (resumenTopUp && resumenTopUp.length > 0) {
      for (const t of resumenTopUp) {
        await fetch("/api/preenfriado/agregar-existente", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pallet_id: t.pallet_id, recepciones: t.recepciones, usuario_id: null }) })
      }
    }
    if (resumen && resumen.length > 0) {
      const payload = { pallets: resumen.map((p) => ({ pedidos: p.pedidos })), usuario_id: null, tipo_pallet_id: null }
      await fetch("/api/preenfriado/formar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    }
    setResumenTopUp(null)
    setResumen(null)
    setSeleccionPedidos([])
    await cargarPedidos()
    await cargarPallets()
    setTab("camara")
  }

  async function marcarListo(id: number) {
    const raw = temps[id]
    const n = raw === undefined || raw === "" ? null : Number(raw)
    await fetch("/api/preenfriado/marcar-listo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pallet_id: id, temp_final: Number.isFinite(n as any) ? n : null, usuario_id: null }) })
    await cargarPallets()
  }

  async function enviarConservacion() {
    if (seleccionPallets.length === 0) return
    await fetch("/api/preenfriado/enviar-almacen", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pallet_ids: seleccionPallets, usuario_id: null, ubicacion: "Cámara única" }) })
    setSeleccionPallets([])
    await cargarPallets()
    router.push("/panel/Rutas/conservacion")
  }

  function abrirConsolidar(p: PalletSrv) {
    const opciones = pallets.filter((x) => x.estado === "en_preenfriado" && x.id !== p.id && normalizar(x.fruta) === normalizar(p.fruta) && normalizar(x.empaque) === normalizar(p.empaque))
    const tgt = opciones[0]?.id ?? null
    setConsFuente(p)
    setConsTarget(tgt)
    if (tgt) {
      const regla = reglas(p.fruta, p.empaque)
      const target = opciones[0]
      const espacio = Math.max(0, regla.max - target.cajas)
      const maxMov = Math.min(p.cajas, espacio)
      setConsCajas(Math.max(1, Math.min(10, maxMov)))
    } else {
      setConsCajas(0)
    }
  }

  async function confirmarConsolidar() {
    if (!consFuente || !consTarget || !consCajas || consCajas <= 0) { setConsFuente(null); return }
    await fetch("/api/preenfriado/consolidar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source_id: consFuente.id, target_id: consTarget, cajas: consCajas, usuario_id: null }) })
    setConsFuente(null)
    await cargarPallets()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-925 to-neutral-950 text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-28 pt-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => router.push("/panel/empleado")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-800 bg-neutral-900/80 text-neutral-100 hover:bg-neutral-800 transition"
          >
            <span className="text-lg -ml-1">←</span>
            <span>Regresar</span>
          </button>
          <div className="flex items-center gap-3 select-none">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow">
              <span className="text-neutral-200 text-lg">❄️</span>
            </div>
            <div className="text-right">
              <h1 className="text-lg sm:text-xl font-semibold text-neutral-100 leading-tight">Preenfriado</h1>
              <p className="text-xs text-neutral-400">Formación y cámara</p>
            </div>
          </div>
        </div>

        <div className="sticky top-0 z-10 bg-gradient-to-b from-neutral-950/95 to-neutral-950/70 backdrop-blur rounded-2xl border border-neutral-800 p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setTab("pedidos")}
              className={`px-4 py-2 rounded-xl text-sm ${tab === "pedidos" ? "bg-white text-black font-semibold" : "text-neutral-200 hover:bg-neutral-900"}`}
            >
              Pedidos
            </button>
            <button
              onClick={() => setTab("camara")}
              className={`px-4 py-2 rounded-xl text-sm ${tab === "camara" ? "bg-white text-black font-semibold" : "text-neutral-200 hover:bg-neutral-900"}`}
            >
              Cámara
            </button>
          </div>
        </div>

        {tab === "pedidos" && (
          <div className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pedidosFiltrados.map((p) => (
                <label key={p.id} className={`rounded-2xl border bg-neutral-900 p-4 active:scale-[0.99] transition ${seleccionPedidos.includes(p.id) ? "border-white/30" : "border-neutral-800 hover:border-neutral-700"}`}>
                  <div className="flex items-start justify-between">
                    <div className="pr-3">
                      <div className="text-base sm:text-lg font-semibold text-neutral-100">Pedido {p.id}</div>
                      <div className="text-xs text-neutral-500">{p.fruta} · {p.empaque}</div>
                    </div>
                    <input type="checkbox" className="h-6 w-6 rounded border-2 border-neutral-600 bg-neutral-800" checked={seleccionPedidos.includes(p.id)} onChange={() => toggleSelPedido(p.id)} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2">
                      <div className="text-[10px] uppercase tracking-wide text-neutral-500">Cajas</div>
                      <div className="text-sm text-neutral-100">{p.cajas}</div>
                    </div>
                    <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2">
                      <div className="text-[10px] uppercase tracking-wide text-neutral-500">Origen</div>
                      <div className="text-sm text-neutral-100 truncate">{p.origen}</div>
                    </div>
                  </div>
                </label>
              ))}
              {pedidosFiltrados.length === 0 && (<div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center text-neutral-400">Sin pedidos</div>)}
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-neutral-950/95 backdrop-blur border-t border-neutral-800 pb-[env(safe-area-inset-bottom)]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm sm:text-base text-neutral-300">{seleccionPedidos.length} seleccionado(s) • {totalSelPedidos} cajas</div>
                  <button onClick={accionFormarPallets} disabled={seleccionPedidos.length === 0} className={`px-5 py-3 rounded-xl text-sm sm:text-base ${seleccionPedidos.length === 0 ? "bg-neutral-800 text-neutral-600 cursor-not-allowed" : "bg-white text-black font-semibold hover:bg-neutral-200 shadow"}`}>
                    Formar pallets
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "camara" && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-neutral-400">Cámara única</div>
              <select value={estadoCamara} onChange={(e) => setEstadoCamara(e.target.value as any)} className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100">
                <option value="todos">Todos</option>
                <option value="en_preenfriado">En preenfriado</option>
                <option value="listo">Listo</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {palletsCamara.map((p) => {
                const pct = Math.min(100, Math.round((p.cajas / p.objetivo) * 100))
                const trans = tiempo(Date.now() - p.inicio + tick * 0)
                return (
                  <div key={p.id} className={`rounded-2xl p-4 sm:p-5 border ${p.estado === "listo" ? "border-emerald-600/60" : "border-neutral-800"} bg-neutral-900`}>
                    <div className="flex justify-between items-start">
                      <div className="pr-3">
                        <div className="text-base sm:text-lg font-semibold text-neutral-100">Pallet {String(p.id).slice(-6)}</div>
                        <div className="text-xs text-neutral-500">{p.fruta} · {p.empaque}</div>
                      </div>
                      <input type="checkbox" className="h-6 w-6 rounded border-2 border-neutral-600 bg-neutral-800" checked={seleccionPallets.includes(p.id)} onChange={() => toggleSelPallet(p.id)} />
                    </div>

                    <div className="mt-3 text-sm sm:text-base text-neutral-300">Cajas: {p.cajas} de {p.objetivo}</div>
                    <div className="h-2.5 rounded bg-neutral-800 overflow-hidden my-2"><div className="h-2.5 bg-white" style={{ width: `${pct}%` }} /></div>
                    <div className="text-xs text-neutral-400">Temp objetivo: {p.temp_objetivo}°C</div>
                    <div className="text-xs text-neutral-400">Tiempo: {trans}</div>

                    {p.estado === "en_preenfriado" ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <input type="number" inputMode="decimal" placeholder="Temp final" className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 w-28 text-sm text-neutral-100 placeholder-neutral-500" value={temps[p.id] ?? ""} onChange={(e) => setTemps((prev) => ({ ...prev, [p.id]: e.target.value }))} />
                        <button onClick={() => marcarListo(p.id)} className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 text-sm shadow">Marcar listo</button>
                        <button onClick={() => abrirConsolidar(p)} className="px-4 py-2 rounded-lg border border-neutral-800 text-neutral-100 hover:bg-neutral-800 text-sm">Consolidar</button>
                      </div>
                    ) : (
                      <div className="mt-3 text-xs text-emerald-400">Listo para enviar</div>
                    )}
                  </div>
                )
              })}
              {palletsCamara.length === 0 && (<div className="rounded-2xl p-6 border border-neutral-800 bg-neutral-900 text-center text-neutral-400">Sin pallets</div>)}
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-neutral-950/95 backdrop-blur border-t border-neutral-800 pb-[env(safe-area-inset-bottom)]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm sm:text-base text-neutral-300">{seleccionPallets.length} seleccionado(s)</div>
                  <button onClick={enviarConservacion} disabled={seleccionPallets.length === 0} className={`px-5 py-3 rounded-xl text-sm sm:text-base ${seleccionPallets.length === 0 ? "bg-neutral-800 text-neutral-600 cursor-not-allowed" : "bg-white text-black font-semibold hover:bg-neutral-200 shadow"}`}>
                    Enviar a conservación
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {(resumenTopUp || resumen) && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                <div className="text-lg font-semibold">Resumen</div>
                <div className="flex gap-2">
                  <button onClick={() => { setResumenTopUp(null); setResumen(null) }} className="px-4 py-2 rounded-lg border border-neutral-800 text-neutral-100 hover:bg-neutral-800">Cancelar</button>
                  <button onClick={confirmarFormacion} className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 shadow">Confirmar</button>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {resumenTopUp && resumenTopUp.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold mb-2">Rellenos a pallets existentes</div>
                    <div className="space-y-2">
                      {resumenTopUp.map((t) => (
                        <div key={t.pallet_id} className="rounded-xl bg-neutral-950 border border-neutral-800 p-3 text-sm">
                          <div className="font-semibold mb-1">Pallet {String(t.pallet_id).slice(-6)}</div>
                          <div className="text-neutral-300">{t.recepciones.map((x) => `${x.recepcion_id}: ${x.cajas} cajas`).join(" • ")}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {resumen && resumen.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold mb-2">Nuevos pallets</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {resumen.map((p) => {
                        const pct = Math.min(100, Math.round((p.cajas / p.objetivo) * 100))
                        return (
                          <div key={p.id} className="rounded-xl bg-neutral-950 border border-neutral-800 p-4">
                            <div className="flex justify-between items-center mb-1">
                              <div className="font-semibold">Pallet temporal</div>
                              <span className={`text-xs px-2 py-0.5 rounded ${p.completo ? "bg-emerald-600/30 text-emerald-300 border border-emerald-700/40" : "bg-amber-600/30 text-amber-300 border border-amber-700/40"}`}>{p.completo ? "completo" : "parcial"}</span>
                            </div>
                            <div className="text-sm text-neutral-300">{p.fruta} · {p.empaque}</div>
                            <div className="text-sm text-neutral-300 mb-2">Cajas: {p.cajas} de {p.objetivo}</div>
                            <div className="h-2.5 rounded bg-neutral-800 overflow-hidden"><div className="h-2.5 bg-white" style={{ width: `${pct}%` }} /></div>
                            <div className="mt-2 text-xs text-neutral-400">{p.pedidos.map((x) => <div key={`${x.recepcion_id}-${x.cajas}`}>{x.recepcion_id}: {x.cajas} cajas</div>)}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {consFuente && (
          <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center p-4">
            <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-neutral-900 border border-neutral-800">
              <div className="p-4 border-b border-neutral-800 text-lg font-semibold">Consolidar pallet {String(consFuente.id).slice(-6)}</div>
              <div className="p-4 space-y-3">
                <div className="text-sm text-neutral-300">Origen: {consFuente.fruta} · {consFuente.empaque} • {consFuente.cajas} cajas</div>
                <select value={consTarget ?? ""} onChange={(e) => setConsTarget(e.target.value === "" ? null : Number(e.target.value))} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100">
                  <option value="">Selecciona destino</option>
                  {pallets.filter((x) => x.estado === "en_preenfriado" && x.id !== consFuente.id && normalizar(x.fruta) === normalizar(consFuente.fruta) && normalizar(x.empaque) === normalizar(consFuente.empaque)).map((x) => (
                    <option key={x.id} value={x.id}>Pallet {String(x.id).slice(-6)} • {x.cajas}/{x.objetivo}</option>
                  ))}
                </select>
                <input type="number" min={1} value={consCajas} onChange={(e) => setConsCajas(Number(e.target.value || 0))} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100" placeholder="Cajas a mover" />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setConsFuente(null)} className="px-4 py-2 rounded-lg border border-neutral-800 text-neutral-100 hover:bg-neutral-800 text-sm">Cancelar</button>
                  <button onClick={confirmarConsolidar} disabled={!consTarget || !consCajas || consCajas <= 0} className={`px-4 py-2 rounded-lg text-sm ${!consTarget || !consCajas || consCajas <= 0 ? "bg-neutral-800 text-neutral-600 cursor-not-allowed" : "bg-white text-black font-semibold hover:bg-neutral-200 shadow"}`}>Mover</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

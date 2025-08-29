import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"

// Tipos locales
type Pallet = { id: number; empresa: string; numero: string }
type Checklist = {
  cartaInstruccion: boolean
  manifiestoCarga: boolean
  packingList: boolean
  proforma: boolean
}

// Subcomponentes internos (no son páginas, no se prerenderizan solos)
function HeaderSalidas({ onBack, total, step = 1 }: { onBack: () => void; total: number; step?: 1 | 2 }) {
  return (
    <header className="w-full">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-800 bg-neutral-900/80 text-neutral-100 hover:bg-neutral-800 transition"
        >
          <span className="text-lg -ml-1">←</span>
          <span>Regresar</span>
        </button>

        <div className="flex items-center gap-3 select-none">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow">
            <span className="text-neutral-200 text-lg">🚚</span>
          </div>
          <div className="text-right">
            <h1 className="text-lg sm:text-xl font-semibold text-neutral-100 leading-tight">Salidas de pallets</h1>
            <p className="text-xs text-neutral-400">Logística y despacho</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <nav className="text-sm text-neutral-400">
          <span className="hover:text-neutral-200">Panel</span>
          <span className="mx-2 text-neutral-600">/</span>
          <span className="hover:text-neutral-200">Almacén</span>
          <span className="mx-2 text-neutral-600">/</span>
          <span className="text-neutral-200 font-medium">Salidas</span>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-neutral-400">
            <span className={`inline-block w-2 h-2 rounded-full ${step===1 ? "bg-white/80":"bg-white/40"}`} />
            <span className={`inline-block w-2 h-2 rounded-full ${step===2 ? "bg-white/80":"bg-white/40"}`} />
            <span className="text-xs ml-2">{step===1 ? "Selección" : "Confirmación"}</span>
          </div>
          <span className="px-3 py-1 rounded-lg border border-neutral-800 bg-neutral-900/70 text-neutral-200 text-sm">
            Disponibles: <strong className="text-neutral-100">{total}</strong>
          </span>
        </div>
      </div>
    </header>
  )
}

function ListaPallets({
  pallets,
  selectedIds,
  onToggle,
  search,
  setSearch,
  onToggleVisible,
  onClear
}: {
  pallets: Pallet[]
  selectedIds: number[]
  onToggle: (id: number) => void
  search: string
  setSearch: (v: string) => void
  onToggleVisible: (ids: number[]) => void
  onClear: () => void
}) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return pallets
    return pallets.filter(p => p.numero.toLowerCase().includes(q) || p.empresa.toLowerCase().includes(q))
  }, [pallets, search])

  const visibleIds = filtered.map(p => p.id)
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id))

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between mb-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por código o empresa…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder-neutral-500 outline-none focus:ring-2 focus:ring-white/10"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">🔍</div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onToggleVisible(visibleIds)}
            disabled={visibleIds.length === 0}
            className={`px-4 py-2 rounded-xl border text-sm ${
              visibleIds.length === 0
                ? "border-neutral-800 text-neutral-600 cursor-not-allowed"
                : "border-neutral-700 text-neutral-100 hover:bg-neutral-800"
            }`}
          >
            {allVisibleSelected ? "Deseleccionar visibles" : "Seleccionar visibles"}
          </button>
          <button
            onClick={onClear}
            disabled={selectedIds.length === 0}
            className={`px-4 py-2 rounded-xl border text-sm ${
              selectedIds.length === 0
                ? "border-neutral-800 text-neutral-600 cursor-not-allowed"
                : "border-neutral-700 text-neutral-100 hover:bg-neutral-800"
            }`}
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Móvil: tarjetas */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filtered.map(p => {
          const checked = selectedIds.includes(p.id)
          return (
            <label
              key={p.id}
              className={`rounded-2xl border bg-neutral-900 p-4 flex items-start justify-between active:scale-[0.99] transition ${
                checked ? "border-white/30" : "border-neutral-800 hover:border-neutral-700"
              }`}
            >
              <div className="pr-3">
                <div className="text-base font-semibold text-neutral-100">
                  Pallet <span className="text-neutral-300">{String(p.id).slice(-6)}</span>
                </div>
                <div className="mt-1 text-xs text-neutral-500">Empresa</div>
                <div className="text-sm text-neutral-200">{p.empresa}</div>
                <div className="mt-1 text-xs text-neutral-500">Código</div>
                <div className="font-mono text-sm text-neutral-300">{p.numero}</div>
              </div>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(p.id)}
                className="mt-1 h-6 w-6 rounded border-2 border-neutral-600 bg-neutral-800"
              />
            </label>
          )
        })}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center text-neutral-400">
            No hay pallets en almacén
          </div>
        )}
      </div>

      {/* Tablet/escritorio: tabla */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900/70">
              <tr className="border-b border-neutral-800">
                <th className="p-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={() => onToggleVisible(visibleIds)}
                    className="h-5 w-5 rounded border-2 border-neutral-600 bg-neutral-800"
                  />
                </th>
                <th className="p-3 text-left text-neutral-300">Empresa</th>
                <th className="p-3 text-left text-neutral-300">Código de pallet</th>
                <th className="p-3 text-left text-neutral-300">Identificador</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const checked = selectedIds.includes(p.id)
                return (
                  <tr key={p.id} className={`border-b border-neutral-850/50 ${i%2===0 ? "bg-neutral-950/30" : ""} hover:bg-neutral-800/40`}>
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggle(p.id)}
                        className="h-5 w-5 rounded border-2 border-neutral-600 bg-neutral-800"
                      />
                    </td>
                    <td className="p-3 text-neutral-100">{p.empresa}</td>
                    <td className="p-3 font-mono text-neutral-300">{p.numero}</td>
                    <td className="p-3 text-neutral-300">Pallet {String(p.id).slice(-6)}</td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-neutral-400">No hay pallets en almacén</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ConfirmacionSalida({
  pallets,
  empresa,
  setEmpresa,
  cliente,
  setCliente,
  documentos,
  toggleDoc,
  onBack,
  onConfirm
}: {
  pallets: Pallet[]
  empresa: string
  setEmpresa: (v: string) => void
  cliente: string
  setCliente: (v: string) => void
  documentos: Checklist
  toggleDoc: (k: keyof Checklist) => void
  onBack: () => void
  onConfirm: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-base sm:text-lg font-semibold text-neutral-100 mb-3">Datos de salida</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-neutral-400">Empresa</label>
              <input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100 outline-none focus:ring-2 focus:ring-white/10"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400">Cliente</label>
              <input
                type="text"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100 outline-none focus:ring-2 focus:ring-white/10"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-base sm:text-lg font-semibold text-neutral-100 mb-3">Documentos (checklist)</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { key: "cartaInstruccion", label: "CARTA DE INSTRUCCIÓN" },
              { key: "manifiestoCarga", label: "MANIFIESTO DE CARGA" },
              { key: "packingList", label: "PACKING LIST" },
              { key: "proforma", label: "PROFORMA" }
            ].map(doc => (
              <li key={doc.key} className="px-3 py-2 rounded-xl flex items-center bg-neutral-950 border border-neutral-800">
                <input
                  type="checkbox"
                  checked={documentos[doc.key as keyof Checklist] as unknown as boolean}
                  onChange={() => toggleDoc(doc.key as keyof Checklist)}
                  className="w-5 h-5 rounded border-2 border-neutral-600 bg-neutral-800 mr-3"
                />
                <span className={`text-neutral-100 ${documentos[doc.key as keyof Checklist] ? "line-through opacity-70" : ""}`}>
                  {doc.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <h2 className="text-base sm:text-lg font-semibold text-neutral-100 mb-3">Pallets seleccionados</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {pallets.map(p => (
            <div key={p.id} className="px-3 py-2 rounded-lg text-center font-mono bg-neutral-950 border border-neutral-800 text-neutral-300">
              {p.numero}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onBack} className="px-5 py-3 rounded-xl border border-neutral-700 text-neutral-100 hover:bg-neutral-800">
          ← Corregir selección
        </button>
        <button onClick={onConfirm} className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-neutral-200 transition shadow">
          Confirmar salida →
        </button>
      </div>
    </div>
  )
}

// Página (default export)
export default function SalidasPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [pallets, setPallets] = useState<Pallet[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [search, setSearch] = useState("")
  const [empresa, setEmpresa] = useState("HEALTHY HARVEST")
  const [cliente, setCliente] = useState("N/I")
  const [docs, setDocs] = useState<Checklist>({
    cartaInstruccion: false,
    manifiestoCarga: false,
    packingList: false,
    proforma: false
  })

  const selectedDetails = useMemo(() => pallets.filter(p => selected.includes(p.id)), [pallets, selected])

  function toggleDoc(k: keyof Checklist) { setDocs(prev => ({ ...prev, [k]: !prev[k] })) }
  function toggle(id: number) { setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]) }

  // Alterna selección de los IDs visibles: si todos están seleccionados, los quita; si no, los agrega
  function toggleVisible(ids: number[]) {
    setSelected(prev => {
      const set = new Set(prev)
      const allVisibleSelected = ids.length > 0 && ids.every(id => set.has(id))
      if (allVisibleSelected) { ids.forEach(id => set.delete(id)) } else { ids.forEach(id => set.add(id)) }
      return Array.from(set)
    })
  }

  function clearSelection() { setSelected([]) }

  async function cargarPallets() {
    try {
      const r = await fetch("/api/salidas/pallets")
      const j = await r.json()
      setPallets(Array.isArray(j) ? j : (j.pallets || []))
    } catch {
      setPallets([])
    }
  }

  useEffect(() => { cargarPallets() }, [])

  async function confirmarSalida() {
    if (selected.length === 0) return
    const destino = [cliente, empresa].filter(Boolean).join(" / ")
    const payload = { pallet_ids: selected, usuario_id: null, destino, temperatura_salida: null, observaciones: null }

    try {
      const r = await fetch("/api/salidas/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      const j = await r.json()
      if (!j.ok) { alert("No se pudo confirmar la salida. Verifica la selección."); return }
      alert(`Salida registrada. Código de carga: ${j.codigo}`)
      router.push("/panel/empleado")
    } catch {
      alert("Error de red al confirmar la salida.")
    }
  }

  function removeFromSelection(id: number) { setSelected(prev => prev.filter(x => x !== id)) }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-925 to-neutral-950 text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <HeaderSalidas onBack={() => router.push("/panel/empleado")} total={pallets.length} step={step} />

        {step === 1 && (
          <section className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 sm:p-6 shadow-xl">
              <ListaPallets
                pallets={pallets}
                selectedIds={selected}
                onToggle={toggle}
                search={search}
                setSearch={setSearch}
                onToggleVisible={toggleVisible}
                onClear={clearSelection}
              />

              <div className="md:hidden fixed left-0 right-0 bottom-0 bg-neutral-950/85 backdrop-blur border-t border-neutral-800/70 pb-[env(safe-area-inset-bottom)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm sm:text-base text-neutral-300">{selected.length} seleccionado(s)</div>
                    <div className="flex gap-2">
                      <button
                        onClick={clearSelection}
                        disabled={selected.length === 0}
                        className={`px-4 py-2 rounded-xl border text-sm sm:text-base ${
                          selected.length === 0
                            ? "border-neutral-800 text-neutral-600 cursor-not-allowed"
                            : "border-neutral-700 text-neutral-100 hover:bg-neutral-800"
                        }`}
                      >
                        Limpiar
                      </button>
                      <button
                        onClick={() => setStep(2)}
                        disabled={selected.length === 0}
                        className={`px-5 py-2 rounded-xl text-sm sm:text-base ${
                          selected.length === 0
                            ? "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                            : "bg-white text-black font-semibold hover:bg-neutral-200 shadow"
                        }`}
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-20 md:h-0"></div>
            </div>

            <aside className="hidden lg:block lg:col-span-5">
              <div className="sticky top-4 space-y-4">
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-neutral-100">Resumen</h3>
                    <span className="text-sm text-neutral-400">{selected.length} seleccionado(s)</span>
                  </div>
                  <div className="mt-3 max-h-[360px] overflow-auto pr-1">
                    {selectedDetails.length === 0 ? (
                      <div className="text-neutral-500 text-sm">Selecciona pallets para verlos aquí.</div>
                    ) : (
                      <ul className="space-y-2">
                        {selectedDetails.map(p => (
                          <li key={p.id} className="flex items-center justify-between px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950">
                            <div>
                              <div className="text-sm text-neutral-100">{p.empresa}</div>
                              <div className="text-xs text-neutral-400 font-mono">{p.numero}</div>
                            </div>
                            <button
                              onClick={() => removeFromSelection(p.id)}
                              className="px-2 py-1 rounded-lg border border-neutral-800 text-neutral-300 hover:bg-neutral-800 text-xs"
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <button
                      onClick={clearSelection}
                      disabled={selected.length === 0}
                      className={`px-4 py-2 rounded-xl border text-sm ${
                        selected.length === 0
                          ? "border-neutral-800 text-neutral-600 cursor-not-allowed"
                          : "border-neutral-700 text-neutral-100 hover:bg-neutral-800"
                      }`}
                    >
                      Limpiar
                    </button>
                    <button
                      onClick={() => setStep(2)}
                      disabled={selected.length === 0}
                      className={`px-5 py-2 rounded-xl text-sm ${
                        selected.length === 0
                          ? "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                          : "bg-white text-black font-semibold hover:bg-neutral-200 shadow"
                      }`}
                    >
                      Confirmar selección →
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5">
                  <h4 className="text-sm font-semibold text-neutral-200">Sugerencias</h4>
                  <p className="text-sm text-neutral-400 mt-2">
                    Usa “Seleccionar visibles” para escoger rápidamente lo filtrado.
                    Mantén la selección mientras cambias el texto del buscador.
                  </p>
                </div>
              </div>
            </aside>
          </section>
        )}

        {step === 2 && (
          <section className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-100">Confirmar salida</h2>
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl border border-neutral-700 text-neutral-100 hover:bg-neutral-800"
              >
                ← Corregir
              </button>
            </div>

            <ConfirmacionSalida
              pallets={selectedDetails}
              empresa={empresa}
              setEmpresa={setEmpresa}
              cliente={cliente}
              setCliente={setCliente}
              documentos={docs}
              toggleDoc={toggleDoc}
              onBack={() => setStep(1)}
              onConfirm={confirmarSalida}
            />
          </section>
        )}
      </main>

      <footer className="w-full text-center py-5 text-sm text-neutral-500">
        © {new Date().getFullYear()} El Molinito – Logística
      </footer>
    </div>
  )
}

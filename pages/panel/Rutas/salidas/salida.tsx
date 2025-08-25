import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import HeaderSalidas from "./HeaderSalidas"
import ListaPallets, { Pallet } from "./ListaPallets"
import ConfirmacionSalida from "./ConfirmacionSalida"

export default function SalidasPanel() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [pallets, setPallets] = useState<Pallet[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [search, setSearch] = useState("")
  const [empresa, setEmpresa] = useState("HEALTHY HARVEST")
  const [cliente, setCliente] = useState("N/I")
  const [docs, setDocs] = useState({
    cartaInstruccion: false,
    manifiestoCarga: false,
    packingList: false,
    proforma: false
  })

  const selectedDetails = useMemo(
    () => pallets.filter(p => selected.includes(p.id)),
    [pallets, selected]
  )

  function toggleDoc(k: keyof typeof docs) {
    setDocs(prev => ({ ...prev, [k]: !prev[k] }))
  }

  function toggle(id: number) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function selectVisible(ids: number[]) {
    setSelected(prev => {
      if (ids.length === 0) {
        // deseleccionar visibles
        return prev.filter(id => !selectedDetails.map(p=>p.id).includes(id) && !ids.includes(id))
      }
      const set = new Set(prev)
      ids.forEach(id => set.add(id))
      return Array.from(set)
    })
  }

  function clearSelection() {
    setSelected([])
  }

  async function cargarPallets() {
    const r = await fetch("/api/salidas/pallets")
    const j = await r.json()
    setPallets(j.pallets || [])
  }

  useEffect(() => { cargarPallets() }, [])

  async function confirmarSalida() {
    const destino = [cliente, empresa].filter(Boolean).join(" / ")
    const payload = {
      pallet_ids: selected,
      usuario_id: null,
      destino,
      temperatura_salida: null,
      observaciones: null
    }
    const r = await fetch("/api/salidas/confirmar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    const j = await r.json()
    if (!j.ok) {
      alert("No se pudo confirmar la salida. Verifica la selección.")
      return
    }
    alert(`Salida registrada. Código de carga: ${j.codigo}`)
    router.push("/panel/empleado")
  }

  function removeFromSelection(id: number) {
    setSelected(prev => prev.filter(x => x !== id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-925 to-neutral-950 text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <HeaderSalidas onBack={() => router.push("/panel/empleado")} total={pallets.length} step={step} />

        {step === 1 && (
          <section className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Lista */}
            <div className="lg:col-span-7 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 sm:p-6 shadow-xl">
              <ListaPallets
                pallets={pallets}
                selectedIds={selected}
                onToggle={toggle}
                search={search}
                setSearch={setSearch}
                onSelectVisible={selectVisible}
                onClear={clearSelection}
              />

              {/* Barra inferior solo en móvil */}
              <div className="md:hidden fixed left-0 right-0 bottom-0 bg-neutral-950/85 backdrop-blur border-t border-neutral-800/70 pb-[env(safe-area-inset-bottom)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm sm:text-base text-neutral-300">
                      {selected.length} seleccionado(s)
                    </div>
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

              {/* Espaciador para que no tape la barra en móvil */}
              <div className="h-20 md:h-0"></div>
            </div>

            {/* Resumen en vivo (solo tablet/escritorio) */}
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

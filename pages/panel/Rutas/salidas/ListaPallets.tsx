import React, { useMemo } from "react"

export type Pallet = {
  id: number
  empresa: string
  numero: string
}

type Props = {
  pallets: Pallet[]
  selectedIds: number[]
  onToggle: (id: number) => void
  search: string
  setSearch: (v: string) => void
  onSelectVisible: (ids: number[]) => void
  onClear: () => void
}

export default function ListaPallets({
  pallets,
  selectedIds,
  onToggle,
  search,
  setSearch,
  onSelectVisible,
  onClear
}: Props) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return pallets
    return pallets.filter(p =>
      p.numero.toLowerCase().includes(q) || p.empresa.toLowerCase().includes(q)
    )
  }, [pallets, search])

  const visibleIds = filtered.map(p => p.id)
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id))

  return (
    <div className="w-full">
      {/* Controles de lista */}
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
            onClick={() => onSelectVisible(allVisibleSelected ? [] : visibleIds)}
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

      {/* Móvil: tarjetas táctiles */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filtered.map(p => {
          const checked = selectedIds.includes(p.id)
          return (
            <label
              key={p.id}
              className={`rounded-2xl border bg-neutral-900 p-4 flex items-start justify-between active:scale-[0.99] transition ${
                checked ? 'border-white/30' : 'border-neutral-800 hover:border-neutral-700'
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

      {/* Tablet/Escritorio: tabla compacta con marcos limpios */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900/70">
              <tr className="border-b border-neutral-800">
                <th className="p-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={() => onSelectVisible(allVisibleSelected ? [] : visibleIds)}
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
                  <tr
                    key={p.id}
                    className={`border-b border-neutral-850/50 ${i%2===0 ? 'bg-neutral-950/30' : ''} hover:bg-neutral-800/40`}
                  >
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

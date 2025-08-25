import React from "react"

type Props = {
  onBack: () => void
  total: number
  step?: 1 | 2
}

export default function HeaderSalidas({ onBack, total, step = 1 }: Props) {
  return (
    <header className="w-full">
      {/* Barra superior */}
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
            <h1 className="text-lg sm:text-xl font-semibold text-neutral-100 leading-tight">
              Salidas de pallets
            </h1>
            <p className="text-xs text-neutral-400">Logística y despacho</p>
          </div>
        </div>
      </div>

      {/* Breadcrumb + métrica */}
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
            <span className={`inline-block w-2 h-2 rounded-full ${step===1 ? 'bg-white/80':'bg-white/40'}`} />
            <span className={`inline-block w-2 h-2 rounded-full ${step===2 ? 'bg-white/80':'bg-white/40'}`} />
            <span className="text-xs ml-2">{step===1 ? 'Selección' : 'Confirmación'}</span>
          </div>
          <span className="px-3 py-1 rounded-lg border border-neutral-800 bg-neutral-900/70 text-neutral-200 text-sm">
            Disponibles: <strong className="text-neutral-100">{total}</strong>
          </span>
        </div>
      </div>
    </header>
  )
}

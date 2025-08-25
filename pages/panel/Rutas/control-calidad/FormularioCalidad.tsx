import { Motivo, Pedido } from '@/pages/api/control_calidad/types'

interface Props {
  pedido: Pedido
  motivos: Motivo[]
  rechazos: number
  setRechazos: (n: number) => void
  cajasFinales: number
  selectedMotivos: number[]
  toggleMotivo: (id: number) => void
  comentarios: string
  setComentarios: (v: string) => void
  onVolver: () => void
  onSubmit: (e: React.FormEvent) => void
}

export default function FormularioCalidad({
  pedido,
  motivos,
  rechazos,
  setRechazos,
  cajasFinales,
  selectedMotivos,
  toggleMotivo,
  comentarios,
  setComentarios,
  onVolver,
  onSubmit
}: Props) {
  const maxPermitido = pedido.cantidad_cajas || 0

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6">
      <h2 className="text-base sm:text-lg font-semibold text-neutral-100">Registrar control</h2>
      <p className="text-xs text-neutral-400 mt-1">Indica cuántas cajas se rechazan y selecciona uno o varios motivos.</p>

      {/* Totales y rechazos (mobile-first) */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
          <label className="block text-sm text-neutral-300 mb-2">Cajas rechazadas</label>
          <input
            type="number"
            min={0}
            max={maxPermitido}
            value={rechazos}
            onChange={(e) => {
              const v = Math.max(0, Math.min(Number(e.target.value || 0), maxPermitido))
              setRechazos(v)
            }}
            className="w-full px-3 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-100 outline-none focus:ring-2 focus:ring-white/10"
            placeholder="0"
            required
          />
          <p className="mt-2 text-xs text-neutral-500">Máximo {maxPermitido}.</p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">Cajas finales</div>
          <div className="mt-1 text-2xl text-neutral-100">{cajasFinales}</div>
          <p className="mt-2 text-xs text-neutral-500">Se calcula automáticamente.</p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">Recibidas</div>
          <div className="mt-1 text-2xl text-neutral-100">{pedido.cantidad_cajas}</div>
          <p className="mt-2 text-xs text-neutral-500">Según la recepción.</p>
        </div>
      </div>

      {/* Motivos: multi-selección (checkbox chips) */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-neutral-200 mb-2">Motivos de rechazo</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {motivos.map((m) => {
            const activo = selectedMotivos.includes(m.id)
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleMotivo(m.id)}
                className={`px-3 py-2 rounded-xl border text-sm ${
                  activo
                    ? "bg-white text-black border-neutral-200"
                    : "bg-neutral-900 text-neutral-100 border-neutral-800 hover:bg-neutral-800"
                }`}
                aria-pressed={activo}
              >
                {m.nombre}
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          Puedes seleccionar varios. Si hay rechazos, al menos un motivo debe estar seleccionado.
        </p>
      </div>

      {/* Comentarios */}
      <div className="mt-4">
        <label className="block text-sm text-neutral-300 mb-2">Comentarios</label>
        <textarea
          value={comentarios}
          onChange={(e) => setComentarios(e.target.value)}
          rows={3}
          className="w-full px-3 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-100 outline-none focus:ring-2 focus:ring-white/10"
          placeholder="Observaciones generales…"
        />
      </div>

      {/* Acciones (mobile-first) */}
      <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={onVolver}
          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-neutral-700 text-neutral-100 hover:bg-neutral-800"
        >
          ← Volver
        </button>
        <button
          type="submit"
          disabled={rechazos < 0 || rechazos > maxPermitido || (rechazos > 0 && selectedMotivos.length === 0)}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold shadow ${
            rechazos < 0 || rechazos > maxPermitido || (rechazos > 0 && selectedMotivos.length === 0)
              ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
              : "bg-white text-black hover:bg-neutral-200"
          }`}
        >
          Guardar y generar ticket
        </button>
      </div>

      <div className="mt-3 text-center text-[11px] text-neutral-500">
        El backend recibirá los motivos seleccionados sin cantidades específicas.
      </div>
    </form>
  )
}

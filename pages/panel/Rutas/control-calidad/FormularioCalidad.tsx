import { Motivo, Pedido } from './types'

interface Props {
  form: {
    rechazos: number
    motivo_rechazo_id: string
    comentarios: string
    cajas_finales: number
  }
  setForm: React.Dispatch<React.SetStateAction<Props["form"]>>
  motivos: Motivo[]
  pedido: Pedido
  onVolver: () => void
  onSubmit: (e: React.FormEvent) => void
}

export default function FormularioCalidad({ form, setForm, motivos, pedido, onVolver, onSubmit }: Props) {
  return (
    <form onSubmit={onSubmit} className="bg-[#2c2f33] border border-[#27ae60] rounded-3xl p-8 sm:p-10 shadow-md max-w-5xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-semibold text-[#27ae60] mb-8 text-center">Confirmar Control de Calidad</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block font-bold mb-3 text-[#27ae60] text-lg">Cajas rechazadas</label>
          <input
            type="number"
            min="0"
            max={pedido.cantidad_cajas}
            value={form.rechazos}
            onChange={(e) => {
              const rechazos = parseInt(e.target.value) || 0
              setForm({ ...form, rechazos, cajas_finales: pedido.cantidad_cajas - rechazos })
            }}
            className="w-full p-4 rounded-2xl bg-[#f4f7fa] border border-[#27ae60] text-gray-900 text-lg focus:ring-[#27ae60]/40"
            required
          />
        </div>

        {form.rechazos > 0 && (
          <div>
            <label className="block font-bold mb-3 text-[#e74c3c] text-lg">Motivo de rechazo</label>
            <select
              value={form.motivo_rechazo_id}
              onChange={(e) => setForm({ ...form, motivo_rechazo_id: e.target.value })}
              className="w-full p-4 rounded-2xl bg-[#fff4f4] border border-[#e74c3c] text-gray-900 text-lg focus:ring-[#e74c3c]/40"
              required
            >
              <option value="">Seleccione un motivo</option>
              {motivos.map(motivo => (
                <option key={motivo.id} value={motivo.id}>{motivo.nombre}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block font-bold mb-3 text-[#27ae60] text-lg">Cajas finales</label>
          <div className="flex items-center gap-3">
            <p className="text-gray-300 text-lg">{form.cajas_finales}</p>
            <button
              type="button"
              onClick={() => {
                const newValue = prompt("Editar cantidad final:", form.cajas_finales.toString())
                if (newValue && !isNaN(parseInt(newValue))) {
                  const nuevasCajas = parseInt(newValue)
                  setForm({
                    ...form,
                    cajas_finales: nuevasCajas,
                    rechazos: pedido.cantidad_cajas - nuevasCajas
                  })
                }
              }}
              className="text-[#27ae60] hover:text-[#3566b2] text-base font-medium flex items-center active:scale-95"
            >
              ✏️ EDITAR
            </button>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block font-bold mb-3 text-[#3566b2] text-lg">Comentarios</label>
          <textarea
            value={form.comentarios}
            onChange={(e) => setForm({ ...form, comentarios: e.target.value })}
            className="w-full p-4 rounded-2xl bg-[#f4f7fa] border border-[#c8d6e5] text-gray-900 text-lg focus:ring-[#3566b2]/30"
            rows={3}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-5">
        <button
          type="button"
          onClick={onVolver}
          className="bg-[#23272a] hover:bg-[#2c2f33] text-white px-8 py-4 rounded-2xl font-medium shadow border border-[#c8d6e5] text-lg active:scale-95 transition"
        >
          Volver
        </button>
        <button
          type="submit"
          className="bg-gradient-to-r from-[#27ae60] to-[#2ecc71] hover:from-[#2ecc71] hover:to-[#27ae60] text-white px-8 py-4 rounded-2xl font-bold shadow-lg text-lg active:scale-95 transition"
        >
          Guardar y generar ticket
        </button>
      </div>

      <div className="mt-10 pt-6 border-t border-[#c8d6e5] text-center">
        <p className="text-base text-gray-400">
          NOTA: Solo puedes cambiar el número de rechazos/cajas finales.
        </p>
      </div>
    </form>
  )
}

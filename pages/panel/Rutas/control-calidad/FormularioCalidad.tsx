import { Motivo, Pedido } from '../../../api/control_calidad/types'

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
  if (!pedido || typeof pedido.cantidad_cajas === 'undefined') {
    return (
      <div className="bg-[#1c1917] border border-orange-300 rounded-2xl p-6 text-center text-orange-400">
        No se encontraron datos del pedido.<br />
        <button
          type="button"
          onClick={onVolver}
          className="mt-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full font-medium shadow hover:shadow-lg transition"
        >
          Volver
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="bg-[#1c1917] border border-orange-300 rounded-2xl p-6 shadow-md hover:shadow-lg transition">
      <h2 className="text-xl font-semibold text-orange-400 mb-6 text-center">Confirmar Control de Calidad</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-orange-300 mb-2">Cajas rechazadas</label>
          <input
            type="number"
            min="0"
            max={pedido.cantidad_cajas}
            value={form.rechazos}
            onChange={(e) => {
              const rechazos = parseInt(e.target.value) || 0
              setForm({ ...form, rechazos, cajas_finales: pedido.cantidad_cajas - rechazos })
            }}
            className="w-full bg-[#242126] border border-orange-300 text-white rounded-lg p-3 focus:border-orange-500"
            required
          />
        </div>

        {form.rechazos > 0 && (
          <div>
            <label className="block text-red-400 mb-2">Motivo de rechazo</label>
            <select
              value={form.motivo_rechazo_id}
              onChange={(e) => setForm({ ...form, motivo_rechazo_id: e.target.value })}
              className="w-full bg-[#242126] border border-red-400 text-white rounded-lg p-3 focus:border-red-500"
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
          <label className="block text-orange-300 mb-2">Cajas finales</label>
          <div className="flex items-center gap-3">
            <p className="text-white">{form.cajas_finales}</p>
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
              className="text-orange-400 hover:text-orange-300 text-sm font-medium"
            >
              ✏️ EDITAR
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-orange-300 mb-2">Comentarios</label>
          <textarea
            value={form.comentarios}
            onChange={(e) => setForm({ ...form, comentarios: e.target.value })}
            className="w-full bg-[#242126] border border-orange-300 text-white rounded-lg p-3 focus:border-orange-500"
            rows={3}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <button
          type="button"
          onClick={onVolver}
          className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-full font-medium shadow hover:shadow-lg transition"
        >
          Volver
        </button>
        <button
          type="submit"
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full font-bold shadow hover:shadow-lg transition"
        >
          Guardar y generar ticket
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-orange-300 text-center text-orange-300 text-sm">
        NOTA: Solo puedes cambiar el número de rechazos/cajas finales.
      </div>
    </form>
  );
}
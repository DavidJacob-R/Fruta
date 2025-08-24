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
  // Función para manejar la selección/deselección de motivos
  const toggleMotivo = (id: string) => {
    // Converti el string actual a array
    const currentIds = form.motivo_rechazo_id ? form.motivo_rechazo_id.split(',').filter(Boolean) : [];
    
    if (currentIds.includes(id)) {
      // Si ya está seleccionado lo quitamos
      const newIds = currentIds.filter(motivoId => motivoId !== id);
      setForm({
        ...form,
        motivo_rechazo_id: newIds.join(',') // Converti el array a string separado por comas
      })
    } else {
      // Si no está seleccionado lo agregamos
      const newIds = [...currentIds, id];
      setForm({
        ...form,
        motivo_rechazo_id: newIds.join(',') // Converti el array a string separado por comas
      })
    }
  }

  // Converti el string de IDs a array
  const selectedIds = form.motivo_rechazo_id ? form.motivo_rechazo_id.split(',').filter(Boolean) : [];

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
          <div className="sm:col-span-2">
            <label className="block font-bold mb-3 text-[#e74c3c] text-lg">Motivos de rechazo</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {motivos.map(motivo => (
                <button
                  key={motivo.id}
                  type="button"
                  onClick={() => toggleMotivo(motivo.id.toString())}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    selectedIds.includes(motivo.id.toString())
                      ? 'bg-[#27ae60] text-white border-[#27ae60]'
                      : 'bg-[#fff4f4] text-gray-900 border-[#e74c3c]'
                  }`}
                >
                  {motivo.nombre}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block font-bold mb-3 text-[#27ae60] text-lg">Cajas finales</label>
          <div className="flex items-center gap-3">
            <p className="text-gray-300 text-lg">{form.cajas_finales}</p>
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
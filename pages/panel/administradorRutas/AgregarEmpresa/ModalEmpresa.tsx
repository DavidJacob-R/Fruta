import React from "react"
import { useUi } from "@/components/ui-context"

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (values: any) => void
  values: any
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  loading: boolean
}

export default function ModalEmpresa({ open, onClose, onSubmit, values, onChange, loading }: Props) {
  const { darkMode } = useUi()
  if (!open) return null

  const cardDay = "bg-white border border-orange-300"
  const cardNight = "bg-[#232323] border border-[#353535]"
  const input = darkMode
    ? "w-full p-3 rounded-xl bg-[#1f1f1f] border border-[#353535] text-white outline-none"
    : "w-full p-3 rounded-xl bg-white border border-orange-200 text-[#1a1a1a] outline-none"
  const btnPri = "bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-xl font-bold"
  const btnClose = darkMode
    ? "absolute top-3 right-3 text-2xl font-bold text-orange-300"
    : "absolute top-3 right-3 text-2xl font-bold text-orange-600"

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className={`w-full max-w-xl rounded-2xl p-6 shadow-xl relative ${darkMode ? cardNight : cardDay}`}>
        <button className={btnClose} onClick={onClose} aria-label="Cerrar">×</button>
        <h2 className={`${darkMode ? "text-orange-200" : "text-orange-700"} text-xl font-bold mb-5`}>Agregar Empresa</h2>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(values)
          }}
        >
          <div>
            <label className={`block mb-1 font-semibold ${darkMode ? "text-orange-200" : "text-orange-700"}`}>Nombre de la empresa *</label>
            <input name="empresa" value={values.empresa} onChange={onChange} placeholder="Ej: Frutas del Sur" className={input} required autoFocus />
          </div>
          <div>
            <label className={`block mb-1 font-semibold ${darkMode ? "text-orange-200" : "text-orange-700"}`}>Telefono</label>
            <input name="telefono" value={values.telefono} onChange={onChange} placeholder="Ej: 5551234567" className={input} type="tel" />
          </div>
          <div>
            <label className={`block mb-1 font-semibold ${darkMode ? "text-orange-200" : "text-orange-700"}`}>Correo electronico</label>
            <input name="email" value={values.email} onChange={onChange} placeholder="correo@empresa.com" className={input} type="email" />
          </div>
          <div>
            <label className={`block mb-1 font-semibold ${darkMode ? "text-orange-200" : "text-orange-700"}`}>Direccion</label>
            <input name="direccion" value={values.direccion} onChange={onChange} placeholder="Calle, colonia, ciudad" className={input} />
          </div>
          <div>
            <label className={`block mb-1 font-semibold ${darkMode ? "text-orange-200" : "text-orange-700"}`}>Tipo de venta</label>
            <select name="tipo_venta" value={values.tipo_venta} onChange={onChange} className={input}>
              <option value="nacional">Nacional</option>
              <option value="exportacion">Exportacion</option>
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className={`${btnPri} ${loading ? "opacity-70 cursor-not-allowed" : ""}`} disabled={loading}>
              {loading ? "Guardando..." : "Agregar empresa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

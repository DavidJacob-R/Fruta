import React from "react"
import { useUi } from "@/components/ui-context"

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (values: any) => void
  values: any
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  nextClave: string
  loading: boolean
}

export default function ModalAgricultor({ open, onClose, onSubmit, values, onChange, nextClave, loading }: Props) {
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
        <h2 className={`${darkMode ? "text-orange-200" : "text-orange-700"} text-xl font-bold mb-5`}>Agregar Agricultor</h2>

        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(values)
          }}
        >
          <div>
            <label className={`block mb-1 font-semibold ${darkMode ? "text-orange-200" : "text-orange-700"}`}>Código único</label>
            <input value={nextClave} disabled className={`${input} opacity-80`} />
          </div>
          <div>
            <label className={`block mb-1 font-semibold ${darkMode ? "text-orange-200" : "text-orange-700"}`}>Nombre *</label>
            <input name="nombre" value={values.nombre} onChange={onChange} className={input} required />
          </div>
          <div>
            <label className={`block mb-1 font-semibold ${darkMode ? "text-orange-200" : "text-orange-700"}`}>Hectáreas</label>
            <input name="hectareas" value={values.hectareas} onChange={onChange} className={input} type="number" step="0.01" />
          </div>
          <div>
            <label className={`block mb-1 font-semibold ${darkMode ? "text-orange-200" : "text-orange-700"}`}>Sectores</label>
            <input name="sectores" value={values.sectores} onChange={onChange} className={input} />
          </div>
          <div>
            <label className={`block mb-1 font-semibold ${darkMode ? "text-orange-200" : "text-orange-700"}`}>RFC</label>
            <input name="rfc" value={values.rfc} onChange={onChange} className={input} maxLength={16} />
          </div>
          <div>
            <label className={`block mb-1 font-semibold ${darkMode ? "text-orange-200" : "text-orange-700"}`}>Ubicación</label>
            <input name="ubicacion" value={values.ubicacion} onChange={onChange} className={input} />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className={`${btnPri} ${loading ? "opacity-70 cursor-not-allowed" : ""}`} disabled={loading}>
              {loading ? "Guardando..." : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

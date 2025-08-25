import React from "react"
import { useUi } from "@/components/ui-context"

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (values: any) => void
  values: { tamanio: string; descripcion: string }
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  loading: boolean
}

export default function ModalEmpaque({ open, onClose, onSubmit, values, onChange, loading }: Props) {
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
      <div className={`w-full max-w-md rounded-2xl p-6 shadow-xl relative ${darkMode ? cardNight : cardDay}`}>
        <button className={btnClose} onClick={onClose} aria-label="Cerrar">×</button>
        <h2 className={`${darkMode ? "text-orange-200" : "text-orange-700"} text-xl font-bold mb-5`}>Agregar Empaque</h2>
        <form
          className="grid grid-cols-1 gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(values)
          }}
        >
          <div>
            <label className={`block mb-1 font-semibold ${darkMode ? "text-orange-200" : "text-orange-700"}`}>Tamaño (oz) *</label>
            <input
              name="tamanio"
              value={values.tamanio}
              onChange={onChange}
              placeholder="Ej: 8"
              className={input}
              required
              autoFocus
              inputMode="numeric"
            />
            <div className={`${darkMode ? "text-white/60" : "text-gray-500"} text-xs mt-1`}>Solo números. Ejemplo: <b>12</b></div>
          </div>
          <div>
            <label className={`block mb-1 font-semibold ${darkMode ? "text-orange-200" : "text-orange-700"}`}>Descripción *</label>
            <input
              name="descripcion"
              value={values.descripcion}
              onChange={onChange}
              placeholder="Ej: Clamshell para berries"
              className={input}
              required
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className={`${btnPri} ${loading ? "opacity-70 cursor-not-allowed" : ""}`} disabled={loading}>
              {loading ? "Guardando..." : "Agregar empaque"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

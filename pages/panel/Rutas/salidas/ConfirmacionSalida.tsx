import React from "react"
import type { Pallet } from "./ListaPallets"

type Checklist = {
  cartaInstruccion: boolean
  manifiestoCarga: boolean
  packingList: boolean
  proforma: boolean
}

type Props = {
  pallets: Pallet[]
  empresa: string
  setEmpresa: (v: string) => void
  cliente: string
  setCliente: (v: string) => void
  documentos: Checklist
  toggleDoc: (k: keyof Checklist) => void
  onBack: () => void
  onConfirm: () => void
}

export default function ConfirmacionSalida({
  pallets,
  empresa,
  setEmpresa,
  cliente,
  setCliente,
  documentos,
  toggleDoc,
  onBack,
  onConfirm
}: Props) {
  return (
    <div className="space-y-6">
      {/* Dos columnas en tablet: Datos + Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-base sm:text-lg font-semibold text-neutral-100 mb-3">Datos de salida</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-neutral-400">Empresa</label>
              <input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100 outline-none focus:ring-2 focus:ring-white/10"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400">Cliente</label>
              <input
                type="text"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100 outline-none focus:ring-2 focus:ring-white/10"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-base sm:text-lg font-semibold text-neutral-100 mb-3">Documentos (checklist)</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { key: "cartaInstruccion", label: "CARTA DE INSTRUCCIÓN" },
              { key: "manifiestoCarga", label: "MANIFIESTO DE CARGA" },
              { key: "packingList", label: "PACKING LIST" },
              { key: "proforma", label: "PROFORMA" }
            ].map(doc => (
              <li key={doc.key} className="px-3 py-2 rounded-xl flex items-center bg-neutral-950 border border-neutral-800">
                <input
                  type="checkbox"
                  checked={documentos[doc.key as keyof Checklist] as unknown as boolean}
                  onChange={() => toggleDoc(doc.key as keyof Checklist)}
                  className="w-5 h-5 rounded border-2 border-neutral-600 bg-neutral-800 mr-3"
                />
                <span className={`text-neutral-100 ${documentos[doc.key as keyof Checklist] ? 'line-through opacity-70' : ''}`}>
                  {doc.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Resumen de pallets seleccionados */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <h2 className="text-base sm:text-lg font-semibold text-neutral-100 mb-3">Pallets seleccionados</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {pallets.map(p => (
            <div key={p.id} className="px-3 py-2 rounded-lg text-center font-mono bg-neutral-950 border border-neutral-800 text-neutral-300">
              {p.numero}
            </div>
          ))}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onBack}
          className="px-5 py-3 rounded-xl border border-neutral-700 text-neutral-100 hover:bg-neutral-800"
        >
          ← Corregir selección
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-neutral-200 transition shadow"
        >
          Confirmar salida →
        </button>
      </div>
    </div>
  )
}

import React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  values: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  nextClave: string;
  loading: boolean;
};

export default function ModalAgricultor({ open, onClose, onSubmit, values, onChange, nextClave, loading }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white dark:bg-[#222] rounded-2xl p-8 w-full max-w-xl shadow-lg relative">
        <button
          className="absolute top-3 right-3 text-2xl font-bold text-orange-500"
          onClick={onClose}
        >×</button>
        <h2 className="text-xl font-bold mb-5 text-orange-600">Agregar Agricultor</h2>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(values);
          }}
        >
          <div>
            <label className="block mb-1 font-semibold">Código único</label>
            <input value={nextClave} disabled className="w-full p-3 rounded-xl border bg-gray-100" />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Nombre *</label>
            <input name="nombre" value={values.nombre} onChange={onChange} className="w-full p-3 rounded-xl border" required />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Hectáreas</label>
            <input name="hectareas" value={values.hectareas} onChange={onChange} className="w-full p-3 rounded-xl border" type="number" step="0.01" />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Sectores</label>
            <input name="sectores" value={values.sectores} onChange={onChange} className="w-full p-3 rounded-xl border" />
          </div>
          <div>
            <label className="block mb-1 font-semibold">RFC</label>
            <input name="rfc" value={values.rfc} onChange={onChange} className="w-full p-3 rounded-xl border" maxLength={16} />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Ubicación</label>
            <input name="ubicacion" value={values.ubicacion} onChange={onChange} className="w-full p-3 rounded-xl border" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-bold"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

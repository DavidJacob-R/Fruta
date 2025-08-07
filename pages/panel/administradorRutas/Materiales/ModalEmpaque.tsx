import React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  values: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
};

export default function ModalEmpaque({ open, onClose, onSubmit, values, onChange, loading }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white dark:bg-[#232323] rounded-2xl p-8 w-full max-w-md shadow-lg relative border border-orange-300">
        <button
          className="absolute top-3 right-3 text-2xl font-bold text-orange-500"
          onClick={onClose}
        >×</button>
        <h2 className="text-xl font-bold mb-5 text-orange-600">Agregar Empaque</h2>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(values);
          }}
        >
          <div>
            <label className="block mb-1 font-semibold">Tamaño *</label>
            <input
              name="tamanio"
              value={values.tamanio}
              onChange={onChange}
              placeholder="Ej: 8 oz"
              className="w-full p-3 rounded-xl border"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Descripción *</label>
            <input
              name="descripcion"
              value={values.descripcion}
              onChange={onChange}
              placeholder="Ej: Clamshell pequeño para berries"
              className="w-full p-3 rounded-xl border"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-bold"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Agregar empaque"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  values: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  loading: boolean;
};

export default function ModalEmpresa({ open, onClose, onSubmit, values, onChange, loading }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white dark:bg-[#232323] rounded-2xl p-8 w-full max-w-xl shadow-lg relative border border-orange-300">
        <button
          className="absolute top-3 right-3 text-2xl font-bold text-orange-500"
          onClick={onClose}
        >×</button>
        <h2 className="text-xl font-bold mb-5 text-orange-600">Agregar Empresa</h2>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(values);
          }}
        >
          <div>
            <label className="block mb-1 font-semibold">Nombre de la empresa *</label>
            <input
              name="empresa"
              value={values.empresa}
              onChange={onChange}
              placeholder="Ej: Frutas del Sur"
              className="w-full p-3 rounded-xl border"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Teléfono</label>
            <input
              name="telefono"
              value={values.telefono}
              onChange={onChange}
              placeholder="Ej: 5551234567"
              className="w-full p-3 rounded-xl border"
              type="tel"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Correo electrónico</label>
            <input
              name="email"
              value={values.email}
              onChange={onChange}
              placeholder="Ej: contacto@empresa.com"
              className="w-full p-3 rounded-xl border"
              type="email"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Dirección</label>
            <input
              name="direccion"
              value={values.direccion}
              onChange={onChange}
              placeholder="Ej: Calle, colonia, ciudad"
              className="w-full p-3 rounded-xl border"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Tipo de venta</label>
            <select
              name="tipo_venta"
              value={values.tipo_venta}
              onChange={onChange}
              className="w-full p-3 rounded-xl border"
            >
              <option value="nacional">Nacional</option>
              <option value="exportacion">Exportación</option>
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-bold"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Agregar empresa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

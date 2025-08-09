import { useState, useEffect } from "react";
import AgricultoresPanel from "./AgricultoresPanel";
import ModalEmpresa from "./ModalEmpresa";

type Empresa = {
  id: number,
  empresa: string,
  telefono?: string,
  email?: string,
  direccion?: string,
  tipo_venta: string,
};

export default function EmpresasPanel() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<Empresa | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [empresaForm, setEmpresaForm] = useState({
    empresa: "",
    telefono: "",
    email: "",
    direccion: "",
    tipo_venta: "nacional",
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const cargarEmpresas = () => {
    setLoading(true);
    fetch("/api/empresas/listar")
      .then((r) => r.json())
      .then((data) => setEmpresas(data.empresas || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarEmpresas();
  }, []);

  const handleChangeEmpresa = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEmpresaForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleAgregarEmpresa = async () => {
    setLoading(true);
    await fetch("/api/empresas/agregar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(empresaForm),
    })
      .then((r) => r.json())
      .then((res) => {
        setMensaje(res.success ? "Empresa agregada correctamente." : res.message);
        setEmpresaForm({
          empresa: "",
          telefono: "",
          email: "",
          direccion: "",
          tipo_venta: "nacional",
        });
        cargarEmpresas();
        setModalOpen(false);
        setTimeout(() => setMensaje(''), 2500);
      })
      .finally(() => setLoading(false));
  };

  if (empresaSeleccionada) {
    return (
      <AgricultoresPanel
        empresaId={empresaSeleccionada.id}
        empresaNombre={empresaSeleccionada.empresa}
        onClose={() => setEmpresaSeleccionada(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-orange-600">Empresas</h1>
        <button
          className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-5 rounded-xl"
          onClick={() => setModalOpen(true)}
        >
          + Agregar empresa
        </button>
      </div>
      {mensaje && (
        <div className="mb-3 font-semibold text-orange-600">{mensaje}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center py-8 text-orange-400">Cargando...</div>
        ) : empresas.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-gray-400">No hay empresas registradas.</div>
        ) : (
          empresas.map((emp) => (
            <div
              key={emp.id}
              className="bg-white dark:bg-[#232323] rounded-2xl p-6 shadow flex flex-col gap-2 border hover:ring-2 hover:ring-orange-300 transition cursor-pointer"
              onClick={() => setEmpresaSeleccionada(emp)}
            >
              <div className="font-bold text-lg">{emp.empresa}</div>
              <div className="text-sm text-gray-500">
                Tel: {emp.telefono || <span className="text-gray-300">-</span>}
              </div>
              <div className="text-sm text-gray-500">
                Email: {emp.email || <span className="text-gray-300">-</span>}
              </div>
              <div className="text-xs mt-2">
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-bold">
                  {emp.tipo_venta === "nacional" ? "Nacional" : "Exportación"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      <ModalEmpresa
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAgregarEmpresa}
        values={empresaForm}
        onChange={handleChangeEmpresa}
        loading={loading}
      />
    </div>
  );
}

import { useState, useEffect } from "react";
import ModalAgricultor from "./ModalAgricultor";

type Agricultor = {
  id: number;
  clave: string;
  nombre: string;
  hectareas: string;
  sectores: string;
  rfc: string;
  ubicacion: string;
  empresa_id: number;
};

type Props = {
  empresaId: number;
  empresaNombre: string;
  onClose: () => void;
};

export default function AgricultoresPanel({ empresaId, empresaNombre, onClose }: Props) {
  const [agricultores, setAgricultores] = useState<Agricultor[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [agricultorForm, setAgricultorForm] = useState({
    nombre: "",
    hectareas: "",
    sectores: "",
    rfc: "",
    ubicacion: "",
  });
  const [nextClave, setNextClave] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const cargarAgricultores = () => {
    fetch(`/api/agricultores_empresa/listar?empresa_id=${empresaId}`)
      .then(r => r.json())
      .then(data => setAgricultores(data.agricultores || []));
  };
  const cargarClave = () => {
    fetch("/api/agricultores_empresa/siguiente_clave")
      .then(r => r.json())
      .then(data => setNextClave(data.clave));
  };

  useEffect(() => {
    cargarAgricultores();
    cargarClave();
  }, [empresaId]);

  const handleOpenModal = () => {
    setModalOpen(true);
    setAgricultorForm({
      nombre: "",
      hectareas: "",
      sectores: "",
      rfc: "",
      ubicacion: "",
    });
    cargarClave();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgricultorForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleAgregarAgricultor = async () => {
    setLoading(true);
    await fetch("/api/agricultores_empresa/agregar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...agricultorForm,
        empresa_id: empresaId,
      }),
    })
      .then(r => r.json())
      .then(res => {
        setMensaje(res.success ? "Agricultor agregado correctamente." : res.message);
        setLoading(false);
        if (res.success) {
          setModalOpen(false);
          cargarAgricultores();
        }
        setTimeout(() => setMensaje(""), 2500);
      });
  };

  return (
    <div className="bg-white dark:bg-[#242424] rounded-2xl shadow p-6 mt-4">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-orange-600">
          Agricultores de {empresaNombre}
        </h2>
        <button className="text-sm underline text-orange-600" onClick={onClose}>← Cambiar empresa</button>
      </div>

      <button
        className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-5 rounded-xl mb-5"
        onClick={handleOpenModal}
      >
        + Agregar agricultor
      </button>

      {mensaje && (
        <div className="mb-3 font-semibold text-orange-600">{mensaje}</div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-[#222] border rounded-xl">
          <thead>
            <tr>
              <th className="px-4 py-2">Código</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Hectáreas</th>
              <th className="px-4 py-2">Sectores</th>
              <th className="px-4 py-2">RFC</th>
              <th className="px-4 py-2">Ubicación</th>
            </tr>
          </thead>
          <tbody>
            {agricultores.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-400">No hay agricultores registrados.</td>
              </tr>
            ) : (
              agricultores.map((a) => (
                <tr key={a.id} className="hover:bg-orange-50 dark:hover:bg-orange-900/30">
                  <td className="px-4 py-2 font-bold">{a.clave}</td>
                  <td className="px-4 py-2">{a.nombre}</td>
                  <td className="px-4 py-2">{a.hectareas}</td>
                  <td className="px-4 py-2">{a.sectores}</td>
                  <td className="px-4 py-2">{a.rfc}</td>
                  <td className="px-4 py-2">{a.ubicacion}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ModalAgricultor
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAgregarAgricultor}
        values={agricultorForm}
        onChange={handleChange}
        nextClave={nextClave}
        loading={loading}
      />
    </div>
  );
}

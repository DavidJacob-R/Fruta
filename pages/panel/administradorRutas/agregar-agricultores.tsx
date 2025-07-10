import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const ACCENT_COLOR = "orange-500"; // Cambia este tono según el branding (#ff6600 es naranja fuerte, tailwind: orange-500 u orange-600)

export default function AgricultoresAdmin() {
  const router = useRouter();
  const [agricultores, setAgricultores] = useState<any[]>([]);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    empresa: "",
    telefono: "",
    email: "",
    direccion: "",
    tipo_venta: "nacional",
  });
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const cargarAgricultores = () => {
    setLoading(true);
    fetch("/api/agricultores/listar")
      .then((r) => r.json())
      .then((data) => setAgricultores(data.agricultores || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarAgricultores();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleAgregar = async () => {
    if (!form.nombre.trim()) return;
    setLoading(true);
    await fetch("/api/agricultores/agregar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((r) => r.json())
      .then((res) => {
        setMensaje(
          res.success ? "Agricultor agregado correctamente." : res.message
        );
        setForm({
          nombre: "",
          apellido: "",
          empresa: "",
          telefono: "",
          email: "",
          direccion: "",
          tipo_venta: "nacional",
        });
        cargarAgricultores();
      })
      .finally(() => setLoading(false));
  };

  const handleEliminar = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este agricultor?")) return;
    setLoading(true);
    await fetch("/api/agricultores/eliminar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then((r) => r.json())
      .then((res) => {
        setMensaje(
          res.success ? "Agricultor eliminado correctamente." : res.message
        );
        cargarAgricultores();
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      {/* Header */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row md:justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">
            <span className="text-orange-500">Gestión de Agricultores</span>
          </h1>
          <p className="text-gray-500 text-base">
            Administra los agricultores registrados en el sistema.
          </p>
        </div>
        <button
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-xl shadow transition"
          onClick={() => router.push("/panel/administrador")}
        >
          Menú principal
        </button>
      </div>

      {/* Formulario */}
      <form
        className="w-full max-w-4xl bg-white rounded-2xl p-6 border border-orange-200 mb-8 shadow-xl flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleAgregar();
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Nombre *</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej: Ana"
              className="w-full p-3 rounded-xl bg-gray-50 border border-orange-300 focus:ring-2 focus:ring-orange-400 text-gray-900"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Apellido</label>
            <input
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              placeholder="Ej: Martínez"
              className="w-full p-3 rounded-xl bg-gray-50 border border-orange-300 focus:ring-2 focus:ring-orange-400 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Empresa</label>
            <input
              name="empresa"
              value={form.empresa}
              onChange={handleChange}
              placeholder="Ej: AgroCampos"
              className="w-full p-3 rounded-xl bg-gray-50 border border-orange-300 focus:ring-2 focus:ring-orange-400 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Teléfono</label>
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Ej: 5551234567"
              className="w-full p-3 rounded-xl bg-gray-50 border border-orange-300 focus:ring-2 focus:ring-orange-400 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Ej: ana@correo.com"
              className="w-full p-3 rounded-xl bg-gray-50 border border-orange-300 focus:ring-2 focus:ring-orange-400 text-gray-900"
              type="email"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Dirección</label>
            <input
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              placeholder="Ej: Calle, colonia, ciudad"
              className="w-full p-3 rounded-xl bg-gray-50 border border-orange-300 focus:ring-2 focus:ring-orange-400 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Tipo de venta</label>
            <select
              name="tipo_venta"
              value={form.tipo_venta}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-gray-50 border border-orange-300 focus:ring-2 focus:ring-orange-400 text-gray-900"
            >
              <option value="nacional">Nacional</option>
              <option value="exportacion">Exportación</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className={`w-full bg-orange-500 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow transition mt-1 ${
                loading ? "opacity-60 pointer-events-none" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Agregar agricultor"}
            </button>
          </div>
        </div>
        {mensaje && (
          <div className="mt-2 text-orange-600 font-semibold text-lg">{mensaje}</div>
        )}
      </form>

      {/* Lista de agricultores */}
      <div className="w-full max-w-4xl mt-10">
        <h2 className="text-xl font-bold text-orange-600 mb-4">Agricultores registrados</h2>
        {loading ? (
          <div className="text-gray-400 py-6 text-center">Cargando...</div>
        ) : agricultores.length === 0 ? (
          <div className="text-gray-400 py-6 text-center">No hay agricultores registrados.</div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {agricultores.map((ag) => (
              <div
                key={ag.id}
                className="bg-white border border-orange-200 shadow rounded-2xl p-5 flex flex-col gap-2 hover:shadow-xl transition"
              >
                <div className="flex flex-col gap-1">
                  <div className="text-lg font-bold text-gray-800">
                    {ag.nombre} {ag.apellido}
                  </div>
                  {ag.empresa && (
                    <div className="text-gray-600 text-sm">Empresa: {ag.empresa}</div>
                  )}
                  <div className="text-gray-600 text-sm">
                    <span className="font-medium">Tel:</span>{" "}
                    {ag.telefono || <span className="text-gray-300">-</span>}
                  </div>
                  <div className="text-gray-600 text-sm">
                    <span className="font-medium">Email:</span>{" "}
                    {ag.email || <span className="text-gray-300">-</span>}
                  </div>
                  <div className="text-gray-600 text-sm">
                    <span className="font-medium">Dirección:</span>{" "}
                    {ag.direccion || <span className="text-gray-300">-</span>}
                  </div>
                  <div className="mt-1">
                    <span
                      className={`inline-block text-xs font-bold rounded-full px-3 py-1 ${
                        ag.tipo_venta === "nacional"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-emerald-100 text-emerald-900"
                      }`}
                    >
                      {ag.tipo_venta === "nacional" ? "Nacional" : "Exportación"}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    className="bg-red-600 hover:bg-red-800 text-white px-4 py-2 rounded-xl font-bold transition shadow"
                    onClick={() => handleEliminar(ag.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

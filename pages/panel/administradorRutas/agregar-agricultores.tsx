import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FiSun, FiMoon } from "react-icons/fi";

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
  const [darkMode, setDarkMode] = useState(true); 

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

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

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

  const bgMain = darkMode
    ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
    : "bg-gradient-to-br from-white via-orange-50 to-slate-100";
  const textAccent = darkMode ? "text-orange-300" : "text-orange-700";
  const cardBg = darkMode
    ? "bg-gray-900 border-gray-700"
    : "bg-white border-orange-200";
  const cardShadow = "shadow-xl";
  const formInput =
    darkMode
      ? "bg-gray-900 border-gray-700 text-orange-100 focus:ring-orange-300"
      : "bg-white border-orange-300 text-orange-900 focus:ring-orange-200";
  const labelColor = darkMode ? "text-orange-200" : "text-orange-700";

  return (
    <div className={`min-h-screen ${bgMain} flex flex-col items-center py-8 transition-colors`}>
      {/* Header */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row md:justify-between items-center mb-6 gap-4">
        <div>
          <h1 className={`text-3xl font-extrabold tracking-tight mb-1 ${textAccent}`}>
            Gestión de Agricultores
          </h1>
          <p className={`text-base ${darkMode ? "text-orange-100/70" : "text-gray-500"}`}>
            Administra los agricultores registrados en el sistema.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className={`rounded-xl px-5 py-2 font-bold transition
            ${darkMode
              ? "bg-orange-900 border border-orange-700 text-orange-100 hover:bg-orange-800"
              : "bg-white border border-orange-200 text-orange-700 hover:bg-orange-100"}`}
            onClick={() => router.push("/panel/administrador")}>
            Menú principal
          </button>
          <button
            className={`flex items-center gap-2 rounded-xl px-5 py-2 font-bold transition border
            ${darkMode
              ? "bg-gray-900 border-gray-700 text-orange-100 hover:bg-gray-800"
              : "bg-white border-orange-200 text-orange-700 hover:bg-gray-100"}`}
            onClick={() => setDarkMode((d) => !d)}>
            {darkMode ? <FiSun className="text-orange-300" /> : <FiMoon className="text-orange-600" />}
            {darkMode ? "Día" : "Noche"}
          </button>
        </div>
      </div>

      {/* Formulario */}
      <form
        className={`w-full max-w-4xl ${cardBg} border rounded-2xl p-6 mb-8 ${cardShadow} flex flex-col gap-4 transition`}
        onSubmit={(e) => {
          e.preventDefault();
          handleAgregar();
        }} >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className={`block mb-1 font-medium ${labelColor}`}>Nombre *</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej: Ana"
              className={`w-full p-3 rounded-xl border focus:ring-2 ${formInput}`}
              required
              autoFocus/>
          </div>
          <div>
            <label className={`block mb-1 font-medium ${labelColor}`}>Apellido</label>
            <input
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              placeholder="Ej: Martínez"
              className={`w-full p-3 rounded-xl border focus:ring-2 ${formInput}`}/>
          </div>
          <div>
            <label className={`block mb-1 font-medium ${labelColor}`}>Empresa</label>
            <input
              name="empresa"
              value={form.empresa}
              onChange={handleChange}
              placeholder="Ej: AgroCampos"
              className={`w-full p-3 rounded-xl border focus:ring-2 ${formInput}`}/>
          </div>
          <div>
            <label className={`block mb-1 font-medium ${labelColor}`}>Teléfono</label>
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Ej: 5551234567"
              className={`w-full p-3 rounded-xl border focus:ring-2 ${formInput}`} />
          </div>
          <div>
            <label className={`block mb-1 font-medium ${labelColor}`}>Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Ej: ana@correo.com"
              className={`w-full p-3 rounded-xl border focus:ring-2 ${formInput}`}
              type="email" />
          </div>
          <div>
            <label className={`block mb-1 font-medium ${labelColor}`}>Dirección</label>
            <input
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              placeholder="Ej: Calle, colonia, ciudad"
              className={`w-full p-3 rounded-xl border focus:ring-2 ${formInput}`} />
          </div>
          <div>
            <label className={`block mb-1 font-medium ${labelColor}`}>Tipo de venta</label>
            <select
              name="tipo_venta"
              value={form.tipo_venta}
              onChange={handleChange}
              className={`w-full p-3 rounded-xl border focus:ring-2 ${formInput}`}>
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
              disabled={loading}>
              {loading ? "Guardando..." : "Agregar agricultor"}
            </button>
          </div>
        </div>
        {mensaje && (
          <div className={`mt-2 font-semibold text-lg ${darkMode ? "text-orange-200" : "text-orange-600"}`}>{mensaje}</div>
        )}
      </form>

      {/* Lista de agricultores */}
      <div className="w-full max-w-4xl mt-10">
        <h2 className={`text-xl font-bold mb-4 ${textAccent}`}>Agricultores registrados</h2>
        {loading ? (
          <div className={`${darkMode ? "text-orange-200" : "text-gray-400"} py-6 text-center`}>Cargando...</div>
        ) : agricultores.length === 0 ? (
          <div className={`${darkMode ? "text-orange-200" : "text-gray-400"} py-6 text-center`}>No hay agricultores registrados.</div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {agricultores.map((ag) => (
              <div
                key={ag.id}
                className={`rounded-2xl p-5 flex flex-col gap-2 hover:shadow-2xl transition border ${cardBg}`}>
                <div className="flex flex-col gap-1">
                  <div className={`text-lg font-bold ${darkMode ? "text-orange-100" : "text-gray-800"}`}>
                    {ag.nombre} {ag.apellido}
                  </div>
                  {ag.empresa && (
                    <div className={`text-sm ${darkMode ? "text-orange-100/80" : "text-gray-600"}`}>Empresa: {ag.empresa}</div>
                  )}
                  <div className={`text-sm ${darkMode ? "text-orange-100/80" : "text-gray-600"}`}>
                    <span className="font-medium">Tel:</span>{" "}
                    {ag.telefono || <span className="text-gray-300">-</span>}
                  </div>
                  <div className={`text-sm ${darkMode ? "text-orange-100/80" : "text-gray-600"}`}>
                    <span className="font-medium">Email:</span>{" "}
                    {ag.email || <span className="text-gray-300">-</span>}
                  </div>
                  <div className={`text-sm ${darkMode ? "text-orange-100/80" : "text-gray-600"}`}>
                    <span className="font-medium">Dirección:</span>{" "}
                    {ag.direccion || <span className="text-gray-300">-</span>}
                  </div>
                  <div className="mt-1">
                    <span
                      className={`inline-block text-xs font-bold rounded-full px-3 py-1 ${
                        ag.tipo_venta === "nacional"
                          ? darkMode
                            ? "bg-orange-800 text-orange-200"
                            : "bg-orange-100 text-orange-800"
                          : darkMode
                            ? "bg-emerald-900 text-emerald-200"
                            : "bg-emerald-100 text-emerald-900"
                      }`}>
                      {ag.tipo_venta === "nacional" ? "Nacional" : "Exportación"}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    className={`bg-red-600 hover:bg-red-800 text-white px-4 py-2 rounded-xl font-bold transition shadow`}
                    onClick={() => handleEliminar(ag.id)}>
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

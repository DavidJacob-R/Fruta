import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FiSun, FiMoon } from "react-icons/fi";

type Empaque = {
  id: number,
  tamanio: string,
  descripcion: string,
};

export default function AdminEmpaques() {
  const router = useRouter();
  const [empaques, setEmpaques] = useState<Empaque[]>([]);
  const [form, setForm] = useState({ tamanio: "", descripcion: "" });
  const [mensajeAgregar, setMensajeAgregar] = useState("");
  const [mensajeEliminar, setMensajeEliminar] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Noche por default

  const cargarEmpaques = () => {
    setLoading(true);
    fetch("/api/empaques/listar")
      .then((r) => r.json())
      .then((data) => setEmpaques(data.empaques || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarEmpaques();
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleAgregar = async () => {
    if (!form.tamanio.trim() || !form.descripcion.trim()) return;
    setLoading(true);
    await fetch("/api/empaques/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((r) => r.json())
      .then((res) => {
        setMensajeAgregar(
          res.success ? "Empaque agregado correctamente." : res.message
        );
        setMensajeEliminar("");
        setForm({ tamanio: "", descripcion: "" });
        cargarEmpaques();
        setTimeout(() => setMensajeAgregar(""), 2500);
      })
      .finally(() => setLoading(false));
  };

  const handleEliminar = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este empaque?")) return;
    setLoading(true);
    await fetch("/api/empaques/eliminar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then((r) => r.json())
      .then((res) => {
        setMensajeEliminar(
          res.success
            ? "Empaque eliminado correctamente."
            : res.message || "No se pudo eliminar el empaque."
        );
        setMensajeAgregar("");
        cargarEmpaques();
        setTimeout(() => setMensajeEliminar(""), 3500);
      })
      .finally(() => setLoading(false));
  };

  // Colores igual a tu ejemplo
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
      <div className="w-full max-w-2xl flex flex-col md:flex-row md:justify-between items-center mb-6 gap-4">
        <div>
          <h1 className={`text-3xl font-extrabold tracking-tight mb-1 ${textAccent}`}>
            Gestión de Empaques
          </h1>
          <p className={`text-base ${darkMode ? "text-orange-100/70" : "text-gray-500"}`}>
            Administra los empaques registrados en el sistema.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className={`rounded-xl px-5 py-2 font-bold transition
            ${darkMode
              ? "bg-orange-900 border border-orange-700 text-orange-100 hover:bg-orange-800"
              : "bg-white border border-orange-200 text-orange-700 hover:bg-orange-100"}`}
            onClick={() => router.push("/panel/administrador")} >
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
        className={`w-full max-w-2xl ${cardBg} border rounded-2xl p-6 mb-8 ${cardShadow} flex flex-col gap-4 transition`}
        onSubmit={(e) => {
          e.preventDefault();
          handleAgregar();
        }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block mb-1 font-medium ${labelColor}`}>Tamaño *</label>
            <input
              name="tamanio"
              value={form.tamanio}
              onChange={handleChange}
              placeholder="Ej: 8 oz"
              className={`w-full p-3 rounded-xl border focus:ring-2 ${formInput}`}
              required
              autoFocus />
          </div>
          <div>
            <label className={`block mb-1 font-medium ${labelColor}`}>Descripción *</label>
            <input
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Ej: Clamshell pequeño para berries"
              className={`w-full p-3 rounded-xl border focus:ring-2 ${formInput}`}
              required />
          </div>
          <div className="flex items-end col-span-2">
            <button
              type="submit"
              className={`w-full bg-orange-500 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow transition mt-1 ${loading ? "opacity-60 pointer-events-none" : ""}`}
              disabled={loading} >
              {loading ? "Guardando..." : "Agregar empaque"}
            </button>
          </div>
        </div>
        {mensajeAgregar && (
          <div className={`mt-2 font-semibold text-lg ${darkMode ? "text-emerald-200" : "text-green-700"}`}>{mensajeAgregar}</div>
        )}
      </form>

      {/* Mensaje de eliminar encima de la lista */}
      {mensajeEliminar && (
        <div className={`w-full max-w-2xl mb-3 text-center font-semibold text-lg ${darkMode ? "text-red-300" : "text-red-600"}`}>
          {mensajeEliminar}
        </div>
      )}

      {/* Lista de empaques */}
      <div className="w-full max-w-2xl mt-10">
        <h2 className={`text-xl font-bold mb-4 ${textAccent}`}>Empaques registrados</h2>
        {loading ? (
          <div className={`${darkMode ? "text-orange-200" : "text-gray-400"} py-6 text-center`}>Cargando...</div>
        ) : empaques.length === 0 ? (
          <div className={`${darkMode ? "text-orange-200" : "text-gray-400"} py-6 text-center`}>No hay empaques registrados.</div>
        ) : (
          <div className="grid gap-4 grid-cols-1">
            {empaques.map((emp) => (
              <div
                key={emp.id}
                className={`rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-2 hover:shadow-2xl transition border ${cardBg}`}>
                <div>
                  <div className={`text-lg font-bold ${darkMode ? "text-orange-100" : "text-gray-800"}`}>
                    {emp.tamanio}
                  </div>
                  <div className={`text-sm ${darkMode ? "text-orange-100/80" : "text-gray-600"}`}>
                    {emp.descripcion}
                  </div>
                </div>
                <button
                  className="bg-red-600 hover:bg-red-800 text-white px-4 py-2 rounded-xl font-bold transition shadow"
                  onClick={() => handleEliminar(emp.id)} >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

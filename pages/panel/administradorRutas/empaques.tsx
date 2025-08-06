import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FiMenu, FiX, FiHome } from "react-icons/fi";

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
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const modulos = [
    { nombre: 'Empaques y Clamshell', ruta: '/panel/administradorRutas/empaques', icon: '📦' },
    { nombre: 'Agregar empresas', ruta: '/panel/administradorRutas/agregar-empres', icon: '🏢' },
    { nombre: 'Agregar frutas', ruta: '/panel/administradorRutas/agregar-frutas', icon: '🍓' },
    { nombre: 'Agregar agricultores', ruta: '/panel/administradorRutas/agregar-agricultores', icon: '👨‍🌾' },
    { nombre: 'Notas', ruta: '/panel/administradorRutas/notas/notas', icon: '📝' },
  ];

  const handleModuloClick = (ruta: string) => {
    setSidebarOpen(false);
    router.push(ruta);
  };

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

  const bgDay = "bg-[#f6f4f2]";
  const cardDay = "bg-[#f8f7f5] border border-orange-200";
  const textDay = "text-[#1a1a1a]";
  const accentDay = "text-orange-600";
  const softShadow = "shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]";
  const bgNight = "bg-[#161616]";
  const cardNight = "bg-[#232323] border border-[#353535]";
  const textNight = "text-white";
  const accentNight = "text-orange-400";

  const cardBg = darkMode ? cardNight : cardDay;
  const textAccent = darkMode ? accentNight : accentDay;
  const labelColor = darkMode ? "text-orange-200" : "text-orange-700";
  const inputBg = darkMode
    ? "bg-gray-900 border-gray-700 text-orange-100 focus:ring-orange-300"
    : "bg-white border-orange-300 text-orange-900 focus:ring-orange-200";

  function Sidebar() {
    return (
      <aside className={`
        fixed top-0 left-0 h-screen w-[250px] md:w-[260px] z-40
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${cardBg} p-6 ${softShadow} border-r transition-transform duration-300
      `}>
        <div className="flex flex-col items-center mb-8">
          <div className={`rounded-full p-3 mb-2 ${darkMode ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
            <span className="text-3xl">📦</span>
          </div>
          <h2 className="text-lg font-bold mb-1 text-center">Empaques</h2>
          <span className={`text-xs ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Panel admin</span>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {modulos.map((modulo, idx) => (
            <button
              key={idx}
              onClick={() => handleModuloClick(modulo.ruta)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold transition
                ${darkMode ? 'hover:bg-[#1e1914]' : 'hover:bg-orange-100'} ${textAccent}
                ${router.asPath === modulo.ruta ? 'bg-orange-500/30' : ''}`
              }
            >
              <span className="text-xl">{modulo.icon}</span>
              <span>{modulo.nombre}</span>
            </button>
          ))}
        </nav>
        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-bold shadow-lg"
            onClick={() => router.push('/')}
          >
            Cerrar sesión
          </button>
        </div>
        <button className="absolute top-5 right-4 text-3xl text-orange-500" onClick={() => setSidebarOpen(false)}>
          <FiX />
        </button>
      </aside>
    );
  }

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${darkMode ? bgNight : bgDay}`}>
      {!sidebarOpen && (
        <button
          className="fixed z-50 top-5 left-3 bg-orange-500 text-white rounded-full p-2 shadow-xl"
          onClick={() => setSidebarOpen(true)}
        >
          <FiMenu className="text-2xl" />
        </button>
      )}
      <Sidebar />
      <main className={`flex-1 p-4 md:p-8 transition-all duration-300 ${sidebarOpen ? 'md:ml-[260px]' : ''}`}>
        <div className="w-full max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between items-center mb-6 gap-4">
            <div>
              <h1 className={`text-3xl font-extrabold tracking-tight mb-1 ${textAccent}`}>
                Gestión de Empaques
              </h1>
              <p className={`text-base ${darkMode ? "text-orange-100/70" : "text-gray-500"}`}>
                Administra los empaques registrados en el sistema.
              </p>
            </div>
            <button
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm shadow-sm font-semibold transition-colors
                ${darkMode ? 'bg-[#232323] border-orange-700 text-orange-300 hover:bg-orange-900' : 'bg-white border-orange-200 text-orange-700 hover:bg-orange-100'}`}
              onClick={() => router.push("/panel/administrador")}
              title="Ir al menú principal"
            >
              <FiHome className="text-lg" />
              <span className="hidden sm:inline">Menú principal</span>
            </button>
          </div>

          <form
            className={`w-full ${cardBg} border rounded-2xl p-6 mb-8 ${softShadow} flex flex-col gap-4 transition`}
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
                  className={`w-full p-3 rounded-xl border focus:ring-2 ${inputBg}`}
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
                  className={`w-full p-3 rounded-xl border focus:ring-2 ${inputBg}`}
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

          {mensajeEliminar && (
            <div className={`w-full mb-3 text-center font-semibold text-lg ${darkMode ? "text-red-300" : "text-red-600"}`}>
              {mensajeEliminar}
            </div>
          )}

          <div className="w-full mt-10">
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
      </main>
    </div>
  );
}

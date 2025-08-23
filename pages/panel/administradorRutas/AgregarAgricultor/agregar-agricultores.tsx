import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FiMenu, FiX, FiHome } from "react-icons/fi";
import ModalAgricultorIndependiente from "./ModalAgricultor";

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const modulos = [
    { nombre: 'Almacen de Materiales', ruta: '/panel/administradorRutas/AlmacenMateriales', icon: '🏗️' },
    { nombre: 'Empaques y Clamshell', ruta: '/panel/administradorRutas/Materiales/empaques', icon: '📦' },
    { nombre: 'Agregar empresas', ruta: '/panel/administradorRutas/AgregarEmpresa/agregar-empres', icon: '🏢' },
    { nombre: 'Agregar frutas', ruta: '/panel/administradorRutas/AgregarFrutas/agregar-frutas', icon: '🍓' },
    { nombre: 'Agregar agricultores', ruta: '/panel/administradorRutas/AgregarAgricultor/agregar-agricultores', icon: '👨‍🌾' },
    { nombre: 'Notas', ruta: '/panel/administradorRutas/notas/notas', icon: '📝' },
  ];

  const handleModuloClick = (ruta: string) => {
    setSidebarOpen(false);
    router.push(ruta);
  };

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
        setModalOpen(false);
        setTimeout(() => setMensaje(''), 2500);
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
        setTimeout(() => setMensaje(''), 3000);
      })
      .finally(() => setLoading(false));
  };

  // COLORES IGUALES AL PANEL PRINCIPAL
  const bgDay = "bg-[#f6f4f2]";
  const cardDay = "bg-[#f8f7f5] border border-orange-200";
  const bgNight = "bg-[#161616]";
  const cardNight = "bg-[#232323] border border-[#353535]";
  const textAccent = darkMode ? "text-orange-400" : "text-orange-600";
  const cardBg = darkMode ? cardNight : cardDay;

  function Sidebar() {
    return (
      <aside className={`
        fixed top-0 left-0 h-screen w-[250px] md:w-[260px] z-40
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${cardBg} p-6 border-r transition-transform duration-300
      `}>
        <div className="flex flex-col items-center mb-8">
          <div className={`rounded-full p-3 mb-2 ${darkMode ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
            <span className="text-3xl">👨‍🌾</span>
          </div>
          <h2 className="text-lg font-bold mb-1 text-center">Agricultores</h2>
          <span className={`text-xs ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Panel admin</span>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {modulos.map((modulo, idx) => (
            <button
              key={idx}
              onClick={() => handleModuloClick(modulo.ruta)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold transition
                ${darkMode ? 'hover:bg-[#1e1914]' : 'hover:bg-orange-100'} ${textAccent}
                ${router.asPath === modulo.ruta ? 'bg-orange-500/30' : ''}`}
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
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between items-center mb-6 gap-4">
            <div>
              <h1 className={`text-3xl font-extrabold tracking-tight mb-1 ${textAccent}`}>
                Gestión de Agricultores Independientes
              </h1>
              <p className={`text-base text-orange-200`}>
                Administra los agricultores independientes registrados.
              </p>
            </div>
            <button
              className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-5 rounded-xl"
              onClick={() => setModalOpen(true)}
            >
              + Agregar agricultor
            </button>
          </div>

          {mensaje && (
            <div className="mb-3 font-semibold text-orange-600">{mensaje}</div>
          )}

          <div className="overflow-x-auto rounded-xl shadow">
            <table className="min-w-full bg-white dark:bg-[#232323] border">
              <thead>
                <tr>
                  <th className="px-4 py-2">Nombre</th>
                  <th className="px-4 py-2">Apellido</th>
                  <th className="px-4 py-2">Empresa</th>
                  <th className="px-4 py-2">Teléfono</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Dirección</th>
                  <th className="px-4 py-2">Tipo venta</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-orange-200">Cargando...</td>
                  </tr>
                ) : agricultores.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-orange-200">No hay agricultores registrados.</td>
                  </tr>
                ) : (
                  agricultores.map((ag) => (
                    <tr key={ag.id} className="hover:bg-orange-100/30 dark:hover:bg-orange-900/20">
                      <td className="px-4 py-2">{ag.nombre}</td>
                      <td className="px-4 py-2">{ag.apellido}</td>
                      <td className="px-4 py-2">{ag.empresa}</td>
                      <td className="px-4 py-2">{ag.telefono}</td>
                      <td className="px-4 py-2">{ag.email}</td>
                      <td className="px-4 py-2">{ag.direccion}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-block text-xs font-bold rounded-full px-3 py-1 ${
                          ag.tipo_venta === "nacional"
                            ? "bg-orange-800 text-orange-200"
                            : "bg-emerald-900 text-emerald-200"
                        }`}>
                          {ag.tipo_venta === "nacional" ? "Nacional" : "Exportación"}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          className="bg-red-600 hover:bg-red-800 text-white px-4 py-1 rounded-xl font-bold text-xs"
                          onClick={() => handleEliminar(ag.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <ModalAgricultorIndependiente
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSubmit={handleAgregar}
            values={form}
            onChange={handleChange}
            loading={loading}
          />
        </div>
      </main>
    </div>
  );
}

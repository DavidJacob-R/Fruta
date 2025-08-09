import { FiX } from "react-icons/fi";
import { useRouter } from "next/router";

export default function Sidebar({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean, setSidebarOpen: (v: boolean) => void }) {
  const router = useRouter();
  const modulos = [
    { nombre: 'Empaques y Clamshell', ruta: '/panel/administradorRutas/Materiales/empaques', icon: '📦' },
    { nombre: 'Agregar empresas', ruta: '/panel/administradorRutas/AgregarEmpresa/agregar-empres', icon: '🏢' },
    { nombre: 'Agregar frutas', ruta: '/panel/administradorRutas/AgregarFrutas/agregar-frutas', icon: '🍓' },
    { nombre: 'Agregar agricultores', ruta: '/panel/administradorRutas/AgregarAgricultor/agregar-agricultores', icon: '👨‍🌾' },
    { nombre: 'Notas', ruta: '/panel/administradorRutas/notas/notas', icon: '📝' },
  ];

  const cardBg = "bg-[#232323] border border-[#353535]";
  const textAccent = "text-orange-400";
  const softShadow = "shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]";

  return (
    <aside className={`
      fixed top-0 left-0 h-screen w-[250px] md:w-[260px] z-40
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      ${cardBg} p-6 ${softShadow} border-r transition-transform duration-300
    `}>
      <div className="flex flex-col items-center mb-8">
        <div className="rounded-full p-3 mb-2 bg-orange-500/20">
          <span className="text-3xl">🏢</span>
        </div>
        <h2 className="text-lg font-bold mb-1 text-center text-orange-200">Empresas</h2>
        <span className="text-xs text-orange-200">Panel admin</span>
      </div>
      <nav className="flex-1 flex flex-col gap-1">
        {modulos.map((modulo, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSidebarOpen(false);
              router.push(modulo.ruta);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold transition
              hover:bg-[#1e1914] ${textAccent}
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

import { FiX } from "react-icons/fi"
import { useRouter } from "next/router"
import { useUi } from "./ui-context"

type Modulo = { nombre: string; ruta: string; icon: string }

export default function SidebarAdmin({ modulos }: { modulos: Modulo[] }) {
  const router = useRouter()
  const { darkMode, sidebarOpen, setSidebarOpen } = useUi()

  const cardDay = "bg-[#f8f7f5] border border-orange-200"
  const cardNight = "bg-[#232323] border border-[#353535]"
  const accentDay = "text-orange-600"
  const accentNight = "text-orange-400"
  const softShadow = "shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]"

  function handleModuloClick(ruta: string) {
    setSidebarOpen(false)
    router.push(ruta)
  }

  return (
    <aside
      className={`fixed top-0 left-0 h-screen w-[86vw] max-w-[280px] md:w-[280px] z-40 transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 ${darkMode ? cardNight : cardDay} p-6 ${softShadow} border-r transition-transform duration-300 flex flex-col`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex flex-col items-center mb-6">
        <div className={`${darkMode ? "bg-orange-500/20" : "bg-orange-100"} rounded-full p-3 mb-2`}>
          <span className="text-3xl">📝</span>
        </div>
        <h2 className="text-base font-bold mb-0.5 text-center">Notas y Gestion</h2>
        <span className={`${darkMode ? "text-orange-200" : "text-orange-700"} text-xs`}>Panel admin</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
        {(modulos ?? []).map((m, idx) => (
          <button
            key={idx}
            onClick={() => handleModuloClick(m.ruta)}
            className={`flex items-center gap-3 px-4 py-4 rounded-xl text-left font-semibold transition ${
              darkMode ? "hover:bg-[#1e1914]" : "hover:bg-orange-100"
            } ${darkMode ? accentNight : accentDay} ${router.asPath === m.ruta ? "bg-orange-500/30" : ""}`}
          >
            <span className="text-xl">{m.icon}</span>
            <span className="truncate">{m.nombre}</span>
          </button>
        ))}
      </nav>

      <div className="mt-6 pt-4 border-t border-orange-200/50 dark:border-[#353535]">
        <button
          className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg active:scale-95"
          onClick={() => router.push("/")}
        >
          Cerrar sesion
        </button>
      </div>

      <button
        className="absolute top-4 right-4 text-3xl text-orange-500 md:hidden"
        onClick={() => setSidebarOpen(false)}
        aria-label="Cerrar menu"
      >
        <FiX />
      </button>
    </aside>
  )
}

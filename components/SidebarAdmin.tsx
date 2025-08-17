import { FiX } from "react-icons/fi"
import { useRouter } from "next/router"
import { useUi } from "./ui-context"

type Modulo = { nombre: string; ruta: string; icon: string }

export default function SidebarAdmin({ modulos }: { modulos: Modulo[] }) {
  const router = useRouter()
  const { darkMode, setDarkMode, sidebarOpen, setSidebarOpen } = useUi()

  const bgDay = "bg-[#f6f4f2]"
  const cardDay = "bg-[#f8f7f5] border border-orange-200"
  const bgNight = "bg-[#161616]"
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
      className={`fixed top-0 left-0 h-screen w-[250px] md:w-[260px] z-40 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } ${darkMode ? cardNight : cardDay} p-6 ${softShadow} border-r transition-transform duration-300`}
    >
      <div className="flex flex-col items-center mb-8">
        <div className={`rounded-full p-3 mb-2 ${darkMode ? "bg-orange-500/20" : "bg-orange-100"}`}>
          <span className="text-3xl">📝</span>
        </div>
        <h2 className="text-lg font-bold mb-1 text-center">Notas y Gestion</h2>
        <span className={`${darkMode ? "text-orange-200" : "text-orange-700"} text-xs`}>Panel admin</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {modulos.map((m, idx) => (
          <button
            key={idx}
            onClick={() => handleModuloClick(m.ruta)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold transition ${
              darkMode ? "hover:bg-[#1e1914]" : "hover:bg-orange-100"
            } ${darkMode ? accentNight : accentDay} ${router.asPath === m.ruta ? "bg-orange-500/30" : ""}`}
          >
            <span className="text-xl">{m.icon}</span>
            <span>{m.nombre}</span>
          </button>
        ))}
      </nav>

      <div className="mt-10 flex flex-col items-center gap-3">
        <button
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-bold shadow-lg"
          onClick={() => router.push("/")}
        >
          Cerrar sesion
        </button>

        <button
          aria-label="Cambiar modo"
          onClick={() => setDarkMode((d) => !d)}
          className={`flex items-center gap-2 focus:outline-none border border-orange-400 ${
            darkMode ? "bg-[#232323]" : "bg-orange-50"
          } rounded-full px-4 py-2 ${softShadow} transition hover:bg-orange-100 dark:hover:bg-orange-700/20`}
        >
          <span className={`text-xs font-semibold ${darkMode ? "text-orange-400" : "text-orange-600"}`}>
            {darkMode ? "Noche" : "Dia"}
          </span>
          <div className="relative w-10 h-5">
            <span className={`absolute left-0 top-0 w-10 h-5 rounded-full ${darkMode ? "bg-orange-500/60" : "bg-orange-200"}`} />
            <span
              className={`absolute z-10 top-0.5 left-1 ${darkMode ? "translate-x-5" : ""} transition-transform w-4 h-4 ${
                darkMode ? "bg-[#161616] border-orange-500" : "bg-white border-orange-400"
              } border rounded-full shadow`}
            />
          </div>
        </button>
      </div>

      <button className="absolute top-5 right-4 text-3xl text-orange-500" onClick={() => setSidebarOpen(false)}>
        <FiX />
      </button>
    </aside>
  )
}

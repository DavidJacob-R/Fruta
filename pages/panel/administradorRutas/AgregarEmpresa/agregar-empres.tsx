import { useUi } from "@/components/ui-context"
import EmpresasPanel from "./EmpresasPanel"
import { FiHome } from "react-icons/fi"
import { useRouter } from "next/router"

export default function EmpresasAgricultoresPage() {
  const { darkMode } = useUi()
  const router = useRouter()

  const bgDay = "bg-[#f6f4f2]"
  const bgNight = "bg-[#161616]"
  const textDay = "text-[#1a1a1a]"
  const textNight = "text-white"

  return (
    <div className={`${darkMode ? bgNight : bgDay} min-h-screen ${darkMode ? textNight : textDay} transition-colors duration-300`}>
      <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-b-2xl p-4 sm:p-6 text-white shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 truncate">Empresas y Agricultores</h1>
            <p className="text-orange-100 text-sm sm:text-base">Administra las empresas registradas y sus agricultores vinculados</p>
          </div>
          <button
            className="px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition flex items-center gap-2"
            onClick={() => router.push("/panel/administrador")}
            title="Ir al menu principal"
          >
            <FiHome className="text-lg" />
            <span className="hidden sm:inline">Menu</span>
          </button>
        </div>
      </section>

      <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <EmpresasPanel />
      </main>
    </div>
  )
}

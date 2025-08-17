import { useUi } from "@/components/ui-context"
import EmpresasPanel from "./EmpresasPanel"
import { FiHome } from "react-icons/fi"
import { useRouter } from "next/router"

export default function EmpresasAgricultoresPage() {
  const { darkMode } = useUi()
  const router = useRouter()

  const textMain = darkMode ? "text-orange-200" : "text-orange-700"
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-500"

  return (
    <>
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className={`text-3xl font-extrabold tracking-tight ${textMain}`}>
              Empresas & Agricultores
            </h1>
            <p className={`mt-1 ${textSecondary}`}>
              Administra las empresas registradas y sus agricultores.
            </p>
          </div>

          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm shadow-sm font-semibold transition-colors ${
              darkMode ? "bg-[#232323] border-orange-700 text-orange-300 hover:bg-orange-900" : "bg-white border-orange-200 text-orange-700 hover:bg-orange-100"
            }`}
            onClick={() => router.push("/panel/administrador")}
            title="Ir al menu principal"
          >
            <FiHome className="text-lg" />
            <span className="hidden sm:inline">Menu principal</span>
          </button>
        </header>

        <EmpresasPanel />
      </div>
    </>
  )
}

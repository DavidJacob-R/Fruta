import { useEffect, useState } from "react"
import { FiMenu } from "react-icons/fi"
import SidebarAdmin from "./SidebarAdmin"
import { UiProvider } from "./ui-context"

type Modulo = { nombre: string; ruta: string; icon: string }

const defaultModulos: Modulo[] = [
  { nombre: "Agregar Clamshell", ruta: "/panel/administradorRutas/Materiales/empaques", icon: "📦" },
  { nombre: "Materiales", ruta: "/panel/administradorRutas/AlmacenMateriales/AlmacenMateriales", icon: "🏗️" },
  { nombre: "Agregar empresas", ruta: "/panel/administradorRutas/AgregarEmpresa/agregar-empres", icon: "🏢" },
  { nombre: "Agregar frutas", ruta: "/panel/administradorRutas/AgregarFrutas/agregar-frutas", icon: "🍓" },
  { nombre: "Notas", ruta: "/panel/administradorRutas/notas/notas", icon: "📝" },
  { nombre: "Temporadas", ruta: "/panel/administradorRutas/Temporadas/temporadas", icon: "📅" },
  { nombre: "Usuarios", ruta: "/panel/administradorRutas/Usuarios/usuarios", icon: "👥" },
]

export default function AdminLayout({
  children,
  modulos
}: {
  children: React.ReactNode
  modulos?: Modulo[]
}) {
  const [darkMode, setDarkMode] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
  }, [darkMode])

  const bgNight = "bg-[#161616]"
  const bgDay = "bg-[#f6f4f2]"

  return (
    <UiProvider value={{ darkMode, setDarkMode, sidebarOpen, setSidebarOpen }}>
      <div className={`${darkMode ? bgNight : bgDay} min-h-screen flex transition-colors duration-300`}>
        {!sidebarOpen && (
          <button
            className="fixed z-50 top-5 left-3 bg-orange-500 text-white rounded-full p-2 shadow-xl"
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu className="text-2xl" />
          </button>
        )}
        <SidebarAdmin modulos={modulos ?? defaultModulos} />
        <main className={`flex-1 p-4 md:p-8 transition-all duration-300 ${sidebarOpen ? "md:ml-[260px]" : ""}`}>
          <div className="w-full max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </UiProvider>
  )
}

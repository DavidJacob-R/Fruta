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
  { nombre: "Historial", ruta: "/panel/administradorRutas/Historial/historial", icon: "📜" },
]

export default function AdminLayout({ children, modulos }: { children: React.ReactNode; modulos?: Modulo[] }) {
  const [darkMode, setDarkMode] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
  }, [darkMode])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const bgNight = "bg-[#161616]"
  const bgDay = "bg-[#f6f4f2]"

  return (
    <UiProvider value={{ darkMode, setDarkMode, sidebarOpen, setSidebarOpen }}>
      <div className={`${darkMode ? bgNight : bgDay} min-h-screen flex transition-colors duration-300`}>
        <button
          className="fixed z-50 top-4 left-3 bg-orange-500 text-white rounded-full p-3 shadow-xl active:scale-95 md:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menu"
        >
          <FiMenu className="text-2xl" />
        </button>

        <button
          className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] md:hidden ${sidebarOpen ? "block" : "hidden"}`}
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menu"
        />

        <SidebarAdmin modulos={modulos ?? defaultModulos} />

        <main className="flex-1 p-4 md:p-8 md:ml-[280px]">
          <div className="w-full max-w-7xl mx-auto pb-[env(safe-area-inset-bottom)]">{children}</div>
        </main>
      </div>
    </UiProvider>
  )
}

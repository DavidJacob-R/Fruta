import "@/styles/globals.css"
import type { AppProps } from "next/app"
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import AdminLayout from "@/components/AdminLayout"
import { UiProvider } from "@/components/ui-context"

const ADMIN_PREFIXES = ["/RutasAdministador", "/panel/administradorRutas", "/panel/administrador"]

// Mapa de claves de sección -> ruta real de tu app
const RUTAS_POR_SECCION: Record<string, string> = {
  dashboard: "/panel/empleado",
  recepcion: "/panel/Rutas/recepcion/recepcion",
  control_calidad: "/panel/Rutas/control-calidad/control-calidad",
  preenfriado: "/panel/Rutas/preenfriado/preenfriado",
  conservacion: "/panel/Rutas/conservacion/conservacion",
  salidas: "/panel/Rutas/salidas/salida",
  almacen_materiales: "/panel/Rutas/almacenMateriales/almacen-materiales",
  panel_usuarios: "/panel/administrador"
}

// Orden para elegir “primera sección disponible”
const PRIORIDAD = [
  "recepcion",
  "control_calidad",
  "preenfriado",
  "conservacion",
  "salidas",
  "almacen_materiales"
]

// Detecta la clave de sección a partir del pathname actual
function clavePorPath(pathname: string): string | null {
  if (pathname.startsWith("/panel/Rutas/recepcion")) return "recepcion"
  if (pathname.startsWith("/panel/Rutas/control-calidad")) return "control_calidad"
  if (pathname.startsWith("/panel/Rutas/preenfriado")) return "preenfriado"
  if (pathname.startsWith("/panel/Rutas/conservacion")) return "conservacion"
  if (pathname.startsWith("/panel/Rutas/salidas")) return "salidas"
  if (pathname.startsWith("/panel/Rutas/almacenMateriales")) return "almacen_materiales"
  if (pathname.startsWith("/panel/administrador") || pathname.startsWith("/panel/administradorRutas") || pathname.startsWith("/RutasAdministador")) return "panel_usuarios"
  return null
}

function esAdminLocal(u: any): boolean {
  const rolNombre = String(u?.rol || "").toLowerCase()
  return u?.es_admin === true || u?.rol_id === 1 || rolNombre === "administrador"
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const checkingRef = useRef(false)

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
  }, [darkMode])

  // Guard de sesión/permisos
  useEffect(() => {
    const pathname = router.pathname

    // Rutas públicas (ajusta si tienes más)
    const publica =
      pathname === "/" ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/api/")

    if (publica) return

    const usuarioRaw = typeof window !== "undefined" ? localStorage.getItem("usuario") : null
    if (!usuarioRaw) {
      if (router.asPath !== "/login") router.replace("/login")
      return
    }

    const u = JSON.parse(usuarioRaw || "{}")
    const esAdmin = esAdminLocal(u)

    const isAdminRoute = ADMIN_PREFIXES.some((p) => pathname.startsWith(p))
    if (isAdminRoute) {
      // Si intenta abrir admin sin ser admin → redirigir a empleado
      if (!esAdmin) {
        if (router.asPath !== "/panel/empleado") router.replace("/panel/empleado")
      }
      return
    }

    // Si estamos en una ruta de módulo (empleado), validar permisos
    const clave = clavePorPath(pathname)
    if (!clave) return // p.ej. /panel/empleado o ruta neutra

    // Admin ignora permisos de secciones
    if (esAdmin) return

    const goPrimeraPermitida = (claves: string[]) => {
      for (const k of PRIORIDAD) {
        if (claves.includes(k)) {
          const destino = RUTAS_POR_SECCION[k] || "/panel/empleado"
          if (router.asPath !== destino) router.replace(destino)
          return
        }
      }
      if (router.asPath !== "/panel/empleado") router.replace("/panel/empleado")
    }

    const locales: string[] = Array.isArray(u?.permisos) ? u.permisos : []
    if (locales.length) {
      if (!locales.includes(clave)) {
        goPrimeraPermitida(locales)
      }
      return
    }

    // No hay permisos en localStorage → consultar y guardar
    if (checkingRef.current) return
    checkingRef.current = true
    fetch("/api/auth/permisos/" + u.id)
      .then((r) => r.json())
      .then((j) => {
        const claves: string[] = Array.isArray(j?.claves) ? j.claves : []
        const nuevo = { ...u, permisos: claves }
        localStorage.setItem("usuario", JSON.stringify(nuevo))
        if (!claves.includes(clave)) {
          goPrimeraPermitida(claves)
        }
      })
      .catch(() => {
        if (router.asPath !== "/panel/empleado") router.replace("/panel/empleado")
      })
      .finally(() => {
        checkingRef.current = false
      })
  }, [router.pathname])

  const isAdminRoute = ADMIN_PREFIXES.some((p) => router.pathname.startsWith(p))

  if (isAdminRoute) {
    return (
      <UiProvider value={{ darkMode, setDarkMode, sidebarOpen, setSidebarOpen }}>
        <AdminLayout>
          <Component {...pageProps} />
        </AdminLayout>
      </UiProvider>
    )
  }

  return (
    <UiProvider value={{ darkMode, setDarkMode, sidebarOpen, setSidebarOpen }}>
      <Component {...pageProps} />
    </UiProvider>
  )
}

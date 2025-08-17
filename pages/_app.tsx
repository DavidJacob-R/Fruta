import "@/styles/globals.css"
import type { AppProps } from "next/app"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import AdminLayout from "@/components/AdminLayout"
import { UiProvider } from "@/components/ui-context"

const ADMIN_PREFIXES = ["/RutasAdministador", "/panel/administradorRutas", "/panel/administrador"]

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

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

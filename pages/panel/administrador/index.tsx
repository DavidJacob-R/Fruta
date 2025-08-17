import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { useUi } from "@/components/ui-context"

export default function AdminPanel() {
  const router = useRouter()
  const { darkMode, setDarkMode } = useUi()
  const [email, setEmail] = useState("")

  useEffect(() => {
    const temaGuardado = localStorage.getItem("tema")
    if (temaGuardado) setDarkMode(temaGuardado === "noche")
    const usuario = localStorage.getItem("usuario")
    if (usuario) {
      const user = JSON.parse(usuario)
      setEmail(user.email)
    } else {
      router.push("/login")
    }
  }, [router, setDarkMode])

  const cambiarModo = () => {
    setDarkMode((m) => {
      localStorage.setItem("tema", !m ? "noche" : "dia")
      return !m
    })
  }

  const handleLogout = () => {
    localStorage.removeItem("usuario")
    router.push("/")
  }

  const bgDay = "bg-[#f6f4f2]"
  const textDay = "text-[#1a1a1a]"
  const bgNight = "bg-[#161616]"
  const textNight = "text-white"
  const softShadow = "shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]"
  const cardDay = "bg-[#f8f7f5] border border-orange-200"
  const cardNight = "bg-[#232323] border border-[#353535]"
  const cardBg = darkMode ? cardNight : cardDay
  const accent = darkMode ? "text-orange-400" : "text-orange-700"
  const subtext = darkMode ? "text-gray-400" : "text-gray-500"

  return (
    <div className={`${darkMode ? bgNight : bgDay} min-h-screen ${darkMode ? textNight : textDay} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto p-6 md:p-10 flex flex-col gap-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-extrabold ${accent}`}>Panel del Administrador</h1>
            <p className={`${subtext} text-sm mt-1`}>{email}</p>
          </div>
          <div className="flex items-center gap-3">
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`rounded-2xl p-6 flex flex-col items-center ${cardBg} ${softShadow}`}>
            <span className="text-3xl mb-2">📝</span>
            <span className="text-2xl font-bold">12</span>
            <span className={`text-sm ${subtext}`}>Notas generadas hoy</span>
          </div>
          <div className={`rounded-2xl p-6 flex flex-col items-center ${cardBg} ${softShadow}`}>
            <span className="text-3xl mb-2">🍓</span>
            <span className="text-2xl font-bold">3</span>
            <span className={`text-sm ${subtext}`}>Recepciones de fruta hoy</span>
          </div>
          <div className={`rounded-2xl p-6 flex flex-col items-center ${cardBg} ${softShadow}`}>
            <span className="text-3xl mb-2">⚠️</span>
            <span className="text-2xl font-bold text-red-500">2</span>
            <span className={`text-sm ${subtext}`}>Alertas pendientes</span>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">Actividad reciente</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-lg">➕</span>
              <span>Se registró una nueva recepción de fruta (hace 5 min)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">📝</span>
              <span>Se generó la nota #1211 (hace 12 min)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>Carga en almacén lleva más de 2 días (hace 1 h)</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}

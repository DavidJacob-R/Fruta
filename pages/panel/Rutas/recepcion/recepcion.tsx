import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function RecepcionSeleccion() {
  const router = useRouter()
  const [siguienteNumero, setSiguienteNumero] = useState<number | null>(null)
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    const temaGuardado = typeof window !== 'undefined' ? localStorage.getItem('tema') : null
    if (temaGuardado) setDarkMode(temaGuardado === 'noche')
    fetch('/api/recepcion/siguiente_nota')
      .then(res => res.json())
      .then(data => setSiguienteNumero(data.siguienteNumero))
      .catch(() => setSiguienteNumero(null))
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('tema', 'noche')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('tema', 'dia')
    }
  }, [darkMode])

  const crearNota = () => {
    router.push('/panel/Rutas/recepcion/recepcion-fruta')
  }

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-[#181a1b]' : 'bg-orange-50'}`}>
      <header className={`w-full sticky top-0 z-20 ${darkMode ? 'bg-[#181a1b]/90' : 'bg-white/90'} backdrop-blur border-b ${darkMode ? 'border-white/10' : 'border-orange-200'}`}>
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${darkMode ? 'bg-white/10 border-orange-400' : 'bg-orange-100 border-orange-300'}`}>
              <span className={`text-2xl font-black ${darkMode ? 'text-orange-300' : 'text-orange-500'}`}>🍊</span>
            </div>
            <span className={`text-base font-bold tracking-wider ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>El Molinito</span>
          </div>
          <button
            onClick={() => setDarkMode(d => !d)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${darkMode ? 'bg-[#232a2d] border-orange-300 text-orange-100' : 'bg-white border-orange-300 text-orange-700'}`}
          >
            {darkMode ? 'Noche' : 'Dia'}
          </button>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-xl mx-auto px-4 pt-6 pb-28">
          <h1 className={`text-2xl font-extrabold ${darkMode ? 'text-orange-100' : 'text-orange-800'}`}>Recepcion de fruta</h1>

          <div className={`mt-4 rounded-2xl p-5 border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-orange-200'} shadow-sm`}>
            <div className="flex items-end justify-between">
              <div>
                <div className={`text-sm ${darkMode ? 'text-orange-200/80' : 'text-orange-700/90'}`}>Proxima nota</div>
                <div className={`mt-1 text-4xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-orange-900'}`}>
                  {siguienteNumero !== null ? siguienteNumero : '...'}
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${darkMode ? 'bg-orange-300/15 text-orange-200' : 'bg-orange-100 text-orange-700'}`}>
                Recepcion
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <button
                onClick={() => router.push('/panel/Rutas/recepcion/nota-recepcion')}
                className={`w-full rounded-xl px-4 py-4 text-base font-bold border ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-orange-200 text-orange-800'} active:scale-[0.99]`}
              >
                Ver notas del dia
              </button>
              <button
                onClick={() => router.push('/panel/empleado')}
                className={`w-full rounded-xl px-4 py-4 text-base font-bold border ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-orange-200 text-orange-800'} active:scale-[0.99]`}
              >
                Regresar al menu principal
              </button>
            </div>
          </div>
        </div>
      </main>

      <div
        className={`fixed inset-x-0 bottom-0 z-30 ${darkMode ? 'bg-[#181a1b]/80 border-t border-white/10' : 'bg-white/90 border-t border-orange-200'} backdrop-blur`}
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-xl mx-auto px-4 py-3">
          <button
            onClick={crearNota}
            className="w-full rounded-2xl px-6 py-4 text-lg font-extrabold tracking-wide bg-gradient-to-r from-orange-500 to-orange-600 text-white active:scale-[0.99]"
          >
            Crear nota
          </button>
        </div>
      </div>

      <footer className={`w-full text-center text-xs ${darkMode ? 'text-orange-200/80' : 'text-orange-900/80'} pb-20`}>
        © {new Date().getFullYear()} El Molinito
      </footer>
    </div>
  )
}

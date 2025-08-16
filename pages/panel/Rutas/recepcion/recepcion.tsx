import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function RecepcionSeleccion() {
  const router = useRouter()
  const [siguienteNumero, setSiguienteNumero] = useState<number | null>(null)
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    fetch('/api/recepcion/siguiente_nota')
      .then(res => res.json())
      .then(data => setSiguienteNumero(data.siguienteNumero))
  }, [])

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [darkMode])

  const crearNota = () => {
    router.push('/panel/Rutas/recepcion/recepcion-fruta')
  }

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300
      ${darkMode
        ? 'bg-gradient-to-br from-[#181a1b] via-[#23282b] to-[#212225]'
        : 'bg-gradient-to-br from-orange-50 via-white to-gray-100'}`}>

      <header className="w-full flex justify-end items-center pt-5 pr-8">
        <button
          onClick={() => setDarkMode(d => !d)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full shadow border text-base font-semibold transition
            ${darkMode
              ? "bg-[#232a2d]/90 border-orange-300 text-orange-100 hover:bg-[#22282a]/90"
              : "bg-white border-orange-200 text-orange-700 hover:bg-orange-50"}`}>
          {darkMode
            ? (<><span role="img" aria-label="noche">🌙</span> Noche</>)
            : (<><span role="img" aria-label="dia">☀️</span> Dia</>)
          }
        </button>
      </header>

      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10 select-none">
        <div className={`w-14 h-14 ${darkMode ? 'bg-white/10 border-orange-400' : 'bg-orange-100 border-orange-300'} border-2 shadow-xl rounded-full flex items-center justify-center`}>
          <span className={`text-3xl font-black ${darkMode ? 'text-orange-300' : 'text-orange-400'}`}>🍊</span>
        </div>
        <span className={`font-bold tracking-widest uppercase text-xl drop-shadow 
          ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>El Molinito</span>
      </div>

      <main className="flex-1 flex items-center justify-center py-14 px-3">
        <div className={`w-full max-w-xl mx-auto rounded-3xl shadow-2xl p-10 flex flex-col items-center pt-20 relative z-0 transition
          ${darkMode
            ? 'bg-white/10 backdrop-blur-lg border-2 border-orange-300'
            : 'bg-white border-2 border-orange-200'
          }`}>

          <h1 className={`text-4xl font-extrabold mb-8 text-center drop-shadow-xl
            ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
            Recepcion de Fruta
          </h1>

          <div className="flex items-center gap-2 mb-10">
            <span className={`font-bold text-lg ${darkMode ? 'text-orange-100' : 'text-orange-700'}`}>Nota N°:</span>
            <span className={`text-2xl font-mono rounded-xl px-4 py-2 border shadow
              ${darkMode
                ? 'bg-black/70 border-orange-400 text-white'
                : 'bg-orange-50 border-orange-200 text-orange-900'
              }`}>
              {siguienteNumero ?? '...'}
            </span>
          </div>

          <div className="w-full flex flex-col gap-8">
            <button
              onClick={crearNota}
              className="w-full shadow-xl hover:scale-105 transition-transform rounded-2xl px-8 py-6 text-lg font-extrabold tracking-wide border-2 focus:ring-2 outline-none bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-none">
              Crear nota
            </button>

            <button
              onClick={() => router.push('/panel/Rutas/recepcion/nota-recepcion')}
              className="w-full shadow hover:scale-105 transition-transform px-6 py-4 text-lg font-bold rounded-2xl border-2 focus:ring-2 outline-none
                bg-white border-orange-200 text-orange-800 hover:bg-orange-50">
              Ver notas del dia
            </button>

            <button
              className="w-full shadow px-6 py-4 text-lg font-bold rounded-2xl border-2 transition-transform hover:scale-105 focus:ring-2 outline-none
                border-orange-200 text-orange-700 bg-white hover:bg-orange-100"
              onClick={() => router.push('/panel/empleado')}>
              Regresar al menu principal
            </button>
          </div>
        </div>
      </main>

      <footer className={`w-full text-center py-4 text-sm mt-auto
        ${darkMode
          ? "bg-[#181a1b] text-orange-200"
          : "bg-orange-50 text-orange-900"
        }`}>
        © {new Date().getFullYear()} El Molinito – Sistema de logistica y control
      </footer>
    </div>
  )
}

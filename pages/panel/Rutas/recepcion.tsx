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

  const handleSeleccion = (tipo: 'empresa' | 'maquila') => {
    if (tipo === 'empresa') {
      router.push('/panel/Rutas/recepcion-empresa')
    } else {
      router.push('/panel/Rutas/recepcion-maquila')
    }
  }

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300
      ${darkMode ? 'bg-gradient-to-tr from-[#191919] via-[#23211e] to-[#161a1e]' : 'bg-gradient-to-tr from-orange-50 via-white to-gray-200'}`}>
      
      {/* Barra modo noche/día */}
      <div className="w-full flex justify-end items-center pt-4 pr-4">
        <button
          onClick={() => setDarkMode(d => !d)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow border text-sm font-medium
            ${darkMode
              ? "bg-gray-900 border-gray-800 text-orange-200 hover:bg-gray-800"
              : "bg-white border-gray-200 text-orange-800 hover:bg-gray-100"}`} >
          {darkMode ? (
            <>
              <span role="img" aria-label="noche">🌙</span> Noche
            </>
          ) : (
            <>
              <span role="img" aria-label="dia">☀️</span> Día
            </>
          )}
        </button>
      </div>

      {/* Branding */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
        <div className={`w-12 h-12 ${darkMode ? 'bg-white/10 border-orange-500' : 'bg-orange-100 border-orange-300'} border shadow-lg rounded-full flex items-center justify-center`}>
          <span className={`text-3xl font-black ${darkMode ? 'text-orange-500' : 'text-orange-600'}`}>🍊</span>
        </div>
        <span className={`font-bold tracking-widest uppercase text-lg drop-shadow ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>El Molinito</span>
      </div>

      {/* Card */}
      <main className="flex-1 flex items-center justify-center py-10 px-3">
        <div className={`w-full max-w-xl mx-auto rounded-3xl shadow-2xl p-10 flex flex-col items-center pt-20 relative z-0 transition
          ${darkMode
            ? 'bg-white/5 backdrop-blur-md border border-orange-400'
            : 'bg-white border border-orange-200'
          }`}>
          <h1 className={`text-3xl sm:text-4xl font-extrabold mb-5 text-center drop-shadow-lg
            ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
            Recepción de Fruta
          </h1>

          {/* Número de nota */}
          <div className="flex items-center gap-2 mb-10">
            <span className={`font-bold text-lg ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>Nota de N°:</span>
            <span className={`text-2xl font-mono rounded px-3 py-1 border shadow
              ${darkMode
                ? 'bg-black/60 border-orange-400 text-white'
                : 'bg-orange-50 border-orange-300 text-orange-700'
              }`}>
              {siguienteNumero ?? '...'}
            </span>
          </div>

          {/* Opciones */}
          <div className="w-full flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row gap-7 justify-center">
              <button
                onClick={() => handleSeleccion('empresa')}
                className={`flex-1 min-w-[170px] shadow-xl hover:scale-105 transition-transform rounded-2xl px-8 py-6 text-lg font-extrabold tracking-wide border-2 focus:ring-2
                  ${darkMode
                    ? 'bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white border-orange-300 hover:from-orange-600 hover:to-orange-800 focus:ring-orange-300'
                    : 'bg-gradient-to-br from-orange-100 via-orange-200 to-orange-400 text-orange-800 border-orange-200 hover:from-orange-300 hover:to-orange-500 focus:ring-orange-200'
                  }`} >
                Nota para empresa
              </button>

              <button
                onClick={() => handleSeleccion('maquila')}
                className={`flex-1 min-w-[170px] shadow-xl hover:scale-105 transition-transform rounded-2xl px-8 py-6 text-lg font-extrabold tracking-wide border-2 focus:ring-2
                  ${darkMode
                    ? 'bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white border-green-200 hover:from-green-600 hover:to-green-900 focus:ring-green-300'
                    : 'bg-gradient-to-br from-green-100 via-green-200 to-green-400 text-green-900 border-green-200 hover:from-green-200 hover:to-green-600 focus:ring-green-200'
                  }`} >
                Nota de maquila
              </button>
            </div>

            <button
              onClick={() => router.push('/panel/Rutas/nota-recepcion')}
              className={`w-full shadow hover:scale-105 transition-transform px-6 py-4 text-lg font-bold rounded-2xl border focus:ring-2
                ${darkMode
                  ? 'bg-gradient-to-r from-blue-500 via-blue-700 to-indigo-800 border-blue-400 text-white hover:from-blue-600 hover:to-indigo-900 focus:ring-blue-300'
                  : 'bg-gradient-to-r from-blue-100 via-blue-300 to-blue-500 border-blue-200 text-blue-900 hover:from-blue-200 hover:to-indigo-200 focus:ring-blue-200'
                }`}>
              Ver notas del día (empresa y maquila)
            </button>

            <button
              className={`w-full shadow px-6 py-4 text-lg font-bold rounded-2xl border transition-transform hover:scale-105 focus:ring-2
                ${darkMode
                  ? 'bg-gradient-to-r from-gray-800 to-black border-orange-400 text-white hover:from-orange-800 hover:to-orange-900 focus:ring-orange-300'
                  : 'bg-gradient-to-r from-orange-200 to-orange-400 border-orange-300 text-orange-900 hover:from-orange-300 hover:to-orange-600 focus:ring-orange-200'
                }`}
              onClick={() => router.push('/panel/empleado')}>
              Regresar al menú principal
            </button>
          </div>
        </div>
      </main>

      {/* Footer fijo */}
      <footer className={`w-full text-center py-4 text-sm mt-auto
        ${darkMode
          ? "bg-[#191919] text-orange-200"
          : "bg-orange-50 text-orange-800"
        }`}>
        © {new Date().getFullYear()} El Molinito – Sistema de logística y control
      </footer>
    </div>
  )
}

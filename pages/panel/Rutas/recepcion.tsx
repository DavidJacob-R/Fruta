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
      ${darkMode ? 'bg-gradient-to-br from-[#171a1b] via-[#22272a] to-[#222111]' : 'bg-gradient-to-br from-orange-50 via-white to-gray-100'}`}>
      
      {/* Barra modo noche/día */}
      <header className="w-full flex justify-end items-center pt-5 pr-8">
        <button
          onClick={() => setDarkMode(d => !d)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full shadow border text-base font-semibold transition
            ${darkMode
              ? "bg-[#22282a]/90 border-orange-400 text-orange-100 hover:bg-[#232a2d]/90"
              : "bg-white border-orange-200 text-orange-700 hover:bg-orange-100"}`}>
          {darkMode
            ? (<><span role="img" aria-label="noche">🌙</span> Noche</>)
            : (<><span role="img" aria-label="dia">☀️</span> Día</>)
          }
        </button>
      </header>

      {/* Branding */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10 select-none">
        <div className={`w-14 h-14 ${darkMode ? 'bg-white/10 border-orange-500' : 'bg-orange-100 border-orange-300'} border-2 shadow-xl rounded-full flex items-center justify-center`}>
          <span className={`text-3xl font-black ${darkMode ? 'text-orange-400' : 'text-orange-500'}`}>🍊</span>
        </div>
        <span className={`font-bold tracking-widest uppercase text-xl drop-shadow 
          ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>El Molinito</span>
      </div>

      {/* Card */}
      <main className="flex-1 flex items-center justify-center py-12 px-3">
        <div className={`w-full max-w-xl mx-auto rounded-3xl shadow-2xl p-10 flex flex-col items-center pt-20 relative z-0 transition
          ${darkMode
            ? 'bg-white/10 backdrop-blur-lg border-2 border-orange-400'
            : 'bg-white border-2 border-orange-200'
          }`}>
          <h1 className={`text-4xl font-extrabold mb-8 text-center drop-shadow-xl
            ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
            Recepción de Fruta
          </h1>

          {/* Número de nota */}
          <div className="flex items-center gap-2 mb-10">
            <span className={`font-bold text-lg ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Nota de N°:</span>
            <span className={`text-2xl font-mono rounded-xl px-4 py-2 border shadow
              ${darkMode
                ? 'bg-black/70 border-orange-400 text-white'
                : 'bg-orange-50 border-orange-200 text-orange-900'
              }`}>
              {siguienteNumero ?? '...'}
            </span>
          </div>

          {/* Opciones */}
          <div className="w-full flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row gap-7 justify-center">
              <button
                onClick={() => handleSeleccion('empresa')}
                className={`flex-1 min-w-[170px] shadow-xl hover:scale-105 transition-transform rounded-2xl px-8 py-6 text-lg font-extrabold tracking-wide border-2 focus:ring-2 outline-none
                  ${ "bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-8 py-4 shadow font-bold border-none transition"}`} >
                Nota para empresa
              </button>
              <button
                onClick={() => handleSeleccion('maquila')}
                className={`flex-1 min-w-[170px] shadow-xl hover:scale-105 transition-transform rounded-2xl px-8 py-6 text-lg font-extrabold tracking-wide border-2 focus:ring-2 outline-none
                  ${"bg-green-700 hover:bg-green-800 text-white rounded-xl px-8 py-4 shadow font-bold border-none transition"}`} >
                Nota de maquila
              </button>
            </div>

            <button
              onClick={() => router.push('/panel/Rutas/nota-recepcion')}
              className={`w-full shadow hover:scale-105 transition-transform px-6 py-4 text-lg font-bold rounded-2xl border focus:ring-2 outline-none
                ${"border-2 border-blue-400 text-blue-800 bg-white hover:bg-blue-50 rounded-xl px-8 py-4 font-bold shadow transition"}`}>
              Ver notas del día (empresa y maquila)
            </button>

            <button
              className={`w-full shadow px-6 py-4 text-lg font-bold rounded-2xl border transition-transform hover:scale-105 focus:ring-2 outline-none
                ${"border-2 border-orange-300 text-orange-800 bg-white hover:bg-orange-100 rounded-xl px-8 py-4 font-bold shadow transitio" }`}
              onClick={() => router.push('/panel/empleado')}>
              Regresar al menú principal
            </button>
          </div>
        </div>
      </main>

      <footer className={`w-full text-center py-4 text-sm mt-auto
        ${darkMode
          ? "bg-[#181a1b] text-orange-200"
          : "bg-orange-50 text-orange-900"
        }`}>
        © {new Date().getFullYear()} El Molinito – Sistema de logística y control
      </footer>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function RecepcionSeleccion() {
  const router = useRouter()
  const [siguienteNumero, setSiguienteNumero] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/recepcion/siguiente_nota')
      .then(res => res.json())
      .then(data => setSiguienteNumero(data.siguienteNumero))
  }, [])

  const handleSeleccion = (tipo: 'empresa' | 'maquila') => {
    if (tipo === 'empresa') {
      router.push('/panel/Rutas/recepcion-empresa')
    } else {
      router.push('/panel/Rutas/recepcion-maquila')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#191919] via-[#23211e] to-[#161a1e] py-10 px-3 relative">
      {/* Branding badge */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
        <div className="w-12 h-12 bg-white/10 border border-orange-500 shadow-lg rounded-full flex items-center justify-center">
          <span className="text-3xl text-orange-500 font-black">🍊</span>
        </div>
        <span className="text-orange-400 font-bold tracking-widest uppercase text-lg drop-shadow">El Molinito</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-xl mx-auto bg-white/5 backdrop-blur-md border border-orange-400 rounded-3xl shadow-2xl p-10 flex flex-col items-center pt-20 relative z-0">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-orange-500 mb-5 text-center drop-shadow-lg">Recepción de Fruta</h1>

        {/* Número de nota */}
        <div className="flex items-center gap-2 mb-10">
          <span className="text-orange-400 font-bold text-lg">Nota de N°:</span>
          <span className="text-2xl font-mono bg-black/60 rounded px-3 py-1 border border-orange-400 text-white shadow">{siguienteNumero ?? '...'}</span>
        </div>

        {/* Opciones */}
        <div className="w-full flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row gap-7 justify-center">
            <button
              onClick={() => handleSeleccion('empresa')}
              className="flex-1 min-w-[170px] bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 shadow-xl hover:scale-[1.03] transition-transform rounded-2xl px-8 py-6 text-lg font-extrabold tracking-wide text-white border-2 border-orange-300 hover:from-orange-600 hover:to-orange-800 focus:ring-2 focus:ring-orange-300"
            >
              Nota para empresa
            </button>

            <button
              onClick={() => handleSeleccion('maquila')}
              className="flex-1 min-w-[170px] bg-gradient-to-br from-green-500 via-green-600 to-green-700 shadow-xl hover:scale-[1.03] transition-transform rounded-2xl px-8 py-6 text-lg font-extrabold tracking-wide text-white border-2 border-green-200 hover:from-green-600 hover:to-green-800 focus:ring-2 focus:ring-green-300"
            >
              Nota de maquila
            </button>
          </div>

          <button
            onClick={() => router.push('/panel/Rutas/nota-recepcion')}
            className="w-full bg-gradient-to-r from-blue-500 via-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-900 shadow hover:scale-105 transition-transform px-6 py-4 text-lg font-bold text-white rounded-2xl border border-blue-400"
          >
            Ver notas del día (empresa y maquila)
          </button>

          <button
            className="w-full bg-gradient-to-r from-gray-700 to-black hover:from-orange-800 hover:to-orange-900 shadow px-6 py-4 text-lg font-bold rounded-2xl border border-orange-400 text-white hover:scale-105 transition-transform"
            onClick={() => router.push('/panel/empleado')}
          >
            Regresar al menú principal
          </button>
        </div>
      </div>
      {/* Footer */}
      <div className="mt-12 text-xs text-gray-400 opacity-80 text-center w-full">
        © {new Date().getFullYear()} El Molinito – Sistema de logística y control
      </div>
    </div>
  )
}

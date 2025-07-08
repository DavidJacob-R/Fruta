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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-black via-gray-900 to-gray-800 py-8 px-2">
      <div className="w-full max-w-xl mx-auto bg-gray-950 border border-orange-700 rounded-3xl shadow-2xl p-8 flex flex-col items-center">
        <h1 className="text-3xl font-extrabold text-orange-500 mb-4 text-center drop-shadow">Recepción de Fruta</h1>
        <div className="flex items-center gap-2 mb-8">
          <span className="text-orange-400 font-bold text-lg">Nota de N°:</span>
          <span className="text-2xl text-white font-mono">{siguienteNumero ?? '...'}</span>
        </div>

        {/* Opciones */}
        <div className="w-full flex flex-col gap-7">
          <div className="flex flex-col sm:flex-row gap-7 justify-center">
            <button
              onClick={() => handleSeleccion('empresa')}
              className="flex-1 min-w-[170px] bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 shadow-lg hover:scale-105 transition-transform rounded-xl px-6 py-5 text-lg font-bold text-white border-2 border-orange-300 hover:from-orange-600 hover:to-orange-800 focus:ring-2 focus:ring-orange-400"
            >
              Nota para empresa
            </button>

            <button
              onClick={() => handleSeleccion('maquila')}
              className="flex-1 min-w-[170px] bg-gradient-to-br from-green-500 via-green-600 to-green-700 shadow-lg hover:scale-105 transition-transform rounded-xl px-6 py-5 text-lg font-bold text-white border-2 border-green-300 hover:from-green-600 hover:to-green-800 focus:ring-2 focus:ring-green-400"
            >
              Nota de maquila
            </button>
          </div>

          <button
            onClick={() => router.push('/panel/Rutas/nota-recepcion')}
            className="w-full mt-1 bg-gradient-to-r from-blue-500 via-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-900 shadow hover:scale-105 transition-transform px-6 py-4 text-lg font-bold text-white rounded-xl border border-blue-400"
          >
            Ver notas del día (empresa y maquila)
          </button>

          <button
            className="w-full mt-3 bg-gradient-to-r from-gray-700 to-black hover:from-blue-800 hover:to-blue-900 shadow px-6 py-4 text-lg font-bold rounded-xl border border-blue-700 text-white hover:scale-105 transition-transform"
            onClick={() => router.push('/panel/empleado')}
          >
            Regresar al menú principal
          </button>
        </div>
      </div>
    </div>
  )
}

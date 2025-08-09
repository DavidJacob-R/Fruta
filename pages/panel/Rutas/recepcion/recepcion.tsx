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
      router.push('/panel/Rutas/recepcion/recepcion-empresa')
    } else {
      router.push('/panel/Rutas/recepcion/recepcion-maquila')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181712] via-[#24180c] to-[#242126] text-white px-2 py-8 flex flex-col items-center">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-orange-100 shadow-lg rounded-full w-20 h-20 flex items-center justify-center mb-3">
            <span className="text-4xl">🍊</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-orange-400 mb-2 drop-shadow">
            Recepción de Fruta
          </h1>
          <div className="flex items-center gap-3">
            <span className="font-semibold">Próxima nota:</span>
            <span className="text-xl font-mono rounded-xl px-6 py-2 bg-[#242126] border border-orange-300">
              {siguienteNumero ?? '...'}
            </span>
          </div>
        </div>

        {/* Opciones */}
        <div className="bg-[#1c1917] border border-orange-300 rounded-2xl p-6 shadow-md hover:shadow-lg transition mb-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => handleSeleccion('empresa')}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-5 rounded-xl font-bold shadow hover:shadow-lg transition text-lg"
              >
                Nota para empresa
              </button>
              <button
                onClick={() => handleSeleccion('maquila')}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-5 rounded-xl font-bold shadow hover:shadow-lg transition text-lg"
              >
                Nota de maquila
              </button>
            </div>

            <button
              onClick={() => router.push('/panel/Rutas/recepcion/nota-recepcion')}
              className="w-full bg-[#242126] border border-orange-300 hover:border-orange-500 text-white px-6 py-4 rounded-xl font-medium shadow hover:shadow-lg transition"
            >
              Ver notas del día
            </button>

            <button
              onClick={() => router.push('/panel/empleado')}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-4 rounded-xl font-medium shadow hover:shadow-lg transition"
            >
              Regresar al menú principal
            </button>
          </div>
        </div>

        <div className="text-center text-gray-400">
          © {new Date().getFullYear()} El Molinito
        </div>
      </div>
    </div>
  )
}
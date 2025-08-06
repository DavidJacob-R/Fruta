import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Url } from 'next/dist/shared/lib/router/router'

export default function PreenfriadoPanel() {
  const [email, setEmail] = useState('')
  const router = useRouter()

  useEffect(() => {
    const usuario = localStorage.getItem('usuario')
    if (usuario) {
      const user = JSON.parse(usuario)
      setEmail(user.email)
    } else {
      router.push('/login')
    }
  }, [])

  const submodulos = [
    { nombre: 'Pallets', ruta: '/panel/Rutas/preenfriado/pallets' },
    { nombre: 'Recepcion', ruta: '/panel/Rutas/preenfriado/almacen' },
    { nombre: 'Gestión de Pallets', ruta: '/panel/Rutas/preenfriado/gestion_pallets' },
  ]

  const handleSubmoduloClick = (ruta: Url) => {
    router.push(ruta)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1922] via-[#172a3a] to-[#0a1922] text-white p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* Header con icono */}
        <div className="flex flex-col items-center mb-7">
          <div className="bg-teal-100 shadow-lg rounded-full w-16 h-16 flex items-center justify-center mb-2">
            <span className="text-3xl">❄️</span>
          </div>
          <h1 className="text-3xl font-bold text-teal-400 mb-2 drop-shadow">Módulo de Preenfriado</h1>
          <p className="text-gray-300 text-base">Bienvenido, <span className="font-semibold">{email}</span></p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-7 mb-12">
          {submodulos.map((modulo, idx) => (
            <div
              key={idx}
              onClick={() => handleSubmoduloClick(modulo.ruta)}
              className="cursor-pointer bg-[#1c2b3a] border border-teal-300 hover:border-teal-500 hover:shadow-teal-200/40 transition rounded-2xl p-6 shadow-md hover:shadow-lg group"
            >
              <h2 className="text-lg font-semibold text-teal-400 mb-2 group-hover:text-teal-300 transition">{modulo.nombre}</h2>
              <p className="text-sm text-gray-400 group-hover:text-gray-200 transition">Accede al módulo de <span className="lowercase">{modulo.nombre}</span>.</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push('/panel/empleado')}
            className="bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white px-7 py-3 rounded-full font-bold shadow-xl border-none transition duration-200"
          >
            Volver al Panel principal
          </button>
        </div>
      </div>
      <div className="mt-10 text-xs text-gray-400">© {new Date().getFullYear()} El Molinito</div>
    </div>
  )
}
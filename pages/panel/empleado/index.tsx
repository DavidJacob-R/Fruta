import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Url } from 'next/dist/shared/lib/router/router'

export default function EmpleadoPanel() {
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

  const handleLogout = () => {
    localStorage.removeItem('usuario')
    router.push('/')
  }

  const modulos = [
    { nombre: 'Recepción de fruta', ruta: '/panel/Rutas/recepcion' },
    { nombre: 'Control de calidad', ruta: '/panel/Rutas/control-calidad' },
    { nombre: 'Preenfriado', ruta: '/panel/Rutas/preenfriado' },
    { nombre: 'Conservación', ruta: '/panel/Rutas/conservacion' },
    { nombre: 'Carga y exportación', ruta: '/panel/Rutas/carga-exportacion' },
    { nombre: 'Control de materiales', ruta: '/panel/Rutas/control-materiales' },
    { nombre: 'Almacen cooler', ruta: '/panel/cooler' },
  ]

  const handleModuloClick = (ruta: Url) => {
    router.push(ruta)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181712] via-[#24180c] to-[#242126] text-white p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* Header con icono */}
        <div className="flex flex-col items-center mb-7">
          <div className="bg-orange-100 shadow-lg rounded-full w-16 h-16 flex items-center justify-center mb-2">
            <span className="text-3xl">🍊</span>
          </div>
          <h1 className="text-3xl font-bold text-orange-500 mb-2 drop-shadow">Panel del Empleado</h1>
          <p className="text-gray-300 text-base">Bienvenido, <span className="font-semibold">{email}</span></p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7 mb-12">
          {modulos.map((modulo, idx) => (
            <div
              key={idx}
              onClick={() => handleModuloClick(modulo.ruta)}
              className="cursor-pointer bg-[#1c1917] border border-orange-300 hover:border-orange-500 hover:shadow-orange-200/60 transition rounded-2xl p-6 shadow-md hover:shadow-lg group">
              <h2 className="text-lg font-semibold text-orange-400 mb-2 group-hover:text-orange-500 transition">{modulo.nombre}</h2>
              <p className="text-sm text-gray-400 group-hover:text-gray-200 transition">Accede al módulo de <span className="lowercase">{modulo.nombre}</span>.</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 via-orange-500 to-red-600 hover:from-red-600 hover:to-orange-600 text-white px-7 py-3 rounded-full font-bold shadow-xl border-none transition duration-200">
            Cerrar sesión
          </button>
        </div>
      </div>
      <div className="mt-10 text-xs text-gray-400">© {new Date().getFullYear()} El Molinito</div>
    </div>
  )
}

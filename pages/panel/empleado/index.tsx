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
    { nombre: 'Preenfriado', ruta: '/panel/preenfriado' }, 
    { nombre: 'Conservación', ruta: '/panel/conservacion' },
    { nombre: 'Carga y exportación', ruta: '/panel/Rutas/carga-exportacion' },
    { nombre: 'Almacen de materiales', ruta: '/panel/Rutas/almacen-materiales' },
  ]

  const handleModuloClick = (ruta: Url) => {
    router.push(ruta)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181712] via-[#24180c] to-[#242126] text-white px-2 py-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl md:max-w-4xl">
        {/* Header con icono */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-orange-100 shadow-lg rounded-full w-20 h-20 flex items-center justify-center mb-3">
            <span className="text-4xl">🍊</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-orange-500 mb-2 drop-shadow">Panel del Empleado</h1>
          <p className="text-gray-300 text-lg">Bienvenido, <span className="font-semibold">{email}</span></p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
          {modulos.map((modulo, idx) => (
            <div
              key={idx}
              onClick={() => handleModuloClick(modulo.ruta)}
              className="cursor-pointer bg-[#1c1917] border border-orange-300 hover:border-orange-500 hover:shadow-orange-200/60 transition rounded-2xl p-8 shadow-md hover:shadow-lg group active:scale-95"
              tabIndex={0}
            >
              <h2 className="text-xl font-semibold text-orange-400 mb-4 group-hover:text-orange-500 transition">{modulo.nombre}</h2>
              <p className="text-base text-gray-400 group-hover:text-gray-200 transition">Accede al módulo de <span className="lowercase">{modulo.nombre}</span>.</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 via-orange-500 to-red-600 hover:from-red-600 hover:to-orange-600 text-white px-8 py-4 rounded-full font-bold shadow-xl border-none text-lg transition duration-200 active:scale-95">
            Cerrar sesión
          </button>
        </div>
      </div>
      <div className="mt-12 text-base text-gray-400 text-center">© {new Date().getFullYear()} El Molinito</div>
    </div>
  )
}

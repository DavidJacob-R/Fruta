import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Url } from 'next/dist/shared/lib/router/router'

export default function AdminPanel() {
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
    { nombre: 'Recepción de fruta', ruta: '/panel/administradorRutas/recepcion' },
    { nombre: 'Control de calidad', ruta: '/panel/administradorRutas/control-calidad' },
    { nombre: 'Embalaje', ruta: '/panel/administradorRutas/embalaje' },
    { nombre: 'Preenfriado', ruta: '/panel/administradorRutas/preenfriado' },
    { nombre: 'Conservación', ruta: '/panel/administradorRutas/conservacion' },
    { nombre: 'Carga y exportación', ruta: '/panel/administradorRutas/carga-exportacion' },
    { nombre: 'Control de materiales', ruta: '/panel/administradorRutas/control-materiales' },
    { nombre: 'Pagos', ruta: '/panel/administradorRutas/pagos' },
    { nombre: 'Reportes', ruta: '/panel/administradorRutas/reportes' },
  ]

  const handleModuloClick = (ruta: Url) => {
    router.push(ruta)
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="bg-gray-900 rounded-2xl shadow-md p-6 mb-6 border border-orange-500">
        <h1 className="text-3xl font-bold text-orange-500 mb-2">Panel del Administrador</h1>
        <p className="text-gray-300">Bienvenido, <span className="font-semibold">{email}</span></p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {modulos.map((modulo, idx) => (
          <div
            key={idx}
            onClick={() => handleModuloClick(modulo.ruta)}
            className="bg-gray-800 hover:bg-gray-700 transition border border-gray-700 hover:border-orange-400 cursor-pointer rounded-2xl p-5 shadow-md"
          >
            <h2 className="text-lg font-semibold text-orange-400 mb-1">{modulo.nombre}</h2>
            <p className="text-sm text-gray-400">Accede al módulo de {modulo.nombre.toLowerCase()}.</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full shadow"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

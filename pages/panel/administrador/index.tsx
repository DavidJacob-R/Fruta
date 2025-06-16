import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import { Url } from 'next/dist/shared/lib/router/router'

export default function AdminPanel() {
  const [email, setEmail] = useState('')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user?.email) {
        setEmail(data.user.email)
      } else {
        router.push('/login')
      }
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Objeto con los módulos y sus rutas correspondientes
  const modulos = [
    { nombre: 'Recepcion de fruta', ruta: '/Rutas/recepcion' },
    { nombre: 'Control de calidad', ruta: '/Rutas/control-calidad' },
    { nombre: 'Embalaje', ruta: '/Rutas/embalaje' },
    { nombre: 'Preenfriado', ruta: '/Rutas/preenfriado' },
    { nombre: 'Conservacion', ruta: '/Rutas/conservacion' },
    { nombre: 'Carga y exportacion', ruta: '/Rutas/carga-exportacion' },
    { nombre: 'Control de materiales', ruta: '/Rutas/control-materiales' },
    { nombre: 'Pagos', ruta: '/Rutas/pagos' },
    { nombre: 'Reportes', ruta: '/Rutas/reportes' }
  ]

  const handleModuloClick = (ruta: Url) => {
    router.push(ruta)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-green-700 mb-2">Panel del Administrador</h1>
        <p className="text-gray-700">Bienvenido, <span className="font-semibold">{email}</span></p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {modulos.map((modulo, idx) => (
          <div
            key={idx}
            onClick={() => handleModuloClick(modulo.ruta)}
            className="bg-white rounded-2xl shadow hover:shadow-lg p-4 transition cursor-pointer border border-gray-200 hover:border-green-500"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-1">{modulo.nombre}</h2>
            <p className="text-sm text-gray-500">Accede al modulo de {modulo.nombre.toLowerCase()}.</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full shadow"
        >
          Cerrar sesion
        </button>
      </div>
    </div>
  )
}
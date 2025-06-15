import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

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

  const modulos = [
    'Recepcion de fruta',
    'Control de calidad',
    'Embalaje',
    'Preenfriado',
    'Conservacion',
    'Carga y exportacion',
    'Control de materiales',
    'Pagos',
    'Reportes'
  ]

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
            className="bg-white rounded-2xl shadow hover:shadow-lg p-4 transition cursor-pointer border border-gray-200 hover:border-green-500"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-1">{modulo}</h2>
            <p className="text-sm text-gray-500">Accede al modulo de {modulo.toLowerCase()}.</p>
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

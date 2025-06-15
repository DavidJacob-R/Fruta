import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../../lib/supabase'

export default function AdminPanel() {
  const [email, setEmail] = useState('')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (data?.user?.email) {
        setEmail(data.user.email)
      } else {
        router.push('/login') // Redirige si no hay sesión
      }
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-4 text-green-700">Panel del Administrador</h1>
      <p className="text-lg mb-2">Bienvenido, <span className="font-semibold">{email}</span></p>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Modulos del sistema:</h2>
        <ul className="list-disc ml-6 text-gray-800">
          <li>Recepcion de fruta</li>
          <li>Control de calidad</li>
          <li>Embalaje</li>
          <li>Preenfriado</li>
          <li>Conservacion</li>
          <li>Carga y exportacion</li>
          <li>Control de materiales</li>
          <li>Pagos</li>
          <li>Reportes</li>
        </ul>
      </div>

      <button
        onClick={handleLogout}
        className="mt-10 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Cerrar sesion
      </button>
    </div>
  )
}

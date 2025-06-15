'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error || !data.user) {
      setError('Correo o contraseña incorrectos')
      return
    }

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', data.user.id)
      .single()

    if (usuario?.rol === 'programador') router.push('/panel/programador')
    else if (usuario?.rol === 'administrador') router.push('/panel/administrador')
    else if (usuario?.rol === 'empleado') router.push('/panel/empleado')
    else setError('Rol no válido.')
  }

  return (
    <div className="max-w-sm mx-auto mt-20 p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Iniciar sesión</h2>

      <input
        type="email"
        placeholder="Correo"
        className="w-full p-2 mb-4 border rounded"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Contraseña"
        className="w-full p-2 mb-4 border rounded"
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <button
        onClick={handleLogin}
        className="w-full bg-blue-600 text-white p-2 rounded"
      >
        Iniciar sesión
      </button>
    </div>
  )
}

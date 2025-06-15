'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState('empleado')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    setError('')
    setLoading(true)

    // Crear usuario en Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError || !data.user) {
      setError('Error al crear el usuario.')
      setLoading(false)
      return
    }

    // Guardar en tabla "usuarios"
    const { error: insertError } = await supabase.from('usuarios').insert({
      id: data.user.id,
      email,
      rol
    })

    if (insertError) {
      setError('Error al guardar el rol del usuario.')
      setLoading(false)
      return
    }

    alert('Usuario registrado correctamente')
    router.push('/login')
  }

  return (
    <div className="max-w-sm mx-auto mt-20 p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Registro de usuario</h2>

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

      <select
        className="w-full p-2 mb-4 border rounded"
        onChange={(e) => setRol(e.target.value)}
        value={rol}
      >
        <option value="programador">Programador</option>
        <option value="administrador">Administrador</option>
        <option value="empleado">Empleado</option>
      </select>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <button
        className="w-full bg-green-600 text-white p-2 rounded"
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? 'Registrando...' : 'Registrarse'}
      </button>
    </div>
  )
}

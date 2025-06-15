'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

// 👇 Crea el cliente de Supabase
const supabase = createClient(
  'https://zgzcxuwelzuluazleeua.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnemN4dXdlbHp1bHVhemxlZXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MzU5MjEsImV4cCI6MjA2NTUxMTkyMX0.PcgbzmmbPn319t92DdWHjFLRJkFcR13uFoJ16rCrMGY'
)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async () => {
    setLoading(true)
    setErrorMsg('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setErrorMsg('Credenciales incorrectas.')
      setLoading(false)
      return
    }

    // Consultar el rol en la tabla 'usuarios'
    const { data: usuario, error: rolError } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', data.user.id)
      .single()

    if (rolError || !usuario) {
      setErrorMsg('No se pudo obtener el rol del usuario.')
      setLoading(false)
      return
    }

    const rol = usuario.rol

    if (rol === 'programador') router.push('/panel/programador')
    else if (rol === 'administrador') router.push('/panel/administrador')
    else if (rol === 'empleado') router.push('/panel/empleado')
    else setErrorMsg('Rol no reconocido.')

    setLoading(false)
  }

  return (
    <div className="max-w-sm mx-auto mt-20 p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Iniciar sesión</h2>

      <input
        type="email"
        placeholder="Correo electrónico"
        className="w-full p-2 mb-4 border rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Contraseña"
        className="w-full p-2 mb-4 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {errorMsg && <p className="text-red-500 mb-2">{errorMsg}</p>}

      <button
        onClick={handleLogin}
        className="w-full bg-blue-600 text-white p-2 rounded"
        disabled={loading}
      >
        {loading ? 'Ingresando...' : 'Iniciar sesión'}
      </button>
    </div>
  )
}

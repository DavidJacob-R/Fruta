import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (loginError) {
      setError('Credenciales incorrectas')
      return
    }

const userEmail = data.user?.email

if (!userEmail) {
  setError('No se pudo identificar el correo del usuario')
  return
}

const { data: perfil, error: perfilError } = await supabase
  .from('usuarios')
  .select('rol')
  .eq('email', userEmail)
  .single()


    if (perfilError || !perfil) {
      setError('No se pudo obtener el rol del usuario')
      return
    }

    const rol = perfil.rol

    if (rol === 'programador') router.push('/panel/programador')
    else if (rol === 'administrador') router.push('/panel/administrador')
    else if (rol === 'empleado') router.push('/panel/empleado')
    else setError('Rol no válido')
  }

  return (
    <div className="flex min-h-screen justify-center items-center bg-orange-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-lg w-96 border border-orange-200 animate-fade-in-up"
      >
        <h2 className="text-3xl font-semibold text-orange-600 mb-6 text-center">Iniciar Sesion</h2>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-orange-300 p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-orange-300 p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
        />
        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-3 rounded hover:bg-orange-600 transition duration-300 transform hover:scale-105"
        >
          Entrar
        </button>
      </form>
    </div>
  )
}

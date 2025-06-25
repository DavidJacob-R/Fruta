import { useState } from 'react'
import { useRouter } from 'next/router'
import { usuarios, roles } from '../lib/schema' // Ajusta el path si está en otra carpeta

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const result = await res.json()

      if (!result.success) {
        setError(result.error || 'Credenciales incorrectas')
        return
      }

      localStorage.setItem('usuario', JSON.stringify(result.usuario))

      const rol = result.usuario?.rol_id
      if (rol === 1) router.push('/panel/administrador')
      else if (rol === 2) router.push('/panel/programador')
      else if (rol === 3) router.push('/panel/empleado')
      else setError('Rol no válido')
    } catch (err) {
      console.error('Error en login:', err)
      setError('Error al conectar con el servidor')
    }
  }

  return (
    <div className="flex min-h-screen justify-center items-center bg-black">
      <form
        onSubmit={handleLogin}
        className="bg-gray-900 text-white p-8 rounded-2xl shadow-lg w-96 border border-orange-500"
      >
        <h2 className="text-3xl font-semibold text-orange-500 mb-6 text-center">Iniciar Sesión</h2>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-black text-white border border-orange-300 p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-black text-white border border-orange-300 p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
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
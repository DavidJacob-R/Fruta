import { useState } from 'react'
import { useRouter } from 'next/router'

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#201c1b] via-[#34160e] to-[#f6f2ee]">
      <div className="bg-black/80 backdrop-blur rounded-3xl shadow-2xl border border-orange-500 px-10 py-12 w-full max-w-md">
        {/* Logo o emoji del sistema */}
        <div className="flex justify-center mb-7">
          <div className="w-16 h-16 flex items-center justify-center bg-orange-200 rounded-full shadow">
            <span className="text-4xl">🍊</span>
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-orange-500 mb-8 text-center tracking-tight">
          Iniciar Sesión
        </h2>
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 text-center rounded-lg py-2 mb-5 text-sm font-medium">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-[#181414] text-white border border-orange-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg placeholder:text-orange-200/60"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-[#181414] text-white border border-orange-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg placeholder:text-orange-200/60"
            required
          />
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold shadow-lg text-lg transition duration-200 transform hover:scale-105"
          >
            Entrar
          </button>
        </form>
        <div className="mt-6 text-center text-gray-400 text-xs">
          © {new Date().getFullYear()} El Molinito. Todos los derechos reservados.
        </div>
      </div>
    </div>
  )
}

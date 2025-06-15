import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-orange-50 transition-all duration-500">
      <h1 className="text-4xl font-bold text-orange-600 mb-8 animate-fade-in">
        Bienvenido a El Molinito
      </h1>
      <button
        onClick={() => router.push('/login')}
        className="bg-orange-500 text-white px-6 py-3 rounded-xl shadow-md hover:bg-orange-600 transition-all duration-300 transform hover:scale-105"
      >
        Iniciar sesión
      </button>
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center p-10">
        <h1 className="text-4xl font-bold text-orange-500 mb-4">Bienvenido a El Molinito</h1>
        <p className="text-lg text-gray-300 mb-6">
          Sistema de logística y control para frutas.
        </p>
        <a
          href="/login"
          className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-full shadow-md transition transform hover:scale-105"
        >
          Iniciar sesión
        </a>
      </div>
    </div>
  )
}
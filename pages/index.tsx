export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#201c1b] via-[#3a1e09] to-[#f6f2ee]">
      <div className="bg-black/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-orange-600 px-10 py-14 max-w-lg w-full flex flex-col items-center">
        {/* Puedes reemplazar el emoji por tu logo */}
        <div className="w-20 h-20 mb-5 flex items-center justify-center rounded-full bg-orange-100 shadow-lg">
          <span className="text-5xl">🍊</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-orange-500 mb-4 tracking-tight drop-shadow-lg">
          Bienvenido a El Molinito
        </h1>
        <p className="text-lg sm:text-xl text-gray-200 mb-8 font-medium">
          Sistema de logística y control para frutas frescas.
        </p>
        <a href="/login"
          className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-8 rounded-full text-lg font-semibold shadow-lg transition transform hover:scale-105">
          Iniciar sesión
        </a>
      </div>
    </div>
  )
}

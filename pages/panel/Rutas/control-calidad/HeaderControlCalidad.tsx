interface Props {
  email: string
  onReload: () => void
  onBack: () => void
  mensaje: string
}

export default function HeaderControlCalidad({ email, onReload, onBack, mensaje }: Props) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center mb-10">
        <div className="bg-[#27ae60]/20 shadow-lg rounded-full w-24 h-24 flex items-center justify-center mb-4">
          <span className="text-5xl">🛡️</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#27ae60] mb-2 drop-shadow text-center">Control de Calidad</h1>
        <p className="text-gray-200 text-lg sm:text-xl text-center">
          Bienvenido, <span className="font-semibold">{email}</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <button
          onClick={onReload}
          className="bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold px-10 py-5 rounded-3xl shadow-xl text-lg sm:text-xl"
        >
          🔄 Recargar
        </button>
        <button
          onClick={onBack}
          className="bg-gradient-to-r from-[#4fa3ff] via-[#3566b2] to-[#23272a] hover:from-[#3566b2] hover:to-[#2c2f33] text-white font-bold px-10 py-5 rounded-3xl shadow-xl text-lg sm:text-xl"
        >
          Volver al Panel principal
        </button>
      </div>

      {mensaje && (
        <div
          className={`mb-8 text-center px-6 py-5 rounded-3xl font-bold text-lg sm:text-xl text-white ${
            mensaje.includes("correctamente") ? "bg-[#27ae60]" : "bg-[#e74c3c]"
          }`}
        >
          {mensaje}
        </div>
      )}
    </div>
  )
}

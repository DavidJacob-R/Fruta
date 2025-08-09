interface Props {
  email: string
  onReload: () => void
  onBack: () => void
  mensaje: string
}

export default function HeaderControlCalidad({ email, onReload, onBack, mensaje }: Props) {
  return (
    <div className="flex flex-col items-center mb-10">
      <div className="bg-orange-100 shadow-lg rounded-full w-20 h-20 flex items-center justify-center mb-3">
        <span className="text-4xl">🛡️</span>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-orange-400 mb-2 drop-shadow">Control de Calidad</h1>
      <p className="text-gray-300">Bienvenido, <span className="font-semibold">{email}</span></p>

      <div className="flex gap-4 mt-6">
        <button
          onClick={onReload}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full font-medium shadow hover:shadow-lg transition"
        >
          🔄 Recargar
        </button>
        <button
          onClick={onBack}
          className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-full font-medium shadow hover:shadow-lg transition"
        >
          Volver al Panel
        </button>
      </div>

      {mensaje && (
        <div className={`mt-4 p-3 rounded-lg ${mensaje.includes("✅") ? "bg-green-600" : "bg-red-600"} text-white`}>
          {mensaje}
        </div>
      )}
    </div>
  );
}
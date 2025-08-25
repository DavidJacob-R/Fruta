interface Props {
  email: string
  onReload: () => void
  onBack: () => void
  mensaje: string
}

export default function HeaderControlCalidad({
  email = "",
  onReload = () => {},
  onBack = () => {},
  mensaje = ""
}: Props) {
  return (
    <header className="w-full">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-800 bg-neutral-900/80 text-neutral-100 hover:bg-neutral-800 transition"
        >
          <span className="text-lg -ml-1">←</span>
          <span>Regresar</span>
        </button>

        <div className="flex items-center gap-3 select-none">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow">
            <span className="text-neutral-200 text-lg">🛡️</span>
          </div>
          <div className="text-right">
            <h1 className="text-lg sm:text-xl font-semibold text-neutral-100 leading-tight">
              Control de calidad
            </h1>
            <p className="text-xs text-neutral-400">Sesión: <span className="text-neutral-200">{email || "—"}</span></p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <nav className="text-sm text-neutral-400">
          <span className="hover:text-neutral-200">Panel</span>
          <span className="mx-2 text-neutral-600">/</span>
          <span className="text-neutral-200 font-medium">Control de calidad</span>
        </nav>
        <button
          onClick={onReload}
          className="px-4 py-2 rounded-xl border border-neutral-800 text-neutral-100 hover:bg-neutral-800"
        >
          Recargar
        </button>
      </div>

      {mensaje && (
        <div
          className={`mt-4 text-center px-4 py-3 rounded-xl text-sm ${
            mensaje.includes("correctamente")
              ? "bg-emerald-600/20 text-emerald-300 border border-emerald-700/40"
              : "bg-red-600/20 text-red-300 border border-red-700/40"
          }`}
        >
          {mensaje}
        </div>
      )}
    </header>
  )
}

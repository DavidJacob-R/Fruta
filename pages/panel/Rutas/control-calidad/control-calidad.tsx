import { useEffect, useMemo, useState, type FormEvent } from "react"
import { useRouter } from "next/router"

// -----------------------------
// Tipos locales (todo en 1 file)
// -----------------------------
type Pedido = {
  id: number
  numero_nota?: number | null
  empresa_nombre?: string | null
  agricultor_nombre?: string | null
  agricultor_apellido?: string | null
  fruta_nombre?: string | null
  empaque_nombre?: string | null
  cantidad_cajas: number
  fecha_recepcion?: string | null
}

type Motivo = { id: number; nombre: string }

// -----------------------------
// Subcomponentes internos
// -----------------------------
function HeaderControlCalidad(props: {
  email: string
  onReload: () => void
  onBack: () => void
  mensaje: string
}) {
  const { email, onReload, onBack, mensaje } = props
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

function ListaPedidos(props: {
  pedidos?: Pedido[]
  onSelect: (pedido: Pedido) => void
}) {
  const { pedidos = [], onSelect } = props
  const [q, setQ] = useState("")

  const filtrados = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return pedidos
    return pedidos.filter(p =>
      `${p?.numero_nota ?? ""} ${p?.empresa_nombre ?? ""} ${p?.fruta_nombre ?? ""} ${p?.empaque_nombre ?? ""} ${p?.cantidad_cajas ?? ""}`
        .toLowerCase()
        .includes(s)
    )
  }, [pedidos, q])

  function fmtFecha(fecha?: string | Date | null) {
    if (!fecha) return "—"
    const d = new Date(fecha)
    if (Number.isNaN(d.getTime())) return "—"
    return d.toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "2-digit" })
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div className="relative flex-1">
          <input
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            placeholder="Buscar por nota, empresa, fruta…"
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder-neutral-500 outline-none focus:ring-2 focus:ring-white/10"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">🔍</div>
          {q && (
            <button
              onClick={()=>setQ("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
            >
              Limpiar
            </button>
          )}
        </div>
        <span className="px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-900/70 text-neutral-300 text-sm">
          {filtrados.length} pendiente{filtrados.length===1 ? "" : "s"}
        </span>
      </div>

      {/* Móvil: tarjetas táctiles */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filtrados.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center text-neutral-400">
            No hay pedidos pendientes
          </div>
        ) : (
          filtrados.map((p, idx) => {
            const tieneNota = Number.isFinite(p?.numero_nota) && (p?.numero_nota as number) > 0
            const titulo = tieneNota ? `Nota #${p.numero_nota}` : `Recepción #${p?.id ?? "-"}`

            return (
              <button
                key={`${p?.id ?? "k"}-${idx}`}
                onClick={() => onSelect(p)}
                className="text-left rounded-2xl border border-neutral-800 bg-neutral-900 p-4 active:scale-[0.99] transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-medium text-neutral-100 truncate">{titulo}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-neutral-800 text-neutral-300 border border-neutral-700">
                        Pendiente
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-neutral-400 truncate">
                      {[p?.empresa_nombre, `${p?.agricultor_nombre ?? ""} ${p?.agricultor_apellido ?? ""}`.trim()]
                        .filter(Boolean).join(" • ") || "Sin datos"}
                    </p>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-950 px-2 py-1 text-xs text-neutral-300">
                    Ver detalle →
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wide text-neutral-500">Fruta</div>
                    <div className="text-sm text-neutral-100 truncate">{p?.fruta_nombre ?? "—"}</div>
                  </div>
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wide text-neutral-500">Empaque</div>
                    <div className="text-sm text-neutral-100 truncate">{p?.empaque_nombre ?? "—"}</div>
                  </div>
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wide text-neutral-500">Cajas</div>
                    <div className="text-sm text-neutral-100">{p?.cantidad_cajas ?? "—"}</div>
                  </div>
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wide text-neutral-500">Fecha</div>
                    <div className="text-sm text-neutral-100">{fmtFecha(p?.fecha_recepcion as any)}</div>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* Tablet/desktop: lista compacta */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
        {filtrados.length === 0 ? (
          <div className="p-10 text-center text-neutral-400">No hay pedidos pendientes</div>
        ) : (
          <ul className="divide-y divide-neutral-800">
            {filtrados.map((p, idx) => {
              const tieneNota = Number.isFinite(p?.numero_nota) && (p?.numero_nota as number) > 0
              const titulo = tieneNota ? `Nota #${p.numero_nota}` : `Recepción #${p?.id ?? "-"}`

              return (
                <li key={`${p?.id ?? "k"}-${idx}`}>
                  <button
                    type="button"
                    onClick={() => onSelect(p)}
                    className="group w-full text-left focus:outline-none"
                  >
                    <div className="p-5 sm:p-6 transition ease-out hover:bg-neutral-800/40">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="text-base sm:text-lg font-medium text-neutral-100 truncate">{titulo}</h3>
                            <span className="px-2 py-0.5 rounded-full text-xs bg-neutral-800 text-neutral-300 border border-neutral-700">
                              Pendiente
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-neutral-400 truncate">
                            {[p?.empresa_nombre, `${p?.agricultor_nombre ?? ""} ${p?.agricultor_apellido ?? ""}`.trim()]
                              .filter(Boolean).join(" • ") || "Sin datos"}
                          </p>
                        </div>
                        <div className="shrink-0">
                          <span className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-300 group-hover:border-neutral-700">
                            Ver detalle
                            <span className="translate-x-0 group-hover:translate-x-0.5 transition">→</span>
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="text-sm text-neutral-300"><span className="text-neutral-400">Fruta:</span> {p?.fruta_nombre ?? "—"}</div>
                        <div className="text-sm text-neutral-300"><span className="text-neutral-400">Empaque:</span> {p?.empaque_nombre ?? "—"}</div>
                        <div className="text-sm text-neutral-300"><span className="text-neutral-400">Cajas:</span> {p?.cantidad_cajas ?? "—"}</div>
                        <div className="text-sm text-neutral-300"><span className="text-neutral-400">Fecha:</span> {fmtFecha(p?.fecha_recepcion as any)}</div>
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6">
      <h2 className="text-base sm:text-lg font-semibold text-neutral-100 mb-3">Detalle del pedido</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">Empresa</div>
          <div className="text-neutral-100 truncate">{pedido.empresa_nombre ?? "—"}</div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">Agricultor</div>
          <div className="text-neutral-100 truncate">
            {`${pedido.agricultor_nombre ?? ""} ${pedido.agricultor_apellido ?? ""}`.trim() || "—"}
          </div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">Fruta</div>
          <div className="text-neutral-100 truncate">{pedido.fruta_nombre ?? "—"}</div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">Empaque</div>
          <div className="text-neutral-100 truncate">{pedido.empaque_nombre ?? "—"}</div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">Cajas iniciales</div>
          <div className="text-neutral-100">{pedido.cantidad_cajas}</div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">Nota / Recepción</div>
          <div className="text-neutral-100">
            {Number.isFinite(pedido.numero_nota) && (pedido.numero_nota as number) > 0 ? `#${pedido.numero_nota}` : `#${pedido.id}`}
          </div>
        </div>
      </div>
    </div>
  )
}

function FormularioCalidad(props: {
  pedido: Pedido
  motivos: Motivo[]
  rechazos: number
  setRechazos: (n: number) => void
  cajasFinales: number
  selectedMotivos: number[]
  toggleMotivo: (id: number) => void
  comentarios: string
  setComentarios: (v: string) => void
  onVolver: () => void
  onSubmit: (e: React.FormEvent) => void
}) {
  const {
    pedido, motivos, rechazos, setRechazos,
    cajasFinales, selectedMotivos, toggleMotivo,
    comentarios, setComentarios, onVolver, onSubmit
  } = props
  const maxPermitido = pedido?.cantidad_cajas ?? 0

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6">
      <h2 className="text-base sm:text-lg font-semibold text-neutral-100">Registrar control</h2>
      <p className="text-xs text-neutral-400 mt-1">Indica cuántas cajas se rechazan y selecciona uno o varios motivos.</p>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
          <label className="block text-sm text-neutral-300 mb-2">Cajas rechazadas</label>
          <input
            type="number"
            min={0}
            max={maxPermitido}
            value={rechazos}
            onChange={(e) => {
              const v = Math.max(0, Math.min(Number(e.target.value || 0), maxPermitido))
              setRechazos(v)
            }}
            className="w-full px-3 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-100 outline-none focus:ring-2 focus:ring-white/10"
            placeholder="0"
            required
          />
          <p className="mt-2 text-xs text-neutral-500">Máximo {maxPermitido}.</p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">Cajas finales</div>
          <div className="mt-1 text-2xl text-neutral-100">{cajasFinales}</div>
          <p className="mt-2 text-xs text-neutral-500">Se calcula automáticamente.</p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">Recibidas</div>
          <div className="mt-1 text-2xl text-neutral-100">{maxPermitido}</div>
          <p className="mt-2 text-xs text-neutral-500">Según la recepción.</p>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium text-neutral-200 mb-2">Motivos de rechazo</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {motivos.map((m) => {
            const activo = selectedMotivos.includes(m.id)
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleMotivo(m.id)}
                className={`px-3 py-2 rounded-xl border text-sm ${
                  activo
                    ? "bg-white text-black border-neutral-200"
                    : "bg-neutral-900 text-neutral-100 border-neutral-800 hover:bg-neutral-800"
                }`}
                aria-pressed={activo}
              >
                {m.nombre}
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          Puedes seleccionar varios. Si hay rechazos, al menos un motivo debe estar seleccionado.
        </p>
      </div>

      <div className="mt-4">
        <label className="block text-sm text-neutral-300 mb-2">Comentarios</label>
        <textarea
          value={comentarios}
          onChange={(e) => setComentarios(e.target.value)}
          rows={3}
          className="w-full px-3 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-100 outline-none focus:ring-2 focus:ring-white/10"
          placeholder="Observaciones generales…"
        />
      </div>

      <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={onVolver}
          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-neutral-700 text-neutral-100 hover:bg-neutral-800"
        >
          ← Volver
        </button>
        <button
          type="submit"
          disabled={rechazos < 0 || rechazos > maxPermitido || (rechazos > 0 && selectedMotivos.length === 0)}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold shadow ${
            rechazos < 0 || rechazos > maxPermitido || (rechazos > 0 && selectedMotivos.length === 0)
              ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
              : "bg-white text-black hover:bg-neutral-200"
          }`}
        >
          Guardar y generar ticket
        </button>
      </div>

      <div className="mt-3 text-center text-[11px] text-neutral-500">
        El backend recibirá los motivos seleccionados sin cantidades específicas.
      </div>
    </form>
  )
}

// -----------------------------
// Página (default export)
// -----------------------------
export default function ControlCalidadPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [motivos, setMotivos] = useState<Motivo[]>([])
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)
  const [mensaje, setMensaje] = useState<string>("")
  const [email, setEmail] = useState<string>("")

  // Form actual: número de rechazos + multi-motivo + comentarios
  const [rechazos, setRechazos] = useState<number>(0)
  const [comentarios, setComentarios] = useState<string>("")
  const [selectedMotivos, setSelectedMotivos] = useState<number[]>([])

  async function cargarDatos() {
    setMensaje("")
    try {
      const [pedidosRes, motivosRes] = await Promise.all([
        fetch("/api/control_calidad/listar"),
        fetch("/api/control_calidad/motivos"),
      ])
      const pedidosData = await pedidosRes.json()
      const motivosData = await motivosRes.json()
      setPedidos(Array.isArray(pedidosData) ? pedidosData : (pedidosData.pedidos || []))
      setMotivos(Array.isArray(motivosData) ? motivosData : (motivosData.motivos || []))
    } catch {
      setMensaje("Error al cargar pedidos o motivos")
    }
  }

  useEffect(() => {
    const usuario = typeof window !== "undefined" ? localStorage.getItem("usuario") : null
    if (usuario) {
      try {
        const user = JSON.parse(usuario)
        setEmail(user.email || "")
      } catch {}
    }
    cargarDatos()
  }, [])

  function handleSelectPedido(pedido: Pedido) {
    setSelectedPedido(pedido)
    setRechazos(0)
    setComentarios("")
    setSelectedMotivos([])
    setStep(2)
    setMensaje("")
  }

  const cajasFinales = useMemo(() => {
    if (!selectedPedido) return 0
    return Math.max(0, (selectedPedido.cantidad_cajas || 0) - (rechazos || 0))
  }, [selectedPedido, rechazos])

  function toggleMotivo(id: number) {
    setSelectedMotivos(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selectedPedido) return

    if ((rechazos || 0) < 0) {
      setMensaje("Los rechazos no pueden ser negativos.")
      return
    }
    if (rechazos > (selectedPedido.cantidad_cajas || 0)) {
      setMensaje("Los rechazos no pueden superar la cantidad total.")
      return
    }
    if (rechazos > 0 && selectedMotivos.length === 0) {
      setMensaje("Selecciona al menos un motivo de rechazo.")
      return
    }
    if (rechazos === 0 && selectedMotivos.length > 0) {
      setMensaje("Define cantidad de cajas rechazadas mayor a 0.")
      return
    }

    try {
      const usuario = JSON.parse(localStorage.getItem("usuario") || "{}")
      const payload = {
        recepcion_id: selectedPedido.id,
        usuario_control_id: usuario.id,
        cajas_aprobadas: cajasFinales,
        cajas_rechazadas: rechazos,
        notas: comentarios,
        motivos: selectedMotivos.map(mID => ({ motivo_id: mID, cantidad_cajas: 0 }))
      }

      const res = await fetch("/api/control_calidad/guardar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await res.json()

      if (result?.success) {
        setMensaje("Control de calidad registrado correctamente")
        setTimeout(() => {
          setStep(1)
          setSelectedPedido(null)
          setSelectedMotivos([])
          setRechazos(0)
          setComentarios("")
          cargarDatos()
        }, 900)
      } else {
        setMensaje("Error al guardar: " + (result?.message || ""))
      }
    } catch {
      setMensaje("Error al registrar el control de calidad")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-925 to-neutral-950 text-white">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <HeaderControlCalidad
          email={email}
          onReload={cargarDatos}
          onBack={() => router.push("/panel/empleado")}
          mensaje={mensaje}
        />

        {step === 1 && (
          <section className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 sm:p-6">
            <ListaPedidos pedidos={pedidos} onSelect={handleSelectPedido} />
          </section>
        )}

        {step === 2 && selectedPedido && (
          <section className="mt-4 space-y-4">
            <PedidoDetalle pedido={selectedPedido} />
            <FormularioCalidad
              pedido={selectedPedido}
              motivos={motivos}
              rechazos={rechazos}
              setRechazos={setRechazos}
              cajasFinales={cajasFinales}
              selectedMotivos={selectedMotivos}
              toggleMotivo={toggleMotivo}
              comentarios={comentarios}
              setComentarios={setComentarios}
              onVolver={() => setStep(1)}
              onSubmit={handleSubmit}
            />
          </section>
        )}
      </main>

      <footer className="w-full text-center py-5 text-sm text-neutral-500">
        © {new Date().getFullYear()} El Molinito – Control de calidad
      </footer>
    </div>
  )
}

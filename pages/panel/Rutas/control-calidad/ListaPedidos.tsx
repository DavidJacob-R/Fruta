import { useMemo, useState } from "react"
import { Pedido } from "../../../api/control_calidad/types"

interface Props {
  pedidos?: Pedido[]
  onSelect: (pedido: Pedido) => void
}

function fmtFecha(fecha?: string | Date | null) {
  if (!fecha) return "—"
  const d = new Date(fecha)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "2-digit" })
}

export default function ListaPedidos({ pedidos = [], onSelect }: Props) {
  const [q, setQ] = useState("")
  const list = Array.isArray(pedidos) ? pedidos : []

  const filtrados = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return list
    return list.filter(p =>
      `${p?.numero_nota ?? ""} ${p?.empresa_nombre ?? ""} ${p?.fruta_nombre ?? ""} ${p?.empaque_nombre ?? ""} ${p?.cantidad_cajas ?? ""}`
        .toLowerCase()
        .includes(s)
    )
  }, [list, q])

  return (
    <div className="w-full">
      {/* Buscador + métrica */}
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

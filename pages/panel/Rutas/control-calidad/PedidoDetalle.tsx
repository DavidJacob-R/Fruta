import { Pedido } from '../../../api/control_calidad/types'

interface Props {
  pedido: Pedido
}

export default function PedidoDetalle({ pedido }: Props) {
  if (!pedido) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center text-red-300">
        No se encontró información del pedido.
      </div>
    )
  }

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
          <div className="text-neutral-100 truncate">{`${pedido.agricultor_nombre ?? ""} ${pedido.agricultor_apellido ?? ""}`.trim() || "—"}</div>
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
          <div className="text-neutral-100">{Number.isFinite(pedido.numero_nota) && (pedido.numero_nota as number) > 0 ? `#${pedido.numero_nota}` : `#${pedido.id}`}</div>
        </div>
      </div>
    </div>
  )
}

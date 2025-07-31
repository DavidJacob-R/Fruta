import { Pedido } from './types'

interface Props {
  pedido: Pedido
}

export default function PedidoDetalle({ pedido }: Props) {
  return (
    <div className="bg-[#23272a] border-2 border-[#2ecc71] rounded-3xl p-6 sm:p-8 mb-10 shadow-lg max-w-5xl mx-auto">
      <div className="flex flex-wrap gap-6 justify-between text-base sm:text-lg">
        <div><span className="text-[#2ecc71] font-bold">EMPRESA:</span> {pedido.empresa_nombre ?? "-"}</div>
        <div><span className="text-[#2ecc71] font-bold">AGRICULTOR:</span> {(pedido.agricultor_nombre || "") + " " + (pedido.agricultor_apellido || "")}</div>
        <div><span className="text-[#2ecc71] font-bold">FRUTA:</span> {pedido.fruta_nombre ?? "-"}</div>
        <div><span className="text-[#2ecc71] font-bold">EMPAQUE:</span> {pedido.empaque_nombre ?? "-"}</div>
        <div><span className="text-[#2ecc71] font-bold">CANTIDAD INICIAL:</span> {pedido.cantidad_cajas}</div>
      </div>
    </div>
  )
}

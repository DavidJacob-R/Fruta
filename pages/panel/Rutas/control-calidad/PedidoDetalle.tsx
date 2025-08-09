import { Pedido } from '../../../api/control_calidad/types'

interface Props {
  pedido: Pedido
}

export default function PedidoDetalle({ pedido }: Props) {
  if (!pedido) {
    return (
      <div className="bg-[#1c1917] border border-orange-300 rounded-2xl p-6 text-center text-orange-400">
        No se encontró información del pedido
      </div>
    );
  }

  return (
    <div className="bg-[#1c1917] border border-orange-300 rounded-2xl p-6 shadow-md">
      <h3 className="text-xl font-semibold text-orange-400 mb-4">Detalles del Pedido</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><span className="text-orange-300 font-medium">EMPRESA:</span> {pedido.empresa_nombre || "-"}</div>
        <div><span className="text-orange-300 font-medium">AGRICULTOR:</span> {pedido.agricultor_nombre || "-"} {pedido.agricultor_apellido || ""}</div>
        <div><span className="text-orange-300 font-medium">FRUTA:</span> {pedido.fruta_nombre || "-"}</div>
        <div><span className="text-orange-300 font-medium">EMPAQUE:</span> {pedido.empaque_nombre || "-"}</div>
        <div><span className="text-orange-300 font-medium">CANTIDAD INICIAL:</span> {pedido.cantidad_cajas}</div>
      </div>
      </div>
  );
}

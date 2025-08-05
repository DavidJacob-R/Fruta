import { Pedido } from "../../../api/control_calidad/types";

interface Props {
  pedidos: Pedido[];
  onSelect: (pedido: Pedido) => void;
}

export default function ListaPedidos({ pedidos, onSelect }: Props) {
  if (!pedidos.length) {
    return (
      <div className="p-6 text-center text-gray-400">
        No hay pedidos pendientes de control de calidad.
      </div>
    );
  }
  return (
    <div className="divide-y divide-[#2ecc71]/30">
      {pedidos.map((pedido) => (
        <div key={pedido.id} className="py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <div className="text-lg font-bold text-[#2ecc71]">
              Nota #{pedido.numero_nota} – {pedido.empresa_nombre}
            </div>
            <div className="text-sm text-gray-300">
              {pedido.fruta_nombre} / {pedido.cantidad_cajas} cajas
            </div>
          </div>
          <button
            onClick={() => onSelect(pedido)}
            className="bg-gradient-to-r from-[#2ecc71] to-[#27ae60] hover:from-[#27ae60] hover:to-[#2ecc71] text-white font-bold px-8 py-3 rounded-2xl shadow transition active:scale-95"
          >
            Seleccionar
          </button>
        </div>
      ))}
    </div>
  );
}

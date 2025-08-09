import { Pedido } from "../../../api/control_calidad/types";

interface Props {
  pedidos?: Pedido[];
  onSelect: (pedido: Pedido) => void;
}

export default function ListaPedidos({ pedidos = [], onSelect }: Props) {
  if (!Array.isArray(pedidos)) {
    return <div className="text-orange-300 text-center">Cargando...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-orange-400 mb-4">Pedidos Pendientes</h2>
      
      {pedidos.length === 0 ? (
        <p className="text-orange-300 text-center">No hay pedidos pendientes</p>
      ) : (
        pedidos.map((pedido) => (
          <div 
            key={pedido.id}
            onClick={() => onSelect(pedido)}
            className="bg-[#242126] border border-orange-300 rounded-xl p-4 cursor-pointer hover:border-orange-500 transition"
          >
            <h3 className="text-orange-400 font-semibold">Nota: {pedido.numero_nota}</h3>
            <p className="text-gray-300">{pedido.empresa_nombre}</p>
            <p className="text-gray-400 text-sm mt-1">
              {pedido.fruta_nombre} • {pedido.cantidad_cajas} cajas
            </p>
          </div>
        ))
      )}
    </div>
  );
}
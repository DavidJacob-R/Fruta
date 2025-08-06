import { Pedido } from "../../../api/control_calidad/types";

interface Props {
  pedidos?: Pedido[];
  onSelect: (pedido: Pedido) => void;
}

export default function ListaPedidos({ pedidos = [], onSelect }: Props) {
  if (!Array.isArray(pedidos) || pedidos.length === 0) {
    return <div>No hay pedidos</div>;
  }
  return (
    <div>
      {pedidos.map((pedido) => (
        <div key={pedido.id}>
          <div>
            Nota: {pedido.numero_nota} – {pedido.empresa_nombre}
          </div>
          <button onClick={() => onSelect(pedido)}>Seleccionar</button>
        </div>
      ))}
    </div>
  );
}

import { Pedido } from "../../../api/control_calidad/types";

interface Props {
  pedidos: Pedido[];
  onSelect: (pedido: Pedido) => void;
}

export default function ListaPedidos({ pedidos, onSelect }: Props) {
  if (!pedidos.length) {
    return <div className="p-6 text-center text-gray-400">No hay pedidos pendientes.</div>;
  }
  return (
    <div>
      {pedidos.map((pedido) => (
        <div key={pedido.id} style={{ borderBottom: "1px solid #444", marginBottom: 8, paddingBottom: 8 }}>
          <div>
            <span style={{ fontWeight: "bold" }}>Nota:</span> #{pedido.numero_nota} &nbsp; 
            <span style={{ color: "#2ecc71" }}>{pedido.empresa_nombre}</span>
          </div>
          <div>
            {pedido.fruta_nombre} / {pedido.cantidad_cajas} cajas
          </div>
          <button
            style={{
              background: "#27ae60",
              color: "#fff",
              padding: "8px 16px",
              border: "none",
              borderRadius: 8,
              marginTop: 4,
              cursor: "pointer",
              fontWeight: "bold"
            }}
            onClick={() => onSelect(pedido)}
          >
            Seleccionar
          </button>
        </div>
      ))}
    </div>
  );
}

import { useState } from "react";

type Pedido = {
  id: number;
  numero: string;
  empresa: string;
  fruta: string;
  cantidad: number;
};

const pedidosFake: Pedido[] = [
  { id: 1, numero: "A-100", empresa: "El Molinito", fruta: "Fresa", cantidad: 10 },
  { id: 2, numero: "B-200", empresa: "Healthy Harvest", fruta: "Mora", cantidad: 15 },
  { id: 3, numero: "C-300", empresa: "FrutaMex", fruta: "Arándano", cantidad: 8 },
];

export default function PruebaPedidos() {
  const [selected, setSelected] = useState<Pedido | null>(null);

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", background: "#23272a", color: "#fff", padding: 32, borderRadius: 18 }}>
      <h2 style={{ fontSize: 28, fontWeight: "bold", color: "#2ecc71", marginBottom: 30 }}>Lista de Pedidos</h2>

      {!selected ? (
        <ul>
          {pedidosFake.map((p) => (
            <li key={p.id} style={{ marginBottom: 22, padding: 14, border: "1px solid #444", borderRadius: 10 }}>
              <div><b>Nota:</b> {p.numero}</div>
              <div><b>Empresa:</b> {p.empresa}</div>
              <div><b>Fruta:</b> {p.fruta}</div>
              <div><b>Cantidad:</b> {p.cantidad}</div>
              <button
                style={{ marginTop: 10, background: "#27ae60", color: "#fff", padding: "8px 16px", border: "none", borderRadius: 8, fontWeight: "bold" }}
                onClick={() => setSelected(p)}
              >
                Seleccionar
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div>
          <h3 style={{ fontWeight: "bold", fontSize: 22, marginBottom: 20, color: "#3498db" }}>Detalle del Pedido Seleccionado</h3>
          <p><b>Nota:</b> {selected.numero}</p>
          <p><b>Empresa:</b> {selected.empresa}</p>
          <p><b>Fruta:</b> {selected.fruta}</p>
          <p><b>Cantidad:</b> {selected.cantidad}</p>
          <button
            style={{ marginTop: 22, background: "#e74c3c", color: "#fff", padding: "8px 18px", border: "none", borderRadius: 8, fontWeight: "bold" }}
            onClick={() => setSelected(null)}
          >
            Volver a la lista
          </button>
        </div>
      )}
    </div>
  );
}

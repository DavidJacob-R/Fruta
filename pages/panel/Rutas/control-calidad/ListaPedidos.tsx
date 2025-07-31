import { Pedido } from './types'

interface Props {
  pedidos: Pedido[]
  onSelect: (pedido: Pedido) => void
}

export default function ListaPedidos({ pedidos, onSelect }: Props) {
  return (
    <div className="bg-[#23272a]/90 border border-[#2ecc71] rounded-3xl p-8 md:p-10 shadow-md mb-10 max-w-5xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-semibold text-[#2ecc71] mb-8 text-center">Pedidos pendientes</h2>
      <div className="space-y-6">
        {pedidos.length === 0 && (
          <div className="text-center text-gray-400 text-lg sm:text-xl">No hay pedidos pendientes de control de calidad.</div>
        )}
        {pedidos.map((pedido) => (
          <div
            key={pedido.id}
            onClick={() => onSelect(pedido)}
            className="bg-[#23272a]/80 border border-[#27ae60] hover:border-[#2ecc71] transition rounded-3xl p-6 sm:p-7 shadow-md cursor-pointer group"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="font-bold text-[#27ae60] text-base sm:text-lg">EMPRESA:</p>
                <p className="group-hover:text-[#2ecc71] text-base sm:text-lg">{pedido.empresa_nombre ?? "-"}</p>
              </div>
              <div>
                <p className="font-bold text-[#27ae60] text-base sm:text-lg">FRUTA:</p>
                <p className="group-hover:text-[#2ecc71] text-base sm:text-lg">{pedido.fruta_nombre ?? "-"}</p>
              </div>
              <div>
                <p className="font-bold text-[#27ae60] text-base sm:text-lg">AGRICULTOR:</p>
                <p className="group-hover:text-[#2ecc71] text-base sm:text-lg">{`${pedido.agricultor_nombre || ""} ${pedido.agricultor_apellido || ""}`}</p>
              </div>
              <div>
                <p className="font-bold text-[#27ae60] text-base sm:text-lg">CANTIDAD:</p>
                <p className="group-hover:text-[#2ecc71] text-base sm:text-lg">{pedido.cantidad_cajas}</p>
              </div>
              <div>
                <p className="font-bold text-[#27ae60] text-base sm:text-lg">EMPAQUE:</p>
                <p className="group-hover:text-[#2ecc71] text-base sm:text-lg">{pedido.empaque_nombre ?? "-"}</p>
              </div>
              <div className="flex justify-end items-end">
                <span className="bg-gradient-to-r from-[#27ae60] to-[#2ecc71] text-white px-6 py-3 rounded-2xl text-base sm:text-lg font-medium shadow">
                  SELECCIONAR
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

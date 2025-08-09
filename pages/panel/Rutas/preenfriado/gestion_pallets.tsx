import { useState } from 'react';
import { useRouter } from 'next/router';

export default function PreEnfriadoMain() {
  const router = useRouter();
  const [mode, setMode] = useState<'empresa' | 'maquila' | null>(null);
  const [selectedFruit, setSelectedFruit] = useState<string>('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  // Datos de ejemplo - reemplazar con datos reales
  const fruits = ['Zarzamora', 'Arándano', 'Frambuesa', 'Mora Azul'];
  const ordersData = [
    { id: 'ORD-001', fruit: 'Zarzamora', farmer: 'Juan Perez', boxes: 150, qcStatus: 'Aprobado' },
    { id: 'ORD-002', fruit: 'Arándano', farmer: 'Pedro S.', boxes: 180, qcStatus: 'Aprobado' },
    { id: 'ORD-003', fruit: 'Frambuesa', farmer: 'Maria G.', boxes: 120, qcStatus: 'Aprobado' },
    { id: 'ORD-004', fruit: 'Zarzamora', farmer: 'Agricola El Molino', boxes: 220, qcStatus: 'Aprobado' },
  ];

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId) 
        : [...prev, orderId]
    );
  };

  const filteredOrders = ordersData.filter(order => 
    (selectedFruit === '' || order.fruit === selectedFruit) && 
    order.qcStatus === 'Aprobado'
  );

  const generatePalletCode = () => {
    // Generar código de pallet automático
    return `PAL-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  if (showSummary) {
    return (
      <PalletSummary 
        mode={mode!}
        selectedOrders={selectedOrders}
        ordersData={ordersData}
        onBack={() => setShowSummary(false)}
        onConfirm={() => {
          alert('Pallet enviado a pre-enfriado');
          setMode(null);
          setSelectedOrders([]);
          setShowSummary(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181712] via-[#24180c] to-[#242126] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-blue-400">Pre-Enfriado - Gestion de Pallets</h1>
          <button
            onClick={() => router.push('/panel/Rutas/preenfriado')}
            className="bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white px-7 py-3 rounded-full font-bold shadow-xl border-none transition duration-200"
          >
            Volver
          </button>
        </div>

        {!mode ? (
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-8">Seleccione el tipo de proceso:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
              <div 
                onClick={() => setMode('empresa')}
                className={`cursor-pointer p-8 rounded-xl border-2 ${mode === 'empresa' ? 'border-blue-500' : 'border-gray-600'} bg-gradient-to-br from-blue-900/30 to-blue-800/20 hover:from-blue-900/40 hover:to-blue-800/30 text-center`}
              >
                <h3 className="text-xl font-bold text-blue-400 mb-4">Empresa</h3>
                <p className="text-gray-300">Formar pallets con productos de nuestra empresa</p>
              </div>
              <div 
                onClick={() => setMode('maquila')}
                className={`cursor-pointer p-8 rounded-xl border-2 ${mode === 'maquila' ? 'border-green-500' : 'border-gray-600'} bg-gradient-to-br from-green-900/30 to-green-800/20 hover:from-green-900/40 hover:to-green-800/30 text-center`}
              >
                <h3 className="text-xl font-bold text-green-400 mb-4">Maquila</h3>
                <p className="text-gray-300">Formar pallets con productos de maquila</p>
              </div>
            </div>
          </div>
        ) : (
          <div className={`bg-[#1c1917] rounded-xl p-6 shadow-lg border-2 ${mode === 'empresa' ? 'border-blue-500' : 'border-green-500'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {mode === 'empresa' ? (
                  <span className="text-blue-400">Empresa - Seleccionar Pedidos</span>
                ) : (
                  <span className="text-green-400">Maquila - Seleccionar Pedidos</span>
                )}
              </h2>
              <button
                onClick={() => {
                  setMode(null);
                  setSelectedOrders([]);
                  setSelectedFruit('');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                Cambiar Modo
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Filtrar por fruta:</label>
              <select
                value={selectedFruit}
                onChange={(e) => setSelectedFruit(e.target.value)}
                className="w-full md:w-1/3 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
              >
                <option value="">Todas las frutas</option>
                {fruits.map(fruit => (
                  <option key={fruit} value={fruit}>{fruit}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className={`${mode === 'empresa' ? 'bg-blue-900/30' : 'bg-green-900/30'}`}>
                    <th className="border border-gray-600 p-3">Seleccionar</th>
                    <th className="border border-gray-600 p-3">ID Pedido</th>
                    <th className="border border-gray-600 p-3">Fruta</th>
                    <th className="border border-gray-600 p-3">Agricultor/Empresa</th>
                    <th className="border border-gray-600 p-3">Cajas</th>
                    <th className="border border-gray-600 p-3">Estado QC</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id}>
                      <td className="border border-gray-600 p-3 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleOrderSelection(order.id)}
                          className="h-5 w-5"
                        />
                      </td>
                      <td className="border border-gray-600 p-3">{order.id}</td>
                      <td className="border border-gray-600 p-3">{order.fruit}</td>
                      <td className="border border-gray-600 p-3">{order.farmer}</td>
                      <td className="border border-gray-600 p-3 text-center">{order.boxes}</td>
                      <td className="border border-gray-600 p-3 text-center">
                        <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">{order.qcStatus}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-6">
              <p className="text-gray-300">
                {selectedOrders.length > 0 
                  ? `${selectedOrders.length} pedido(s) seleccionado(s)` 
                  : 'Ningún pedido seleccionado'}
              </p>
              <button
                onClick={() => setShowSummary(true)}
                disabled={selectedOrders.length === 0}
                className={`${mode === 'empresa' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} ${selectedOrders.length === 0 ? 'opacity-50 cursor-not-allowed' : ''} text-white px-6 py-3 rounded-lg font-medium shadow-lg`}
              >
                Continuar a Resumen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PalletSummary({ mode, selectedOrders, ordersData, onBack, onConfirm }: {
  mode: 'empresa' | 'maquila',
  selectedOrders: string[],
  ordersData: any[],
  onBack: () => void,
  onConfirm: () => void
}) {
  const selectedOrdersData = ordersData.filter(order => selectedOrders.includes(order.id));
  const totalBoxes = selectedOrdersData.reduce((sum, order) => sum + order.boxes, 0);
  const palletsNeeded = Math.ceil(totalBoxes / 200);
  const palletCodes = Array.from({ length: palletsNeeded }, (_, i) => `PAL-${Math.floor(1000 + Math.random() * 9000)}`);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#181712] via-[#24180c] to-[#242126] text-white p-6`}>
      <div className="max-w-6xl mx-auto">
        <div className={`bg-[#1c1917] rounded-xl p-6 shadow-lg border-2 ${mode === 'empresa' ? 'border-blue-500' : 'border-green-500'}`}>
          <h2 className="text-xl font-bold mb-6">
            {mode === 'empresa' ? (
              <span className="text-blue-400">Resumen de Pallet - Empresa</span>
            ) : (
              <span className="text-green-400">Resumen de Pallet - Maquila</span>
            )}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Detalles del Pallet</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400">Código(s) de Pallet:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {palletCodes.map(code => (
                      <span key={code} className="bg-gray-800 px-3 py-1 rounded">{code}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-gray-400">Total de cajas:</p>
                  <p className="text-xl">{totalBoxes} (en {palletsNeeded} pallet{palletsNeeded !== 1 ? 's' : ''})
</p>
                </div>
                <div>
                  <p className="text-gray-400">Límite por pallet:</p>
                  <p className="text-xl">200 cajas</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Pedidos Incluidos</h3>
              <div className="overflow-y-auto max-h-64 pr-2">
                {selectedOrdersData.map(order => (
                  <div key={order.id} className="mb-3 pb-3 border-b border-gray-700">
                    <p className="font-medium">{order.id} - {order.fruit}</p>
                    <p className="text-sm text-gray-400">Agricultor: {order.farmer}</p>
                    <p className="text-sm">Cajas: {order.boxes}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gray-800/50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Distribución en Pallets:</h3>
            {Array.from({ length: palletsNeeded }).map((_, i) => {
              const startBox = i * 200;
              const endBox = Math.min((i + 1) * 200, totalBoxes);
              return (
                <div key={i} className="mb-4 last:mb-0">
                  <p className="font-medium mb-2">{palletCodes[i]} - {endBox - startBox} cajas</p>
                  <div className="w-full bg-gray-700 rounded-full h-4">
                    <div 
                      className={`${mode === 'empresa' ? 'bg-blue-500' : 'bg-green-500'} h-4 rounded-full`} 
                      style={{ width: `${((endBox - startBox) / 200) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={onBack}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Regresar
            </button>
            <button
              onClick={onConfirm}
              className={`${mode === 'empresa' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-3 rounded-lg font-medium shadow-lg`}
            >
              Confirmar y Enviar a Pre-Enfriado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
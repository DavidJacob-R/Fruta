import { useState } from 'react';
import { useRouter } from 'next/router';

export default function PreEnfriado() {
  const router = useRouter();
  const [view, setView] = useState<'general' | 'detailed'>('general');
  const [selectedPallets, setSelectedPallets] = useState<string[]>([]);

  // Datos de ejemplo - reemplazar con datos reales
  const palletsData = [
    { id: '0010', fruit: 'Zarzamora', size: '6oz', quantity: 200, farmer: 'Juan Perez', temp: '4°C', time: '2h 30m' },
    { id: '0026', fruit: 'Arándano', size: '6oz', quantity: 180, farmer: 'Pedro S.', temp: '3.5°C', time: '3h 15m' },
    { id: '0034', fruit: 'Frambuesa', size: '12oz', quantity: 150, farmer: 'Julian C.', temp: '4.2°C', time: '2h 45m' },
    { id: '0042', fruit: 'Zarzamora', size: '12oz', quantity: 220, farmer: 'Maria G.', temp: '3.8°C', time: '3h 00m' },
  ];

  const togglePalletSelection = (palletId: string) => {
    setSelectedPallets(prev => 
      prev.includes(palletId) 
        ? prev.filter(id => id !== palletId) 
        : [...prev, palletId]
    );
  };

  const transferToStorage = () => {
    // Lógica para transferir pallets seleccionados al almacén
    console.log('Pallets transferidos:', selectedPallets);
    // Aquí iría la llamada a la API o actualización de estado
    alert(`Pallets ${selectedPallets.join(', ')} transferidos al almacén`);
    setSelectedPallets([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181712] via-[#24180c] to-[#242126] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-blue-400">Pre-Enfriado</h1>
          <button
            onClick={() => router.push('/panel/Rutas/preenfriado')}
            className="bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white px-7 py-3 rounded-full font-bold shadow-xl border-none transition duration-200"
          >
            Volver
          </button>
        </div>

        <div className="flex mb-6 border-b border-gray-600">
          <button
            onClick={() => setView('general')}
            className={`px-4 py-2 font-medium ${view === 'general' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
          >
            Vista General
          </button>
          <button
            onClick={() => setView('detailed')}
            className={`px-4 py-2 font-medium ${view === 'detailed' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
          >
            Vista Detallada
          </button>
        </div>

        {view === 'general' ? (
          <div className="bg-[#1c1917] rounded-xl p-6 shadow-lg border border-blue-300">
            <h2 className="text-xl font-bold text-blue-400 mb-6">Pallets Pre-Enfriados</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {palletsData.map(pallet => (
                <div 
                  key={pallet.id}
                  onClick={() => togglePalletSelection(pallet.id)}
                  className={`cursor-pointer p-4 rounded-lg border ${selectedPallets.includes(pallet.id) ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 bg-gray-800'}`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg">Pallet #{pallet.id}</h3>
                    <input 
                      type="checkbox" 
                      checked={selectedPallets.includes(pallet.id)}
                      onChange={() => {}}
                      className="h-5 w-5 text-blue-500"
                    />
                  </div>
                  <p className="mt-2">{pallet.fruit} {pallet.size}</p>
                  <p className="text-sm text-gray-400">Cantidad: {pallet.quantity}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-6">
              <p className="text-gray-300">
                {selectedPallets.length > 0 
                  ? `${selectedPallets.length} pallet(s) seleccionado(s)` 
                  : 'Ningún pallet seleccionado'}
              </p>
              <button
                onClick={transferToStorage}
                disabled={selectedPallets.length === 0}
                className={`bg-blue-600 ${selectedPallets.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'} text-white px-6 py-3 rounded-lg font-medium shadow-lg`}
              >
                Transferir al Almacén
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#1c1917] rounded-xl p-6 shadow-lg border border-blue-300">
            <h2 className="text-xl font-bold text-blue-400 mb-6">Detalle de Pallets</h2>
            
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="border border-gray-600 p-3">Seleccionar</th>
                    <th className="border border-gray-600 p-3"># Pallet</th>
                    <th className="border border-gray-600 p-3">Fruta</th>
                    <th className="border border-gray-600 p-3">Empaque</th>
                    <th className="border border-gray-600 p-3">Cantidad</th>
                    <th className="border border-gray-600 p-3">Agricultor</th>
                    <th className="border border-gray-600 p-3">Temp. Final</th>
                    <th className="border border-gray-600 p-3">Tiempo</th>
                  </tr>
                </thead>
                <tbody>
                  {palletsData.map(pallet => (
                    <tr key={pallet.id}>
                      <td className="border border-gray-600 p-3 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedPallets.includes(pallet.id)}
                          onChange={() => togglePalletSelection(pallet.id)}
                          className="h-5 w-5 text-blue-500"
                        />
                      </td>
                      <td className="border border-gray-600 p-3 text-center">{pallet.id}</td>
                      <td className="border border-gray-600 p-3 text-center">{pallet.fruit}</td>
                      <td className="border border-gray-600 p-3 text-center">{pallet.size}</td>
                      <td className="border border-gray-600 p-3 text-center">{pallet.quantity}</td>
                      <td className="border border-gray-600 p-3 text-center">{pallet.farmer}</td>
                      <td className="border border-gray-600 p-3 text-center">{pallet.temp}</td>
                      <td className="border border-gray-600 p-3 text-center">{pallet.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-6">
              <p className="text-gray-300">
                {selectedPallets.length > 0 
                  ? `${selectedPallets.length} pallet(s) seleccionado(s)` 
                  : 'Ningún pallet seleccionado'}
              </p>
              <button
                onClick={transferToStorage}
                disabled={selectedPallets.length === 0}
                className={`bg-blue-600 ${selectedPallets.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'} text-white px-6 py-3 rounded-lg font-medium shadow-lg`}
              >
                Transferir al Almacén
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
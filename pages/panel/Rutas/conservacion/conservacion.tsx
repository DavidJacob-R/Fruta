import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Pallet {
  id: string;
  fruit: string;
  size: string;
  quantity: number;
  farmer: string;
  entryDate: string;
  entryTime: string;
  coolingTime?: string;
  finalTemp?: string;
}

export default function Conservacion() {
  const router = useRouter();
  const [view, setView] = useState<'general' | 'detailed'>('general');
  const [pallets, setPallets] = useState<Pallet[]>([]);

  // Datos de ejemplo - en una aplicación real estos vendrían de una API
  useEffect(() => {
    const now = new Date();
    const entryDate = now.toLocaleDateString();
    const entryTime = now.toLocaleTimeString();

    const examplePallets: Pallet[] = [
      {
        id: '0010',
        fruit: 'Zarzamora',
        size: '6oz',
        quantity: 200,
        farmer: 'Juan Perez',
        entryDate,
        entryTime,
        coolingTime: '2h 30m',
        finalTemp: '4°C'
      },
      {
        id: '0026',
        fruit: 'Arándano',
        size: '6oz',
        quantity: 180,
        farmer: 'Pedro S.',
        entryDate,
        entryTime,
        coolingTime: '3h 15m',
        finalTemp: '3.5°C'
      },
      {
        id: '0034',
        fruit: 'Frambuesa',
        size: '12oz',
        quantity: 150,
        farmer: 'Julian C.',
        entryDate,
        entryTime,
        coolingTime: '2h 45m',
        finalTemp: '4.2°C'
      },
      {
        id: '0042',
        fruit: 'Zarzamora',
        size: '12oz',
        quantity: 220,
        farmer: 'Maria G.',
        entryDate,
        entryTime,
        coolingTime: '3h 00m',
        finalTemp: '3.8°C'
      },
    ];

    setPallets(examplePallets);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1922] via-[#172a3a] to-[#0a1922] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-teal-400">Conservación</h1>
          <button
            onClick={() => router.push('/panel/empleado')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Volver al Menú
          </button>
        </div>

        <div className="flex mb-6 border-b border-gray-600">
          <button
            onClick={() => setView('general')}
            className={`px-4 py-2 font-medium ${view === 'general' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-400'}`}
          >
            Vista General
          </button>
          <button
            onClick={() => setView('detailed')}
            className={`px-4 py-2 font-medium ${view === 'detailed' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-400'}`}
          >
            Vista Detallada
          </button>
        </div>

        {view === 'general' ? (
          <div className="bg-[#1c2b3a] rounded-xl p-6 shadow-lg border border-teal-300">
            <h2 className="text-xl font-bold text-teal-400 mb-6">Pallets en Conservación</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pallets.map(pallet => (
                <div 
                  key={pallet.id}
                  className="p-4 rounded-lg border border-gray-600 bg-gray-800"
                >
                  <h3 className="font-bold text-lg text-teal-300">Pallet #{pallet.id}</h3>
                  <p className="mt-2">{pallet.fruit} {pallet.size}</p>
                  <p className="text-sm text-gray-400">Cantidad: {pallet.quantity}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Ingreso: {pallet.entryDate} {pallet.entryTime}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Tiempo enfriamiento: {pallet.coolingTime}
                  </p>
                  {pallet.finalTemp && (
                    <p className="text-sm text-green-400 mt-1">
                      Temp. final: {pallet.finalTemp}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#1c2b3a] rounded-xl p-6 shadow-lg border border-teal-300">
            <h2 className="text-xl font-bold text-teal-400 mb-6">Detalle de Pallets en Conservación</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="border border-gray-600 p-3"># Pallet</th>
                    <th className="border border-gray-600 p-3">Fruta</th>
                    <th className="border border-gray-600 p-3">Empaque</th>
                    <th className="border border-gray-600 p-3">Cantidad</th>
                    <th className="border border-gray-600 p-3">Agricultor</th>
                    <th className="border border-gray-600 p-3">Fecha Ingreso</th>
                    <th className="border border-gray-600 p-3">Hora Ingreso</th>
                    <th className="border border-gray-600 p-3">Tiempo Enfriamiento</th>
                    <th className="border border-gray-600 p-3">Temp. Final</th>
                  </tr>
                </thead>
                <tbody>
                  {pallets.map(pallet => (
                    <tr key={pallet.id}>
                      <td className="border border-gray-600 p-3 text-center">{pallet.id}</td>
                      <td className="border border-gray-600 p-3 text-center">{pallet.fruit}</td>
                      <td className="border border-gray-600 p-3 text-center">{pallet.size}</td>
                      <td className="border border-gray-600 p-3 text-center">{pallet.quantity}</td>
                      <td className="border border-gray-600 p-3 text-center">{pallet.farmer}</td>
                      <td className="border border-gray-600 p-3 text-center">{pallet.entryDate}</td>
                      <td className="border border-gray-600 p-3 text-center">{pallet.entryTime}</td>
                      <td className="border border-gray-600 p-3 text-center">{pallet.coolingTime}</td>
                      <td className="border border-gray-600 p-3 text-center">{pallet.finalTemp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
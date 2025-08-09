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
    <div className="min-h-screen bg-gradient-to-br from-[#181712] via-[#24180c] to-[#242126] text-white px-2 py-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        {/* Header consistente */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 shadow-lg rounded-full w-16 h-16 flex items-center justify-center">
              <span className="text-3xl">❄️</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-orange-400 drop-shadow">Conservación</h1>
          </div>
          <button
            onClick={() => router.push('/panel/empleado')}
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-full font-medium shadow hover:shadow-lg transition w-full sm:w-auto"
          >
            Volver al Menú
          </button>
        </div>

        {/* Pestañas unificadas */}
        <div className="flex mb-6 border-b border-orange-300">
          <button
            onClick={() => setView('general')}
            className={`px-4 py-2 font-medium ${view === 'general' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400 hover:text-white'}`}
          >
            Vista General
          </button>
          <button
            onClick={() => setView('detailed')}
            className={`px-4 py-2 font-medium ${view === 'detailed' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400 hover:text-white'}`}
          >
            Vista Detallada
          </button>
        </div>

        {view === 'general' ? (
          <div className="bg-[#1c1917] border border-orange-300 rounded-2xl p-6 shadow-md hover:shadow-lg transition mb-8">
            <h2 className="text-xl font-semibold text-orange-400 mb-6">Pallets en Conservación</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pallets.map(pallet => (
                <div 
                  key={pallet.id}
                  className="bg-[#242126] border border-orange-300 rounded-xl p-4 hover:border-orange-500 transition cursor-pointer"
                >
                  <h3 className="font-semibold text-lg text-orange-400">Pallet #{pallet.id}</h3>
                  <p className="text-gray-300 mt-2">{pallet.fruit} {pallet.size}</p>
                  <p className="text-gray-400 text-sm">Cantidad: {pallet.quantity}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Ingreso: {pallet.entryDate} {pallet.entryTime}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Tiempo enfriamiento: {pallet.coolingTime}
                  </p>
                  {pallet.finalTemp && (
                    <p className="text-green-400 text-sm mt-1">
                      Temp. final: {pallet.finalTemp}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#1c1917] border border-orange-300 rounded-2xl p-6 shadow-md hover:shadow-lg transition overflow-x-auto">
            <h2 className="text-xl font-semibold text-orange-400 mb-6">Detalle de Pallets en Conservación</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#242126]">
                    <th className="border border-orange-300 p-3 text-orange-400"># Pallet</th>
                    <th className="border border-orange-300 p-3 text-orange-400">Fruta</th>
                    <th className="border border-orange-300 p-3 text-orange-400">Empaque</th>
                    <th className="border border-orange-300 p-3 text-orange-400">Cantidad</th>
                    <th className="border border-orange-300 p-3 text-orange-400">Agricultor</th>
                    <th className="border border-orange-300 p-3 text-orange-400">Fecha Ingreso</th>
                    <th className="border border-orange-300 p-3 text-orange-400">Hora Ingreso</th>
                    <th className="border border-orange-300 p-3 text-orange-400">Tiempo Enfriamiento</th>
                    <th className="border border-orange-300 p-3 text-orange-400">Temp. Final</th>
                  </tr>
                </thead>
                <tbody>
                  {pallets.map(pallet => (
                    <tr key={pallet.id} className="hover:bg-[#2A2A2A] transition">
                      <td className="border border-orange-300 p-3 text-center text-gray-300">{pallet.id}</td>
                      <td className="border border-orange-300 p-3 text-center text-gray-300">{pallet.fruit}</td>
                      <td className="border border-orange-300 p-3 text-center text-gray-300">{pallet.size}</td>
                      <td className="border border-orange-300 p-3 text-center text-gray-300">{pallet.quantity}</td>
                      <td className="border border-orange-300 p-3 text-center text-gray-300">{pallet.farmer}</td>
                      <td className="border border-orange-300 p-3 text-center text-gray-300">{pallet.entryDate}</td>
                      <td className="border border-orange-300 p-3 text-center text-gray-300">{pallet.entryTime}</td>
                      <td className="border border-orange-300 p-3 text-center text-gray-300">{pallet.coolingTime}</td>
                      <td className="border border-orange-300 p-3 text-center text-green-400">{pallet.finalTemp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="text-center text-gray-400 mt-8">
          © {new Date().getFullYear()} El Molinito
        </div>
      </div>
    </div>
  );
}
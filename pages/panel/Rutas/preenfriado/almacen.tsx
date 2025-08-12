import { useState } from 'react';
import { useRouter } from 'next/router';

export default function RecepcionPallets() {
  const router = useRouter();
  const [pallets, setPallets] = useState([
    { id: '0134', temperatura: '4°C', fruta: 'Zarzamora', empaque: '6 OZ', cantidad: 200 },
    { id: '0135', temperatura: '3.5°C', fruta: 'Arándano', empaque: '12 OZ', cantidad: 150 },
    { id: '0136', temperatura: '4.2°C', fruta: 'Frambuesa', empaque: '6 OZ', cantidad: 180 },
  ]);

  const [nuevoPallet, setNuevoPallet] = useState({
    id: '',
    temperatura: '',
    fruta: 'Zarzamora',
    empaque: '6 OZ',
    cantidad: 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevoPallet(prev => ({
      ...prev,
      [name]: name === 'cantidad' ? parseInt(value) || 0 : value
    }));
  };

  const agregarPallet = () => {
    if (nuevoPallet.id && nuevoPallet.temperatura && nuevoPallet.cantidad > 0) {
      setPallets([...pallets, nuevoPallet]);
      setNuevoPallet({
        id: '',
        temperatura: '',
        fruta: 'Zarzamora',
        empaque: '6 OZ',
        cantidad: 0
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181712] via-[#24180c] to-[#242126] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-blue-400">Recepción de Pallets del Pre-enfriado</h1>
          <button
            onClick={() => router.push('/panel/Rutas/preenfriado')}
            className="bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white px-7 py-3 rounded-full font-bold shadow-xl border-none transition duration-200" >
            Volver
          </button>
        </div>

        <div className="bg-[#1c1917] rounded-xl p-6 shadow-lg border border-blue-300 mb-8">
          <h2 className="text-xl font-bold text-blue-400 mb-4">Registrar Nuevo Pallet</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Número de Pallet</label>
              <input
                type="text"
                name="id"
                value={nuevoPallet.id}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                placeholder="Ej. 0134"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Temperatura</label>
              <input
                type="text"
                name="temperatura"
                value={nuevoPallet.temperatura}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                placeholder="Ej. 4°C"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Tipo de Fruta</label>
              <select
                name="fruta"
                value={nuevoPallet.fruta}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
              >
                <option>Zarzamora</option>
                <option>Arándano</option>
                <option>Frambuesa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Cantidad</label>
              <input
                type="number"
                name="cantidad"
                value={nuevoPallet.cantidad}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                placeholder="Ej. 200"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={agregarPallet}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Agregar Pallet
            </button>
          </div>
        </div>

        <div className="bg-[#1c1917] rounded-xl p-6 shadow-lg border border-blue-300">
          <h2 className="text-xl font-bold text-blue-400 mb-4">Pallets Recibidos</h2>
          
          {pallets.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No hay pallets registrados</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pallets.map((pallet, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-lg font-semibold text-blue-300 mb-2">Pallet #{pallet.id}</h3>
                  <div className="space-y-1">
                    <p><span className="text-gray-400">Temperatura:</span> {pallet.temperatura}</p>
                    <p><span className="text-gray-400">Fruta:</span> {pallet.fruta}</p>
                    <p><span className="text-gray-400">Empaque:</span> {pallet.empaque}</p>
                    <p><span className="text-gray-400">Cantidad:</span> {pallet.cantidad}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
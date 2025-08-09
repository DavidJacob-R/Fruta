import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Pallet {
  id: string;
  empresa: string;
  maquila: string;
  numero: string;
}

export default function SalidasPallets() {
  const router = useRouter();
  const [pallets, setPallets] = useState<Pallet[]>([]);
  const [selectedPallets, setSelectedPallets] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [empresa, setEmpresa] = useState('HEALTHY HARVEST');
  const [cliente, setCliente] = useState('N/I');

  // Cargar datos de pallets
  useEffect(() => {
    const mockPallets: Pallet[] = [
      { id: '1', empresa: 'HEALTHY HARVEST', maquila: 'N/I', numero: '0010' },
      { id: '2', empresa: 'HEALTHY HARVEST', maquila: 'N/I', numero: '0054' },
      { id: '3', empresa: 'FRESH FOODS', maquila: 'MAQUILA A', numero: '0011' },
      { id: '4', empresa: 'ORGANIC PRODUCE', maquila: 'MAQUILA B', numero: '0098' },
      { id: '5', empresa: 'HEALTHY HARVEST', maquila: 'N/I', numero: '0187' },
      { id: '6', empresa: 'GREEN VALLEY', maquila: 'MAQUILA C', numero: '0078' },
      { id: '7', empresa: 'HEALTHY HARVEST', maquila: 'N/I', numero: '0026' },
      { id: '8', empresa: 'ORGANIC PRODUCE', maquila: 'MAQUILA B', numero: '0089' },
    ];
    setPallets(mockPallets);
  }, []);

  // Filtrar pallets
  const filteredPallets = pallets.filter(pallet =>
    pallet.numero.includes(searchTerm) ||
    pallet.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pallet.maquila.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar selección de pallets
  const togglePalletSelection = (palletId: string) => {
    setSelectedPallets(prev =>
      prev.includes(palletId)
        ? prev.filter(id => id !== palletId)
        : [...prev, palletId]
    );
  };

  // Obtener los detalles de los pallets seleccionados
  const selectedPalletsDetails = pallets.filter(p => selectedPallets.includes(p.id));

  // Finalizar proceso
  const handleFinalizar = () => {
    alert('Salida confirmada y registrada');
    router.push('/panel/empleado');
  };

  // Renderizar pantalla de selección
  const renderSelectionScreen = () => (
    <>
      <div className="flex flex-col items-center mb-8">
        <div className="bg-orange-100 shadow-lg rounded-full w-20 h-20 flex items-center justify-center mb-3">
          <span className="text-4xl">🚚</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-orange-400 mb-2 drop-shadow">
          Selección de Pallets para Salida
        </h1>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar pallet por número, empresa o maquila..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-[#242126] border border-orange-300 text-white placeholder-orange-300/70 focus:border-orange-500 focus:ring-2 focus:ring-orange-400 outline-none transition"
        />
      </div>

      {/* Lista de pallets */}
      <div className="mb-6 max-h-96 overflow-y-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-orange-300">
              <th className="px-4 py-3 text-left"></th>
              <th className="px-4 py-3 text-left text-orange-300">Empresa</th>
              <th className="px-4 py-3 text-left text-orange-300">Maquila</th>
              <th className="px-4 py-3 text-left text-orange-300">N° Pallet</th>
            </tr>
          </thead>
          <tbody>
            {filteredPallets.map(pallet => (
              <tr 
                key={pallet.id} 
                className="border-b border-orange-300/30 hover:bg-[#2A2A2A] transition"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedPallets.includes(pallet.id)}
                    onChange={() => togglePalletSelection(pallet.id)}
                    className="w-5 h-5 rounded border-2 border-orange-400 bg-[#242126] checked:bg-orange-500 focus:ring-2 focus:ring-orange-400"
                  />
                </td>
                <td className="px-4 py-3 text-orange-100">{pallet.empresa}</td>
                <td className="px-4 py-3 text-orange-100">{pallet.maquila}</td>
                <td className="px-4 py-3 font-mono text-orange-300">{pallet.numero}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumen y botones */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
        <div className="text-lg font-semibold text-orange-200">
          {selectedPallets.length} pallet(s) seleccionado(s)
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setSelectedPallets([])}
            disabled={selectedPallets.length === 0}
            className="px-6 py-3 rounded-full font-bold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow hover:shadow-lg transition disabled:from-red-500/30 disabled:to-red-600/30 disabled:text-orange-200/50"
          >
            Limpiar selección
          </button>
          <button
            onClick={() => setShowConfirmation(true)}
            disabled={selectedPallets.length === 0}
            className="px-6 py-3 rounded-full font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow hover:shadow-lg transition disabled:from-orange-500/30 disabled:to-orange-600/30 disabled:text-orange-200/50"
          >
            Confirmar selección →
          </button>
        </div>
      </div>
    </>
  );

  // Renderizar pantalla de confirmación
  const renderConfirmationScreen = () => (
    <>
      <div className="flex flex-col items-center mb-8">
        <div className="bg-orange-100 shadow-lg rounded-full w-20 h-20 flex items-center justify-center mb-3">
          <span className="text-4xl">📋</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-orange-400 mb-2 drop-shadow">
          Confirmación de Salidas
        </h1>
      </div>

      {/* Información de empresa y cliente */}
      <div className="mb-8 p-6 bg-[#1E1E1E] rounded-xl border border-orange-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium text-orange-300 mb-2">EMPRESA:</label>
            <input
              type="text"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#242126] border border-orange-300 text-white focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block font-medium text-orange-300 mb-2">CLIENTE:</label>
            <input
              type="text"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#242126] border border-orange-300 text-white focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Sección de pallets */}
      <div className="mb-8 p-6 bg-[#1E1E1E] rounded-xl border border-orange-300">
        <h2 className="text-xl font-bold text-orange-400 mb-4">
          PALLETS QUE SALDRÁN
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {selectedPalletsDetails.map(pallet => (
            <div 
              key={pallet.id} 
              className="px-4 py-3 rounded-lg bg-[#242126] border border-orange-300 text-center font-mono text-orange-300"
            >
              {pallet.numero}
            </div>
          ))}
        </div>
      </div>

      {/* Sección de documentos */}
      <div className="mb-8 p-6 bg-[#1E1E1E] rounded-xl border border-orange-300">
        <h2 className="text-xl font-bold text-orange-400 mb-4">
          DOCUMENTOS REQUERIDOS
        </h2>
        <ul className="space-y-3">
          {['CARTA DE INSTRUCCIÓN', 'MANIFIESTO DE CARGA', 'PACKING LIST', 'PROFORMA'].map(doc => (
            <li 
              key={doc} 
              className="px-4 py-3 rounded-lg bg-[#242126] border border-orange-300 text-orange-200"
            >
              {doc}
            </li>
          ))}
        </ul>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={() => setShowConfirmation(false)}
          className="px-6 py-3 rounded-full font-bold bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow hover:shadow-lg transition"
        >
          ← Corregir selección
        </button>
        <button
          onClick={handleFinalizar}
          className="px-6 py-3 rounded-full font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow hover:shadow-lg transition"
        >
          Confirmar salida →
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181712] via-[#24180c] to-[#242126] text-white px-2 py-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => showConfirmation ? setShowConfirmation(false) : router.push('/panel/empleado')}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-medium bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow hover:shadow-lg transition"
          >
            {showConfirmation ? '← Volver' : '← Regresar'}
          </button>
        </div>

        {/* Contenido principal */}
        <div className="bg-[#1c1917] border border-orange-300 rounded-2xl p-6 shadow-md hover:shadow-lg transition">
          {showConfirmation ? renderConfirmationScreen() : renderSelectionScreen()}
        </div>

        <div className="text-center text-gray-400 mt-8">
          © {new Date().getFullYear()} El Molinito
        </div>
      </div>
    </div>
  );
}
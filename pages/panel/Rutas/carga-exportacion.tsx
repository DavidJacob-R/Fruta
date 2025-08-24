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
  const [darkMode, setDarkMode] = useState(true);
  const [pallets, setPallets] = useState<Pallet[]>([]);
  const [selectedPallets, setSelectedPallets] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [empresa, setEmpresa] = useState('HEALTHY HARVEST');
  const [cliente, setCliente] = useState('N/I');
  const [eliminarOptions, setEliminarOptions] = useState({
    ediTar: false,
    continuar: false,
    fotoEdiTar: false,
    fotoContinuar: false
  });

  // checklist de documentos
  const [documentosChecklist, setDocumentosChecklist] = useState({
    cartaInstruccion: false,
    manifiestoCarga: false,
    packingList: false,
    proforma: false
  });

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

  // Controlar modo oscuro/claro
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

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

  // Manejar opciones de eliminación
  const handleToggleOption = (option: keyof typeof eliminarOptions) => {
    setEliminarOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  // Manejar cambios en el checklist de documentos
  const handleToggleDocumento = (documento: keyof typeof documentosChecklist) => {
    setDocumentosChecklist(prev => ({
      ...prev,
      [documento]: !prev[documento]
    }));
  };

  // Finalizar proceso
  const handleFinalizar = () => {
    alert('Salida confirmada y registrada');
    router.push('/panel/empleado');
  };

  // Renderizar pantalla de selección
  const renderSelectionScreen = () => (
    <>
      <h1 className={`text-3xl font-extrabold mb-6 text-center drop-shadow-xl
        ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
        Selección de Pallets para Salida
      </h1>

      {/* Buscador */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar pallet por número, empresa o maquila..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
            ${darkMode
              ? 'bg-black/70 border-orange-400 text-white placeholder-orange-300/70'
              : 'bg-white border-orange-300 text-orange-900 placeholder-orange-400/70'
            }`}
        />
      </div>

      {/* Lista de pallets */}
      <div className="mb-6 max-h-96 overflow-y-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${darkMode ? 'border-orange-400/50' : 'border-orange-300'}`}>
              <th className="px-4 py-3 text-left"></th>
              <th className={`px-4 py-3 text-left ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Empresa</th>
              <th className={`px-4 py-3 text-left ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Maquila</th>
              <th className={`px-4 py-3 text-left ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>N° Pallet</th>
            </tr>
          </thead>
          <tbody>
            {filteredPallets.map(pallet => (
              <tr 
                key={pallet.id} 
                className={`border-b ${darkMode ? 'border-orange-400/30 hover:bg-white/10' : 'border-orange-200 hover:bg-orange-50'}`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedPallets.includes(pallet.id)}
                    onChange={() => togglePalletSelection(pallet.id)}
                    className={`w-5 h-5 rounded border-2 focus:ring-2 focus:ring-orange-400 
                      ${darkMode
                        ? 'bg-black/70 border-orange-400 checked:bg-orange-500'
                        : 'border-orange-300 checked:bg-orange-500'
                      }`}
                  />
                </td>
                <td className={`px-4 py-3 ${darkMode ? 'text-orange-100' : 'text-orange-800'}`}>{pallet.empresa}</td>
                <td className={`px-4 py-3 ${darkMode ? 'text-orange-100' : 'text-orange-800'}`}>{pallet.maquila}</td>
                <td className={`px-4 py-3 font-mono ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>{pallet.numero}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumen y botones */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
        <div className={`text-lg font-semibold ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
          {selectedPallets.length} pallet(s) seleccionado(s)
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setSelectedPallets([])}
            disabled={selectedPallets.length === 0}
            className={`px-6 py-3 rounded-xl font-bold transition
              ${darkMode
                ? 'bg-red-600/90 hover:bg-red-700 disabled:bg-red-600/30 disabled:text-orange-200/50'
                : 'bg-red-500 hover:bg-red-600 disabled:bg-red-200 disabled:text-orange-700/50'
              }`}
          >
            Limpiar selección
          </button>
          <button
            onClick={() => setShowConfirmation(true)}
            disabled={selectedPallets.length === 0}
            className={`px-6 py-3 rounded-xl font-bold transition
              ${darkMode
                ? 'bg-orange-600/90 hover:bg-orange-700 disabled:bg-orange-600/30 disabled:text-orange-200/50'
                : 'bg-orange-500 hover:bg-orange-600 disabled:bg-orange-200 disabled:text-orange-700/50'
              }`}
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
      <h1 className={`text-3xl font-extrabold mb-8 text-center drop-shadow-xl
        ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
        MENÚ DE CONFIRMACIÓN DE SALIDAS
      </h1>

      {/* Información de empresa y cliente */}
      <div className={`mb-8 p-4 rounded-xl ${darkMode ? 'bg-black/30' : 'bg-orange-50'}`}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className={`font-bold ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>EMPRESA:</p>
            <input
              type="text"
              value={empresa}
              readOnly
              className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-black/50 border-orange-400 text-white' : 'bg-white border-orange-300'} cursor-default opacity-80`}
            />
          </div>
          <div>
            <p className={`font-bold ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>CLIENTE:</p>
            <input
              type="text"
              value={cliente}
              readOnly
              className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-black/50 border-orange-400 text-white' : 'bg-white border-orange-300'} cursor-default opacity-80`}
            />
          </div>
        </div>
      </div>

      {/* Sección de pallets */}
      <div className={`mb-8 p-4 rounded-xl ${darkMode ? 'bg-black/30' : 'bg-orange-50'}`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
          PALLETS QUE SALDRÁN
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {selectedPalletsDetails.map(pallet => (
            <div 
              key={pallet.id} 
              className={`px-3 py-2 rounded-lg text-center font-mono ${darkMode ? 'bg-black/50 text-orange-300' : 'bg-white text-orange-700'}`}
            >
              {pallet.numero}
            </div>
          ))}
        </div>
      </div>

      {/* Sección de documentos - AHORA ES UN CHECKLIST */}
      <div className={`mb-8 p-4 rounded-xl ${darkMode ? 'bg-black/30' : 'bg-orange-50'}`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
          DOCUMENTOS (CHECKLIST)
        </h2>
        <ul className="space-y-2">
          {[
            { key: 'cartaInstruccion', label: 'CARTA DE INSTRUCCIÓN' },
            { key: 'manifiestoCarga', label: 'MANIFIESTO DE CARGA' },
            { key: 'packingList', label: 'PACKING LIST' },
            { key: 'proforma', label: 'PROFORMA' }
          ].map(doc => (
            <li 
              key={doc.key} 
              className={`px-3 py-2 rounded-lg flex items-center ${darkMode ? 'bg-black/50' : 'bg-white'}`}
            >
              <input
                type="checkbox"
                checked={documentosChecklist[doc.key as keyof typeof documentosChecklist]}
                onChange={() => handleToggleDocumento(doc.key as keyof typeof documentosChecklist)}
                className={`w-5 h-5 rounded border-2 focus:ring-2 focus:ring-orange-400 mr-3
                  ${darkMode
                    ? 'bg-black/70 border-orange-400 checked:bg-orange-500'
                    : 'border-orange-300 checked:bg-orange-500'
                  }`}
              />
              <span className={`${darkMode ? 'text-orange-200' : 'text-orange-700'} ${documentosChecklist[doc.key as keyof typeof documentosChecklist] ? 'line-through opacity-70' : ''}`}>
                {doc.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setShowConfirmation(false)}
          className={`px-6 py-3 rounded-xl font-bold transition
            ${darkMode
              ? 'bg-slate-600/90 hover:bg-slate-700'
              : 'bg-slate-500 hover:bg-slate-600 text-white'
            }`}
        >
          ← Corregir selección
        </button>
        <button
          onClick={handleFinalizar}
          className={`px-6 py-3 rounded-xl font-bold transition
            ${darkMode
              ? 'bg-orange-600/90 hover:bg-orange-700'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
        >
          Confirmar salida →
        </button>
      </div>
    </>
  );

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300
      ${darkMode
        ? 'bg-gradient-to-br from-[#181a1b] via-[#23282b] to-[#212225]'
        : 'bg-gradient-to-br from-orange-50 via-white to-gray-100'}`}>

      {/* Barra modo noche/día */}
      <header className="w-full flex justify-between items-center pt-5 px-8">
        <button
          onClick={() => showConfirmation ? setShowConfirmation(false) : router.push('/panel/empleado')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full shadow border text-base font-semibold transition
            ${darkMode
              ? "bg-[#232a2d]/90 border-orange-300 text-orange-100 hover:bg-[#22282a]/90"
              : "bg-white border-orange-200 text-orange-700 hover:bg-orange-50"}`}>
          {showConfirmation ? '← Volver' : '← Regresar'}
        </button>
        <button
          onClick={() => setDarkMode(d => !d)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full shadow border text-base font-semibold transition
            ${darkMode
              ? "bg-[#232a2d]/90 border-orange-300 text-orange-100 hover:bg-[#22282a]/90"
              : "bg-white border-orange-200 text-orange-700 hover:bg-orange-50"}`}>
          {darkMode ? '🌙 Noche' : '☀️ Día'}
        </button>
      </header>

      {/* Branding */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10 select-none">
        <div className={`w-14 h-14 ${darkMode ? 'bg-white/10 border-orange-400' : 'bg-orange-100 border-orange-300'} border-2 shadow-xl rounded-full flex items-center justify-center`}>
          <span className={`text-3xl font-black ${darkMode ? 'text-orange-300' : 'text-orange-400'}`}>🍊</span>
        </div>
        <span className={`font-bold tracking-widest uppercase text-xl drop-shadow 
          ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>El Molinito</span>
      </div>

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col items-center py-14 px-4">
        <div className={`w-full max-w-4xl mx-auto rounded-3xl shadow-2xl p-8 flex flex-col relative z-0 transition
          ${darkMode
            ? 'bg-white/10 backdrop-blur-lg border-2 border-orange-300'
            : 'bg-white border-2 border-orange-200'
          }`}>
          {showConfirmation ? renderConfirmationScreen() : renderSelectionScreen()}
        </div>
      </main>

      <footer className={`w-full text-center py-4 text-sm mt-auto
        ${darkMode
          ? "bg-[#181a1b] text-orange-200"
          : "bg-orange-50 text-orange-900"
        }`}>
        © {new Date().getFullYear()} El Molinito – Sistema de logística y control
      </footer>
    </div>
  );
}
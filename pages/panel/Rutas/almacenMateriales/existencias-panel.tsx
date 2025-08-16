import { Material } from '../../../api/almacenmateriales/types'

interface ExistenciasPanelProps {
  darkMode: boolean
  existencias: Material[]
  searchTerm: string
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBack: () => void
}

export default function ExistenciasPanel({ 
  darkMode, 
  existencias, 
  searchTerm, 
  onSearchChange, 
  onBack 
}: ExistenciasPanelProps) {
  return (
    <div className={`w-full max-w-4xl mx-auto rounded-3xl shadow-2xl p-10 flex flex-col items-center pt-20 relative z-0 transition
      ${darkMode
        ? 'bg-white/10 backdrop-blur-lg border-2 border-orange-400'
        : 'bg-white border-2 border-orange-200'
      }`}>
      <div className="flex flex-col items-center mb-6">
        <div className={`${darkMode ? 'bg-white/10 border-orange-500' : 'bg-orange-100 border-orange-300'} shadow-lg rounded-full w-16 h-16 flex items-center justify-center mb-2 border-2`}>
          <span className={`text-3xl ${darkMode ? 'text-orange-400' : 'text-orange-500'}`}>📊</span>
        </div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'} mb-2 drop-shadow`}>
          Existencias Actuales
        </h1>
      </div>
      
      <div className="w-full mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Buscar material..."
            className={`w-full p-3 pl-10 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
              ${darkMode
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
              }`}
          />
          <span className={`absolute left-3 top-3.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            🔍
          </span>
        </div>
      </div>
      
      <div className={`w-full rounded-xl p-6 mb-6 max-h-96 overflow-y-auto ${darkMode ? 'bg-black/30' : 'bg-orange-50'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(existencias?.length ?? 0) > 0 ? (
            existencias.map((item) => (
              <div key={item.id} className={`p-4 rounded-lg flex justify-between items-center transition
                ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-orange-100'} shadow`}>
                <span className={darkMode ? 'text-white' : 'text-gray-800'}>{item.nombre}</span>
                <span className={`font-bold ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>
                  {item.cantidad} unidades
                </span>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8">
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                {searchTerm ? 'No se encontraron resultados' : 'No hay datos de existencias'}
              </p>
            </div>
          )}
        </div>
      </div>
      
      <button
        onClick={onBack}
        className={`w-full px-6 py-4 rounded-xl font-bold transition
          ${darkMode
            ? 'bg-gray-800 text-orange-300 hover:bg-gray-700'
            : 'bg-gray-200 text-orange-700 hover:bg-gray-300'
          }`}>
        Regresar al menú principal
      </button>
    </div>
  )
}
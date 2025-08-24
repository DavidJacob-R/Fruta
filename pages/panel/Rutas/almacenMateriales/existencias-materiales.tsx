import { Material } from '../../../api/almacen/materiales'

interface ExistenciasMaterialesProps {
  darkMode: boolean
  onEntrada: () => void
  onSalida: () => void
  onIntercambio: () => void
  onExistencias: () => void
  existencias: Material[]
  searchTerm: string
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBack: () => void
}

export default function ExistenciasMateriales({ 
  darkMode, 
  onEntrada, 
  onSalida,
  onIntercambio,
  onExistencias,
  existencias = [],
  searchTerm, 
  onSearchChange, 
  onBack 
}: ExistenciasMaterialesProps) {
  return (
    <div className={`w-full max-w-4xl mx-auto rounded-3xl shadow-2xl p-10 flex flex-col items-center pt-20 relative z-0 transition
      ${darkMode
        ? 'bg-white/10 backdrop-blur-lg border-2 border-orange-400'
        : 'bg-white border-2 border-orange-200'
      }`}>
      <h1 className={`text-4xl font-extrabold mb-8 text-center drop-shadow-xl
        ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
        Almacén de Materiales
      </h1>
      
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={onEntrada}
          className={`h-40 flex flex-col items-center justify-center shadow-xl hover:scale-105 transition-transform rounded-2xl p-6 border-none transition
            ${darkMode ? 'bg-blue-600/90 hover:bg-blue-700/90' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
          <span className="text-4xl mb-2">📥</span>
          <span className="text-xl font-bold">Registrar Entrada</span>
        </button>

        <button
          onClick={onSalida}
          className={`h-40 flex flex-col items-center justify-center shadow-xl hover:scale-105 transition-transform rounded-2xl p-6 border-none transition
            ${darkMode ? 'bg-green-600/90 hover:bg-green-700/90' : 'bg-green-600 hover:bg-green-700'} text-white`}>
          <span className="text-4xl mb-2">📤</span>
          <span className="text-xl font-bold">Registrar Salida</span>
        </button>

        <button
          onClick={onIntercambio}
          className={`h-40 flex flex-col items-center justify-center shadow-xl hover:scale-105 transition-transform rounded-2xl p-6 border-none transition
            ${darkMode ? 'bg-purple-600/90 hover:bg-purple-700/90' : 'bg-purple-600 hover:bg-purple-700'} text-white`}>
          <span className="text-4xl mb-2">🔄</span>
          <span className="text-xl font-bold">Intercambio</span>
        </button>

        <button
          onClick={onExistencias}
          className={`h-40 flex flex-col items-center justify-center shadow-xl hover:scale-105 transition-transform rounded-2xl p-6 border-none transition
            ${darkMode ? 'bg-orange-600/90 hover:bg-orange-700/90' : 'bg-orange-600 hover:bg-orange-700'} text-white`}>
          <span className="text-4xl mb-2">📊</span>
          <span className="text-xl font-bold">Consultar Existencias</span>
        </button>
      </div>

      <button
        className={`w-full mt-8 px-6 py-4 rounded-xl font-bold transition
          ${darkMode
            ? 'bg-gray-800 text-orange-300 hover:bg-gray-700'
            : 'bg-gray-200 text-orange-700 hover:bg-gray-300'
          }`}
        onClick={onBack}>
        Regresar al menú principal
      </button>
    </div>
  )
}
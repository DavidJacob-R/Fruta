import { Material } from '../../../api/almacenmateriales/types'

interface ExistenciasMaterialesProps {
  darkMode: boolean
  onEntrada: () => void
  onSalida: () => void
  existencias: Material[]
  searchTerm: string
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBack: () => void
}

export default function ExistenciasMateriales({ 
  darkMode, 
  onEntrada, 
  onSalida, 
  existencias = [],
  searchTerm, 
  onSearchChange, 
  onBack 
}: ExistenciasMaterialesProps) {
  return (
    <div className={`w-full max-w-xl mx-auto rounded-3xl shadow-2xl p-10 flex flex-col items-center pt-20 relative z-0 transition
      ${darkMode
        ? 'bg-white/10 backdrop-blur-lg border-2 border-orange-400'
        : 'bg-white border-2 border-orange-200'
      }`}>
      <h1 className={`text-4xl font-extrabold mb-8 text-center drop-shadow-xl
        ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
        Almacén de Materiales
      </h1>
      <div className="w-full flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row gap-7 justify-center">
          <button
            onClick={onEntrada}
            className={`flex-1 min-w-[170px] shadow-xl hover:scale-105 transition-transform rounded-2xl px-8 py-6 text-lg font-extrabold tracking-wide border-2 focus:ring-2 outline-none
              ${"bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-4 shadow font-bold border-none transition"}`} >
            Registrar Entrada
          </button>
          <button
            onClick={onSalida}
            className={`flex-1 min-w-[170px] shadow-xl hover:scale-105 transition-transform rounded-2xl px-8 py-6 text-lg font-extrabold tracking-wide border-2 focus:ring-2 outline-none
              ${"bg-green-600 hover:bg-green-700 text-white rounded-xl px-8 py-4 shadow font-bold border-none transition"}`} >
            Registrar Salida
          </button>
        </div>
        
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
        
        <div className={`mt-6 w-full rounded-xl p-4 ${darkMode ? 'bg-black/30' : 'bg-orange-50'}`}>
          <h3 className={`font-bold text-lg mb-3 ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
            Existencias Actuales
          </h3>
          <div className="space-y-2">
            {(existencias?.length ?? 0) > 0 ? (
              existencias.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className={darkMode ? 'text-white' : 'text-gray-800'}>{item.nombre}</span>
                  <span className={`font-mono ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>
                    {item.cantidad} unidades
                  </span>
                </div>
              ))
            ) : (
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                {searchTerm ? 'No se encontraron resultados' : 'No hay datos de existencias'}
              </p>
            )}
          </div>
        </div>
        
        <button
          className={`w-full shadow px-6 py-4 text-lg font-bold rounded-2xl border transition-transform hover:scale-105 focus:ring-2 outline-none
            ${"border-2 border-orange-300 text-orange-800 bg-white hover:bg-orange-100 rounded-xl px-8 py-4 font-bold shadow transitio" }`}
          onClick={onBack}>
          Regresar al menú principal
        </button>
      </div>
    </div>
  )
}

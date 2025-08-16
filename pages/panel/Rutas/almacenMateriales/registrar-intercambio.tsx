import { Empresa, Material } from '../../../api/almacenmateriales/types'

interface RegistrarIntercambioProps {
  darkMode: boolean
  data: any
  empresas: Empresa[]
  materiales: Material[]

  onChange: (data: any) => void
  onConfirm: () => void
  onBack: () => void
}
// ... (imports y interface permanecen iguales)

export default function RegistrarIntercambio({ 
  darkMode, 
  data, 
  empresas, 

  materiales, 
  onChange, 
  onConfirm, 
  onBack 
}: RegistrarIntercambioProps) {
  return (
    <div className={`w-full max-w-2xl mx-auto rounded-3xl shadow-2xl p-10 flex flex-col items-center pt-20 relative z-0 transition
      ${darkMode
        ? 'bg-white/10 backdrop-blur-lg border-2 border-orange-400'
        : 'bg-white border-2 border-orange-200'
      }`}>
      <div className="flex flex-col items-center mb-6">
        <div className={`${darkMode ? 'bg-white/10 border-orange-500' : 'bg-orange-100 border-orange-300'} shadow-lg rounded-full w-16 h-16 flex items-center justify-center mb-2 border-2`}>
          <span className={`text-3xl ${darkMode ? 'text-orange-400' : 'text-orange-500'}`}>🔄</span>
        </div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'} mb-2 drop-shadow`}>
          Intercambio de Materiales
        </h1>
      </div>

      <div className="w-full space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sección Origen */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
            <h3 className={`font-bold mb-3 ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Origen</h3>

            <div className="mb-3">
              <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
                Empresa Origen
              </label>
              <select
                value={data.empresaOrigen?.id || ''}
                onChange={(e) => onChange({ 
                  ...data, 
                  empresaOrigen: empresas.find(emp => emp.id === Number(e.target.value)) || null 
                })}
                className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
                  ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}>
                <option value="">Seleccionar empresa</option>
                {empresas.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
                Material a Intercambiar
              </label>
              <select
                value={data.materialOrigen?.id || ''}
                onChange={(e) => onChange({ 
                  ...data, 
                  materialOrigen: materiales.find(mat => mat.id === Number(e.target.value)) || null 
                })}
                className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
                  ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}>
                <option value="">Seleccionar material</option>
                {materiales.map(mat => (
                  <option key={mat.id} value={mat.id}>{mat.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                value={data.cantidadOrigen}
                onChange={(e) => onChange({ ...data, cantidadOrigen: e.target.value })}
                className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
                  ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                placeholder="Cantidad"
              />
            </div>
          </div>

          {/* Sección Destino */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
            <h3 className={`font-bold mb-3 ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Destino</h3>

            <div className="mb-3">
              <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
                Empresa Destino
              </label>
              <select
                value={data.empresaDestino?.id || ''}
                onChange={(e) => onChange({ 
                  ...data, 
                  empresaDestino: empresas.find(emp => emp.id === Number(e.target.value)) || null 
                })}
                className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
                  ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}>
                <option value="">Seleccionar empresa</option>
                {empresas.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
                Material a Recibir
              </label>
              <select
                value={data.materialDestino?.id || ''}
                onChange={(e) => onChange({ 
                  ...data, 
                  materialDestino: materiales.find(mat => mat.id === Number(e.target.value)) || null 
                })}
                className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
                  ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}>
                <option value="">Seleccionar material</option>
                {materiales.map(mat => (
                  <option key={mat.id} value={mat.id}>{mat.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                value={data.cantidadDestino}
                onChange={(e) => onChange({ ...data, cantidadDestino: e.target.value })}
                className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
                  ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                placeholder="Cantidad"
              />
            </div>
          </div>
        </div>

        {/* Notas y Fecha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
              Fecha de Intercambio
            </label>
            <input
              type="date"
              value={data.fecha}
              onChange={(e) => onChange({ ...data, fecha: e.target.value })}
              className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
                ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
            />
          </div>

          <div>
            <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
              Notas del Intercambio
            </label>
            <textarea
              value={data.notas}
              onChange={(e) => onChange({ ...data, notas: e.target.value })}
              className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
                ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
              rows={2}
              placeholder="Motivo del intercambio, condiciones especiales, etc."
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={onBack}
            className={`flex-1 px-6 py-3 rounded-xl border-2 font-bold transition
              ${darkMode
                ? 'border-orange-400 text-orange-300 hover:bg-orange-900/30'
                : 'border-orange-300 text-orange-700 hover:bg-orange-100'
              }`}>
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!data.empresaOrigen || !data.empresaDestino || !data.materialOrigen || 
                     !data.materialDestino || !data.cantidadOrigen || !data.cantidadDestino}
            className={`flex-1 px-6 py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 transition
              ${(!data.empresaOrigen || !data.empresaDestino || !data.materialOrigen || 
                !data.materialDestino || !data.cantidadOrigen || !data.cantidadDestino) 
                ? 'opacity-50 cursor-not-allowed' : ''}`}>
            Confirmar Intercambio
          </button>
        </div>
      </div>
    </div>
  )
}
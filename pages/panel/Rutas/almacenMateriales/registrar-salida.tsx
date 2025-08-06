import { Agricultor, Empresa, Material, MovimientoSalida } from '../../../api/almacenmateriales/types'

interface RegistrarSalidaProps {
  darkMode: boolean
  data: MovimientoSalida
  empresas: Empresa[]
  agricultores: Agricultor[]
  materiales: Material[]
  onChange: (data: MovimientoSalida) => void
  onConfirm: () => void
  onBack: () => void
}

export default function RegistrarSalida({ 
  darkMode, 
  data, 
  empresas, 
  agricultores, 
  materiales, 
  onChange, 
  onConfirm, 
  onBack 
}: RegistrarSalidaProps) {
  // Protección para build/prerender
  if (!data) {
    return (
      <div className="p-8 text-center text-red-400">
        No se encontraron datos para la salida.<br />
        Por favor, vuelve al paso anterior.
        <div className="mt-8">
          <button
            type="button"
            onClick={onBack}
            className={`mt-8 px-6 py-3 rounded-xl border-2 font-bold transition
              ${darkMode
                ? 'border-orange-400 text-orange-300 hover:bg-orange-900/30'
                : 'border-orange-300 text-orange-700 hover:bg-orange-100'
              }`}>
            Regresar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full max-w-xl mx-auto rounded-3xl shadow-2xl p-10 flex flex-col items-center pt-20 relative z-0 transition
      ${darkMode
        ? 'bg-white/10 backdrop-blur-lg border-2 border-orange-400'
        : 'bg-white border-2 border-orange-200'
      }`}>
      <h1 className={`text-3xl font-extrabold mb-6 text-center drop-shadow-xl
        ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
        Salida de Materiales
      </h1>
      <div className="w-full space-y-5">
        <div>
          <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
            Empresa
          </label>
          <select
            value={data.empresa?.id || ''}
            onChange={(e) => onChange({ ...data, empresa: empresas.find((emp) => emp.id == Number(e.target.value)) || null })}
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
              ${darkMode
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-800'
              }`}>
            <option value="">Seleccionar empresa</option>
            {empresas.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
            Agricultor
          </label>
          <select
            value={data.agricultor?.id || ''}
            onChange={(e) => onChange({ ...data, agricultor: agricultores.find((agr) => agr.id == Number(e.target.value)) || null })}
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
              ${darkMode
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-800'
              }`}>
            <option value="">Seleccionar agricultor</option>
            {agricultores.map((agr) => (
              <option key={agr.id} value={agr.id}>{agr.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
            Material
          </label>
          <select
            value={data.material?.id || ''}
            onChange={(e) => onChange({ ...data, material: materiales.find((mat) => mat.id == Number(e.target.value)) || null })}
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
              ${darkMode
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-800'
              }`}>
            <option value="">Seleccionar material</option>
            {materiales.map((mat) => (
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
            value={data.cantidad}
            onChange={(e) => onChange({ ...data, cantidad: e.target.value })}
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
              ${darkMode
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-800'
              }`}
            placeholder="Ingrese la cantidad"
          />
        </div>
        <div>
          <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
            Fecha de Salida
          </label>
          <input
            type="date"
            value={data.fecha}
            onChange={(e) => onChange({ ...data, fecha: e.target.value })}
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
              ${darkMode
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-800'
              }`}
          />
        </div>
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
            disabled={!data.empresa || !data.agricultor || !data.material || !data.cantidad}
            className={`flex-1 px-6 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition
              ${(!data.empresa || !data.agricultor || !data.material || !data.cantidad) ? 'opacity-50 cursor-not-allowed' : ''}`}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}

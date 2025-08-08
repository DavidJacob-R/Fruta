import { Empresa, Material, MovimientoEntrada, Proveedor } from '../../../api/almacenmateriales/types'

interface RegistrarEntradaProps {
  darkMode: boolean
  data: MovimientoEntrada
  empresas: Empresa[]
  proveedores: Proveedor[]
  materiales: Material[]
  onChange: (data: MovimientoEntrada) => void
  onConfirm: () => void
  onBack: () => void
}

export default function RegistrarEntrada({ 
  darkMode, 
  data, 
  empresas, 
  proveedores, 
  materiales, 
  onChange, 
  onConfirm, 
  onBack 
}: RegistrarEntradaProps) {
  // Protección para build/prerender
  if (!data || typeof data.esComprado === 'undefined') {
    return (
      <div className="p-8 text-center text-red-400">
        No se encontraron datos para la entrada.<br />
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
        Entrada de Materiales
      </h1>
      <div className="w-full space-y-5">
        <div>
          <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
            ¿El material fue comprado?
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => onChange({ ...data, esComprado: true })}
              className={`flex-1 py-2 rounded-lg border-2 font-medium transition
                ${data.esComprado === true 
                  ? 'bg-green-600 text-white border-green-600' 
                  : darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
              Sí
            </button>
            <button
              onClick={() => onChange({ ...data, esComprado: false })}
              className={`flex-1 py-2 rounded-lg border-2 font-medium transition
                ${data.esComprado === false 
                  ? 'bg-red-600 text-white border-red-600' 
                  : darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
              No
            </button>
          </div>
        </div>

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

        {data.esComprado && (
          <div>
            <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
              Proveedor
            </label>
            <select
              value={data.proveedor?.id || ''}
              onChange={(e) => onChange({ ...data, proveedor: proveedores.find((prov) => prov.id == Number(e.target.value)) || null })}
              className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
                ${darkMode
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-800'
                }`}>
              <option value="">Seleccionar proveedor</option>
              {proveedores.map((prov) => (
                <option key={prov.id} value={prov.id}>{prov.nombre}</option>
              ))}
            </select>
          </div>
        )}

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
            Fecha de Entrada
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
            disabled={!data.empresa || !data.material || !data.cantidad || data.esComprado === null || (data.esComprado && !data.proveedor)}
            className={`flex-1 px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition
              ${(!data.empresa || !data.material || !data.cantidad || data.esComprado === null || (data.esComprado && !data.proveedor)) ? 'opacity-50 cursor-not-allowed' : ''}`}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}

import { MovimientoData } from '../../../api/almacenmateriales/types'

interface ConfirmacionViewProps {
  darkMode: boolean
  data: MovimientoData | any
  onGenerarTicket: () => void
  onBack: () => void
}

export default function ConfirmacionView({ darkMode, data, onGenerarTicket, onBack }: ConfirmacionViewProps) {
  if (!data || !data.tipo) {
    return (
      <div className={`w-full max-w-xl mx-auto rounded-3xl shadow-2xl p-10 flex flex-col items-center pt-20 relative z-0 transition
        ${darkMode
          ? 'bg-white/10 backdrop-blur-lg border-2 border-orange-400'
          : 'bg-white border-2 border-orange-200'
        }`}>
        <h1 className={`text-3xl font-extrabold mb-6 text-center drop-shadow-xl
          ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
          Información incompleta
        </h1>
        <p className={darkMode ? 'text-orange-100' : 'text-gray-700'}>
          No se encontró la información del movimiento.<br />
          Por favor regresa e inténtalo de nuevo.
        </p>
        <button
          onClick={onBack}
          className={`mt-8 px-6 py-3 rounded-xl border-2 font-bold transition
            ${darkMode
              ? 'border-orange-400 text-orange-300 hover:bg-orange-900/30'
              : 'border-orange-300 text-orange-700 hover:bg-orange-100'
            }`}>
          Regresar
        </button>
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
        Confirmación de {data.tipo === 'entrada' ? 'Entrada' : 
                        data.tipo === 'salida' ? 'Salida' : 'Intercambio'}
      </h1>
      <div className={`w-full rounded-xl p-6 mb-6 ${darkMode ? 'bg-black/30' : 'bg-orange-50'}`}>
        <h2 className={`font-bold text-lg mb-4 ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
          {data.tipo === 'entrada' ? 'MENÚ DE CONFIRMACIÓN ENTRADAS DEL ALMACÉN' : 
           data.tipo === 'salida' ? 'MENÚ DE CONFIRMACIÓN SALIDAS DEL ALMACÉN' : 'CONFIRMACIÓN DE INTERCAMBIO'}
        </h2>
        <div className="space-y-4">
          <div>
            <span className={`font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>FECHA: </span>
            <span className={darkMode ? 'text-white' : 'text-gray-800'}>{data.fecha}</span>
          </div>
          
          {data.tipo === 'intercambio' ? (
            <>
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                <h3 className={`font-bold mb-2 ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>ORIGEN</h3>
                <div className="mb-2">
                  <span className={`font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>EMPRESA: </span>
                  <span className={darkMode ? 'text-white' : 'text-gray-800'}>{data.empresaOrigen?.nombre}</span>
                </div>
                <div className="mb-2">
                  <span className={`font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>MATERIAL: </span>
                  <span className={darkMode ? 'text-white' : 'text-gray-800'}>{data.materialOrigen?.nombre}</span>
                </div>
                <div>
                  <span className={`font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>CANTIDAD: </span>
                  <span className={darkMode ? 'text-white' : 'text-gray-800'}>{data.cantidadOrigen}</span>
                </div>
              </div>
              
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                <h3 className={`font-bold mb-2 ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>DESTINO</h3>
                <div className="mb-2">
                  <span className={`font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>EMPRESA: </span>
                  <span className={darkMode ? 'text-white' : 'text-gray-800'}>{data.empresaDestino?.nombre}</span>
                </div>
                <div className="mb-2">
                  <span className={`font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>MATERIAL: </span>
                  <span className={darkMode ? 'text-white' : 'text-gray-800'}>{data.materialDestino?.nombre}</span>
                </div>
                <div>
                  <span className={`font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>CANTIDAD: </span>
                  <span className={darkMode ? 'text-white' : 'text-gray-800'}>{data.cantidadDestino}</span>
                </div>
              </div>
              
              {data.notas && (
                <div>
                  <span className={`font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>NOTAS: </span>
                  <span className={darkMode ? 'text-white' : 'text-gray-800'}>{data.notas}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <span className={`font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>EMPRESA: </span>
                <span className={darkMode ? 'text-white' : 'text-gray-800'}>{data.empresa?.nombre}</span>
              </div>
              
              {data.tipo === 'entrada' ? (
                <>
                  <div>
                    <span className={`font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>COMPRADO: </span>
                    <span className={darkMode ? 'text-white' : 'text-gray-800'}>
                      {data.esComprado ? 'Sí' : 'No'}
                    </span>
                  </div>
                  {data.esComprado && (
                    <div>
                      <span className={`font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>PROVEEDOR: </span>
                      <span className={darkMode ? 'text-white' : 'text-gray-800'}>{data.proveedor?.nombre}</span>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <span className={`font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>AGRICULTOR: </span>
                  <span className={darkMode ? 'text-white' : 'text-gray-800'}>{data.agricultor?.nombre}</span>
                </div>
              )}
              
              <div>
                <span className={`font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>MATERIAL: </span>
                <span className={darkMode ? 'text-white' : 'text-gray-800'}>{data.material?.nombre}</span>
              </div>
              <div>
                <span className={`font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>CANTIDAD: </span>
                <span className={darkMode ? 'text-white' : 'text-gray-800'}>{data.cantidad}</span>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="w-full flex flex-col gap-4">
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className={`flex-1 px-6 py-3 rounded-xl border-2 font-bold transition
              ${darkMode
                ? 'border-orange-400 text-orange-300 hover:bg-orange-900/30'
                : 'border-orange-300 text-orange-700 hover:bg-orange-100'
              }`}>
            Editar
          </button>
          <button
            onClick={onBack}
            className={`flex-1 px-6 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition`}>
            Eliminar
          </button>
        </div>
        <button
          onClick={onGenerarTicket}
          className={`w-full px-6 py-4 rounded-xl font-bold text-white transition
            ${data.tipo === 'entrada'
              ? 'bg-blue-600 hover:bg-blue-700'
              : data.tipo === 'salida'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}>
          {data.tipo === 'entrada' ? 'CONFIRMAR ENTRADA' : 
           data.tipo === 'salida' ? 'CONFIRMAR SALIDA' : 'CONFIRMAR INTERCAMBIO'}
        </button>
      </div>
    </div>
  )
}
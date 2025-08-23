interface Material {
  id: number;
  nombre: string;
  cantidad: number;
  unidad: string;
}

interface FormularioMovimientoProps {
  modoNoche: boolean;
  tipo: string;
  setVistaActiva: (vista: string) => void;
  materiales: Material[];
  softShadow: string;
}

export default function FormularioMovimiento({ 
  modoNoche, 
  tipo, 
  setVistaActiva, 
  materiales, 
  softShadow 
}: FormularioMovimientoProps) {
  
  const titulo = tipo === 'entradas' ? 'Registrar Entrada' : 
                 tipo === 'salidas' ? 'Registrar Salida' : 'Registrar Intercambio';
  
  const colorBoton = tipo === 'entradas' ? 'bg-green-600 hover:bg-green-700' :
                     tipo === 'salidas' ? 'bg-red-600 hover:bg-red-700' :
                     'bg-purple-600 hover:bg-purple-700';

  return (
    <div className={`rounded-2xl p-6 ${modoNoche ? 'bg-[#232323]' : 'bg-white'} ${softShadow}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`rounded-full p-3 ${
          tipo === 'entradas' ? 'bg-green-100 text-green-600' :
          tipo === 'salidas' ? 'bg-red-100 text-red-600' :
          'bg-purple-100 text-purple-600'
        }`}>
          <span className="text-2xl">
            {tipo === 'entradas' ? '📥' : tipo === 'salidas' ? '📤' : '🔄'}
          </span>
        </div>
        <h3 className="text-2xl font-semibold">{titulo}</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div>
          <label className={`block mb-2 font-medium ${modoNoche ? 'text-orange-200' : 'text-orange-700'}`}>
            Material
          </label>
          <select className={`w-full p-3 rounded-lg border ${
            modoNoche 
              ? 'bg-[#2a2a2a] border-orange-700 text-white' 
              : 'bg-white border-orange-300 text-gray-800'
          }`}>
            <option>Seleccionar material</option>
            {materiales.map((material) => (
              <option key={material.id} value={material.id}>{material.nombre}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className={`block mb-2 font-medium ${modoNoche ? 'text-orange-200' : 'text-orange-700'}`}>
            Cantidad
          </label>
          <input 
            type="number" 
            className={`w-full p-3 rounded-lg border ${
              modoNoche 
                ? 'bg-[#2a2a2a] border-orange-700 text-white' 
                : 'bg-white border-orange-300 text-gray-800'
            }`}
            placeholder="Ingrese la cantidad"
          />
        </div>

        {tipo === 'entradas' && (
          <div>
            <label className={`block mb-2 font-medium ${modoNoche ? 'text-orange-200' : 'text-orange-700'}`}>
              Proveedor
            </label>
            <select className={`w-full p-3 rounded-lg border ${
              modoNoche 
                ? 'bg-[#2a2a2a] border-orange-700 text-white' 
                : 'bg-white border-orange-300 text-gray-800'
            }`}>
              <option>Seleccionar proveedor</option>
              <option>UNIPACK</option>
              <option>EMPAQUES DEL NORTE</option>
              <option>PROVEEDOR XYZ</option>
            </select>
          </div>
        )}

        {tipo === 'salidas' && (
          <div>
            <label className={`block mb-2 font-medium ${modoNoche ? 'text-orange-200' : 'text-orange-700'}`}>
              Agricultor
            </label>
            <select className={`w-full p-3 rounded-lg border ${
              modoNoche 
                ? 'bg-[#2a2a2a] border-orange-700 text-white' 
                : 'bg-white border-orange-300 text-gray-800'
            }`}>
              <option>Seleccionar agricultor</option>
              <option>Juan Pérez</option>
              <option>María Gómez</option>
              <option>Carlos Rodríguez</option>
            </select>
          </div>
        )}

        {(tipo === 'intercambios') && (
          <>
            <div>
              <label className={`block mb-2 font-medium ${modoNoche ? 'text-orange-200' : 'text-orange-700'}`}>
                Origen
              </label>
              <select className={`w-full p-3 rounded-lg border ${
                modoNoche 
                  ? 'bg-[#2a2a2a] border-orange-700 text-white' 
                  : 'bg-white border-orange-300 text-gray-800'
              }`}>
                <option>Seleccionar origen</option>
                <option>Almacén Principal</option>
                <option>Almacén Norte</option>
                <option>Almacén Sur</option>
              </select>
            </div>
            
            <div>
              <label className={`block mb-2 font-medium ${modoNoche ? 'text-orange-200' : 'text-orange-700'}`}>
                Destino
              </label>
              <select className={`w-full p-3 rounded-lg border ${
                modoNoche 
                  ? 'bg-[#2a2a2a] border-orange-700 text-white' 
                  : 'bg-white border-orange-300 text-gray-800'
              }`}>
                <option>Seleccionar destino</option>
                <option>Almacén Principal</option>
                <option>Almacén Norte</option>
                <option>Almacén Sur</option>
              </select>
            </div>
          </>
        )}

        <div>
          <label className={`block mb-2 font-medium ${modoNoche ? 'text-orange-200' : 'text-orange-700'}`}>
            Fecha
          </label>
          <input 
            type="date" 
            className={`w-full p-3 rounded-lg border ${
              modoNoche 
                ? 'bg-[#2a2a2a] border-orange-700 text-white' 
                : 'bg-white border-orange-300 text-gray-800'
            }`}
          />
        </div>
        
        <div>
          <label className={`block mb-2 font-medium ${modoNoche ? 'text-orange-200' : 'text-orange-700'}`}>
            Observaciones
            </label>
          <textarea 
            className={`w-full p-3 rounded-lg border ${
              modoNoche 
                ? 'bg-[#2a2a2a] border-orange-700 text-white' 
                : 'bg-white border-orange-300 text-gray-800'
            }`}
            rows={3}
            placeholder="Notas adicionales..."
          ></textarea>
        </div>
      </div>

      <div className="flex gap-4 justify-end">
        <button 
          className={`px-6 py-3 rounded-lg font-medium ${
            modoNoche 
              ? 'bg-gray-600 hover:bg-gray-700' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          onClick={() => setVistaActiva('inicio')}
        >
          Cancelar
        </button>
        <button className={`px-6 py-3 rounded-lg font-medium text-white ${colorBoton}`}>
          {tipo === 'entradas' ? 'Registrar Entrada' :
           tipo === 'salidas' ? 'Registrar Salida' : 'Registrar Intercambio'}
        </button>
      </div>
    </div>
  )
}
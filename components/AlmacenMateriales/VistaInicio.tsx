interface ModuloAlmacen {
  nombre: string;
  vista: string;
  icon: string;
}

interface Material {
  id: number;
  nombre: string;
  cantidad: number;
  unidad: string;
}

interface Movimiento {
  id: number;
  tipo: string;
  fecha: string;
  material: string;
  cantidad: number;
  origen: string;
  destino: string;
}

interface VistaInicioProps {
  modoNoche: boolean;
  modulosAlmacen: ModuloAlmacen[];
  setVistaActiva: (vista: string) => void;
  materiales: Material[];
  movimientos: Movimiento[];
  softShadow: string;
}

export default function VistaInicio({ 
  modoNoche, 
  modulosAlmacen, 
  setVistaActiva, 
  materiales, 
  movimientos, 
  softShadow 
}: VistaInicioProps) {
  
  // Calcular estadísticas
  const totalMateriales = materiales.reduce((sum, m) => sum + m.cantidad, 0);
  const totalEntradas = movimientos.filter(m => m.tipo === 'entrada').length;
  const totalSalidas = movimientos.filter(m => m.tipo === 'salida').length;
  const totalIntercambios = movimientos.filter(m => m.tipo === 'intercambio').length;

  return (
    <div className="flex flex-col gap-8">
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={`rounded-2xl p-5 flex flex-col ${modoNoche ? 'bg-[#232323]' : 'bg-white'} ${softShadow}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Total Materiales</h3>
            <span className="text-2xl">📦</span>
          </div>
          <p className="text-3xl font-bold text-orange-500">{totalMateriales}</p>
          <p className={`text-sm ${modoNoche ? 'text-gray-400' : 'text-gray-500'} mt-1`}>unidades en inventario</p>
        </div>
        
        <div className={`rounded-2xl p-5 flex flex-col ${modoNoche ? 'bg-[#232323]' : 'bg-white'} ${softShadow}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Entradas</h3>
            <span className="text-2xl">📥</span>
          </div>
          <p className="text-3xl font-bold text-green-500">{totalEntradas}</p>
          <p className={`text-sm ${modoNoche ? 'text-gray-400' : 'text-gray-500'} mt-1`}>registradas este mes</p>
        </div>
        
        <div className={`rounded-2xl p-5 flex flex-col ${modoNoche ? 'bg-[#232323]' : 'bg-white'} ${softShadow}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Salidas</h3>
            <span className="text-2xl">📤</span>
          </div>
          <p className="text-3xl font-bold text-red-500">{totalSalidas}</p>
          <p className={`text-sm ${modoNoche ? 'text-gray-400' : 'text-gray-500'} mt-1`}>registradas este mes</p>
        </div>
        
        <div className={`rounded-2xl p-5 flex flex-col ${modoNoche ? 'bg-[#232323]' : 'bg-white'} ${softShadow}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Intercambios</h3>
            <span className="text-2xl">🔄</span>
          </div>
          <p className="text-3xl font-bold text-purple-500">{totalIntercambios}</p>
          <p className={`text-sm ${modoNoche ? 'text-gray-400' : 'text-gray-500'} mt-1`}>realizados este mes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Módulos de acción */}
        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>⚡</span>
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {modulosAlmacen.map((modulo, idx) => {
              let valor = 0;
              let color = '';
              
              if (modulo.nombre === 'Consultar Existencias') {
                valor = materiales.reduce((sum, m) => sum + m.cantidad, 0);
                color = 'from-blue-500 to-cyan-500';
              } else if (modulo.nombre === 'Registrar Entrada') {
                valor = movimientos.filter(m => m.tipo === 'entrada').length;
                color = 'from-green-500 to-emerald-500';
              } else if (modulo.nombre === 'Registrar Salida') {
                valor = movimientos.filter(m => m.tipo === 'salida').length;
                color = 'from-red-500 to-rose-500';
              } else {
                valor = movimientos.filter(m => m.tipo === 'intercambio').length;
                color = 'from-purple-500 to-fuchsia-500';
              }
              
              return (
                <div
                  key={idx}
                  onClick={() => setVistaActiva(modulo.vista)}
                  className={`rounded-2xl p-5 flex items-center cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    modoNoche ? 'bg-[#232323] hover:bg-[#2a2a2a]' : 'bg-white hover:bg-orange-50'
                  } ${softShadow} border border-transparent hover:border-orange-300`}
                >
                  <div className={`rounded-xl p-4 bg-gradient-to-r ${color} text-white mr-4`}>
                    <span className="text-2xl">{modulo.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{modulo.nombre}</h4>
                    <p className="text-2xl font-bold mt-1">{valor}</p>
                  </div>
                  <div className={`rounded-full p-2 ${modoNoche ? 'bg-[#353535]' : 'bg-orange-100'}`}>
                    <span className="text-lg">➡️</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Movimientos recientes */}
        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>🕒</span>
            Movimientos Recientes
          </h3>
          <div className={`rounded-2xl p-6 ${modoNoche ? 'bg-[#232323]' : 'bg-white'} ${softShadow}`}>
            <div className="space-y-4">
              {movimientos.slice(0, 5).map((movimiento) => (
                <div key={movimiento.id} className={`flex items-center gap-4 p-4 rounded-xl border ${
                  modoNoche ? 'border-[#353535] bg-[#2a2a2a]' : 'border-orange-200 bg-orange-50'
                }`}>
                  <div className={`rounded-full p-3 ${
                    movimiento.tipo === 'entrada' ? 'bg-green-100 text-green-600' :
                    movimiento.tipo === 'salida' ? 'bg-red-100 text-red-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    <span className="text-xl">
                      {movimiento.tipo === 'entrada' ? '📥' : movimiento.tipo === 'salida' ? '📤' : '🔄'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{movimiento.material}</p>
                    <p className={`text-sm ${modoNoche ? 'text-gray-400' : 'text-gray-600'}`}>
                      {movimiento.cantidad} unidades • {new Date(movimiento.fecha).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      De: {movimiento.origen} → A: {movimiento.destino}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    movimiento.tipo === 'entrada' ? 'bg-green-100 text-green-800' :
                    movimiento.tipo === 'salida' ? 'bg-red-100 text-red-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {movimiento.tipo.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
            <button 
              className={`w-full mt-4 py-2 rounded-lg text-center font-medium ${
                modoNoche ? 'bg-[#353535] hover:bg-[#404040]' : 'bg-orange-100 hover:bg-orange-200'
              }`}
              onClick={() => setVistaActiva('entradas')}
            >
              Ver todos los movimientos
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
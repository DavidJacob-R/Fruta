interface Material {
  id: number;
  nombre: string;
  cantidad: number;
  unidad: string;
}

interface VistaExistenciasProps {
  modoNoche: boolean;
  materiales: Material[];
  softShadow: string;
}

export default function VistaExistencias({ modoNoche, materiales, softShadow }: VistaExistenciasProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold">Inventario Actual</h3>
        <div className="flex gap-2">
          <button className={`px-4 py-2 rounded-lg font-medium ${
            modoNoche ? 'bg-[#353535] hover:bg-[#404040]' : 'bg-orange-100 hover:bg-orange-200'
          }`}>
            Exportar
          </button>
          <button className={`px-4 py-2 rounded-lg font-medium ${
            modoNoche ? 'bg-[#353535] hover:bg-[#404040]' : 'bg-orange-100 hover:bg-orange-200'
          }`}>
            Filtros
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {materiales.map((material) => {
          const porcentaje = Math.min((material.cantidad / 200) * 100, 100);
          let nivelStock = '';
          let colorBarra = '';
          let colorTexto = '';
          
          if (material.cantidad > 100) {
            nivelStock = 'Alto';
            colorBarra = 'bg-green-500';
            colorTexto = 'text-green-600';
          } else if (material.cantidad > 50) {
            nivelStock = 'Medio';
            colorBarra = 'bg-yellow-500';
            colorTexto = 'text-yellow-600';
          } else {
            nivelStock = 'Bajo';
            colorBarra = 'bg-red-500';
            colorTexto = 'text-red-600';
          }
          
          return (
            <div key={material.id} className={`rounded-2xl p-5 ${modoNoche ? 'bg-[#232323]' : 'bg-white'} ${softShadow}`}>
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-semibold text-lg">{material.nombre}</h4>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${colorTexto} ${
                  modoNoche ? 'bg-opacity-20' : 'bg-opacity-20'
                } ${colorBarra.replace('bg-', 'bg-')}`}>
                  {nivelStock}
                </span>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500">Disponible:</span>
                  <span className="font-bold text-lg">{material.cantidad} {material.unidad}</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${colorBarra}`}
                    style={{ width: `${porcentaje}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Capacidad: 200 {material.unidad}</span>
                <button className={`px-3 py-1 text-sm rounded-lg font-medium ${
                  modoNoche ? 'bg-[#353535] hover:bg-[#404040]' : 'bg-orange-100 hover:bg-orange-200'
                }`}>
                  Detalles
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}
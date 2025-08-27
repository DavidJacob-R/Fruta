interface Material {
  id: number
  nombre: string
  cantidad: number
  unidad: string
}

interface VistaExistenciasProps {
  modoNoche: boolean
  materiales: Material[]
  softShadow: string
}

export default function VistaExistencias({ modoNoche, materiales, softShadow }: VistaExistenciasProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-xl sm:text-2xl font-semibold">Inventario Actual</h3>
        <div className="flex gap-2">
          <button className={`px-4 py-2 rounded-lg font-medium ${modoNoche ? 'bg-[#353535] hover:bg-[#404040] text-white' : 'bg-orange-100 hover:bg-orange-200 text-[#1a1a1a]'}`}>
            Exportar
          </button>
          <button className={`px-4 py-2 rounded-lg font-medium ${modoNoche ? 'bg-[#353535] hover:bg-[#404040] text-white' : 'bg-orange-100 hover:bg-orange-200 text-[#1a1a1a]'}`}>
            Filtros
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {materiales.map((material) => {
          const porcentaje = Math.min((material.cantidad / 200) * 100, 100)
          let nivel = 'Bajo'
          let barra = 'bg-red-500'
          let tBadge = 'text-red-700'
          let bgBadge = 'bg-red-100'
          if (material.cantidad > 100) {
            nivel = 'Alto'
            barra = 'bg-green-500'
            tBadge = 'text-green-700'
            bgBadge = 'bg-green-100'
          } else if (material.cantidad > 50) {
            nivel = 'Medio'
            barra = 'bg-yellow-500'
            tBadge = 'text-yellow-700'
            bgBadge = 'bg-yellow-100'
          }
          return (
            <div key={material.id} className={`rounded-2xl p-4 sm:p-5 ${modoNoche ? 'bg-[#232323]' : 'bg-white'} ${softShadow}`}>
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-lg">{material.nombre}</h4>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${bgBadge} ${tBadge}`}>{nivel}</span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className={`${modoNoche ? 'text-white/70' : 'text-gray-600'} text-sm`}>Disponible:</span>
                  <span className="font-bold text-lg">{material.cantidad} {material.unidad}</span>
                </div>
                <div className={`${modoNoche ? 'bg-white/10' : 'bg-gray-200'} rounded-full h-2.5`}>
                  <div className={`h-2.5 rounded-full ${barra}`} style={{ width: `${porcentaje}%` }}></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${modoNoche ? 'text-white/70' : 'text-gray-600'} text-sm`}>Capacidad: 200 {material.unidad}</span>
                <button className={`px-3 py-1 text-sm rounded-lg font-medium ${modoNoche ? 'bg-[#353535] hover:bg-[#404040] text-white' : 'bg-orange-100 hover:bg-orange-200 text-[#1a1a1a]'}`}>
                  Detalles
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import BarraLateral from './BarraLateral'
import VistaInicio from './VistaInicio'
import VistaExistencias from './VistaExistencias'
import FormularioMovimiento from './FormularioMovimiento'

interface Modulo {
  nombre: string;
  ruta: string;
  icon: string;
}

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

export default function AlmacenMateriales() {
  const [email, setEmail] = useState<string>('')
  const [modoNoche, setModoNoche] = useState<boolean>(true)
  const [vistaActiva, setVistaActiva] = useState<string>('inicio')
  const router = useRouter()

  useEffect(() => {
    const temaGuardado = localStorage.getItem('tema')
    if (temaGuardado) setModoNoche(temaGuardado === 'noche')

    const usuario = localStorage.getItem('usuario')
    if (usuario) {
      const user = JSON.parse(usuario)
      setEmail(user.email)
    } else {
      router.push('/login')
    }
  }, [])

  const modulos: Modulo[] = [
    { nombre: 'Almacen de Materiales', ruta: '/panel/administradorRutas/AlmacenMateriales', icon: '🏗️' },
    { nombre: 'Empaques y Clamshell', ruta: '/panel/administradorRutas/Materiales/empaques', icon: '📦' },
    { nombre: 'Agregar empresas', ruta: '/panel/administradorRutas/AgregarEmpresa/agregar-empres', icon: '🏢' },
    { nombre: 'Agregar frutas', ruta: '/panel/administradorRutas/AgregarFrutas/agregar-frutas', icon: '🍓' },
    { nombre: 'Agregar agricultores', ruta: '/panel/administradorRutas/AgregarAgricultor/agregar-agricultores', icon: '👨‍🌾' },
    { nombre: 'Notas', ruta: '/panel/administradorRutas/notas/notas', icon: '📝' },
    { nombre: 'Temporadas', ruta: '/panel/administradorRutas/Temporadas/temporadas', icon: '🌱' },
  ]

  const modulosAlmacen: ModuloAlmacen[] = [
    { nombre: 'Registrar Entrada', vista: 'entradas', icon: '📥' },
    { nombre: 'Registrar Salida', vista: 'salidas', icon: '📤' },
    { nombre: 'Intercambios', vista: 'intercambios', icon: '🔄' },
    { nombre: 'Consultar Existencias', vista: 'existencias', icon: '📊' },
  ]

  // Datos de ejemplo
  const materiales: Material[] = [
    { id: 1, nombre: 'CAJA DKLSMDS', cantidad: 150, unidad: 'unidades' },
    { id: 2, nombre: 'CLAMSHELL 12OZ', cantidad: 300, unidad: 'unidades' },
    { id: 3, nombre: 'BANDEJA PLÁSTICA', cantidad: 85, unidad: 'unidades' },
    { id: 4, nombre: 'BOLSA DE RED', cantidad: 200, unidad: 'unidades' },
    { id: 5, nombre: 'ETIQUETAS ADHESIVAS', cantidad: 500, unidad: 'unidades' },
    { id: 6, nombre: 'FILM STRETCH', cantidad: 45, unidad: 'rollos' },
  ]

  const movimientos: Movimiento[] = [
    { id: 1, tipo: 'entrada', fecha: '2024-01-15', material: 'CAJA DKLSMDS', cantidad: 50, origen: 'UNIPACK', destino: 'Almacén Principal' },
    { id: 2, tipo: 'salida', fecha: '2024-01-16', material: 'CLAMSHELL 12OZ', cantidad: 25, origen: 'Almacén Principal', destino: 'Juan Pérez' },
    { id: 3, tipo: 'intercambio', fecha: '2024-01-17', material: 'BANDEJA PLÁSTICA', cantidad: 15, origen: 'Almacén A', destino: 'Almacén B' },
    { id: 4, tipo: 'entrada', fecha: '2024-01-18', material: 'BOLSA DE RED', cantidad: 100, origen: 'EMPAQUES DEL NORTE', destino: 'Almacén Principal' },
    { id: 5, tipo: 'salida', fecha: '2024-01-18', material: 'ETIQUETAS ADHESIVAS', cantidad: 75, origen: 'Almacén Principal', destino: 'María Gómez' },
  ]

  const bgDay = "bg-[#f6f4f2]"
  const cardDay = "bg-[#f8f7f5] border border-orange-200"
  const textDay = "text-[#1a1a1a]"
  const accentDay = "text-orange-600"
  const softShadow = "shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]"

  const bgNight = "bg-[#161616]"
  const cardNight = "bg-[#232323] border border-[#353535]"
  const textNight = "text-white"
  const accentNight = "text-orange-400"

  return (
    <div className={`${modoNoche ? bgNight : bgDay} min-h-screen ${modoNoche ? textNight : textDay} transition-colors duration-300 flex`}>

      <BarraLateral
        email={email}
        modoNoche={modoNoche}
        modulos={modulos}
        router={router}
        accentNight={accentNight}
        accentDay={accentDay}
        cardNight={cardNight}
        cardDay={cardDay}
        softShadow={softShadow}
      />

      <main className="flex-1 p-6 md:p-8 flex flex-col gap-8 overflow-auto">
        {/* Encabezado */}
        <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Almacén de Materiales</h1>
              <p className="text-orange-100">
                {vistaActiva === 'inicio' ? 'Resumen general del inventario' :
                vistaActiva === 'existencias' ? 'Gestión de existencias y control de stock' :
                vistaActiva === 'entradas' ? 'Registro de entradas de materiales' :
                vistaActiva === 'salidas' ? 'Registro de salidas de materiales' : 'Registro de intercambios entre almacenes'}
              </p>
            </div>
            <div className="flex gap-2">
              {vistaActiva !== 'inicio' && (
                <button 
                  onClick={() => setVistaActiva('inicio')}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                >
                  Volver al Inicio
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Navegación interna */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setVistaActiva('inicio')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              vistaActiva === 'inicio' 
                ? 'bg-orange-500 text-white' 
                : modoNoche 
                  ? 'bg-[#353535] hover:bg-[#404040]' 
                  : 'bg-orange-100 hover:bg-orange-200'
            }`}
          >
            📊 Resumen
          </button>
          <button
            onClick={() => setVistaActiva('entradas')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              vistaActiva === 'entradas' 
                ? 'bg-green-500 text-white' 
                : modoNoche 
                  ? 'bg-[#353535] hover:bg-[#404040]' 
                  : 'bg-orange-100 hover:bg-orange-200'
            }`}
          >
            📥 Entradas
          </button>
          <button
            onClick={() => setVistaActiva('salidas')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              vistaActiva === 'salidas' 
                ? 'bg-red-500 text-white' 
                : modoNoche 
                  ? 'bg-[#353535] hover:bg-[#404040]' 
                  : 'bg-orange-100 hover:bg-orange-200'
            }`}
          >
            📤 Salidas
          </button>
          <button
            onClick={() => setVistaActiva('intercambios')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              vistaActiva === 'intercambios' 
                ? 'bg-purple-500 text-white' 
                : modoNoche 
                  ? 'bg-[#353535] hover:bg-[#404040]' 
                  : 'bg-orange-100 hover:bg-orange-200'
            }`}
          >
            🔄 Intercambios
          </button>
          <button
            onClick={() => setVistaActiva('existencias')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              vistaActiva === 'existencias' 
                ? 'bg-blue-500 text-white' 
                : modoNoche 
                  ? 'bg-[#353535] hover:bg-[#404040]' 
                  : 'bg-orange-100 hover:bg-orange-200'
            }`}
          >
            📦 Existencias
          </button>
        </div>

        {/* Contenido principal */}
        {vistaActiva === 'inicio' && (
          <VistaInicio
            modoNoche={modoNoche}
            modulosAlmacen={modulosAlmacen}
            setVistaActiva={setVistaActiva}
            materiales={materiales}
            movimientos={movimientos}
            softShadow={softShadow}
          />
        )}
        
        {vistaActiva === 'existencias' && (
          <VistaExistencias
            modoNoche={modoNoche}
            materiales={materiales}
            softShadow={softShadow}
          />
        )}
        
        {(vistaActiva === 'entradas' || vistaActiva === 'salidas' || vistaActiva === 'intercambios') && (
          <FormularioMovimiento
            modoNoche={modoNoche}
            tipo={vistaActiva}
            setVistaActiva={setVistaActiva}
            materiales={materiales}
            softShadow={softShadow}
          />
        )}
      </main>
    </div>
  )
}
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useUi } from 'components/ui-context'
import VistaInicio from '../../../../components/AlmacenMateriales/VistaInicio'
import VistaExistencias from '../../../../components/AlmacenMateriales/VistaExistencias'
import FormularioMovimiento from '../../../../components/AlmacenMateriales/FormularioMovimiento'
import CatalogoMateriales from '../../../../components/AlmacenMateriales/CatalogoMateriales'

interface ModuloAlmacen {
  nombre: string
  vista: string
  icon: string
}

interface Material {
  id: number
  nombre: string
  cantidad: number
  unidad: string
}

interface MovimientoRow {
  id: number
  tipo: string
  fecha: string
  material: string
  cantidad: number
  origen: string | null
  destino: string | null
  proveedor: string | null
  agricultor: string | null
  unidad: string | null
  notas: string | null
}

export default function AlmacenMateriales() {
  const router = useRouter()
  const { darkMode } = useUi()
  const [vistaActiva, setVistaActiva] = useState<string>('inicio')
  const [materiales, setMateriales] = useState<Material[]>([])
  const [movimientos, setMovimientos] = useState<MovimientoRow[]>([])

  useEffect(() => {
    const usuario = localStorage.getItem('usuario')
    if (!usuario) router.push('/login')
  }, [router])

  const cargarMateriales = useCallback(async () => {
    const r = await fetch('/api/almacen/materiales')
    const j = await r.json()
    const lista = Array.isArray(j) ? j : []
    const vistos = new Set<number>()
    const limpios: Material[] = []
    for (const d of lista) {
      const id = Number(d.id)
      if (vistos.has(id)) continue
      const cantidadNum = typeof d.cantidad === 'string' ? parseFloat(d.cantidad) : Number(d.cantidad ?? 0)
      limpios.push({
        id,
        nombre: String(d.nombre || ''),
        unidad: String(d.unidad || ''),
        cantidad: isNaN(cantidadNum) ? 0 : cantidadNum
      })
      vistos.add(id)
    }
    setMateriales(limpios)
  }, [])

  const cargarMovimientos = useCallback(async () => {
    const r = await fetch('/api/almacen/movimientos?limit=50')
    const j = await r.json()
    const lista = Array.isArray(j) ? j : []
    const limpios: MovimientoRow[] = lista.map((m: any) => ({
      id: Number(m.id),
      tipo: String(m.tipo || ''),
      fecha: String(m.fecha || ''),
      material: String(m.material || ''),
      cantidad: typeof m.cantidad === 'string' ? parseFloat(m.cantidad) : Number(m.cantidad ?? 0),
      origen: m.origen ?? null,
      destino: m.destino ?? null,
      proveedor: m.proveedor ?? null,
      agricultor: m.agricultor ?? null,
      unidad: m.unidad ?? null,
      notas: m.notas ?? null
    }))
    setMovimientos(limpios)
  }, [])

  const recargarTodo = useCallback(async () => {
    await Promise.all([cargarMateriales(), cargarMovimientos()])
  }, [cargarMateriales, cargarMovimientos])

  useEffect(() => {
    recargarTodo()
  }, [recargarTodo])

  useEffect(() => {
    if (vistaActiva === 'inicio') recargarTodo()
  }, [vistaActiva, recargarTodo])

  const modulosAlmacen: ModuloAlmacen[] = [
    { nombre: 'Registrar Entrada', vista: 'entradas', icon: '📥' },
    { nombre: 'Registrar Salida', vista: 'salidas', icon: '📤' },
    { nombre: 'Intercambios', vista: 'intercambios', icon: '🔄' },
    { nombre: 'Consultar Existencias', vista: 'existencias', icon: '📊' },
    { nombre: 'Materiales', vista: 'catalogo', icon: '🧩' }
  ]

  const textDay = 'text-[#1a1a1a]'
  const textNight = 'text-white'
  const softShadow = 'shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]'

  return (
    <div className={`${darkMode ? textNight : textDay} flex flex-col gap-5 sm:gap-8`}>
      <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 truncate">Almacen de Materiales</h1>
            <p className="text-orange-100 text-sm sm:text-base">
              {vistaActiva === 'inicio' ? 'Resumen general del inventario' :
              vistaActiva === 'existencias' ? 'Gestion de existencias y control de stock' :
              vistaActiva === 'entradas' ? 'Registro de entradas de materiales' :
              vistaActiva === 'salidas' ? 'Registro de salidas de materiales' :
              vistaActiva === 'catalogo' ? 'Alta y gestion de materiales' : 'Registro de intercambios entre almacenes'}
            </p>
          </div>
          {vistaActiva !== 'inicio' && (
            <button
              onClick={() => setVistaActiva('inicio')}
              className="px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-sm font-semibold"
            >
              Volver al inicio
            </button>
          )}
        </div>
      </section>

      <div className={`sticky top-0 z-10 ${darkMode ? 'bg-[#161616]' : 'bg-[#f6f4f2]'}/85 backdrop-blur`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory">
            <button
              onClick={() => setVistaActiva('inicio')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap snap-start ${vistaActiva === 'inicio' ? 'bg-orange-500 text-white' : darkMode ? 'bg-[#353535] hover:bg-[#404040] text-white' : 'bg-orange-100 hover:bg-orange-200 text-[#1a1a1a]'}`}
            >
              📊 Resumen
            </button>
            <button
              onClick={() => setVistaActiva('entradas')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap snap-start ${vistaActiva === 'entradas' ? 'bg-green-500 text-white' : darkMode ? 'bg-[#353535] hover:bg-[#404040] text-white' : 'bg-orange-100 hover:bg-orange-200 text-[#1a1a1a]'}`}
            >
              📥 Entradas
            </button>
            <button
              onClick={() => setVistaActiva('salidas')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap snap-start ${vistaActiva === 'salidas' ? 'bg-red-500 text-white' : darkMode ? 'bg-[#353535] hover:bg-[#404040] text-white' : 'bg-orange-100 hover:bg-orange-200 text-[#1a1a1a]'}`}
            >
              📤 Salidas
            </button>
            <button
              onClick={() => setVistaActiva('intercambios')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap snap-start ${vistaActiva === 'intercambios' ? 'bg-purple-500 text-white' : darkMode ? 'bg-[#353535] hover:bg-[#404040] text-white' : 'bg-orange-100 hover:bg-orange-200 text-[#1a1a1a]'}`}
            >
              🔄 Intercambios
            </button>
            <button
              onClick={() => setVistaActiva('existencias')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap snap-start ${vistaActiva === 'existencias' ? 'bg-blue-500 text-white' : darkMode ? 'bg-[#353535] hover:bg-[#404040] text-white' : 'bg-orange-100 hover:bg-orange-200 text-[#1a1a1a]'}`}
            >
              📦 Existencias
            </button>
            <button
              onClick={() => setVistaActiva('catalogo')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap snap-start ${vistaActiva === 'catalogo' ? 'bg-indigo-500 text-white' : darkMode ? 'bg-[#353535] hover:bg-[#404040] text-white' : 'bg-orange-100 hover:bg-orange-200 text-[#1a1a1a]'}`}
            >
              🧩 Materiales
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8">
        {vistaActiva === 'inicio' && (
          <VistaInicio
            modoNoche={darkMode}
            modulosAlmacen={modulosAlmacen}
            setVistaActiva={setVistaActiva}
            materiales={materiales}
            movimientos={movimientos.map(m => ({
              id: m.id,
              tipo: m.tipo === 'entrada' ? 'entrada' : m.tipo === 'salida' ? 'salida' : 'intercambio',
              fecha: m.fecha,
              material: m.material,
              cantidad: typeof m.cantidad === 'number' ? m.cantidad : 0,
              origen: m.origen || 'N/A',
              destino: m.destino || 'N/A'
            }))}
            softShadow={softShadow}
          />
        )}

        {vistaActiva === 'existencias' && (
          <VistaExistencias
            modoNoche={darkMode}
            materiales={materiales}
            softShadow={softShadow}
          />
        )}

        {(vistaActiva === 'entradas' || vistaActiva === 'salidas' || vistaActiva === 'intercambios') && (
          <FormularioMovimiento
            modoNoche={darkMode}
            tipo={vistaActiva}
            setVistaActiva={setVistaActiva}
            materiales={materiales}
            softShadow={softShadow}
            onDone={async () => {
              await recargarTodo()
              setVistaActiva('inicio')
            }}
          />
        )}

        {vistaActiva === 'catalogo' && (
          <CatalogoMateriales
            modoNoche={darkMode}
            softShadow={softShadow}
            onChanged={async () => {
              await cargarMateriales()
            }}
          />
        )}
      </div>
    </div>
  )
}

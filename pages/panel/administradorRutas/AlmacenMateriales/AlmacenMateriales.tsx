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
    <div className={`${darkMode ? textNight : textDay} flex flex-col gap-8`}>
      <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Almacen de Materiales</h1>
            <p className="text-orange-100">
              {vistaActiva === 'inicio' ? 'Resumen general del inventario' :
              vistaActiva === 'existencias' ? 'Gestion de existencias y control de stock' :
              vistaActiva === 'entradas' ? 'Registro de entradas de materiales' :
              vistaActiva === 'salidas' ? 'Registro de salidas de materiales' :
              vistaActiva === 'catalogo' ? 'Alta y gestion de materiales' : 'Registro de intercambios entre almacenes'}
            </p>
          </div>
          <div className="flex gap-2">
            {vistaActiva !== 'inicio' && (
              <button
                onClick={() => setVistaActiva('inicio')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
              >
                Volver al inicio
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setVistaActiva('inicio')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
            vistaActiva === 'inicio'
              ? 'bg-orange-500 text-white'
              : darkMode
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
              : darkMode
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
              : darkMode
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
              : darkMode
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
              : darkMode
                ? 'bg-[#353535] hover:bg-[#404040]'
                : 'bg-orange-100 hover:bg-orange-200'
          }`}
        >
          📦 Existencias
        </button>
        <button
          onClick={() => setVistaActiva('catalogo')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
            vistaActiva === 'catalogo'
              ? 'bg-indigo-500 text-white'
              : darkMode
                ? 'bg-[#353535] hover:bg-[#404040]'
                : 'bg-orange-100 hover:bg-orange-200'
          }`}
        >
          🧩 Materiales
        </button>
      </div>

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
  )
}

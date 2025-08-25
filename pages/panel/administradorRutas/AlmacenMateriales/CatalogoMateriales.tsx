import { useEffect, useMemo, useState } from 'react'

type Item = {
  id: number
  nombre: string
  descripcion: string | null
  unidad_medida: string
  activo: boolean
  cantidad: number
}

type Props = {
  modoNoche: boolean
  softShadow: string
  onChanged?: () => void | Promise<void>
}

export default function CatalogoMateriales({ modoNoche, softShadow, onChanged }: Props) {
  const [items, setItems] = useState<Item[]>([])
  const [filtro, setFiltro] = useState<string>('')
  const [incluirInactivos, setIncluirInactivos] = useState<boolean>(false)
  const [nombre, setNombre] = useState<string>('')
  const [unidad, setUnidad] = useState<string>('')
  const [descripcion, setDescripcion] = useState<string>('')
  const [guardando, setGuardando] = useState<boolean>(false)
  const [cargando, setCargando] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>('')

  async function cargar() {
    setCargando(true)
    setErrorMsg('')
    try {
      const r = await fetch('/api/almacen/tipos-material')
      const j = await r.json()
      const arr = Array.isArray(j) ? j : []
      const norm: Item[] = arr.map((d: any) => ({
        id: Number(d.id),
        nombre: String(d.nombre || ''),
        descripcion: d.descripcion ?? null,
        unidad_medida: String(d.unidad_medida || ''),
        activo: Boolean(d.activo !== false),
        cantidad: typeof d.cantidad === 'string' ? parseFloat(d.cantidad) : Number(d.cantidad || 0)
      }))
      setItems(norm)
    } catch {
      setErrorMsg('error')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const filtrados = useMemo(() => {
    const q = filtro.trim().toLowerCase()
    return items.filter(it => {
      if (!incluirInactivos && !it.activo) return false
      if (!q) return true
      return it.nombre.toLowerCase().includes(q) || it.unidad_medida.toLowerCase().includes(q)
    })
  }, [items, filtro, incluirInactivos])

  async function crear() {
    setGuardando(true)
    setErrorMsg('')
    try {
      const body = { nombre: nombre.trim(), descripcion: descripcion.trim() || null, unidad_medida: unidad.trim() }
      if (!body.nombre || !body.unidad_medida) {
        setErrorMsg('faltan campos')
        setGuardando(false)
        return
      }
      const r = await fetch('/api/almacen/tipos-material', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!r.ok) {
        const j = await r.json().catch(() => null)
        setErrorMsg(j?.error || 'error')
        setGuardando(false)
        return
      }
      setNombre('')
      setUnidad('')
      setDescripcion('')
      await cargar()
      if (onChanged) await onChanged()
    } catch {
      setErrorMsg('error')
    } finally {
      setGuardando(false)
    }
  }

  async function eliminar(id: number) {
    if (!window.confirm('Eliminar definitivamente este material y sus movimientos?')) return
    setGuardando(true)
    setErrorMsg('')
    try {
      const r = await fetch(`/api/almacen/tipos-material?id=${id}&force=1`, { method: 'DELETE' })
      if (!r.ok) {
        const j = await r.json().catch(() => null)
        setErrorMsg(j?.error || 'error')
        setGuardando(false)
        return
      }
      await cargar()
      if (onChanged) await onChanged()
    } catch {
      setErrorMsg('error')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className={`flex flex-col gap-6`}>
      <div className={`rounded-2xl p-6 ${modoNoche ? 'bg-[#232323]' : 'bg-white'} ${softShadow}`}>
        <h3 className="text-xl font-semibold mb-4">Agregar material</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Nombre"
            className={`w-full p-3 rounded-lg border ${modoNoche ? 'bg-[#2a2a2a] border-orange-700 text-white' : 'bg-white border-orange-300 text-gray-800'}`}
          />
          <input
            value={unidad}
            onChange={e => setUnidad(e.target.value)}
            placeholder="Unidad medida"
            className={`w-full p-3 rounded-lg border ${modoNoche ? 'bg-[#2a2a2a] border-orange-700 text-white' : 'bg-white border-orange-300 text-gray-800'}`}
          />
          <input
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Descripcion"
            className={`w-full p-3 rounded-lg border ${modoNoche ? 'bg-[#2a2a2a] border-orange-700 text-white' : 'bg-white border-orange-300 text-gray-800'}`}
          />
        </div>
        {errorMsg && <div className="text-red-600 text-sm mt-3">{errorMsg}</div>}
        <div className="mt-4 flex justify-end">
          <button
            onClick={crear}
            disabled={guardando}
            className={`px-6 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 ${guardando ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {guardando ? 'Guardando...' : 'Agregar'}
          </button>
        </div>
      </div>

      <div className={`rounded-2xl p-6 ${modoNoche ? 'bg-[#232323]' : 'bg-white'} ${softShadow}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Catalogo de materiales</h3>
          <div className="flex items-center gap-3">
            <input
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              placeholder="Buscar"
              className={`p-2 rounded-lg border ${modoNoche ? 'bg-[#2a2a2a] border-orange-700 text-white' : 'bg-white border-orange-300 text-gray-800'}`}
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={incluirInactivos} onChange={e => setIncluirInactivos(e.target.checked)} />
              Ver inactivos
            </label>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className={`${modoNoche ? 'bg-[#2a2a2a]' : 'bg-orange-50'}`}>
                <th className="text-left p-3">Nombre</th>
                <th className="text-left p-3">Unidad</th>
                <th className="text-left p-3">Cantidad</th>
                <th className="text-right p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando && (
                <tr><td className="p-3" colSpan={5}>Cargando...</td></tr>
              )}
              {!cargando && filtrados.length === 0 && (
                <tr><td className="p-3" colSpan={5}>Sin datos</td></tr>
              )}
              {filtrados.map(it => (
                <tr key={it.id} className={`${modoNoche ? 'border-b border-[#353535]' : 'border-b border-orange-100'}`}>
                  <td className="p-3">{it.nombre}</td>
                  <td className="p-3">{it.unidad_medida}</td>
                  <td className="p-3">{typeof it.cantidad === 'number' ? it.cantidad.toFixed(2) : '0.00'}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => eliminar(it.id)}
                      disabled={guardando}
                      className={`px-3 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 ${guardando ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'

interface Material {
  id: number
  nombre: string
  cantidad: number
  unidad: string
}

interface Opcion {
  id: number
  nombre: string
}

interface FormularioMovimientoProps {
  modoNoche: boolean
  tipo: string
  setVistaActiva: (vista: string) => void
  materiales?: Material[]
  softShadow: string
  onDone?: () => void | Promise<void>
}

export default function FormularioMovimiento({
  modoNoche,
  tipo,
  setVistaActiva,
  materiales = [],
  softShadow,
  onDone
}: FormularioMovimientoProps) {
  const titulo = tipo === 'entradas' ? 'Registrar Entrada' : tipo === 'salidas' ? 'Registrar Salida' : 'Registrar Intercambio'
  const colorBoton = tipo === 'entradas' ? 'bg-green-600 hover:bg-green-700' : tipo === 'salidas' ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'

  const [materialId, setMaterialId] = useState<number>(0)
  const [cantidad, setCantidad] = useState<string>('')
  const [proveedorId, setProveedorId] = useState<number>(0)
  const [agricultorId, setAgricultorId] = useState<number>(0)
  const [origen, setOrigen] = useState<string>('')
  const [destino, setDestino] = useState<string>('')
  const [fecha, setFecha] = useState<string>('')
  const [notas, setNotas] = useState<string>('')
  const [proveedores, setProveedores] = useState<Opcion[]>([])
  const [agricultores, setAgricultores] = useState<Opcion[]>([])
  const [guardando, setGuardando] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>('')

  const materialSel = useMemo(() => {
    const lista = Array.isArray(materiales) ? materiales : []
    return lista.find(m => m.id === materialId) || null
  }, [materialId, materiales])

  useEffect(() => {
    if (tipo === 'entradas') {
      fetch('/api/almacen/proveedores').then(r => r.json()).then(j => setProveedores(Array.isArray(j) ? j : []))
    }
    if (tipo === 'salidas') {
      fetch('/api/almacen/agricultores').then(r => r.json()).then(j => setAgricultores(Array.isArray(j) ? j : []))
    }
  }, [tipo])

  useEffect(() => {
    setErrorMsg('')
  }, [materialId, cantidad, proveedorId, agricultorId, origen, destino, fecha])

  async function submitMovimiento() {
    setGuardando(true)
    setErrorMsg('')
    try {
      const body: any = {
        tipo,
        tipo_material_id: materialId,
        cantidad: Number(cantidad),
        fecha_movimiento: fecha || null,
        notas: notas || null
      }
      if (tipo === 'entradas') {
        body.proveedor_id = proveedorId || null
      }
      if (tipo === 'salidas') {
        body.agricultor_id = agricultorId || null
      }
      if (tipo === 'intercambios') {
        body.origen = origen || null
        body.destino = destino || null
      }
      const res = await fetch('/api/almacen/movimientos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const j = await res.json()
      if (!res.ok) {
        setErrorMsg(j?.error || 'error al guardar')
        setGuardando(false)
        return
      }
      setMaterialId(0)
      setCantidad('')
      setProveedorId(0)
      setAgricultorId(0)
      setOrigen('')
      setDestino('')
      setFecha('')
      setNotas('')
      if (onDone) await onDone()
    } catch (e: any) {
      setErrorMsg('error inesperado')
    } finally {
      setGuardando(false)
    }
  }

  const puedeGuardar =
    materialId > 0 &&
    Number(cantidad) > 0 &&
    ((tipo === 'entradas' && proveedorId > 0) || (tipo === 'salidas' && agricultorId > 0) || (tipo === 'intercambios'))

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
          <select
            value={materialId || 0}
            onChange={e => setMaterialId(Number(e.target.value))}
            className={`w-full p-3 rounded-lg border ${
              modoNoche
                ? 'bg-[#2a2a2a] border-orange-700 text-white'
                : 'bg-white border-orange-300 text-gray-800'
            }`}>
            <option value={0}>Seleccionar material</option>
            {materiales.map(m => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block mb-2 font-medium ${modoNoche ? 'text-orange-200' : 'text-orange-700'}`}>
            Cantidad
          </label>
          <input
            type="number"
            value={cantidad}
            onChange={e => setCantidad(e.target.value)}
            className={`w-full p-3 rounded-lg border ${
              modoNoche
                ? 'bg-[#2a2a2a] border-orange-700 text-white'
                : 'bg-white border-orange-300 text-gray-800'
            }`}
            placeholder="Ingrese la cantidad"
          />
          {materialSel && materialSel.unidad && (
            <div className="text-xs mt-1 opacity-70">unidad: {materialSel.unidad}</div>
          )}
        </div>

        {tipo === 'entradas' && (
          <div>
            <label className={`block mb-2 font-medium ${modoNoche ? 'text-orange-200' : 'text-orange-700'}`}>
              Proveedor
            </label>
            <select
              value={proveedorId || 0}
              onChange={e => setProveedorId(Number(e.target.value))}
              className={`w-full p-3 rounded-lg border ${
                modoNoche
                  ? 'bg-[#2a2a2a] border-orange-700 text-white'
                  : 'bg-white border-orange-300 text-gray-800'
              }`}>
              <option value={0}>Seleccionar proveedor</option>
              {proveedores.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        )}

        {tipo === 'salidas' && (
          <div>
            <label className={`block mb-2 font-medium ${modoNoche ? 'text-orange-200' : 'text-orange-700'}`}>
              Agricultor
            </label>
            <select
              value={agricultorId || 0}
              onChange={e => setAgricultorId(Number(e.target.value))}
              className={`w-full p-3 rounded-lg border ${
                modoNoche
                  ? 'bg-[#2a2a2a] border-orange-700 text-white'
                  : 'bg-white border-orange-300 text-gray-800'
              }`}>
              <option value={0}>Seleccionar agricultor</option>
              {agricultores.map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>
        )}

        {tipo === 'intercambios' && (
          <>
            <div>
              <label className={`block mb-2 font-medium ${modoNoche ? 'text-orange-200' : 'text-orange-700'}`}>
                Origen
              </label>
              <input
                value={origen}
                onChange={e => setOrigen(e.target.value)}
                className={`w-full p-3 rounded-lg border ${
                  modoNoche
                    ? 'bg-[#2a2a2a] border-orange-700 text-white'
                    : 'bg-white border-orange-300 text-gray-800'
                }`}
                placeholder="Almacen origen"
              />
            </div>
            <div>
              <label className={`block mb-2 font-medium ${modoNoche ? 'text-orange-200' : 'text-orange-700'}`}>
                Destino
              </label>
              <input
                value={destino}
                onChange={e => setDestino(e.target.value)}
                className={`w-full p-3 rounded-lg border ${
                  modoNoche
                    ? 'bg-[#2a2a2a] border-orange-700 text-white'
                    : 'bg-white border-orange-300 text-gray-800'
                }`}
                placeholder="Almacen destino"
              />
            </div>
          </>
        )}

        <div>
          <label className={`block mb-2 font-medium ${modoNoche ? 'text-orange-200' : 'text-orange-700'}`}>
            Fecha
          </label>
          <input
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            className={`w-full p-3 rounded-lg border ${
              modoNoche
                ? 'bg-[#2a2a2a] border-orange-700 text-white'
                : 'bg-white border-orange-300 text-gray-800'
            }`}
          />
        </div>

        <div>
          <label className={`block mb-2 font-medium ${modoNoche ? 'text-orange-200' : 'text-orange-700'}`}>
            Notas
          </label>
          <textarea
            value={notas}
            onChange={e => setNotas(e.target.value)}
            className={`w-full p-3 rounded-lg border ${
              modoNoche
                ? 'bg-[#2a2a2a] border-orange-700 text-white'
                : 'bg-white border-orange-300 text-gray-800'
            }`}
            rows={3}
            placeholder="Notas adicionales"
          ></textarea>
        </div>
      </div>

      {errorMsg && <div className="text-red-600 text-sm mb-3">{errorMsg}</div>}

      <div className="flex gap-4 justify-end">
        <button
          className={`px-6 py-3 rounded-lg font-medium ${
            modoNoche
              ? 'bg-gray-600 hover:bg-gray-700'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          onClick={() => setVistaActiva('inicio')}
          disabled={guardando}
        >
          Cancelar
        </button>
        <button
          className={`px-6 py-3 rounded-lg font-medium text-white ${colorBoton} ${puedeGuardar ? '' : 'opacity-50 cursor-not-allowed'}`}
          onClick={submitMovimiento}
          disabled={!puedeGuardar || guardando}
        >
          {guardando ? 'Guardando...' : (tipo === 'entradas' ? 'Registrar Entrada' : tipo === 'salidas' ? 'Registrar Salida' : 'Registrar Intercambio')}
        </button>
      </div>
    </div>
  )
}

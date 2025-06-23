import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { format } from 'date-fns'

type SelectOption = {
  value: string
  label: string
}
type SelectFieldProps = {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: SelectOption[]
  required?: boolean
}

// Componente reutilizable para campos select
function SelectField({ label, value, onChange, options, required = false }: SelectFieldProps) {
  return (
    <div className="mb-4">
      <label>{label}</label>
      <select
        value={value}
        onChange={onChange}
        required={required}
        className="w-full p-2 rounded bg-black border border-gray-700 text-white"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}


// Función utilitaria para fecha/hora local en formato para input
function getLocalDateTime() {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm")
}

export default function ControlMateriales() {
  const router = useRouter()
  const [materiales, setMateriales] = useState<any[]>([])
  const [tiposClamshell, setTiposClamshell] = useState<any[]>([])
  const [tiposCaja, setTiposCaja] = useState<any[]>([])
  const [agricultores, setAgricultores] = useState<any[]>([])
  const [movimientos, setMovimientos] = useState<any[]>([])
  const [mensaje, setMensaje] = useState('')

  // Formulario de entrada de materiales
  const [formEntrada, setFormEntrada] = useState({
    tipo_material: '',
    tipo_clamshell_id: '',
    tipo_caja_id: '',
    cantidad: '',
    fecha_entrada: getLocalDateTime(),
    notas: ''
  })

  // Formulario de salida de materiales
  const [formSalida, setFormSalida] = useState({
    agricultor_id: '',
    tipo_material: '',
    tipo_clamshell_id: '',
    tipo_caja_id: '',
    cantidad: '',
    fecha_salida: getLocalDateTime(),
    notas: '',
    es_devolucion: false
  })

  const cargarDatos = async () => {
    const res = await fetch('/api/materiales/datos')
    const data = await res.json()
    setAgricultores(data.agricultores)
    setTiposClamshell(data.tiposClamshell)
    setTiposCaja(data.tiposCaja)
    setMateriales(data.materiales)
  }

  const cargarMovimientos = async () => {
    const res = await fetch('/api/materiales/movimientos')
    const data = await res.json()
    setMovimientos(data.movimientos)
  }

  useEffect(() => {
    const usuario = localStorage.getItem('usuario')
    if (!usuario) {
      router.push('/login')
      return
    }
    cargarDatos()
    cargarMovimientos()
  }, [])

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [mensaje])

  // Validación y registro entrada
  const handleEntradaSubmit = async (e: any) => {
    e.preventDefault()
    if (!formEntrada.tipo_material || !formEntrada.cantidad || !formEntrada.fecha_entrada) {
      setMensaje('Todos los campos obligatorios deben estar completos.')
      return
    }
    if (parseInt(formEntrada.cantidad) <= 0) {
      setMensaje('La cantidad debe ser mayor a cero.')
      return
    }
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
    const datos = { ...formEntrada, usuario_id: usuario.id, tipo_movimiento: 'entrada' }

    const res = await fetch('/api/materiales/registrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    })

    const result = await res.json()
    if (result.success) {
      setMensaje('Entrada de materiales registrada correctamente.')
      setFormEntrada({
        tipo_material: '',
        tipo_clamshell_id: '',
        tipo_caja_id: '',
        cantidad: '',
        fecha_entrada: getLocalDateTime(),
        notas: ''
      })
      cargarDatos()
      cargarMovimientos()
    } else {
      setMensaje('Error al registrar: ' + result.message)
    }
  }

  // Validación y registro salida
  const handleSalidaSubmit = async (e: any) => {
    e.preventDefault()
    if (!formSalida.tipo_material || !formSalida.cantidad || !formSalida.fecha_salida || !formSalida.agricultor_id) {
      setMensaje('Todos los campos obligatorios deben estar completos.')
      return
    }
    if (parseInt(formSalida.cantidad) <= 0) {
      setMensaje('La cantidad debe ser mayor a cero.')
      return
    }
    if (parseInt(formSalida.cantidad) > 1000) {
      if (!window.confirm('Estás registrando una salida/devolución muy grande, ¿continuar?')) return
    }
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
    const datos = { 
      ...formSalida, 
      usuario_id: usuario.id, 
      tipo_movimiento: formSalida.es_devolucion ? 'devolucion' : 'salida' 
    }

    const res = await fetch('/api/materiales/registrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    })

    const result = await res.json()
    if (result.success) {
      setMensaje('Salida de materiales registrada correctamente.')
      setFormSalida({
        agricultor_id: '',
        tipo_material: '',
        tipo_clamshell_id: '',
        tipo_caja_id: '',
        cantidad: '',
        fecha_salida: getLocalDateTime(),
        notas: '',
        es_devolucion: false
      })
      cargarDatos()
      cargarMovimientos()
    } else {
      setMensaje('Error al registrar: ' + result.message)
    }
  }

  // Opciones de materiales
  const tiposMaterial = [
    { value: '', label: 'Selecciona un material' },
    { value: 'clamshell', label: 'Clamshell de plástico' },
    { value: 'pad', label: 'Pad' },
    { value: 'etiqueta', label: 'Etiqueta' },
    { value: 'caja', label: 'Caja de cartón' }
  ]

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <button
        onClick={() => router.push('/panel/empleado')}
        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
      >
        Volver al panel principal
      </button>

      <h1 className="text-2xl font-bold text-orange-500 mb-6">Control de Materiales</h1>

      {mensaje && <p className="mb-4 p-2 bg-gray-800 text-orange-400 rounded">{mensaje}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Inventario actual */}
        <div className="bg-gray-900 p-6 rounded-xl border border-orange-500">
          <h2 className="text-xl font-semibold text-orange-400 mb-4">Inventario Actual</h2>
          <table className="min-w-full text-sm text-white">
            <thead>
              <tr className="text-orange-400 border-b border-gray-700">
                <th className="p-2 text-left">Material</th>
                <th className="p-2 text-left">Tipo/Detalle</th>
                <th className="p-2 text-right">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {materiales.map((m, i) => (
                <tr key={i} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="p-2">{m.nombre}</td>
                  <td className="p-2">{m.detalle || '-'}</td>
                  <td className="p-2 text-right">{m.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resumen de movimientos */}
        <div className="bg-gray-900 p-6 rounded-xl border border-orange-500">
          <h2 className="text-xl font-semibold text-orange-400 mb-4">Últimos Movimientos</h2>
          <table className="min-w-full text-sm text-white">
            <thead>
              <tr className="text-orange-400 border-b border-gray-700">
                <th className="p-2 text-left">Tipo</th>
                <th className="p-2 text-left">Material</th>
                <th className="p-2 text-right">Cantidad</th>
                <th className="p-2 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.slice(0, 5).map((m, i) => (
                <tr key={i} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="p-2">{m.tipo_movimiento === 'entrada' ? 'Entrada' : m.tipo_movimiento === 'salida' ? 'Salida' : 'Devolución'}</td>
                  <td className="p-2">{m.material} {m.detalle ? `(${m.detalle})` : ''}</td>
                  <td className={`p-2 text-right ${m.tipo_movimiento === 'entrada' ? 'text-green-400' : 'text-red-400'}`}>
                    {m.tipo_movimiento === 'entrada' ? '+' : '-'}{m.cantidad}
                  </td>
                  <td className="p-2">{format(new Date(m.fecha), "yyyy-MM-dd HH:mm")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formulario de entrada de materiales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 p-6 rounded-xl border border-orange-500">
          <h2 className="text-xl font-semibold text-orange-400 mb-4">Registrar Entrada de Materiales</h2>
          <form onSubmit={handleEntradaSubmit}>
            <SelectField
              label="Tipo de material:"
              value={formEntrada.tipo_material}
              onChange={e => setFormEntrada({ ...formEntrada, tipo_material: e.target.value })}
              options={tiposMaterial}
              required
            />

            {formEntrada.tipo_material === 'clamshell' && (
              <SelectField
                label="Tipo de clamshell:"
                value={formEntrada.tipo_clamshell_id}
                onChange={e => setFormEntrada({ ...formEntrada, tipo_clamshell_id: e.target.value })}
                options={[
                  { value: '', label: 'Selecciona un tamaño' },
                  ...tiposClamshell.map((t: any) => ({ value: t.id, label: `${t.tamanio} oz` }))
                ]}
                required
              />
            )}

            {formEntrada.tipo_material === 'caja' && (
              <SelectField
                label="Tipo de caja:"
                value={formEntrada.tipo_caja_id}
                onChange={e => setFormEntrada({ ...formEntrada, tipo_caja_id: e.target.value })}
                options={[
                  { value: '', label: 'Selecciona un tipo' },
                  ...tiposCaja.map((t: any) => ({ value: t.id, label: `${t.nombre} (${t.capacidad} clamshells)` }))
                ]}
                required
              />
            )}

            <div className="mb-4">
              <label>Cantidad:</label>
              <input
                type="number"
                value={formEntrada.cantidad}
                onChange={e => setFormEntrada({ ...formEntrada, cantidad: e.target.value })}
                className="w-full p-2 rounded bg-black border border-gray-700 text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label>Fecha de entrada:</label>
              <input
                type="datetime-local"
                value={formEntrada.fecha_entrada}
                onChange={e => setFormEntrada({ ...formEntrada, fecha_entrada: e.target.value })}
                className="w-full p-2 rounded bg-black border border-gray-700 text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label>Notas (opcional):</label>
              <textarea
                value={formEntrada.notas}
                onChange={e => setFormEntrada({ ...formEntrada, notas: e.target.value })}
                className="w-full p-2 rounded bg-black border border-gray-700 text-white"
              />
            </div>

            <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
              Registrar entrada
            </button>
          </form>
        </div>

        {/* Formulario de salida/devolución de materiales */}
        <div className="bg-gray-900 p-6 rounded-xl border border-orange-500">
          <h2 className="text-xl font-semibold text-orange-400 mb-4">Registrar Salida/Devolución</h2>
          <form onSubmit={handleSalidaSubmit}>
            <SelectField
              label="Agricultor:"
              value={formSalida.agricultor_id}
              onChange={e => setFormSalida({ ...formSalida, agricultor_id: e.target.value })}
              options={[
                { value: '', label: 'Selecciona un agricultor' },
                ...agricultores.map((a: any) => ({ value: a.id, label: `${a.nombre} ${a.apellido}` }))
              ]}
              required
            />

            <SelectField
              label="Tipo de material:"
              value={formSalida.tipo_material}
              onChange={e => setFormSalida({ ...formSalida, tipo_material: e.target.value })}
              options={tiposMaterial}
              required
            />

            {formSalida.tipo_material === 'clamshell' && (
              <SelectField
                label="Tipo de clamshell:"
                value={formSalida.tipo_clamshell_id}
                onChange={e => setFormSalida({ ...formSalida, tipo_clamshell_id: e.target.value })}
                options={[
                  { value: '', label: 'Selecciona un tamaño' },
                  ...tiposClamshell.map((t: any) => ({ value: t.id, label: `${t.tamanio} oz` }))
                ]}
                required
              />
            )}

            {formSalida.tipo_material === 'caja' && (
              <SelectField
                label="Tipo de caja:"
                value={formSalida.tipo_caja_id}
                onChange={e => setFormSalida({ ...formSalida, tipo_caja_id: e.target.value })}
                options={[
                  { value: '', label: 'Selecciona un tipo' },
                  ...tiposCaja.map((t: any) => ({ value: t.id, label: `${t.nombre} (${t.capacidad} clamshells)` }))
                ]}
                required
              />
            )}

            <div className="mb-4">
              <label>Cantidad:</label>
              <input
                type="number"
                value={formSalida.cantidad}
                onChange={e => setFormSalida({ ...formSalida, cantidad: e.target.value })}
                className="w-full p-2 rounded bg-black border border-gray-700 text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label>Fecha de salida/devolución:</label>
              <input
                type="datetime-local"
                value={formSalida.fecha_salida}
                onChange={e => setFormSalida({ ...formSalida, fecha_salida: e.target.value })}
                className="w-full p-2 rounded bg-black border border-gray-700 text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formSalida.es_devolucion}
                  onChange={e => setFormSalida({ ...formSalida, es_devolucion: e.target.checked })}
                  className="mr-2"
                />
                Es una devolución
              </label>
            </div>

            <div className="mb-4">
              <label>Notas (opcional):</label>
              <textarea
                value={formSalida.notas}
                onChange={e => setFormSalida({ ...formSalida, notas: e.target.value })}
                className="w-full p-2 rounded bg-black border border-gray-700 text-white"
              />
            </div>

            <button
              type="submit"
              className={`w-full text-white p-2 rounded ${formSalida.es_devolucion ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'}`}
            >
              {formSalida.es_devolucion ? 'Registrar devolución' : 'Registrar salida'}
            </button>
          </form>
        </div>
      </div>

      {/* Historial de movimientos */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-orange-400 mb-4">Historial Completo de Movimientos</h2>
        <div className="overflow-x-auto bg-gray-900 p-4 rounded-xl border border-orange-500">
          <table className="min-w-full table-auto text-sm text-white">
            <thead>
              <tr className="text-orange-400 border-b border-gray-700">
                <th className="p-2">Tipo</th>
                <th className="p-2">Agricultor</th>
                <th className="p-2">Material</th>
                <th className="p-2">Detalle</th>
                <th className="p-2">Cantidad</th>
                <th className="p-2">Fecha</th>
                <th className="p-2">Notas</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m, i) => (
                <tr key={i} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="p-2">
                    {m.tipo_movimiento === 'entrada' ?
                      <span className="text-green-400">Entrada</span> :
                      m.tipo_movimiento === 'salida' ?
                        <span className="text-red-400">Salida</span> :
                        <span className="text-blue-400">Devolución</span>}
                  </td>
                  <td className="p-2">{m.agricultor || '-'}</td>
                  <td className="p-2">{m.material}</td>
                  <td className="p-2">{m.detalle || '-'}</td>
                  <td className={`p-2 text-right ${m.tipo_movimiento === 'entrada' ? 'text-green-400' : 'text-red-400'}`}>
                    {m.tipo_movimiento === 'entrada' ? '+' : '-'}{m.cantidad}
                  </td>
                  <td className="p-2">{format(new Date(m.fecha), "yyyy-MM-dd HH:mm")}</td>
                  <td className="p-2">{m.notas || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

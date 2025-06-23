import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { format } from 'date-fns'

export default function ControlCalidad() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState<any[]>([])
  const [motivos, setMotivos] = useState<any[]>([])
  const [form, setForm] = useState({
    codigo_caja: '',
    cajas_rechazadas: '',
    motivo_rechazo_id: '',
  })
  const [mensaje, setMensaje] = useState('')

  // Cargar pedidos y motivos de rechazo
  const cargarPedidos = async () => {
    const res = await fetch('/api/calidad/pendientes')
    const data = await res.json()
    setPedidos(data.pedidos)
  }
  const cargarMotivos = async () => {
    const res = await fetch('/api/calidad/motivos')
    const data = await res.json()
    setMotivos(data.motivos)
  }

  useEffect(() => {
    const usuario = localStorage.getItem('usuario')
    if (!usuario) {
      router.push('/login')
      return
    }
    cargarPedidos()
    cargarMotivos()
  }, [])

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [mensaje])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
    if (!form.codigo_caja || !form.cajas_rechazadas || !form.motivo_rechazo_id) {
      setMensaje('Completa todos los campos')
      return
    }
    const res = await fetch('/api/calidad/registrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        usuario_control_id: usuario.id,
      })
    })
    const result = await res.json()
    if (result.success) {
      setMensaje('Control de calidad registrado correctamente.')
      setForm({ codigo_caja: '', cajas_rechazadas: '', motivo_rechazo_id: '' })
      cargarPedidos()
    } else {
      setMensaje('Error al registrar: ' + result.message)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex justify-between items-center mb-6">
  <h1 className="text-2xl font-bold text-orange-500">Panel del Empleado</h1>
  <div className="flex gap-4">
    <button
      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
      onClick={() => router.push('/panel/empleado')}>
      Volver al panel principal
    </button>
    <button
      className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded"
      // La funcionalidad se implementará después
      onClick={() => alert('Funcionalidad de impresión próximamente')}>
      Imprimir documento
    </button>
  </div>
</div>


      <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-xl border border-orange-500 max-w-xl mb-8">
        <div className="mb-4">
          <label>Pedido recibido hoy:</label>
          <select
            value={form.codigo_caja}
            onChange={e => setForm({ ...form, codigo_caja: e.target.value })}
            className="w-full p-2 rounded bg-black border border-gray-700 text-white"
            required
          >
            <option value="">Selecciona el pedido</option>
            {pedidos.map((p) => (
              <option key={p.codigo_caja} value={p.codigo_caja}>
                {p.codigo_caja} - {p.fruta} - {p.agricultor} ({p.cantidad_cajas} cajas)
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label>Cajas rechazadas:</label>
          <input
            type="number"
            min={0}
            value={form.cajas_rechazadas}
            onChange={e => setForm({ ...form, cajas_rechazadas: e.target.value })}
            className="w-full p-2 rounded bg-black border border-gray-700 text-white"
            required
          />
        </div>

        <div className="mb-4">
          <label>Motivo del rechazo:</label>
          <select
            value={form.motivo_rechazo_id}
            onChange={e => setForm({ ...form, motivo_rechazo_id: e.target.value })}
            className="w-full p-2 rounded bg-black border border-gray-700 text-white"
            required
          >
            <option value="">Selecciona un motivo</option>
            {motivos.map((m) => (
              <option key={m.id} value={m.id}>{m.motivo}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="w-full bg-orange-600 text-white p-2 rounded hover:bg-orange-700">
          Registrar control de calidad
        </button>
        {mensaje && <p className="mt-4 text-orange-400">{mensaje}</p>}
      </form>
    </div>
  )
}

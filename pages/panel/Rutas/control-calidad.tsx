import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { format } from 'date-fns'

export default function ControlCalidad() {
  const router = useRouter()
  const [pendientes, setPendientes] = useState<any[]>([])
  const [controles, setControles] = useState<any[]>([])
  const [form, setForm] = useState({
    codigo_caja: '',
    estado: '',
    observaciones: ''
  })
  const [mensaje, setMensaje] = useState('')

  const cargarPendientes = async () => {
    const res = await fetch('/api/calidad/pendientes')
    const data = await res.json()
    setPendientes(data.pendientes)
  }

  const cargarControles = async () => {
    const res = await fetch('/api/calidad/listar')
    const data = await res.json()
    setControles(data.controles)
  }

  useEffect(() => {
    const usuario = localStorage.getItem('usuario')
    if (!usuario) {
      router.push('/login')
      return
    }
    cargarPendientes()
    cargarControles()
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
    if (!form.codigo_caja || !form.estado) {
      setMensaje('Selecciona una caja y el estado')
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
      setMensaje('Control registrado correctamente.')
      setForm({ codigo_caja: '', estado: '', observaciones: '' })
      cargarPendientes()
      cargarControles()
    } else {
      setMensaje('Error al registrar: ' + result.message)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-orange-500">Control de Calidad</h1>
        <button
          onClick={() => router.push('/panel/empleado')}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
        >
          Volver al panel principal
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-xl border border-orange-500 max-w-xl mb-8">
        <div className="mb-4">
          <label>Caja/Palet pendiente:</label>
          <select
            value={form.codigo_caja}
            onChange={e => setForm({ ...form, codigo_caja: e.target.value })}
            className="w-full p-2 rounded bg-black border border-gray-700 text-white"
            required
          >
            <option value="">Selecciona una caja</option>
            {pendientes.map((p) => (
              <option key={p.codigo_caja} value={p.codigo_caja}>
                {p.codigo_caja} - {p.fruta} - {p.agricultor}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label>Estado:</label>
          <select
            value={form.estado}
            onChange={e => setForm({ ...form, estado: e.target.value })}
            className="w-full p-2 rounded bg-black border border-gray-700 text-white"
            required
          >
            <option value="">Selecciona estado</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Rechazado">Rechazado</option>
            <option value="Observado">Observado</option>
          </select>
        </div>

        <div className="mb-4">
          <label>Observaciones (opcional):</label>
          <textarea
            value={form.observaciones}
            onChange={e => setForm({ ...form, observaciones: e.target.value })}
            className="w-full p-2 rounded bg-black border border-gray-700 text-white"
          />
        </div>

        <button type="submit" className="w-full bg-orange-600 text-white p-2 rounded hover:bg-orange-700">
          Registrar control
        </button>
        {mensaje && <p className="mt-4 text-orange-400">{mensaje}</p>}
      </form>

      <div className="mt-10">
        <h2 className="text-xl text-orange-400 font-semibold mb-3">Controles de calidad realizados hoy</h2>
        <div className="overflow-x-auto bg-gray-900 p-4 rounded-xl border border-orange-500">
          <table className="min-w-full table-auto text-sm text-white">
            <thead>
              <tr className="text-orange-400 border-b border-gray-700">
                <th className="p-2">Código</th>
                <th className="p-2">Agricultor</th>
                <th className="p-2">Fruta</th>
                <th className="p-2">Estado</th>
                <th className="p-2">Observaciones</th>
                <th className="p-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {controles.map((c, i) => (
                <tr key={i} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="p-2">{c.codigo_caja}</td>
                  <td className="p-2">{c.agricultor}</td>
                  <td className="p-2">{c.fruta}</td>
                  <td className="p-2">{c.estado}</td>
                  <td className="p-2">{c.observaciones || '-'}</td>
                  <td className="p-2">{format(new Date(c.fecha_control), 'yyyy-MM-dd HH:mm')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

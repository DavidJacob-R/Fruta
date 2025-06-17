import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { format } from 'date-fns'

export default function RecepcionFruta() {
  const router = useRouter()
  const [agricultores, setAgricultores] = useState<any[]>([])
  const [tiposFruta, setTiposFruta] = useState<any[]>([])
  const [recepciones, setRecepciones] = useState<any[]>([])
  const [mensaje, setMensaje] = useState('')
  const [form, setForm] = useState({
    codigo_caja: '',
    agricultor_id: '',
    tipo_fruta_id: '',
    cantidad_cajas: '',
    peso_caja_oz: '',
    fecha_recepcion: '',
    notas: '',
  })

  const cargarDatos = async () => {
    const res = await fetch('/api/recepcion/datos')
    const data = await res.json()
    setAgricultores(data.agricultores)
    setTiposFruta(data.frutas)
  }

  const cargarRecepciones = async () => {
    const res = await fetch('/api/recepcion/listar')
    const data = await res.json()
    setRecepciones(data.recepciones)
  }

  useEffect(() => {
    const usuario = localStorage.getItem('usuario')
    if (!usuario) {
      router.push('/login')
      return
    }
    cargarDatos()
    cargarRecepciones()
  }, [])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
    const datos = { ...form, usuario_recepcion_id: usuario.id }

    const res = await fetch('/api/recepcion/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    })

    const result = await res.json()
    if (result.success) {
      setMensaje('Recepción registrada correctamente.')
      setForm({
        codigo_caja: '',
        agricultor_id: '',
        tipo_fruta_id: '',
        cantidad_cajas: '',
        peso_caja_oz: '',
        fecha_recepcion: '',
        notas: '',
      })
      cargarRecepciones()
    } else {
      setMensaje('Error al registrar: ' + result.message)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold text-orange-500 mb-6">Recepción de Fruta</h1>

      <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-xl border border-orange-500 max-w-xl">
        <div className="mb-4">
          <label>Código de caja:</label>
          <input
            type="text"
            value={form.codigo_caja}
            onChange={(e) => setForm({ ...form, codigo_caja: e.target.value })}
            className="w-full p-2 rounded bg-black border border-gray-700 text-white"
            required
          />
        </div>

        <div className="mb-4">
          <label>Agricultor:</label>
          <select
            value={form.agricultor_id}
            onChange={(e) => setForm({ ...form, agricultor_id: e.target.value })}
            className="w-full p-2 rounded bg-black border border-gray-700 text-white"
            required
          >
            <option value="">Selecciona un agricultor</option>
            {agricultores.map((a) => (
              <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label>Tipo de fruta:</label>
          <select
            value={form.tipo_fruta_id}
            onChange={(e) => setForm({ ...form, tipo_fruta_id: e.target.value })}
            className="w-full p-2 rounded bg-black border border-gray-700 text-white"
            required
          >
            <option value="">Selecciona una fruta</option>
            {tiposFruta.map((f) => (
              <option key={f.id} value={f.id}>{f.nombre}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label>Cantidad de cajas:</label>
          <input
            type="number"
            value={form.cantidad_cajas}
            onChange={(e) => setForm({ ...form, cantidad_cajas: e.target.value })}
            className="w-full p-2 rounded bg-black border border-gray-700 text-white"
            required
          />
        </div>

        <div className="mb-4">
          <label>Peso por caja (oz):</label>
          <input
            type="number"
            step="0.01"
            value={form.peso_caja_oz}
            onChange={(e) => setForm({ ...form, peso_caja_oz: e.target.value })}
            className="w-full p-2 rounded bg-black border border-gray-700 text-white"
            required
          />
        </div>

        <div className="mb-4">
          <label>Fecha de recepción:</label>
          <input
            type="datetime-local"
            value={form.fecha_recepcion}
            onChange={(e) => setForm({ ...form, fecha_recepcion: e.target.value })}
            className="w-full p-2 rounded bg-black border border-gray-700 text-white"
            required
          />
        </div>

        <div className="mb-4">
          <label>Notas (opcional):</label>
          <textarea
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            className="w-full p-2 rounded bg-black border border-gray-700 text-white"
          />
        </div>

        <button type="submit" className="w-full bg-orange-600 text-white p-2 rounded hover:bg-orange-700">
          Registrar recepción
        </button>

        {mensaje && <p className="mt-4 text-orange-400">{mensaje}</p>}
      </form>

      <h2 className="text-xl mt-10 mb-4 text-orange-400 font-semibold">Recepciones registradas</h2>
      <div className="overflow-x-auto bg-gray-900 p-4 rounded-xl border border-orange-500">
        <table className="min-w-full table-auto text-sm text-white">
          <thead>
            <tr className="text-orange-400 border-b border-gray-700">
              <th className="p-2">Código</th>
              <th className="p-2">Agricultor</th>
              <th className="p-2">Fruta</th>
              <th className="p-2">Cajas</th>
              <th className="p-2">Peso (oz)</th>
              <th className="p-2">Fecha</th>
              <th className="p-2">Notas</th>
            </tr>
          </thead>
          <tbody>
            {recepciones.map((r, i) => (
              <tr key={i} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="p-2">{r.codigo_caja}</td>
                <td className="p-2">{r.agricultor}</td>
                <td className="p-2">{r.fruta}</td>
                <td className="p-2">{r.cantidad_cajas}</td>
                <td className="p-2">{r.peso_caja_oz}</td>
                <td className="p-2">{format(new Date(r.fecha_recepcion), 'yyyy-MM-dd HH:mm')}</td>
                <td className="p-2">{r.notas || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

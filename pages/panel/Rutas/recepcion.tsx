import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { format } from 'date-fns'
import { db } from '@/lib/db'
import { recepcion_fruta } from '@/lib/schema'

export default function RecepcionFruta() {
  const router = useRouter()
  const [agricultores, setAgricultores] = useState<any[]>([])
  const [tiposFruta, setTiposFruta] = useState<any[]>([])
  const [recepciones, setRecepciones] = useState<any[]>([])
  const [mensaje, setMensaje] = useState('')
  const [mostrarTabla, setMostrarTabla] = useState(true)
  const [form, setForm] = useState({
    codigo_caja: '',
    agricultor_id: '',
    tipo_fruta_id: '',
    cantidad_cajas: '',
    peso_caja_oz: '',
    notas: '',
  })

  const [editando, setEditando] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<any>({
    agricultor_id: '',
    tipo_fruta_id: '',
    cantidad_cajas: '',
    peso_caja_oz: '',
    notas: '',
  })

  const cargarDatos = async () => {
    try {
      const res = await fetch('/api/recepcion/datos')
      const data = await res.json()
      setAgricultores(Array.isArray(data.agricultores) ? data.agricultores : [])
      setTiposFruta(Array.isArray(data.frutas) ? data.frutas : [])
    } catch (e) {
      setAgricultores([])
      setTiposFruta([])
    }
  }

  const cargarRecepciones = async () => {
    try {
      const hoy = new Date()
      const fechaInicio = new Date(hoy.setHours(0, 0, 0, 0)).toISOString()
      const res = await fetch(`/api/recepcion/listar?desde=${fechaInicio}`)
      const data = await res.json()
      setRecepciones(Array.isArray(data.recepciones) ? data.recepciones : [])
    } catch (e) {
      setRecepciones([])
    }
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

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [mensaje])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
    const now = new Date()
    const localISOString = now.toLocaleString('sv-SE').replace(' ', 'T')
    const fecha_recepcion = localISOString.slice(0, 16)
    const datos = { ...form, fecha_recepcion, usuario_recepcion_id: usuario.id }

    try {
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
          notas: '',
        })
        cargarRecepciones()
      } else {
        setMensaje('Error al registrar: ' + (result.message || 'Error desconocido'))
      }
    } catch (e) {
      setMensaje('Error al registrar: Error de conexión')
    }
  }

  const eliminarRecepcion = async (codigo_caja: string) => {
    if (confirm('¿Seguro que quieres eliminar esta recepción?')) {
      try {
        const res = await fetch('/api/recepcion/eliminar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ codigo_caja }),
        })
        const result = await res.json()
        if (result.success) {
          setMensaje('Recepción eliminada correctamente.')
          cargarRecepciones()
        } else {
          setMensaje('Error al eliminar: ' + (result.message || 'Error desconocido'))
        }
      } catch (e) {
        setMensaje('Error al eliminar: Error de conexión')
      }
    }
  }

  const abrirEdicion = (r: any) => {
    setEditando(r.codigo_caja)
    setEditForm({
      agricultor_id: r.agricultor_id,
      tipo_fruta_id: r.tipo_fruta_id,
      cantidad_cajas: r.cantidad_cajas,
      peso_caja_oz: r.peso_caja_oz,
      notas: r.notas || '',
    })
  }

  const guardarEdicion = async (e: any) => {
    e.preventDefault()
    const datos = {
      codigo_caja: editando,
      ...editForm,
    }
    try {
      const res = await fetch('/api/recepcion/editar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      })
      const result = await res.json()
      if (result.success) {
        setMensaje('Recepción editada correctamente.')
        setEditando(null)
        cargarRecepciones()
      } else {
        setMensaje('Error al editar: ' + (result.message || 'Error desconocido'))
      }
    } catch (e) {
      setMensaje('Error al editar: Error de conexión')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Modal de edición */}
      {editando && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <form onSubmit={guardarEdicion} className="bg-gray-900 border-orange-500 border p-6 rounded-xl min-w-[300px] relative">
            <h3 className="text-lg text-orange-400 font-bold mb-4">Editar recepción</h3>
            <button
              type="button"
              className="absolute top-2 right-2 text-white text-xl"
              onClick={() => setEditando(null)}>
              ×
            </button>

            <div className="mb-3">
              <label>Agricultor:</label>
              <select
                value={editForm.agricultor_id}
                onChange={e => setEditForm({ ...editForm, agricultor_id: e.target.value })}
                className="w-full p-2 rounded bg-black border border-gray-700 text-white"
                required>
                <option value="">Selecciona un agricultor</option>
                {agricultores.map((a) => (
                  <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label>Tipo de fruta:</label>
              <select
                value={editForm.tipo_fruta_id}
                onChange={e => setEditForm({ ...editForm, tipo_fruta_id: e.target.value })}
                className="w-full p-2 rounded bg-black border border-gray-700 text-white"required>
                <option value="">Selecciona una fruta</option>
                {tiposFruta.map((f) => (
                  <option key={f.id} value={f.id}>{f.nombre}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label>Cantidad de cajas:</label>
              <input
                type="number"
                value={editForm.cantidad_cajas}
                onChange={e => setEditForm({ ...editForm, cantidad_cajas: e.target.value })}
                className="w-full p-2 rounded bg-black border border-gray-700 text-white"required/>
            </div>

            <div className="mb-3">
              <label>Peso por caja (oz):</label>
              <input
                type="number"
                step="0.01"
                value={editForm.peso_caja_oz}
                onChange={e => setEditForm({ ...editForm, peso_caja_oz: e.target.value })}
                className="w-full p-2 rounded bg-black border border-gray-700 text-white"required/>
            </div>

            <div className="mb-3">
              <label>Notas:</label>
              <textarea
                value={editForm.notas}
                onChange={e => setEditForm({ ...editForm, notas: e.target.value })}
                className="w-full p-2 rounded bg-black border border-gray-700 text-white" />
            </div>

            <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded w-full mt-2">
              Guardar cambios
            </button>
          </form>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-orange-500">Recepción de Fruta</h1>
        <button
          onClick={() => router.push('/panel/empleado')}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded">
          Volver al panel principal
        </button>
         <button
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded"
           // La funcionalidad se implementará después
            onClick={() => alert('Funcionalidad de impresión próximamente')}>
          Imprimir documento
          </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-xl border border-orange-500 max-w-xl">
        <div className="mb-4">
          <label>Código de caja:</label>
          <input
            autoFocus
            type="text"
            value={form.codigo_caja}
            onChange={(e) => setForm({ ...form, codigo_caja: e.target.value })}
            className="w-full p-2 rounded bg-black border border-gray-700 text-white"
            required/>
        </div>

        <div className="mb-4">
          <label>Agricultor:</label>
          <select
            value={form.agricultor_id}
            onChange={(e) => setForm({ ...form, agricultor_id: e.target.value })}
            className="w-full p-2 rounded bg-black border border-gray-700 text-white"
            required>
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
            className="w-full p-2 rounded bg-black border border-gray-700 text-white"required>
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
            className="w-full p-2 rounded bg-black border border-gray-700 text-white" required/>
        </div>

        <div className="mb-4">
          <label>Peso por caja (oz):</label>
          <input
            type="number"
            step="0.01"
            value={form.peso_caja_oz}
            onChange={(e) => setForm({ ...form, peso_caja_oz: e.target.value })}
            className="w-full p-2 rounded bg-black border border-gray-700 text-white"required/>
        </div>

        <div className="mb-4">
          <label>Notas (opcional):</label>
          <textarea
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            className="w-full p-2 rounded bg-black border border-gray-700 text-white"/>
        </div>

        <button type="submit" className="w-full bg-orange-600 text-white p-2 rounded hover:bg-orange-700">
          Registrar recepción
        </button>

        {mensaje && <p className="mt-4 text-orange-400">{mensaje}</p>}
      </form>

      <div className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-orange-400 font-semibold">Recepciones registradas hoy</h2>
          <button
            onClick={() => setMostrarTabla(!mostrarTabla)}
            className="text-sm bg-gray-800 px-3 py-1 rounded border border-gray-600 hover:border-orange-400">
            {mostrarTabla ? 'Ocultar tabla' : 'Mostrar tabla'}
          </button>
        </div>

        {mostrarTabla && (
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
                  <th className="p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(recepciones) && recepciones.length > 0 ? (
                  recepciones.map((r, i) => (
                    <tr key={i} className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="p-2">{r.codigo_caja}</td>
                      <td className="p-2">{r.agricultor || r.agricultor_id}</td>
                      <td className="p-2">{r.fruta || r.tipo_fruta_id}</td>
                      <td className="p-2">{r.cantidad_cajas}</td>
                      <td className="p-2">{r.peso_caja_oz}</td>
                      <td className="p-2">
                        {r.fecha_recepcion
                          ? format(new Date(r.fecha_recepcion), 'yyyy-MM-dd HH:mm')
                          : '-'}
                      </td>
                      <td className="p-2">{r.notas || '-'}</td>
                      <td className="p-2">
                        <button
                          className="text-sm text-blue-400 hover:underline mr-2"
                          onClick={() => abrirEdicion(r)} >
                          Editar
                        </button>
                        <button
                          className="text-sm text-red-400 hover:underline"
                          onClick={() => eliminarRecepcion(r.codigo_caja)} >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center text-gray-400">No hay recepciones registradas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
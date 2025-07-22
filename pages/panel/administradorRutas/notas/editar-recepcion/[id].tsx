// pages/panel/administradorRutas/notas/editar-recepcion/[id].tsx

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function EditarRecepcionNota() {
  const router = useRouter()
  const { id } = router.query

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    setCargando(true)
    fetch(`/api/notas/recepcion/${id}`)
      .then(res => res.json())
      .then(json => {
        setData(json.nota)
        setCargando(false)
      })
      .catch(() => {
        setError('Error al cargar nota')
        setCargando(false)
      })
  }, [id])

  if (cargando) return <div className="p-8 text-center text-2xl">Cargando...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>
  if (!data) return <div className="p-8 text-center">No encontrada</div>

  if (data.tipo_nota === 'empresa') {
    return <EditarNotaEmpresa data={data} />
  } else {
    return <EditarNotaMaquila data={data} />
  }
}

// --------------- MAQUILA -----------------
function EditarNotaMaquila({ data }: { data: any }) {
  const router = useRouter()
  const [agricultores, setAgricultores] = useState<any[]>([])
  const [frutas, setFrutas] = useState<any[]>([])
  const [empaques, setEmpaques] = useState<any[]>([])
  const [mensaje, setMensaje] = useState('')
  const [form, setForm] = useState({
    agricultor_id: data.agricultor_id || '',
    tipo_fruta_id: data.tipo_fruta_id || '',
    cantidad_cajas: data.cantidad_cajas || '',
    peso_caja_oz: data.peso_caja_oz || '',
    empaque_id: data.empaque_id || '',
    notas: data.notas || '',
    tipo_nota: 'maquila'
  })
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [darkMode])

  useEffect(() => {
    fetch('/api/recepcion/datos')
      .then(res => res.json())
      .then(json => {
        setAgricultores(Array.isArray(json.agricultores) ? json.agricultores : [])
        setFrutas(Array.isArray(json.frutas) ? json.frutas : [])
      })
    fetch('/api/empaques/listar')
      .then(res => res.json())
      .then(json => setEmpaques(Array.isArray(json.empaques) ? json.empaques : []))
  }, [])

  const handleSubmit = async () => {
    setMensaje('Guardando...')
    const res = await fetch(`/api/notas/recepcion/${data.id}/editar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form), // tipo_nota SIEMPRE va
    })
    const result = await res.json()
    if (result.success) {
      setMensaje('Nota actualizada correctamente')
      setTimeout(() => router.push('/panel/administradorRutas/notas/notas'), 1200)
    } else {
      setMensaje('Error al actualizar: ' + (result.message || 'Error desconocido'))
    }
  }

  return (
    <div className={`min-h-screen flex flex-col items-center ${darkMode ? "bg-[#141a14]" : "bg-gray-50"}`}>
      <div className="w-full max-w-2xl rounded-2xl shadow-xl border mt-8 mb-8 bg-white dark:bg-[#1a2220] dark:border-green-700 border-green-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-green-200 dark:border-green-700">
          <h2 className="text-xl font-bold text-green-700 dark:text-green-200">
            Editar Nota de Maquila – N° {data.numero_nota}
          </h2>
          <button
            className="rounded px-3 py-1 border font-semibold bg-gray-200 hover:bg-gray-300 dark:bg-gray-900 dark:text-green-100 dark:border-green-800"
            onClick={() => router.push('/panel/administradorRutas/notas/notas')}
          >
            Volver
          </button>
        </div>
        <div className="p-8 space-y-5">
          <div>
            <label className="font-semibold">Agricultor</label>
            <select
              className="w-full rounded-xl border p-2 mt-1"
              value={form.agricultor_id}
              onChange={e => setForm(f => ({ ...f, agricultor_id: e.target.value }))}
            >
              <option value="">-- Selecciona --</option>
              {agricultores.map(a => (
                <option value={a.id} key={a.id}>{a.nombre} {a.apellido}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-semibold">Tipo de fruta</label>
            <select
              className="w-full rounded-xl border p-2 mt-1"
              value={form.tipo_fruta_id}
              onChange={e => setForm(f => ({ ...f, tipo_fruta_id: e.target.value }))}
            >
              <option value="">-- Selecciona --</option>
              {frutas.map(f => (
                <option value={f.id} key={f.id}>{f.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-semibold">Cantidad de cajas</label>
            <input
              className="w-full rounded-xl border p-2 mt-1"
              type="number"
              value={form.cantidad_cajas}
              onChange={e => setForm(f => ({ ...f, cantidad_cajas: e.target.value }))}
            />
          </div>
          <div>
            <label className="font-semibold">Peso por caja (oz)</label>
            <input
              className="w-full rounded-xl border p-2 mt-1"
              type="number"
              value={form.peso_caja_oz}
              onChange={e => setForm(f => ({ ...f, peso_caja_oz: e.target.value }))}
            />
          </div>
          <div>
            <label className="font-semibold">Empaque</label>
            <select
              className="w-full rounded-xl border p-2 mt-1"
              value={form.empaque_id}
              onChange={e => setForm(f => ({ ...f, empaque_id: e.target.value }))}
            >
              <option value="">-- Selecciona --</option>
              {empaques.map(e => (
                <option value={e.id} key={e.id}>{e.tamanio}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-semibold">Notas</label>
            <textarea
              className="w-full rounded-xl border p-2 mt-1"
              value={form.notas}
              onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
            />
          </div>
          <div className="flex justify-between">
            <button
              className="rounded-xl px-6 py-2 font-bold bg-gray-100 text-green-800 border border-green-300 hover:bg-gray-200"
              onClick={() => router.push('/panel/administradorRutas/notas/notas')}
            >
              Cancelar
            </button>
            <button
              className="rounded-xl px-6 py-2 font-bold bg-green-700 text-white border border-green-800 hover:bg-green-800"
              onClick={handleSubmit}
            >
              Guardar cambios
            </button>
          </div>
          {mensaje && <div className="text-center font-bold text-green-600 dark:text-green-300">{mensaje}</div>}
        </div>
      </div>
    </div>
  )
}

// -------------- EMPRESA ---------------
function EditarNotaEmpresa({ data }: { data: any }) {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<any[]>([])
  const [frutas, setFrutas] = useState<any[]>([])
  const [empaques, setEmpaques] = useState<any[]>([])
  const [mensaje, setMensaje] = useState('')
  const [form, setForm] = useState({
    empresa_id: data.empresa_id || '',
    tipo_fruta_id: data.tipo_fruta_id || '',
    cantidad_oz: data.peso_caja_oz || '',
    empaque_id: data.empaque_id || '',
    notas: data.notas || '',
    tipo_nota: 'empresa'
  })
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [darkMode])

  useEffect(() => {
    fetch('/api/recepcion/datos')
      .then(res => res.json())
      .then(json => {
        setEmpresas(Array.isArray(json.empresas) ? json.empresas : [])
        setFrutas(Array.isArray(json.frutas) ? json.frutas : [])
      })
    fetch('/api/empaques/listar')
      .then(res => res.json())
      .then(json => setEmpaques(Array.isArray(json.empaques) ? json.empaques : []))
  }, [])

  const handleSubmit = async () => {
    setMensaje('Guardando...')
    const body = {
      empresa_id: form.empresa_id,
      tipo_fruta_id: form.tipo_fruta_id,
      cantidad_cajas: 1,
      peso_caja_oz: form.cantidad_oz,
      empaque_id: form.empaque_id,
      notas: form.notas,
      tipo_nota: 'empresa'
    }
    const res = await fetch(`/api/notas/recepcion/${data.id}/editar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const result = await res.json()
    if (result.success) {
      setMensaje('Nota actualizada correctamente')
      setTimeout(() => router.push('/panel/administradorRutas/notas/notas'), 1200)
    } else {
      setMensaje('Error al actualizar: ' + (result.message || 'Error desconocido'))
    }
  }

  return (
    <div className={`min-h-screen flex flex-col items-center ${darkMode ? "bg-[#181818]" : "bg-gray-50"}`}>
      <div className="w-full max-w-2xl rounded-2xl shadow-xl border mt-8 mb-8 bg-white dark:bg-[#23272f] dark:border-orange-700 border-gray-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-orange-700">
          <h2 className="text-xl font-bold text-orange-700 dark:text-orange-300">
            Editar Nota de Empresa – N° {data.numero_nota}
          </h2>
          <button
            className="rounded px-3 py-1 border font-semibold bg-gray-200 hover:bg-gray-300 dark:bg-gray-900 dark:text-orange-100 dark:border-orange-800"
            onClick={() => router.push('/panel/administradorRutas/notas/notas')}
          >
            Volver
          </button>
        </div>
        <div className="p-8 space-y-5">
          <div>
            <label className="font-semibold">Empresa</label>
            <select
              className="w-full rounded-xl border p-2 mt-1"
              value={form.empresa_id}
              onChange={e => setForm(f => ({ ...f, empresa_id: e.target.value }))}
            >
              <option value="">-- Selecciona --</option>
              {empresas.map(emp => (
                <option value={emp.id} key={emp.id}>{emp.empresa}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-semibold">Tipo de fruta</label>
            <select
              className="w-full rounded-xl border p-2 mt-1"
              value={form.tipo_fruta_id}
              onChange={e => setForm(f => ({ ...f, tipo_fruta_id: e.target.value }))}
            >
              <option value="">-- Selecciona --</option>
              {frutas.map(f => (
                <option value={f.id} key={f.id}>{f.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-semibold">Cantidad (oz)</label>
            <input
              className="w-full rounded-xl border p-2 mt-1"
              type="number"
              value={form.cantidad_oz}
              onChange={e => setForm(f => ({ ...f, cantidad_oz: e.target.value }))}
            />
          </div>
          <div>
            <label className="font-semibold">Empaque</label>
            <select
              className="w-full rounded-xl border p-2 mt-1"
              value={form.empaque_id}
              onChange={e => setForm(f => ({ ...f, empaque_id: e.target.value }))}
            >
              <option value="">-- Selecciona --</option>
              {empaques.map(e => (
                <option value={e.id} key={e.id}>{e.tamanio}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-semibold">Notas</label>
            <textarea
              className="w-full rounded-xl border p-2 mt-1"
              value={form.notas}
              onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
            />
          </div>
          <div className="flex justify-between">
            <button
              className="rounded-xl px-6 py-2 font-bold bg-gray-100 text-orange-800 border border-orange-300 hover:bg-gray-200"
              onClick={() => router.push('/panel/administradorRutas/notas/notas')}
            >
              Cancelar
            </button>
            <button
              className="rounded-xl px-6 py-2 font-bold bg-orange-700 text-white border border-orange-800 hover:bg-orange-800"
              onClick={handleSubmit}
            >
              Guardar cambios
            </button>
          </div>
          {mensaje && <div className="text-center font-bold text-orange-600 dark:text-orange-300">{mensaje}</div>}
        </div>
      </div>
    </div>
  )
}

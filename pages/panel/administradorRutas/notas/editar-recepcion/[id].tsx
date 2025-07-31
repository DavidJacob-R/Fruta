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

function EditarNotaMaquila({ data }: { data: any }) {
  const router = useRouter()
  const [agricultores, setAgricultores] = useState<any[]>([])
  const [frutas, setFrutas] = useState<any[]>([])
  const [empaques, setEmpaques] = useState<any[]>([])
  const [mensaje, setMensaje] = useState('')
  const [form, setForm] = useState<any[]>(data.frutas.map((f: any) => ({
    agricultor_id: f.agricultor_id || '',
    tipo_fruta_id: f.tipo_fruta_id || '',
    cantidad_cajas: f.cantidad_cajas || '',
    peso_caja_oz: f.peso_caja_oz || '',
    empaque_id: f.empaque_id || '',
    sector: f.sector || '',
    marca: f.marca || '',
    destino: f.destino || '',
    tipo_produccion: f.tipo_produccion || 'convencional',
    variedad: f.variedad || '',
    notas: f.notas || '',
    id: f.id
  })))
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

  const handleChange = (idx: number, field: string, value: any) => {
    setForm((old: any[]) =>
      old.map((f, i) => i === idx ? { ...f, [field]: value } : f)
    )
  }

  const handleSubmit = async () => {
    setMensaje('Guardando...')
    let success = true
    for (let i = 0; i < form.length; i++) {
      const f = form[i]
      const res = await fetch(`/api/notas/recepcion/${f.id}/editar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agricultor_id: f.agricultor_id,
          tipo_fruta_id: f.tipo_fruta_id,
          cantidad_cajas: f.cantidad_cajas,
          peso_caja_oz: f.peso_caja_oz,
          empaque_id: f.empaque_id,
          sector: f.sector,
          marca: f.marca,
          destino: f.destino,
          tipo_produccion: f.tipo_produccion,
          variedad: f.variedad,
          notas: f.notas,
          tipo_nota: 'maquila'
        })
      })
      const result = await res.json()
      if (!result.success) {
        setMensaje('Error al actualizar: ' + (result.message || 'Error desconocido'))
        success = false
        break
      }
    }
    if (success) {
      await fetch('/api/pdf/crea-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero_nota: data.numero_nota,
          fecha: new Date().toLocaleDateString()
        })
      })
      setMensaje('Notas actualizadas correctamente')
      setTimeout(() => router.push('/panel/administradorRutas/notas/notas'), 1200)
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
        <div className="p-8 space-y-7">
          {form.map((f, idx) => (
            <div key={f.id} className="mb-7 p-6 border rounded-2xl shadow bg-gray-50 dark:bg-[#162017]">
              <div className="font-bold mb-3">Fruta #{idx + 1}</div>
              <div className="mb-2">
                <label className="font-semibold">Agricultor</label>
                <select
                  className="w-full rounded-xl border p-2 mt-1"
                  value={f.agricultor_id}
                  onChange={e => handleChange(idx, 'agricultor_id', e.target.value)}
                >
                  <option value="">-- Selecciona --</option>
                  {agricultores.map(a => (
                    <option value={a.id} key={a.id}>{a.nombre} {a.apellido}</option>
                  ))}
                </select>
              </div>
              <div className="mb-2">
                <label className="font-semibold">Tipo de fruta</label>
                <select
                  className="w-full rounded-xl border p-2 mt-1"
                  value={f.tipo_fruta_id}
                  onChange={e => handleChange(idx, 'tipo_fruta_id', e.target.value)}
                >
                  <option value="">-- Selecciona --</option>
                  {frutas.map(fru => (
                    <option value={fru.id} key={fru.id}>{fru.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="mb-2">
                <label className="font-semibold">Cantidad de cajas</label>
                <input
                  className="w-full rounded-xl border p-2 mt-1"
                  type="number"
                  value={f.cantidad_cajas}
                  onChange={e => handleChange(idx, 'cantidad_cajas', e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="font-semibold">Peso por caja (oz)</label>
                <input
                  className="w-full rounded-xl border p-2 mt-1"
                  type="number"
                  value={f.peso_caja_oz}
                  onChange={e => handleChange(idx, 'peso_caja_oz', e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="font-semibold">Empaque</label>
                <select
                  className="w-full rounded-xl border p-2 mt-1"
                  value={f.empaque_id}
                  onChange={e => handleChange(idx, 'empaque_id', e.target.value)}
                >
                  <option value="">-- Selecciona --</option>
                  {empaques.map(e => (
                    <option value={e.id} key={e.id}>{e.tamanio}</option>
                  ))}
                </select>
              </div>
              <div className="mb-2">
                <label className="font-semibold">Sector</label>
                <input
                  className="w-full rounded-xl border p-2 mt-1"
                  type="text"
                  value={f.sector}
                  onChange={e => handleChange(idx, 'sector', e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="font-semibold">Marca</label>
                <input
                  className="w-full rounded-xl border p-2 mt-1"
                  type="text"
                  value={f.marca}
                  onChange={e => handleChange(idx, 'marca', e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="font-semibold">Destino</label>
                <input
                  className="w-full rounded-xl border p-2 mt-1"
                  type="text"
                  value={f.destino}
                  onChange={e => handleChange(idx, 'destino', e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="font-semibold">Tipo de producción</label>
                <select
                  className="w-full rounded-xl border p-2 mt-1"
                  value={f.tipo_produccion}
                  onChange={e => handleChange(idx, 'tipo_produccion', e.target.value)}
                >
                  <option value="convencional">Convencional</option>
                  <option value="organica">Orgánica</option>
                </select>
              </div>
              <div className="mb-2">
                <label className="font-semibold">Variedad</label>
                <input
                  className="w-full rounded-xl border p-2 mt-1"
                  type="text"
                  value={f.variedad}
                  onChange={e => handleChange(idx, 'variedad', e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="font-semibold">Notas</label>
                <textarea
                  className="w-full rounded-xl border p-2 mt-1"
                  value={f.notas}
                  onChange={e => handleChange(idx, 'notas', e.target.value)}
                />
              </div>
            </div>
          ))}
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

function EditarNotaEmpresa({ data }: { data: any }) {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<any[]>([])
  const [frutas, setFrutas] = useState<any[]>([])
  const [empaques, setEmpaques] = useState<any[]>([])
  const [mensaje, setMensaje] = useState('')
  const [form, setForm] = useState<any[]>(data.frutas.map((f: any) => ({
    empresa_id: f.empresa_id || '',
    tipo_fruta_id: f.tipo_fruta_id || '',
    cantidad_oz: f.peso_caja_oz || '',
    empaque_id: f.empaque_id || '',
    sector: f.sector || '',
    marca: f.marca || '',
    destino: f.destino || '',
    tipo_produccion: f.tipo_produccion || 'convencional',
    variedad: f.variedad || '',
    notas: f.notas || '',
    id: f.id
  })))
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

  const handleChange = (idx: number, field: string, value: any) => {
    setForm((old: any[]) =>
      old.map((f, i) => i === idx ? { ...f, [field]: value } : f)
    )
  }

  const handleSubmit = async () => {
    setMensaje('Guardando...')
    let success = true
    for (let i = 0; i < form.length; i++) {
      const f = form[i]
      const body = {
        empresa_id: f.empresa_id,
        tipo_fruta_id: f.tipo_fruta_id,
        cantidad_cajas: 1,
        peso_caja_oz: f.cantidad_oz,
        empaque_id: f.empaque_id,
        sector: f.sector,
        marca: f.marca,
        destino: f.destino,
        tipo_produccion: f.tipo_produccion,
        variedad: f.variedad,
        notas: f.notas,
        tipo_nota: 'empresa'
      }
      const res = await fetch(`/api/notas/recepcion/${f.id}/editar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const result = await res.json()
      if (!result.success) {
        setMensaje('Error al actualizar: ' + (result.message || 'Error desconocido'))
        success = false
        break
      }
    }
    if (success) {
      await fetch('/api/pdf/crea-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero_nota: data.numero_nota,
          fecha: new Date().toLocaleDateString()
        })
      })
      setMensaje('Notas actualizadas correctamente')
      setTimeout(() => router.push('/panel/administradorRutas/notas/notas'), 1200)
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
        <div className="p-8 space-y-7">
          {form.map((f, idx) => (
            <div key={f.id} className="mb-7 p-6 border rounded-2xl shadow bg-gray-50 dark:bg-[#23272f]">
              <div className="font-bold mb-3">Fruta #{idx + 1}</div>
              <div className="mb-2">
                <label className="font-semibold">Empresa</label>
                <select
                  className="w-full rounded-xl border p-2 mt-1"
                  value={f.empresa_id}
                  onChange={e => handleChange(idx, 'empresa_id', e.target.value)}
                >
                  <option value="">-- Selecciona --</option>
                  {empresas.map(emp => (
                    <option value={emp.id} key={emp.id}>{emp.empresa}</option>
                  ))}
                </select>
              </div>
              <div className="mb-2">
                <label className="font-semibold">Tipo de fruta</label>
                <select
                  className="w-full rounded-xl border p-2 mt-1"
                  value={f.tipo_fruta_id}
                  onChange={e => handleChange(idx, 'tipo_fruta_id', e.target.value)}
                >
                  <option value="">-- Selecciona --</option>
                  {frutas.map(fru => (
                    <option value={fru.id} key={fru.id}>{fru.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="mb-2">
                <label className="font-semibold">Cantidad (oz)</label>
                <input
                  className="w-full rounded-xl border p-2 mt-1"
                  type="number"
                  value={f.cantidad_oz}
                  onChange={e => handleChange(idx, 'cantidad_oz', e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="font-semibold">Empaque</label>
                <select
                  className="w-full rounded-xl border p-2 mt-1"
                  value={f.empaque_id}
                  onChange={e => handleChange(idx, 'empaque_id', e.target.value)}
                >
                  <option value="">-- Selecciona --</option>
                  {empaques.map(e => (
                    <option value={e.id} key={e.id}>{e.tamanio}</option>
                  ))}
                </select>
              </div>
              <div className="mb-2">
                <label className="font-semibold">Sector</label>
                <input
                  className="w-full rounded-xl border p-2 mt-1"
                  type="text"
                  value={f.sector}
                  onChange={e => handleChange(idx, 'sector', e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="font-semibold">Marca</label>
                <input
                  className="w-full rounded-xl border p-2 mt-1"
                  type="text"
                  value={f.marca}
                  onChange={e => handleChange(idx, 'marca', e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="font-semibold">Destino</label>
                <input
                  className="w-full rounded-xl border p-2 mt-1"
                  type="text"
                  value={f.destino}
                  onChange={e => handleChange(idx, 'destino', e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="font-semibold">Tipo de producción</label>
                <select
                  className="w-full rounded-xl border p-2 mt-1"
                  value={f.tipo_produccion}
                  onChange={e => handleChange(idx, 'tipo_produccion', e.target.value)}
                >
                  <option value="convencional">Convencional</option>
                  <option value="organica">Orgánica</option>
                </select>
              </div>
              <div className="mb-2">
                <label className="font-semibold">Variedad</label>
                <input
                  className="w-full rounded-xl border p-2 mt-1"
                  type="text"
                  value={f.variedad}
                  onChange={e => handleChange(idx, 'variedad', e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="font-semibold">Notas</label>
                <textarea
                  className="w-full rounded-xl border p-2 mt-1"
                  value={f.notas}
                  onChange={e => handleChange(idx, 'notas', e.target.value)}
                />
              </div>
            </div>
          ))}
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

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { useUi } from '@/components/ui-context'
import { FiHome, FiArrowLeft, FiSave } from 'react-icons/fi'

type PartidaEmpresa = {
  id: number
  empresa_id: number | ''
  tipo_fruta_id: number | ''
  cantidad_oz: number | string
  empaque_id: number | ''
  sector: string
  marca: string
  destino: string
  tipo_produccion: 'convencional' | 'organica'
  variedad: string
  notas: string
  agricultor_id?: number | ''
}

type NotaRecepcion = {
  id: number
  numero_nota?: number | string
  fecha_recepcion?: string | null
  empresa_nombre?: string | null
  frutas: any[]
}

type Opcion = { id:number; nombre?:string; empresa?:string; tamanio?:string; clave?:string }

export default function EditarRecepcionNota() {
  const router = useRouter()
  const { id } = router.query
  const { darkMode } = useUi()

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState<NotaRecepcion | null>(null)

  useEffect(() => {
    const rid = Array.isArray(id) ? id[0] : id
    if (!rid) return
    let cancel = false
    setCargando(true)
    setError('')
    fetch(`/api/notas/recepcion/${rid}`)
      .then(res => res.json())
      .then(json => { if (!cancel) setData(json.nota || null) })
      .catch(() => { if (!cancel) setError('Error al cargar nota') })
      .finally(() => { if (!cancel) setCargando(false) })
    return () => { cancel = true }
  }, [id])

  const bgDay = 'bg-[#f6f4f2]'
  const bgNight = 'bg-[#161616]'
  const textDay = 'text-[#1a1a1a]'
  const textNight = 'text-white'

  const headerTitle = useMemo(() => {
    const num = data?.numero_nota ? ` — N° ${data.numero_nota}` : ''
    return `Editar Nota de Recepción${num}`
  }, [data?.numero_nota])

  if (cargando) {
    return (
      <div className={`${darkMode ? bgNight : bgDay} min-h-screen ${darkMode ? textNight : textDay}`}>
        <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-b-2xl p-6 text-white shadow-lg">
          <div className="max-w-7xl mx-auto">
            <div className="h-7 w-72 rounded bg-white/30 animate-pulse" />
            <div className="mt-2 h-4 w-96 rounded bg-white/20 animate-pulse" />
          </div>
        </section>
        <div className="max-w-7xl mx-auto p-6">
          <div className={`rounded-2xl p-6 ${darkMode ? 'bg-[#232323] border border-[#353535]' : 'bg-[#f8f7f5] border border-orange-200'} shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]`}>
            <div className="h-10 w-full rounded bg-current/10 animate-pulse" />
            <div className="mt-3 h-48 w-full rounded bg-current/10 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${darkMode ? bgNight : bgDay} min-h-screen ${darkMode ? textNight : textDay}`}>
        <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-b-2xl p-6 text-white shadow-lg">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold">Error</h1>
            <p className="text-orange-100">No se pudo cargar la nota.</p>
          </div>
        </section>
        <div className="max-w-3xl mx-auto p-6">
          <div className={`rounded-2xl p-6 ${darkMode ? 'bg-[#232323] border border-[#353535]' : 'bg-white border border-orange-200'} shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]`}>
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => router.push('/panel/administradorRutas/notas/notas')}
              className={`mt-4 px-4 py-2 rounded-lg border ${darkMode ? 'bg-[#232323] border-[#353535] text-white hover:bg-[#2a2a2a]' : 'bg-white border-orange-200 text-[#1a1a1a] hover:bg-orange-50'}`}
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={`${darkMode ? bgNight : bgDay} min-h-screen ${darkMode ? textNight : textDay}`}>
        <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-b-2xl p-6 text-white shadow-lg">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold">Nota no encontrada</h1>
          </div>
        </section>
        <div className="max-w-3xl mx-auto p-6">
          <div className={`rounded-2xl p-6 ${darkMode ? 'bg-[#232323] border border-[#353535]' : 'bg-white border border-orange-200'} shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]`}>
            <button
              onClick={() => router.push('/panel/administradorRutas/notas/notas')}
              className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-[#232323] border-[#353535] text-white hover:bg-[#2a2a2a]' : 'bg-white border-orange-200 text-[#1a1a1a] hover:bg-orange-50'}`}
            >
              Volver al listado
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <FormularioEmpresa data={data} />
}

function FormularioEmpresa({ data }: { data: NotaRecepcion }) {
  const router = useRouter()
  const { darkMode } = useUi()

  const [empresas, setEmpresas] = useState<Opcion[]>([])
  const [frutas, setFrutas] = useState<Opcion[]>([])
  const [empaques, setEmpaques] = useState<Opcion[]>([])
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)

  const [agricultoresByEmpresa, setAgricultoresByEmpresa] = useState<Record<number, Opcion[]>>({})

  const [form, setForm] = useState<PartidaEmpresa[]>(
    (Array.isArray(data.frutas) ? data.frutas : []).map((f: any) => ({
      id: f.id,
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
      agricultor_id: f.agricultor_id || ''
    }))
  )

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

  useEffect(() => {
    const ids = Array.from(new Set(form.map(f => Number(f.empresa_id)).filter(Boolean))) as number[]
    ids.forEach(id => ensureAgricultores(id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.map(f => f.empresa_id).join(',')])

  async function ensureAgricultores(empresaId: number) {
    if (!empresaId) return
    if (agricultoresByEmpresa[empresaId]) return
    const r = await fetch(`/api/agricultores/by-empresa?empresa_id=${empresaId}`)
    const j = await r.json()
    setAgricultoresByEmpresa(prev => ({ ...prev, [empresaId]: Array.isArray(j.agricultores) ? j.agricultores : [] }))
  }

  function handleChange(idx: number, field: keyof PartidaEmpresa, value: any) {
    setForm(old => old.map((f, i) => {
      if (i !== idx) return f
      const changed: any = { ...f, [field]: value }
      if (field === 'empresa_id') {
        const eid = Number(value) || 0
        changed.agricultor_id = '' // reset agricultor al cambiar empresa
        if (eid) ensureAgricultores(eid)
      }
      return changed
    }))
  }

  async function handleSubmit() {
    try {
      setGuardando(true)
      setMensaje('Guardando...')
      for (let i = 0; i < form.length; i++) {
        const f = form[i]
        const body: any = {
          empresa_id: f.empresa_id || null,
          tipo_fruta_id: f.tipo_fruta_id || null,
          cantidad_cajas: 1,
          peso_caja_oz: Number(f.cantidad_oz) || 0,
          empaque_id: f.empaque_id || null,
          sector: f.sector || null,
          marca: f.marca || null,
          destino: f.destino || null,
          tipo_produccion: f.tipo_produccion || 'convencional',
          variedad: f.variedad || null,
          notas: f.notas || null,
          tipo_nota: 'empresa'
        }
        if (f.agricultor_id) body.agricultor_id = f.agricultor_id

        const res = await fetch(`/api/notas/recepcion/${f.id}/editar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })
        const result = await res.json()
        if (!result?.success) {
          setMensaje('Error al actualizar: ' + (result?.message || 'Error desconocido'))
          setGuardando(false)
          return
        }
      }

      await fetch('/api/pdf/crea-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero_nota: data.numero_nota, fecha: new Date().toLocaleDateString() })
      })

      setMensaje('Notas actualizadas correctamente')
      setTimeout(() => router.push('/panel/administradorRutas/notas/notas'), 1200)
    } catch {
      setMensaje('Error al actualizar: conexión fallida')
      setGuardando(false)
    }
  }

  const s10 = (v?: string | null) => (v ? String(v).slice(0, 10) : '')
  const card = darkMode ? 'bg-[#232323] border border-[#353535]' : 'bg-[#f8f7f5] border border-orange-200'
  const input = darkMode
    ? 'w-full px-3 py-2 rounded-xl bg-[#1f1f1f] border border-[#353535] text-white outline-none'
    : 'w-full px-3 py-2 rounded-xl bg-white border border-orange-200 text-[#1a1a1a] outline-none'
  const btnSec = darkMode
    ? 'px-5 py-3 rounded-xl font-semibold border bg-[#232323] border-[#353535] text-white hover:bg-[#2a2a2a]'
    : 'px-5 py-3 rounded-xl font-semibold border bg-white border-orange-300 text-[#1a1a1a] hover:bg-orange-50'
  const btnPri = 'px-5 py-3 rounded-xl font-semibold text-white bg-orange-600 hover:bg-orange-700'

  return (
    <div className={`${darkMode ? 'bg-[#161616] text-white' : 'bg-[#f6f4f2] text-[#1a1a1a]'} min-h-screen`}>
      <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-b-2xl p-6 text-white shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Editar Nota de Recepción — N° {data.numero_nota}</h1>
            <p className="text-orange-100">
              {data.empresa_nombre ? `Empresa: ${data.empresa_nombre}` : ''}
              {data.fecha_recepcion ? ` · Fecha: ${s10(data.fecha_recepcion)}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition flex items-center gap-2"
              onClick={() => router.push('/panel/administrador')}
              title="Ir al menú principal"
            >
              <FiHome /><span className="hidden sm:inline">Menú</span>
            </button>
            <button
              className="px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition flex items-center gap-2"
              onClick={() => router.push('/panel/administradorRutas/notas/notas')}
              title="Volver al listado"
            >
              <FiArrowLeft /><span className="hidden sm:inline">Volver</span>
            </button>
          </div>
        </div>
      </section>

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {form.length === 0 && (
          <div className={`rounded-2xl p-6 ${card} shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]`}>Sin partidas</div>
        )}

        {form.map((f, idx) => {
          const empresaId = Number(f.empresa_id) || 0
          const agricultores = empresaId ? (agricultoresByEmpresa[empresaId] || []) : []
          return (
            <div key={f.id} className={`rounded-2xl p-6 ${card} shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]`}>
              <div className="text-lg font-semibold mb-4">Partida #{idx + 1}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Empresa</label>
                  <select className={input} value={f.empresa_id} onChange={e => handleChange(idx, 'empresa_id', Number(e.target.value))}>
                    <option value="">— Selecciona —</option>
                    {empresas.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.empresa || emp.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Agricultor (relacionado a la empresa)</label>
                  <select
                    className={input}
                    value={f.agricultor_id || ''}
                    onChange={e => handleChange(idx, 'agricultor_id', Number(e.target.value) || '')}
                    disabled={!empresaId}
                  >
                    <option value="">{empresaId ? '— Selecciona —' : 'Selecciona una empresa primero'}</option>
                    {agricultores.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.clave ? `${a.clave} — ` : ''}{a.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Tipo de fruta</label>
                  <select className={input} value={f.tipo_fruta_id} onChange={e => handleChange(idx, 'tipo_fruta_id', Number(e.target.value) || '')}>
                    <option value="">— Selecciona —</option>
                    {frutas.map(fru => <option key={fru.id} value={fru.id}>{fru.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Cantidad (oz)</label>
                  <input className={input} type="number" value={f.cantidad_oz} onChange={e => handleChange(idx, 'cantidad_oz', e.target.value)} />
                </div>

                <div>
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Empaque</label>
                  <select className={input} value={f.empaque_id} onChange={e => handleChange(idx, 'empaque_id', Number(e.target.value) || '')}>
                    <option value="">— Selecciona —</option>
                    {empaques.map(em => <option key={em.id} value={em.id}>{em.tamanio}</option>)}
                  </select>
                </div>

                <div>
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Sector</label>
                  <input className={input} value={f.sector} onChange={e => handleChange(idx, 'sector', e.target.value)} />
                </div>

                <div>
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Marca</label>
                  <input className={input} value={f.marca} onChange={e => handleChange(idx, 'marca', e.target.value)} />
                </div>

                <div>
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Destino</label>
                  <input className={input} value={f.destino} onChange={e => handleChange(idx, 'destino', e.target.value)} />
                </div>

                <div>
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Tipo de producción</label>
                  <select className={input} value={f.tipo_produccion} onChange={e => handleChange(idx, 'tipo_produccion', e.target.value as any)}>
                    <option value="convencional">Convencional</option>
                    <option value="organica">Orgánica</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Variedad</label>
                  <input className={input} value={f.variedad} onChange={e => handleChange(idx, 'variedad', e.target.value)} />
                </div>

                <div className="md:col-span-2">
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Notas</label>
                  <textarea className={input} rows={3} value={f.notas} onChange={e => handleChange(idx, 'notas', e.target.value)} />
                </div>
              </div>
            </div>
          )
        })}

        {mensaje && (
          <div className={`rounded-xl px-4 py-3 ${darkMode ? 'bg-[#1f1f1f] border border-[#353535]' : 'bg-white border border-orange-200'}`}>
            <p className={`${darkMode ? 'text-orange-300' : 'text-orange-700'} font-semibold`}>{mensaje}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button className={btnSec} onClick={() => router.push('/panel/administradorRutas/notas/notas')}>Cancelar</button>
          <button className={`${btnPri} ${guardando ? 'opacity-70 cursor-not-allowed' : ''}`} onClick={handleSubmit} disabled={guardando}>
            <span className="inline-flex items-center gap-2"><FiSave /> {guardando ? 'Guardando…' : 'Guardar cambios'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

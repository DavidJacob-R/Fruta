import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { useUi } from '@/components/ui-context'
import { FiHome, FiArrowLeft, FiSave, FiAlertCircle } from 'react-icons/fi'

type NotaCalidad = {
  id: number
  titulo?: string
  contenido?: string
  numero_nota?: string | number
  empresa_nombre?: string | null
  agricultor_nombre?: string | null
  agricultor_apellido?: string | null
  fecha_recepcion?: string | null
  // agrega aquí otros campos si tu API los retorna
}

export default function EditarNotaCalidad() {
  const router = useRouter()
  const { id } = router.query
  const { darkMode } = useUi()

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState<NotaCalidad | null>(null)

  useEffect(() => {
    const noteId = Array.isArray(id) ? id[0] : id
    if (!noteId) return

    let cancel = false
    setCargando(true)
    setError('')
    fetch(`/api/notas/calidad/${noteId}`)
      .then(res => res.json())
      .then(json => {
        if (cancel) return
        setData(json.nota || null)
      })
      .catch(() => {
        if (cancel) return
        setError('Error al cargar la nota de calidad')
      })
      .finally(() => !cancel && setCargando(false))

    return () => { cancel = true }
  }, [id])

  const bgDay = 'bg-[#f6f4f2]'
  const cardDay = 'bg-[#f8f7f5] border border-orange-200'
  const textDay = 'text-[#1a1a1a]'
  const bgNight = 'bg-[#161616]'
  const cardNight = 'bg-[#232323] border border-[#353535]'
  const textNight = 'text-white'
  const softShadow = 'shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]'

  const headerTitle = useMemo(() => {
    const num = data?.numero_nota ? ` #${data.numero_nota}` : ''
    return `Editar Nota de Calidad${num}`
  }, [data?.numero_nota])

  if (cargando) {
    return (
      <div className={`${darkMode ? bgNight : bgDay} min-h-screen ${darkMode ? textNight : textDay}`}>
        <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-b-2xl p-6 text-white shadow-lg">
          <div className="max-w-7xl mx-auto">
            <div className="h-7 w-60 rounded bg-white/30 animate-pulse" />
            <div className="mt-2 h-4 w-96 rounded bg-white/20 animate-pulse" />
          </div>
        </section>
        <div className="max-w-7xl mx-auto p-6">
          <div className={`rounded-2xl p-6 ${darkMode ? cardNight : cardDay} ${softShadow}`}>
            <div className="h-6 w-40 rounded animate-pulse bg-current/10" />
            <div className="mt-4 h-10 w-full rounded animate-pulse bg-current/10" />
            <div className="mt-3 h-48 w-full rounded animate-pulse bg-current/10" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${darkMode ? bgNight : bgDay} min-h-screen ${darkMode ? textNight : textDay}`}>
        <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-b-2xl p-6 text-white shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <FiAlertCircle className="text-2xl" />
            <h1 className="text-2xl font-bold">Error</h1>
          </div>
        </section>
        <div className="max-w-3xl mx-auto p-6">
          <div className={`rounded-2xl p-6 ${darkMode ? cardNight : cardDay} ${softShadow}`}>
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => router.push('/panel/administradorRutas/notas/notas')}
              className={`mt-4 px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-[#232323] border-[#353535] text-white hover:bg-[#2a2a2a]' : 'bg-white border-orange-200 text-[#1a1a1a] hover:bg-orange-50'
              }`}
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
          <div className={`rounded-2xl p-6 ${darkMode ? cardNight : cardDay} ${softShadow}`}>
            <button
              onClick={() => router.push('/panel/administradorRutas/notas/notas')}
              className={`px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-[#232323] border-[#353535] text-white hover:bg-[#2a2a2a]' : 'bg-white border-orange-200 text-[#1a1a1a] hover:bg-orange-50'
              }`}
            >
              Volver al listado
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <FormularioEditarCalidad data={data} darkMode={darkMode} headerTitle={headerTitle} />
}

function FormularioEditarCalidad({
  data,
  darkMode,
  headerTitle
}: {
  data: NotaCalidad
  darkMode: boolean
  headerTitle: string
}) {
  const router = useRouter()
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({
    titulo: data.titulo || '',
    contenido: data.contenido || ''
  })

  async function handleSubmit() {
    try {
      setGuardando(true)
      setMensaje('Guardando...')
      const res = await fetch(`/api/notas/calidad/${data.id}/editar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const result = await res.json()
      if (result?.success) {
        setMensaje('Nota de calidad actualizada correctamente')
        setTimeout(() => router.push('/panel/administradorRutas/notas/notas'), 1200)
      } else {
        setMensaje('Error al actualizar: ' + (result?.message || 'Error desconocido'))
      }
    } catch {
      setMensaje('Error al actualizar: conexión fallida')
    } finally {
      setGuardando(false)
    }
  }

  const s10 = (v?: string | null) => (v ? String(v).slice(0, 10) : '')

  const bgDay = 'bg-[#f6f4f2]'
  const cardDay = 'bg-[#f8f7f5] border border-orange-200'
  const textDay = 'text-[#1a1a1a]'
  const bgNight = 'bg-[#161616]'
  const cardNight = 'bg-[#232323] border border-[#353535]'
  const textNight = 'text-white'
  const softShadow = 'shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]'

  return (
    <div className={`${darkMode ? bgNight : bgDay} min-h-screen ${darkMode ? textNight : textDay} transition-colors duration-300`}>
      {/* Encabezado degradado */}
      <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-b-2xl p-6 text-white shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">{headerTitle}</h1>
            <p className="text-orange-100">
              {data.empresa_nombre ? `Empresa: ${data.empresa_nombre}` : ''}
              {data.agricultor_nombre ? ` · Agricultor: ${data.agricultor_nombre} ${data.agricultor_apellido || ''}` : ''}
              {data.fecha_recepcion ? ` · Fecha: ${s10(data.fecha_recepcion)}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition flex items-center gap-2"
              onClick={() => router.push('/panel/administrador')}
              title="Ir al menú principal"
            >
              <FiHome />
              <span className="hidden sm:inline">Menú</span>
            </button>
            <button
              className="px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition flex items-center gap-2"
              onClick={() => router.push('/panel/administradorRutas/notas/notas')}
              title="Volver al listado"
            >
              <FiArrowLeft />
              <span className="hidden sm:inline">Volver</span>
            </button>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`rounded-2xl p-6 ${darkMode ? cardNight : cardDay} ${softShadow}`}>
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className={`block mb-2 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Título</label>
              <input
                className={`w-full px-4 py-3 rounded-xl outline-none ${
                  darkMode ? 'bg-[#1f1f1f] border border-[#353535] text-white' : 'bg-white border border-orange-200'
                }`}
                value={form.titulo}
                onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                placeholder="Título de la nota"
              />
            </div>

            <div>
              <label className={`block mb-2 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Contenido</label>
              <textarea
                className={`w-full px-4 py-3 rounded-xl outline-none min-h-[220px] ${
                  darkMode ? 'bg-[#1f1f1f] border border-[#353535] text-white' : 'bg-white border border-orange-200'
                }`}
                value={form.contenido}
                onChange={e => setForm(f => ({ ...f, contenido: e.target.value }))}
                placeholder="Detalle del control de calidad…"
              />
            </div>
          </div>

          {mensaje && (
            <div className={`mt-4 rounded-xl px-4 py-3 ${darkMode ? 'bg-[#1f1f1f] border border-[#353535]' : 'bg-white border border-orange-200'}`}>
              <p className={`${darkMode ? 'text-orange-300' : 'text-orange-700'} font-semibold`}>{mensaje}</p>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
            <button
              className={`px-5 py-3 rounded-xl font-semibold border ${
                darkMode ? 'bg-[#232323] border-[#353535] text-white hover:bg-[#2a2a2a]' : 'bg-white border-orange-300 text-[#1a1a1a] hover:bg-orange-50'
              }`}
              onClick={() => router.push('/panel/administradorRutas/notas/notas')}
            >
              Cancelar
            </button>
            <button
              className={`px-5 py-3 rounded-xl font-semibold text-white inline-flex items-center gap-2 ${
                darkMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-600 hover:bg-orange-700'
              } ${guardando ? 'opacity-70 cursor-not-allowed' : ''}`}
              onClick={handleSubmit}
              disabled={guardando}
            >
              <FiSave /> {guardando ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

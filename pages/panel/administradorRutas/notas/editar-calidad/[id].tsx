import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function EditarNotaCalidad() {
  const router = useRouter()
  const { id } = router.query

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    setCargando(true)
    fetch(`/api/notas/calidad/${id}`)
      .then(res => res.json())
      .then(json => {
        setData(json.nota)
        setCargando(false)
      })
      .catch(() => {
        setError('Error al cargar nota de calidad')
        setCargando(false)
      })
  }, [id])

  if (cargando) return <div className="p-8 text-center text-2xl">Cargando...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>
  if (!data) return <div className="p-8 text-center">No encontrada</div>

  return <FormularioEditarCalidad data={data} />
}

function FormularioEditarCalidad({ data }: { data: any }) {
  const router = useRouter()
  const [mensaje, setMensaje] = useState('')
  const [form, setForm] = useState({
    titulo: data.titulo || '',
    contenido: data.contenido || '',
  })
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [darkMode])

  const handleSubmit = async () => {
    setMensaje('Guardando...')
    const res = await fetch(`/api/notas/calidad/${data.id}/editar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const result = await res.json()
    if (result.success) {
      setMensaje('Nota de calidad actualizada correctamente')
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
            Editar Nota de Control de Calidad
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
            <label className="font-semibold">Título</label>
            <input
              className="w-full rounded-xl border p-2 mt-1"
              value={form.titulo}
              onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
            />
          </div>
          <div>
            <label className="font-semibold">Contenido</label>
            <textarea
              className="w-full rounded-xl border p-2 mt-1"
              value={form.contenido}
              onChange={e => setForm(f => ({ ...f, contenido: e.target.value }))}
              rows={8}
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

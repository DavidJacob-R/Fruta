import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function EmpresasAdmin() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<any[]>([])
  const [nuevaEmpresa, setNuevaEmpresa] = useState('')
  const [tipoVenta, setTipoVenta] = useState('nacional')
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)

  const cargarEmpresas = () => {
    setLoading(true)
    fetch('/api/empresas/listar')
      .then(r => r.json())
      .then(data => setEmpresas(data.empresas || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargarEmpresas() }, [])

  const handleAgregar = async () => {
    if (!nuevaEmpresa.trim()) return
    setLoading(true)
    await fetch('/api/empresas/agregar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empresa: nuevaEmpresa, tipo_venta: tipoVenta })
    }).then(r => r.json()).then(res => {
      setMensaje(res.success ? 'Empresa agregada correctamente.' : res.message)
      setNuevaEmpresa('')
      cargarEmpresas()
    }).finally(() => setLoading(false))
  }

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar esta empresa?')) return
    setLoading(true)
    await fetch('/api/empresas/eliminar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).then(r => r.json()).then(res => {
      setMensaje(res.success ? 'Empresa eliminada correctamente.' : res.message)
      cargarEmpresas()
    }).finally(() => setLoading(false))
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-orange-400">Administrar Empresas</h1>
          <button
            className="mt-4 sm:mt-0 bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-xl text-white font-bold shadow transition"
            onClick={() => router.push('/panel/administrador')}>
            Regresar al menú principal
          </button>
        </div>
        <form
          className="bg-gray-900 rounded-2xl p-6 border border-orange-500 mb-8 shadow-xl flex flex-col gap-4"
          onSubmit={e => { e.preventDefault(); handleAgregar() }}>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={nuevaEmpresa}
              onChange={e => setNuevaEmpresa(e.target.value)}
              placeholder="Nombre de empresa"
              className="flex-1 p-3 rounded-xl bg-black border border-orange-400 text-white text-lg"
              required
              autoFocus />

            <select
              value={tipoVenta}
              onChange={e => setTipoVenta(e.target.value)}
              className="p-3 rounded-xl bg-black border border-orange-400 text-white text-lg"  >

              <option value="nacional">Nacional</option>
              <option value="exportacion">Exportación</option>
            </select>
            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-2xl text-white font-bold"
              disabled={loading} >

              {loading ? 'Guardando...' : 'Agregar empresa'}
            </button>
          </div>
          {mensaje && (
            <div className="mt-2 text-orange-300 font-semibold">{mensaje}</div>
          )}
        </form>

        <div>
          <h2 className="text-xl font-bold text-orange-300 mb-4">Empresas registradas</h2>
          {loading ? (
            <div className="text-gray-400 py-6 text-center">Cargando...</div>
          ) : empresas.length === 0 ? (
            <div className="text-gray-400 py-6 text-center">No hay empresas registradas.</div>
          ) : (
            <div className="grid gap-3">
              {empresas.map(emp => (
                <div key={emp.id} className="flex flex-col sm:flex-row justify-between items-center bg-gray-800 p-4 rounded-xl border border-orange-800 shadow">
                  <div>
                    <span className="font-bold text-lg">{emp.empresa || emp.nombre}</span>
                    <span className="ml-2 text-xs text-orange-300">[{emp.tipo_venta}]</span>
                  </div>
                  <button
                    className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-xl text-white font-bold mt-3 sm:mt-0"
                    onClick={() => handleEliminar(emp.id)}>
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

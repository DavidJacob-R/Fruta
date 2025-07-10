import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

type Empresa = {
  id: number,
  empresa: string,
  telefono?: string,
  email?: string,
  direccion?: string,
  tipo_venta: string,
}

export default function EmpresasAdmin() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [nuevaEmpresa, setNuevaEmpresa] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [direccion, setDireccion] = useState('')
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
      body: JSON.stringify({
        empresa: nuevaEmpresa,
        telefono,
        email,
        direccion,
        tipo_venta: tipoVenta
      })
    }).then(r => r.json()).then(res => {
      setMensaje(res.success ? 'Empresa agregada correctamente.' : res.message)
      setNuevaEmpresa('')
      setTelefono('')
      setEmail('')
      setDireccion('')
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-orange-950 flex flex-col items-center py-10 px-2">
      <div className="w-full max-w-3xl bg-white/5 rounded-3xl shadow-2xl border-2 border-orange-500 p-8 mt-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-extrabold text-orange-400 drop-shadow">Administrar Empresas</h1>
          <button
            className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-xl text-white font-bold shadow transition"
            onClick={() => router.push('/panel/administrador')}>
            Regresar al menú principal
          </button>
        </div>
        <form
          className="bg-slate-900 rounded-2xl p-6 border border-orange-500 mb-8 shadow-xl flex flex-col gap-4"
          onSubmit={e => { e.preventDefault(); handleAgregar() }}>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              value={nuevaEmpresa}
              onChange={e => setNuevaEmpresa(e.target.value)}
              placeholder="Nombre de empresa"
              className="flex-1 p-3 rounded-xl bg-black border border-orange-400 text-white text-lg"
              required
              autoFocus />
            <input
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              placeholder="Teléfono"
              className="flex-1 p-3 rounded-xl bg-black border border-orange-400 text-white text-lg"
              type="tel"
            />
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              className="flex-1 p-3 rounded-xl bg-black border border-orange-400 text-white text-lg"
              type="email"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              value={direccion}
              onChange={e => setDireccion(e.target.value)}
              placeholder="Dirección"
              className="flex-1 p-3 rounded-xl bg-black border border-orange-400 text-white text-lg"
            />
            <select
              value={tipoVenta}
              onChange={e => setTipoVenta(e.target.value)}
              className="flex-1 p-3 rounded-xl bg-black border border-orange-400 text-white text-lg"
              required
            >
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
                <div key={emp.id} className="flex flex-col md:flex-row justify-between items-center bg-gray-800 p-4 rounded-xl border border-orange-800 shadow">
                  <div className="w-full">
                    <div className="font-bold text-lg text-orange-300">{emp.empresa}</div>
                    <div className="text-xs text-gray-300">
                      {emp.tipo_venta && <span className="mr-2">[{emp.tipo_venta}]</span>}
                      {emp.telefono && <span className="mr-2">Tel: {emp.telefono}</span>}
                      {emp.email && <span className="mr-2">Correo: {emp.email}</span>}
                      {emp.direccion && <span>Dir: {emp.direccion}</span>}
                    </div>
                  </div>
                  <button
                    className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-xl text-white font-bold mt-3 md:mt-0"
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

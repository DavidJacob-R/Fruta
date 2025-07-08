import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

type Empresa = { id: number, nombre: string }
type Fruta = { id: number, nombre: string }
type Empaque = { id: number, tamanio: string }

export default function RecepcionEmpresa() {
  const router = useRouter()
  const [siguienteNumero, setSiguienteNumero] = useState<number | null>(null)
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [tiposFruta, setTiposFruta] = useState<Fruta[]>([])
  const [empaques, setEmpaques] = useState<Empaque[]>([])
  const [paso, setPaso] = useState(1)
  const [mensaje, setMensaje] = useState('')
  const [notas, setNotas] = useState('')
  const [form, setForm] = useState({
    empresa_id: '',
    tipo_fruta_id: '',
    cantidad_oz: '',
    empaque_id: '',
  })

  useEffect(() => {
    fetch('/api/recepcion/siguiente_nota')
      .then(res => res.json())
      .then(data => setSiguienteNumero(data.siguienteNumero))

    fetch('/api/recepcion/datos')
      .then(res => res.json())
      .then(data => {
        setEmpresas(Array.isArray(data.empresas) ? data.empresas : [])
        setTiposFruta(Array.isArray(data.frutas) ? data.frutas : [])
      })

    fetch('/api/empaques/listar')
      .then(res => res.json())
      .then(data => {
        setEmpaques(Array.isArray(data.empaques) ? data.empaques : [])
      })
  }, [])

  const siguiente = () => setPaso(p => p + 1)
  const anterior = () => setPaso(p => p - 1)

  const handleEmpresa = (id: string) => {
    setForm(f => ({ ...f, empresa_id: id }))
    setPaso(2)
  }
  const handleFruta = (id: string) => {
    setForm(f => ({ ...f, tipo_fruta_id: id }))
    setPaso(3)
  }
  const handleEmpaque = (id: string) => {
    setForm(f => ({ ...f, empaque_id: id }))
    setPaso(5)
  }
  const handleCantidad = (e: any) => {
    setForm(f => ({ ...f, cantidad_oz: e.target.value }))
  }

  const handleSubmit = async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
    const now = new Date()
    const localISOString = now.toLocaleString('sv-SE').replace(' ', 'T')
    const fecha_recepcion = localISOString.slice(0, 16)

    const datos = {
      agricultor_id: null,
      tipo_fruta_id: form.tipo_fruta_id,
      cantidad_cajas: 1,
      peso_caja_oz: form.cantidad_oz,
      notas: notas,
      fecha_recepcion,
      usuario_recepcion_id: usuario.id,
      numero_nota: siguienteNumero,
      tipo_nota: 'empresa',
      empaque_id: form.empaque_id,
      empresa_id: form.empresa_id
    }

    const res = await fetch('/api/recepcion/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    })

    const result = await res.json()
    if (result.success) {
      setMensaje('Recepción registrada correctamente.')
      setForm({ empresa_id: '', tipo_fruta_id: '', cantidad_oz: '', empaque_id: '' })
      setNotas('')
      setPaso(1)
      fetch('/api/recepcion/siguiente_nota')
        .then(res => res.json())
        .then(data => setSiguienteNumero(data.siguienteNumero))
      setTimeout(() => setMensaje(''), 2000)
    } else {
      setMensaje('Error al registrar: ' + (result.message || 'Error desconocido'))
    }
  }

  const nombreEmpresa = empresas.find(e => String(e.id) === form.empresa_id)?.nombre || ''
  const nombreFruta = tiposFruta.find(f => String(f.id) === form.tipo_fruta_id)?.nombre || ''
  const nombreEmpaque = empaques.find(e => String(e.id) === form.empaque_id)?.tamanio || ''

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-orange-900 py-8 px-2">
      <div className="w-full max-w-xl mx-auto bg-gray-950 border border-orange-700 rounded-3xl shadow-2xl p-8 flex flex-col items-center">
        <h2 className="text-3xl font-extrabold text-orange-500 mb-4 text-center drop-shadow">Registrar nota para empresa</h2>
        <div className="flex items-center gap-2 mb-8">
          <span className="text-orange-400 font-bold text-lg">N° de Nota:</span>
          <span className="text-2xl text-white font-mono">{siguienteNumero ?? '...'}</span>
        </div>

        {/* PASO 1: Empresa */}
        {paso === 1 && (
          <div className="w-full flex flex-col items-center">
            <h3 className="mb-4 text-lg font-bold">Selecciona la empresa</h3>
            <div className="flex flex-wrap gap-4 justify-center mb-3">
              {empresas.length === 0 && <span className="text-gray-400">No hay empresas disponibles</span>}
              {empresas.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => handleEmpresa(String(emp.id))}
                  className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 hover:scale-105 shadow-md transition-transform px-7 py-4 rounded-xl font-bold border border-orange-200 text-white text-lg"
                >{emp.nombre}</button>
              ))}
            </div>
            <button
              className="mt-4 bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-xl text-white font-bold shadow transition"
              onClick={() => router.push('/panel/Rutas/recepcion')}>
              Regresar al menú principal
            </button>
          </div>
        )}

        {/* PASO 2: Fruta */}
        {paso === 2 && (
          <div className="w-full flex flex-col items-center">
            <h3 className="mb-4 text-lg font-bold">Selecciona el tipo de fruta</h3>
            <div className="flex flex-wrap gap-4 justify-center mb-3">
              {tiposFruta.length === 0 && <span className="text-gray-400">No hay tipos de fruta</span>}
              {tiposFruta.map(fruta => (
                <button
                  key={fruta.id}
                  onClick={() => handleFruta(String(fruta.id))}
                  className="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700 hover:scale-105 shadow-md transition-transform px-7 py-4 rounded-xl font-bold border border-orange-200 text-white text-lg"
                >{fruta.nombre}</button>
              ))}
            </div>
            <button onClick={anterior} className="mt-4 text-orange-400 underline">Volver</button>
          </div>
        )}

        {/* PASO 3: Cantidad */}
        {paso === 3 && (
          <div className="w-full flex flex-col items-center">
            <h3 className="mb-4 text-lg font-bold">Cantidad de fruta (oz)</h3>
            <input
              autoFocus
              type="number"
              value={form.cantidad_oz}
              onChange={handleCantidad}
              className="w-48 p-3 rounded bg-black border-2 border-orange-700 text-white text-center text-xl mb-5"
              required
              min={1}
            />
            <button
              onClick={() => form.cantidad_oz && setPaso(4)}
              className="bg-orange-700 px-6 py-2 rounded-xl font-bold border border-orange-300 text-white text-lg shadow mb-2 transition"
              disabled={!form.cantidad_oz}
            >Siguiente</button>
            <button onClick={anterior} className="mt-2 text-orange-400 underline">Volver</button>
          </div>
        )}

        {/* PASO 4: Empaque */}
        {paso === 4 && (
          <div className="w-full flex flex-col items-center">
            <h3 className="mb-4 text-lg font-bold">Selecciona el tipo de empaque</h3>
            <div className="flex flex-wrap gap-4 justify-center mb-3">
              {empaques.length === 0 && <span className="text-gray-400">No hay empaques registrados</span>}
              {empaques.map(empaque => (
                <button
                  key={empaque.id}
                  onClick={() => handleEmpaque(String(empaque.id))}
                  className="bg-gradient-to-br from-orange-300 via-orange-400 to-orange-700 hover:scale-105 shadow-md transition-transform px-7 py-4 rounded-xl font-bold border border-orange-200 text-white text-lg"
                >{empaque.tamanio}</button>
              ))}
            </div>
            <button onClick={anterior} className="mt-4 text-orange-400 underline">Volver</button>
          </div>
        )}

        {/* PASO 5: Notas */}
        {paso === 5 && (
          <div className="w-full flex flex-col items-center">
            <h3 className="mb-4 text-lg font-bold">¿Deseas agregar notas? <span className="text-xs font-normal text-gray-400">(opcional)</span></h3>
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Escribe aquí alguna nota relevante..."
              className="w-80 h-24 p-3 rounded bg-black border-2 border-orange-600 text-white mb-4 resize-none"
            />
            <button
              onClick={() => setPaso(6)}
              className="bg-orange-700 px-6 py-2 rounded-xl font-bold border border-orange-300 text-white text-lg shadow mb-2 transition"
            >Siguiente</button>
            <button onClick={() => setPaso(4)} className="text-orange-400 underline">Volver</button>
          </div>
        )}

        {/* PASO 6: Resumen */}
        {paso === 6 && (
          <div className="w-full max-w-md bg-gray-800 border-2 border-orange-500 rounded-2xl p-7 flex flex-col items-center mt-4 shadow-lg">
            <h3 className="text-lg text-orange-400 font-bold mb-5">Resumen de la nota</h3>
            <ul className="w-full mb-4 text-lg space-y-2">
              <li><span className="font-bold text-orange-300">Empresa:</span> {nombreEmpresa}</li>
              <li><span className="font-bold text-orange-300">Tipo de fruta:</span> {nombreFruta}</li>
              <li><span className="font-bold text-orange-300">Cantidad (oz):</span> {form.cantidad_oz}</li>
              <li><span className="font-bold text-orange-300">Tipo de empaque:</span> {nombreEmpaque}</li>
              <li><span className="font-bold text-orange-300">Notas:</span> {notas ? notas : <span className="italic text-gray-400">Sin notas</span>}</li>
            </ul>
            <button
              onClick={handleSubmit}
              className="bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 hover:scale-105 shadow-md transition-transform text-white px-6 py-2 rounded-2xl text-lg font-bold w-full mb-2"
            >Registrar nota</button>
            <button onClick={() => setPaso(5)} className="text-orange-400 underline">Volver</button>
          </div>
        )}

        {mensaje && <p className="mt-6 text-orange-400 font-bold text-center">{mensaje}</p>}
      </div>
    </div>
  )
}

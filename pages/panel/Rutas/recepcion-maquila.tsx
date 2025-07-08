import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function RecepcionMaquila() {
  const router = useRouter()
  const [siguienteNumero, setSiguienteNumero] = useState<number | null>(null)
  const [agricultores, setAgricultores] = useState<any[]>([])
  const [tiposFruta, setTiposFruta] = useState<any[]>([])
  const [pesosDisponibles, setPesosDisponibles] = useState<string[]>(['8', '12', '16'])
  const [paso, setPaso] = useState(1)
  const [mensaje, setMensaje] = useState('')
  const [form, setForm] = useState({
    agricultor_id: '',
    tipo_fruta_id: '',
    cantidad_cajas: '',
    peso_caja_oz: '',
  })
  const [notas, setNotas] = useState('')

  useEffect(() => {
    fetch('/api/recepcion/siguiente_nota')
      .then(res => res.json())
      .then(data => setSiguienteNumero(data.siguienteNumero))
    fetch('/api/recepcion/datos')
      .then(res => res.json())
      .then(data => {
        setAgricultores(Array.isArray(data.agricultores) ? data.agricultores : [])
        setTiposFruta(Array.isArray(data.frutas) ? data.frutas : [])
      })
  }, [])

  const siguiente = () => setPaso(p => p + 1)
  const anterior = () => setPaso(p => p - 1)

  const handleSubmit = async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
    const now = new Date()
    const localISOString = now.toLocaleString('sv-SE').replace(' ', 'T')
    const fecha_recepcion = localISOString.slice(0, 16)

    const datos = {
      agricultor_id: form.agricultor_id,
      tipo_fruta_id: form.tipo_fruta_id,
      cantidad_cajas: form.cantidad_cajas,
      peso_caja_oz: form.peso_caja_oz,
      notas: notas,
      fecha_recepcion,
      usuario_recepcion_id: usuario.id,
      numero_nota: siguienteNumero,
      tipo_nota: 'maquila',
    }

    const res = await fetch('/api/recepcion/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    })

    const result = await res.json()
    if (result.success) {
      setMensaje('Recepción registrada correctamente.')
      setForm({
        agricultor_id: '',
        tipo_fruta_id: '',
        cantidad_cajas: '',
        peso_caja_oz: '',
      })
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

  const nombreAgricultor = agricultores.find(a => String(a.id) === form.agricultor_id)
    ? `${agricultores.find(a => String(a.id) === form.agricultor_id)?.nombre} ${agricultores.find(a => String(a.id) === form.agricultor_id)?.apellido}`
    : ''
  const nombreFruta = tiposFruta.find(f => String(f.id) === form.tipo_fruta_id)?.nombre || ''

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900 py-8 px-2">
      <div className="w-full max-w-xl mx-auto bg-gray-950 border border-green-700 rounded-3xl shadow-2xl p-8 flex flex-col items-center">
        <h2 className="text-3xl font-extrabold text-green-500 mb-4 text-center drop-shadow">Registrar nota de maquila</h2>
        <div className="flex items-center gap-2 mb-8">
          <span className="text-green-400 font-bold text-lg">N° de Nota:</span>
          <span className="text-2xl text-white font-mono">{siguienteNumero ?? '...'}</span>
        </div>

        {/* PASO 1: Agricultor */}
        {paso === 1 && (
          <div className="w-full flex flex-col items-center">
            <h3 className="mb-4 text-lg font-bold">Selecciona el agricultor independiente</h3>
            <div className="flex flex-wrap gap-4 justify-center mb-3">
              {agricultores.length === 0 && <span className="text-gray-400">No hay agricultores disponibles</span>}
              {agricultores.map(a => (
                <button
                  key={a.id}
                  onClick={() => { setForm(f => ({ ...f, agricultor_id: String(a.id) })); setPaso(2); }}
                  className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 hover:scale-105 shadow-md transition-transform px-7 py-4 rounded-xl font-bold border border-green-300 text-white text-lg"
                >{a.nombre} {a.apellido}</button>
              ))}
            </div>
            <button
              className="mt-4 bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-xl text-white font-bold shadow transition"
              onClick={() => router.push('/panel/empleado')}>
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
              {tiposFruta.map(f => (
                <button
                  key={f.id}
                  onClick={() => { setForm(form => ({ ...form, tipo_fruta_id: String(f.id) })); setPaso(3); }}
                  className="bg-gradient-to-br from-green-500 via-green-600 to-green-800 hover:scale-105 shadow-md transition-transform px-7 py-4 rounded-xl font-bold border border-green-300 text-white text-lg"
                >{f.nombre}</button>
              ))}
            </div>
            <button onClick={anterior} className="mt-4 text-green-400 underline">Volver</button>
          </div>
        )}

        {/* PASO 3: Cantidad de cajas */}
        {paso === 3 && (
          <div className="w-full flex flex-col items-center">
            <h3 className="mb-4 text-lg font-bold">Cantidad de cajas</h3>
            <input
              autoFocus
              type="number"
              value={form.cantidad_cajas}
              onChange={e => setForm(f => ({ ...f, cantidad_cajas: e.target.value }))}
              className="w-48 p-3 rounded bg-black border-2 border-green-700 text-white text-center text-xl mb-5"
              required
              min={1}
            />
            <button
              onClick={() => form.cantidad_cajas && setPaso(4)}
              className="bg-green-700 px-6 py-2 rounded-xl font-bold border border-green-300 text-white text-lg shadow mb-2 transition"
              disabled={!form.cantidad_cajas}
            >Siguiente</button>
            <button onClick={anterior} className="mt-2 text-green-400 underline">Volver</button>
          </div>
        )}

        {/* PASO 4: Peso por caja (oz) */}
        {paso === 4 && (
          <div className="w-full flex flex-col items-center">
            <h3 className="mb-4 text-lg font-bold">Selecciona el peso por caja (oz)</h3>
            <div className="flex flex-wrap gap-4 justify-center mb-3">
              {pesosDisponibles.map(peso => (
                <button
                  key={peso}
                  onClick={() => { setForm(f => ({ ...f, peso_caja_oz: peso })); setPaso(5); }}
                  className={`bg-gradient-to-br from-green-400 via-green-600 to-green-800 hover:scale-105 shadow-md transition-transform px-7 py-4 rounded-xl font-bold border border-green-300 text-white text-lg ${
                    form.peso_caja_oz === peso ? "ring-4 ring-green-300" : ""
                  }`}
                >
                  {peso} oz
                </button>
              ))}
            </div>
            <button onClick={anterior} className="mt-4 text-green-400 underline">Volver</button>
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
              className="w-80 h-24 p-3 rounded bg-black border-2 border-green-600 text-white mb-4 resize-none"
            />
            <button
              onClick={() => setPaso(6)}
              className="bg-green-700 px-6 py-2 rounded-xl font-bold border border-green-300 text-white text-lg shadow mb-2 transition"
            >Siguiente</button>
            <button onClick={() => setPaso(4)} className="text-green-400 underline">Volver</button>
          </div>
        )}

        {/* PASO 6: Resumen */}
        {paso === 6 && (
          <div className="w-full max-w-md bg-gray-800 border-2 border-green-500 rounded-2xl p-7 flex flex-col items-center mt-4 shadow-lg">
            <h3 className="text-lg text-green-400 font-bold mb-5">Resumen de la nota</h3>
            <ul className="w-full mb-4 text-lg space-y-2">
              <li><span className="font-bold text-green-300">Agricultor:</span> {nombreAgricultor}</li>
              <li><span className="font-bold text-green-300">Tipo de fruta:</span> {nombreFruta}</li>
              <li><span className="font-bold text-green-300">Cantidad de cajas:</span> {form.cantidad_cajas}</li>
              <li><span className="font-bold text-green-300">Peso por caja (oz):</span> {form.peso_caja_oz} oz</li>
              <li><span className="font-bold text-green-300">Notas:</span> {notas ? notas : <span className="italic text-gray-400">Sin notas</span>}</li>
            </ul>
            <button
              onClick={handleSubmit}
              className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 hover:scale-105 shadow-md transition-transform text-white px-6 py-2 rounded-2xl text-lg font-bold w-full mb-2"
            >Registrar nota</button>
            <button onClick={() => setPaso(5)} className="text-green-400 underline">Volver</button>
          </div>
        )}

        {mensaje && <p className="mt-6 text-green-400 font-bold text-center">{mensaje}</p>}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

type Empresa = { id: number, empresa: string }
type Fruta = { id: number, nombre: string }
type Empaque = { id: number, tamanio: string }

type RegistroFruta = {
  tipo_fruta_id: string
  cantidad_cajas: string
  peso_caja_oz: string
  empaque_id: string
  sector: string
  marca: string
  destino: string
  tipo_produccion: string
  variedad: string
  notas: string
}

export default function RecepcionEmpresa() {
  const router = useRouter()
  const [siguienteNumero, setSiguienteNumero] = useState<number | null>(null)
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [tiposFruta, setTiposFruta] = useState<Fruta[]>([])
  const [empaques, setEmpaques] = useState<Empaque[]>([])
  const [paso, setPaso] = useState(1)
  const [mensaje, setMensaje] = useState('')
  const [empresaID, setEmpresaID] = useState('')
  const [form, setForm] = useState<RegistroFruta>({
    tipo_fruta_id: '',
    cantidad_cajas: '',
    peso_caja_oz: '',
    empaque_id: '',
    sector: '',
    marca: '',
    destino: '',
    tipo_produccion: 'convencional',
    variedad: '',
    notas: ''
  })
  const [registros, setRegistros] = useState<RegistroFruta[]>([])

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

  const actualizarForm = (campo: keyof RegistroFruta, valor: string) => {
    setForm(f => ({ ...f, [campo]: valor }))
  }

  const handleEmpresa = (id: string) => {
    setEmpresaID(id)
    setPaso(2)
  }

  const agregarOtraFruta = () => {
    setRegistros(r => [...r, form])
    setForm({
      tipo_fruta_id: '',
      cantidad_cajas: '',
      peso_caja_oz: '',
      empaque_id: '',
      sector: '',
      marca: '',
      destino: '',
      tipo_produccion: 'convencional',
      variedad: '',
      notas: ''
    })
    setPaso(2)
  }

  const handleSubmit = async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
    const now = new Date()
    const localISOString = now.toLocaleString('sv-SE').replace(' ', 'T')
    const fecha_recepcion = localISOString.slice(0, 16)

    const todos = [...registros, form].map(r => ({
      agricultor_id: null,
      empresa_id: empresaID,
      tipo_fruta_id: r.tipo_fruta_id,
      cantidad_cajas: r.cantidad_cajas,
      peso_caja_oz: r.peso_caja_oz,
      fecha_recepcion,
      usuario_recepcion_id: usuario.id,
      numero_nota: siguienteNumero,
      tipo_nota: 'empresa',
      empaque_id: r.empaque_id,
      sector: r.sector,
      marca: r.marca,
      destino: r.destino,
      tipo_produccion: r.tipo_produccion,
      variedad: r.variedad,
      notas: r.notas
    }))

    for (const [i, r] of todos.entries()) {
      if (
        !r.tipo_fruta_id || !r.cantidad_cajas || !r.peso_caja_oz || !r.fecha_recepcion ||
        !r.usuario_recepcion_id || !r.numero_nota || !r.empaque_id
      ) {
        setMensaje(`El registro ${i + 1} está incompleto. Verifica todos los campos.`)
        return
      }
    }

    const res = await fetch('/api/recepcion/crear-multiple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registros: todos }),
    })

    const result = await res.json()
    if (result.success && siguienteNumero) {
      await fetch('/api/pdf/crea-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero_nota: siguienteNumero,
          fecha: new Date().toLocaleDateString()
        })
      })
      setMensaje('Recepción registrada correctamente.')
      setForm({
        tipo_fruta_id: '',
        cantidad_cajas: '',
        peso_caja_oz: '',
        empaque_id: '',
        sector: '',
        marca: '',
        destino: '',
        tipo_produccion: 'convencional',
        variedad: '',
        notas: ''
      })
      setRegistros([])
      setEmpresaID('')
      setPaso(1)
      fetch('/api/recepcion/siguiente_nota')
        .then(res => res.json())
        .then(data => setSiguienteNumero(data.siguienteNumero))
      setTimeout(() => setMensaje(''), 2000)
    } else {
      setMensaje('Error al registrar: ' + (result.message || 'Error desconocido'))
    }
  }

  const nombreEmpresa = empresas.find(e => String(e.id) === empresaID)?.empresa || ''
  const nombreFruta = tiposFruta.find(f => String(f.id) === form.tipo_fruta_id)?.nombre || ''
  const nombreEmpaque = empaques.find(e => String(e.id) === form.empaque_id)?.tamanio || ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181712] via-[#24180c] to-[#242126] text-white px-2 py-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-orange-100 shadow-lg rounded-full w-20 h-20 flex items-center justify-center mb-3">
            <span className="text-4xl">🏢</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-orange-400 mb-2 drop-shadow">
            Recepción - Empresa
          </h1>
          <div className="flex items-center gap-3">
            <span className="font-semibold">Nota:</span>
            <span className="text-xl font-mono rounded-xl px-6 py-2 bg-[#242126] border border-orange-300">
              {siguienteNumero ?? '...'}
            </span>
          </div>
        </div>

        {/* Contenido por pasos */}
        <div className="bg-[#1c1917] border border-orange-300 rounded-2xl p-6 shadow-md hover:shadow-lg transition mb-8">
          {paso === 1 && (
            <section>
              <h3 className="text-xl font-bold text-orange-300 mb-6">Selecciona la empresa</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {empresas.map(emp => (
                  <button
                    key={emp.id}
                    onClick={() => handleEmpresa(String(emp.id))}
                    className="bg-[#242126] border border-orange-300 rounded-xl p-4 hover:border-orange-500 transition text-left"
                  >
                    {emp.empresa}
                  </button>
                ))}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => router.push('/panel/Rutas/recepcion/recepcion')}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-full font-medium shadow hover:shadow-lg transition"
                >
                  Menú principal
                </button>
              </div>
            </section>
          )}

          {paso === 2 && (
            <section>
              <h3 className="text-xl font-bold text-orange-300 mb-6">Selecciona el tipo de fruta</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {tiposFruta.map(fruta => (
                  <button
                    key={fruta.id}
                    onClick={() => { actualizarForm('tipo_fruta_id', String(fruta.id)); siguiente() }}
                    className="bg-[#242126] border border-orange-300 rounded-xl p-4 hover:border-orange-500 transition text-left"
                  >
                    {fruta.nombre}
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <button onClick={anterior} className="text-orange-400 font-medium underline">Volver</button>
                <div />
              </div>
            </section>
          )}

          {paso === 3 && (
            <section>
              <h3 className="text-xl font-bold text-orange-300 mb-6">Cantidad de cajas</h3>
              <input
                autoFocus
                type="number"
                value={form.cantidad_cajas}
                onChange={e => actualizarForm('cantidad_cajas', e.target.value)}
                className="w-full p-4 rounded-lg bg-[#242126] border border-orange-300 text-white focus:border-orange-500 mb-6"
                required
                min={1}
              />
              <div className="flex justify-between">
                <button onClick={anterior} className="text-orange-400 font-medium underline">Volver</button>
                <button
                  onClick={siguiente}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full font-bold shadow hover:shadow-lg transition"
                  disabled={!form.cantidad_cajas}
                >
                  Siguiente
                </button>
              </div>
            </section>
          )}

          {paso === 4 && (
            <section>
              <h3 className="text-xl font-bold text-orange-300 mb-6">Selecciona el tipo de empaque</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {empaques.map(emp => (
                  <button
                    key={emp.id}
                    onClick={() => {
                      actualizarForm('empaque_id', String(emp.id));
                      actualizarForm('peso_caja_oz', emp.tamanio);
                      siguiente();
                    }}
                    className="bg-[#242126] border border-orange-300 rounded-lg p-3 hover:border-orange-500 transition text-center"
                  >
                    {emp.tamanio}
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <button onClick={anterior} className="text-orange-400 font-medium underline">Volver</button>
                <div />
              </div>
            </section>
          )}

          {paso === 5 && (
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-orange-300 mb-2">Detalles adicionales</h3>
              <div>
                <label className="block text-orange-300 mb-2">Sector</label>
                <input
                  value={form.sector}
                  onChange={e => actualizarForm('sector', e.target.value)}
                  className="w-full p-3 rounded-lg bg-[#242126] border border-orange-300 text-white focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-orange-300 mb-2">Marca</label>
                <input
                  value={form.marca}
                  onChange={e => actualizarForm('marca', e.target.value)}
                  className="w-full p-3 rounded-lg bg-[#242126] border border-orange-300 text-white focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-orange-300 mb-2">Destino</label>
                <input
                  value={form.destino}
                  onChange={e => actualizarForm('destino', e.target.value)}
                  className="w-full p-3 rounded-lg bg-[#242126] border border-orange-300 text-white focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-orange-300 mb-2">Variedad</label>
                <input
                  value={form.variedad}
                  onChange={e => actualizarForm('variedad', e.target.value)}
                  className="w-full p-3 rounded-lg bg-[#242126] border border-orange-300 text-white focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-orange-300 mb-2">Tipo de producción</label>
                <select
                  value={form.tipo_produccion}
                  onChange={e => actualizarForm('tipo_produccion', e.target.value)}
                  className="w-full p-3 rounded-lg bg-[#242126] border border-orange-300 text-white focus:border-orange-500"
                >
                  <option value="convencional">Convencional</option>
                  <option value="organica">Orgánica</option>
                </select>
              </div>
              <div>
                <label className="block text-orange-300 mb-2">Notas (opcional)</label>
                <textarea
                  value={form.notas}
                  onChange={e => actualizarForm('notas', e.target.value)}
                  className="w-full p-3 rounded-lg bg-[#242126] border border-orange-300 text-white focus:border-orange-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-between pt-4">
                <button onClick={anterior} className="text-orange-400 font-medium underline">Volver</button>
                <button
                  onClick={siguiente}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full font-bold shadow hover:shadow-lg transition"
                >
                  Siguiente
                </button>
              </div>
            </section>
          )}

          {paso === 6 && (
            <section className="space-y-6">
              <h3 className="text-xl font-bold text-orange-300">Resumen</h3>
              <div className="bg-[#242126] border border-orange-300 rounded-xl p-4">
                <p><b>Empresa:</b> {nombreEmpresa}</p>
                <p><b>Fruta:</b> {nombreFruta}</p>
                <p><b>Cajas:</b> {form.cantidad_cajas}</p>
                <p><b>Peso por caja (oz):</b> {form.peso_caja_oz}</p>
                <p><b>Empaque:</b> {nombreEmpaque}</p>
                <p><b>Sector:</b> {form.sector || '-'}</p>
                <p><b>Marca:</b> {form.marca || '-'}</p>
                <p><b>Destino:</b> {form.destino || '-'}</p>
                <p><b>Variedad:</b> {form.variedad || '-'}</p>
                <p><b>Producción:</b> {form.tipo_produccion}</p>
                <p><b>Notas:</b> {form.notas || '-'}</p>
              </div>
              <div className="flex justify-between">
                <button onClick={anterior} className="text-orange-400 font-medium underline">Volver</button>
                <div className="flex gap-3">
                  <button 
                    onClick={agregarOtraFruta}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-6 py-3 rounded-full font-bold shadow hover:shadow-lg transition"
                  >
                    Agregar otra fruta
                  </button>
                  <button 
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full font-bold shadow hover:shadow-lg transition"
                  >
                    Finalizar nota
                  </button>
                </div>
              </div>
            </section>
          )}

          {mensaje && (
            <div className={`mt-6 p-3 rounded-lg text-center font-medium ${
              mensaje.includes('correctamente') ? 'bg-green-600' : 'bg-red-600'
            }`}>
              {mensaje}
            </div>
          )}
        </div>

        <div className="text-center text-gray-400">
          © {new Date().getFullYear()} El Molinito
        </div>
      </div>
    </div>
  )
}
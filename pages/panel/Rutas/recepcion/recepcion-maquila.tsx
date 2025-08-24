import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function RecepcionMaquila() {
  const router = useRouter()
  const [siguienteNumero, setSiguienteNumero] = useState<number | null>(null)
  const [agricultores, setAgricultores] = useState<any[]>([])
  const [tiposFruta, setTiposFruta] = useState<any[]>([])
  const [empaques, setEmpaques] = useState<any[]>([])
  const [paso, setPaso] = useState(1)
  const [mensaje, setMensaje] = useState('')
  const [notas, setNotas] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  const [registros, setRegistros] = useState<any[]>([])
  const [agricultorID, setAgricultorID] = useState('')
  const [form, setForm] = useState({
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

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
  }, [darkMode])

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

    fetch('/api/empaques/listar')
      .then(res => res.json())
      .then(data => {
        setEmpaques(Array.isArray(data.empaques) ? data.empaques : [])
      })
  }, [])

  const siguiente = () => setPaso(p => p + 1)
  const anterior = () => setPaso(p => p - 1)

  const actualizarForm = (campo: string, valor: string) => {
    setForm(f => ({ ...f, [campo]: valor }))
  }

  const handleAgricultor = (id: string) => {
    setAgricultorID(id)
    setPaso(2)
  }

  const handleAgregarFruta = () => {
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

  const handleFinalizar = async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
    const now = new Date()
    const localISOString = now.toLocaleString('sv-SE').replace(' ', 'T')
    const fecha_recepcion = localISOString.slice(0, 16)
    const todos = [...registros, form].map(r => ({
      agricultor_id: agricultorID,
      tipo_fruta_id: r.tipo_fruta_id,
      cantidad_cajas: r.cantidad_cajas,
      peso_caja_oz: r.peso_caja_oz,
      fecha_recepcion,
      usuario_recepcion_id: usuario.id,
      numero_nota: siguienteNumero,
      tipo_nota: 'maquila',
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
      setMensaje('Recepcion registrada correctamente.')
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
      setAgricultorID('')
      setPaso(1)
      fetch('/api/recepcion/siguiente_nota')
        .then(res => res.json())
        .then(data => setSiguienteNumero(data.siguienteNumero))
      setTimeout(() => setMensaje(''), 2000)
    } else {
      setMensaje('Error al registrar: ' + (result.message || 'Error desconocido'))
    }
  }

  const nombreAgricultor = agricultores.find(a => String(a.id) === agricultorID)
    ? `${agricultores.find(a => String(a.id) === agricultorID)?.nombre} ${agricultores.find(a => String(a.id) === agricultorID)?.apellido}`
    : ''
  const nombreFruta = tiposFruta.find(f => String(f.id) === form.tipo_fruta_id)?.nombre || ''
  const nombreEmpaque = empaques.find(e => String(e.id) === form.empaque_id)?.tamanio || ''
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? "bg-[#141a14]" : "bg-gray-50"}`}>
      <div className="w-full flex justify-end p-6 md:p-8">
        <button
          onClick={() => setDarkMode(d => !d)}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow border text-lg font-semibold
            ${darkMode ? "bg-gray-900 border-gray-800 text-green-300 hover:bg-gray-800" : "bg-white border-gray-200 text-green-800 hover:bg-gray-100"}`}>
          {darkMode ? (<><span className="i-lucide-moon w-7 h-7" /> Modo noche</>) : (<><span className="i-lucide-sun w-7 h-7" /> Modo día</>)}
        </button>
      </div>
      <main className="flex-1 flex flex-col items-center justify-center px-2 pb-12">
        <div className={`w-full max-w-2xl rounded-3xl shadow-2xl border mt-8 mb-8 ${darkMode ? "bg-[#1a2220] border-green-700" : "bg-white border-green-200"}`}>
          <div className="w-full flex flex-col items-center py-8 border-b" style={{ borderColor: darkMode ? "#33ff99aa" : "#5eead4" }}>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-4xl">🍊</span>
              <span className={`font-bold text-3xl tracking-wide ${darkMode ? "text-green-300" : "text-green-800"}`}>El Molinito</span>
            </div>
            <h2 className={`text-2xl font-bold mb-2 text-center ${darkMode ? "text-green-100" : "text-green-800"}`}>Registro de Recepcion – Maquila</h2>
            <div className="flex items-center gap-3">
              <span className={`font-bold ${darkMode ? "text-green-200" : "text-green-700"}`}>N° de Nota:</span>
              <span className={`text-xl font-mono rounded-xl px-6 py-2 border ${darkMode ? "bg-[#192119] border-green-700 text-green-300" : "bg-gray-100 border-green-200 text-green-800"}`}>{siguienteNumero ?? '...'}</span>
            </div>
          </div>
          <div className="py-10 px-6 md:px-12">
            {paso === 1 && (
              <section>
                <h3 className={`mb-5 text-xl font-bold ${darkMode ? "text-green-100" : "text-green-800"}`}>Selecciona agricultor</h3>
                <div className="flex flex-wrap gap-6 justify-center mb-2">
                  {agricultores.map(a => (
                    <button
                      key={a.id}
                      onClick={() => handleAgricultor(String(a.id))}
                      className={`rounded-xl px-8 py-5 font-semibold border shadow-sm transition
                        ${darkMode
                          ? "bg-[#222] border-green-700 text-green-200 hover:bg-green-950"
                          : "bg-white border-green-200 text-green-900 hover:bg-green-50"
                        }`}
                      style={{ minWidth: 200, minHeight: 56 }}>{a.nombre} {a.apellido}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center">
                  <button
                    className={`py-3 px-6 rounded-xl font-bold text-lg transition border
                      ${darkMode
                        ? "bg-gray-800 border-gray-700 text-green-100 hover:bg-gray-700"
                        : "bg-gray-200 border-gray-200 text-green-700 hover:bg-gray-300"}`}
                    onClick={() => router.push('/panel/Rutas/recepcion/recepcion')}>
                    Menú principal
                  </button>
                </div>
              </section>
            )}
            {paso === 2 && (
              <section>
                <h3 className={`mb-5 text-xl font-bold ${darkMode ? "text-green-100" : "text-green-800"}`}>Selecciona tipo de fruta</h3>
                <div className="flex flex-wrap gap-6 justify-center mb-2">
                  {tiposFruta.map(f => (
                    <button
                      key={f.id}
                      onClick={() => { actualizarForm('tipo_fruta_id', String(f.id)); siguiente() }}
                      className={`rounded-xl px-8 py-5 font-semibold border shadow-sm transition
                        ${darkMode
                          ? "bg-[#222] border-green-700 text-green-200 hover:bg-green-950"
                          : "bg-white border-green-200 text-green-900 hover:bg-green-50"
                        }`}
                      style={{ minWidth: 200, minHeight: 56 }}>{f.nombre}</button>
                  ))}
                </div>
                <div className="flex justify-between">
                  <button onClick={anterior} className="text-green-400 text-lg font-semibold underline">Volver</button>
                  <div />
                </div>
              </section>
            )}
            {paso === 3 && (
              <section>
                <h3 className={`mb-5 text-xl font-bold ${darkMode ? "text-green-100" : "text-green-800"}`}>Cantidad de cajas</h3>
                <input
                  autoFocus
                  type="number"
                  value={form.cantidad_cajas}
                  onChange={e => actualizarForm('cantidad_cajas', e.target.value)}
                  className={`w-full p-5 rounded-xl text-center text-2xl mb-6 transition
                    ${darkMode
                      ? "bg-[#222922] border border-green-700 text-green-100 focus:ring-2 focus:ring-green-400"
                      : "bg-gray-50 border border-green-200 text-green-900 focus:ring-2 focus:ring-green-400"
                    }`}
                  required
                  min={1}
                />
                <div className="flex justify-between">
                  <button onClick={anterior} className="text-green-400 text-lg font-semibold underline">Volver</button>
                  <button
                    onClick={() => form.cantidad_cajas && siguiente()}
                    className={`font-bold py-3 px-8 rounded-xl shadow transition border text-lg
                      ${darkMode
                        ? "bg-green-700 hover:bg-green-800 text-white border-green-800"
                        : "bg-green-600 hover:bg-green-700 text-white border-green-200"
                      }`}
                    disabled={!form.cantidad_cajas}
                  >Siguiente</button>
                </div>
              </section>
            )}
            {paso === 4 && (
              <section>
                <h3 className={`mb-5 text-xl font-bold ${darkMode ? "text-green-100" : "text-green-800"}`}>Selecciona el tipo de empaque</h3>
                <div className="flex flex-wrap gap-6 justify-center mb-2">
                  {empaques.map(empaque => (
                    <button
                      key={empaque.id}
                      onClick={() => {
                        actualizarForm('empaque_id', String(empaque.id));
                        actualizarForm('peso_caja_oz', empaque.tamanio);
                        siguiente();
                      }}
                      className={`rounded-xl px-8 py-5 font-semibold border shadow-sm transition
                        ${darkMode
                          ? "bg-[#1d251d] border-green-700 text-green-200 hover:bg-green-950"
                          : "bg-white border-green-200 text-green-900 hover:bg-green-50"
                        } ${form.empaque_id === String(empaque.id) ? "ring-4 ring-green-300" : ""}`}
                      style={{ minWidth: 170, minHeight: 56 }}>{empaque.tamanio}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between mt-8">
                  <button onClick={anterior} className="text-green-400 text-lg font-semibold underline">Volver</button>
                  <div />
                </div>
              </section>
            )}
            {paso === 5 && (
              <section className="space-y-4">
                <input placeholder="Sector" value={form.sector} onChange={e => actualizarForm('sector', e.target.value)} className="w-full p-3 rounded-xl" />
                <input placeholder="Marca" value={form.marca} onChange={e => actualizarForm('marca', e.target.value)} className="w-full p-3 rounded-xl" />
                <input placeholder="Destino" value={form.destino} onChange={e => actualizarForm('destino', e.target.value)} className="w-full p-3 rounded-xl" />
                <input placeholder="Variedad" value={form.variedad} onChange={e => actualizarForm('variedad', e.target.value)} className="w-full p-3 rounded-xl" />
                <select value={form.tipo_produccion} onChange={e => actualizarForm('tipo_produccion', e.target.value)} className="w-full p-3 rounded-xl">
                  <option value="convencional">Convencional</option>
                  <option value="organica">Orgánica</option>
                </select>
                <textarea placeholder="Notas (opcional)" value={form.notas} onChange={e => actualizarForm('notas', e.target.value)} className="w-full p-3 rounded-xl" />
                <div className="flex justify-between">
                  <button onClick={anterior} className="text-green-400 text-lg font-semibold underline">Volver</button>
                  <button
                    onClick={siguiente}
                    className={`font-bold py-3 px-8 rounded-xl shadow transition border text-lg
                      ${darkMode
                        ? "bg-green-700 hover:bg-green-800 text-white border-green-800"
                        : "bg-green-600 hover:bg-green-700 text-white border-green-200"
                      }`}>
                    Siguiente
                  </button>
                </div>
              </section>
            )}
            {paso === 6 && (
              <section className="space-y-4">
                <h3 className={`text-xl font-bold ${darkMode ? "text-green-100" : "text-green-800"}`}>Resumen</h3>
                <p><b>Agricultor:</b> {nombreAgricultor}</p>
                <p><b>Fruta:</b> {nombreFruta}</p>
                <p><b>Cajas:</b> {form.cantidad_cajas}</p>
                <p><b>Empaque:</b> {nombreEmpaque}</p>
                <p><b>Sector:</b> {form.sector}</p>
                <p><b>Marca:</b> {form.marca}</p>
                <p><b>Destino:</b> {form.destino}</p>
                <p><b>Variedad:</b> {form.variedad}</p>
                <p><b>Producción:</b> {form.tipo_produccion}</p>
                <p><b>Notas:</b> {form.notas || '—'}</p>
                <div className="flex justify-between">
                  <button onClick={anterior} className="text-green-400 text-lg font-semibold underline">Volver</button>
                  <div className="flex gap-4">
                    <button onClick={handleFinalizar} className="bg-green-600 text-white font-bold px-6 py-3 rounded-xl">Finalizar nota</button>
                  </div>
                </div>
              </section>
            )}
            {mensaje && (
              <div className="text-center mt-6">
                <p className={`font-semibold ${mensaje.includes('correctamente') ? 'text-green-500' : 'text-red-500'}`}>{mensaje}</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className={`w-full text-center py-6 border-t text-lg mt-auto ${darkMode ? "bg-[#101410] border-green-950 text-green-200" : "bg-gray-100 border-green-200 text-green-900"}`}>
        © {new Date().getFullYear()} El Molinito – Sistema de logística y control
      </footer>
    </div>
  )
}

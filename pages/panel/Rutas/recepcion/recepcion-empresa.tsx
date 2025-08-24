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
  const [darkMode, setDarkMode] = useState(true)

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
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? "bg-[#181818]" : "bg-gray-50"}`}>
      <div className="w-full flex justify-end p-6 md:p-8">
        <button
          onClick={() => setDarkMode(d => !d)}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow border text-lg font-semibold
            ${darkMode ? "bg-gray-900 border-gray-800 text-orange-400 hover:bg-gray-800"
              : "bg-white border-gray-200 text-orange-600 hover:bg-gray-100"}`}>
          {darkMode ? (
            <>
              <span className="i-lucide-moon w-7 h-7" /> Modo noche
            </>
          ) : (
            <>
              <span className="i-lucide-sun w-7 h-7" /> Modo día
            </>
          )}
        </button>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-2 pb-12">
        <div className={`w-full max-w-lg md:max-w-2xl rounded-3xl shadow-2xl border mt-8 mb-8
          ${darkMode ? "bg-[#23272f] border-orange-700" : "bg-white border-gray-200"}`}>
          <div className="w-full flex flex-col items-center py-8 border-b"
            style={{ borderColor: darkMode ? "#ffac4b44" : "#f6ad55" }}>
            <div className="flex items-center gap-4 mb-3">
              <span className={`text-4xl ${darkMode ? "drop-shadow" : ""}`}>🍊</span>
              <span className={`font-bold text-3xl tracking-wide ${darkMode ? "text-orange-400" : "text-orange-700"}`}>
                El Molinito
              </span>
            </div>
            <h2 className={`text-2xl font-bold mb-2 text-center ${darkMode ? "text-white" : "text-gray-900"}`}>
              Registro de Recepción – Empresa
            </h2>
            <div className="flex items-center gap-3">
              <span className={`font-bold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>N° de Nota:</span>
              <span className={`text-xl font-mono rounded-xl px-6 py-2 border
                ${darkMode ? "bg-[#1b1b1b] border-orange-700 text-orange-400"
                  : "bg-gray-100 border-orange-200 text-orange-700"}`}>
                {siguienteNumero ?? '...'}
              </span>
            </div>
          </div>

          <div className="py-10 px-6 md:px-12 space-y-6">
            {paso === 1 && (
              <section>
                <h3 className={`mb-5 text-xl font-bold ${darkMode ? "text-gray-100" : "text-gray-700"}`}>
                  Selecciona la empresa
                </h3>
                <div className="flex flex-wrap gap-6 justify-center mb-6">
                  {empresas.map(emp => (
                    <button
                      key={emp.id}
                      onClick={() => handleEmpresa(String(emp.id))}
                      className={`rounded-xl px-8 py-5 font-semibold border shadow-sm transition
                        ${darkMode
                          ? "bg-[#222] border-orange-700 text-orange-300 hover:bg-orange-950"
                          : "bg-white border-orange-200 text-gray-900 hover:bg-orange-50"}`}
                      style={{ minWidth: 200, minHeight: 56 }}
                    >
                      {emp.empresa}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => router.push('/panel/Rutas/recepcion/recepcion')}
                    className={`py-3 px-6 rounded-xl font-bold text-lg transition border
                      ${darkMode
                        ? "bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700"
                        : "bg-gray-200 border-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                    Menú principal
                  </button>
                </div>
              </section>
            )}

            {paso === 2 && (
              <section>
                <h3 className={`mb-5 text-xl font-bold ${darkMode ? "text-gray-100" : "text-gray-700"}`}>
                  Selecciona el tipo de fruta
                </h3>
                <div className="flex flex-wrap gap-6 justify-center mb-6">
                  {tiposFruta.map(fruta => (
                    <button
                      key={fruta.id}
                      onClick={() => { actualizarForm('tipo_fruta_id', String(fruta.id)); siguiente() }}
                      className={`rounded-xl px-8 py-5 font-semibold border shadow-sm transition
                        ${darkMode
                          ? "bg-[#222] border-orange-700 text-orange-300 hover:bg-orange-950"
                          : "bg-white border-orange-200 text-gray-900 hover:bg-orange-50"}`}
                      style={{ minWidth: 200, minHeight: 56 }}
                    >
                      {fruta.nombre}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between">
                  <button onClick={anterior} className="text-orange-400 text-lg font-semibold underline">Volver</button>
                  <div />
                </div>
              </section>
            )}

            {paso === 3 && (
              <section>
                <h3 className={`mb-5 text-xl font-bold ${darkMode ? "text-gray-100" : "text-gray-700"}`}>
                  Cantidad de cajas
                </h3>
                <input
                  autoFocus
                  type="number"
                  value={form.cantidad_cajas}
                  onChange={e => actualizarForm('cantidad_cajas', e.target.value)}
                  className={`w-full p-5 rounded-xl text-center text-2xl mb-6 transition
                    ${darkMode
                      ? "bg-[#23272f] border border-orange-700 text-orange-100 focus:ring-2 focus:ring-orange-500"
                      : "bg-gray-50 border border-orange-200 text-gray-900 focus:ring-2 focus:ring-orange-400"}`}
                  required
                  min={1}
                />
                <div className="flex justify-between">
                  <button onClick={anterior} className="text-orange-400 text-lg font-semibold underline">Volver</button>
                  <button
                    onClick={siguiente}
                    className={`font-bold py-3 px-8 rounded-xl shadow transition border text-lg
                      ${darkMode
                        ? "bg-orange-600 hover:bg-orange-700 text-white border-orange-700"
                        : "bg-orange-500 hover:bg-orange-600 text-white border-orange-200"}`}>
                    Siguiente
                  </button>
                </div>
              </section>
            )}

            {paso === 4 && (
              <section>
                <h3 className={`mb-5 text-xl font-bold ${darkMode ? "text-gray-100" : "text-gray-700"}`}>
                  Selecciona el tipo de empaque
                </h3>
                <div className="flex flex-wrap gap-6 justify-center mb-6">
                  {empaques.map(emp => (
                    <button
                      key={emp.id}
                      onClick={() => {
                        actualizarForm('empaque_id', String(emp.id));
                        actualizarForm('peso_caja_oz', emp.tamanio);
                        siguiente();
                      }}
                      className={`rounded-xl px-8 py-5 font-semibold border shadow-sm transition
                        ${darkMode
                          ? "bg-[#222] border-orange-700 text-orange-300 hover:bg-orange-950"
                          : "bg-white border-orange-200 text-gray-900 hover:bg-orange-50"}`}
                      style={{ minWidth: 170, minHeight: 56 }}
                    >
                      {emp.tamanio}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between">
                  <button onClick={anterior} className="text-orange-400 text-lg font-semibold underline">Volver</button>
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
                  <button onClick={anterior} className="text-orange-400 text-lg font-semibold underline">Volver</button>
                  <button
                    onClick={siguiente}
                    className={`font-bold py-3 px-8 rounded-xl shadow transition border text-lg
                      ${darkMode
                        ? "bg-orange-600 hover:bg-orange-700 text-white border-orange-700"
                        : "bg-orange-500 hover:bg-orange-600 text-white border-orange-200"}`}>
                    Siguiente
                  </button>
                </div>
              </section>
            )}

            {paso === 6 && (
              <section className="space-y-4">
                <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>Resumen</h3>
                <p><b>Fruta:</b> {nombreFruta}</p>
                <p><b>Cajas:</b> {form.cantidad_cajas}</p>
                <p><b>Peso por caja (oz):</b> {form.peso_caja_oz}</p>
                <p><b>Empaque:</b> {nombreEmpaque}</p>
                <p><b>Sector:</b> {form.sector}</p>
                <p><b>Marca:</b> {form.marca}</p>
                <p><b>Destino:</b> {form.destino}</p>
                <p><b>Variedad:</b> {form.variedad}</p>
                <p><b>Producción:</b> {form.tipo_produccion}</p>
                <p><b>Notas:</b> {form.notas || '—'}</p>
                <div className="flex justify-between">
                  <button onClick={anterior} className="text-orange-400 text-lg font-semibold underline">Volver</button>
                  <div className="flex gap-4">
                    <button onClick={handleSubmit} className="bg-green-600 text-white font-bold px-6 py-3 rounded-xl">Finalizar nota</button>
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

      <footer className={`w-full text-center py-6 border-t text-lg mt-auto
        ${darkMode ? "bg-[#151515] border-orange-950 text-orange-200" : "bg-gray-100 border-gray-200 text-gray-500"}`}>
        © {new Date().getFullYear()} El Molinito – Sistema de logística y control
      </footer>
    </div>
  )
}

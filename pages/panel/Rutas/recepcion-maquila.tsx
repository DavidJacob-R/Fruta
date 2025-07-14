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
  const [form, setForm] = useState({
    agricultor_id: '',
    tipo_fruta_id: '',
    cantidad_cajas: '',
    peso_caja_oz: '',
    empaque_id: '',
  })
  const [notas, setNotas] = useState('')
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
        setAgricultores(Array.isArray(data.agricultores) ? data.agricultores : [])
        setTiposFruta(Array.isArray(data.frutas) ? data.frutas : [])
      })
    // Carga de empaques (igual que en recepcion-empresa)
    fetch('/api/empaques/listar')
      .then(res => res.json())
      .then(data => {
        setEmpaques(Array.isArray(data.empaques) ? data.empaques : [])
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
      empaque_id: form.empaque_id,
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
        empaque_id: '',
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
  const nombreEmpaque = empaques.find(e => String(e.id) === form.empaque_id)?.tamanio || ''

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300
      ${darkMode ? "bg-[#141a14]" : "bg-gray-50"}`}>
      {/* Modo noche/día */}
      <div className="w-full flex justify-end p-4">
        <button
          onClick={() => setDarkMode(d => !d)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow border text-sm font-medium
            ${darkMode ? "bg-gray-900 border-gray-800 text-green-300 hover:bg-gray-800"
              : "bg-white border-gray-200 text-green-800 hover:bg-gray-100"}`}>
          {darkMode ? (<>
            <span className="i-lucide-moon w-5 h-5" /> Modo noche</>
          ) : (<>
            <span className="i-lucide-sun w-5 h-5" /> Modo día</>
          )}
        </button>
      </div>
      {/* Panel central */}
      <main className="flex-1 flex flex-col items-center justify-center px-2 pb-8">
        <div className={`w-full max-w-2xl rounded-2xl shadow-xl border mt-8 mb-8
          ${darkMode
            ? "bg-[#1a2220] border-green-700"
            : "bg-white border-green-200"
          }`}>
          {/* Branding y header */}
          <div className="w-full flex flex-col items-center py-6 border-b"
            style={{ borderColor: darkMode ? "#33ff99aa" : "#5eead4" }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🍊</span>
              <span className={`font-semibold text-2xl tracking-wide
                ${darkMode ? "text-green-300" : "text-green-800"}`}>
                El Molinito
              </span>
            </div>
            <h2 className={`text-xl md:text-2xl font-bold mb-2 text-center
              ${darkMode ? "text-green-100" : "text-green-800"}`}>
              Registro de Recepción – Maquila
            </h2>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${darkMode ? "text-green-200" : "text-green-700"}`}>N° de Nota:</span>
              <span className={`text-lg font-mono rounded-xl px-4 py-1 border
                ${darkMode
                  ? "bg-[#192119] border-green-700 text-green-300"
                  : "bg-gray-100 border-green-200 text-green-800"
                }`}>{siguienteNumero ?? '...'}</span>
            </div>
          </div>

          {/* FORM WIZARD */}
          <div className="py-8 px-5 md:px-10">
            {/* Paso 1: Agricultor */}
            {paso === 1 && (
              <section>
                <h3 className={`mb-3 text-lg font-bold 
                  ${darkMode ? "text-green-100" : "text-green-800"}`}>Selecciona agricultor</h3>
                <div className="flex flex-wrap gap-4 justify-center mb-2">
                  {agricultores.length === 0 && <span className="text-gray-400 text-base">No hay agricultores disponibles</span>}
                  {agricultores.map(a => (
                    <button
                      key={a.id}
                      onClick={() => { setForm(f => ({ ...f, agricultor_id: String(a.id) })); setPaso(2); }}
                      className={`rounded-lg px-8 py-4 font-semibold border shadow-sm transition
                        ${darkMode
                          ? "bg-[#222] border-green-700 text-green-200 hover:bg-green-950"
                          : "bg-white border-green-200 text-green-900 hover:bg-green-50"
                        }`}
                      style={{ minWidth: 170 }}>{a.nombre} {a.apellido}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex justify-between">
                  <div />
                  <button
                    className={`py-2 px-4 rounded-xl font-bold transition border
                      ${darkMode
                        ? "bg-gray-800 border-gray-700 text-green-100 hover:bg-gray-700"
                        : "bg-gray-200 border-gray-200 text-green-700 hover:bg-gray-300"
                      }`}
                    onClick={() => router.push('/panel/Rutas/recepcion')}>
                    Regresar al menú principal
                  </button>
                </div>
              </section>
            )}

            {/* Paso 2: Fruta */}
            {paso === 2 && (
              <section>
                <h3 className={`mb-3 text-lg font-bold 
                  ${darkMode ? "text-green-100" : "text-green-800"}`}>Selecciona tipo de fruta</h3>
                <div className="flex flex-wrap gap-4 justify-center mb-2">
                  {tiposFruta.length === 0 && <span className="text-gray-400 text-base">No hay tipos de fruta</span>}
                  {tiposFruta.map(f => (
                    <button
                      key={f.id}
                      onClick={() => { setForm(form => ({ ...form, tipo_fruta_id: String(f.id) })); setPaso(3); }}
                      className={`rounded-lg px-8 py-4 font-semibold border shadow-sm transition
                        ${darkMode
                          ? "bg-[#222] border-green-700 text-green-200 hover:bg-green-950"
                          : "bg-white border-green-200 text-green-900 hover:bg-green-50"
                        }`}
                      style={{ minWidth: 170 }}
                    >{f.nombre}</button>
                  ))}
                </div>
                <div className="mt-6 flex justify-between">
                  <button onClick={anterior} className="text-green-400 font-semibold underline">Volver</button>
                  <div />
                </div>
              </section>
            )}

            {/* Paso 3: Cantidad de cajas */}
            {paso === 3 && (
              <section>
                <h3 className={`mb-3 text-lg font-bold 
                  ${darkMode ? "text-green-100" : "text-green-800"}`}>Cantidad de cajas</h3>
                <input
                  autoFocus
                  type="number"
                  value={form.cantidad_cajas}
                  onChange={e => setForm(f => ({ ...f, cantidad_cajas: e.target.value }))}
                  className={`w-full p-4 rounded-xl text-center text-xl mb-5 transition
                    ${darkMode
                      ? "bg-[#222922] border border-green-700 text-green-100 focus:ring-2 focus:ring-green-400"
                      : "bg-gray-50 border border-green-200 text-green-900 focus:ring-2 focus:ring-green-400"
                    }`}
                  required
                  min={1}/>
                <div className="flex justify-between">
                  <button onClick={anterior} className="text-green-400 font-semibold underline">Volver</button>
                  <button
                    onClick={() => form.cantidad_cajas && setPaso(4)}
                    className={`font-bold py-2 px-6 rounded-xl shadow transition border
                      ${darkMode
                        ? "bg-green-700 hover:bg-green-800 text-white border-green-800"
                        : "bg-green-600 hover:bg-green-700 text-white border-green-200"
                      }`}
                    disabled={!form.cantidad_cajas}
                  >Siguiente</button>
                </div>
              </section>
            )}

            {/* Paso 4: Empaque - DINÁMICO */}
            {paso === 4 && (
              <section>
                <h3 className={`mb-3 text-lg font-bold 
                  ${darkMode ? "text-green-100" : "text-green-800"}`}>Selecciona el tipo de empaque</h3>
                <div className="flex flex-wrap gap-4 justify-center mb-2">
                  {empaques.length === 0 && <span className="text-gray-400 text-base">No hay empaques registrados</span>}
                  {empaques.map(empaque => (
                    <button
                      key={empaque.id}
                      onClick={() => {
                        setForm(f => ({
                          ...f,
                          peso_caja_oz: empaque.tamanio,
                          empaque_id: String(empaque.id)
                        }))
                        setPaso(5)
                      }}
                      className={`rounded-lg px-8 py-4 font-semibold border shadow-sm transition
                        ${darkMode
                          ? "bg-[#1d251d] border-green-700 text-green-200 hover:bg-green-950"
                          : "bg-white border-green-200 text-green-900 hover:bg-green-50"
                        } ${form.empaque_id === String(empaque.id) ? "ring-4 ring-green-300" : ""}`}
                      style={{ minWidth: 150 }}>
                      {empaque.tamanio}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between mt-6">
                  <button onClick={anterior} className="text-green-400 font-semibold underline">Volver</button>
                  <div />
                </div>
              </section>
            )}

            {/* Paso 5: Notas */}
            {paso === 5 && (
              <section>
                <h3 className={`mb-3 text-lg font-bold 
                  ${darkMode ? "text-green-100" : "text-green-800"}`}>¿Deseas agregar notas? <span className="text-base font-normal text-gray-400">(opcional)</span></h3>
                <textarea
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  placeholder="Escribe aquí alguna nota relevante..."
                  className={`w-full h-24 p-4 rounded-xl mb-5 transition
                    ${darkMode
                      ? "bg-[#232a22] border border-green-700 text-green-100 focus:ring-2 focus:ring-green-400"
                      : "bg-gray-50 border border-green-200 text-green-900 focus:ring-2 focus:ring-green-400"
                    }`}/>
                <div className="flex justify-between">
                  <button onClick={() => setPaso(4)} className="text-green-400 font-semibold underline">Volver</button>
                  <button
                    onClick={() => setPaso(6)}
                    className={`font-bold py-2 px-6 rounded-xl shadow transition border
                      ${darkMode
                        ? "bg-green-700 hover:bg-green-800 text-white border-green-800"
                        : "bg-green-600 hover:bg-green-700 text-white border-green-200"
                      }`}
                  >Siguiente</button>
                </div>
              </section>
            )}

            {/* Paso 6: Resumen */}
            {paso === 6 && (
              <section>
                <h3 className={`text-lg font-bold mb-6 
                  ${darkMode ? "text-green-100" : "text-green-800"}`}>Resumen de la nota</h3>
                <ul className="mb-6 text-base space-y-2">
                  <li><span className={`font-semibold ${darkMode ? "text-green-200" : "text-green-800"}`}>Agricultor:</span> {nombreAgricultor}</li>
                  <li><span className={`font-semibold ${darkMode ? "text-green-200" : "text-green-800"}`}>Tipo de fruta:</span> {nombreFruta}</li>
                  <li><span className={`font-semibold ${darkMode ? "text-green-200" : "text-green-800"}`}>Cantidad de cajas:</span> {form.cantidad_cajas}</li>
                  <li><span className={`font-semibold ${darkMode ? "text-green-200" : "text-green-800"}`}>Tipo de empaque:</span> {nombreEmpaque}</li>
                  <li><span className={`font-semibold ${darkMode ? "text-green-200" : "text-green-800"}`}>Notas:</span> {notas ? notas : <span className="italic text-gray-400">Sin notas</span>}</li>
                </ul>
                <div className="flex justify-between">
                  <button onClick={() => setPaso(5)} className="text-green-400 font-semibold underline">Volver</button>
                  <button
                    onClick={handleSubmit}
                    className={`font-bold py-2 px-8 rounded-xl shadow transition border
                      ${darkMode
                        ? "bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-800"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-200"
                      }`}>Registrar nota
                  </button>
                </div>
              </section>
            )}

            {/* Mensaje */}
            {mensaje && (
              <div className="mt-8 mb-3 text-center">
                <span className={`px-6 py-2 rounded-lg font-semibold text-base border
                  ${mensaje.includes('correctamente')
                    ? (darkMode
                      ? "bg-emerald-900/70 text-emerald-300 border-emerald-600"
                      : "bg-green-50 text-green-700 border-green-300"
                    )
                    : (darkMode
                      ? "bg-red-900/80 text-red-300 border-red-700"
                      : "bg-red-50 text-red-700 border-red-300"
                    )
                  }`}>
                  {mensaje}
                </span>
              </div>
            )}
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className={`w-full text-center py-4 border-t text-sm mt-auto
        ${darkMode
          ? "bg-[#101410] border-green-950 text-green-200"
          : "bg-gray-100 border-green-200 text-green-900"
        }`}>
        © {new Date().getFullYear()} El Molinito – Sistema de logística y control
      </footer>
    </div>
  )
}

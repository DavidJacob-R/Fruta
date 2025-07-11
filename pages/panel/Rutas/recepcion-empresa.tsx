import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

type Empresa = { id: number, empresa: string }
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
  // DARK MODE
  const [darkMode, setDarkMode] = useState(true)

  // Aplica dark/light al <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
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

  const nombreEmpresa = empresas.find(e => String(e.id) === form.empresa_id)?.empresa || ''
  const nombreFruta = tiposFruta.find(f => String(f.id) === form.tipo_fruta_id)?.nombre || ''
  const nombreEmpaque = empaques.find(e => String(e.id) === form.empaque_id)?.tamanio || ''

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 
        ${darkMode ? "bg-[#181818]" : "bg-gray-50"}`}>
      {/* Modo noche/día */}
      <div className="w-full flex justify-end p-4">
        <button
          onClick={() => setDarkMode(d => !d)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow border 
            ${darkMode ? "bg-gray-900 border-gray-800 text-orange-400 hover:bg-gray-800" 
              : "bg-white border-gray-200 text-orange-600 hover:bg-gray-100"}`}>
          {darkMode ? (
            <>
              <span className="i-lucide-moon w-5 h-5" /> Modo noche
            </>
          ) : (
            <>
              <span className="i-lucide-sun w-5 h-5" /> Modo día
            </>
          )}
        </button>
      </div>
      <main className="flex-1 flex flex-col items-center justify-center px-2 pb-8">
        <div className={`w-full max-w-2xl rounded-2xl shadow-xl border mt-8 mb-8
          ${darkMode
            ? "bg-[#23272f] border-orange-700"
            : "bg-white border-gray-200"
          }`} >
          {/* HEADER */}
          <div className="w-full flex flex-col items-center py-6 border-b"
            style={{
              borderColor: darkMode ? "#ffac4b44" : "#f6ad55"
            }} >
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-3xl ${darkMode ? "drop-shadow" : ""}`}>🍊</span>
              <span className={`font-semibold text-2xl tracking-wide
                ${darkMode ? "text-orange-400" : "text-orange-700"}`}>
                El Molinito
              </span>
            </div>
            <h2 className={`text-xl md:text-2xl font-bold mb-2 text-center 
              ${darkMode ? "text-white" : "text-gray-900"}`}>
              Registro de Recepción – Empresa
            </h2>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>N° de Nota:</span>
              <span className={`text-lg font-mono rounded-xl px-4 py-1 border
                ${darkMode
                  ? "bg-[#1b1b1b] border-orange-700 text-orange-400"
                  : "bg-gray-100 border-orange-200 text-orange-700"
                }`}
              >{siguienteNumero ?? '...'}</span>
            </div>
          </div>

          {/* FORM WIZARD */}
          <div className="py-8 px-5 md:px-10">
            {/* Paso 1: Seleccionar Empresa */}
            {paso === 1 && (
              <section>
                <h3 className={`mb-3 text-lg font-bold 
                  ${darkMode ? "text-gray-100" : "text-gray-700"}`}>Selecciona la empresa</h3>
                <div className="flex flex-wrap gap-4 justify-center mb-2">
                  {empresas.length === 0 && <span className="text-gray-400 text-base">No hay empresas disponibles</span>}
                  {empresas.map(emp => (
                    <button
                      key={emp.id}
                      onClick={() => handleEmpresa(String(emp.id))}
                      className={`rounded-lg px-8 py-4 font-semibold border shadow-sm transition
                        ${darkMode
                          ? "bg-[#222] border-orange-700 text-orange-300 hover:bg-orange-950"
                          : "bg-white border-orange-200 text-gray-900 hover:bg-orange-50"
                        }`}
                      style={{ minWidth: 170 }}
                    >{emp.empresa}</button>
                  ))}
                </div>
                <div className="mt-6 flex justify-between">
                  <div />
                  <button
                    className={`py-2 px-4 rounded-xl font-bold transition border
                      ${darkMode
                        ? "bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700"
                        : "bg-gray-200 border-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    onClick={() => router.push('/panel/Rutas/recepcion')}>
                    Regresar al menú principal
                  </button>
                </div>
              </section>
            )}

            {/* Paso 2: Seleccionar Fruta */}
            {paso === 2 && (
              <section>
                <h3 className={`mb-3 text-lg font-bold 
                  ${darkMode ? "text-gray-100" : "text-gray-700"}`}>Selecciona el tipo de fruta</h3>
                <div className="flex flex-wrap gap-4 justify-center mb-2">
                  {tiposFruta.length === 0 && <span className="text-gray-400 text-base">No hay tipos de fruta</span>}
                  {tiposFruta.map(fruta => (
                    <button
                      key={fruta.id}
                      onClick={() => handleFruta(String(fruta.id))}
                      className={`rounded-lg px-8 py-4 font-semibold border shadow-sm transition
                        ${darkMode
                          ? "bg-[#222] border-orange-700 text-orange-300 hover:bg-orange-950"
                          : "bg-white border-orange-200 text-gray-900 hover:bg-orange-50"
                        }`}
                      style={{ minWidth: 170 }}>{fruta.nombre}</button>
                  ))}
                </div>
                <div className="mt-6 flex justify-between">
                  <button onClick={anterior} className="text-orange-400 font-semibold underline">Volver</button>
                  <div />
                </div>
              </section>
            )}

            {/* Paso 3: Cantidad */}
            {paso === 3 && (
              <section>
                <h3 className={`mb-3 text-lg font-bold 
                  ${darkMode ? "text-gray-100" : "text-gray-700"}`}>Cantidad de fruta (oz)</h3>
                <input
                  autoFocus
                  type="number"
                  value={form.cantidad_oz}
                  onChange={handleCantidad}
                  className={`w-full p-4 rounded-xl text-center text-xl mb-5 transition
                    ${darkMode
                      ? "bg-[#23272f] border border-orange-700 text-orange-100 focus:ring-2 focus:ring-orange-500"
                      : "bg-gray-50 border border-orange-200 text-gray-900 focus:ring-2 focus:ring-orange-400"
                    }`}
                  required
                  min={1}/>
                <div className="flex justify-between">
                  <button onClick={anterior} className="text-orange-400 font-semibold underline">Volver</button>
                  <button
                    onClick={() => form.cantidad_oz && setPaso(4)}
                    className={`font-bold py-2 px-6 rounded-xl shadow transition border
                      ${darkMode
                        ? "bg-orange-600 hover:bg-orange-700 text-white border-orange-700"
                        : "bg-orange-500 hover:bg-orange-600 text-white border-orange-200"
                      }`}
                    disabled={!form.cantidad_oz}
                  >Siguiente</button>
                </div>
              </section>
            )}

            {/* Paso 4: Empaque */}
            {paso === 4 && (
              <section>
                <h3 className={`mb-3 text-lg font-bold 
                  ${darkMode ? "text-gray-100" : "text-gray-700"}`}>Selecciona el tipo de empaque</h3>
                <div className="flex flex-wrap gap-4 justify-center mb-2">
                  {empaques.length === 0 && <span className="text-gray-400 text-base">No hay empaques registrados</span>}
                  {empaques.map(empaque => (
                    <button
                      key={empaque.id}
                      onClick={() => handleEmpaque(String(empaque.id))}
                      className={`rounded-lg px-8 py-4 font-semibold border shadow-sm transition
                        ${darkMode
                          ? "bg-[#222] border-orange-700 text-orange-300 hover:bg-orange-950"
                          : "bg-white border-orange-200 text-gray-900 hover:bg-orange-50"
                        }`}
                      style={{ minWidth: 150 }}
                    >{empaque.tamanio}</button>
                  ))}
                </div>
                <div className="flex justify-between mt-6">
                  <button onClick={anterior} className="text-orange-400 font-semibold underline">Volver</button>
                  <div />
                </div>
              </section>
            )}

            {/* Paso 5: Notas */}
            {paso === 5 && (
              <section>
                <h3 className={`mb-3 text-lg font-bold 
                  ${darkMode ? "text-gray-100" : "text-gray-700"}`}>¿Deseas agregar notas? <span className="text-base font-normal text-gray-400">(opcional)</span></h3>
                <textarea
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  placeholder="Escribe aquí alguna nota relevante..."
                  className={`w-full h-24 p-4 rounded-xl mb-5 transition
                    ${darkMode
                      ? "bg-[#23272f] border border-orange-700 text-orange-100 focus:ring-2 focus:ring-orange-500"
                      : "bg-gray-50 border border-orange-200 text-gray-900 focus:ring-2 focus:ring-orange-400"
                    }`}/>
                <div className="flex justify-between">
                  <button onClick={() => setPaso(4)} className="text-orange-400 font-semibold underline">Volver</button>
                  <button
                    onClick={() => setPaso(6)}
                    className={`font-bold py-2 px-6 rounded-xl shadow transition border
                      ${darkMode
                        ? "bg-orange-600 hover:bg-orange-700 text-white border-orange-700"
                        : "bg-orange-500 hover:bg-orange-600 text-white border-orange-200"
                      }`}
                  >Siguiente</button>
                </div>
              </section>
            )}

            {/* Paso 6: Resumen */}
            {paso === 6 && (
              <section>
                <h3 className={`text-lg font-bold mb-6 
                  ${darkMode ? "text-gray-100" : "text-gray-700"}`}>Resumen de la nota</h3>
                <ul className="mb-6 text-base space-y-2">
                  <li><span className={`font-semibold ${darkMode ? "text-orange-200" : "text-gray-800"}`}>Empresa:</span> {nombreEmpresa}</li>
                  <li><span className={`font-semibold ${darkMode ? "text-orange-200" : "text-gray-800"}`}>Tipo de fruta:</span> {nombreFruta}</li>
                  <li><span className={`font-semibold ${darkMode ? "text-orange-200" : "text-gray-800"}`}>Cantidad (oz):</span> {form.cantidad_oz}</li>
                  <li><span className={`font-semibold ${darkMode ? "text-orange-200" : "text-gray-800"}`}>Tipo de empaque:</span> {nombreEmpaque}</li>
                  <li><span className={`font-semibold ${darkMode ? "text-orange-200" : "text-gray-800"}`}>Notas:</span> {notas ? notas : <span className="italic text-gray-400">Sin notas</span>}</li>
                </ul>
                <div className="flex justify-between">
                  <button onClick={() => setPaso(5)} className="text-orange-400 font-semibold underline">Volver</button>
                  <button
                    onClick={handleSubmit}
                    className={`font-bold py-2 px-8 rounded-xl shadow transition border
                      ${darkMode
                        ? "bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-800"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-200"
                      }`}
                  >Registrar nota</button>
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
          ? "bg-[#151515] border-orange-950 text-orange-200"
          : "bg-gray-100 border-gray-200 text-gray-500"
        }`}>
        © {new Date().getFullYear()} El Molinito – Sistema de logística y control
      </footer>
    </div>
  )
}

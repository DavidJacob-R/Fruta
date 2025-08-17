import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'

type Empresa = { id: number, empresa: string }
type Fruta = { id: number, nombre: string }
type Empaque = { id: number, tamanio: string }
type Agricultor = { id: number, clave: string, nombre: string, empresa_id: number }

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
  const [agricultores, setAgricultores] = useState<Agricultor[]>([])
  const [paso, setPaso] = useState(1)
  const [mensaje, setMensaje] = useState('')
  const [empresaID, setEmpresaID] = useState('')
  const [agricultorID, setAgricultorID] = useState<string>('')
  const [darkMode, setDarkMode] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const clickGuardRef = useRef(false)

  const [cargandoEmpresas, setCargandoEmpresas] = useState(false)

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

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [darkMode])

  useEffect(() => {
    const load = async () => {
      try {
        const r1 = await fetch('/api/recepcion/siguiente_nota')
        const d1 = await r1.json()
        setSiguienteNumero(d1?.siguienteNumero ?? null)
      } catch {
        setSiguienteNumero(null)
      }

      setCargandoEmpresas(true)
      try {
        const r2 = await fetch('/api/recepcion/datos')
        const d2 = await r2.json()

        // Empresas: mapeo tolerante (empresa || nombre || razon_social || name)
        const emps = Array.isArray(d2?.empresas) ? d2.empresas : []
        const empsNorm: Empresa[] = emps
          .map((e: any) => ({
            id: Number(e.id),
            empresa: String(e.empresa ?? e.nombre ?? e.razon_social ?? e.name ?? '').trim(),
          }))
          .filter((e: { id: any; empresa: any }) => e.id && e.empresa)
        setEmpresas(empsNorm)

        // Frutas
        const frs = Array.isArray(d2?.frutas) ? d2.frutas : []
        const frsNorm: Fruta[] = frs
          .map((f: any) => ({
            id: Number(f.id),
            nombre: String(f.nombre ?? f.name ?? '').trim(),
          }))
          .filter((f: { id: any; nombre: any }) => f.id && f.nombre)
        setTiposFruta(frsNorm)
      } catch {
        setEmpresas([])
        setTiposFruta([])
      } finally {
        setCargandoEmpresas(false)
      }

      try {
        const r3 = await fetch('/api/empaques/listar')
        const d3 = await r3.json()
        const empa = Array.isArray(d3?.empaques) ? d3.empaques : []
        const empaNorm: Empaque[] = empa
          .map((e: any) => ({
            id: Number(e.id),
            tamanio: String(e.tamanio ?? e.nombre ?? '').trim(),
          }))
          .filter((e: { id: any; tamanio: any }) => e.id && e.tamanio)
        setEmpaques(empaNorm)
      } catch {
        setEmpaques([])
      }
    }
    load()
  }, [])

  const siguiente = () => setPaso(p => p + 1)
  const anterior = () => setPaso(p => Math.max(1, p - 1))
  const actualizarForm = (campo: keyof RegistroFruta, valor: string) => setForm(f => ({ ...f, [campo]: valor }))

  const handleEmpresa = async (id: string) => {
    setEmpresaID(id)
    setAgricultorID('')
    try {
      const res = await fetch(`/api/agricultores_empresa/listar?empresa_id=${id}`)
      const data = await res.json()
      const arr = Array.isArray(data.agricultores) ? data.agricultores : []
      const norm: Agricultor[] = arr
        .map((a: any) => ({
          id: Number(a.id),
          clave: String(a.clave ?? '').trim(),
          nombre: String(a.nombre ?? a.name ?? '').trim(),
          empresa_id: Number(a.empresa_id ?? id)
        }))
        .filter((a: { id: any; nombre: any }) => a.id && a.nombre)
      setAgricultores(norm)
    } catch {
      setAgricultores([])
    }
    setPaso(2)
  }

  const handleAgricultor = (id: string) => { setAgricultorID(id); setPaso(3) }
  const omitirAgricultor = () => { setAgricultorID(''); setPaso(3) }

  const handleSubmit = async () => {
    if (clickGuardRef.current || submitting) return
    clickGuardRef.current = true
    setSubmitting(true)

    try {
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
      const uid = Number(usuario.id) || 1
      const now = new Date()
      const localISOString = now.toLocaleString('sv-SE').replace(' ', 'T')
      const fecha_recepcion = localISOString.slice(0, 16)

      if (!empresaID || !form.tipo_fruta_id || !form.cantidad_cajas || !form.peso_caja_oz || !form.empaque_id) {
        setMensaje('Faltan datos')
        return
      }

      const idem = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`

      const body = {
        empresa_id: Number(empresaID),
        agricultor_id: agricultorID ? Number(agricultorID) : null,
        tipo_fruta_id: Number(form.tipo_fruta_id),
        cantidad_cajas: Number(form.cantidad_cajas),
        peso_caja_oz: String(form.peso_caja_oz),
        fecha_recepcion,
        usuario_recepcion_id: uid,
        empaque_id: Number(form.empaque_id),
        sector: form.sector,
        marca: form.marca,
        destino: form.destino,
        tipo_produccion: form.tipo_produccion,
        variedad: form.variedad,
        notas: form.notas
      }

      const res = await fetch('/api/recepcion/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': idem },
        body: JSON.stringify(body)
      })

      const result = await res.json()
      if (result && result.success) {
        try {
          await fetch('/api/pdf/crea-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ numero_nota: result.numero_nota, fecha: new Date().toLocaleDateString() })
          })
        } catch {}

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
        setEmpresaID('')
        setAgricultorID('')
        setPaso(1)
        fetch('/api/recepcion/siguiente_nota').then(r => r.json()).then(d => setSiguienteNumero(d.siguienteNumero))
        setTimeout(() => setMensaje(''), 2000)
      } else {
        setMensaje(result?.message || 'Error al registrar')
      }
    } finally {
      setSubmitting(false)
      setTimeout(() => { clickGuardRef.current = false }, 400)
    }
  }

  const nombreEmpresa = empresas.find(e => String(e.id) === empresaID)?.empresa || ''
  const nombreFruta = tiposFruta.find(f => String(f.id) === form.tipo_fruta_id)?.nombre || ''
  const nombreEmpaque = empaques.find(e => String(e.id) === form.empaque_id)?.tamanio || ''
  const nombreAgricultor = agricultores.find(a => String(a.id) === agricultorID)?.nombre || ''
  const tituloEmpresa = nombreEmpresa ? `Registro de recepcion - ${nombreEmpresa}` : 'Registro de recepcion - Empresa'

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-[#181818]' : 'bg-gray-50'}`}>
      <div className="w-full flex justify-end p-6 md:p-8">
        <button
          onClick={() => setDarkMode(d => !d)}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow border text-lg font-semibold
            ${darkMode ? 'bg-gray-900 border-gray-800 text-orange-400 hover:bg-gray-800' : 'bg-white border-gray-200 text-orange-600 hover:bg-gray-100'}`}>
          {darkMode ? 'Modo noche' : 'Modo dia'}
        </button>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-2 pb-12">
        <div className={`w-full max-w-lg md:max-w-2xl rounded-3xl shadow-2xl border mt-8 mb-8 ${darkMode ? 'bg-[#23272f] border-orange-700' : 'bg-white border-gray-200'}`}>
          <div className="w-full flex flex-col items-center py-8 border-b" style={{ borderColor: darkMode ? '#ffac4b44' : '#f6ad55' }}>
            <div className="flex items-center gap-4 mb-3">
              <span className={`text-4xl ${darkMode ? 'drop-shadow' : ''}`}>🍊</span>
              <span className={`font-bold text-3xl tracking-wide ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>El Molinito</span>
            </div>
            <h2 className={`text-2xl font-bold mb-2 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>{tituloEmpresa}</h2>
            <div className="flex items-center gap-3">
              <span className={`font-bold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>No. de nota:</span>
              <span className={`text-xl font-mono rounded-xl px-6 py-2 border ${darkMode ? 'bg-[#1b1b1b] border-orange-700 text-orange-400' : 'bg-gray-100 border-orange-200 text-orange-700'}`}>
                {siguienteNumero ?? '...'}
              </span>
            </div>
          </div>

          <div className="py-10 px-6 md:px-12 space-y-6">
            {paso === 1 && (
              <section>
                <h3 className={`mb-5 text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>Selecciona la empresa</h3>

                {cargandoEmpresas ? (
                  <div className={`${darkMode ? 'text-orange-200' : 'text-gray-600'} text-center mb-6`}>Cargando empresas…</div>
                ) : empresas.length === 0 ? (
                  <div className={`${darkMode ? 'text-orange-200' : 'text-gray-600'} text-center mb-6`}>
                    No hay empresas disponibles. Verifica el endpoint <code>/api/recepcion/datos</code> o crea empresas en el panel.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-6 justify-center mb-6">
                    {empresas.map(emp => (
                      <button
                        key={emp.id}
                        onClick={() => handleEmpresa(String(emp.id))}
                        className={`rounded-xl px-8 py-5 font-semibold border shadow-sm transition ${darkMode ? 'bg-[#222] border-orange-700 text-orange-300 hover:bg-orange-950' : 'bg-white border-orange-200 text-gray-900 hover:bg-orange-50'}`}
                        style={{ minWidth: 200, minHeight: 56 }}>
                        {emp.empresa}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    onClick={() => router.push('/panel/Rutas/recepcion/recepcion')}
                    className={`py-3 px-6 rounded-xl font-bold text-lg transition border ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700' : 'bg-gray-200 border-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                    Menu principal
                  </button>
                </div>
              </section>
            )}

            {paso === 2 && (
              <section>
                <h3 className={`mb-3 text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                  Selecciona el agricultor de <span className="text-orange-500">{nombreEmpresa}</span>
                </h3>
                <p className={`${darkMode ? 'text-orange-200/80' : 'text-gray-500'} mb-5`}>Puedes continuar sin agricultor si la empresa aun no tiene asociados.</p>
                <div className="flex flex-wrap gap-6 justify-center mb-6">
                  {agricultores.length === 0 ? (
                    <div className={`${darkMode ? 'text-orange-200' : 'text-gray-600'}`}>Esta empresa no tiene agricultores registrados.</div>
                  ) : (
                    agricultores.map(agr => (
                      <button
                        key={agr.id}
                        onClick={() => handleAgricultor(String(agr.id))}
                        className={`rounded-xl px-8 py-5 font-semibold border shadow-sm transition ${darkMode ? 'bg-[#222] border-orange-700 text-orange-300 hover:bg-orange-950' : 'bg-white border-orange-200 text-gray-900 hover:bg-orange-50'}`}
                        style={{ minWidth: 220, minHeight: 56 }}>
                        {agr.nombre} <span className="text-xs opacity-70 ml-2">({agr.clave})</span>
                      </button>
                    ))
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <button onClick={anterior} className="text-orange-400 text-lg font-semibold underline">Volver</button>
                  <button
                    onClick={omitirAgricultor}
                    className={`font-bold py-3 px-6 rounded-xl shadow transition border text-sm ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-100 border-gray-700' : 'bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-200'}`}>
                    Continuar sin agricultor
                  </button>
                </div>
              </section>
            )}

            {paso === 3 && (
              <section>
                <h3 className={`mb-5 text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>Selecciona el tipo de fruta</h3>
                <div className="flex flex-wrap gap-6 justify-center mb-6">
                  {tiposFruta.map(fruta => (
                    <button
                      key={fruta.id}
                      onClick={() => { actualizarForm('tipo_fruta_id', String(fruta.id)); siguiente() }}
                      className={`rounded-xl px-8 py-5 font-semibold border shadow-sm transition ${darkMode ? 'bg-[#222] border-orange-700 text-orange-300 hover:bg-orange-950' : 'bg-white border-orange-200 text-gray-900 hover:bg-orange-50'}`}
                      style={{ minWidth: 200, minHeight: 56 }}>
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

            {paso === 4 && (
              <section>
                <h3 className={`mb-5 text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>Cantidad de cajas</h3>
                <input
                  autoFocus
                  type="number"
                  value={form.cantidad_cajas}
                  onChange={e => actualizarForm('cantidad_cajas', e.target.value)}
                  className={`w-full p-5 rounded-xl text-center text-2xl mb-6 transition ${darkMode ? 'bg-[#23272f] border border-orange-700 text-orange-100 focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 border border-orange-200 text-gray-900 focus:ring-2 focus:ring-orange-400'}`}
                  required
                  min={1}
                />
                <div className="flex justify-between">
                  <button onClick={anterior} className="text-orange-400 text-lg font-semibold underline">Volver</button>
                  <button
                    onClick={siguiente}
                    className={`font-bold py-3 px-8 rounded-xl shadow transition border text-lg ${darkMode ? 'bg-orange-600 hover:bg-orange-700 text-white border-orange-700' : 'bg-orange-500 hover:bg-orange-600 text-white border-orange-200'}`}>
                    Siguiente
                  </button>
                </div>
              </section>
            )}

            {paso === 5 && (
              <section>
                <h3 className={`mb-5 text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>Selecciona el tipo de empaque</h3>
                <div className="flex flex-wrap gap-6 justify-center mb-6">
                  {empaques.map(emp => (
                    <button
                      key={emp.id}
                      onClick={() => { actualizarForm('empaque_id', String(emp.id)); actualizarForm('peso_caja_oz', emp.tamanio); siguiente() }}
                      className={`rounded-xl px-8 py-5 font-semibold border shadow-sm transition ${darkMode ? 'bg-[#222] border-orange-700 text-orange-300 hover:bg-orange-950' : 'bg-white border-orange-200 text-gray-900 hover:bg-orange-50'}`}
                      style={{ minWidth: 170, minHeight: 56 }}>
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

            {paso === 6 && (
              <section className="space-y-4">
                <input placeholder="Sector" value={form.sector} onChange={e => actualizarForm('sector', e.target.value)} className="w-full p-3 rounded-xl" />
                <input placeholder="Marca" value={form.marca} onChange={e => actualizarForm('marca', e.target.value)} className="w-full p-3 rounded-xl" />
                <input placeholder="Destino" value={form.destino} onChange={e => actualizarForm('destino', e.target.value)} className="w-full p-3 rounded-xl" />
                <input placeholder="Variedad" value={form.variedad} onChange={e => actualizarForm('variedad', e.target.value)} className="w-full p-3 rounded-xl" />
                <select value={form.tipo_produccion} onChange={e => actualizarForm('tipo_produccion', e.target.value)} className="w-full p-3 rounded-xl">
                  <option value="convencional">Convencional</option>
                  <option value="organica">Organica</option>
                </select>
                <textarea placeholder="Notas (opcional)" value={form.notas} onChange={e => actualizarForm('notas', e.target.value)} className="w-full p-3 rounded-xl" />
                <div className="flex justify-between">
                  <button onClick={anterior} className="text-orange-400 text-lg font-semibold underline">Volver</button>
                  <button
                    onClick={siguiente}
                    className={`font-bold py-3 px-8 rounded-xl shadow transition border text-lg ${darkMode ? 'bg-orange-600 hover:bg-orange-700 text-white border-orange-700' : 'bg-orange-500 hover:bg-orange-600 text-white border-orange-200'}`}>
                    Siguiente
                  </button>
                </div>
              </section>
            )}

            {paso === 7 && (
              <section className="space-y-4">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Resumen</h3>
                <p><b>Empresa:</b> {nombreEmpresa}</p>
                <p><b>Agricultor:</b> {agricultorID ? nombreAgricultor : '—'}</p>
                <p><b>Fruta:</b> {nombreFruta}</p>
                <p><b>Cajas:</b> {form.cantidad_cajas}</p>
                <p><b>Peso por caja (oz):</b> {form.peso_caja_oz}</p>
                <p><b>Empaque:</b> {nombreEmpaque}</p>
                <p><b>Sector:</b> {form.sector}</p>
                <p><b>Marca:</b> {form.marca}</p>
                <p><b>Destino:</b> {form.destino}</p>
                <p><b>Variedad:</b> {form.variedad}</p>
                <p><b>Produccion:</b> {form.tipo_produccion}</p>
                <p><b>Notas:</b> {form.notas || '—'}</p>
                <div className="flex justify-between">
                  <button onClick={anterior} className="text-orange-400 text-lg font-semibold underline">Volver</button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    aria-busy={submitting}
                    className={`font-bold px-6 py-3 rounded-xl transition border
                      ${submitting
                        ? 'opacity-60 pointer-events-none ' + (darkMode ? 'bg-gray-700 border-gray-700 text-gray-200' : 'bg-gray-300 border-gray-300 text-gray-600')
                        : (darkMode ? 'bg-green-600 hover:bg-green-700 text-white border-green-700' : 'bg-green-600 hover:bg-green-700 text-white border-green-600')}`}>
                    {submitting ? 'Guardando…' : 'Finalizar nota'}
                  </button>
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

      <footer className={`w-full text-center py-6 border-t text-lg mt-auto ${darkMode ? 'bg-[#151515] border-orange-950 text-orange-200' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
        © {new Date().getFullYear()} El Molinito
      </footer>
    </div>
  )
}

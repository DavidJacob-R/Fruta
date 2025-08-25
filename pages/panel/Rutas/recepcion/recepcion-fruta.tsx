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
  const [paso, setPaso] = useState<1|2|3|4|5|6|7>(1)
  const [mensaje, setMensaje] = useState('')
  const [empresaID, setEmpresaID] = useState('')
  const [agricultorID, setAgricultorID] = useState<string>('')
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

  // Carga inicial
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

        // Empresas (robusto a alias)
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

  const siguiente = () => setPaso(p => Math.min(7, p + 1) as 1|2|3|4|5|6|7)
  const anterior = () => setPaso(p => Math.max(1, p - 1) as 1|2|3|4|5|6|7)
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

  async function handleSubmit() {
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
  const tituloEmpresa = nombreEmpresa ? `Registro de recepción – ${nombreEmpresa}` : 'Registro de recepción – Empresa'

  const totalPasos = 7
  const progreso = Math.round((paso / totalPasos) * 100)

  return (
    <div className="min-h-screen flex flex-col bg-[#181818] text-white">
      {/* Top bar (compacto y pegajoso en móvil) */}
      <header className="sticky top-0 z-30 bg-[#181818]/95 backdrop-blur border-b border-orange-900/40">
        <div className="max-w-3xl md:max-w-5xl mx-auto px-3 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => router.push('/panel/Rutas/recepcion/recepcion')}
              className="px-3 py-2 rounded-xl border border-orange-900/50 bg-[#1f1f1f] text-orange-200 hover:bg-[#232323] active:scale-[0.98]"
            >
              ← Menú
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1f1f1f] border border-orange-900/50 flex items-center justify-center shadow">
                <span className="text-2xl">🍊</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold leading-tight">El Molinito</div>
                <div className="text-xs text-orange-200/80 -mt-0.5">Recepción</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-orange-200/70">Nota</span>
              <span className="text-sm sm:text-base font-mono rounded-lg px-3 py-1 border bg-[#141414] border-orange-900/50 text-orange-300">
                {siguienteNumero ?? '…'}
              </span>
            </div>
          </div>

          {/* Barra de progreso del flujo */}
          <div className="mt-3 h-1.5 w-full bg-[#272727] rounded-full overflow-hidden">
            <div className="h-1.5 bg-orange-500 transition-all" style={{ width: `${progreso}%` }} />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center pb-28 sm:pb-10">
        <div className="w-full max-w-3xl md:max-w-5xl px-3 sm:px-6">
          {/* Encabezado grande de la tarjeta */}
          <div className="rounded-2xl sm:rounded-3xl border border-orange-900/50 bg-[#23272f] shadow-2xl mt-4 sm:mt-6 overflow-hidden">
            <div className="px-4 sm:px-8 py-6 border-b border-orange-900/30">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-3xl sm:text-4xl">📦</span>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-orange-300 truncate">{tituloEmpresa}</h2>
                  <p className="text-xs sm:text-sm text-orange-200/70 mt-0.5">Flujo paso {paso} de {totalPasos}</p>
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-8 py-6 space-y-6">
              {paso === 1 && (
                <section>
                  <h3 className="mb-3 text-lg sm:text-xl font-bold text-white">Selecciona la empresa</h3>
                  {cargandoEmpresas ? (
                    <div className="text-orange-200 text-center py-8">Cargando empresas…</div>
                  ) : empresas.length === 0 ? (
                    <div className="text-orange-200 text-center py-8">
                      No hay empresas disponibles. Verifica el endpoint <code className="text-orange-300">/api/recepcion/datos</code>.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {empresas.map(emp => (
                        <button
                          key={emp.id}
                          onClick={() => handleEmpresa(String(emp.id))}
                          className="w-full rounded-xl px-4 py-4 sm:px-6 sm:py-5 text-left font-semibold border border-orange-900/40 bg-[#202329] text-orange-200 hover:bg-orange-950/30 active:scale-[0.99]"
                        >
                          {emp.empresa}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => router.push('/panel/empleado')}
                      className="py-3 px-6 rounded-xl font-bold text-base border border-orange-900/40 bg-[#1d1d1d] text-orange-100 hover:bg-[#242424] active:scale-[0.99]"
                    >
                      Ir al panel
                    </button>
                  </div>
                </section>
              )}

              {paso === 2 && (
                <section>
                  <h3 className="mb-1 text-lg sm:text-xl font-bold text-white">
                    Agricultor de <span className="text-orange-400">{nombreEmpresa}</span>
                  </h3>
                  <p className="text-sm text-orange-200/80 mb-4">Puedes continuar sin agricultor.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {agricultores.length === 0 ? (
                      <div className="rounded-xl border border-orange-900/40 bg-[#1f1f1f] text-orange-200 p-4">
                        Esta empresa no tiene agricultores registrados.
                      </div>
                    ) : (
                      agricultores.map(agr => (
                        <button
                          key={agr.id}
                          onClick={() => handleAgricultor(String(agr.id))}
                          className="w-full rounded-xl px-4 py-4 sm:px-6 sm:py-5 text-left font-semibold border border-orange-900/40 bg-[#202329] text-orange-200 hover:bg-orange-950/30 active:scale-[0.99]"
                        >
                          {agr.nombre} <span className="text-xs opacity-70">({agr.clave})</span>
                        </button>
                      ))
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <button onClick={anterior} className="text-orange-300 font-semibold underline">Volver</button>
                    <button
                      onClick={omitirAgricultor}
                      className="px-4 py-2 rounded-xl border border-orange-900/40 bg-[#1f1f1f] text-orange-100 hover:bg-[#242424]"
                    >
                      Continuar sin agricultor
                    </button>
                  </div>
                </section>
              )}

              {paso === 3 && (
                <section>
                  <h3 className="mb-3 text-lg sm:text-xl font-bold text-white">Selecciona el tipo de fruta</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {tiposFruta.map(fruta => (
                      <button
                        key={fruta.id}
                        onClick={() => { actualizarForm('tipo_fruta_id', String(fruta.id)); siguiente() }}
                        className="w-full rounded-xl px-3 py-4 sm:px-5 sm:py-5 text-center font-semibold border border-orange-900/40 bg-[#202329] text-orange-200 hover:bg-orange-950/30 active:scale-[0.99]"
                      >
                        {fruta.nombre}
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 flex justify-between">
                    <button onClick={anterior} className="text-orange-300 font-semibold underline">Volver</button>
                    <div />
                  </div>
                </section>
              )}

              {paso === 4 && (
                <section>
                  <h3 className="mb-3 text-lg sm:text-xl font-bold text-white">Cantidad de cajas</h3>
                  <input
                    autoFocus
                    inputMode="numeric"
                    type="number"
                    value={form.cantidad_cajas}
                    onChange={e => actualizarForm('cantidad_cajas', e.target.value)}
                    className="w-full p-4 sm:p-5 rounded-xl text-center text-2xl border border-orange-900/40 bg-[#1c1f25] text-orange-100 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Ej. 240"
                    required
                    min={1}
                  />
                  <div className="mt-5 flex justify-between">
                    <button onClick={anterior} className="text-orange-300 font-semibold underline">Volver</button>
                    <button
                      onClick={siguiente}
                      disabled={!form.cantidad_cajas}
                      className={`px-5 py-3 rounded-xl font-semibold ${!form.cantidad_cajas ? 'bg-[#2a2a2a] text-orange-300/50 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 text-white'}`}
                    >
                      Siguiente
                    </button>
                  </div>
                </section>
              )}

              {paso === 5 && (
                <section>
                  <h3 className="mb-3 text-lg sm:text-xl font-bold text-white">Tipo de empaque</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {empaques.map(emp => (
                      <button
                        key={emp.id}
                        onClick={() => { actualizarForm('empaque_id', String(emp.id)); actualizarForm('peso_caja_oz', emp.tamanio); siguiente() }}
                        className="w-full rounded-xl px-3 py-4 sm:px-5 sm:py-5 text-center font-semibold border border-orange-900/40 bg-[#202329] text-orange-200 hover:bg-orange-950/30 active:scale-[0.99]"
                      >
                        {emp.tamanio}
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 flex justify-between">
                    <button onClick={anterior} className="text-orange-300 font-semibold underline">Volver</button>
                    <div />
                  </div>
                </section>
              )}

              {paso === 6 && (
                <section className="space-y-3">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Datos adicionales</h3>
                  <input placeholder="Sector" value={form.sector} onChange={e => actualizarForm('sector', e.target.value)} className="w-full p-3 rounded-xl border border-orange-900/40 bg-[#1c1f25] text-orange-100 outline-none" />
                  <input placeholder="Marca" value={form.marca} onChange={e => actualizarForm('marca', e.target.value)} className="w-full p-3 rounded-xl border border-orange-900/40 bg-[#1c1f25] text-orange-100 outline-none" />
                  <input placeholder="Destino" value={form.destino} onChange={e => actualizarForm('destino', e.target.value)} className="w-full p-3 rounded-xl border border-orange-900/40 bg-[#1c1f25] text-orange-100 outline-none" />
                  <input placeholder="Variedad" value={form.variedad} onChange={e => actualizarForm('variedad', e.target.value)} className="w-full p-3 rounded-xl border border-orange-900/40 bg-[#1c1f25] text-orange-100 outline-none" />
                  <select value={form.tipo_produccion} onChange={e => actualizarForm('tipo_produccion', e.target.value)} className="w-full p-3 rounded-xl border border-orange-900/40 bg-[#1c1f25] text-orange-100 outline-none">
                    <option value="convencional">Convencional</option>
                    <option value="organica">Orgánica</option>
                  </select>
                  <textarea placeholder="Notas (opcional)" value={form.notas} onChange={e => actualizarForm('notas', e.target.value)} className="w-full p-3 rounded-xl border border-orange-900/40 bg-[#1c1f25] text-orange-100 outline-none" />
                  <div className="mt-3 flex justify-between">
                    <button onClick={anterior} className="text-orange-300 font-semibold underline">Volver</button>
                    <button onClick={siguiente} className="px-5 py-3 rounded-xl font-semibold bg-orange-600 hover:bg-orange-700 text-white">Siguiente</button>
                  </div>
                </section>
              )}

              {paso === 7 && (
                <section className="space-y-3">
                  <h3 className="text-lg sm:text-xl font-bold text-white">Resumen</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border border-orange-900/40 bg-[#1f1f1f] p-3">
                      <div className="text-orange-200/70 text-xs">Empresa</div>
                      <div className="text-orange-100">{nombreEmpresa}</div>
                    </div>
                    <div className="rounded-xl border border-orange-900/40 bg-[#1f1f1f] p-3">
                      <div className="text-orange-200/70 text-xs">Agricultor</div>
                      <div className="text-orange-100">{agricultorID ? nombreAgricultor : '—'}</div>
                    </div>
                    <div className="rounded-xl border border-orange-900/40 bg-[#1f1f1f] p-3">
                      <div className="text-orange-200/70 text-xs">Fruta</div>
                      <div className="text-orange-100">{nombreFruta}</div>
                    </div>
                    <div className="rounded-xl border border-orange-900/40 bg-[#1f1f1f] p-3">
                      <div className="text-orange-200/70 text-xs">Cajas</div>
                      <div className="text-orange-100">{form.cantidad_cajas}</div>
                    </div>
                    <div className="rounded-xl border border-orange-900/40 bg-[#1f1f1f] p-3">
                      <div className="text-orange-200/70 text-xs">Peso por caja (oz)</div>
                      <div className="text-orange-100">{form.peso_caja_oz}</div>
                    </div>
                    <div className="rounded-xl border border-orange-900/40 bg-[#1f1f1f] p-3">
                      <div className="text-orange-200/70 text-xs">Empaque</div>
                      <div className="text-orange-100">{nombreEmpaque}</div>
                    </div>
                    <div className="rounded-xl border border-orange-900/40 bg-[#1f1f1f] p-3 sm:col-span-2">
                      <div className="text-orange-200/70 text-xs">Sector / Marca / Destino</div>
                      <div className="text-orange-100">{[form.sector, form.marca, form.destino].filter(Boolean).join(' • ') || '—'}</div>
                    </div>
                    <div className="rounded-xl border border-orange-900/40 bg-[#1f1f1f] p-3">
                      <div className="text-orange-200/70 text-xs">Variedad</div>
                      <div className="text-orange-100">{form.variedad || '—'}</div>
                    </div>
                    <div className="rounded-xl border border-orange-900/40 bg-[#1f1f1f] p-3">
                      <div className="text-orange-200/70 text-xs">Producción</div>
                      <div className="text-orange-100 capitalize">{form.tipo_produccion}</div>
                    </div>
                    <div className="rounded-xl border border-orange-900/40 bg-[#1f1f1f] p-3 sm:col-span-2">
                      <div className="text-orange-200/70 text-xs">Notas</div>
                      <div className="text-orange-100">{form.notas || '—'}</div>
                    </div>
                  </div>

                  <div className="mt-2 flex justify-between">
                    <button onClick={anterior} className="text-orange-300 font-semibold underline">Volver</button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      aria-busy={submitting}
                      className={`px-6 py-3 rounded-xl font-semibold border ${submitting
                        ? 'bg-[#2a2a2a] border-[#2a2a2a] text-orange-300/60 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white border-green-700'}`}
                    >
                      {submitting ? 'Guardando…' : 'Finalizar nota'}
                    </button>
                  </div>
                </section>
              )}

              {mensaje && (
                <div className="text-center pt-2">
                  <p className={`font-semibold ${mensaje.includes('correctamente') ? 'text-green-500' : 'text-red-500'}`}>{mensaje}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Espaciador para que no tape el contenido la action bar móvil */}
        <div className="h-24 sm:h-0" />
      </main>

      {/* Action bar fijo para móvil (mejora usabilidad con una mano) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#141414]/95 backdrop-blur border-t border-orange-900/40 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-3xl mx-auto px-3 py-3 flex items-center justify-between gap-3">
          <button
            onClick={anterior}
            disabled={paso === 1}
            className={`px-4 py-3 rounded-xl font-semibold border ${paso === 1 ? 'text-orange-300/50 border-orange-900/30 bg-[#1c1c1c]' : 'text-orange-100 border-orange-900/50 bg-[#1f1f1f] active:scale-[0.98]'}`}
          >
            ← Volver
          </button>

          <div className="text-xs text-orange-300/80">{paso}/{totalPasos}</div>

          {paso < 7 ? (
            <button
              onClick={siguiente}
              className="px-5 py-3 rounded-xl font-semibold bg-orange-600 hover:bg-orange-700 text-white active:scale-[0.98]"
            >
              Siguiente →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-5 py-3 rounded-xl font-semibold ${submitting ? 'bg-[#2a2a2a] text-orange-300/60 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'} active:scale-[0.98]`}
            >
              {submitting ? 'Guardando…' : 'Finalizar'}
            </button>
          )}
        </div>
      </div>

      <footer className="w-full text-center py-6 border-t border-orange-950 text-orange-200 bg-[#151515]">
        © {new Date().getFullYear()} El Molinito
      </footer>
    </div>
  )
}

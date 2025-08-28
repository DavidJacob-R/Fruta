import { useEffect, useMemo, useState } from "react"
import { FiSend, FiPrinter, FiHome, FiXCircle, FiRefreshCw, FiFilter, FiSearch, FiFileText, FiMail } from "react-icons/fi"
import { useRouter } from "next/router"
import { useUi } from "@/components/ui-context"

type Nota = any

export default function NotasAdmin() {
  const router = useRouter()
  const { darkMode } = useUi()

  const [vista, setVista] = useState<"resumen" | "listado">("listado")

  const [notas, setNotas] = useState<Nota[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalNota, setModalNota] = useState<any | null>(null)
  const [emailReenvio, setEmailReenvio] = useState("")
  const [mensaje, setMensaje] = useState("")

  const [filtroFechaInicio, setFiltroFechaInicio] = useState("")
  const [filtroFechaFin, setFiltroFechaFin] = useState("")
  const [filtroNombre, setFiltroNombre] = useState("")
  const [filtroNumeroNota, setFiltroNumeroNota] = useState("")
  const [temporadas, setTemporadas] = useState<any[]>([])
  const [filtroTemporadaId, setFiltroTemporadaId] = useState<string>("")

  const bgDay = "bg-[#f6f4f2]"
  const cardDay = "bg-[#f8f7f5] border border-orange-200"
  const textDay = "text-[#1a1a1a]"
  const bgNight = "bg-[#161616]"
  const cardNight = "bg-[#232323] border border-[#353535]"
  const textNight = "text-white"
  const softShadow = "shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]"

  const s10 = (v: any) => (v ? String(v).slice(0, 10) : "")
  const between = (d: string, from: string, to: string) => !!d && !!from && !!to && d >= from && d <= to

  async function recargarNotas() {
    setCargando(true)
    try {
      const res = await fetch("/api/notas/listar")
      const data = await res.json()
      setNotas(Array.isArray(data.notas) ? data.notas : [])
    } finally {
      setCargando(false)
    }
  }

  async function cargarTemporadas() {
    try {
      const r = await fetch("/api/temporadas/listar")
      const d = await r.json()
      const rows = Array.isArray(d?.temporadas) ? d.temporadas : []
      rows.sort((a: any, b: any) => {
        if (a.activa && !b.activa) return -1
        if (!a.activa && b.activa) return 1
        return String(b.fecha_inicio).localeCompare(String(a.fecha_inicio))
      })
      setTemporadas(rows)
    } catch {
      setTemporadas([])
    }
  }

  useEffect(() => {
    recargarNotas()
    cargarTemporadas()
  }, [])

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (url.includes("/panel/administradorRutas/notas")) {
        recargarNotas()
        cargarTemporadas()
      }
    }
    router.events.on("routeChangeComplete", handleRouteChange)
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange)
    }
  }, [router])
const handleImprimir = (nota: any) => {
  const numero = Number(nota?.numero_nota)
  if (!Number.isFinite(numero)) { alert('nota sin numero_nota valido'); return }
  const w = window.open(`/api/notas/abrir/${numero}`, '_blank')
  if (!w) alert('no se pudo abrir la ventana')
}



  async function handleReenviar(notaId: number) {
    if (!emailReenvio) {
      setMensaje("Introduce un email de destino")
      return
    }
    setMensaje("Enviando...")
    try {
      const res = await fetch("/api/notas/reenviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notaId, email: emailReenvio })
      })
      const data = await res.json()
      setMensaje(data.success ? "Correo enviado correctamente" : "Error al enviar correo")
    } catch {
      setMensaje("Error al enviar correo")
    }
  }

  const notasFiltradas = useMemo(() => {
    return notas.filter((n) => {
      const fecha = n.fecha_recepcion ? s10(n.fecha_recepcion) : ""
      let pasaFecha = true
      if (filtroFechaInicio && fecha < filtroFechaInicio) pasaFecha = false
      if (filtroFechaFin && fecha > filtroFechaFin) pasaFecha = false

      let pasaNombre = true
      if (filtroNombre.trim() !== "") {
        const buscar = filtroNombre.toLowerCase()
        pasaNombre =
          (n.empresa_nombre && n.empresa_nombre.toLowerCase().includes(buscar)) ||
          (n.agricultor_nombre && n.agricultor_nombre.toLowerCase().includes(buscar)) ||
          (n.agricultor_apellido && n.agricultor_apellido.toLowerCase().includes(buscar))
      }

      let pasaNumero = true
      if (filtroNumeroNota.trim() !== "") {
        pasaNumero = n.numero_nota?.toString().includes(filtroNumeroNota)
      }

      let pasaTemporada = true
      if (filtroTemporadaId) {
        const selId = parseInt(filtroTemporadaId, 10)
        const tSel = temporadas.find((t: any) => Number(t.id) === selId)
        if (n.temporada_id != null) {
          pasaTemporada = Number(n.temporada_id) === selId
        } else if (tSel) {
          const fechaRef =
            s10(n.fecha_recepcion) ||
            s10(n.fecha_control) ||
            s10(n.creado_en) ||
            s10(n.fecha) ||
            ""
          const fi = s10(tSel.fecha_inicio)
          const ff = s10(tSel.fecha_fin)
          pasaTemporada = between(fechaRef, fi, ff)
        } else {
          pasaTemporada = true
        }
      }

      return pasaFecha && pasaNombre && pasaNumero && pasaTemporada
    })
  }, [notas, filtroFechaInicio, filtroFechaFin, filtroNombre, filtroNumeroNota, filtroTemporadaId, temporadas])

  const stats = useMemo(() => {
    const total = notas.length
    const conRecep = notas.filter((n: any) => !!n.nota_recepcion_id).length
    const conCalidad = notas.filter((n: any) => !!n.nota_calidad_id).length
    const hoy = new Date().toISOString().slice(0, 10)
    const deHoy = notas.filter((n: any) => s10(n.fecha_recepcion) === hoy).length
    return { total, conRecep, conCalidad, deHoy }
  }, [notas])

  function limpiarFiltros() {
    setFiltroFechaInicio("")
    setFiltroFechaFin("")
    setFiltroNombre("")
    setFiltroNumeroNota("")
    setFiltroTemporadaId("")
  }

  const textMain = darkMode ? "text-orange-200" : "text-orange-700"
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-500"

  const tableCard = darkMode ? "bg-[#232323] border border-[#353535]" : "bg-white border border-orange-200"
  const thBg = darkMode ? "bg-[#2a2a2a] text-orange-200 border-[#353535]" : "bg-orange-50 text-orange-700 border-orange-200"
  const rowEven = darkMode ? "bg-[#1c1c1c]" : "bg-orange-50"
  const rowOdd = darkMode ? "bg-[#262626]" : "bg-white"

  const btnBase = "rounded-xl px-4 py-1 font-semibold shadow-sm border transition-colors"
  const btnRecep = darkMode ? "bg-yellow-900 border-yellow-800 text-yellow-100 hover:bg-yellow-800" : "bg-yellow-100 border-yellow-300 text-yellow-700 hover:bg-yellow-200"
  const btnCalid = darkMode ? "bg-green-900 border-green-800 text-green-100 hover:bg-green-800" : "bg-green-100 border-green-300 text-green-700 hover:bg-green-200"
  const btnPrint = darkMode ? "bg-orange-900 border-orange-800 text-orange-100 hover:bg-orange-800" : "bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200"
  const btnSend = darkMode ? "bg-green-900 border-green-800 text-green-100 hover:bg-green-800" : "bg-green-100 border-green-300 text-green-700 hover:bg-green-200"

  return (
    <div className={`${darkMode ? bgNight : bgDay} min-h-screen ${darkMode ? textNight : textDay} transition-colors duration-300`}>
      <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-b-2xl p-6 text-white shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Notas</h1>
            <p className="text-orange-100">
              {vista === "resumen" ? "Resumen y métricas de notas" : "Listado, filtros y acciones"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition flex items-center gap-2"
              onClick={() => router.push("/panel/administrador")}
              title="Ir al menú principal"
            >
              <FiHome />
              <span className="hidden sm:inline">Menú</span>
            </button>
            <button
              className="px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition flex items-center gap-2"
              onClick={recargarNotas}
              title="Recargar"
            >
              <FiRefreshCw className="animate-spin-slow" />
              <span className="hidden sm:inline">Recargar</span>
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setVista("resumen")}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
            vista === "resumen" ? "bg-orange-500 text-white" : darkMode ? "bg-[#353535] hover:bg-[#404040]" : "bg-orange-100 hover:bg-orange-200"
          }`}
        >
          📊 Resumen
        </button>
        <button
          onClick={() => setVista("listado")}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
            vista === "listado" ? "bg-blue-500 text-white" : darkMode ? "bg-[#353535] hover:bg-[#404040]" : "bg-orange-100 hover:bg-orange-200"
          }`}
        >
          <span className="inline-flex items-center gap-2"><FiFileText /> Listado</span>
        </button>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {vista === "resumen" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`rounded-2xl p-5 ${darkMode ? cardNight : cardDay} ${softShadow}`}>
              <div className="text-sm opacity-70 mb-1">Total</div>
              <div className="text-3xl font-bold">{stats.total}</div>
            </div>
            <div className={`rounded-2xl p-5 ${darkMode ? cardNight : cardDay} ${softShadow}`}>
              <div className="text-sm opacity-70 mb-1">Con recepción</div>
              <div className="text-3xl font-bold text-amber-500">{stats.conRecep}</div>
            </div>
            <div className={`rounded-2xl p-5 ${darkMode ? cardNight : cardDay} ${softShadow}`}>
              <div className="text-sm opacity-70 mb-1">Con calidad</div>
              <div className="text-3xl font-bold text-green-500">{stats.conCalidad}</div>
            </div>
            <div className={`rounded-2xl p-5 ${darkMode ? cardNight : cardDay} ${softShadow}`}>
              <div className="text-sm opacity-70 mb-1">De hoy</div>
              <div className="text-3xl font-bold text-blue-500">{stats.deHoy}</div>
            </div>

            <div className={`md:col-span-4 rounded-2xl p-6 ${darkMode ? cardNight : cardDay} ${softShadow}`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiFilter /> Filtros rápidos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <button onClick={() => { limpiarFiltros(); setVista("listado") }} className={`${darkMode ? "bg-[#1f1f1f] border border-[#353535] text-white hover:bg-[#2a2a2a]" : "bg-white border border-orange-200 hover:bg-orange-50"} rounded-xl px-4 py-3 flex items-center gap-2`}>
                  <FiXCircle /> Limpiar filtros
                </button>
                <button onClick={() => { const hoy = new Date().toISOString().slice(0,10); setFiltroFechaInicio(hoy); setFiltroFechaFin(hoy); setVista("listado") }} className={`${darkMode ? "bg-[#1f1f1f] border border-[#353535] text-white hover:bg-[#2a2a2a]" : "bg-white border border-orange-200 hover:bg-orange-50"} rounded-xl px-4 py-3`}>
                  Notas de hoy
                </button>
                <button onClick={() => { setFiltroNombre(" "); setVista("listado") }} className={`${darkMode ? "bg-[#1f1f1f] border border-[#353535] text-white hover:bg-[#2a2a2a]" : "bg-white border border-orange-200 hover:bg-orange-50"} rounded-xl px-4 py-3`}>
                  Buscar por nombre
                </button>
                <button onClick={() => { if (temporadas[0]) setFiltroTemporadaId(String(temporadas[0].id)); setVista("listado") }} className={`${darkMode ? "bg-[#1f1f1f] border border-[#353535] text-white hover:bg-[#2a2a2a]" : "bg-white border border-orange-200 hover:bg-orange-50"} rounded-xl px-4 py-3`}>
                  Filtrar por temporada activa
                </button>
              </div>
            </div>
          </div>
        )}

        {vista === "listado" && (
          <>
            <div className={`rounded-2xl p-4 border ${darkMode ? "bg-[#1e1914] border-orange-900" : "bg-orange-50 border-orange-200"} ${softShadow}`}>
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className={`block text-sm mb-1 font-semibold ${textMain}`}>Desde:</label>
                  <input
                    type="date"
                    className={`rounded-xl border px-3 py-1 text-sm ${darkMode ? "bg-slate-900 border-slate-700 text-orange-100" : "border-orange-200 text-orange-700 bg-white"}`}
                    value={filtroFechaInicio}
                    onChange={(e) => setFiltroFechaInicio(e.target.value)}
                  />
                </div>
                <div>
                  <label className={`block text-sm mb-1 font-semibold ${textMain}`}>Hasta:</label>
                  <input
                    type="date"
                    className={`rounded-xl border px-3 py-1 text-sm ${darkMode ? "bg-slate-900 border-slate-700 text-orange-100" : "border-orange-200 text-orange-700 bg-white"}`}
                    value={filtroFechaFin}
                    onChange={(e) => setFiltroFechaFin(e.target.value)}
                  />
                </div>
                <div>
                  <label className={`block text-sm mb-1 font-semibold ${textMain}`}>Empresa o Agricultor:</label>
                  <div className={`flex items-center gap-2 rounded-xl border px-3 py-1 text-sm ${darkMode ? "bg-slate-900 border-slate-700 text-orange-100" : "border-orange-200 text-orange-700 bg-white"}`}>
                    <FiSearch className="opacity-70" />
                    <input
                      type="text"
                      placeholder="Nombre..."
                      className="bg-transparent outline-none w-52"
                      value={filtroNombre}
                      onChange={(e) => setFiltroNombre(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm mb-1 font-semibold ${textMain}`}># Nota:</label>
                  <input
                    type="text"
                    placeholder="No. nota..."
                    className={`rounded-xl border px-3 py-1 text-sm ${darkMode ? "bg-slate-900 border-slate-700 text-orange-100" : "border-orange-200 text-orange-700 bg-white"}`}
                    value={filtroNumeroNota}
                    onChange={(e) => setFiltroNumeroNota(e.target.value)}
                  />
                </div>

                <div>
                  <label className={`block text-sm mb-1 font-semibold ${textMain}`}>Temporada:</label>
                  <select
                    className={`rounded-xl border px-3 py-1 text-sm min-w-[220px] ${darkMode ? "bg-slate-900 border-slate-700 text-orange-100" : "border-orange-200 text-orange-700 bg-white"}`}
                    value={filtroTemporadaId}
                    onChange={(e) => setFiltroTemporadaId(e.target.value)}
                  >
                    <option value="">Todas</option>
                    {temporadas.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.titulo || t.nombre} — {s10(t.fecha_inicio)} a {s10(t.fecha_fin)} {t.activa ? " (activa)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 items-center">
                  <button
                    className={`rounded-xl px-4 py-1 flex items-center gap-2 font-semibold border ${
                      darkMode ? "bg-orange-900 border-orange-800 text-orange-100 hover:bg-orange-800" : "bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200"
                    }`}
                    onClick={limpiarFiltros}
                    title="Limpiar filtros"
                  >
                    <FiXCircle className="text-lg" />
                    Limpiar
                  </button>
                  <button
                    className={`rounded-xl px-4 py-1 flex items-center gap-2 font-semibold border ${
                      darkMode ? "bg-[#232323] border-[#353535] text-white hover:bg-[#2a2a2a]" : "bg-white border-orange-300 text-[#1a1a1a] hover:bg-orange-50"
                    }`}
                    onClick={recargarNotas}
                    title="Recargar"
                  >
                    <FiRefreshCw />
                    Recargar
                  </button>
                </div>
              </div>
            </div>

            <div className={`rounded-3xl ${tableCard} shadow-2xl overflow-x-auto p-6 transition-colors`}>
              {cargando ? (
                <div className="flex justify-center items-center py-16">
                  <span className={`text-2xl animate-pulse ${textMain}`}>Cargando notas...</span>
                </div>
              ) : (
                <table className="min-w-full table-auto text-base">
                  <thead>
                    <tr className={`${thBg} border-b-2`}>
                      <th className="p-4 font-bold"># Nota</th>
                      <th className="p-4 font-bold">Empresa/Agricultor</th>
                      <th className="p-4 font-bold">Fruta</th>
                      <th className="p-4 font-bold">Fecha</th>
                      <th className="p-4 font-bold">Usuario/Empleado</th>
                      <th className="p-4 font-bold">Nota Recepción</th>
                      <th className="p-4 font-bold">Nota Calidad</th>
                      <th className="p-4 font-bold">Opciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notasFiltradas.length > 0 ? (
                      notasFiltradas.map((n: any, i: number) => (
                        <tr key={i} className={`${i % 2 === 0 ? rowEven : rowOdd} border-b transition`}>
                          <td className={`p-4 font-bold ${textMain}`}>{n.numero_nota}</td>
                          <td className={`p-4 ${textMain}`}>
                            <div className="font-bold">{n.empresa_nombre || "-"}</div>
                            {(n.empresa_email || n.empresa_telefono) && (
                              <div className={`text-xs ${textSecondary}`}>
                                {n.empresa_email} <br />
                                {n.empresa_telefono}
                              </div>
                            )}
                            {(n.agricultor_nombre || n.agricultor_apellido) && (
                              <div className="mt-2">
                                <div className="font-semibold">
                                  {n.agricultor_nombre} {n.agricultor_apellido}
                                </div>
                                {(n.agricultor_email || n.agricultor_telefono) && (
                                  <div className={`text-xs ${textSecondary}`}>
                                    {n.agricultor_email} <br />
                                    {n.agricultor_telefono}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className={`p-4 ${textMain}`}>
                            {n.frutas && n.frutas.length > 0 ? n.frutas.map((f: any, idx: number) => <div key={idx}>{f.fruta_nombre}</div>) : "-"}
                          </td>
                          <td className={`p-4 ${textMain}`}>{n.fecha_recepcion?.slice(0, 16).replace("T", " ")}</td>
                          <td className={`p-4 ${textMain}`}>
                            {n.usuario_nombre && n.usuario_apellido ? `${n.usuario_nombre} ${n.usuario_apellido}` : "-"}
                            <div className={`text-xs ${textSecondary}`}>{n.usuario_email}</div>
                          </td>
                          <td className={`p-4 ${textMain}`}>
                            {n.nota_recepcion_id ? (
                              <button
                                onClick={async () => {
                                  await router.push(`/panel/administradorRutas/notas/editar-recepcion/${n.nota_recepcion_id}`)
                                  await recargarNotas()
                                }}
                                className={`${btnBase} ${btnRecep} w-full`}
                                title="Editar Nota de Recepción"
                              >
                                Nota recepción
                              </button>
                            ) : (
                              <span className="opacity-60">-</span>
                            )}
                          </td>
                          <td className={`p-4 ${textMain}`}>
                            {n.nota_calidad_id ? (
                              <button
                                onClick={async () => {
                                  await router.push(`/panel/administradorRutas/notas/editar-calidad/${n.nota_calidad_id}`)
                                  await recargarNotas()
                                }}
                                className={`${btnBase} ${btnCalid} w-full`}
                                title="Editar Nota de Calidad"
                              >
                                Nota calidad
                              </button>
                            ) : (
                              <span className="opacity-60">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-2">
                              <button onClick={() => setModalNota(n)} className={`${btnBase} ${btnSend} flex items-center gap-2`} title="Reenviar">
                                <FiSend />
                                Reenviar
                              </button>
                              <button onClick={() => handleImprimir(n)} className={`${btnBase} ${btnPrint} flex items-center gap-2`} title="Imprimir">
                                <FiPrinter />
                                Imprimir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className={`text-center py-20 text-xl font-semibold ${textMain}`}>
                          No hay notas registradas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>

      {modalNota && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className={`max-w-lg w-full rounded-2xl shadow-2xl border p-6 ${darkMode ? "bg-[#232323] border-[#353535]" : "bg-white border-orange-200"}`}>
            <h3 className={`text-2xl font-bold mb-3 ${textMain}`}>Reenviar Nota #{modalNota.numero_nota}</h3>
            <p className={`mb-3 ${textMain}`}>Elige el email destino:</p>

            <div className="flex flex-col gap-2 mb-4">
              {modalNota.empresa_email && (
                <button
                  className={`w-full rounded-lg px-4 py-2 border font-medium text-left transition ${
                    emailReenvio === modalNota.empresa_email
                      ? (darkMode ? "bg-orange-900 text-orange-100 border-orange-600" : "bg-orange-100 text-orange-700 border-orange-400")
                      : (darkMode ? "bg-[#1f1f1f] text-white border-[#353535]" : "bg-white text-[#1a1a1a] border-orange-200")
                  }`}
                  onClick={() => setEmailReenvio(modalNota.empresa_email)}
                >
                  <span className="inline-flex items-center gap-2"><FiMail /> Usar email empresa:</span> <b>{modalNota.empresa_email}</b>
                </button>
              )}
              {modalNota.agricultor_email && (
                <button
                  className={`w-full rounded-lg px-4 py-2 border font-medium text-left transition ${
                    emailReenvio === modalNota.agricultor_email
                      ? (darkMode ? "bg-orange-900 text-orange-100 border-orange-600" : "bg-orange-100 text-orange-700 border-orange-400")
                      : (darkMode ? "bg-[#1f1f1f] text-white border-[#353535]" : "bg-white text-[#1a1a1a] border-orange-200")
                  }`}
                  onClick={() => setEmailReenvio(modalNota.agricultor_email)}
                >
                  <span className="inline-flex items-center gap-2"><FiMail /> Usar email agricultor:</span> <b>{modalNota.agricultor_email}</b>
                </button>
              )}
              <button
                className={`w-full rounded-lg px-4 py-2 border font-medium text-left transition ${
                  emailReenvio && emailReenvio !== modalNota.empresa_email && emailReenvio !== modalNota.agricultor_email
                    ? (darkMode ? "bg-green-900 text-green-100 border-green-600" : "bg-green-100 border-green-800")
                    : (darkMode ? "bg-[#1f1f1f] text-white border-[#353535]" : "bg-white text-[#1a1a1a] border-orange-200")
                }`}
                onClick={() => setEmailReenvio("")}
              >
                ✏️ Usar email personalizado
              </button>
            </div>

            <input
              type="email"
              placeholder="correo@ejemplo.com"
              className={`w-full border rounded-lg px-4 py-2 mb-3 ${darkMode ? "bg-slate-900 border-slate-700 text-orange-100" : "border-orange-200 text-orange-700"}`}
              value={emailReenvio}
              onChange={(e) => setEmailReenvio(e.target.value)}
              autoFocus
            />

            <div className="flex justify-between mt-4">
              <button
                className={`rounded-xl px-6 py-2 font-bold transition ${darkMode ? "bg-[#1f1f1f] text-white border border-[#353535] hover:bg-[#2a2a2a]" : "bg-white text-[#1a1a1a] border border-orange-300 hover:bg-orange-50"}`}
                onClick={() => {
                  setModalNota(null)
                  setMensaje("")
                  setEmailReenvio("")
                }}
              >
                Cancelar
              </button>
              <button
                className={`rounded-xl px-6 py-2 font-bold transition ${darkMode ? "bg-green-800 text-green-100 hover:bg-green-700" : "bg-green-600 text-white hover:bg-green-700"}`}
                onClick={() => handleReenviar(modalNota.id)}
              >
                Reenviar PDF
              </button>
            </div>
            {mensaje && <div className={`mt-3 text-center text-sm font-bold ${textMain}`}>{mensaje}</div>}
          </div>
        </div>
      )}
    </div>
  )
}

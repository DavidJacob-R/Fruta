import { useEffect, useState } from "react"
import { FiSend, FiPrinter, FiHome, FiXCircle } from "react-icons/fi"
import { useRouter } from "next/router"
import { useUi } from "@/components/ui-context"

export default function NotasAdmin() {
  const router = useRouter()
  const { darkMode } = useUi()
  const [notas, setNotas] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalNota, setModalNota] = useState<any | null>(null)
  const [emailReenvio, setEmailReenvio] = useState("")
  const [mensaje, setMensaje] = useState("")

  const [filtroFechaInicio, setFiltroFechaInicio] = useState("")
  const [filtroFechaFin, setFiltroFechaFin] = useState("")
  const [filtroNombre, setFiltroNombre] = useState("")
  const [filtroNumeroNota, setFiltroNumeroNota] = useState("")

  // === NUEVO: temporadas y filtro por temporada ===
  const [temporadas, setTemporadas] = useState<any[]>([])
  const [filtroTemporadaId, setFiltroTemporadaId] = useState<string>("")

  const recargarNotas = async () => {
    setCargando(true)
    const res = await fetch("/api/notas/listar")
    const data = await res.json()
    setNotas(Array.isArray(data.notas) ? data.notas : [])
    setCargando(false)
  }

  const cargarTemporadas = async () => {
    try {
      const r = await fetch("/api/temporadas/listar")
      const d = await r.json()
      const rows = Array.isArray(d?.temporadas) ? d.temporadas : []
      // ordena: activa primero, luego por fecha_inicio desc
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

  const handleImprimir = async (nota: any) => {
    const idNota = nota.id || nota.nota_id || nota.numero_nota
    if (!idNota) {
      alert("Nota sin id valido")
      return
    }
    const res = await fetch(`/api/notas/pdf-storage/${idNota}`)
    const data = await res.json()
    const pdfUrl = data.url
    if (!pdfUrl) {
      alert("PDF no encontrado")
      return
    }
    window.open(pdfUrl, "_blank")
  }

  const handleReenviar = async (notaId: number) => {
    if (!emailReenvio) {
      setMensaje("Introduce un email de destino")
      return
    }
    setMensaje("Enviando...")
    const res = await fetch("/api/notas/reenviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notaId, email: emailReenvio })
    })
    const data = await res.json()
    setMensaje(data.success ? "Correo enviado correctamente" : "Error al enviar correo")
  }

  // Helpers de fechas
  const s10 = (v: any) => (v ? String(v).slice(0, 10) : "")
  const between = (d: string, from: string, to: string) => !!d && !!from && !!to && d >= from && d <= to

  const notasFiltradas = notas.filter((n) => {
    // === Filtro por fecha (desde/hasta) que ya tenías ===
    const fecha = n.fecha_recepcion ? s10(n.fecha_recepcion) : ""
    let pasaFecha = true
    if (filtroFechaInicio && fecha < filtroFechaInicio) pasaFecha = false
    if (filtroFechaFin && fecha > filtroFechaFin) pasaFecha = false

    // === Filtro por nombre (empresa/agricultor) que ya tenías ===
    let pasaNombre = true
    if (filtroNombre.trim() !== "") {
      const buscar = filtroNombre.toLowerCase()
      pasaNombre =
        (n.empresa_nombre && n.empresa_nombre.toLowerCase().includes(buscar)) ||
        (n.agricultor_nombre && n.agricultor_nombre.toLowerCase().includes(buscar)) ||
        (n.agricultor_apellido && n.agricultor_apellido.toLowerCase().includes(buscar))
    }

    // === Filtro por numero de nota que ya tenías ===
    let pasaNumero = true
    if (filtroNumeroNota.trim() !== "") {
      pasaNumero = n.numero_nota?.toString().includes(filtroNumeroNota)
    }

    // === NUEVO: Filtro por temporada ===
    let pasaTemporada = true
    if (filtroTemporadaId) {
      const selId = parseInt(filtroTemporadaId, 10)
      const tSel = temporadas.find((t: any) => Number(t.id) === selId)

      // si la API ya trae temporada_id en cada nota, lo usamos directo
      if (n.temporada_id != null) {
        pasaTemporada = Number(n.temporada_id) === selId
      } else if (tSel) {
        // fallback por fecha en caso de no venir temporada_id en la nota
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

  const cardBg = darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-slate-200"
  const thBg = darkMode ? "bg-slate-800 text-orange-200 border-slate-700" : "bg-orange-50 text-orange-700 border-orange-200"
  const rowEven = darkMode ? "bg-slate-900" : "bg-orange-50"
  const rowOdd = darkMode ? "bg-gray-800" : "bg-white"
  const textMain = darkMode ? "text-orange-200" : "text-orange-700"
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-500"

  const btnBase = "rounded-xl px-4 py-1 font-semibold shadow-sm border transition-colors"
  const btnRecep = darkMode ? "bg-yellow-900 border-yellow-800 text-yellow-100 hover:bg-yellow-800" : "bg-yellow-100 border-yellow-300 text-yellow-700 hover:bg-yellow-200"
  const btnCalid = darkMode ? "bg-green-900 border-green-800 text-green-100 hover:bg-green-800" : "bg-green-100 border-green-300 text-green-700 hover:bg-green-200"
  const btnPrint = darkMode ? "bg-orange-900 border-orange-800 text-orange-100 hover:bg-orange-800" : "bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200"
  const btnSend = darkMode ? "bg-green-900 border-green-800 text-green-100 hover:bg-green-800" : "bg-green-100 border-green-300 text-green-700 hover:bg-green-200"

  function limpiarFiltros() {
    setFiltroFechaInicio("")
    setFiltroFechaFin("")
    setFiltroNombre("")
    setFiltroNumeroNota("")
    setFiltroTemporadaId("") // NUEVO: limpiar temporada
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-5 gap-3">
        <h2 className={`text-3xl font-extrabold ${textMain} mb-2`}>Gestion de Notas</h2>
        <button
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm shadow-sm font-semibold transition-colors ${
            darkMode ? "bg-[#232323] border-orange-700 text-orange-300 hover:bg-orange-900" : "bg-white border-orange-200 text-orange-700 hover:bg-orange-100"
          }`}
          onClick={() => router.push("/panel/administrador")}
          title="Ir al menu principal"
        >
          <FiHome className="text-lg" />
          <span className="hidden sm:inline">Menu principal</span>
        </button>
      </div>

      <div className={`rounded-2xl p-4 mb-8 border ${darkMode ? "bg-[#1e1914] border-orange-900" : "bg-orange-50 border-orange-200"} shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]`}>
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
            <input
              type="text"
              placeholder="Nombre..."
              className={`rounded-xl border px-3 py-1 text-sm ${darkMode ? "bg-slate-900 border-slate-700 text-orange-100" : "border-orange-200 text-orange-700 bg-white"}`}
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
            />
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

          {/* === NUEVO: Selector de Temporada === */}
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
          </div>
        </div>
      </div>

      <div className={`rounded-3xl border-2 shadow-2xl overflow-x-auto p-6 transition-colors ${cardBg}`}>
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
                <th className="p-4 font-bold">Nota Recepcion</th>
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
                          title="Editar Nota de Recepcion"
                        >
                          Nota recepcion
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
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
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-4 flex flex-col gap-2">
                      <button onClick={() => setModalNota(n)} className={`${btnBase} ${btnSend} flex items-center gap-2`} title="Reenviar">
                        <FiSend />
                        Reenviar
                      </button>
                      <button onClick={() => handleImprimir(n)} className={`${btnBase} ${btnPrint} flex items-center gap-2`} title="Imprimir">
                        <FiPrinter />
                        Imprimir
                      </button>
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

      {modalNota && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className={`max-w-lg w-full rounded-2xl shadow-2xl border-2 p-8 ${darkMode ? "bg-gray-900 border-orange-700" : "bg-white border-orange-300"}`}>
            <h3 className={`text-2xl font-bold mb-4 ${textMain}`}>Reenviar Nota #{modalNota.numero_nota}</h3>
            <p className={`mb-4 ${textMain}`}>Elige el email destino:</p>
            <div className="flex flex-col gap-2 mb-4">
              {modalNota.empresa_email && (
                <button
                  className={`w-full rounded-lg px-4 py-2 border font-medium text-left transition ${
                    emailReenvio === modalNota.empresa_email
                      ? darkMode
                        ? "bg-orange-900 text-orange-100 border-orange-600"
                        : "bg-orange-100 text-orange-700 border-orange-400"
                      : darkMode
                      ? "bg-gray-800 text-orange-100 border-gray-700"
                      : "bg-white text-orange-700 border-orange-200"
                  }`}
                  onClick={() => setEmailReenvio(modalNota.empresa_email)}
                >
                  📧 Usar email registrado empresa: <b>{modalNota.empresa_email}</b>
                </button>
              )}
              {modalNota.agricultor_email && (
                <button
                  className={`w-full rounded-lg px-4 py-2 border font-medium text-left transition ${
                    emailReenvio === modalNota.agricultor_email
                      ? darkMode
                        ? "bg-orange-900 text-orange-100 border-orange-600"
                        : "bg-orange-100 text-orange-700 border-orange-400"
                      : darkMode
                      ? "bg-gray-800 text-orange-100 border-gray-700"
                      : "bg-white text-orange-700 border-orange-200"
                  }`}
                  onClick={() => setEmailReenvio(modalNota.agricultor_email)}
                >
                  📧 Usar email registrado agricultor: <b>{modalNota.agricultor_email}</b>
                </button>
              )}
              <button
                className={`w-full rounded-lg px-4 py-2 border font-medium text-left transition ${
                  emailReenvio && emailReenvio !== modalNota.empresa_email && emailReenvio !== modalNota.agricultor_email
                    ? darkMode
                      ? "bg-green-900 text-green-100 border-green-600"
                      : "bg-green-100 border-green-800"
                    : darkMode
                    ? "bg-gray-800 text-orange-100 border-gray-700"
                    : "bg-white text-orange-700 border-orange-200"
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
                className={`rounded-xl px-6 py-2 font-bold transition ${darkMode ? "bg-gray-800 text-orange-100 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
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
    </>
  )
}

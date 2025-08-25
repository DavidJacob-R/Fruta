import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import { useUi } from "@/components/ui-context"
import { FiHome, FiPlus, FiEdit2, FiCheckCircle, FiXCircle, FiCalendar, FiSearch } from "react-icons/fi"

type Temporada = {
  id: number
  titulo: string
  fecha_inicio: string
  fecha_fin: string
  activa: boolean
}

type Conflicto = { id: number; nombre: string; fecha_inicio: string; fecha_fin: string }

type ApiResp<T extends object = {}> =
  | { ok: true }
  | ({ ok: false; code: string; message: string } & T)

export default function TemporadasAdmin() {
  const router = useRouter()
  const { darkMode } = useUi()

  const [vista, setVista] = useState<"inicio" | "gestionar" | "listado">("inicio")
  const [temporadas, setTemporadas] = useState<Temporada[]>([])
  const [form, setForm] = useState({ id: 0, titulo: "", fecha_inicio: "", fecha_fin: "" })
  const [cargando, setCargando] = useState(false)
  const [alerta, setAlerta] = useState<{ tipo: "ok" | "error" | "info"; texto: string } | null>(null)
  const [conflicto, setConflicto] = useState<Conflicto | null>(null)
  const [filtro, setFiltro] = useState("")

  useEffect(() => {
    cargar()
  }, [])

  function msg(code?: string, fallback?: string) {
    switch (code) {
      case "datos":
        return "Completa todos los campos."
      case "rango_invalido":
        return "La fecha fin no puede ser menor a la fecha inicio."
      case "fechas_empalmadas":
        return "Las fechas se empalman con otra temporada."
      case "no_encontrada":
        return "La temporada no existe."
      case "metodo":
        return "Método HTTP no permitido."
      case "id":
        return "Id inválido."
      case "error":
        return fallback || "Ocurrió un error inesperado."
      default:
        return fallback || "No se pudo completar la acción."
    }
  }

  function limpiar() {
    setForm({ id: 0, titulo: "", fecha_inicio: "", fecha_fin: "" })
    setConflicto(null)
    setAlerta(null)
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function cargar() {
    setCargando(true)
    fetch("/api/temporadas/listar")
      .then(async (r) => {
        if (!r.ok) return { temporadas: [] }
        return r.json()
      })
      .then((d) => setTemporadas(Array.isArray(d.temporadas) ? d.temporadas : []))
      .finally(() => setCargando(false))
  }

  async function crear() {
    setConflicto(null)
    setAlerta(null)
    if (!form.titulo || !form.fecha_inicio || !form.fecha_fin) {
      setAlerta({ tipo: "error", texto: msg("datos") })
      return
    }
    try {
      const r = await fetch("/api/temporadas/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.titulo,
          fecha_inicio: form.fecha_inicio,
          fecha_fin: form.fecha_fin
        })
      })
      const d: ApiResp<{ conflicto?: Conflicto }> = await r.json()
      if (d.ok) {
        limpiar()
        cargar()
        setVista("inicio")
        setAlerta({ tipo: "ok", texto: "Temporada creada correctamente." })
      } else {
        setAlerta({ tipo: "error", texto: msg(d.code, d.message) })
        setConflicto(d.conflicto ?? null)
      }
    } catch {
      setAlerta({ tipo: "error", texto: "No se pudo conectar con el servidor." })
    }
  }

  async function guardarEdicion() {
    setConflicto(null)
    setAlerta(null)
    try {
      const r = await fetch(`/api/temporadas/editar/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.titulo,
          fecha_inicio: form.fecha_inicio,
          fecha_fin: form.fecha_fin
        })
      })
      const d: ApiResp<{ conflicto?: Conflicto }> = await r.json()
      if (d.ok) {
        limpiar()
        cargar()
        setVista("inicio")
        setAlerta({ tipo: "ok", texto: "Temporada actualizada." })
      } else {
        setAlerta({ tipo: "error", texto: msg(d.code, d.message) })
        setConflicto(d.conflicto ?? null)
      }
    } catch {
      setAlerta({ tipo: "error", texto: "No se pudo conectar con el servidor." })
    }
  }

  function editar(t: Temporada) {
    setForm({
      id: t.id,
      titulo: t.titulo,
      fecha_inicio: t.fecha_inicio.slice(0, 10),
      fecha_fin: t.fecha_fin.slice(0, 10)
    })
    setConflicto(null)
    setAlerta(null)
    setVista("gestionar")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function activar(id: number) {
    setAlerta(null)
    setConflicto(null)
    try {
      const r = await fetch(`/api/temporadas/activar/${id}`, { method: "POST" })
      const d: ApiResp = await r.json()
      if (d.ok) {
        cargar()
        setAlerta({ tipo: "ok", texto: "Temporada activada." })
      } else {
        setAlerta({ tipo: "error", texto: msg(d.code, d.message) })
      }
    } catch {
      setAlerta({ tipo: "error", texto: "No se pudo conectar con el servidor." })
    }
  }

  const stats = useMemo(() => {
    const hoy = new Date().toISOString().slice(0, 10)
    const activas = temporadas.filter((t) => t.activa).length
    const enCurso = temporadas.filter((t) => t.fecha_inicio.slice(0, 10) <= hoy && t.fecha_fin.slice(0, 10) >= hoy).length
    const futuras = temporadas.filter((t) => t.fecha_inicio.slice(0, 10) > hoy).length
    return { total: temporadas.length, activas, enCurso, futuras }
  }, [temporadas])

  const listFiltrada = useMemo(() => {
    const q = filtro.trim().toLowerCase()
    const base = [...temporadas].sort((a, b) => a.fecha_inicio.localeCompare(b.fecha_inicio))
    if (!q) return base
    return base.filter((t) => t.titulo.toLowerCase().includes(q))
  }, [temporadas, filtro])

  const bgDay = "bg-[#f6f4f2]"
  const cardDay = "bg-[#f8f7f5] border border-orange-200"
  const textDay = "text-[#1a1a1a]"
  const bgNight = "bg-[#161616]"
  const cardNight = "bg-[#232323] border border-[#353535]"
  const textNight = "text-white"
  const softShadow = "shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]"

  return (
    <div className={`${darkMode ? bgNight : bgDay} min-h-screen ${darkMode ? textNight : textDay} transition-colors duration-300 p-6`}>
      <div className="max-w-7xl mx-auto space-y-8">
        <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">Temporadas</h1>
              <p className="text-orange-100">
                {vista === "inicio" ? "Resumen y estado de tus temporadas" :
                 vista === "gestionar" ? (form.id ? "Editar temporada" : "Crear nueva temporada") :
                 "Listado y acciones"}
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
            </div>
          </div>
        </section>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setVista("inicio")}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${vista === "inicio" ? "bg-orange-500 text-white" : darkMode ? "bg-[#353535] hover:bg-[#404040]" : "bg-orange-100 hover:bg-orange-200"}`}
          >
            📊 Resumen
          </button>
          <button
            onClick={() => { limpiar(); setVista("gestionar") }}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${vista === "gestionar" ? "bg-green-500 text-white" : darkMode ? "bg-[#353535] hover:bg-[#404040]" : "bg-orange-100 hover:bg-orange-200"}`}
          >
            <span className="inline-flex items-center gap-2"><FiPlus /> Gestionar</span>
          </button>
          <button
            onClick={() => setVista("listado")}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${vista === "listado" ? "bg-blue-500 text-white" : darkMode ? "bg-[#353535] hover:bg-[#404040]" : "bg-orange-100 hover:bg-orange-200"}`}
          >
            📜 Listado
          </button>
        </div>

        {vista === "inicio" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`rounded-2xl p-5 ${darkMode ? cardNight : cardDay} ${softShadow}`}>
              <div className="text-sm opacity-70 mb-1">Total</div>
              <div className="text-3xl font-bold">{stats.total}</div>
            </div>
            <div className={`rounded-2xl p-5 ${darkMode ? cardNight : cardDay} ${softShadow}`}>
              <div className="text-sm opacity-70 mb-1">Activas</div>
              <div className="text-3xl font-bold text-green-500">{stats.activas}</div>
            </div>
            <div className={`rounded-2xl p-5 ${darkMode ? cardNight : cardDay} ${softShadow}`}>
              <div className="text-sm opacity-70 mb-1">En curso</div>
              <div className="text-3xl font-bold text-amber-500">{stats.enCurso}</div>
            </div>
            <div className={`rounded-2xl p-5 ${darkMode ? cardNight : cardDay} ${softShadow}`}>
              <div className="text-sm opacity-70 mb-1">Futuras</div>
              <div className="text-3xl font-bold text-blue-500">{stats.futuras}</div>
            </div>

            <div className={`md:col-span-4 rounded-2xl p-6 ${darkMode ? cardNight : cardDay} ${softShadow}`}>
              <h3 className="text-lg font-semibold mb-4">Cronograma</h3>
              {cargando ? (
                <div className="p-4">Cargando...</div>
              ) : (
                <div className="space-y-3">
                  {temporadas.length === 0 && <div className="p-3 text-sm opacity-70">Sin temporadas</div>}
                  {temporadas
                    .slice()
                    .sort((a, b) => a.fecha_inicio.localeCompare(b.fecha_inicio))
                    .map((t) => {
                      const activa = !!t.activa
                      return (
                        <div key={t.id} className={`flex items-center justify-between rounded-xl px-4 py-3 ${darkMode ? "bg-[#1f1f1f] border border-[#353535]" : "bg-white border border-orange-200"}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-10 rounded-full ${activa ? "bg-green-500" : "bg-gray-300"}`} />
                            <div>
                              <div className="font-semibold">{t.titulo}</div>
                              <div className="text-sm opacity-80 inline-flex items-center gap-2">
                                <FiCalendar /> {t.fecha_inicio.slice(0, 10)} a {t.fecha_fin.slice(0, 10)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${activa ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{activa ? "Activa" : "Inactiva"}</span>
                            <button onClick={() => editar(t)} className="px-3 py-2 rounded-lg border border-orange-400 inline-flex items-center gap-2">
                              <FiEdit2 /> Editar
                            </button>
                            {!activa && (
                              <button onClick={() => activar(t.id)} className="px-3 py-2 rounded-lg bg-orange-600 text-white inline-flex items-center gap-2">
                                <FiCheckCircle /> Hacer activa
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {vista === "gestionar" && (
          <section className={`rounded-2xl p-6 ${darkMode ? cardNight : cardDay} ${softShadow}`}>
            <h2 className="text-lg font-semibold mb-4">{form.id ? "Editar temporada" : "Nueva temporada"}</h2>

            {alerta && (
              <div className={`mb-4 rounded-xl px-4 py-3 ${alerta.tipo === "ok" ? "bg-green-100 text-green-700 border border-green-300" : "bg-red-100 text-red-700 border border-red-300"}`}>
                <p className="font-semibold">{alerta.texto}</p>
                {conflicto && (
                  <p className="text-sm mt-1">
                    Conflicto con: <span className="font-semibold">{conflicto.nombre}</span> ({String(conflicto.fecha_inicio)} a {String(conflicto.fecha_fin)})
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                name="titulo"
                value={form.titulo}
                onChange={onChange}
                placeholder="Título"
                className={`px-4 py-3 rounded-xl outline-none ${darkMode ? "bg-[#1f1f1f] border border-[#353535] text-white" : "bg-white border border-orange-200"}`}
              />
              <input
                type="date"
                name="fecha_inicio"
                value={form.fecha_inicio}
                onChange={onChange}
                className={`px-4 py-3 rounded-xl outline-none ${darkMode ? "bg-[#1f1f1f] border border-[#353535] text-white" : "bg-white border border-orange-200"}`}
              />
              <input
                type="date"
                name="fecha_fin"
                value={form.fecha_fin}
                onChange={onChange}
                className={`px-4 py-3 rounded-xl outline-none ${darkMode ? "bg-[#1f1f1f] border border-[#353535] text-white" : "bg-white border border-orange-200"}`}
              />
              {!form.id ? (
                <button onClick={crear} className="px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold">
                  Crear
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={guardarEdicion} className="px-4 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold">
                    Guardar
                  </button>
                  <button onClick={limpiar} className="px-4 py-3 rounded-xl border border-orange-400">
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {vista === "listado" && (
          <section className={`rounded-2xl p-6 ${darkMode ? cardNight : cardDay} ${softShadow}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Listado</h2>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${darkMode ? "bg-[#1f1f1f] border-[#353535]" : "bg-white border-orange-200"}`}>
                <FiSearch className="opacity-70" />
                <input
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  placeholder="Buscar por título"
                  className={`bg-transparent outline-none ${darkMode ? "text-white" : "text-[#1a1a1a]"}`}
                />
              </div>
            </div>

            {cargando ? (
              <div className="p-6">Cargando...</div>
            ) : (
              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className={`${darkMode ? "bg-[#2a2a2a]" : "bg-orange-50"}`}>
                      <th className="text-left p-3">Título</th>
                      <th className="text-left p-3">Inicio</th>
                      <th className="text-left p-3">Fin</th>
                      <th className="text-left p-3">Estado</th>
                      <th className="text-right p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listFiltrada.length === 0 && (
                      <tr>
                        <td className="p-3" colSpan={5}>Sin datos</td>
                      </tr>
                    )}
                    {listFiltrada.map((t) => (
                      <tr key={t.id} className={`${darkMode ? "border-b border-[#353535]" : "border-b border-orange-100"}`}>
                        <td className="p-3 font-medium">{t.titulo}</td>
                        <td className="p-3">{t.fecha_inicio.slice(0, 10)}</td>
                        <td className="p-3">{t.fecha_fin.slice(0, 10)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs inline-flex items-center gap-1 ${t.activa ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                            {t.activa ? <FiCheckCircle /> : <FiXCircle />} {t.activa ? "Activa" : "Inactiva"}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2 justify-end">
                            <button onClick={() => editar(t)} className="px-3 py-2 rounded-lg border border-orange-400 inline-flex items-center gap-2">
                              <FiEdit2 /> Editar
                            </button>
                            {!t.activa && (
                              <button onClick={() => activar(t.id)} className="px-3 py-2 rounded-lg bg-orange-600 text-white inline-flex items-center gap-2">
                                <FiCheckCircle /> Hacer activa
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

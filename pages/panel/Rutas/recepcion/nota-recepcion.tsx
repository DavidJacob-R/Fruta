import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { FiChevronLeft } from "react-icons/fi"
import { useRouter } from 'next/router'

type FrutaItem = {
  fruta_nombre?: string
  empaque_nombre?: string
  peso_caja_oz?: number | string
  notas?: string | null
}

type Nota = {
  numero_nota?: number
  empresa_nombre?: string | null
  agricultor_nombre?: string | null
  agricultor_apellido?: string | null
  fecha_recepcion?: string | null
  frutas?: FrutaItem[]
}

export default function NotasDelDia() {
  const [notas, setNotas] = useState<Nota[]>([])
  const [cargando, setCargando] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const desde = hoy.toISOString()
    fetch(`/api/recepcion/listar?desde=${desde}`)
      .then(res => res.json())
      .then(data => {
        setNotas(Array.isArray(data.recepciones) ? data.recepciones : [])
        setCargando(false)
      })
      .catch(() => setCargando(false))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181712] via-[#24180c] to-[#242126] text-white px-3 py-6 sm:py-8 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
          <button
            className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-5 py-3 rounded-full font-medium shadow hover:shadow-lg transition active:scale-[0.99]"
            onClick={() => router.push('/panel/Rutas/recepcion/recepcion')}
          >
            <FiChevronLeft className="text-2xl" />
            Menu principal
          </button>

          <div className="flex flex-col items-center">
            <div className="bg-orange-100 shadow-lg rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-2 sm:mb-3">
              <span className="text-3xl sm:text-4xl">📋</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-400 drop-shadow">
              Notas creadas hoy
            </h2>
          </div>

          <div className="hidden md:block" style={{ width: 180 }} />
        </div>

        <div className="bg-[#1c1917] border border-orange-300 rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition mb-8">
          {cargando ? (
            <div className="flex justify-center items-center py-16 sm:py-20">
              <span className="text-xl sm:text-2xl text-orange-400 animate-pulse">Cargando notas...</span>
            </div>
          ) : (
            <>
              {/* Vista móvil: tarjetas (mejor lectura y tacto) */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {notas.length > 0 ? (
                  notas.flatMap((n, i) => {
                    const quien =
                      n.empresa_nombre
                        ? n.empresa_nombre
                        : (n.agricultor_nombre || n.agricultor_apellido)
                        ? `${n.agricultor_nombre ?? ''} ${n.agricultor_apellido ?? ''}`.trim()
                        : '-'
                    const fecha =
                      n.fecha_recepcion ? format(new Date(n.fecha_recepcion), 'yyyy-MM-dd HH:mm') : '—'
                    const items = Array.isArray(n.frutas) ? n.frutas : []

                    return (
                      <div
                        key={`${n.numero_nota ?? i}-card`}
                        className={`rounded-2xl border ${i % 2 === 0 ? "border-orange-950 bg-orange-950/40" : "border-orange-900 bg-orange-900/30"} p-4`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm text-orange-300">Nota</div>
                            <div className="text-xl font-extrabold leading-tight">{n.numero_nota ?? '—'}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-orange-200/80">Fecha</div>
                            <div className="text-sm font-semibold">{fecha}</div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="text-xs text-orange-200/80">Empresa / Agricultor</div>
                          <div className="text-sm font-medium truncate">{quien}</div>
                        </div>

                        <div className="mt-3 space-y-2">
                          {items.length > 0 ? (
                            items.map((f, idx) => (
                              <div
                                key={`${n.numero_nota ?? i}-f-${idx}`}
                                className="rounded-xl border border-orange-800/50 bg-orange-900/20 p-3"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="text-[13px] font-semibold">{f.fruta_nombre || '-'}</div>
                                    <div className="mt-1 text-xs text-orange-200/80 truncate">
                                      {f.notas ? f.notas : <span className="italic text-gray-400">Sin notas</span>}
                                    </div>
                                  </div>
                                  <span className="shrink-0 px-3 py-1 rounded-full font-bold text-xs border bg-orange-900/70 text-orange-200 border-orange-700">
                                    {f.empaque_nombre
                                      ? f.empaque_nombre
                                      : f.peso_caja_oz
                                      ? `${parseInt(String(f.peso_caja_oz))} oz`
                                      : '—'}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-xl border border-orange-800/50 bg-orange-900/20 p-3 text-sm text-gray-300">
                              Sin frutas registradas
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="rounded-2xl border border-orange-900 bg-orange-900/20 p-8 text-center text-lg font-semibold">
                    No hay notas registradas hoy.
                  </div>
                )}
              </div>

              {/* Vista md+: conserva tu tabla, con scroll horizontal */}
              <div className="hidden md:block overflow-x-auto rounded-xl">
                <table className="min-w-full text-base md:text-lg">
                  <thead>
                    <tr className="border-b-2 border-orange-300 bg-gradient-to-r from-orange-900/60 via-orange-950/40 to-orange-900/10">
                      <th className="p-4 text-left font-bold text-orange-300"># Nota</th>
                      <th className="p-4 text-left font-bold text-orange-300">Empresa/Agricultor</th>
                      <th className="p-4 text-left font-bold text-orange-300">Fruta</th>
                      <th className="p-4 text-left font-bold text-orange-300">Empaque (oz)</th>
                      <th className="p-4 text-left font-bold text-orange-300">Fecha</th>
                      <th className="p-4 text-left w-52 font-bold text-orange-300">Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notas.length > 0 ? (
                      notas.map((n, i) =>
                        Array.isArray(n.frutas) && n.frutas.length > 0
                          ? n.frutas.map((f, idx) => (
                              <tr
                                key={`${n.numero_nota}-${idx}`}
                                className={`border-b ${i % 2 === 0 ? "bg-orange-950/60 border-orange-950" : "bg-orange-900/40 border-orange-900"} hover:bg-orange-800/30 transition`}
                                style={{ height: 72 }}
                              >
                                <td className="p-4 font-extrabold text-xl">
                                  {idx === 0 ? n.numero_nota : ''}
                                </td>
                                <td className="p-4 font-medium">
                                  {idx === 0 ? (
                                    n.empresa_nombre
                                      ? n.empresa_nombre
                                      : (n.agricultor_nombre
                                        ? `${n.agricultor_nombre} ${n.agricultor_apellido || ''}`.trim()
                                        : '-')
                                  ) : ''}
                                </td>
                                <td className="p-4 font-semibold">{f.fruta_nombre || '-'}</td>
                                <td className="p-4">
                                  <span className="px-4 py-2 rounded-full font-bold shadow text-base border bg-orange-900/70 text-orange-200 border-orange-700">
                                    {f.empaque_nombre
                                      ? f.empaque_nombre
                                      : f.peso_caja_oz
                                      ? `${parseInt(String(f.peso_caja_oz))} oz`
                                      : '—'}
                                  </span>
                                </td>
                                <td className="p-4 whitespace-nowrap font-semibold">
                                  {idx === 0 && n.fecha_recepcion
                                    ? format(new Date(n.fecha_recepcion), 'yyyy-MM-dd HH:mm')
                                    : ''}
                                </td>
                                <td className="p-4 w-52">
                                  {f.notas
                                    ? <span className="block max-w-xs truncate" title={f.notas}>{f.notas}</span>
                                    : <span className="italic text-gray-400">Sin notas</span>
                                  }
                                </td>
                              </tr>
                            ))
                          : null
                      )
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-20 text-2xl font-semibold">
                          No hay notas registradas hoy.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="text-center text-gray-400">
          © {new Date().getFullYear()} El Molinito
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { FiChevronLeft } from "react-icons/fi";
import { HiOutlineBuildingOffice2, HiOutlineUser } from "react-icons/hi2";
import { useRouter } from 'next/router'

export default function NotasDelDia() {
  const [notas, setNotas] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
  }, [darkMode])

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
  }, [])

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300
      ${darkMode ? "bg-[#11161a]" : "bg-gray-100"}`}>
      {/* Barra superior */}
      <div className="w-full flex justify-end items-center pt-4 pr-4">
        <button
          onClick={() => setDarkMode(d => !d)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow border text-sm font-medium
            ${darkMode
              ? "bg-gray-900 border-gray-800 text-orange-200 hover:bg-gray-800"
              : "bg-white border-gray-200 text-orange-800 hover:bg-gray-100"}`}
        >
          {darkMode ? (
            <>
              <span role="img" aria-label="noche">🌙</span> Noche
            </>
          ) : (
            <>
              <span role="img" aria-label="dia">☀️</span> Día
            </>
          )}
        </button>
      </div>
      <main className="flex-1 flex flex-col items-center justify-center py-6 px-2 sm:px-6">
        <div className="w-full max-w-6xl">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-3">
            <button
              className={`flex items-center gap-2 rounded-xl font-semibold shadow transition px-5 py-2 border
                ${darkMode
                  ? "bg-orange-700 hover:bg-orange-800 border-orange-800 text-orange-50"
                  : "bg-orange-400 hover:bg-orange-500 border-orange-300 text-white"
                }`}
              onClick={() => router.push('/panel/Rutas/recepcion')}
            >
              <FiChevronLeft className="text-2xl" />
              Menú principal
            </button>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow w-full text-center mt-4 md:mt-0
              ${darkMode ? "text-orange-200" : "text-orange-600"}`}>
              Notas creadas hoy
            </h2>
            <div className="hidden md:block" style={{ width: 180 }} /> {/* Espaciador */}
          </div>

          <div className={`rounded-3xl border shadow-2xl overflow-x-auto p-6 md:p-8 transition
            ${darkMode
              ? "bg-[#171a1e]/90 border-orange-800"
              : "bg-white border-orange-200"
            }`}>
            {cargando ? (
              <div className="flex justify-center items-center py-20">
                <span className="text-2xl text-orange-400 animate-pulse">Cargando notas...</span>
              </div>
            ) : (
              <table className={`min-w-full table-auto text-base md:text-lg transition
                ${darkMode ? "text-orange-100" : "text-gray-900"}`}>
                <thead>
                  <tr className={`border-b-2 transition
                    ${darkMode
                      ? "text-orange-300 border-orange-700 bg-gradient-to-r from-orange-900/60 via-orange-950/40 to-orange-900/10"
                      : "text-orange-700 border-orange-300 bg-gradient-to-r from-orange-200/60 via-orange-100/40 to-white"
                    }`}>
                    <th className="p-4 text-left font-bold"># Nota</th>
                    <th className="p-4 text-left font-bold">Tipo</th>
                    <th className="p-4 text-left font-bold">Empresa/Agricultor</th>
                    <th className="p-4 text-left font-bold">Fruta</th>
                    <th className="p-4 text-left font-bold">Empaque (oz)</th>
                    <th className="p-4 text-left font-bold">Fecha</th>
                    <th className="p-4 text-left w-52 font-bold">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {notas.length > 0 ? (
                    notas.map((n, i) => (
                      <tr
                        key={i}
                        className={`
                          border-b
                          ${darkMode
                            ? i % 2 === 0
                              ? "bg-orange-950/60 border-orange-950"
                              : "bg-orange-900/40 border-orange-900"
                            : i % 2 === 0
                              ? "bg-orange-100/60 border-orange-100"
                              : "bg-orange-50 border-orange-50"}
                          hover:bg-orange-200/30 transition
                        `}
                        style={{ height: 72 }}
                      >
                        <td className="p-4 font-extrabold text-xl">{n.numero_nota ?? '-'}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-bold shadow-lg border
                              ${n.tipo_nota === 'empresa'
                                ? (darkMode
                                  ? "bg-orange-700/90 text-orange-100 border-orange-700"
                                  : "bg-orange-200 text-orange-800 border-orange-300")
                                : (darkMode
                                  ? "bg-green-700/90 text-green-100 border-green-700"
                                  : "bg-green-200 text-green-800 border-green-300")
                              }`}
                          >
                            {n.tipo_nota === 'empresa'
                              ? (<><HiOutlineBuildingOffice2 className="text-xl" /> Empresa</>)
                              : (<><HiOutlineUser className="text-xl" /> Maquila</>)
                            }
                          </span>
                        </td>
                        <td className="p-4 font-medium">
                          {n.tipo_nota === 'empresa'
                            ? (n.empresa_nombre || '-')
                            : (n.agricultor_nombre
                                ? `${n.agricultor_nombre} ${n.agricultor_apellido || ''}`.trim()
                                : '-')}
                        </td>
                        <td className="p-4 font-semibold">{n.fruta_nombre || '-'}</td>
                        <td className="p-4">
                          <span className={`px-4 py-2 rounded-full font-bold shadow text-base border
                            ${darkMode
                              ? "bg-orange-900/70 text-orange-200 border-orange-700"
                              : "bg-orange-100 text-orange-700 border-orange-300"
                            }`}>
                            {n.empaque_nombre
                              ? n.empaque_nombre
                              : n.peso_caja_oz
                                ? `${parseInt(n.peso_caja_oz)} oz`
                                : '—'}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap font-semibold">
                          {n.fecha_recepcion
                            ? format(new Date(n.fecha_recepcion), 'yyyy-MM-dd HH:mm')
                            : '-'}
                        </td>
                        <td className="p-4 w-52">
                          {n.notas
                            ? <span className="block max-w-xs truncate" title={n.notas}>{n.notas}</span>
                            : <span className="italic text-gray-400">Sin notas</span>
                          }
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-20 text-2xl font-semibold">
                        No hay notas registradas hoy.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
      {/* Footer fijo */}
      <footer className={`w-full text-center py-4 border-t text-sm mt-auto
        ${darkMode
          ? "bg-[#11161a] border-orange-950 text-orange-200"
          : "bg-orange-50 border-orange-200 text-orange-800"
        }`}>
        © {new Date().getFullYear()} El Molinito – Sistema de logística y control
      </footer>
    </div>
  )
}

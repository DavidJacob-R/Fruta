import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { FiChevronLeft } from "react-icons/fi";
import { HiOutlineBuildingOffice2, HiOutlineUser } from "react-icons/hi2";
import { useRouter } from 'next/router'

export default function NotasDelDia() {
  const [notas, setNotas] = useState<any[]>([])
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
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-tr from-black via-blue-950 to-blue-900 py-10 px-2 sm:px-6">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10">
          <button
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-2xl text-white font-bold shadow transition text-lg md:text-xl"
            onClick={() => router.push('/panel/Rutas/recepcion')}
          >
            <FiChevronLeft className="text-2xl" />
            Menú principal
          </button>
          <h2 className="text-3xl md:text-4xl font-extrabold text-orange-400 text-center w-full drop-shadow mt-6 md:mt-0">Notas creadas hoy</h2>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl border-2 border-orange-500 shadow-2xl overflow-x-auto p-8">
          {cargando ? (
            <div className="flex justify-center items-center py-20">
              <span className="text-2xl text-orange-300 animate-pulse">Cargando notas...</span>
            </div>
          ) : (
            <table className="min-w-full table-auto text-lg" style={{ fontFamily: "inherit" }}>
              <thead>
                <tr className="text-orange-300 border-b-2 border-orange-700 bg-gradient-to-r from-orange-950/40 via-orange-900/60 to-orange-900/10">
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
                        border-b border-orange-900/50
                        ${i % 2 === 0
                          ? "bg-orange-950/60"
                          : "bg-orange-900/40"}
                        hover:bg-orange-900/60 transition
                        rounded-xl
                      `}
                      style={{ height: 76 }}
                    >
                      <td className="p-4 font-extrabold text-xl text-orange-200">{n.numero_nota ?? '-'}</td>
                      <td className="p-4">
                        <span
                          className={`
                            inline-flex items-center gap-2 
                            ${n.tipo_nota === 'empresa'
                              ? "bg-orange-700/90 text-orange-100"
                              : "bg-green-700/90 text-green-100"}
                            rounded-full px-4 py-2 text-base font-bold shadow-lg`}
                        >
                          {n.tipo_nota === 'empresa'
                            ? (<><HiOutlineBuildingOffice2 className="text-xl" /> Empresa</>)
                            : (<><HiOutlineUser className="text-xl" /> Maquila</>)
                          }
                        </span>
                      </td>
                      <td className="p-4 text-white font-medium">
                        {n.tipo_nota === 'empresa'
                          ? (n.empresa_nombre || '-')
                          : (n.agricultor_nombre
                              ? `${n.agricultor_nombre} ${n.agricultor_apellido || ''}`.trim()
                              : '-')}
                      </td>
                      <td className="p-4 text-orange-100 font-semibold">{n.fruta_nombre || '-'}</td>
                      {/* Empaque (oz): siempre muestra el peso con badge */}
                      <td className="p-4">
                        <span className="bg-orange-900/70 text-orange-200 px-4 py-2 rounded-full font-bold shadow text-base">
                          {n.empaque_nombre
                            ? n.empaque_nombre
                            : n.peso_caja_oz
                              ? `${parseInt(n.peso_caja_oz)} oz`
                              : '—'}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap text-orange-100 font-semibold">
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
                    <td colSpan={7} className="text-center text-orange-200 py-20 text-2xl font-semibold">
                      No hay notas registradas hoy.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-10 text-center text-gray-400 opacity-70">
          © {new Date().getFullYear()} El Molinito – Sistema de logística y control
        </div>
      </div>
    </div>
  )
}

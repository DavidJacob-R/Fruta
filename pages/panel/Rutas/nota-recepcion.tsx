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
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-blue-900 text-white flex flex-col items-center py-8 px-2 sm:px-6">
      <div className="w-full max-w-5xl mb-6">
        <div className="flex flex-row items-center justify-between mb-4">
          <h2 className="text-3xl font-extrabold text-blue-400 drop-shadow text-center w-full">
            Notas creadas hoy
          </h2>
        </div>
        <div className="flex flex-row justify-end mb-6">
          <button
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-xl text-white font-bold shadow transition"
            onClick={() => router.push('/panel/Rutas/recepcion')}>
            <FiChevronLeft className="text-2xl" />
            Menú principal
          </button>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-blue-700 shadow-2xl overflow-x-auto p-6">
          {cargando ? (
            <div className="flex justify-center items-center py-16">
              <span className="text-xl text-blue-200 animate-pulse">Cargando notas...</span>
            </div>
          ) : (
            <table className="min-w-full table-auto text-base">
              <thead>
                <tr className="text-blue-300 border-b border-blue-700 bg-gradient-to-r from-blue-800/30 via-blue-900/60 to-blue-900/20">
                  <th className="p-3 text-left font-semibold"># Nota</th>
                  <th className="p-3 text-left font-semibold">Tipo</th>
                  <th className="p-3 text-left font-semibold">Empresa/Agricultor</th>
                  <th className="p-3 text-left font-semibold">Fruta</th>
                  <th className="p-3 text-left font-semibold">Empaque (oz)</th>
                  <th className="p-3 text-left font-semibold">Fecha</th>
                  <th className="p-3 text-left w-52 font-semibold">Notas</th>
                </tr>
              </thead>
              <tbody>
                {notas.length > 0 ? (
                  notas.map((n, i) => (
                    <tr
                      key={i}
                      className={`border-b border-blue-900/60 ${
                        i % 2 === 0
                          ? "bg-blue-950/70"
                          : "bg-blue-900/70"
                      } hover:bg-blue-800/50 transition`}
                    >
                      <td className="p-3 font-bold text-lg text-blue-200">{n.numero_nota ?? '-'}</td>
                      <td className="p-3">
                        <span
                          className={
                            n.tipo_nota === 'empresa'
                              ? "inline-flex items-center gap-2 bg-orange-700/80 text-orange-100 rounded-full px-3 py-1 text-xs font-bold shadow"
                              : "inline-flex items-center gap-2 bg-green-700/80 text-green-100 rounded-full px-3 py-1 text-xs font-bold shadow"
                          }
                        >
                          {n.tipo_nota === 'empresa'
                            ? <>
                                <HiOutlineBuildingOffice2 className="text-lg" />
                                Empresa
                              </>
                            : <>
                                <HiOutlineUser className="text-lg" />
                                Maquila
                              </>
                          }
                        </span>
                      </td>
                      <td className="p-3">
                        {n.tipo_nota === 'empresa'
                          ? (n.empresa_nombre || '-')
                          : (n.agricultor_nombre
                              ? `${n.agricultor_nombre} ${n.agricultor_apellido || ''}`.trim()
                              : '-')}
                      </td>
                      <td className="p-3">{n.fruta_nombre || '-'}</td>
                      {/* Empaque (oz): muestra siempre el peso con badge */}
                      <td className="p-3">
                        <span className="bg-blue-800/80 text-blue-100 px-3 py-1 rounded-full font-bold shadow text-sm">
                          {n.empaque_nombre
                            ? n.empaque_nombre
                            : n.peso_caja_oz
                              ? `${parseInt(n.peso_caja_oz)} oz`
                              : '—'}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {n.fecha_recepcion
                          ? format(new Date(n.fecha_recepcion), 'yyyy-MM-dd HH:mm')
                          : '-'}
                      </td>
                      <td className="p-3 w-52">
                        {n.notas
                          ? <span className="block max-w-xs truncate" title={n.notas}>{n.notas}</span>
                          : <span className="italic text-gray-400">Sin notas</span>
                        }
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center text-blue-200 py-16 text-lg font-semibold">
                      No hay notas registradas hoy.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

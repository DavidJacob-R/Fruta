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
    <div className="min-h-screen bg-gradient-to-br from-[#181712] via-[#24180c] to-[#242126] text-white px-2 py-8 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <button
            className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-full font-medium shadow hover:shadow-lg transition"
            onClick={() => router.push('/panel/Rutas/recepcion/recepcion')}>
            <FiChevronLeft className="text-2xl" />
            Menú principal
          </button>
          
          <div className="flex flex-col items-center">
            <div className="bg-orange-100 shadow-lg rounded-full w-20 h-20 flex items-center justify-center mb-3">
              <span className="text-4xl">📋</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-orange-400 mb-2 drop-shadow">
              Notas creadas hoy
            </h2>
          </div>
          
          <div className="hidden md:block" style={{ width: 180 }} />
        </div>

        {/* Tabla de notas */}
        <div className="bg-[#1c1917] border border-orange-300 rounded-2xl p-6 shadow-md hover:shadow-lg transition mb-8">
          {cargando ? (
            <div className="flex justify-center items-center py-20">
              <span className="text-2xl text-orange-400 animate-pulse">Cargando notas...</span>
            </div>
          ) : (
            <table className="min-w-full text-base md:text-lg">
              <thead>
                <tr className="border-b-2 border-orange-300 bg-gradient-to-r from-orange-900/60 via-orange-950/40 to-orange-900/10">
                  <th className="p-4 text-left font-bold text-orange-300"># Nota</th>
                  <th className="p-4 text-left font-bold text-orange-300">Tipo</th>
                  <th className="p-4 text-left font-bold text-orange-300">Empresa/Agricultor</th>
                  <th className="p-4 text-left font-bold text-orange-300">Fruta</th>
                  <th className="p-4 text-left font-bold text-orange-300">Empaque (oz)</th>
                  <th className="p-4 text-left font-bold text-orange-300">Fecha</th>
                  <th className="p-4 text-left w-52 font-bold text-orange-300">Notas</th>
                </tr>
              </thead>
              <tbody>
                {notas.length > 0 ? (
                  notas.map((n, i) => (
                    n.frutas && n.frutas.length > 0 ? (
                      n.frutas.map((f: any, idx: number) => (
                        <tr
                          key={`${n.numero_nota}-${idx}`}
                          className={`border-b ${i % 2 === 0 ? "bg-orange-950/60 border-orange-950" : "bg-orange-900/40 border-orange-900"} hover:bg-orange-800/30 transition`}
                          style={{ height: 72 }}
                        >
                          <td className="p-4 font-extrabold text-xl">
                            {idx === 0 ? n.numero_nota : ''}
                          </td>
                          <td className="p-4">
                            {idx === 0 && (
                              <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-bold shadow-lg border ${
                                n.tipo_nota === 'empresa'
                                  ? "bg-orange-700/90 text-orange-100 border-orange-700"
                                  : "bg-green-700/90 text-green-100 border-green-700"
                              }`}>
                                {n.tipo_nota === 'empresa'
                                  ? (<><HiOutlineBuildingOffice2 className="text-xl" /> Empresa</>)
                                  : (<><HiOutlineUser className="text-xl" /> Maquila</>)}
                              </span>
                            )}
                          </td>
                          <td className="p-4 font-medium">
                            {idx === 0 && (
                              n.tipo_nota === 'empresa'
                                ? (n.empresa_nombre || '-')
                                : (n.agricultor_nombre
                                    ? `${n.agricultor_nombre} ${n.agricultor_apellido || ''}`.trim()
                                    : '-')
                            )}
                          </td>
                          <td className="p-4 font-semibold">{f.fruta_nombre || '-'}</td>
                          <td className="p-4">
                            <span className="px-4 py-2 rounded-full font-bold shadow text-base border bg-orange-900/70 text-orange-200 border-orange-700">
                              {f.empaque_nombre
                                ? f.empaque_nombre
                                : f.peso_caja_oz
                                  ? `${parseInt(f.peso_caja_oz)} oz`
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
                    ) : null
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

        <div className="text-center text-gray-400">
          © {new Date().getFullYear()} El Molinito
        </div>
      </div>
    </div>
  )
}
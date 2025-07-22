import { useEffect, useState } from 'react'
import { FiSearch, FiSun, FiMoon, FiSend, FiPrinter } from 'react-icons/fi'
import { useRouter } from 'next/router'

export default function NotasAdmin() {
  const router = useRouter()
  const [notas, setNotas] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [modalNota, setModalNota] = useState<any | null>(null)
  const [emailReenvio, setEmailReenvio] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [darkMode, setDarkMode] = useState(true)

  // Nueva función para recargar notas
  const recargarNotas = async () => {
    setCargando(true);
    const res = await fetch('/api/notas/listar');
    const data = await res.json();
    setNotas(Array.isArray(data.notas) ? data.notas : []);
    setCargando(false);
  };

  useEffect(() => {
    recargarNotas();
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [darkMode])

  // Si quieres refrescar después de regresar del editor de nota, puedes escuchar cambios en el router:
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (url.includes('/panel/administradorRutas/notas')) {
        recargarNotas();
      }
    }
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    }
  }, [router]);

  const notasFiltradas = notas.filter(n =>
    n.numero_nota?.toString().includes(busqueda) ||
    n.tipo_nota?.toLowerCase().includes(busqueda.toLowerCase()) ||
    n.agricultor_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    n.empresa_nombre?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const handleImprimir = (nota: any) => {
    setModalNota(nota)
    setTimeout(() => {
      window.print()
      setModalNota(null)
    }, 400)
  }

  const handleReenviar = async (notaId: number) => {
    if (!emailReenvio) {
      setMensaje('Introduce un email de destino')
      return
    }
    setMensaje('Enviando...')
    const res = await fetch('/api/notas/reenviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notaId, email: emailReenvio }),
    })
    const data = await res.json()
    setMensaje(data.success ? 'Correo enviado correctamente' : 'Error al enviar correo')
  }

  // Botones y estilos igual que tu código original
  const tableBg = darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-white via-slate-50 to-slate-200'
  const cardBg = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-slate-200'
  const thBg = darkMode ? 'bg-slate-800 text-orange-200 border-slate-700' : 'bg-orange-50 text-orange-700 border-orange-200'
  const rowEven = darkMode ? 'bg-slate-900' : 'bg-orange-50'
  const rowOdd = darkMode ? 'bg-gray-800' : 'bg-white'
  const textMain = darkMode ? 'text-orange-200' : 'text-orange-700'
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500'
  const btnBase = "rounded-xl px-4 py-1 font-semibold shadow-sm border transition-colors"
  const btnRecep = darkMode
    ? "bg-yellow-900 border-yellow-800 text-yellow-100 hover:bg-yellow-800"
    : "bg-yellow-100 border-yellow-300 text-yellow-700 hover:bg-yellow-200"
  const btnCalid = darkMode
    ? "bg-green-900 border-green-800 text-green-100 hover:bg-green-800"
    : "bg-green-100 border-green-300 text-green-700 hover:bg-green-200"
  const btnIcon = darkMode
    ? "bg-blue-900 border-blue-800 text-blue-100 hover:bg-blue-800"
    : "bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200"
  const btnPrint = darkMode
    ? "bg-orange-900 border-orange-800 text-orange-100 hover:bg-orange-800"
    : "bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200"
  const btnSend = darkMode
    ? "bg-green-900 border-green-800 text-green-100 hover:bg-green-800"
    : "bg-green-100 border-green-300 text-green-700 hover:bg-green-200"

  return (
    <div className={`min-h-screen ${tableBg} py-8 px-2 transition-colors`}>
      <div className="w-full max-w-7xl mx-auto">
        {/* Toggle modo noche/día y botón menú principal */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-5 gap-3">
          <div className="flex gap-3">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border shadow-sm font-semibold transition-colors
                ${darkMode ? 'bg-orange-900 border-orange-800 text-orange-100 hover:bg-orange-800' : 'bg-white border-orange-200 text-orange-700 hover:bg-orange-100'}`}
              onClick={() => router.push('/panel/administrador')}>
               Menú principal
            </button>
          </div>
          <div className="flex justify-end">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border shadow-sm font-semibold transition-colors
                ${darkMode ? 'bg-slate-800 border-slate-700 text-orange-100 hover:bg-slate-700' : 'bg-white border-slate-200 text-orange-700 hover:bg-slate-100'}`}
              onClick={() => setDarkMode(d => !d)}
              >
              {darkMode ? <><FiSun className="text-orange-300" /> Día</> : <><FiMoon className="text-orange-600" /> Noche</>}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h2 className={`text-3xl font-extrabold ${textMain} mb-6 md:mb-0`}>
            Gestión de Notas 
          </h2>
          <div className="flex gap-2 items-center">
            <FiSearch className={`text-xl ${textMain}`} />
            <input
              type="text"
              className={`border rounded-xl px-4 py-2 focus:ring-2 outline-none font-medium
                ${darkMode
                  ? 'border-slate-600 bg-slate-900 text-orange-100 focus:ring-orange-400'
                  : 'border-orange-200 bg-white text-orange-700 focus:ring-orange-200'
                }`}
              placeholder="Buscar por nota, agricultor o empresa..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}/>
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
                  <th className="p-4 font-bold">Tipo</th>
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
                {notasFiltradas.length > 0 ? notasFiltradas.map((n, i) => (
                  <tr
                    key={i}
                    className={`${i % 2 === 0 ? rowEven : rowOdd} border-b transition`}>
                    <td className={`p-4 font-bold ${textMain}`}>{n.numero_nota}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-4 py-1 font-semibold text-xs 
                        ${n.tipo_nota === 'empresa'
                          ? (darkMode ? 'bg-orange-900 text-orange-200' : 'bg-orange-100 text-orange-700')
                          : (darkMode ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-700')}`}>
                        {n.tipo_nota === 'empresa' ? 'Empresa' : 'Maquila'}
                      </span>
                    </td>
                    <td className={`p-4 ${textMain}`}>
                      {n.tipo_nota === 'empresa'
                        ? (<>
                            <div className="font-bold">{n.empresa_nombre}</div>
                            <div className={`text-xs ${textSecondary}`}>{n.empresa_email} <br />{n.empresa_telefono}</div>
                          </>)
                        : (<>
                            <div className="font-bold">{n.agricultor_nombre} {n.agricultor_apellido}</div>
                            <div className={`text-xs ${textSecondary}`}>{n.agricultor_email} <br />{n.agricultor_telefono}</div>
                          </>)
                      }
                    </td>
                    <td className={`p-4 ${textMain}`}>{n.fruta_nombre}</td>
                    <td className={`p-4 ${textMain}`}>{n.fecha_recepcion?.slice(0, 16).replace('T', ' ')}</td>
                    <td className={`p-4 ${textMain}`}>
                      {n.usuario_nombre} {n.usuario_apellido}
                      <div className={`text-xs ${textSecondary}`}>{n.usuario_email}</div>
                    </td>
                    {/* NOTA RECEPCION COMO BOTON */}
                    <td className={`p-4 ${textMain}`}>
                      {n.nota_recepcion_id ? (
                        <button
                          onClick={async () => {
                            await router.push(
                              `/panel/administradorRutas/notas/editar-recepcion/${n.nota_recepcion_id}?tipo=${n.tipo_nota}`
                            );
                            // Después de regresar del editor, recarga la lista:
                            await recargarNotas();
                          }}
                          className={`${btnBase} ${btnRecep} w-full`}
                          title="Editar Nota de Recepción"
                        >
                          {n.nota_recepcion_titulo || 'Nota recepción'}
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    {/* NOTA CALIDAD COMO BOTON */}
                    <td className={`p-4 ${textMain}`}>
                      {n.nota_calidad_id ? (
                        <button
                          onClick={async () => {
                            await router.push(`/panel/administradorRutas/notas/editar-calidad/${n.nota_calidad_id}`);
                            // Después de regresar del editor, recarga la lista:
                            await recargarNotas();
                          }}
                          className={`${btnBase} ${btnCalid} w-full`}
                          title="Editar Nota de Calidad"
                        >
                          {n.nota_calidad_titulo || 'Nota calidad'}
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    {/* OPCIONES de reenviar e imprimir */}
                    <td className="p-4 flex flex-col gap-2">
                      <button
                        onClick={() => setModalNota(n)}
                        className={`${btnBase} ${btnSend} flex items-center gap-2`}
                        title="Reenviar"
                      >
                        <FiSend />
                        Reenviar
                      </button>
                      <button
                        onClick={() => handleImprimir(n)}
                        className={`${btnBase} ${btnPrint} flex items-center gap-2`}
                        title="Imprimir"
                      >
                        <FiPrinter />
                        Imprimir
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={9} className={`text-center py-20 text-xl font-semibold ${textMain}`}>
                      No hay notas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Modal para reenviar puedes mantener el tuyo aquí si lo necesitas */}
      {modalNota && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className={`max-w-lg w-full rounded-2xl shadow-2xl border-2 p-8 ${darkMode ? 'bg-gray-900 border-orange-700' : 'bg-white border-orange-300'}`}>
            <h3 className={`text-2xl font-bold mb-4 ${textMain}`}>Reenviar Nota #{modalNota.numero_nota}</h3>
            <p className={`mb-4 ${textMain}`}>Elige el email destino:</p>
            <div className="flex flex-col gap-2 mb-4">
              {/* Email registrado */}
              {modalNota.tipo_nota === 'empresa' && modalNota.empresa_email && (
                <button
                  className={`w-full rounded-lg px-4 py-2 border font-medium text-left transition
                    ${emailReenvio === modalNota.empresa_email
                      ? (darkMode ? 'bg-orange-900 text-orange-100 border-orange-600' : 'bg-orange-100 text-orange-700 border-orange-400')
                      : (darkMode ? 'bg-gray-800 text-orange-100 border-gray-700' : 'bg-white text-orange-700 border-orange-200')
                    }`}
                  onClick={() => setEmailReenvio(modalNota.empresa_email)}>
                  📧 Usar email registrado empresa: <b>{modalNota.empresa_email}</b>
                </button>
              )}
              {modalNota.tipo_nota === 'maquila' && modalNota.agricultor_email && (
                <button
                  className={`w-full rounded-lg px-4 py-2 border font-medium text-left transition
                    ${emailReenvio === modalNota.agricultor_email
                      ? (darkMode ? 'bg-orange-900 text-orange-100 border-orange-600' : 'bg-orange-100 text-orange-700 border-orange-400')
                      : (darkMode ? 'bg-gray-800 text-orange-100 border-gray-700' : 'bg-white text-orange-700 border-orange-200')
                    }`}
                  onClick={() => setEmailReenvio(modalNota.agricultor_email)}>
                  📧 Usar email registrado agricultor: <b>{modalNota.agricultor_email}</b>
                </button>
              )}
              {/* Personalizado */}
              <button
                className={`w-full rounded-lg px-4 py-2 border font-medium text-left transition
                  ${emailReenvio && emailReenvio !== modalNota.empresa_email && emailReenvio !== modalNota.agricultor_email
                    ? (darkMode ? 'bg-green-900 text-green-100 border-green-600' : 'bg-green-100 text-green-800 border-green-400')
                    : (darkMode ? 'bg-gray-800 text-orange-100 border-gray-700' : 'bg-white text-orange-700 border-orange-200')
                  }`}
                onClick={() => setEmailReenvio('')}>
                ✏️ Usar email personalizado
              </button>
            </div>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              className={`w-full border rounded-lg px-4 py-2 mb-3 ${darkMode ? 'bg-slate-900 border-slate-700 text-orange-100' : 'border-orange-200 text-orange-700'}`}
              value={emailReenvio}
              onChange={e => setEmailReenvio(e.target.value)}
              autoFocus/>
            <div className="flex justify-between mt-4">
              <button
                className={`rounded-xl px-6 py-2 font-bold transition ${darkMode ? 'bg-gray-800 text-orange-100 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => { setModalNota(null); setMensaje(''); setEmailReenvio('') }}>
                Cancelar
              </button>
              <button
                className={`rounded-xl px-6 py-2 font-bold transition ${darkMode ? 'bg-green-800 text-green-100 hover:bg-green-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
                onClick={() => handleReenviar(modalNota.id)}>
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

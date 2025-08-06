import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Url } from 'next/dist/shared/lib/router/router'

export default function AdminPanel() {
  const [email, setEmail] = useState('')
  const [modoNoche, setModoNoche] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const temaGuardado = localStorage.getItem('tema')
    if (temaGuardado) setModoNoche(temaGuardado === 'noche')

    const usuario = localStorage.getItem('usuario')
    if (usuario) {
      const user = JSON.parse(usuario)
      setEmail(user.email)
    } else {
      router.push('/login')
    }
  }, [])

  const cambiarModo = () => {
    setModoNoche(m => {
      localStorage.setItem('tema', !m ? 'noche' : 'dia')
      return !m
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('usuario')
    router.push('/')
  }

  const modulos = [
    { nombre: 'Empaques y Clamshell', ruta: '/panel/administradorRutas/empaques', icon: '📦' },
    { nombre: 'Agregar empresas', ruta: '/panel/administradorRutas/agregar-empres', icon: '🏢' },
    { nombre: 'Agregar frutas', ruta: '/panel/administradorRutas/agregar-frutas', icon: '🍓' },
    { nombre: 'Agregar agricultores', ruta: '/panel/administradorRutas/agregar-agricultores', icon: '👨‍🌾' },
    { nombre: 'Notas', ruta: '/panel/administradorRutas/notas/notas', icon: '📝' },
  ]

  const handleModuloClick = (ruta: Url) => router.push(ruta)

  const bgDay = "bg-[#f6f4f2]"
  const cardDay = "bg-[#f8f7f5] border border-orange-200"
  const headerDay = "bg-[#f2eae2] text-orange-800 border border-orange-300"
  const textDay = "text-[#1a1a1a]"
  const accentDay = "text-orange-600"
  const softShadow = "shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]"

  const bgNight = "bg-[#161616]"
  const cardNight = "bg-[#232323] border border-[#353535]"
  const headerNight = "bg-[#232323] text-orange-400 border border-orange-400"
  const textNight = "text-white"
  const accentNight = "text-orange-400"

  return (
    <div className={`${modoNoche ? bgNight : bgDay} min-h-screen ${modoNoche ? textNight : textDay} transition-colors duration-300 flex`}>

      <aside className={`flex flex-col h-screen w-[260px] md:w-[280px] ${modoNoche ? cardNight : cardDay} p-6 ${softShadow} border-r sticky top-0 z-20`}>
        <div className="flex flex-col items-center mb-8">
          <div className={`rounded-full p-3 mb-2 ${modoNoche ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
            <span className="text-3xl">🛠️</span>
          </div>
          <h2 className="text-lg font-bold mb-1 text-center">Panel del Administrador</h2>
          <span className={`text-xs ${modoNoche ? 'text-orange-200' : 'text-orange-700'}`}>{email}</span>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {modulos.map((modulo, idx) => (
            <button
              key={idx}
              onClick={() => handleModuloClick(modulo.ruta)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold transition
                ${modoNoche ? 'hover:bg-[#1e1914]' : 'hover:bg-orange-100'} ${modoNoche ? accentNight : accentDay}
              `}
            >
              <span className="text-xl">{modulo.icon}</span>
              <span>{modulo.nombre}</span>
            </button>
          ))}
        </nav>
        <div className="mt-10 flex flex-col items-center">
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-bold shadow-lg mb-3"
          >
            Cerrar sesión
          </button>
          <button
            aria-label="Cambiar modo"
            onClick={cambiarModo}
            className={`flex items-center gap-2 focus:outline-none border border-orange-400 ${modoNoche ? 'bg-[#232323]' : 'bg-orange-50'} rounded-full px-4 py-2 ${softShadow} transition hover:bg-orange-100 dark:hover:bg-orange-700/20`}
          >
            <span className={`text-xs font-semibold ${modoNoche ? 'text-orange-400' : 'text-orange-600'}`}>{modoNoche ? 'Noche' : 'Día'}</span>
            <div className="relative w-10 h-5">
              <span className={`absolute left-0 top-0 w-10 h-5 rounded-full ${modoNoche ? 'bg-orange-500/60' : 'bg-orange-200'}`}></span>
              <span
                className={`absolute z-10 top-0.5 left-1 ${modoNoche ? 'translate-x-5' : ''} transition-transform w-4 h-4 ${modoNoche ? 'bg-[#161616] border-orange-500' : 'bg-white border-orange-400'} border rounded-full shadow`}
              ></span>
            </div>
          </button>
        </div>
      </aside>

     
<main className="flex-1 p-8 flex flex-col gap-8">
  {/* Bienvenida */}
  <section>
    <h2 className="text-2xl font-bold mb-2">¡Bienvenido{email ? ',' : ''} {email}!</h2>
    <p className="text-base text-orange-500">Resumen de tu operación hoy</p>
  </section>

  {/* Tarjetas principales */}
  <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* Notas generadas hoy */}
    <div className={`rounded-2xl p-6 flex flex-col items-center ${modoNoche ? 'bg-[#232323] border border-orange-700' : 'bg-orange-50 border border-orange-200'} ${softShadow}`}>
      <span className="text-3xl mb-2">📝</span>
      <span className="text-2xl font-bold">12</span>
      <span className="text-sm text-gray-400">Notas generadas hoy</span>
    </div>
    {/* Recepciones hoy */}
    <div className={`rounded-2xl p-6 flex flex-col items-center ${modoNoche ? 'bg-[#232323] border border-orange-700' : 'bg-orange-50 border border-orange-200'} ${softShadow}`}>
      <span className="text-3xl mb-2">🍓</span>
      <span className="text-2xl font-bold">3</span>
      <span className="text-sm text-gray-400">Recepciones de fruta hoy</span>
    </div>
    {/* Alertas */}
    <div className={`rounded-2xl p-6 flex flex-col items-center ${modoNoche ? 'bg-[#232323] border border-orange-700' : 'bg-orange-50 border border-orange-200'} ${softShadow}`}>
      <span className="text-3xl mb-2">⚠️</span>
      <span className="text-2xl font-bold text-red-500">2</span>
      <span className="text-sm text-gray-400">Alertas pendientes</span>
    </div>
  </section>

  {/* Acciones recientes (no funcionales)*/}
  <section>
    <h3 className="text-xl font-semibold mb-3">Actividad reciente</h3>
    <ul className="space-y-2">
      <li className="flex items-center gap-2">
        <span className="text-lg">➕</span>
        <span>Se registró una nueva recepción de fruta (hace 5 min)</span>
      </li>
      <li className="flex items-center gap-2">
        <span className="text-lg">📝</span>
        <span>Se generó la nota #1211 (hace 12 min)</span>
      </li>
      <li className="flex items-center gap-2">
        <span className="text-lg">⚠️</span>
        <span>Carga en almacén lleva más de 2 días (hace 1 h)</span>
      </li>
    </ul>
  </section>
</main>

    </div>
  )
}

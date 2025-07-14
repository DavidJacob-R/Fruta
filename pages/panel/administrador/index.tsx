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
    //{ nombre: 'Recepción de fruta', ruta: '/panel/administradorRutas/recepcion' },
    //{ nombre: 'Control de calidad', ruta: '/panel/administradorRutas/control-calidad' },
    { nombre: 'Empaques y Clamshell', ruta: '/panel/administradorRutas/empaques' },
    //{ nombre: 'Preenfriado', ruta: '/panel/administradorRutas/preenfriado' },
    //{ nombre: 'Conservación', ruta: '/panel/administradorRutas/conservacion' },
    //{ nombre: 'Carga y exportación', ruta: '/panel/administradorRutas/carga-exportacion' },
    //{ nombre: 'Control de materiales', ruta: '/panel/administradorRutas/control-materiales' },
    //{ nombre: 'Pagos', ruta: '/panel/administradorRutas/pagos' },
    //{ nombre: 'Reportes', ruta: '/panel/administradorRutas/reportes' },
    { nombre: 'Agregar empresas', ruta: '/panel/administradorRutas/agregar-empres' },
    { nombre: 'Agregar frutas', ruta: '/panel/administradorRutas/agregar-frutas' },
    { nombre: 'Agregar agricultores', ruta: '/panel/administradorRutas/agregar-agricultores' },
    { nombre: 'Notas', ruta: '/panel/administradorRutas/notas' },
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
    <div className={`${modoNoche ? bgNight : bgDay} min-h-screen ${modoNoche ? textNight : textDay} p-6 transition-colors duration-300`}>
      {/* Toggle modo noche/día */}
      <div className="flex justify-end max-w-5xl mx-auto mb-6">
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

      {/* Encabezado */}
      <div className={`${modoNoche ? headerNight : headerDay} rounded-2xl ${softShadow} p-6 mb-6`}>
        <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Panel del Administrador</h1>
        <p className={`text-sm ${modoNoche ? 'text-orange-200' : 'text-orange-700'}`}>
          Bienvenido, <span className="font-semibold">{email}</span>
        </p>
      </div>

      {/* Grid de módulos */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {modulos.map((modulo, idx) => (
          <div
            key={idx}
            onClick={() => handleModuloClick(modulo.ruta)}
            className={`
              cursor-pointer rounded-2xl p-5 ${softShadow} border transition
              ${modoNoche
                ? `${cardNight} hover:bg-[#1e1914] hover:border-orange-400`
                : `${cardDay} hover:bg-orange-50 hover:border-orange-400`}
            `}
          >
            <h2 className={`text-lg font-bold mb-1 ${modoNoche ? accentNight : accentDay}`}>{modulo.nombre}</h2>
            <p className={`text-xs ${modoNoche ? 'text-orange-200' : 'text-orange-700'}`}>
              Accede al módulo de {modulo.nombre.toLowerCase()}.
            </p>
          </div>
        ))}
      </div>

      {/* Botón cerrar sesión */}
      <div className="mt-10 text-center">
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-bold shadow-lg"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

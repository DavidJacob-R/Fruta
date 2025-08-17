import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Url } from 'next/dist/shared/lib/router/router'

type Mod = { nombre: string, ruta: Url, clave: string }

const MODULES_DEF: Mod[] = [
  { clave: 'recepcion', nombre: 'Recepción de fruta', ruta: '/panel/Rutas/recepcion/recepcion' },
  { clave: 'control_calidad', nombre: 'Control de calidad', ruta: '/panel/Rutas/control-calidad/control-calidad' },
  { clave: 'preenfriado', nombre: 'Preenfriado', ruta: '/panel/Rutas/preenfriado/preenfriado' },
  { clave: 'conservacion', nombre: 'Conservación', ruta: '/panel/Rutas/conservacion/conservacion' },
  { clave: 'salidas', nombre: 'Salidas', ruta: '/panel/Rutas/salidas/salida' },
  { clave: 'almacen_materiales', nombre: 'Almacén de materiales', ruta: '/panel/Rutas/almacenMateriales/almacen-materiales' },
]

export default function EmpleadoPanel() {
  const [email, setEmail] = useState('')
  const [mods, setMods] = useState<Mod[]>([])
  const router = useRouter()

  useEffect(() => {
    const usuarioRaw = localStorage.getItem('usuario')
    if (!usuarioRaw) { router.push('/login'); return }
    const u = JSON.parse(usuarioRaw || '{}')
    if (!u?.email) { router.push('/login'); return }
    setEmail(u.email)

    const esAdmin = String(u?.rol || '').toLowerCase() === 'administrador' || u?.rol_id === 1 || u?.es_admin === true
    if (esAdmin) { router.replace('/panel/administrador'); return }

    const setFromClaves = (claves: string[]) => {
      const lower = new Set((claves || []).map((c)=>String(c)))
      const permitidos = MODULES_DEF.filter(m => lower.has(m.clave))
      setMods(permitidos)
    }

    if (Array.isArray(u?.permisos) && u.permisos.length) {
      setFromClaves(u.permisos)
    } else if (u?.id) {
      fetch('/api/auth/permisos/' + u.id)
        .then(r=>r.json())
        .then(j=>{
          const claves: string[] = j?.claves || []
          const nuevo = { ...u, permisos: claves }
          localStorage.setItem('usuario', JSON.stringify(nuevo))
          setFromClaves(claves)
        })
        .catch(()=>setMods([]))
    } else {
      setMods([])
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('usuario')
    router.push('/')
  }

  const handleModuloClick = (ruta: Url) => {
    router.push(ruta)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181712] via-[#24180c] to-[#242126] text-white px-2 py-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl md:max-w-4xl">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-orange-100 shadow-lg rounded-full w-20 h-20 flex items-center justify-center mb-3">
            <span className="text-4xl">🍊</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-orange-500 mb-2 drop-shadow">Panel del Empleado</h1>
          <p className="text-gray-300 text-lg">Bienvenido, <span className="font-semibold">{email}</span></p>
        </div>

        {mods.length === 0 ? (
          <div className="text-center text-gray-200 bg-black/30 border border-orange-300 rounded-2xl p-8">
            <div className="text-xl font-semibold text-orange-400 mb-2">Sin módulos asignados</div>
            <p className="text-gray-300">Pide al administrador que te habilite secciones en tu perfil.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
            {mods.map((modulo, idx) => (
              <div
                key={idx}
                onClick={() => handleModuloClick(modulo.ruta)}
                className="cursor-pointer bg-[#1c1917] border border-orange-300 hover:border-orange-500 hover:shadow-orange-200/60 transition rounded-2xl p-8 shadow-md hover:shadow-lg group active:scale-95"
                tabIndex={0}
              >
                <h2 className="text-xl font-semibold text-orange-400 mb-4 group-hover:text-orange-500 transition">{modulo.nombre}</h2>
                <p className="text-base text-gray-400 group-hover:text-gray-200 transition">Accede al módulo de <span className="lowercase">{modulo.nombre}</span>.</p>
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 via-orange-500 to-red-600 hover:from-red-600 hover:to-orange-600 text-white px-8 py-4 rounded-full font-bold shadow-xl border-none text-lg transition duration-200 active:scale-95">
            Cerrar sesión
          </button>
        </div>
      </div>
      <div className="mt-12 text-base text-gray-400 text-center">© {new Date().getFullYear()} El Molinito</div>
    </div>
  )
}

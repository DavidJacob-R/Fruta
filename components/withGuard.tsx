import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

type UsuarioLS = {
  id: number
  email: string
  nombre?: string
  rol_id?: number
  rol?: string
  es_admin?: boolean
  permisos?: string[]
  home?: string
}

const RUTAS_POR_SECCION: Record<string, string> = {
  dashboard: '/panel/empleado',
  recepcion: '/panel/Rutas/recepcion/recepcion',
  control_calidad: '/panel/Rutas/control-calidad/control-calidad',
  preenfriado: '/panel/Rutas/preenfriado/preenfriado',
  conservacion: '/panel/Rutas/conservacion/conservacion',
  salidas: '/panel/Rutas/salidas/salida',
  almacen_materiales: '/panel/Rutas/almacenMateriales/almacen-materiales',
  panel_usuarios: '/panel/administrador', // área admin
}

// orden para elegir la “primera permitida”
const PRIORIDAD: string[] = [
  'recepcion',
  'control_calidad',
  'preenfriado',
  'conservacion',
  'salidas',
  'almacen_materiales',
]

function esAdmin(u: Partial<UsuarioLS> | null | undefined): boolean {
  const rolNombre = String(u?.rol || '').toLowerCase()
  return u?.es_admin === true || u?.rol_id === 1 || rolNombre === 'administrador'
}

function primeraPermitida(claves: string[]): string | null {
  for (const k of PRIORIDAD) if (claves.includes(k)) return k
  return null
}

export default function withGuard(seccionClave: string) {
  // Nota: mantenemos el genérico del componente pero definimos Guarded como React.FC<Props>
  // para cubrir JSX.IntrinsicAttributes y evitar el error de sobrecarga.
  return function withGuardHOC<C extends React.ComponentType<any>>(Component: C) {
    type Props = React.ComponentProps<C>

    const Guarded: React.FC<Props> = (props) => {
      const router = useRouter()
      const [permitido, setPermitido] = useState<boolean>(false)
      const [cargando, setCargando] = useState<boolean>(true)

      useEffect(() => {
        const run = async () => {
          const raw = typeof window !== 'undefined' ? localStorage.getItem('usuario') : null
          if (!raw) { router.replace('/login'); return }
          const u: UsuarioLS = JSON.parse(raw)

          // Admin: acceso libre
          if (esAdmin(u)) {
            setPermitido(true)
            setCargando(false)
            return
          }

          // Si la sección es admin pero no es admin → redirigir
          if (seccionClave === 'panel_usuarios') {
            router.replace('/panel/empleado')
            return
          }

          const locales = Array.isArray(u?.permisos) ? u.permisos! : []

          // ¿ya la tiene localmente?
          if (locales.includes(seccionClave)) {
            setPermitido(true)
            setCargando(false)
            return
          }

          // si no hay permisos locales, consultarlos
          try {
            const res = await fetch('/api/auth/permisos/' + u.id)
            const j = await res.json()
            const claves: string[] = Array.isArray(j?.claves) ? j.claves : []

            // guardar de vuelta en LS para siguientes pantallas
            const nuevo = { ...u, permisos: claves }
            localStorage.setItem('usuario', JSON.stringify(nuevo))

            if (claves.includes(seccionClave)) {
              setPermitido(true)
            } else {
              const first = primeraPermitida(claves)
              if (first) {
                router.replace(RUTAS_POR_SECCION[first] || '/panel/empleado')
              } else {
                // sin permisos asignados → panel base empleado
                router.replace('/panel/empleado')
              }
            }
          } catch {
            // fallo de consulta → mejor llevar a empleado base
            router.replace('/panel/empleado')
          } finally {
            setCargando(false)
          }
        }

        run()
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])

      if (cargando) {
        // loader minimo para evitar parpadeos
        return (
          <div className="min-h-screen flex items-center justify-center bg-black/60">
            <div className="animate-pulse px-4 py-2 rounded-xl border border-gray-700 text-white">
              Cargando…
            </div>
          </div>
        )
      }

      if (!permitido) return null
      return <Component {...props} />
    }

    Guarded.displayName = `withGuard(${Component.displayName || Component.name || 'Component'})`
    return Guarded
  }
}

import { useEffect } from 'react'
import { useRouter } from 'next/router'

const RUTAS_POR_SECCION: Record<string,string> = {
  dashboard: '/panel',
  recepcion: '/panel/recepcion',
  control_calidad: '/panel/Rutas/control-calidad/control-calidad',
  embalaje: '/panel/embalaje',
  preenfriado: '/panel/preenfriado',
  conservacion: '/panel/conservacion',
  carga: '/panel/carga',
  materiales: '/panel/materiales',
  pagos: '/panel/pagos',
  reportes: '/panel/reportes',
  panel_usuarios: '/panel/usuarios'
}

const PRIORIDAD = [
  'dashboard','recepcion','control_calidad','embalaje','preenfriado',
  'conservacion','carga','materiales','pagos','reportes','panel_usuarios'
]

export default function PanelRoot() {
  const router = useRouter()
  useEffect(()=>{
    const raw = localStorage.getItem('usuario')
    if (!raw) { router.replace('/login'); return }
    const u = JSON.parse(raw)
    const esAdmin = String(u?.rol||'').toLowerCase() === 'administrador' || u?.rol_id === 1 || u?.es_admin === true
    if (esAdmin) { router.replace('/panel/administrador'); return }
    const claves: string[] = Array.isArray(u?.permisos) ? u.permisos : []
    const primera = PRIORIDAD.find(k=>claves.includes(k))
    if (primera) router.replace(RUTAS_POR_SECCION[primera]||'/panel')
    else router.replace('/login')
  },[])
  return null
}

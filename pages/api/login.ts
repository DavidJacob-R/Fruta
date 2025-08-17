import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../lib/db'
import { usuarios, roles } from '../../lib/schema'
import { eq, and } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

const RUTAS_POR_SECCION: Record<string,string> = {
  dashboard: '/panel/empleado',
  recepcion: '/panel/Rutas/recepcion/recepcion',
  control_calidad: '/panel/Rutas/control-calidad/control-calidad',
  preenfriado: '/panel/Rutas/preenfriado/preenfriado',
  conservacion: '/panel/Rutas/conservacion/conservacion',
  salidas: '/panel/Rutas/salidas/salida',
  almacen_materiales: '/panel/Rutas/almacenMateriales/almacen-materiales',
  panel_usuarios: '/panel/administrador'
}

const PRIORIDAD_HOME = [
  'recepcion','control_calidad','preenfriado','conservacion','salidas','almacen_materiales'
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Metodo no permitido' })

  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' })

  try {
    const result = await db
      .select({
        id: usuarios.id,
        email: usuarios.email,
        nombre: usuarios.nombre,
        rol_id: usuarios.rol_id,
        rol_nombre: roles.nombre
      })
      .from(usuarios)
      .innerJoin(roles, eq(usuarios.rol_id, roles.id))
      .where(and(eq(usuarios.email, email), eq(usuarios.pass, password)))

    if (!result || result.length === 0) return res.status(401).json({ success: false, error: 'Credenciales incorrectas' })

    const user = result[0]
    const esAdmin = String(user.rol_nombre || '').toLowerCase() === 'administrador' || user.rol_id === 1

    let claves: string[] = []
    if (!esAdmin) {
      const clavesRows = await db.execute(sql`
        select s.clave
        from roles_secciones rs
        join secciones s on s.id = rs.seccion_id
        where rs.rol_id = ${user.rol_id}
        union
        select s2.clave
        from usuarios_secciones us
        join secciones s2 on s2.id = us.seccion_id
        where us.usuario_id = ${user.id} and us.permitido = true
      `)
      claves = (clavesRows.rows || []).map((r: any) => r.clave)
    }

    let home = '/panel/empleado'
    if (esAdmin) {
      home = '/panel/administrador'
    } else {
      const primera = PRIORIDAD_HOME.find(k => claves.includes(k))
      home = primera ? (RUTAS_POR_SECCION[primera] || '/panel/empleado') : '/panel/empleado'
    }

    return res.status(200).json({
      success: true,
      usuario: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol_id: user.rol_id,
        rol: user.rol_nombre,
        permisos: esAdmin ? [] : claves,
        home,
        es_admin: esAdmin
      }
    })
  } catch (error) {
    console.error('Error al autenticar:', error)
    return res.status(500).json({ success: false, error: 'Error del servidor' })
  }
}

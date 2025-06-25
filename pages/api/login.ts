import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../lib/db'
import { usuarios, roles } from '../../lib/schema'
import { eq, and } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Metodo no permitido' })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' })
  }

  try {
    const result = await db
      .select({
        id: usuarios.id,
        email: usuarios.email,
        nombre: usuarios.nombre,
        rol_id: usuarios.rol_id,
        rol_nombre: roles.nombre,
      })
      .from(usuarios)
      .innerJoin(roles, eq(usuarios.rol_id, roles.id))
      .where(
        and(
          eq(usuarios.email, email),
          eq(usuarios.pass, password) // <--- campo correcto
        )
      );

    if (!result || result.length === 0) {
      return res.status(401).json({ success: false, error: 'Credenciales incorrectas' })
    }

    const user = result[0]

    return res.status(200).json({
      success: true,
      usuario: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol_id: user.rol_id,
        rol: user.rol_nombre,
      },
    })
  } catch (error) {
    console.error('Error al autenticar:', error)
    return res.status(500).json({ success: false, error: 'Error del servidor' })
  }
}

import type { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido' })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' })
  }

  try {
    const [rows]: any = await db.query(
      `SELECT u.id, u.email, u.nombre, u.rol_id, r.nombre AS rol_nombre
       FROM usuarios u
       JOIN roles r ON u.rol_id = r.id
       WHERE u.email = ? AND u.pass = ?`,
      [email, password]
    )

    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Credenciales incorrectas' })
    }

    const user = rows[0]

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

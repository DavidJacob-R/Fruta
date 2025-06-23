import type { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const desde = hoy.toISOString()

    const [rows]: any = await db.query(`
      SELECT r.codigo_caja, r.cantidad_cajas, a.nombre AS agricultor, f.nombre AS fruta
      FROM recepcion_fruta r
      JOIN agricultores a ON r.agricultor_id = a.id
      JOIN tipos_fruta f ON r.tipo_fruta_id = f.id
      WHERE r.fecha_recepcion >= ?
      ORDER BY r.fecha_recepcion DESC
    `, [desde])
    res.status(200).json({ pedidos: rows })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' })
  }
}

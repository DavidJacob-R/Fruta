import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' })
  }

  const { codigo_caja, cajas_rechazadas, motivo_rechazo_id, usuario_control_id } = req.body

  if (!codigo_caja || !motivo_rechazo_id) {
    return res.status(400).json({ success: false, message: 'Datos incompletos' })
  }

  try {
    const now = new Date()
    const localISOString = now.toLocaleString('sv-SE').replace(' ', 'T')
    const fecha_control = localISOString.slice(0, 16)

    await db.execute(
      sql`INSERT INTO control_calidad 
      (codigo_caja, cajas_rechazadas, motivo_rechazo_id, usuario_control_id, fecha_control)
      VALUES (${codigo_caja}, ${cajas_rechazadas}, ${motivo_rechazo_id}, ${usuario_control_id}, ${fecha_control})`
    )
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' })
  }
}

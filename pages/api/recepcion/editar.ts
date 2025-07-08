import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../lib/db'
import { recepcion_fruta } from '../../../lib/schema'
import { eq } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Método no permitido' })

  const { codigo_caja, agricultor_id, tipo_fruta_id, cantidad_cajas, peso_caja_oz, notas } = req.body
  try {
    await db.update(recepcion_fruta)
      .set({
        agricultor_id: Number(agricultor_id),
        tipo_fruta_id: Number(tipo_fruta_id),
        cantidad_cajas: Number(cantidad_cajas),
        peso_caja_oz: String(peso_caja_oz),
        notas: notas || null,
      })
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al editar la recepción' })
  }
}

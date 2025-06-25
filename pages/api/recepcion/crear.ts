import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../lib/db'
import { recepcion_fruta } from '../../../lib/schema'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Método no permitido' })

  const { codigo_caja, agricultor_id, tipo_fruta_id, cantidad_cajas, peso_caja_oz, fecha_recepcion, usuario_recepcion_id, notas } = req.body
  try {
    await db.insert(recepcion_fruta).values({
      codigo_caja: String(codigo_caja),
      agricultor_id: Number(agricultor_id),
      tipo_fruta_id: Number(tipo_fruta_id),
      cantidad_cajas: Number(cantidad_cajas),
      peso_caja_oz: Number(peso_caja_oz),
      fecha_recepcion: new Date(fecha_recepcion),
      usuario_recepcion_id: Number(usuario_recepcion_id),
      notas: notas ? String(notas) : null,
    })
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al registrar la recepción' })
  }
}

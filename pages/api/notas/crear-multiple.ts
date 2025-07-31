import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { recepcion_fruta, notas } from '@/lib/schema'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return res.status(405).json({ success: false })

  const { registros } = req.body
  if (!Array.isArray(registros) || registros.length === 0)
    return res.status(400).json({ success: false, message: 'Faltan registros' })

  try {
    const insertados = await db
      .insert(recepcion_fruta)
      .values(registros)
      .returning({ id: recepcion_fruta.id, usuario_recepcion_id: recepcion_fruta.usuario_recepcion_id })

    for (const inserted of insertados) {
      await db.insert(notas).values({
        titulo: 'Nota de recepción',
        contenido: '',
        modulo: 'recepcion',
        relacion_id: inserted.id,
        usuario_creacion_id: inserted.usuario_recepcion_id
      })
    }

    return res.status(200).json({ success: true })
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

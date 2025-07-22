import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { notas } from '@/lib/schema'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Método no permitido' })

  const { titulo, contenido, modulo, relacion_id, usuario_creacion_id } = req.body
  if (!contenido || !modulo || !relacion_id || !usuario_creacion_id) {
    return res.status(400).json({ success: false, message: 'Datos inválidos' })
  }

  try {
    await db
      .insert(notas)
      .values({ titulo, contenido, modulo, relacion_id, usuario_creacion_id })

    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear la nota' })
  }
}

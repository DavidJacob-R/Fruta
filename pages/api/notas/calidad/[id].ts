import { db } from '@/lib/db'
import { notas } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (!id) return res.status(400).json({ success: false, message: 'Falta id' })

  // Solo trae la nota que corresponde a ese id y que sea de módulo "calidad"
  const nota = await db.select().from(notas)
    .where(eq(notas.id, Number(id)))
    .then(res => res[0])

  if (!nota || nota.modulo !== 'calidad') {
    return res.status(404).json({ success: false, message: 'Nota de calidad no encontrada' })
  }
  res.status(200).json({ nota })
}

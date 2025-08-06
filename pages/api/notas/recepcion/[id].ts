import { db } from '@/lib/db'
import { notas, recepcion_fruta } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'Falta id' })

  const [nota] = await db.select().from(notas).where(eq(notas.id, Number(id)))
  if (!nota) return res.status(404).json({ error: 'Nota no encontrada' })

  const [frutaPrincipal] = await db
    .select()
    .from(recepcion_fruta)
    .where(eq(recepcion_fruta.id, Number(nota.relacion_id)))
  if (!frutaPrincipal) return res.status(404).json({ error: 'Recepción no encontrada' })

  if (frutaPrincipal.numero_nota == null) {
    return res.status(404).json({ error: 'La recepción no tiene número de nota' })
  }

  const frutasGrupo = await db
    .select()
    .from(recepcion_fruta)
    .where(eq(recepcion_fruta.numero_nota, frutaPrincipal.numero_nota))

  res.status(200).json({
    nota: {
      tipo_nota: frutaPrincipal.tipo_nota,
      numero_nota: frutaPrincipal.numero_nota,
      frutas: frutasGrupo
    }
  })
}

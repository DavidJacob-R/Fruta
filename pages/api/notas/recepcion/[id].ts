import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { notas, recepcion_fruta } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const notaId = Number(id)

  if (!notaId || Number.isNaN(notaId)) {
    res.status(400).json({ success: false, error: 'Falta id' })
    return
  }

  try {
    const notaRow = await db
      .select()
      .from(notas)
      .where(eq(notas.id, notaId))
      .then(r => r[0])

    if (!notaRow) {
      res.status(404).json({ success: false, error: 'Nota no encontrada' })
      return
    }

    if (!notaRow.relacion_id) {
      res.status(400).json({ success: false, error: 'La nota no tiene relacion_id' })
      return
    }

    const frutaPrincipal = await db
      .select()
      .from(recepcion_fruta)
      .where(eq(recepcion_fruta.id, Number(notaRow.relacion_id)))
      .then(r => r[0])

    if (!frutaPrincipal) {
      res.status(404).json({ success: false, error: 'Recepción no encontrada' })
      return
    }

    let frutasGrupo = [frutaPrincipal]

    if (frutaPrincipal.idempotency_key) {
      frutasGrupo = await db
        .select()
        .from(recepcion_fruta)
        .where(eq(recepcion_fruta.idempotency_key, frutaPrincipal.idempotency_key))
    }

    res.status(200).json({
      success: true,
      nota: {
        tipo_nota: 'recepcion',
        numero_nota: notaRow.id,
        frutas: frutasGrupo
      }
    })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Error del servidor' })
  }
}

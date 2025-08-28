import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/db'
import { notas, recepcion_fruta } from '@/lib/schema'
import { eq } from 'drizzle-orm'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

const BUCKET = process.env.NEXT_PUBLIC_PDFS_BUCKET || 'elmolinito'
const FOLDER = process.env.NEXT_PUBLIC_PDFS_FOLDER || 'recepciones'

async function resolverNumero(idRaw: string): Promise<number | null> {
  const idNum = Number(idRaw)
  if (!idNum || Number.isNaN(idNum)) return null

  const rByNumero = await db.select().from(recepcion_fruta).where(eq(recepcion_fruta.numero_nota as any, idNum)).limit(1)
  if (rByNumero.length) return Number(rByNumero[0].numero_nota)

  const nrow = await db.select().from(notas).where(eq(notas.id, idNum)).limit(1)
  if (nrow.length && String(nrow[0].modulo) === 'recepcion' && nrow[0].relacion_id) {
    const r = await db.select().from(recepcion_fruta).where(eq(recepcion_fruta.id, Number(nrow[0].relacion_id))).limit(1)
    if (r.length && r[0].numero_nota != null) return Number(r[0].numero_nota)
  }

  const rById = await db.select().from(recepcion_fruta).where(eq(recepcion_fruta.id, idNum)).limit(1)
  if (rById.length && rById[0].numero_nota != null) return Number(rById[0].numero_nota)

  return null
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const raw = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id
  if (!raw) {
    res.status(400).send('falta id')
    return
  }

  const numero = await resolverNumero(String(raw))
  if (!numero) {
    res.status(404).send('no se pudo resolver numero')
    return
  }

  const fileName = `nota_${numero}.pdf`
  const path = `${FOLDER}/${fileName}`

  const list = await supabase.storage.from(BUCKET).list(FOLDER, { limit: 1, search: fileName })
  if (!list.data || list.data.length === 0) {
    const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/pdf/crea-pdf`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ numero_nota: numero, fecha: new Date().toISOString().slice(0,10) })
    })
    await r.json()
  }

  const list2 = await supabase.storage.from(BUCKET).list(FOLDER, { limit: 1, search: fileName })
  if (!list2.data || list2.data.length === 0) {
    res.status(404).send('pdf no encontrado')
    return
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  res.writeHead(302, { Location: data.publicUrl })
  res.end()
}

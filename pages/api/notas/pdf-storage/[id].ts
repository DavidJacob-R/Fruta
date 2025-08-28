import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/db'
import { notas, recepcion_fruta } from '@/lib/schema'
import { eq } from 'drizzle-orm'

const BUCKET = process.env.NEXT_PUBLIC_PDFS_BUCKET || 'elmolinito'
const FOLDER = process.env.NEXT_PUBLIC_PDFS_FOLDER || 'recepciones'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

async function resolverNumero(idRaw: string): Promise<number | null> {
  const idNum = Number(idRaw)
  if (!idNum || Number.isNaN(idNum)) return null
  const byNumero = await db.select().from(recepcion_fruta).where(eq(recepcion_fruta.numero_nota as any, idNum)).limit(1)
  if (byNumero.length) return Number(byNumero[0].numero_nota)
  const nrow = await db.select().from(notas).where(eq(notas.id, idNum)).limit(1)
  if (nrow.length && String(nrow[0].modulo) === 'recepcion' && nrow[0].relacion_id) {
    const r = await db.select().from(recepcion_fruta).where(eq(recepcion_fruta.id, Number(nrow[0].relacion_id))).limit(1)
    if (r.length && r[0].numero_nota != null) return Number(r[0].numero_nota)
  }
  const byRec = await db.select().from(recepcion_fruta).where(eq(recepcion_fruta.id, idNum)).limit(1)
  if (byRec.length && byRec[0].numero_nota != null) return Number(byRec[0].numero_nota)
  return null
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const raw = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id
  if (!raw) { res.status(400).json({ url: null, error: 'falta id' }); return }
  if (!SUPABASE_URL || !SUPABASE_KEY) { res.status(500).json({ url: null, error: 'supabase no configurado' }); return }

  const numero = await resolverNumero(String(raw))
  if (!numero) { res.status(404).json({ url: null, error: 'no se pudo resolver numero_nota' }); return }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  const path = `${FOLDER}/nota_${numero}.pdf`
  const signed = await supabase.storage.from(BUCKET).createSignedUrl(path, 120)
  if (signed.error || !signed.data?.signedUrl) { res.status(404).json({ url: null, error: 'pdf no encontrado' }); return }

  res.status(200).json({ url: signed.data.signedUrl })
}

import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { notas, recepcion_fruta } from '@/lib/schema'
import { eq } from 'drizzle-orm'

const BUCKET = process.env.NEXT_PUBLIC_PDFS_BUCKET || 'elmolinito'
const FOLDER = process.env.NEXT_PUBLIC_PDFS_FOLDER || 'recepciones'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || ''

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

function publicUrl(numero: number) {
  const base = SUPABASE_URL.replace(/\/+$/,'')
  return `${base}/storage/v1/object/public/${BUCKET}/${FOLDER}/nota_${numero}.pdf`
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const raw = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id
  if (!raw) { res.status(400).send('falta id'); return }
  if (!SUPABASE_URL) { res.status(500).send('falta NEXT_PUBLIC_SUPABASE_URL'); return }

  const numero = await resolverNumero(String(raw))
  if (!numero) { res.status(404).send('no se pudo resolver numero'); return }

  const url = publicUrl(numero)
  try {
    const h1 = await fetch(url, { method: 'HEAD' })
    if (h1.ok) { res.writeHead(302, { Location: url }); res.end(); return }
    const r = await fetch(`${BASE_URL}/api/pdf/crea-pdf`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ numero_nota: numero, fecha: new Date().toISOString().slice(0,10) })
    })
    await r.json()
    const h2 = await fetch(url, { method: 'HEAD' })
    if (h2.ok) { res.writeHead(302, { Location: url }); res.end(); return }
    res.status(404).send('pdf no encontrado')
  } catch {
    res.status(500).send('error interno')
  }
}

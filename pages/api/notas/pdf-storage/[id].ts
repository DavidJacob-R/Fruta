import type { NextApiRequest, NextApiResponse } from 'next'

const BUCKET = process.env.NEXT_PUBLIC_PDFS_BUCKET || 'elmolinito'
const FOLDER = process.env.NEXT_PUBLIC_PDFS_FOLDER || 'recepciones'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

function publicUrl(numero: number) {
  const base = SUPABASE_URL.replace(/\/+$/,'')
  return `${base}/storage/v1/object/public/${BUCKET}/${FOLDER}/nota_${numero}.pdf`
}

async function resolverNumeroConDb(idNum: number) {
  const { db } = await import('@/lib/db')
  const { notas, recepcion_fruta } = await import('@/lib/schema')
  const { eq } = await import('drizzle-orm')
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
  if (!raw) { res.status(400).json({ url: null, error: 'falta id' }); return }
  if (!SUPABASE_URL) { res.status(500).json({ url: null, error: 'falta NEXT_PUBLIC_SUPABASE_URL' }); return }

  try {
    const rawNum = Number(raw)
    if (Number.isFinite(rawNum) && raw.trim() === String(rawNum)) {
      const url = publicUrl(rawNum)
      const h = await fetch(url, { method: 'HEAD' })
      if (h.ok) { res.status(200).json({ url }); return }
    }

    let numero: number | null = null
    if (Number.isFinite(Number(raw))) {
      numero = await resolverNumeroConDb(Number(raw))
    }
    if (!numero) { res.status(404).json({ url: null, error: 'no se pudo resolver numero_nota' }); return }

    const url2 = publicUrl(numero)
    const h2 = await fetch(url2, { method: 'HEAD' })
    if (!h2.ok) { res.status(404).json({ url: null, error: 'pdf no encontrado' }); return }
    res.status(200).json({ url: url2 })
  } catch (e: any) {
    console.error('pdf-storage error:', e?.message || e)
    res.status(500).json({ url: null, error: 'error interno' })
  }
}

export const config = { runtime: 'nodejs' }

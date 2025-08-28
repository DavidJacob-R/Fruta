import type { NextApiRequest, NextApiResponse } from 'next'

const BUCKET = process.env.NEXT_PUBLIC_PDFS_BUCKET || 'elmolinito'
const FOLDER = process.env.NEXT_PUBLIC_PDFS_FOLDER || 'recepciones'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

function publicUrl(numero: number) {
  const base = SUPABASE_URL.replace(/\/+$/,'')
  return `${base}/storage/v1/object/public/${BUCKET}/${FOLDER}/nota_${numero}.pdf`
}

function originFromReq(req: NextApiRequest) {
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https'
  const host = (req.headers['x-forwarded-host'] as string) || (req.headers.host as string) || ''
  return `${proto}://${host}`
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
  if (!raw) { res.status(400).send('falta id'); return }
  if (!SUPABASE_URL) { res.status(500).send('falta NEXT_PUBLIC_SUPABASE_URL'); return }

  try {
    const rawNum = Number(raw)
    if (Number.isFinite(rawNum) && raw.trim() === String(rawNum)) {
      const url = publicUrl(rawNum)
      const h = await fetch(url, { method: 'HEAD' })
      if (h.ok) { res.writeHead(302, { Location: url }); res.end(); return }
    }

    let numero: number | null = null
    if (Number.isFinite(Number(raw))) {
      numero = await resolverNumeroConDb(Number(raw))
    }
    if (!numero) { res.status(404).send('no se pudo resolver numero'); return }

    const url2 = publicUrl(numero)
    const h2 = await fetch(url2, { method: 'HEAD' })
    if (h2.ok) { res.writeHead(302, { Location: url2 }); res.end(); return }

    const origin = originFromReq(req)
    const gen = await fetch(`${origin}/api/pdf/crea-pdf`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ numero_nota: numero, fecha: new Date().toISOString().slice(0,10) })
    })
    await gen.json()

    const h3 = await fetch(url2, { method: 'HEAD' })
    if (h3.ok) { res.writeHead(302, { Location: url2 }); res.end(); return }

    res.status(404).send('pdf no encontrado')
  } catch (e: any) {
    console.error('abrir error:', e?.message || e)
    res.status(500).send('error interno')
  }
}

export const config = { runtime: 'nodejs' }

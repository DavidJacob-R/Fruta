import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const empresaId = url.searchParams.get('empresa_id') ? Number(url.searchParams.get('empresa_id')) : null
    const qRaw = (url.searchParams.get('q') || '').trim().toLowerCase()
    const limit = Math.min(500, Number(url.searchParams.get('limit') || 200))

    const conds: string[] = []
    const vals: any[] = []
    let i = 1

    if (empresaId && empresaId > 0) {
      conds.push(`empresa_id = $${i++}`)
      vals.push(empresaId)
    }
    if (qRaw) {
      conds.push(`lower(nombre) like $${i++}`)
      vals.push(`%${qRaw}%`)
    }

    const whereSql = conds.length ? `where ${conds.join(' and ')}` : ''
    const q = `
      select id, nombre, clave, rfc
      from public.agricultores_empresa
      ${whereSql}
      order by nombre asc
      limit $${i}
    `
    vals.push(limit)

    const { rows } = await pool.query(q, vals)
    const data = rows.map(r => ({
      id: Number(r.id),
      nombre: String(r.nombre || ''),
      clave: r.clave ? String(r.clave) : null,
      rfc: r.rfc ? String(r.rfc) : null
    }))
    return NextResponse.json(data, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'error' }, { status: 400 })
  }
}

import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { notas, recepcion_fruta, empresa, agricultores, tipos_fruta, usuarios } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const notaId = Number(Array.isArray(id) ? id[0] : id)
  if (!notaId || Number.isNaN(notaId)) {
    res.status(400).json({ success: false, message: 'id invalido' })
    return
  }

  try {
    const nrows = await db.select().from(notas).where(eq(notas.id, notaId)).limit(1)
    if (nrows.length === 0) {
      res.status(404).json({ success: false, message: 'nota no encontrada' })
      return
    }
    const n = nrows[0] as any
    let recepcion: any = null
    if (n.relacion_id) {
      const rrows = await db.select().from(recepcion_fruta).where(eq(recepcion_fruta.id, Number(n.relacion_id))).limit(1)
      recepcion = rrows.length ? rrows[0] : null
    }

    let empresaData: any = null
    if (recepcion?.empresa_id) {
      const e = await db.select().from(empresa).where(eq(empresa.id, recepcion.empresa_id)).limit(1)
      empresaData = e.length ? e[0] : null
    }

    let agricultorData: any = null
    if (recepcion?.agricultor_id) {
      const a = await db.select().from(agricultores).where(eq(agricultores.id, recepcion.agricultor_id)).limit(1)
      agricultorData = a.length ? a[0] : null
    }

    let frutaData: any = null
    if (recepcion?.tipo_fruta_id) {
      const f = await db.select().from(tipos_fruta).where(eq(tipos_fruta.id, recepcion.tipo_fruta_id)).limit(1)
      frutaData = f.length ? f[0] : null
    }

    let usuarioData: any = null
    if (n.usuario_creacion_id) {
      const u = await db.select().from(usuarios).where(eq(usuarios.id, n.usuario_creacion_id)).limit(1)
      usuarioData = u.length ? u[0] : null
    }

    res.status(200).json({
      success: true,
      nota: {
        ...n,
        tipo_nota: 'recepcion',
        numero_nota: recepcion?.numero_nota ?? null,
        recepcion,
        empresa: empresaData,
        agricultor: agricultorData,
        fruta: frutaData,
        usuario: usuarioData
      }
    })
  } catch {
    res.status(500).json({ success: false, message: 'error al obtener nota' })
  }
}

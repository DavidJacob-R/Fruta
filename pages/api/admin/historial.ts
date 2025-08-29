import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"

const views: Record<string,string> = {
  recepcion: "public.historial_recepcion",
  calidad: "public.historial_calidad",
  preenfriado: "public.historial_preenfriado",
  carga: "public.historial_carga"
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const modulo = typeof req.query.modulo === "string" ? req.query.modulo : "recepcion"
    const v = views[modulo] ?? views["recepcion"]
    const q = typeof req.query.q === "string" ? req.query.q.trim() : ""
    const limit = Number.parseInt(typeof req.query.limit === "string" ? req.query.limit : "100") || 100
    const offset = Number.parseInt(typeof req.query.offset === "string" ? req.query.offset : "0") || 0
    const like = `%${q}%`

    const rows = q.length > 0
      ? await db.execute(sql`
          SELECT
            id,
            to_char(timezone('America/Mexico_City', fecha_utc), 'DD/MM/YYYY HH24:MI:SS') AS fecha,
            accion,
            usuario,
            referencia,
            detalle
          FROM ${sql.raw(v)}
          WHERE usuario ILIKE ${like} OR referencia ILIKE ${like} OR detalle ILIKE ${like}
          ORDER BY fecha_utc DESC
          LIMIT ${limit} OFFSET ${offset}
        `)
      : await db.execute(sql`
          SELECT
            id,
            to_char(timezone('America/Mexico_City', fecha_utc), 'DD/MM/YYYY HH24:MI:SS') AS fecha,
            accion,
            usuario,
            referencia,
            detalle
          FROM ${sql.raw(v)}
          ORDER BY fecha_utc DESC
          LIMIT ${limit} OFFSET ${offset}
        `)

    res.status(200).json({ ok: true, items: rows.rows })
  } catch (e: any) {
    res.status(500).json({ ok: false, error: String(e?.message || e) })
  }
}

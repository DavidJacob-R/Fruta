import type { NextApiRequest } from "next"
import { db, pool } from "@/lib/db"
import { sql } from "drizzle-orm"

function pickUserId(req: NextApiRequest): number | null {
  const b: any = req?.body || {}
  const h = req?.headers?.["x-user-id"]
  const vals = [
    h, b.usuario_id, b.usuario_recepcion_id, b.usuario_control_id,
    b.usuario_medicion_id, b.usuario_creacion_id, b.usuario_carga_id,
    b.usuario_movimiento_id, b.usuario_registro_id
  ].map((v: any) => {
    const n = Number(v)
    return Number.isFinite(n) && n > 0 ? n : null
  })
  for (const v of vals) if (v != null) return v
  return null
}

export async function setDbActorFromReq(req: NextApiRequest) {
  const uid = pickUserId(req)
  await db.execute(sql`select set_config('app.usuario_id', ${uid != null ? String(uid) : null}::text, true)`)
  return uid
}

export async function setDbActorFromTx(tx: any, req: NextApiRequest) {
  const uid = pickUserId(req)
  await tx.execute(sql`select set_config('app.usuario_id', ${uid != null ? String(uid) : null}::text, true)`)
  return uid
}

export async function setDbActorPgFromReq(req: NextApiRequest) {
  const uid = pickUserId(req)
  await pool.query('select set_config($1,$2,true)', ['app.usuario_id', uid != null ? String(uid) : null])
  return uid
}

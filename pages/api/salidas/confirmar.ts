import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

function genCodigoCarga() {
  const d = new Date()
  const y = d.getFullYear().toString()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const n = Math.floor(1000 + Math.random() * 9000)
  return `CAR-${y}${m}${day}-${n}`
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ ok: false })

    const {
      pallet_ids,
      usuario_id,
      destino,
      temperatura_salida,
      observaciones,
    } = req.body || {}

    if (!Array.isArray(pallet_ids) || pallet_ids.length === 0) {
      return res.status(400).json({ ok: false, error: 'sin_pallets' })
    }

    const ids = pallet_ids.map((x: any) => Number(x)).filter((x: any) => Number.isFinite(x))
    if (ids.length === 0) return res.status(400).json({ ok: false, error: 'ids_invalidos' })

    const result = await db.transaction(async (tx) => {
      // Verificar que todos tengan una fila de conservacion abierta
      const inList = sql.join(ids.map((id) => sql`${id}`), sql`,`)
      const ver = await tx.execute(sql`
        SELECT c.pallet_id
        FROM conservacion c
        WHERE c.fecha_salida IS NULL
          AND c.pallet_id IN (${inList})
      `)
      const abiertos = new Set<number>(((ver as any).rows || []).map((r: any) => Number(r.pallet_id)))
      if (ids.some((id) => !abiertos.has(id))) {
        throw new Error('pallet_fuera_de_almacen')
      }

      // Crear carga
      const codigo = genCodigoCarga()
      const ins = await tx.execute(sql`
        INSERT INTO cargas (codigo_carga, fecha_carga, destino, temperatura_salida, usuario_carga_id, observaciones)
        VALUES (${codigo}, NOW(), ${destino || 'N/I'}, ${typeof temperatura_salida === 'number' ? temperatura_salida : null}, ${usuario_id || null}, ${observaciones || null})
        RETURNING id, codigo_carga
      `)
      const cargaId = Number((ins as any).rows[0].id)

      // Vincular pallets a la carga
      for (const id of ids) {
        await tx.execute(sql`
          INSERT INTO carga_pallets (carga_id, pallet_id)
          VALUES (${cargaId}, ${id})
        `)
      }

      // Marcar salida en conservacion y mover estado del pallet
      await tx.execute(sql`
        UPDATE conservacion
        SET fecha_salida = NOW(),
            temperatura_salida = ${typeof temperatura_salida === 'number' ? temperatura_salida : null},
            usuario_salida_id = ${usuario_id || null}
        WHERE fecha_salida IS NULL
          AND pallet_id IN (${inList})
      `)

      await tx.execute(sql`
        UPDATE pallets
        SET ubicacion_actual = 'carga'
        WHERE id IN (${inList})
      `)

      return { cargaId, codigo }
    })

    return res.status(200).json({ ok: true, carga_id: result.cargaId, codigo: result.codigo })
  } catch (e: any) {
    console.error('salidas/confirmar error:', e?.message || e)
    if (e?.message === 'pallet_fuera_de_almacen') {
      return res.status(400).json({ ok: false, error: 'pallet_fuera_de_almacen' })
    }
    return res.status(500).json({ ok: false })
  }
}

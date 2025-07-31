import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { recepcion_fruta } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Método no permitido' })

  const { id } = req.query
  const body = req.body

  if (!id) {
    return res.status(400).json({ success: false, message: 'ID requerido' })
  }

  const [prev] = await db
    .select()
    .from(recepcion_fruta)
    .where(eq(recepcion_fruta.id, Number(id)))

  if (!prev) {
    return res.status(404).json({ success: false, message: 'Registro no encontrado' })
  }

  const updateData = {
    agricultor_id: (body.agricultor_id !== undefined) ? body.agricultor_id : prev.agricultor_id,
    empresa_id: (body.empresa_id !== undefined) ? body.empresa_id : prev.empresa_id,
    tipo_fruta_id: (body.tipo_fruta_id !== undefined) ? body.tipo_fruta_id : prev.tipo_fruta_id,
    cantidad_cajas: (body.cantidad_cajas !== undefined) ? body.cantidad_cajas : prev.cantidad_cajas,
    peso_caja_oz: (body.peso_caja_oz !== undefined) ? body.peso_caja_oz : prev.peso_caja_oz,
    notas: (body.notas !== undefined) ? body.notas : prev.notas,
    empaque_id: (body.empaque_id !== undefined) ? body.empaque_id : prev.empaque_id,
    sector: (body.sector !== undefined) ? body.sector : prev.sector,
    marca: (body.marca !== undefined) ? body.marca : prev.marca,
    destino: (body.destino !== undefined) ? body.destino : prev.destino,
    tipo_produccion: (body.tipo_produccion !== undefined) ? body.tipo_produccion : prev.tipo_produccion,
    variedad: (body.variedad !== undefined) ? body.variedad : prev.variedad,
  }

  try {
    await db
      .update(recepcion_fruta)
      .set(updateData)
      .where(eq(recepcion_fruta.id, Number(id)))

    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al editar la recepcion', error })
  }
}

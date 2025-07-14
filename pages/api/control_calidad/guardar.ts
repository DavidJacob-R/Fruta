import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { control_calidad, control_calidad_motivos } from '@/lib/schema'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' })
    return
  }
  try {
    const {
      recepcion_id,
      usuario_control_id,
      cajas_aprobadas,
      cajas_rechazadas,
      notas,
      motivos
    } = req.body

    const [{ id: control_id }] = await db.insert(control_calidad).values({
      recepcion_id,
      usuario_control_id,
      cajas_aprobadas,
      cajas_rechazadas,
      notas,
      pasa_calidad: cajas_aprobadas > 0,
      fecha_control: new Date(),
    }).returning({ id: control_calidad.id });

    if (motivos && motivos.length > 0) {
      for (const motivo of motivos) {
        await db.insert(control_calidad_motivos).values({
          control_id,
          motivo_id: motivo.motivo_id,
          cantidad_cajas: motivo.cantidad_cajas,
        });
      }
    }

    res.status(200).json({ success: true, control_id });
  } catch (err: unknown) {
    let message = 'Error desconocido'
    if (err instanceof Error) {
      message = err.message
    }
    res.status(500).json({ error: 'Error guardando control de calidad', details: message });
  }
}

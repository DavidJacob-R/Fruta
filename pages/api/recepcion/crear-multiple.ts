import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { recepcion_fruta, notas } from '@/lib/schema'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' })
  }

  const { registros } = req.body

  if (!Array.isArray(registros) || registros.length === 0) {
    return res.status(400).json({ success: false, message: 'Datos inválidos o vacíos' })
  }

  try {
    const inserts = registros.map((r: any, index: number) => {
      if (
        !r.tipo_fruta_id ||
        !r.peso_caja_oz ||
        !r.fecha_recepcion ||
        !r.usuario_recepcion_id ||
        !r.numero_nota ||
        !r.empaque_id
      ) {
        throw new Error(`Faltan datos obligatorios en el registro ${index + 1}`)
      }

      return {
        agricultor_id: r.agricultor_id ?? null,
        empresa_id: r.empresa_id ? Number(r.empresa_id) : null,
        tipo_fruta_id: Number(r.tipo_fruta_id),
        cantidad_cajas: Number(r.cantidad_cajas),
        peso_caja_oz: String(r.peso_caja_oz),
        fecha_recepcion: new Date(r.fecha_recepcion),
        usuario_recepcion_id: Number(r.usuario_recepcion_id),
        notas: r.notas || '',
        numero_nota: Number(r.numero_nota),
        tipo_nota: r.tipo_nota || '',
        empaque_id: Number(r.empaque_id),
        sector: r.sector || null,
        marca: r.marca || null,
        destino: r.destino || null,
        variedad: r.variedad || null,
        tipo_produccion: r.tipo_produccion || null
      }
    })

    // Insertar todas las recepciones y obtener sus ids y usuarios
    const recepcionesCreadas = await db.insert(recepcion_fruta).values(inserts).returning({ id: recepcion_fruta.id, usuario_recepcion_id: recepcion_fruta.usuario_recepcion_id })

    // Crear notas para cada nueva recepción
    for (const rec of recepcionesCreadas) {
      await db.insert(notas).values({
        titulo: 'Nota de recepción',
        contenido: '',
        modulo: 'recepcion',
        relacion_id: rec.id,
        usuario_creacion_id: rec.usuario_recepcion_id,
      })
      await db.insert(notas).values({
        titulo: 'Nota de calidad',
        contenido: '',
        modulo: 'calidad',
        relacion_id: rec.id,
        usuario_creacion_id: rec.usuario_recepcion_id,
      })
    }

    return res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('Error al registrar múltiples frutas:', error)
    return res.status(500).json({ success: false, message: error.message || 'Error interno del servidor' })
  }
}

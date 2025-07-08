// pages/api/frutas/agregar.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { tipos_fruta } from '@/lib/schema'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' })
  }
  const { nombre, descripcion } = req.body

  if (!nombre) {
    return res.status(400).json({ success: false, message: 'Nombre de fruta requerido' })
  }

  try {
    await db.insert(tipos_fruta).values({
      nombre,
      descripcion: descripcion || '',
      activo: true
    })
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al agregar fruta' })
  }
}

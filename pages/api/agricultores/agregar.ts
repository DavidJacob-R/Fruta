import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { agricultores as agricultoresTable } from '@/lib/schema'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' })
  }
  const { nombre, apellido, empresa, telefono, email, direccion, tipo_venta } = req.body

  if (!nombre || !tipo_venta) {
    return res.status(400).json({ success: false, message: 'Falta nombre o tipo de venta' })
  }

  try {
    await db.insert(agricultoresTable).values({
      nombre,
      apellido: apellido || null,
      empresa: empresa || null,
      telefono: telefono || null,
      email: email || null,
      direccion: direccion || null,
      tipo_venta,
      activo: true
    })
    res.status(200).json({ success: true })
  } catch (error: any) {
    console.error("ERROR al guardar agricultor:", error)
    res.status(500).json({ success: false, message: 'Error al agregar agricultor', error: error.message })
  }
}

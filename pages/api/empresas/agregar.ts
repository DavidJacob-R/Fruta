import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { empresa } from '@/lib/schema'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' })
  }

  const { empresa: nombreEmpresa, telefono, email, direccion, tipo_venta } = req.body

  if (!nombreEmpresa || !tipo_venta) {
    return res.status(400).json({ success: false, message: 'Falta nombre o tipo de venta' })
  }

  try {
    await db.insert(empresa).values({
      empresa: nombreEmpresa,
      telefono: telefono || '',
      email: email || '',
      direccion: direccion || '',
      tipo_venta: tipo_venta,
      activo: true,
    })
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al agregar empresa' })
  }
}

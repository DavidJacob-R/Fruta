import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../lib/db'
import { recepcion_fruta, empresa, agricultores } from '../../../lib/schema'
import { eq, desc } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST')
    return res.status(405).json({ success: false, message: 'Método no permitido' })

  const { 
    agricultor_id, empresa_id, tipo_fruta_id, cantidad_cajas, peso_caja_oz, fecha_recepcion, usuario_recepcion_id, notas,
    tipo_nota, empaque_id
  } = req.body

  try {
    // Validación: solo debe existir el id correspondiente, y debe ser válido
    if (tipo_nota === 'empresa') {
      if (!empresa_id) return res.status(400).json({ success: false, message: 'Falta empresa_id.' })
      const empresaExiste = await db.select().from(empresa).where(eq(empresa.id, Number(empresa_id)))
      if (!empresaExiste.length) return res.status(400).json({ success: false, message: 'La empresa seleccionada no existe.' })
    }
    if (tipo_nota === 'maquila') {
      if (!agricultor_id) return res.status(400).json({ success: false, message: 'Falta agricultor_id.' })
      const agricultorExiste = await db.select().from(agricultores).where(eq(agricultores.id, Number(agricultor_id)))
      if (!agricultorExiste.length) return res.status(400).json({ success: false, message: 'El agricultor seleccionado no existe.' })
    }

    // Validación de campos numéricos requeridos
    const cajas = Number(cantidad_cajas) > 0 ? Number(cantidad_cajas) : 1
    const peso = Number(peso_caja_oz) > 0 ? Number(peso_caja_oz) : null
    if (!tipo_fruta_id || !peso || !fecha_recepcion || !usuario_recepcion_id || !tipo_nota) {
      return res.status(400).json({ success: false, message: 'Faltan datos requeridos.' })
    }

    // Calcular siguiente numero_nota
    const ultimaNota = await db
      .select({ numero_nota: recepcion_fruta.numero_nota })
      .from(recepcion_fruta)
      .orderBy(desc(recepcion_fruta.numero_nota))
      .limit(1)

    const siguienteNumero = ultimaNota.length && ultimaNota[0].numero_nota
      ? ultimaNota[0].numero_nota + 1
      : 1

    // Preparar datos a insertar
    const insertData: any = {
      tipo_fruta_id: Number(tipo_fruta_id),
      cantidad_cajas: cajas,
      peso_caja_oz: peso,
      fecha_recepcion: new Date(fecha_recepcion),
      usuario_recepcion_id: Number(usuario_recepcion_id),
      notas: typeof notas === 'string' ? notas.trim() : (notas ? JSON.stringify(notas) : ''),
      tipo_nota: String(tipo_nota),
      numero_nota: siguienteNumero,
      empaque_id: empaque_id ? Number(empaque_id) : null,
      agricultor_id: null,
      empresa_id: null,
    }

    if (tipo_nota === 'empresa') {
      insertData.empresa_id = Number(empresa_id)
      insertData.agricultor_id = null
    } else {
      insertData.agricultor_id = Number(agricultor_id)
      insertData.empresa_id = null
    }

    await db.insert(recepcion_fruta).values(insertData)

    res.status(200).json({ success: true, numero_nota: siguienteNumero })
  } catch (error: any) {
    console.error(error)
    const errorCode = error.code || error.cause?.code
    if (errorCode === '23505') {
      return res.status(400).json({ success: false, message: 'Ya existe un registro con esos datos.' })
    }
    res.status(500).json({ success: false, message: 'Error al registrar la recepción' })
  }
}

import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import {
  notas,
  recepcion_fruta,
  empresa,
  agricultores,
  tipos_fruta,
  usuarios
} from '@/lib/schema'
import { eq } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (!id) return res.status(400).json({ success: false, message: 'Falta id' })

  try {
    const notaResult = await db
      .select()
      .from(notas)
      .where(eq(notas.id, Number(id)))

    if (!notaResult || notaResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Nota no encontrada' })
    }
    const nota = notaResult[0]

    let recepcion = null
    if (nota.relacion_id) {
      const recepciones = await db
        .select({
          id: recepcion_fruta.id,
          numero_nota: recepcion_fruta.numero_nota,
          tipo_nota: recepcion_fruta.tipo_nota,
          fecha_recepcion: recepcion_fruta.fecha_recepcion,
          empresa_id: recepcion_fruta.empresa_id,
          agricultor_id: recepcion_fruta.agricultor_id,
          tipo_fruta_id: recepcion_fruta.tipo_fruta_id,
          cantidad_cajas: recepcion_fruta.cantidad_cajas,
          peso_caja_oz: recepcion_fruta.peso_caja_oz,
          empaque_id: recepcion_fruta.empaque_id,
          usuario_recepcion_id: recepcion_fruta.usuario_recepcion_id,
        })
        .from(recepcion_fruta)
        .where(eq(recepcion_fruta.id, nota.relacion_id))
      if (recepciones && recepciones.length > 0) {
        recepcion = recepciones[0]
      }
    }

    let empresaData = null, agricultorData = null, frutaData = null, usuarioData = null

    if (recepcion?.empresa_id) {
      const empresas = await db
        .select({
          id: empresa.id,
          empresa: empresa.empresa,
          email: empresa.email,
          telefono: empresa.telefono,
        })
        .from(empresa)
        .where(eq(empresa.id, recepcion.empresa_id))
      if (empresas.length) empresaData = empresas[0]
    }

    if (recepcion?.agricultor_id) {
      const agricultoresArr = await db
        .select({
          id: agricultores.id,
          nombre: agricultores.nombre,
          apellido: agricultores.apellido,
          email: agricultores.email,
          telefono: agricultores.telefono,
        })
        .from(agricultores)
        .where(eq(agricultores.id, recepcion.agricultor_id))
      if (agricultoresArr.length) agricultorData = agricultoresArr[0]
    }

    if (recepcion?.tipo_fruta_id) {
      const frutasArr = await db
        .select({ id: tipos_fruta.id, nombre: tipos_fruta.nombre })
        .from(tipos_fruta)
        .where(eq(tipos_fruta.id, recepcion.tipo_fruta_id))
      if (frutasArr.length) frutaData = frutasArr[0]
    }

    if (recepcion?.usuario_recepcion_id) {
      const usuariosArr = await db
        .select({
          id: usuarios.id,
          nombre: usuarios.nombre,
          apellido: usuarios.apellido,
          email: usuarios.email,
        })
        .from(usuarios)
        .where(eq(usuarios.id, recepcion.usuario_recepcion_id))
      if (usuariosArr.length) usuarioData = usuariosArr[0]
    }

    res.status(200).json({
      success: true,
      nota: {
        ...nota,
        recepcion,
        empresa: empresaData,
        agricultor: agricultorData,
        fruta: frutaData,
        usuario: usuarioData,
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener nota' })
  }
}

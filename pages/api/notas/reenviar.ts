import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  const { notaId, email } = req.body
  // Lógica: buscar la nota, generar PDF, enviar por correo (nodemailer, etc)
  // Placeholder:
  res.status(200).json({ success: true })
}

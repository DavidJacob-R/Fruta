import type { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const { id } = req.query
  // Buscar nota, generar PDF (usa PDFKit o similar)
  // Ejemplo: devolver un PDF estático temporal
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename=nota-${id}.pdf`)
  res.send(Buffer.from('PDF content goes here'))
}

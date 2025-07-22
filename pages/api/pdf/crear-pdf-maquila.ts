import { NextApiRequest, NextApiResponse } from 'next'
import { PDFDocument } from 'pdf-lib'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Configura tu Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Usa el Service Role KEY para permisos de escritura
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const {
    numero_nota, fecha, agricultor, fruta,
    cantidad_cajas, empaque, notas,
    recibido, firma_agricultor
  } = req.body

  // 1. Cargar la plantilla del PDF
  const pdfPath = path.resolve(process.cwd(), 'pages/api/pdf/NotaRecepcionMaquila.pdf')
  const pdfBuffer = fs.readFileSync(pdfPath)
  const pdfDoc = await PDFDocument.load(pdfBuffer)

  // 2. Modificar la página y poner los datos
  const page = pdfDoc.getPages()[0]
  page.drawText(numero_nota || '', { x: 65, y: 770, size: 12 })
  page.drawText(fecha || '', { x: 185, y: 770, size: 12 })
  page.drawText(agricultor || '', { x: 43, y: 755, size: 12 })
  page.drawText(fruta || '', { x: 43, y: 740, size: 12 })
  page.drawText(cantidad_cajas || '', { x: 80, y: 725, size: 12 })
  page.drawText(empaque || '', { x: 110, y: 710, size: 12 })
  page.drawText(notas || '', { x: 35, y: 690, size: 12 })
  page.drawText(recibido || '', { x: 105, y: 645, size: 12 })
  page.drawText(firma_agricultor || '', { x: 105, y: 630, size: 12 })

  // 3. Exporta el PDF final
  const pdfBytes = await pdfDoc.save()

  // 4. Sube el PDF a Supabase Storage (ajusta el bucket y path a tus necesidades)
  const nombreArchivo = `recepciones/maquila_${numero_nota}_${Date.now()}.pdf`
  const { data, error } = await supabase
    .storage
    .from('elmolinito') // Cambia esto por el nombre real de tu bucket
    .upload(nombreArchivo, pdfBytes, {
      contentType: 'application/pdf',
      upsert: true // Sobrescribe si ya existe
    })

  if (error) {
    return res.status(500).json({ error: 'No se pudo subir el PDF a Supabase', detalles: error })
  }

  // Opcional: Puedes devolver la URL pública o los metadatos
  return res.status(200).json({ success: true, archivo: nombreArchivo, data })
}

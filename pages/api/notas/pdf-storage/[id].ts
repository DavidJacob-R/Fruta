import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ url: null, error: 'Falta id de nota' })
  }

  const bucket = 'elmolinito' // Ajusta a tu bucket real
  const carpeta = 'recepciones'

  const { data: files, error } = await supabase.storage.from(bucket).list(carpeta, { limit: 100 })
  if (error || !files) {
    return res.status(404).json({ url: null, error: 'No se pudo listar archivos' })
  }

  const regex = new RegExp(`^nota_${id}_.+\\.pdf$`)
  const match = files.find(file => regex.test(file.name))

  if (!match) {
    return res.status(404).json({ url: null, error: 'PDF no encontrado en storage' })
  }

  const path = `${carpeta}/${match.name}`
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
  if (!urlData || !urlData.publicUrl) {
    return res.status(404).json({ url: null, error: 'No se pudo obtener la URL pública' })
  }

  return res.status(200).json({ url: urlData.publicUrl })
}

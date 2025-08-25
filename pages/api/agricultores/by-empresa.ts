import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const empresaId = Number(req.query.empresa_id)
  if (!empresaId) {
    return res.status(400).json({ error: 'empresa_id requerido' })
  }

  try {
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

    const { data, error } = await supabase
      .from('agricultores_empresa')
      .select('id, clave, nombre')
      .eq('empresa_id', empresaId)
      .order('nombre', { ascending: true })

    if (error) {
      console.error('by-empresa error:', error)
      return res.status(500).json({ error: 'Error consultando agricultores', detail: error.message })
    }

    return res.status(200).json({ agricultores: data ?? [] })
  } catch (e: any) {
    console.error('by-empresa fatal:', e)
    return res.status(500).json({ error: 'Fallo interno', detail: e?.message || String(e) })
  }
}

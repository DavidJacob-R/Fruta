import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { motivos_rechazo } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const motivos = await db.select().from(motivos_rechazo).where(eq(motivos_rechazo.activo, true));
    res.status(200).json({ motivos });
  } catch (err: unknown) {
    let message = 'Error desconocido'
    if (err instanceof Error) {
      message = err.message
    }
    res.status(500).json({ error: 'Error listando motivos', details: message });
  }
}

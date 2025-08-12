import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { temporadas } from '@/lib/schema';
import { desc, asc } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const rows = await db.select().from(temporadas).orderBy(desc(temporadas.activa), desc(temporadas.fecha_inicio), desc(temporadas.id));
    res.status(200).json({ temporadas: rows });
  } catch (e) {
    res.status(500).json({ error: 'error' });
  }
}

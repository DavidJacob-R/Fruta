import { db } from '../../../lib/db';
import { recepcion_fruta } from '../../../lib/schema';
import { desc } from 'drizzle-orm';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const rows = await db
      .select({ numero_nota: recepcion_fruta.numero_nota })
      .from(recepcion_fruta)
      .orderBy(desc(recepcion_fruta.numero_nota))
      .limit(1);

    const last = rows[0];
    const siguienteNumero = last?.numero_nota ? last.numero_nota + 1 : 1;
    res.status(200).json({ siguienteNumero });
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}

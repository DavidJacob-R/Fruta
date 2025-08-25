import type { NextApiRequest, NextApiResponse } from 'next'
import { pool } from '@/lib/db' // mismo pool que usas en otros handlers

type Row = {
  numero_nota: number | null
  fecha_recepcion: string | null
  empresa_nombre: string | null
  agricultor_nombre: string | null
  fruta_nombre: string | null
  empaque_nombre: string | null
  peso_caja_oz: number | null
  notas: string | null
}

type FrutaItem = {
  fruta_nombre: string | null
  empaque_nombre: string | null
  peso_caja_oz: number | null
  notas: string | null
}

type Nota = {
  numero_nota: number
  fecha_recepcion: string | null
  empresa_nombre: string | null
  agricultor_nombre: string | null
  agricultor_apellido: string | null
  frutas: FrutaItem[]
}

function safeISO(d: Date) {
  // Evita "Invalid Date" al convertir
  const t = d.getTime()
  if (Number.isNaN(t)) return null
  return new Date(t).toISOString()
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'metodo no permitido' })
  }

  try {
    // 1) Construir rango del día [start, end)
    const qDesde = typeof req.query.desde === 'string' ? req.query.desde : ''
    let start: Date
    if (qDesde) {
      start = new Date(qDesde)
    } else {
      start = new Date()
      start.setHours(0, 0, 0, 0)
    }
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)

    const startISO = safeISO(start)
    const endISO = safeISO(end)
    if (!startISO || !endISO) {
      return res.status(400).json({ recepciones: [], error: 'rango de fechas inválido' })
    }

    // 2) Traer filas (un row por fruta/empaque en la nota)
    const sql = `
      select
        rf.numero_nota,
        rf.fecha_recepcion,
        e.empresa            as empresa_nombre,
        ag.nombre            as agricultor_nombre,
        tf.nombre            as fruta_nombre,
        em.tamanio           as empaque_nombre,
        rf.peso_caja_oz::float8 as peso_caja_oz,
        rf.notas
      from public.recepcion_fruta rf
      left join public.empresa             e  on rf.empresa_id   = e.id
      left join public.agricultores_empresa ag on rf.agricultor_id = ag.id
      left join public.tipos_fruta         tf on rf.tipo_fruta_id = tf.id
      left join public.empaques            em on rf.empaque_id    = em.id
      where rf.fecha_recepcion >= $1
        and rf.fecha_recepcion <  $2
        and rf.numero_nota is not null
      order by rf.numero_nota asc, rf.fecha_recepcion desc
    `
    const { rows } = await pool.query<Row>(sql, [startISO, endISO])

    // 3) Agrupar con Map (sin Object.entries / reduce sobre undefined)
    const map = new Map<number, Nota>()

    for (const r of rows) {
      if (r.numero_nota == null) continue

      if (!map.has(r.numero_nota)) {
        map.set(r.numero_nota, {
          numero_nota: r.numero_nota,
          fecha_recepcion: r.fecha_recepcion ?? null,
          empresa_nombre: r.empresa_nombre ?? null,
          agricultor_nombre: r.agricultor_nombre ?? null,
          agricultor_apellido: null, // no existe en tu SQL; lo dejamos null por compatibilidad con el front
          frutas: [],
        })
      }

      const nota = map.get(r.numero_nota)!
      nota.frutas.push({
        fruta_nombre: r.fruta_nombre ?? null,
        empaque_nombre: r.empaque_nombre ?? null,
        peso_caja_oz: r.peso_caja_oz ?? null,
        notas: r.notas ?? null,
      })

      // Mantener la fecha de la fila más reciente (ya viene ordenado por fecha desc dentro de la nota)
      if (!nota.fecha_recepcion && r.fecha_recepcion) {
        nota.fecha_recepcion = r.fecha_recepcion
      }
    }

    // 4) Salida ordenada por fecha desc
    const recepciones = Array.from(map.values()).sort((a, b) => {
      const at = a.fecha_recepcion ? new Date(a.fecha_recepcion).getTime() : 0
      const bt = b.fecha_recepcion ? new Date(b.fecha_recepcion).getTime() : 0
      return bt - at
    })

    return res.status(200).json({ recepciones })
  } catch (err) {
    console.error('Error /api/recepcion/listar', err)
    return res.status(500).json({ recepciones: [], error: 'Error al obtener recepciones' })
  }
}

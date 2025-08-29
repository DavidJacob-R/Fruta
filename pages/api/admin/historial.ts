import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const modulo = typeof req.query.modulo === "string" ? req.query.modulo : "recepcion"
    const q = typeof req.query.q === "string" ? req.query.q.trim() : ""
    const limit = Number.parseInt(typeof req.query.limit === "string" ? req.query.limit : "100") || 100
    const offset = Number.parseInt(typeof req.query.offset === "string" ? req.query.offset : "0") || 0
    const like = `%${q}%`

    let query: any

    if (modulo === "recepcion") {
      query = q.length > 0
        ? sql`
            SELECT h.id,
                   h.creado_en AS fecha,
                   h.accion,
                   coalesce(u.nombre || ' ' || u.apellido,'') AS usuario,
                   concat('nota ', r.numero_nota) AS referencia,
                   concat(coalesce(e.empresa,''),' | ',coalesce(a.clave,''),' ',coalesce(a.nombre,''),' | ',coalesce(tf.nombre,''),' ',coalesce(r.cantidad_cajas,0),' cajas') AS detalle
            FROM public.historial_movimientos h
            JOIN public.recepcion_fruta r ON h.entidad = 'recepcion_fruta' AND h.registro_id = r.id
            LEFT JOIN public.usuarios u ON u.id = h.usuario_id
            LEFT JOIN public.empresa e ON e.id = r.empresa_id
            LEFT JOIN public.agricultores_empresa a ON a.id = r.agricultor_id
            LEFT JOIN public.tipos_fruta tf ON tf.id = r.tipo_fruta_id
            WHERE h.modulo = 'recepcion'
              AND (coalesce(u.nombre,'') || ' ' || coalesce(u.apellido,'') ILIKE ${like}
                   OR concat('nota ', r.numero_nota) ILIKE ${like}
                   OR concat(coalesce(e.empresa,''),' | ',coalesce(a.clave,''),' ',coalesce(a.nombre,''),' | ',coalesce(tf.nombre,''),' ',coalesce(r.cantidad_cajas,0),' cajas') ILIKE ${like})
            ORDER BY h.creado_en DESC
            LIMIT ${limit} OFFSET ${offset}
          `
        : sql`
            SELECT h.id,
                   h.creado_en AS fecha,
                   h.accion,
                   coalesce(u.nombre || ' ' || u.apellido,'') AS usuario,
                   concat('nota ', r.numero_nota) AS referencia,
                   concat(coalesce(e.empresa,''),' | ',coalesce(a.clave,''),' ',coalesce(a.nombre,''),' | ',coalesce(tf.nombre,''),' ',coalesce(r.cantidad_cajas,0),' cajas') AS detalle
            FROM public.historial_movimientos h
            JOIN public.recepcion_fruta r ON h.entidad = 'recepcion_fruta' AND h.registro_id = r.id
            LEFT JOIN public.usuarios u ON u.id = h.usuario_id
            LEFT JOIN public.empresa e ON e.id = r.empresa_id
            LEFT JOIN public.agricultores_empresa a ON a.id = r.agricultor_id
            LEFT JOIN public.tipos_fruta tf ON tf.id = r.tipo_fruta_id
            WHERE h.modulo = 'recepcion'
            ORDER BY h.creado_en DESC
            LIMIT ${limit} OFFSET ${offset}
          `
    } else if (modulo === "calidad") {
      query = q.length > 0
        ? sql`
            SELECT h.id,
                   h.creado_en AS fecha,
                   h.accion,
                   coalesce(u.nombre || ' ' || u.apellido,'') AS usuario,
                   concat('nota ', coalesce(r.numero_nota,0)) AS referencia,
                   concat('aprobadas ',coalesce(c.cajas_aprobadas,0),' | rechazadas ',coalesce(c.cajas_rechazadas,0)) AS detalle
            FROM public.historial_movimientos h
            JOIN public.control_calidad c ON h.entidad = 'control_calidad' AND h.registro_id = c.id
            LEFT JOIN public.recepcion_fruta r ON r.id = c.recepcion_id
            LEFT JOIN public.usuarios u ON u.id = h.usuario_id
            WHERE h.modulo = 'calidad'
              AND (coalesce(u.nombre,'') || ' ' || coalesce(u.apellido,'') ILIKE ${like}
                   OR concat('nota ', coalesce(r.numero_nota,0)) ILIKE ${like}
                   OR concat('aprobadas ',coalesce(c.cajas_aprobadas,0),' | rechazadas ',coalesce(c.cajas_rechazadas,0)) ILIKE ${like})
            ORDER BY h.creado_en DESC
            LIMIT ${limit} OFFSET ${offset}
          `
        : sql`
            SELECT h.id,
                   h.creado_en AS fecha,
                   h.accion,
                   coalesce(u.nombre || ' ' || u.apellido,'') AS usuario,
                   concat('nota ', coalesce(r.numero_nota,0)) AS referencia,
                   concat('aprobadas ',coalesce(c.cajas_aprobadas,0),' | rechazadas ',coalesce(c.cajas_rechazadas,0)) AS detalle
            FROM public.historial_movimientos h
            JOIN public.control_calidad c ON h.entidad = 'control_calidad' AND h.registro_id = c.id
            LEFT JOIN public.recepcion_fruta r ON r.id = c.recepcion_id
            LEFT JOIN public.usuarios u ON u.id = h.usuario_id
            WHERE h.modulo = 'calidad'
            ORDER BY h.creado_en DESC
            LIMIT ${limit} OFFSET ${offset}
          `
    } else if (modulo === "preenfriado") {
      const base = sql`
        (
          SELECT h.id,
                 h.creado_en AS fecha,
                 h.accion,
                 coalesce(u.nombre || ' ' || u.apellido,'') AS usuario,
                 concat('pallet ', coalesce(p.codigo_pallet,'')) AS referencia,
                 concat('estado ', coalesce(p.estado::text,''),' | ubicacion ',coalesce(p.ubicacion_actual,'')) AS detalle
          FROM public.historial_movimientos h
          JOIN public.pallets p ON h.entidad = 'pallets' AND h.registro_id = p.id
          LEFT JOIN public.usuarios u ON u.id = h.usuario_id
          WHERE h.modulo = 'preenfriado'
        )
        UNION ALL
        (
          SELECT h.id,
                 h.creado_en AS fecha,
                 h.accion,
                 coalesce(u.nombre || ' ' || u.apellido,'') AS usuario,
                 concat('pallet ', coalesce(p.codigo_pallet,'')) AS referencia,
                 concat('temperatura ', coalesce(t.temperatura,0)) AS detalle
          FROM public.historial_movimientos h
          JOIN public.temperaturas_preenfriado t ON h.entidad = 'temperaturas_preenfriado' AND h.registro_id = t.id
          LEFT JOIN public.pallets p ON p.id = t.pallet_id
          LEFT JOIN public.usuarios u ON u.id = h.usuario_id
          WHERE h.modulo = 'preenfriado'
        )
        UNION ALL
        (
          SELECT h.id,
                 h.creado_en AS fecha,
                 h.accion,
                 coalesce(u.nombre || ' ' || u.apellido,'') AS usuario,
                 concat('pallet ', coalesce(p.codigo_pallet,'')) AS referencia,
                 concat('conservacion ',coalesce(c.ubicacion,'')) AS detalle
          FROM public.historial_movimientos h
          JOIN public.conservacion c ON h.entidad = 'conservacion' AND h.registro_id = c.id
          LEFT JOIN public.pallets p ON p.id = c.pallet_id
          LEFT JOIN public.usuarios u ON u.id = h.usuario_id
          WHERE h.modulo = 'preenfriado'
        )
      `
      query = q.length > 0
        ? sql`
            SELECT * FROM (${base}) AS x
            WHERE usuario ILIKE ${like} OR referencia ILIKE ${like} OR detalle ILIKE ${like}
            ORDER BY fecha DESC
            LIMIT ${limit} OFFSET ${offset}
          `
        : sql`
            SELECT * FROM (${base}) AS x
            ORDER BY fecha DESC
            LIMIT ${limit} OFFSET ${offset}
          `
    } else if (modulo === "carga") {
      query = q.length > 0
        ? sql`
            SELECT h.id,
                   h.creado_en AS fecha,
                   h.accion,
                   coalesce(u.nombre || ' ' || u.apellido,'') AS usuario,
                   concat('carga ', coalesce(c.codigo_carga,'')) AS referencia,
                   concat('destino ', coalesce(c.destino,'')) AS detalle
            FROM public.historial_movimientos h
            JOIN public.cargas c ON h.entidad = 'cargas' AND h.registro_id = c.id
            LEFT JOIN public.usuarios u ON u.id = h.usuario_id
            WHERE h.modulo = 'carga'
              AND (coalesce(u.nombre,'') || ' ' || coalesce(u.apellido,'') ILIKE ${like}
                   OR concat('carga ', coalesce(c.codigo_carga,'')) ILIKE ${like}
                   OR concat('destino ', coalesce(c.destino,'')) ILIKE ${like})
            ORDER BY h.creado_en DESC
            LIMIT ${limit} OFFSET ${offset}
          `
        : sql`
            SELECT h.id,
                   h.creado_en AS fecha,
                   h.accion,
                   coalesce(u.nombre || ' ' || u.apellido,'') AS usuario,
                   concat('carga ', coalesce(c.codigo_carga,'')) AS referencia,
                   concat('destino ', coalesce(c.destino,'')) AS detalle
            FROM public.historial_movimientos h
            JOIN public.cargas c ON h.entidad = 'cargas' AND h.registro_id = c.id
            LEFT JOIN public.usuarios u ON u.id = h.usuario_id
            WHERE h.modulo = 'carga'
            ORDER BY h.creado_en DESC
            LIMIT ${limit} OFFSET ${offset}
          `
    } else {
      query = sql`SELECT 1 WHERE false`
    }

    const rows = await db.execute(query)
    res.status(200).json({ ok: true, items: rows.rows })
  } catch (e: any) {
    res.status(500).json({ ok: false, error: String(e?.message || e) })
  }
}

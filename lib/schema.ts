import {
  pgTable, serial, integer, varchar, text, decimal, timestamp, boolean, date, pgEnum, uniqueIndex 
} from 'drizzle-orm/pg-core'
// ENUMS (deben ir primero)
export const tipoVentaEnum = pgEnum('tipo_venta', ['nacional', 'exportacion']);
export const estadoEnum = pgEnum('estado', ['en_proceso', 'preenfriado', 'conservacion', 'cargado', 'cancelado']);
export const tipoMovimientoEnum = pgEnum('tipo_movimiento', ['entrada', 'salida', 'devolucion']);
export const estadoPagoEnum = pgEnum('estado_pago', ['pendiente', 'pagado', 'cancelado']);
export const moduloEnum = pgEnum('modulo', [
  'recepcion', 'calidad', 'embalaje', 'preenfriado', 'conservacion', 'carga', 'materiales', 'pagos', 'general'
]);


// Tabla de proveedores (nueva)
export const proveedores = pgTable('proveedores', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  telefono: varchar('telefono', { length: 20 }),
  email: varchar('email', { length: 100 }),
  direccion: text('direccion'),
  activo: boolean('activo').default(true),
  creado_en: timestamp('creado_en', { mode: 'date' }).defaultNow(),
});

// Tabla de roles
export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 50 }),
  descripcion: varchar('descripcion', { length: 255 }),
  creado_en: timestamp('creado_en', { mode: 'date' }).defaultNow(),
})

// Tabla de usuarios
export const usuarios = pgTable('usuarios', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }),
  pass: varchar('pass', { length: 255 }),
  nombre: varchar('nombre', { length: 100 }),
  apellido: varchar('apellido', { length: 100 }),
  rol_id: integer('rol_id').references(() => roles.id),
  activo: boolean('activo').default(true),
  creado_en: timestamp('creado_en', { mode: 'date' }).defaultNow(),
  actualizado_en: timestamp('actualizado_en', { mode: 'date' }).defaultNow(),
})

// Tabla de agricultores
export const agricultores = pgTable('agricultores', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 100 }),
  apellido: varchar('apellido', { length: 100 }),
  empresa: varchar('empresa', { length: 100 }),
  telefono: varchar('telefono', { length: 20 }),
  email: varchar('email', { length: 100 }),
  direccion: text('direccion'),
  tipo_venta: tipoVentaEnum('tipo_venta'),
  activo: boolean('activo').default(true),
  creado_en: timestamp('creado_en', { mode: 'date' }).defaultNow(),
})

// Tabla de empresa
export const empresa = pgTable('empresa', {
  id: serial('id').primaryKey(),
  empresa: varchar('empresa', { length: 100 }),
  telefono: varchar('telefono', { length: 20 }),
  email: varchar('email', { length: 100 }),
  direccion: text('direccion'),
  tipo_venta: tipoVentaEnum('tipo_venta').notNull(),
  activo: boolean('activo').default(true),
  creado_en: timestamp('creado_en', { mode: 'date' }).defaultNow(),
})

// Tipos de clamshell
export const tipos_clamshell = pgTable('tipos_clamshell', {
  id: serial('id').primaryKey(),
  tamanio: varchar('tamanio', { length: 20 }).notNull(),
  descripcion: varchar('descripcion', { length: 255 }),
  capacidad_gramos: decimal('capacidad_gramos', { precision: 10, scale: 2 }),
  activo: boolean('activo').default(true),
})

// Tipos de fruta
export const tipos_fruta = pgTable('tipos_fruta', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 50 }),
  descripcion: varchar('descripcion', { length: 255 }),
  activo: boolean('activo').default(true),
})

// Tabla de empaques
export const empaques = pgTable('empaques', {
  id: serial('id').primaryKey(),
  tamanio: varchar('tamanio', { length: 50 }),
  descripcion: varchar('descripcion', { length: 255 }),
  activo: boolean('activo').default(true),
})

// Tabla de recepción de fruta
export const tipoProduccionEnum = pgEnum('tipo_produccion', ['convencional', 'organica'])

export const recepcion_fruta = pgTable('recepcion_fruta', {
  id: serial('id').primaryKey(),
  agricultor_id: integer('agricultor_id').references(() => agricultores_empresa.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  empresa_id: integer('empresa_id').notNull().references(() => empresa.id),
  tipo_fruta_id: integer('tipo_fruta_id').notNull().references(() => tipos_fruta.id),
  cantidad_cajas: integer('cantidad_cajas').notNull(),
  peso_caja_oz: decimal('peso_caja_oz', { precision: 10, scale: 2 }).notNull(),
  fecha_recepcion: timestamp('fecha_recepcion', { mode: 'date' }).notNull(),
  usuario_recepcion_id: integer('usuario_recepcion_id').notNull().references(() => usuarios.id),
  notas: text('notas'),
  creado_en: timestamp('creado_en', { mode: 'date' }).defaultNow(),
  numero_nota: integer('numero_nota'),
  empaque_id: integer('empaque_id').references(() => empaques.id),
  temporada_id: integer('temporada_id').references(() => temporadas.id),
  sector: text('sector'),
  marca: text('marca'),
  destino: text('destino'),
  variedad: text('variedad'),
  tipo_produccion: tipoProduccionEnum('tipo_produccion'),
  idempotency_key: varchar('idempotency_key', { length: 64 })
}, (t) => ({
  recepIdemKeyIdx: uniqueIndex('recepcion_fruta_idempotency_key_idx').on(t.idempotency_key),
  recepNumNotaIdx: uniqueIndex('recepcion_fruta_numero_nota_key').on(t.numero_nota)
}))

// Motivos de rechazo
export const motivos_rechazo = pgTable('motivos_rechazo', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 100 }),
  descripcion: text('descripcion'),
  activo: boolean('activo').default(true),
})

// Control de calidad
export const control_calidad = pgTable('control_calidad', {
  id: serial('id').primaryKey(),
  recepcion_id: integer('recepcion_id').references(() => recepcion_fruta.id),
  pasa_calidad: boolean('pasa_calidad'),
  usuario_control_id: integer('usuario_control_id').references(() => usuarios.id),
  fecha_control: timestamp('fecha_control', { mode: 'date' }),
  cajas_aprobadas: integer('cajas_aprobadas'),
  cajas_rechazadas: integer('cajas_rechazadas'),
  notas: text('notas'),
  creado_en: timestamp('creado_en', { mode: 'date' }).defaultNow(),
})

// Relación control calidad - motivos rechazo
export const control_calidad_motivos = pgTable('control_calidad_motivos', {
  control_id: integer('control_id').references(() => control_calidad.id),
  motivo_id: integer('motivo_id').references(() => motivos_rechazo.id),
  cantidad_cajas: integer('cantidad_cajas'),
})

// Tipos de pallet
export const tipos_pallet = pgTable('tipos_pallet', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 50 }),
  descripcion: varchar('descripcion', { length: 255 }),
  dimensiones: varchar('dimensiones', { length: 50 }),
  capacidad_maxima_kg: decimal('capacidad_maxima_kg', { precision: 10, scale: 2 }),
  activo: boolean('activo').default(true),
})

// Pallets
export const pallets = pgTable('pallets', {
  id: serial('id').primaryKey(),
  codigo_pallet: varchar('codigo_pallet', { length: 50 }),
  tipo_pallet_id: integer('tipo_pallet_id').references(() => tipos_pallet.id),
  fecha_creacion: timestamp('fecha_creacion', { mode: 'date' }),
  usuario_creacion_id: integer('usuario_creacion_id').references(() => usuarios.id),
  ubicacion_actual: varchar('ubicacion_actual', { length: 100 }),
  estado: estadoEnum('estado').default('en_proceso'),
  notas: text('notas'),
  creado_en: timestamp('creado_en', { mode: 'date' }).defaultNow(),
})

// Pallet_cajas
export const pallet_cajas = pgTable('pallet_cajas', {
  pallet_id: integer('pallet_id').references(() => pallets.id),
  recepcion_id: integer('recepcion_id').references(() => recepcion_fruta.id),
  cantidad_cajas: integer('cantidad_cajas'),
})

// Temperaturas preenfriado
export const temperaturas_preenfriado = pgTable('temperaturas_preenfriado', {
  id: serial('id').primaryKey(),
  pallet_id: integer('pallet_id').references(() => pallets.id),
  temperatura: decimal('temperatura', { precision: 5, scale: 2 }),
  fecha_medicion: timestamp('fecha_medicion', { mode: 'date' }),
  usuario_medicion_id: integer('usuario_medicion_id').references(() => usuarios.id),
  notas: text('notas'),
})

// Conservacion
export const conservacion = pgTable('conservacion', {
  id: serial('id').primaryKey(),
  pallet_id: integer('pallet_id').references(() => pallets.id),
  fecha_entrada: timestamp('fecha_entrada', { mode: 'date' }),
  ubicacion: varchar('ubicacion', { length: 100 }),
  temperatura_entrada: decimal('temperatura_entrada', { precision: 5, scale: 2 }),
  usuario_entrada_id: integer('usuario_entrada_id').references(() => usuarios.id),
  fecha_salida: timestamp('fecha_salida', { mode: 'date' }),
  temperatura_salida: decimal('temperatura_salida', { precision: 5, scale: 2 }),
  usuario_salida_id: integer('usuario_salida_id').references(() => usuarios.id),
  notas: text('notas'),
})

// Temperaturas conservación
export const temperaturas_conservacion = pgTable('temperaturas_conservacion', {
  id: serial('id').primaryKey(),
  conservacion_id: integer('conservacion_id').references(() => conservacion.id),
  temperatura: decimal('temperatura', { precision: 5, scale: 2 }),
  fecha_medicion: timestamp('fecha_medicion', { mode: 'date' }),
  usuario_medicion_id: integer('usuario_medicion_id').references(() => usuarios.id),
  notas: text('notas'),
})

// Cargas
export const cargas = pgTable('cargas', {
  id: serial('id').primaryKey(),
  codigo_carga: varchar('codigo_carga', { length: 50 }),
  fecha_carga: timestamp('fecha_carga', { mode: 'date' }),
  destino: varchar('destino', { length: 100 }),
  temperatura_salida: decimal('temperatura_salida', { precision: 5, scale: 2 }),
  usuario_carga_id: integer('usuario_carga_id').references(() => usuarios.id),
  observaciones: text('observaciones'),
  documento_pdf_path: varchar('documento_pdf_path', { length: 255 }),
  creado_en: timestamp('creado_en', { mode: 'date' }).defaultNow(),
})

// Relación carga - pallets
export const carga_pallets = pgTable('carga_pallets', {
  carga_id: integer('carga_id').references(() => cargas.id),
  pallet_id: integer('pallet_id').references(() => pallets.id),
})

// Tipos de material
export const tipos_material = pgTable('tipos_material', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 100 }),
  descripcion: text('descripcion'),
  unidad_medida: varchar('unidad_medida', { length: 20 }),
  activo: boolean('activo').default(true),
})

// Inventario materiales
export const inventario_materiales = pgTable('inventario_materiales', {
  id: serial('id').primaryKey(),
  tipo_material_id: integer('tipo_material_id').references(() => tipos_material.id),
  cantidad_disponible: decimal('cantidad_disponible', { precision: 10, scale: 2 }),
  cantidad_minima: decimal('cantidad_minima', { precision: 10, scale: 2 }).default('0'),
  ubicacion: varchar('ubicacion', { length: 100 }),
  notas: text('notas'),
  actualizado_en: timestamp('actualizado_en', { mode: 'date' }).defaultNow(),
})

// Movimientos materiales
export const movimientos_materiales = pgTable('movimientos_materiales', {
  id: serial('id').primaryKey(),
  tipo_movimiento: tipoMovimientoEnum('tipo_movimiento'),
  tipo_material_id: integer('tipo_material_id').references(() => tipos_material.id),
  cantidad: decimal('cantidad', { precision: 10, scale: 2 }),
  agricultor_id: integer('agricultor_id').references(() => agricultores.id),
  usuario_movimiento_id: integer('usuario_movimiento_id').references(() => usuarios.id),
  notas: text('notas'),
  creado_en: timestamp('creado_en', { mode: 'date' }).defaultNow(),
  identificador: varchar('identificador', { length: 50 }),
  empresa_id: integer('empresa_id').references(() => empresa.id),
  proveedor_id: integer('proveedor_id').references(() => proveedores.id),
  fecha_movimiento: timestamp('fecha_movimiento', { mode: 'date' }).defaultNow(),
})

// Pagos a agricultores
export const pagos_agricultores = pgTable('pagos_agricultores', {
  id: serial('id').primaryKey(),
  agricultor_id: integer('agricultor_id').references(() => agricultores.id),
  fecha_inicio: date('fecha_inicio'),
  fecha_fin: date('fecha_fin'),
  total_cajas: integer('total_cajas'),
  total_pago: decimal('total_pago', { precision: 12, scale: 2 }),
  moneda: varchar('moneda', { length: 3 }).default('USD'),
  estado: estadoPagoEnum('estado_pago').default('pendiente'),
  fecha_pago: date('fecha_pago'),
  metodo_pago: varchar('metodo_pago', { length: 50 }),
  usuario_registro_id: integer('usuario_registro_id').references(() => usuarios.id),
  notas: text('notas'),
  creado_en: timestamp('creado_en', { mode: 'date' }).defaultNow(),
})

// Relación pagos - recepciones
export const pago_recepciones = pgTable('pago_recepciones', {
  pago_id: integer('pago_id').references(() => pagos_agricultores.id),
  recepcion_id: integer('recepcion_id').references(() => recepcion_fruta.id),
  precio_unitario: decimal('precio_unitario', { precision: 10, scale: 2 }),
  cantidad_cajas: integer('cantidad_cajas'),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }),
})

// Temporadas
export const temporadas = pgTable("temporadas", {
  id: serial("id").primaryKey(),
  nombre: varchar("nombre", { length: 255 }),
  fecha_inicio: date("fecha_inicio"),
  fecha_fin: date("fecha_fin"),
  notas: text("notas"),
  activa: boolean("activa").default(false)
});

export const recepcion_fruta_temporada_id = integer('temporada_id');

export const notas_temporada_id = integer('temporada_id');

export const control_calidad_temporada_id = integer('temporada_id');

// Notas
export const notas = pgTable('notas', {
  id: serial('id').primaryKey(),
  titulo: varchar('titulo', { length: 100 }),
  contenido: text('contenido'),
  modulo: moduloEnum('modulo'),
  relacion_id: integer('relacion_id'),
  usuario_creacion_id: integer('usuario_creacion_id').references(() => usuarios.id),
  creado_en: timestamp('creado_en', { mode: 'date' }).defaultNow(),
  actualizado_en: timestamp('actualizado_en', { mode: 'date' }).defaultNow(),
  pdf: varchar('pdf', { length: 255 }), 
   temporada_id: integer('temporada_id').references(() => temporadas.id),
})

// Contador de notas
export const contador_notas = pgTable('contador_notas', {
  id: serial('id').primaryKey(),
  modulo: moduloEnum('modulo'),
  contador: integer('contador').default(0),
  actualizado_en: timestamp('actualizado_en', { mode: 'date' }).defaultNow(),
})

//Tabla de agricultores por empresa

export const agricultores_empresa = pgTable('agricultores_empresa', {
  id: serial('id').primaryKey(),
  empresa_id: integer('empresa_id').notNull().references(() => empresa.id, { onDelete: 'cascade' }),
  clave: varchar('clave', { length: 16 }).notNull().unique(),
  nombre: varchar('nombre', { length: 80 }).notNull(),
  hectareas: decimal('hectareas', { precision: 10, scale: 2 }),
  sectores: varchar('sectores', { length: 80 }),
  rfc: varchar('rfc', { length: 16 }),
  ubicacion: text('ubicacion'),
});


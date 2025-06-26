import {
  mysqlTable,
  int,
  varchar,
  text,
  decimal,
  datetime,
  timestamp,
  tinyint,
  double,
  mysqlEnum,
  date
} from 'drizzle-orm/mysql-core'

// Tabla de roles
export const roles = mysqlTable('roles', {
  id: int('id').primaryKey().autoincrement(),
  nombre: varchar('nombre', { length: 50 }),
  descripcion: varchar('descripcion', { length: 255 }),
  creado_en: timestamp('creado_en').defaultNow(),
})

// Tabla de usuarios
export const usuarios = mysqlTable('usuarios', {
  id: int('id').primaryKey().autoincrement(),
  email: varchar('email', { length: 255 }),
  pass: varchar('pass', { length: 255 }),
  nombre: varchar('nombre', { length: 100 }),
  apellido: varchar('apellido', { length: 100 }),
  rol_id: int('rol_id'),
  activo: tinyint('activo').default(1),
  creado_en: timestamp('creado_en').defaultNow(),
  actualizado_en: timestamp('actualizado_en').defaultNow().onUpdateNow(),
})

// Tabla de agricultores
export const agricultores = mysqlTable('agricultores', {
  id: int('id').primaryKey().autoincrement(),
  nombre: varchar('nombre', { length: 100 }),
  apellido: varchar('apellido', { length: 100 }),
  empresa: varchar('empresa', { length: 100 }),
  telefono: varchar('telefono', { length: 20 }),
  email: varchar('email', { length: 100 }),
  direccion: text('direccion'),
  tipo_venta: mysqlEnum('tipo_venta', ['nacional', 'exportacion']),
  activo: tinyint('activo').default(1),
  creado_en: timestamp('creado_en').defaultNow(),
})

// Tabla de tipos de fruta
export const tipos_fruta = mysqlTable('tipos_fruta', {
  id: int('id').primaryKey().autoincrement(),
  nombre: varchar('nombre', { length: 50 }),
  descripcion: varchar('descripcion', { length: 255 }),
  activo: tinyint('activo').default(1),
})

// Tabla de recepción de fruta
export const recepcion_fruta = mysqlTable('recepcion_fruta', {
  id: int('id').primaryKey().autoincrement(),
  codigo_caja: varchar('codigo_caja', { length: 50 }),
  agricultor_id: int('agricultor_id'),
  tipo_fruta_id: int('tipo_fruta_id'),
  cantidad_cajas: int('cantidad_cajas'),
  peso_caja_oz: decimal('peso_caja_oz', { precision: 10, scale: 2 }), 
  fecha_recepcion: datetime('fecha_recepcion'),
  usuario_recepcion_id: int('usuario_recepcion_id'),
  notas: text('notas'),
  creado_en: timestamp('creado_en').defaultNow(),
})

// Tabla de motivos de rechazo
export const motivos_rechazo = mysqlTable('motivos_rechazo', {
  id: int('id').primaryKey().autoincrement(),
  nombre: varchar('nombre', { length: 100 }),
  descripcion: text('descripcion'),
  activo: tinyint('activo').default(1),
})

// Tabla de control de calidad
export const control_calidad = mysqlTable('control_calidad', {
  id: int('id').primaryKey().autoincrement(),
  recepcion_id: int('recepcion_id'),
  pasa_calidad: tinyint('pasa_calidad'), // BOOLEAN -> tinyint
  usuario_control_id: int('usuario_control_id'),
  fecha_control: datetime('fecha_control'),
  cajas_aprobadas: int('cajas_aprobadas'),
  cajas_rechazadas: int('cajas_rechazadas'),
  notas: text('notas'),
  creado_en: timestamp('creado_en').defaultNow(),
})

// Tabla de relación control calidad - motivos rechazo
export const control_calidad_motivos = mysqlTable('control_calidad_motivos', {
  control_id: int('control_id'),
  motivo_id: int('motivo_id'),
  cantidad_cajas: int('cantidad_cajas'),
})

// Tabla de tipos de pallet
export const tipos_pallet = mysqlTable('tipos_pallet', {
  id: int('id').primaryKey().autoincrement(),
  nombre: varchar('nombre', { length: 50 }),
  descripcion: varchar('descripcion', { length: 255 }),
  dimensiones: varchar('dimensiones', { length: 50 }),
  capacidad_maxima_kg: decimal('capacidad_maxima_kg', { precision: 10, scale: 2 }),
  activo: tinyint('activo').default(1),
})

// Tabla de pallets
export const pallets = mysqlTable('pallets', {
  id: int('id').primaryKey().autoincrement(),
  codigo_pallet: varchar('codigo_pallet', { length: 50 }),
  tipo_pallet_id: int('tipo_pallet_id'),
  fecha_creacion: datetime('fecha_creacion'),
  usuario_creacion_id: int('usuario_creacion_id'),
  ubicacion_actual: varchar('ubicacion_actual', { length: 100 }),
  estado: mysqlEnum('estado', ['en_proceso', 'preenfriado', 'conservacion', 'cargado', 'cancelado']).default('en_proceso'),
  notas: text('notas'),
  creado_en: timestamp('creado_en').defaultNow(),
})

// Tabla de relación pallets - cajas
export const pallet_cajas = mysqlTable('pallet_cajas', {
  pallet_id: int('pallet_id'),
  recepcion_id: int('recepcion_id'),
  cantidad_cajas: int('cantidad_cajas'),
})

// Tabla de temperaturas preenfriado
export const temperaturas_preenfriado = mysqlTable('temperaturas_preenfriado', {
  id: int('id').primaryKey().autoincrement(),
  pallet_id: int('pallet_id'),
  temperatura: decimal('temperatura', { precision: 5, scale: 2 }),
  fecha_medicion: datetime('fecha_medicion'),
  usuario_medicion_id: int('usuario_medicion_id'),
  notas: text('notas'),
})

// Tabla de conservación
export const conservacion = mysqlTable('conservacion', {
  id: int('id').primaryKey().autoincrement(),
  pallet_id: int('pallet_id'),
  fecha_entrada: datetime('fecha_entrada'),
  ubicacion: varchar('ubicacion', { length: 100 }),
  temperatura_entrada: decimal('temperatura_entrada', { precision: 5, scale: 2 }),
  usuario_entrada_id: int('usuario_entrada_id'),
  fecha_salida: datetime('fecha_salida'),
  temperatura_salida: decimal('temperatura_salida', { precision: 5, scale: 2 }),
  usuario_salida_id: int('usuario_salida_id'),
  notas: text('notas'),
})

// Tabla de temperaturas conservación
export const temperaturas_conservacion = mysqlTable('temperaturas_conservacion', {
  id: int('id').primaryKey().autoincrement(),
  conservacion_id: int('conservacion_id'),
  temperatura: decimal('temperatura', { precision: 5, scale: 2 }),
  fecha_medicion: datetime('fecha_medicion'),
  usuario_medicion_id: int('usuario_medicion_id'),
  notas: text('notas'),
})

// Tabla de cargas
export const cargas = mysqlTable('cargas', {
  id: int('id').primaryKey().autoincrement(),
  codigo_carga: varchar('codigo_carga', { length: 50 }),
  fecha_carga: datetime('fecha_carga'),
  destino: varchar('destino', { length: 100 }),
  temperatura_salida: decimal('temperatura_salida', { precision: 5, scale: 2 }),
  usuario_carga_id: int('usuario_carga_id'),
  observaciones: text('observaciones'),
  documento_pdf_path: varchar('documento_pdf_path', { length: 255 }),
  creado_en: timestamp('creado_en').defaultNow(),
})

// Tabla de relación cargas - pallets
export const carga_pallets = mysqlTable('carga_pallets', {
  carga_id: int('carga_id'),
  pallet_id: int('pallet_id'),
})

// Tabla de tipos de material
export const tipos_material = mysqlTable('tipos_material', {
  id: int('id').primaryKey().autoincrement(),
  nombre: varchar('nombre', { length: 100 }),
  descripcion: text('descripcion'),
  unidad_medida: varchar('unidad_medida', { length: 20 }),
  activo: tinyint('activo').default(1),
})

// Tabla de inventario de materiales
export const inventario_materiales = mysqlTable('inventario_materiales', {
  id: int('id').primaryKey().autoincrement(),
  tipo_material_id: int('tipo_material_id'),
  cantidad_disponible: decimal('cantidad_disponible', { precision: 10, scale: 2 }),
  cantidad_minima: decimal('cantidad_minima', { precision: 10, scale: 2 }).default('0'),
  ubicacion: varchar('ubicacion', { length: 100 }),
  notas: text('notas'),
  actualizado_en: timestamp('actualizado_en').defaultNow().onUpdateNow(),
})

// Tabla de movimientos de materiales
export const movimientos_materiales = mysqlTable('movimientos_materiales', {
  id: int('id').primaryKey().autoincrement(),
  tipo_movimiento: mysqlEnum('tipo_movimiento', ['entrada', 'salida', 'devolucion']),
  tipo_material_id: int('tipo_material_id'),
  cantidad: decimal('cantidad', { precision: 10, scale: 2 }),
  agricultor_id: int('agricultor_id'),
  fecha_movimiento: datetime('fecha_movimiento'),
  usuario_movimiento_id: int('usuario_movimiento_id'),
  notas: text('notas'),
  creado_en: timestamp('creado_en').defaultNow(),
})

// Tabla de pagos a agricultores
export const pagos_agricultores = mysqlTable('pagos_agricultores', {
  id: int('id').primaryKey().autoincrement(),
  agricultor_id: int('agricultor_id'),
  fecha_inicio: date('fecha_inicio'),
  fecha_fin: date('fecha_fin'),
  total_cajas: int('total_cajas'),
  total_pago: decimal('total_pago', { precision: 12, scale: 2 }),
  moneda: varchar('moneda', { length: 3 }).default('USD'),
  estado: mysqlEnum('estado', ['pendiente', 'pagado', 'cancelado']).default('pendiente'),
  fecha_pago: date('fecha_pago'),
  metodo_pago: varchar('metodo_pago', { length: 50 }),
  usuario_registro_id: int('usuario_registro_id'),
  notas: text('notas'),
  creado_en: timestamp('creado_en').defaultNow(),
})

// Tabla de relación pagos - recepciones
export const pago_recepciones = mysqlTable('pago_recepciones', {
  pago_id: int('pago_id'),
  recepcion_id: int('recepcion_id'),
  precio_unitario: decimal('precio_unitario', { precision: 10, scale: 2 }),
  cantidad_cajas: int('cantidad_cajas'),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }),
})

// Tabla de temporadas
export const temporadas = mysqlTable('temporadas', {
  id: int('id').primaryKey().autoincrement(),
  nombre: varchar('nombre', { length: 50 }),
  fecha_inicio: date('fecha_inicio'),
  fecha_fin: date('fecha_fin'),
  activa: tinyint('activa').default(0),
  notas: text('notas'),
})

// Tabla de notas
export const notas = mysqlTable('notas', {
  id: int('id').primaryKey().autoincrement(),
  titulo: varchar('titulo', { length: 100 }),
  contenido: text('contenido'),
  modulo: mysqlEnum('modulo', [
    'recepcion', 'calidad', 'embalaje', 'preenfriado', 'conservacion', 'carga', 'materiales', 'pagos', 'general'
  ]),
  relacion_id: int('relacion_id'),
  usuario_creacion_id: int('usuario_creacion_id'),
  creado_en: timestamp('creado_en').defaultNow(),
  actualizado_en: timestamp('actualizado_en').defaultNow().onUpdateNow(),
})


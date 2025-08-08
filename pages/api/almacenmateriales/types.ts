//Es un codigo de ejemplo para desarrollar las apis, no es funcional de momento solo queria aportar un poco al respecto.

export interface Empresa {
  id: number
  nombre: string
  telefono?: string
  email?: string
  direccion?: string
  tipo_venta?: 'nacional' | 'exportacion'
  activo?: boolean
}

export interface Proveedor {
  id: number
  nombre: string
  telefono?: string
  email?: string
  direccion?: string
  activo?: boolean
}

export interface Agricultor {
  id: number
  nombre: string
  apellido?: string
  empresa?: string
  telefono?: string
  email?: string
  direccion?: string
  tipo_venta?: 'nacional' | 'exportacion'
  activo?: boolean
}

export interface Material {
  id: number
  nombre: string
  cantidad: number
  unidad_medida?: string
  activo?: boolean
}

export interface MovimientoEntrada {
  tipo: 'entrada'
  empresa: Empresa | null
  proveedor: Proveedor | null
  material: Material | null
  cantidad: string | number
  fecha: string
  esComprado: boolean | null
  notas?: string
}

export interface MovimientoSalida {
  tipo: 'salida'
  empresa: Empresa | null
  agricultor: Agricultor | null
  material: Material | null
  cantidad: string | number
  fecha: string
  notas?: string
}

export interface MovimientoIntercambio {
  tipo: 'intercambio'
  empresaOrigen: Empresa | null
  empresaDestino: Empresa | null
  materialOrigen: Material | null
  materialDestino: Material | null
  cantidadOrigen: string | number
  cantidadDestino: string | number
  fecha: string
  notas?: string
}

export type MovimientoData = MovimientoEntrada | MovimientoSalida | MovimientoIntercambio
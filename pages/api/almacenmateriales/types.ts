export interface Empresa {
  id: number
  nombre: string
}

export interface Proveedor {
  id: number
  nombre: string
}

export interface Agricultor {
  id: number
  nombre: string
}

export interface Material {
  id: number
  nombre: string
  cantidad: number
}

export interface MovimientoEntrada {
  tipo: 'entrada'
  empresa: Empresa | null
  proveedor: Proveedor | null
  material: Material | null
  cantidad: string
  fecha: string
  esComprado: boolean | null
}

export interface MovimientoSalida {
  tipo: 'salida'
  empresa: Empresa | null
  agricultor: Agricultor | null
  material: Material | null
  cantidad: string
  fecha: string
}

export type MovimientoData = MovimientoEntrada | MovimientoSalida
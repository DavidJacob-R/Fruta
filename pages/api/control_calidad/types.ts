export type Pedido = {
  id: number;
  numero_nota: number;
  tipo_nota: string;
  empresa_nombre?: string;
  agricultor_nombre?: string;
  agricultor_apellido?: string;
  fruta_nombre?: string;
  empaque_nombre?: string;
  cantidad_cajas: number;
  fecha_recepcion: string;
}

export type Motivo = {
  id: number;
  nombre: string;
  descripcion: string;
}

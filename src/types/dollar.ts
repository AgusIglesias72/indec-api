// src/types/dollar.ts
export interface DollarRate {
    id?: string;
    date: string;
    buy_price: number;
    sell_price: number;
    dollar_type: DollarType;
    created_at?: string;
  }


  
  // types/dollar.ts
export type DollarType = 'BLUE' | 'CCL' | 'CRYPTO' | 'MEP' | 'MAYORISTA' | 'OFICIAL' | 'TARJETA';

export interface DollarRateData {
  updated_at: any;
  date: string;
  dollar_type: DollarType;
  dollar_name: string;
  buy_price?: number;
  sell_price: number;
  spread?: number;
  buy_variation?: number;
  sell_variation?: number;
  last_updated: string;
  minutes_ago?: number;
}
  
  // Mapeo de nombres de API a tipos internos
  export const dollarTypeMapping: Record<string, DollarType> = {
    'contadoconliqui': 'CCL',
    'bolsa': 'MEP',
    'cripto': 'CRYPTO',
    'blue': 'BLUE',
    'oficial': 'OFICIAL',
    'mayorista': 'MAYORISTA',
    'tarjeta': 'TARJETA'
  };
  
  // Tipos para la API externa
  export interface ExternalDollarRate {
    casa: string;
    compra: number;
    venta: number;
    fecha: string;
  }
  
  // Tipo para actualizar la interfaz Database de Supabase
  export interface DollarRateRow {
    id: string;
    date: string;
    dollar_type: DollarType;
    buy_price: number;
    sell_price: number;
    created_at: string;
  }
  
  export interface DollarRateInsert {
    id?: string;
    date: string;
    dollar_type: DollarType;
    buy_price: number;
    sell_price: number;
    created_at?: string;
  }
  
  export interface DollarRateUpdate {
    date?: string;
    dollar_type?: DollarType;
    buy_price?: number;
    sell_price?: number;
    created_at?: string;
  }
  
  // Actualizamos esto para que puedas añadirlo manualmente al archivo src/types/supabase.ts
  // Añade esto dentro del objeto Tables en la interfaz Database:
  /*
  dollar_rates: {
    Row: {
      id: string;
      date: string;
      dollar_type: string;
      buy_price: number;
      sell_price: number;
      created_at: string;
    }
    Insert: {
      id?: string;
      date: string;
      dollar_type: string;
      buy_price: number;
      sell_price: number;
      created_at?: string;
    }
    Update: {
      id?: string;
      date?: string;
      dollar_type?: string;
      buy_price?: number;
      sell_price?: number;
      created_at?: string;
    }
    Relationships: []
  }
  */
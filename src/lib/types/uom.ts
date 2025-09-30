// types/uom.ts

/**
 * Represents a Unit of Measure (UOM)
 */
export interface UOM {
    id: string;
    name: string;
    symbol: string;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
  }
  
  /**
   * Input for creating a new UOM
   */
  export interface CreateUOMInput {
    name: string;
    symbol: string;
  }
  
  /**
   * Input for updating an existing UOM
   */
  export interface UpdateUOMInput {
    name: string;
    symbol: string;
  }
  
  export interface CreateUOMInput {
    name: string;
    symbol: string;
  }
  
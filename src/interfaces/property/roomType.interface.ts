// Room Type related interfaces (Master data)
export interface RoomTypeCreateData {
  propertyId: string;
  name: string; // "Standard Double Room", "Deluxe Suite", etc.
  description?: string;
  basePrice: number;
  capacity: number;
  totalQuantity: number; // Total rooms of this type
  isWholeUnit?: boolean; // Default false
}

export interface RoomTypeUpdateData {
  name?: string;
  description?: string;
  basePrice?: number;
  capacity?: number;
  totalQuantity?: number;
}

// Response interfaces for RoomType
export interface RoomTypeResponse {
  id: string;
  propertyId: string;
  name: string;
  description: string | null;
  basePrice: number;
  capacity: number;
  totalQuantity: number;
  isWholeUnit: boolean;
  createdAt: Date;
  updatedAt: Date;
  rooms: {
    id: string;
    name: string | null;
    isAvailable: boolean;
    gallery: {
      id: string;
      url: string;
      alt: string | null;
    }[];
  }[]; // Include associated rooms
}

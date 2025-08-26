// Individual Room interfaces (Instances)
export interface RoomCreateData {
  roomTypeId: string; // Reference to room type
  propertyId: string; // Property reference
  name?: string; // Optional specific room name like "Room 101", "Deluxe A"
  pictures?: string[]; // Specific room pictures
}

export interface RoomUpdateData {
  name?: string;
  isAvailable?: boolean;
  pictures?: string[]; // Update room gallery
  roomTypeId?: string; // Optional: allow updating roomTypeId
}

// Response interfaces
export interface RoomResponse {
  id: string;
  name: string | null;
  roomTypeId: string;
  propertyId: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  roomType: {
    id: string;
    name: string;
    basePrice: number;
    capacity: number;
    description: string | null;
  };
  gallery: {
    id: string;
    url: string;
    alt: string | null;
  }[];
}

// Combined interface for easier frontend consumption
export interface RoomWithTypeResponse {
  // Room data
  id: string;
  name: string | null;
  isAvailable: boolean;
  // RoomType data (flattened)
  roomTypeId: string;
  roomTypeName: string;
  description: string | null;
  basePrice: number;
  capacity: number;
  totalQuantity: number;
  // Additional data
  propertyId: string;
  pictures: string[];
  createdAt: Date;
  updatedAt: Date;
}

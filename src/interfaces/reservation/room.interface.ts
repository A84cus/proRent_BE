// Room related type definitions
export interface RoomCreateData {
  propertyId: string;
  name: string;
  roomTypeName: string;
  description?: string;
  basePrice: number;
  capacity: number;
  pictures: string[];
}

export interface RoomUpdateData {
  name?: string;
  description?: string;
  basePrice?: number;
  capacity?: number;
  pictures?: string[];
}

export interface RoomResponse {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  capacity: number;
  isAvailable: boolean;
  propertyId: string;
  roomTypeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomErrorMessages {
  [key: string]: {
    message: string;
    statusCode: number;
  };
}

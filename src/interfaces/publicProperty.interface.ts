export interface PublicPropertySearchQuery {
  search?: string;
  category?: string;
  province?: string;
  city?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  maxRooms?: number;
  capacity?: number;
  sortBy: "createdAt" | "name" | "pricing" | "price" | "capacity";
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

export interface PropertySearchParams {
  search?: string;
  category?: string;
  city?: string;
  province?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  sortBy?: "name" | "price" | "createdAt" | "capacity";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface PublicPropertySearchValidationResult {
  isValid: boolean;
  query?: PublicPropertySearchQuery;
  error?: string;
}

export interface PublicPropertyIdValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PublicPropertyCalendarQuery {
  month: string;
  year: string;
}

export interface PublicPropertyCalendarValidationResult {
  isValid: boolean;
  query?: PublicPropertyCalendarQuery;
  error?: string;
}

export interface PublicPropertyRoomQuery {
  checkin?: string;
  checkout?: string;
  guests?: number;
}

export interface PublicPropertyRoomValidationResult {
  isValid: boolean;
  query?: PublicPropertyRoomQuery;
  error?: string;
}

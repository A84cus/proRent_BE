// Property interfaces for service layer data transfer
import { RateType } from "@prisma/client";

export interface CreatePropertyData {
  name: string;
  categoryId: string;
  description: string;
  mainPictureId: string;
  location: string; // address
  city: string;
  province: string;
}

export interface UpdatePropertyData {
  name?: string;
  categoryId?: string;
  description?: string;
  mainPictureId?: string;
  location?: string; // address
  city?: string;
  province?: string;
}

export interface PropertyLocationData {
  provinceId: string;
  cityId: string;
  locationId: string;
  province: string;
  city: string;
  address: string;
}

export interface PropertyFilterOptions {
  categoryId?: string;
  city?: string;
  province?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: "name" | "createdAt" | "price";
  sortOrder?: "asc" | "desc";
}

export interface PropertySearchResult {
  properties: any[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PropertyOwnershipValidation {
  isValid: boolean;
  property?: any;
  error?: string;
}

export interface PropertyCategoryValidation {
  isValid: boolean;
  category?: any;
  error?: string;
}

// Category interfaces
export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
}

// Peak Rate interfaces
export interface CreatePeakRateData {
  startDate: string;
  endDate: string;
  rateType: RateType;
  value: number;
  description?: string;
}

export interface UpdatePeakRateData {
  startDate?: string;
  endDate?: string;
  rateType?: RateType;
  value?: number;
  description?: string;
}

// Availability interfaces
export interface AvailabilityInput {
  date: string; // Format: YYYY-MM-DD
  isAvailable: boolean;
}

export interface MonthlyAvailabilityResponse {
  roomId: string;
  roomName: string;
  roomType: {
    id: string;
    name: string;
    basePrice: number;
  };
  month: string; // Format: YYYY-MM
  availabilities: {
    date: string; // Format: YYYY-MM-DD
    isAvailable: boolean;
    price?: number;
  }[];
}

// Property Search interfaces
export interface PropertySearchParams {
  keyword?: string;
  search?: string; // Alternative search parameter
  categoryId?: string;
  category?: string; // Alternative category parameter
  city?: string;
  province?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  maxRooms?: number;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "name" | "pricing" | "price" | "rating"; // Match controller validation
  sort?: "price_asc" | "price_desc" | "name_asc" | "name_desc"; // Alternative sort parameter
  sortOrder?: "asc" | "desc";
}

// Validation Result Interfaces
export interface PropertyCreateValidationResult {
  isValid: boolean;
  error?: string;
  data?: CreatePropertyData;
}

export interface PropertyUpdateValidationResult {
  isValid: boolean;
  error?: string;
  data?: UpdatePropertyData;
}

export interface PropertyIdValidationResult {
  isValid: boolean;
  error?: string;
}

// Service Layer Request Interfaces
export interface GetPropertyByIdRequest {
  id: string;
  userId: string;
}

export interface CreatePropertyRequest {
  propertyData: CreatePropertyData;
  userId: string;
}

export interface UpdatePropertyRequest {
  id: string;
  updateData: UpdatePropertyData;
  userId: string;
}

export interface DeletePropertyRequest {
  id: string;
  userId: string;
}

import { z } from "zod";

// Property validation schemas
export const propertyCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Property name is required")
    .max(200, "Property name must not exceed 200 characters"),
  categoryId: z.string().min(1, "Category ID is required"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must not exceed 2000 characters"),
  mainPictureId: z.string().min(1, "Main picture ID is required"),
  location: z
    .string()
    .min(1, "Location/address is required")
    .max(500, "Location must not exceed 500 characters"),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City name must not exceed 100 characters"),
  province: z
    .string()
    .min(1, "Province is required")
    .max(100, "Province name must not exceed 100 characters"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

export const propertyUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Property name is required")
    .max(200, "Property name must not exceed 200 characters")
    .optional(),
  categoryId: z.string().min(1, "Category ID is required").optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must not exceed 2000 characters")
    .optional(),
  mainPictureId: z.string().min(1, "Main picture ID is required").optional(),
  location: z
    .string()
    .min(1, "Location/address is required")
    .max(500, "Location must not exceed 500 characters")
    .optional(),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City name must not exceed 100 characters")
    .optional(),
  province: z
    .string()
    .min(1, "Province is required")
    .max(100, "Province name must not exceed 100 characters")
    .optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

export const propertyQuerySchema = z.object({
  page: z.number().int().min(1).default(1).optional(),
  limit: z.number().int().min(1).max(100).default(10).optional(),
  categoryId: z.string().min(1, "Category ID is required").optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  sortBy: z
    .enum(["name", "createdAt", "price"])
    .default("createdAt")
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
});

export const propertyIdSchema = z.string().min(1, "Property ID is required");

// Room validation schemas
export const roomCreateSchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  roomType: z
    .string()
    .min(1, "Room type is required")
    .max(100, "Room type must not exceed 100 characters"),
  totalRooms: z
    .number()
    .int()
    .min(1, "Total rooms must be at least 1")
    .max(1000, "Total rooms must not exceed 1000"),
  price: z.number().min(0, "Price must be non-negative"),
  description: z
    .string()
    .max(1000, "Room description must not exceed 1000 characters")
    .optional(),
});

export const roomUpdateSchema = z.object({
  roomType: z
    .string()
    .min(1, "Room type is required")
    .max(100, "Room type must not exceed 100 characters")
    .optional(),
  totalRooms: z
    .number()
    .int()
    .min(1, "Total rooms must be at least 1")
    .max(1000, "Total rooms must not exceed 1000")
    .optional(),
  price: z.number().min(0, "Price must be non-negative").optional(),
  description: z
    .string()
    .max(1000, "Room description must not exceed 1000 characters")
    .optional(),
});

// Types
export type PropertyCreateInput = z.infer<typeof propertyCreateSchema>;
export type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>;
export type PropertyQueryInput = z.infer<typeof propertyQuerySchema>;
export type RoomCreateInput = z.infer<typeof roomCreateSchema>;
export type RoomUpdateInput = z.infer<typeof roomUpdateSchema>;

// Property validation functions
export function validatePropertyOwnership(
  propertyOwnerId: string,
  currentUserId: string
): { isValid: boolean; error?: string } {
  if (propertyOwnerId !== currentUserId) {
    return {
      isValid: false,
      error: "You can only modify your own properties",
    };
  }

  return { isValid: true };
}

export function validatePropertyLocation(
  location: string,
  city: string,
  province: string
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!location || location.trim().length === 0) {
    errors.push("Location/address is required");
  }

  if (!city || city.trim().length === 0) {
    errors.push("City is required");
  }

  if (!province || province.trim().length === 0) {
    errors.push("Province is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validatePriceRange(
  minPrice?: number,
  maxPrice?: number
): { isValid: boolean; error?: string } {
  if (minPrice !== undefined && maxPrice !== undefined) {
    if (minPrice > maxPrice) {
      return {
        isValid: false,
        error: "Minimum price cannot be greater than maximum price",
      };
    }
  }

  if (minPrice !== undefined && minPrice < 0) {
    return {
      isValid: false,
      error: "Minimum price cannot be negative",
    };
  }

  if (maxPrice !== undefined && maxPrice < 0) {
    return {
      isValid: false,
      error: "Maximum price cannot be negative",
    };
  }

  return { isValid: true };
}

export function validateRoomCapacity(
  totalRooms: number,
  bookedRooms: number = 0
): { isValid: boolean; error?: string } {
  if (totalRooms < 1) {
    return {
      isValid: false,
      error: "Total rooms must be at least 1",
    };
  }

  if (bookedRooms > totalRooms) {
    return {
      isValid: false,
      error: "Booked rooms cannot exceed total rooms",
    };
  }

  return { isValid: true };
}

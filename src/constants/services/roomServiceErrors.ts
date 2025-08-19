// Room Service Error Messages Constants
export const ROOM_SERVICE_ERRORS = {
  // Property access errors
  PROPERTY_NOT_FOUND_OR_NO_PERMISSION:
    "Property not found or you don't have permission to access it",
  PROPERTY_NOT_FOUND_OR_NO_CREATE_PERMISSION:
    "Property not found or you don't have permission to create rooms for it",

  // Room access errors
  ROOM_NOT_FOUND: "Room not found",
  ROOM_NOT_FOUND_OR_NO_PERMISSION_UPDATE:
    "Room not found or you don't have permission to update it",
  ROOM_NOT_FOUND_OR_NO_PERMISSION_DELETE:
    "Room not found or you don't have permission to delete it",

  // Validation errors
  BASE_PRICE_INVALID: "Base price must be greater than 0",
  CAPACITY_INVALID: "Capacity must be greater than 0",

  // Business logic errors
  CANNOT_DELETE_ROOM_WITH_BOOKINGS: "Cannot delete room with active bookings",

  // Operation errors
  FAILED_TO_FETCH_ROOMS: "Failed to fetch rooms",
  FAILED_TO_FETCH_ROOM: "Failed to fetch room",
  FAILED_TO_CREATE_ROOM: "Failed to create room",
  FAILED_TO_UPDATE_ROOM: "Failed to update room",
  FAILED_TO_DELETE_ROOM: "Failed to delete room",
} as const;

// Type for room service error messages
export type RoomServiceError =
  (typeof ROOM_SERVICE_ERRORS)[keyof typeof ROOM_SERVICE_ERRORS];

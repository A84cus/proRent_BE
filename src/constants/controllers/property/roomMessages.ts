// Room Management Error Messages
export const ROOM_ERROR_MESSAGES = {
  // Authentication errors
  "User not authenticated": {
    message: "User authentication required",
    statusCode: 401,
  },
  "User validation failed": {
    message: "User validation failed",
    statusCode: 401,
  },

  // Property access errors
  "Property not found or you don't have permission to access it": {
    message: "Property not found or you don't have permission to access it",
    statusCode: 404,
  },
  "Property not found or you don't have permission to create rooms": {
    message: "Property not found or you don't have permission to create rooms",
    statusCode: 404,
  },

  // Room errors
  "Room not found or you don't have permission to update it": {
    message: "Room not found or you don't have permission to update it",
    statusCode: 404,
  },
  "Room not found or you don't have permission to delete it": {
    message: "Room not found or you don't have permission to delete it",
    statusCode: 404,
  },
  "Cannot delete room with existing reservations": {
    message: "Cannot delete room with existing reservations",
    statusCode: 400,
  },

  // Validation errors
  "Validation failed": {
    message: "Validation failed",
    statusCode: 400,
  },
  "No valid data provided for update": {
    message: "No valid data provided for update",
    statusCode: 400,
  },

  // Service errors
  "Failed to fetch rooms": {
    message: "Failed to fetch rooms",
    statusCode: 500,
  },
  "Failed to create room": {
    message: "Failed to create room",
    statusCode: 500,
  },
  "Failed to update room": {
    message: "Failed to update room",
    statusCode: 500,
  },
  "Failed to delete room": {
    message: "Failed to delete room",
    statusCode: 500,
  },
};

// Room Management Success Messages
export const ROOM_SUCCESS_MESSAGES = {
  // Room operations success
  ROOMS_RETRIEVED: "Rooms retrieved successfully",
  ROOM_CREATED: "Room created successfully",
  ROOM_UPDATED: "Room updated successfully",
  ROOM_DELETED: "Room deleted successfully",
  ROOM_DETAILS_RETRIEVED: "Room details retrieved successfully",
} as const;

export type RoomSuccessMessage =
  (typeof ROOM_SUCCESS_MESSAGES)[keyof typeof ROOM_SUCCESS_MESSAGES];

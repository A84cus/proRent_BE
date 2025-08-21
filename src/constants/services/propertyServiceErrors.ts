// Property Service Error Messages Constants
export const PROPERTY_SERVICE_ERRORS = {
  // Property operation errors
  FAILED_TO_FETCH_PROPERTIES: "Failed to fetch properties",
  FAILED_TO_FETCH_PROPERTY: "Failed to fetch property",
  FAILED_TO_CREATE_PROPERTY: "Failed to create property",
  FAILED_TO_UPDATE_PROPERTY: "Failed to update property",
  FAILED_TO_DELETE_PROPERTY: "Failed to delete property",

  // Category errors
  CATEGORY_NOT_FOUND: "Category not found",

  // Validation errors
  INVALID_RENTAL_TYPE:
    "Invalid rental type. Must be WHOLE_PROPERTY or ROOM_BY_ROOM",

  // Permission and access errors
  PROPERTY_NOT_FOUND_OR_NO_PERMISSION_UPDATE:
    "Property not found or you don't have permission to update it",
  PROPERTY_NOT_FOUND_OR_NO_PERMISSION_DELETE:
    "Property not found or you don't have permission to delete it",

  // Business logic errors
  CANNOT_DELETE_PROPERTY_WITH_BOOKINGS:
    "Cannot delete property with active bookings",
} as const;

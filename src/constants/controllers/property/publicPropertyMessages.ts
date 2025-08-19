// Public Property Error Messages
export const PUBLIC_PROPERTY_ERROR_MESSAGES = {
  // Validation errors
  NEGATIVE_MIN_PRICE: "Minimum price cannot be negative",
  NEGATIVE_MAX_PRICE: "Maximum price cannot be negative",
  MIN_PRICE_GREATER_THAN_MAX:
    "Minimum price cannot be greater than maximum price",
  MIN_ROOMS_TOO_LOW: "Minimum rooms must be at least 1",
  MAX_ROOMS_TOO_LOW: "Maximum rooms must be at least 1",
  MIN_ROOMS_GREATER_THAN_MAX:
    "Minimum rooms cannot be greater than maximum rooms",
  INVALID_SORT_ORDER_VALUE: "Sort order must be either 'asc' or 'desc'",
  NEGATIVE_PAGE: "Page number cannot be negative",
  NEGATIVE_LIMIT: "Limit cannot be negative",
  LIMIT_TOO_HIGH: "Limit cannot exceed 100",
  INVALID_SORT_BY: "Sort by must be one of: createdAt, name, pricing",
  INVALID_SORT_ORDER: "Sort order must be either 'asc' or 'desc'",
  INVALID_LIMIT_RANGE: "Limit must be between 1 and 100",
  PAGE_MUST_BE_AT_LEAST_ONE: "Page must be at least 1",

  // Property errors
  PROPERTY_ID_REQUIRED: "Property ID is required",
  PROPERTY_NOT_FOUND: "Property not found",

  // Date format errors
  INVALID_DATE_FORMAT: "Invalid date format. Use YYYY-MM-DD format",
  INVALID_DATE_VALUES: "Invalid date values",
  START_DATE_BEFORE_END_DATE: "Start date must be before or equal to end date",
  DATE_RANGE_LIMIT: "Date range cannot exceed 90 days",

  // General errors
  INTERNAL_SERVER_ERROR: "Internal server error",
  SEARCH_FAILED: "Failed to search properties",
  FAILED_TO_GET_PROPERTY_DETAILS: "Failed to get property details",
  FAILED_TO_GET_CALENDAR_PRICING: "Failed to get calendar pricing",
  FAILED_TO_GET_PROPERTY_ROOMS: "Failed to get property rooms",
} as const;

// Public Property Success Messages
export const PUBLIC_PROPERTY_SUCCESS_MESSAGES = {
  // Search and retrieval
  PROPERTIES_RETRIEVED: "Properties retrieved successfully",
  PROPERTY_DETAILS_RETRIEVED: "Property details retrieved successfully",
  PROPERTY_CALENDAR_PRICING_RETRIEVED:
    "Property calendar pricing retrieved successfully",
  PROPERTY_ROOMS_RETRIEVED: "Property rooms retrieved successfully",
} as const;

export type PublicPropertyErrorMessage =
  (typeof PUBLIC_PROPERTY_ERROR_MESSAGES)[keyof typeof PUBLIC_PROPERTY_ERROR_MESSAGES];

export type PublicPropertySuccessMessage =
  (typeof PUBLIC_PROPERTY_SUCCESS_MESSAGES)[keyof typeof PUBLIC_PROPERTY_SUCCESS_MESSAGES];

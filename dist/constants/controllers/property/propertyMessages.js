"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROPERTY_SUCCESS_MESSAGES = exports.PROPERTY_ERROR_MESSAGES = void 0;
// Property Management Error Messages
exports.PROPERTY_ERROR_MESSAGES = {
    // Property not found errors
    PROPERTY_NOT_FOUND: "Property not found",
    PROPERTY_ID_REQUIRED: "Property ID is required",
    PROPERTY_NOT_FOUND_OR_NO_PERMISSION: "Property not found or you don't have permission to access it",
    PROPERTY_NOT_FOUND_OR_NO_UPDATE_PERMISSION: "Property not found or you don't have permission to update it",
    PROPERTY_NOT_FOUND_OR_NO_DELETE_PERMISSION: "Property not found or you don't have permission to delete it",
    PROPERTY_NOT_FOUND_OR_NO_CREATE_PERMISSION: "Property not found or you don't have permission to create rooms",
    // Category errors
    CATEGORY_NOT_FOUND: "Category not found",
    CATEGORY_ID_REQUIRED: "Category ID is required",
    INVALID_CATEGORY: "Invalid category",
    // Property validation errors
    PROPERTY_NAME_REQUIRED: "Property name is required",
    PROPERTY_DESCRIPTION_REQUIRED: "Property description is required",
    PROPERTY_ADDRESS_REQUIRED: "Property address is required",
    INVALID_PROPERTY_TYPE: "Invalid property type",
    INVALID_PROPERTY_DATA: "Invalid property data",
    RENTAL_TYPE_INVALID: "Invalid rental type. Must be WHOLE_PROPERTY or ROOM_BY_ROOM",
    // Location errors
    INVALID_LOCATION: "Invalid location",
    COORDINATES_REQUIRED: "Coordinates are required",
    ADDRESS_VALIDATION_FAILED: "Address validation failed",
    // Amenities errors
    INVALID_AMENITIES: "Invalid amenities data",
    AMENITY_NOT_FOUND: "Amenity not found",
    // Images errors
    PROPERTY_IMAGES_REQUIRED: "Property images are required",
    INVALID_IMAGE_FORMAT: "Invalid image format",
    IMAGE_UPLOAD_FAILED: "Image upload failed",
    TOO_MANY_IMAGES: "Too many images uploaded",
    // Availability errors
    AVAILABILITY_NOT_FOUND: "Availability record not found",
    INVALID_AVAILABILITY_DATE: "Invalid availability date",
    AVAILABILITY_UPDATE_FAILED: "Failed to update availability",
    OVERLAPPING_AVAILABILITY: "Availability dates overlap",
    PAST_DATE_AVAILABILITY: "Cannot set availability for past dates",
    FAILED_TO_SET_ROOM_AVAILABILITY: "Failed to set room availability",
    FAILED_TO_GET_ROOM_AVAILABILITY: "Failed to get room availability",
    NO_PERMISSION_MANAGE_ROOM_AVAILABILITY: "You don't have permission to manage this room's availability",
    NO_PERMISSION_VIEW_ROOM_AVAILABILITY: "You don't have permission to view this room's availability",
    CANNOT_SET_UNAVAILABLE_WITH_RESERVATIONS: "Cannot set unavailable dates that have active reservations",
    AVAILABILITY_ARRAY_CANNOT_BE_EMPTY: "Availability array cannot be empty",
    AVAILABILITY_ITEM_MUST_BE_OBJECT: "Availability item must be an object",
    DATE_REQUIRED_AT_INDEX: "Date is required and must be a string (YYYY-MM-DD)",
    IS_AVAILABLE_REQUIRED_AT_INDEX: "isAvailable is required and must be a boolean",
    INVALID_DATE_FORMAT_AT_INDEX: "Invalid date format. Use YYYY-MM-DD format",
    YEAR_RANGE_VALIDATION: "Year must be between 2000 and 2100",
    MONTH_RANGE_VALIDATION: "Month must be between 01 and 12",
    // Room errors
    ROOM_NOT_FOUND: "Room not found",
    ROOM_NAME_REQUIRED: "Room name is required",
    ROOM_TYPE_REQUIRED: "Room type is required",
    INVALID_ROOM_CAPACITY: "Invalid room capacity",
    INVALID_ROOM_PRICE: "Invalid room price",
    ROOM_ALREADY_EXISTS: "Room already exists",
    // Permission errors
    UNAUTHORIZED_PROPERTY_ACCESS: "Unauthorized to access this property",
    NOT_PROPERTY_OWNER: "You are not the owner of this property",
    INSUFFICIENT_PERMISSIONS: "Insufficient permissions for this operation",
    // Operation errors
    PROPERTY_CREATION_FAILED: "Failed to create property",
    PROPERTY_UPDATE_FAILED: "Failed to update property",
    PROPERTY_DELETION_FAILED: "Failed to delete property",
    PROPERTY_IN_USE: "Property cannot be deleted as it has active bookings",
    CANNOT_DELETE_PROPERTY_WITH_ACTIVE_BOOKINGS: "Cannot delete property with active bookings",
    // Search/filter errors
    INVALID_SEARCH_CRITERIA: "Invalid search criteria",
    INVALID_FILTER_PARAMETERS: "Invalid filter parameters",
    INVALID_PAGINATION: "Invalid pagination parameters",
    INVALID_SORT_ORDER: "Invalid sort order",
    // Validation errors
    USER_VALIDATION_FAILED: "User validation failed",
    VALIDATION_FAILED: "Validation failed",
    // Category specific errors
    CATEGORY_NAME_REQUIRED: "Category name is required",
    CATEGORY_UPDATE_FIELDS_REQUIRED: "At least one field (name or description) is required",
    FAILED_TO_FETCH_CATEGORIES: "Failed to fetch categories",
    FAILED_TO_CREATE_CATEGORY: "Failed to create category",
    FAILED_TO_UPDATE_CATEGORY: "Failed to update category",
    FAILED_TO_DELETE_CATEGORY: "Failed to delete category",
    CATEGORY_NAME_ALREADY_EXISTS: "Category name already exists",
    CANNOT_DELETE_CATEGORY_IN_USE: "Cannot delete category that is being used by properties",
    CATEGORY_NAME_NON_EMPTY_STRING: "Category name must be a non-empty string",
    // Property creation errors
    DESCRIPTION_REQUIRED: "Description is required",
    MAIN_PICTURE_ID_REQUIRED: "Main picture ID is required",
    LOCATION_ADDRESS_REQUIRED: "Location address is required",
    CITY_REQUIRED: "City is required",
    PROVINCE_REQUIRED: "Province is required",
    UPDATE_FIELDS_REQUIRED: "At least one field is required for update",
    // Availability specific errors
    ROOM_ID_REQUIRED: "Room ID is required",
    AVAILABILITY_ARRAY_REQUIRED: "Availability array is required",
    MONTH_PARAMETER_REQUIRED: "Month parameter is required in YYYY-MM format",
    INVALID_MONTH_FORMAT: "Invalid month format. Use YYYY-MM format",
    // Peak rate errors
    PEAK_RATE_NOT_FOUND: "Peak rate not found",
    NO_PEAK_RATE_FOR_DATE: "No peak rate found for the specified date",
    INVALID_PEAK_RATE_DATE: "Invalid peak rate date",
    PEAK_RATE_UPDATE_FAILED: "Failed to update peak rate",
    OVERLAPPING_PEAK_RATES: "Peak rate dates overlap",
    INVALID_RATE_AMOUNT: "Invalid rate amount",
    START_DATE_REQUIRED: "Start date is required (YYYY-MM-DD format)",
    END_DATE_REQUIRED: "End date is required (YYYY-MM-DD format)",
    RATE_TYPE_REQUIRED: "Rate type is required and must be either FIXED or PERCENTAGE",
    VALUE_REQUIRED: "Value is required and must be a number",
    DATE_REQUIRED: "Date is required",
    UPDATE_PEAK_RATE_FIELDS_REQUIRED: "At least one field is required for update",
    // Date format errors
    INVALID_DATE_FORMAT: "Invalid date format. Use YYYY-MM-DD format",
    INVALID_START_DATE_FORMAT: "Invalid start date format. Use YYYY-MM-DD format",
    INVALID_END_DATE_FORMAT: "Invalid end date format. Use YYYY-MM-DD format",
    INVALID_DATE_VALUES: "Invalid date values",
    // Peak rate specific errors
    FAILED_TO_ADD_PEAK_RATE: "Failed to add peak rate",
    FAILED_TO_UPDATE_PEAK_RATE: "Failed to update peak rate",
    FAILED_TO_REMOVE_PEAK_RATE: "Failed to remove peak rate",
    UPDATED_DATE_RANGE_OVERLAP: "Updated date range would overlap with existing rate rules",
    NO_PERMISSION_MANAGE_ROOM_PRICING: "You don't have permission to manage this room's pricing",
    START_DATE_BEFORE_END_DATE: "Start date must be before end date",
    START_DATE_NOT_IN_PAST: "Start date cannot be in the past",
    RATE_VALUE_GREATER_THAN_ZERO: "Rate value must be greater than 0",
    PERCENTAGE_RATE_LIMIT: "Percentage rate cannot exceed 1000%",
    PEAK_RATE_OVERLAPS: "Peak rate overlaps with existing rate rules",
    START_DATE_STRING_FORMAT: "Start date must be a string (YYYY-MM-DD format)",
    END_DATE_STRING_FORMAT: "End date must be a string (YYYY-MM-DD format)",
    RATE_TYPE_FIXED_OR_PERCENTAGE: "Rate type must be either FIXED or PERCENTAGE",
    VALUE_MUST_BE_NUMBER: "Value must be a number",
    DESCRIPTION_MUST_BE_STRING: "Description must be a string",
    // Fetch operation errors
    FAILED_TO_FETCH_PROPERTIES: "Failed to fetch properties",
    FAILED_TO_FETCH_PROPERTY: "Failed to fetch property",
    // General errors
    INTERNAL_SERVER_ERROR: "Internal server error",
    DATABASE_ERROR: "Database operation failed",
    // Availability operation errors (new constants needed)
    CANNOT_SET_UNAVAILABLE_DATES_WITH_RESERVATIONS: "Cannot set unavailable dates that have active reservations",
    // Pagination validation errors
    PAGE_MUST_BE_AT_LEAST_ONE: "Page must be at least 1",
    // Update validation errors
    PROPERTY_NAME_MUST_BE_NON_EMPTY_STRING: "Property name must be a non-empty string",
    CATEGORY_ID_MUST_BE_STRING: "Category ID must be a string",
    DESCRIPTION_MUST_BE_NON_EMPTY_STRING: "Description must be a non-empty string",
    MAIN_PICTURE_ID_MUST_BE_STRING: "Main picture ID must be a string",
    LOCATION_MUST_BE_NON_EMPTY_STRING: "Location must be a non-empty string",
    CITY_MUST_BE_NON_EMPTY_STRING: "City must be a non-empty string",
    PROVINCE_MUST_BE_NON_EMPTY_STRING: "Province must be a non-empty string",
};
// Property Management Success Messages
exports.PROPERTY_SUCCESS_MESSAGES = {
    // Property operations success
    PROPERTY_CREATED: "Property created successfully",
    PROPERTY_UPDATED: "Property updated successfully",
    PROPERTY_DELETED: "Property deleted successfully",
    PROPERTIES_RETRIEVED: "Properties retrieved successfully",
    PROPERTY_DETAILS_RETRIEVED: "Property details retrieved successfully",
    // Availability success
    AVAILABILITY_UPDATED: "Availability updated successfully",
    ROOM_AVAILABILITY_UPDATED: "Room availability updated successfully",
    MONTHLY_AVAILABILITY_RETRIEVED: "Monthly availability retrieved successfully",
    // Peak rate success
    PEAK_RATE_CREATED: "Peak rate created successfully",
    PEAK_RATE_ADDED: "Peak rate added successfully",
    PEAK_RATE_UPDATED: "Peak rate updated successfully",
    PEAK_RATE_REMOVED: "Peak rate removed successfully. Room will revert to base price for this period.",
    // Room operations success
    ROOM_CREATED: "Room created successfully",
    ROOM_UPDATED: "Room updated successfully",
    ROOM_DELETED: "Room deleted successfully",
    // Category success
    CATEGORIES_RETRIEVED: "Categories retrieved successfully",
    CATEGORY_CREATED: "Category created successfully",
    CATEGORY_UPDATED: "Category updated successfully",
    CATEGORY_DELETED: "Category deleted successfully",
};

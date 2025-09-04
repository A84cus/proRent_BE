"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESERVATION_SUCCESS_MESSAGES = exports.RESERVATION_ERROR_MESSAGES = void 0;
// Reservation Error Messages
exports.RESERVATION_ERROR_MESSAGES = {
    // Basic validation errors
    RESERVATION_NOT_FOUND: 'Reservation not found',
    RESERVATION_ID_REQUIRED: 'Reservation ID is required',
    RESERVATION_ID_REQUIRED_URL: 'Reservation ID is required in the URL path.',
    INVALID_RESERVATION_DATA: 'Invalid reservation data',
    USER_ID_REQUIRED: 'User ID is required',
    PROPERTY_ID_REQUIRED: 'Property ID is required',
    PROPERTY_OWNER_ID_REQUIRED: 'Property owner ID is required',
    // Authentication and authorization
    AUTH_REQUIRED: 'Authentication required.',
    INVALID_INPUT_DATA: 'Invalid input data.',
    // Processing errors
    FAILED_TO_PROCESS_EXPIRED: 'Failed to process expired reservations.',
    CREATE_RESERVATION_ERROR: 'An unexpected error occurred while creating the reservation.',
    UNEXPECTED_ERROR_PROCESSING_EXPIRED: 'An unexpected error occurred while processing expired reservations.',
    // Date/time errors
    INVALID_DATE_RANGE: 'Invalid date range',
    CHECK_IN_REQUIRED: 'Check-in date is required',
    CHECK_OUT_REQUIRED: 'Check-out date is required',
    PAST_DATE_NOT_ALLOWED: 'Past dates are not allowed',
    INVALID_DATE_FORMAT: 'Invalid date format',
    CHECK_OUT_BEFORE_CHECK_IN: 'Check-out date must be after check-in date',
    MINIMUM_STAY_REQUIRED: 'Minimum stay requirement not met',
    MAXIMUM_STAY_EXCEEDED: 'Maximum stay limit exceeded',
    // Availability errors
    ROOM_NOT_AVAILABLE: 'Room is not available for selected dates',
    PROPERTY_NOT_AVAILABLE: 'Property is not available',
    DATES_ALREADY_BOOKED: 'Selected dates are already booked',
    OVERLAPPING_RESERVATION: 'Reservation dates overlap with existing booking',
    // Status errors
    INVALID_STATUS: 'Invalid reservation status',
    CANNOT_CANCEL_CONFIRMED: 'Cannot cancel confirmed reservation',
    CANNOT_MODIFY_COMPLETED: 'Cannot modify completed reservation',
    ALREADY_CANCELLED: 'Reservation is already cancelled',
    PAYMENT_REQUIRED: 'Payment is required to confirm reservation',
    // Permission errors
    UNAUTHORIZED_ACCESS: 'Unauthorized to access this reservation',
    NOT_RESERVATION_OWNER: 'You are not the owner of this reservation',
    NOT_PROPERTY_OWNER: 'You are not the owner of this property',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions for this operation',
    // Payment errors
    PAYMENT_FAILED: 'Payment processing failed',
    PAYMENT_NOT_FOUND: 'Payment record not found',
    INVALID_PAYMENT_METHOD: 'Invalid payment method',
    PAYMENT_ALREADY_PROCESSED: 'Payment has already been processed',
    REFUND_FAILED: 'Refund processing failed',
    INVALID_AMOUNT: 'Invalid payment amount',
    // Guest information errors
    GUEST_INFO_REQUIRED: 'Guest information is required',
    INVALID_GUEST_COUNT: 'Invalid number of guests',
    GUEST_LIMIT_EXCEEDED: 'Guest limit exceeded for this room',
    CONTACT_INFO_REQUIRED: 'Contact information is required',
    // Document/proof errors
    PAYMENT_PROOF_REQUIRED: 'Payment proof is required',
    NO_FILE_UPLOADED: 'No file uploaded. Please provide a payment proof image.',
    INVALID_PAYMENT_PROOF: 'Invalid payment proof format',
    PAYMENT_PROOF_UPLOAD_FAILED: 'Payment proof upload failed',
    PAYMENT_PROOF_UPLOAD_ERROR: 'An unexpected error occurred while uploading the payment proof.',
    DOCUMENT_VERIFICATION_FAILED: 'Document verification failed',
    // Query/filter errors
    INVALID_FILTER_PARAMETERS: 'Invalid filter parameters',
    INVALID_PAGINATION: 'Invalid pagination parameters',
    INVALID_SORT_ORDER: 'Invalid sort order',
    // Webhook/external service errors
    WEBHOOK_VERIFICATION_FAILED: 'Webhook verification failed',
    XENDIT_ERROR: 'Payment gateway error',
    EXTERNAL_SERVICE_ERROR: 'External service error',
    SIGNATURE_VERIFICATION_FAILED: 'Signature verification failed',
    WEBHOOK_TOKEN_MISSING: 'Server configuration error: Webhook token missing.',
    MISSING_SIGNATURE_HEADER: 'Bad Request: Missing Xendit-Signature header.',
    INVALID_WEBHOOK_SIGNATURE: 'Unauthorized: Invalid signature.',
    SIGNATURE_VERIFICATION_ERROR: 'Internal Server Error during signature verification.',
    INVALID_JSON_PAYLOAD: 'Bad Request: Invalid JSON payload.',
    INVOICE_ID_NOT_FOUND: 'OK - Invoice ID not found locally.',
    WEBHOOK_ERROR_LOGGED: 'OK - Error logged internally.',
    MISSING_REQUEST_BODY: 'Bad Request: Missing request body.',
    MISSING_INVOICE_ID_PAYLOAD: 'Bad Request: Missing invoice ID in payload.',
    // Server errors
    INTERNAL_SERVER_ERROR: 'Internal server error',
    DATABASE_ERROR: 'Database operation failed',
    RESERVATION_CREATION_FAILED: 'Failed to create reservation',
    RESERVATION_UPDATE_FAILED: 'Failed to update reservation'
};
// Reservation Success Messages
exports.RESERVATION_SUCCESS_MESSAGES = {
    // Operation success
    RESERVATION_CREATED: 'Reservation created successfully',
    RESERVATION_UPDATED: 'Reservation updated successfully',
    RESERVATION_CANCELLED: 'Reservation cancelled successfully',
    RESERVATION_CONFIRMED: 'Reservation confirmed successfully',
    RESERVATION_REJECTED: 'Reservation rejected successfully. Status changed to PENDING_PAYMENT',
    // Payment success
    PAYMENT_CONFIRMED: 'Payment confirmed successfully',
    PAYMENT_PROOF_UPLOADED: 'Payment proof uploaded successfully',
    // Data retrieval success
    RESERVATIONS_RETRIEVED: 'Reservations retrieved successfully',
    RESERVATION_DETAILS_RETRIEVED: 'Reservation details retrieved successfully',
    // System operations success
    RESERVATION_EXPIRY_CHECK_COMPLETED: 'Reservation expiry check completed',
    WEBHOOK_PROCESSED_SUCCESSFULLY: 'OK',
    // Notification success
    CONFIRMATION_EMAIL_SENT: 'Confirmation email sent',
    CANCELLATION_EMAIL_SENT: 'Cancellation email sent',
    REMINDER_EMAIL_SENT: 'Reminder email sent'
};

// Availability interfaces for availability operations

export interface AvailabilityItem {
  date: string;
  isAvailable: boolean;
}

export interface AvailabilityValidationResult {
  isValid: boolean;
  error?: string;
  data?: AvailabilityItem[];
}

export interface MonthValidationResult {
  isValid: boolean;
  error?: string;
  year?: number;
  month?: number;
}

export interface RoomIdValidationResult {
  isValid: boolean;
  error?: string;
}

export interface DateValidationResult {
  isValid: boolean;
  error?: string;
}

// Bulk availability operation request data
export interface BulkAvailabilityRequest {
  roomId: string;
  availability: AvailabilityItem[];
  userId: string;
}

// Monthly availability query parameters
export interface MonthlyAvailabilityQuery {
  roomId: string;
  year: number;
  month: number;
  userId: string;
}

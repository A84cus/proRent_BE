// Peak rate interfaces for peak rate operations
import { RateType } from "@prisma/client";

export interface PeakRateItem {
  id: string;
  roomTypeId: string;
  startDate: string;
  endDate: string;
  rateType: RateType;
  value: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PeakRateCreateData {
  startDate: string;
  endDate: string;
  rateType: RateType;
  value: number;
  description?: string;
}

export interface PeakRateUpdateData {
  startDate?: string;
  endDate?: string;
  rateType?: RateType;
  value?: number;
  description?: string;
}

export interface PeakRateCreateValidationResult {
  isValid: boolean;
  error?: string;
  data?: PeakRateCreateData;
}

export interface PeakRateUpdateValidationResult {
  isValid: boolean;
  error?: string;
  data?: PeakRateUpdateData;
}

export interface PeakRateRoomTypeIdValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PeakRateDateValidationResult {
  isValid: boolean;
  error?: string;
}

// Service layer interfaces
export interface AddPeakRateRequest {
  roomTypeId: string;
  peakRateData: PeakRateCreateData;
  userId: string;
}

export interface UpdatePeakRateRequest {
  roomTypeId: string;
  date: string;
  updateData: PeakRateUpdateData;
  userId: string;
}

export interface RemovePeakRateRequest {
  roomTypeId: string;
  date: string;
  userId: string;
}

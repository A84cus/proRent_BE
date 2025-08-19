// Peak rate interfaces for peak rate operations
import { RateType } from "@prisma/client";

export interface PeakRateItem {
  id: string;
  roomId: string;
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

export interface PeakRateRoomIdValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PeakRateDateValidationResult {
  isValid: boolean;
  error?: string;
}

// Service layer interfaces
export interface AddPeakRateRequest {
  roomId: string;
  peakRateData: PeakRateCreateData;
  userId: string;
}

export interface UpdatePeakRateRequest {
  roomId: string;
  date: string;
  updateData: PeakRateUpdateData;
  userId: string;
}

export interface RemovePeakRateRequest {
  roomId: string;
  date: string;
  userId: string;
}

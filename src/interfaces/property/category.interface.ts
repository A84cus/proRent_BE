// Category interfaces for category operations

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategoryCreateData {
  name: string;
  description?: string;
}

export interface CategoryUpdateData {
  name?: string;
  description?: string;
}

export interface CategoryValidationResult {
  isValid: boolean;
  error?: string;
  data?: CategoryCreateData | CategoryUpdateData;
}

export interface CategoryCreateValidationResult {
  isValid: boolean;
  error?: string;
  data?: CategoryCreateData;
}

export interface CategoryUpdateValidationResult {
  isValid: boolean;
  error?: string;
  data?: CategoryUpdateData;
}

export interface CategoryIdValidationResult {
  isValid: boolean;
  error?: string;
}

// Service layer interfaces
export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  id: string;
  name?: string;
  description?: string;
}

export interface DeleteCategoryRequest {
  id: string;
}

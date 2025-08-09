<<<<<<< HEAD
import { Request } from "express";

class UserValidationHelper {
  // Extract and validate user ID from request
  static getUserId(req: Request): {
    isValid: boolean;
    userId?: string;
    error?: string;
  } {
    const userId = req.user?.userId;

    if (!userId) {
      return {
        isValid: false,
        error: "User not authenticated",
      };
    }

    return {
      isValid: true,
      userId,
    };
  }

  // Validate required fields
  static validateRequiredFields(
    fields: Record<string, any>,
    requiredFields: string[]
  ) {
    const missingFields = requiredFields.filter((field) => !fields[field]);

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }

  // Sanitize input data
  static sanitizeInput(data: any) {
    const sanitized: any = {};

    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        if (typeof data[key] === "string") {
          sanitized[key] = data[key].trim();
        } else {
          sanitized[key] = data[key];
        }
      }
    });

    return sanitized;
  }
}

export default UserValidationHelper;
=======
import { Request } from "express";

class UserValidationHelper {
  // Extract and validate user ID from request
  static getUserId(req: Request): {
    isValid: boolean;
    userId?: string;
    error?: string;
  } {
    const userId = req.user?.userId;

    if (!userId) {
      return {
        isValid: false,
        error: "User not authenticated",
      };
    }

    return {
      isValid: true,
      userId,
    };
  }

  // Validate required fields
  static validateRequiredFields(
    fields: Record<string, any>,
    requiredFields: string[]
  ) {
    const missingFields = requiredFields.filter((field) => !fields[field]);

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }

  // Sanitize input data
  static sanitizeInput(data: any) {
    const sanitized: any = {};

    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        if (typeof data[key] === "string") {
          sanitized[key] = data[key].trim();
        } else {
          sanitized[key] = data[key];
        }
      }
    });

    return sanitized;
  }
}

export default UserValidationHelper;
>>>>>>> e5aee09f905eadbba2f45a60016b8ef41b7ffeaa

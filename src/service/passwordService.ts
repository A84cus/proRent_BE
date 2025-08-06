import bcryptjs from "bcryptjs";
import { PasswordValidationResult } from "../interfaces/password.interface";

class PasswordService {
  // Hash password for storage
  async hashPassword(password: string): Promise<string> {
    return bcryptjs.hash(password, 12);
  }

  // Verify password against hash
  async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcryptjs.compare(plainPassword, hashedPassword);
  }

  // Validate password strength
  validatePasswordStrength(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push(
        "Password must contain at least one special character @$!%*?&"
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default new PasswordService();

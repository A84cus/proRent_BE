import bcryptjs from "bcryptjs";
import { PasswordValidationResult } from "../../interfaces";
import { validatePasswordStrength } from "../../validations/auth/passwordValidation";

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

  // Validate password strength using centralized validation
  validatePasswordStrength(password: string): PasswordValidationResult {
    const validation = validatePasswordStrength(password);

    return {
      isValid: validation.isValid,
      errors: validation.errors || [],
    };
  }

  // Validate password confirmation match
  validatePasswordMatch(
    password: string,
    confirmPassword: string
  ): PasswordValidationResult {
    if (password !== confirmPassword) {
      return {
        isValid: false,
        errors: ["Password and confirmation password don't match"],
      };
    }

    return {
      isValid: true,
      errors: [],
    };
  }
}

export default new PasswordService();
